#!/usr/bin/env python3
"""Private, disposable PostgreSQL order/lock probes; not application migration/auth tests."""
from pathlib import Path
import tempfile,subprocess,os
BIN=Path('/opt/homebrew/opt/postgresql@15/bin');ROOT=Path(__file__).resolve().parents[1]
if not (BIN/'pg_ctl').exists():raise SystemExit('UNAVAILABLE PostgreSQL15 binaries')
base=Path(tempfile.mkdtemp(prefix='ai-brand-os-task22-pg-',dir='/private/tmp'));print('TEMP_CLUSTER='+str(base),flush=True)
def run(name,*args):
 p=subprocess.run([str(BIN/name),*map(str,args)],capture_output=True,text=True)
 if p.returncode:print(p.stdout+p.stderr,flush=True);p.check_returncode()
 return p
started=False
try:
 run('initdb','-D',base/'data','--auth=trust','--no-locale','--encoding=UTF8')
 run('pg_ctl','-D',base/'data','-l',base/'postgres.log','-o',f"-F -k {base} -c listen_addresses='' -p 64332",'-w','start');started=True
 psql=[str(BIN/'psql'),'-X','-q','-A','-t','-h',str(base),'-p','64332','-U',os.environ.get('USER','pejman'),'-d','postgres','-v','ON_ERROR_STOP=1']
 def sql(s,ok=True):
  p=subprocess.run(psql,input='SET search_path TO history_fixture;\n'+s,text=True,capture_output=True)
  if ok and p.returncode:raise RuntimeError(p.stdout+p.stderr)
  return p.stdout.strip() if ok else p
 sql('''CREATE SCHEMA history_fixture;
 CREATE TYPE "MessageRole" AS ENUM('USER','ASSISTANT');
 CREATE TABLE conversations(id uuid PRIMARY KEY,deleted_at timestamptz,head uuid NOT NULL);
 CREATE TABLE messages(id uuid PRIMARY KEY,conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,role "MessageRole" NOT NULL,status text NOT NULL,content text NOT NULL);
 ''')
 sql((ROOT/'sql/CONVERSATION_HISTORY_ORDER_PROPOSAL.sql').read_text())
 c1='22000000-0000-4000-8000-000000000001';c2='22000000-0000-4000-8000-000000000002'
 uid=lambda n:f'22000000-0000-4000-8000-{n:012}'
 sql(f"INSERT INTO conversations(id,head,next_message_sequence) VALUES('{c1}','{uid(50)}',1),('{c2}','{uid(50)}',1);")
 sql('''CREATE TABLE receipts(conversation_id uuid,key text,body text,user_id uuid,assistant_id uuid,sequence bigint,cutoff bigint,revision uuid,catalog jsonb,PRIMARY KEY(conversation_id,key));
 CREATE FUNCTION accept(cid uuid,k text,b text,uid uuid,aid uuid) RETURNS text LANGUAGE plpgsql AS $$
 DECLARE c conversations;r receipts;n bigint;snapshot jsonb;
 BEGIN SELECT * INTO c FROM conversations WHERE id=cid FOR UPDATE;
 IF c.deleted_at IS NOT NULL THEN RETURN 'DELETED';END IF;
 SELECT * INTO r FROM receipts WHERE conversation_id=cid AND key=k;
 IF FOUND THEN IF r.body<>b THEN RETURN 'CONFLICT';END IF;RETURN 'REPLAY:'||r.sequence;END IF;
 IF c.next_message_sequence IS NULL THEN RETURN 'LEGACY_UNORDERED';END IF;
 n=c.next_message_sequence;IF n>9223372036854775805 THEN RAISE EXCEPTION 'SEQUENCE_EXHAUSTED';END IF;
 SELECT COALESCE(jsonb_agg(jsonb_build_object('id',id,'sequence',conversation_sequence,'status',status) ORDER BY conversation_sequence),'[]'::jsonb) INTO snapshot FROM messages WHERE conversation_id=cid AND conversation_sequence<n;
 INSERT INTO messages VALUES(uid,cid,'USER','COMPLETED',b,n,NULL);
 INSERT INTO messages VALUES(aid,cid,'ASSISTANT','QUEUED','',n+1,uid);
 INSERT INTO receipts VALUES(cid,k,b,uid,aid,n,n-1,c.head,snapshot);
 UPDATE conversations SET next_message_sequence=n+2 WHERE id=cid;
 RETURN 'ACCEPT:'||n;END $$;
 CREATE FUNCTION finish(cid uuid,aid uuid) RETURNS text LANGUAGE plpgsql AS $$
 DECLARE c conversations;BEGIN SELECT * INTO c FROM conversations WHERE id=cid FOR UPDATE;
 IF c.deleted_at IS NOT NULL THEN RETURN 'DELETED';END IF;
 UPDATE messages SET status='COMPLETED',content='fixture response' WHERE id=aid AND conversation_id=cid AND status IN('QUEUED','GENERATING');
 IF NOT FOUND THEN RETURN 'TERMINAL';END IF;RETURN 'COMPLETED';END $$;
 ''')
 def check(n,label,condition):
  if not condition:raise AssertionError(label)
  print(f'PASS PG22-{n:02} '+label,flush=True)
 first=subprocess.Popen(psql,stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True,bufsize=1)
 first.stdin.write(f"SET search_path TO history_fixture;BEGIN;SELECT accept('{c1}','a','one','{uid(101)}','{uid(201)}');SELECT 'LOCK_HELD';SELECT pg_sleep(0.3);COMMIT;\n");first.stdin.close();lines=[]
 for line in first.stdout:
  lines.append(line.strip())
  if line.strip()=='LOCK_HELD':break
 second=sql(f"SELECT accept('{c1}','b','two','{uid(102)}','{uid(202)}');")
 first.stdout.read();err=first.stderr.read();first.wait(timeout=10)
 check(1,'concurrent accepted turns serialize to slots1/2 then3/4',first.returncode==0 and 'ACCEPT:1' in lines and second=='ACCEPT:3')
 check(2,'unique slots and cutoffs committed with messages/receipts',sql(f"SELECT (SELECT next_message_sequence FROM conversations WHERE id='{c1}')=5 AND (SELECT count(*) FROM messages)=4 AND (SELECT cutoff FROM receipts WHERE key='b')=2;")=='t')
 sql(f"SELECT finish('{c1}','{uid(201)}');")
 check(3,'later completion cannot change captured pending catalog',sql("SELECT catalog @> '[{\"status\":\"QUEUED\"}]'::jsonb FROM receipts WHERE key='b';")=='t')
 check(4,'lost-ack acceptance replays without duplicate user',sql(f"SELECT accept('{c1}','a','one','{uid(103)}','{uid(203)}');")=='REPLAY:1' and sql('SELECT count(*) FROM messages;')=='4')
 check(5,'same-key different body conflicts',sql(f"SELECT accept('{c1}','a','changed','{uid(103)}','{uid(203)}');")=='CONFLICT')
 fail=sql(f"SELECT accept('{c1}','bad','rollback','{uid(103)}','{uid(201)}');",False)
 check(6,'failed insert rolls back user,counter and receipt',fail.returncode!=0 and sql(f"SELECT NOT EXISTS(SELECT FROM messages WHERE id='{uid(103)}') AND (SELECT next_message_sequence FROM conversations WHERE id='{c1}')=5 AND NOT EXISTS(SELECT FROM receipts WHERE key='bad');")=='t')
 dup=sql(f"INSERT INTO messages VALUES('{uid(104)}','{c1}','USER','COMPLETED','duplicate',1,NULL);",False)
 check(7,'actual proposal unique sequence rejects collision',dup.returncode!=0)
 cross=sql(f"INSERT INTO messages VALUES('{uid(204)}','{c2}','ASSISTANT','QUEUED','',2,'{uid(101)}');",False)
 check(8,'actual proposal composite FK rejects cross-Conversation reply',cross.returncode!=0)
 sql(f"UPDATE conversations SET head='{uid(51)}' WHERE id='{c1}';")
 check(9,'recorded acceptance revision remains pinned after head change',sql(f"SELECT revision='{uid(50)}'::uuid FROM receipts WHERE key='a';")=='t')
 sql(f"UPDATE conversations SET next_message_sequence=NULL WHERE id='{c2}';")
 check(10,'legacy unordered counter blocks new acceptance',sql(f"SELECT accept('{c2}','legacy','x','{uid(104)}','{uid(204)}');")=='LEGACY_UNORDERED')
 # Tombstone and completion use the same real row lock; deletion wins this race.
 deletion=subprocess.Popen(psql,stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True,bufsize=1)
 deletion.stdin.write(f"SET search_path TO history_fixture;BEGIN;SELECT id FROM conversations WHERE id='{c1}' FOR UPDATE;UPDATE conversations SET deleted_at=now() WHERE id='{c1}';SELECT 'DELETE_HELD';SELECT pg_sleep(0.3);COMMIT;\n");deletion.stdin.close()
 for line in deletion.stdout:
  if line.strip()=='DELETE_HELD':break
 late=sql(f"SELECT finish('{c1}','{uid(202)}');")
 deletion.stdout.read();deletion.stderr.read();deletion.wait(timeout=10)
 check(11,'tombstone lock prevents late durable completion',deletion.returncode==0 and late=='DELETED' and sql(f"SELECT status FROM messages WHERE id='{uid(202)}';")=='QUEUED')
 sql(f"UPDATE conversations SET next_message_sequence=9223372036854775806,deleted_at=NULL WHERE id='{c1}';")
 exhausted=sql(f"SELECT accept('{c1}','overflow','x','{uid(105)}','{uid(205)}');",False)
 check(12,'counter exhaustion blocks without wrap/reuse',exhausted.returncode!=0 and sql("SELECT count(*) FROM receipts WHERE key='overflow';")=='0')
 print('PASS: 12 isolated PostgreSQL15 mechanism probes; proposal constraints, row locks and rollback only. Not production schema/auth/provider/SSE integration.',flush=True)
finally:
 if started:
  run('pg_ctl','-D',base/'data','-m','fast','-w','stop');print('TEMP_CLUSTER_STOPPED',flush=True)
