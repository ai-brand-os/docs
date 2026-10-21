#!/usr/bin/env python3
"""Disposable PostgreSQL mechanics only: snapshot/keyset, revision locks and keyed creation prototype."""
from pathlib import Path
import tempfile,subprocess,os
BIN=Path('/opt/homebrew/opt/postgresql@15/bin')
if not (BIN/'pg_ctl').exists():raise SystemExit('UNAVAILABLE PostgreSQL15 binaries')
base=Path(tempfile.mkdtemp(prefix='ai-brand-os-task23-pg-',dir='/private/tmp'));print('TEMP_CLUSTER='+str(base),flush=True)
def run(name,*args):
 p=subprocess.run([str(BIN/name),*map(str,args)],capture_output=True,text=True)
 if p.returncode:print(p.stdout+p.stderr,flush=True);p.check_returncode()
 return p
started=False
try:
 run('initdb','-D',base/'data','--auth=trust','--no-locale','--encoding=UTF8')
 run('pg_ctl','-D',base/'data','-l',base/'postgres.log','-o',f"-F -k {base} -c listen_addresses='' -p 64333",'-w','start');started=True
 cli=[str(BIN/'psql'),'-X','-q','-A','-t','-h',str(base),'-p','64333','-U',os.environ.get('USER','pejman'),'-d','postgres','-v','ON_ERROR_STOP=1']
 def sql(s,ok=True):
  p=subprocess.run(cli,input='SET search_path TO api_fixture;\n'+s,text=True,capture_output=True)
  if ok and p.returncode:raise RuntimeError(p.stdout+p.stderr)
  return p.stdout.strip() if ok else p
 def check(n,label,value):
  if not value:raise AssertionError(label)
  print(f'PASS PG23-{n:02} '+label,flush=True)
 sql('''CREATE SCHEMA api_fixture;
 CREATE TABLE conversations(id int PRIMARY KEY,tenant int NOT NULL,activity timestamptz NOT NULL,deleted bool NOT NULL DEFAULT false);
 INSERT INTO conversations VALUES(1,1,'2026-10-21',false),(2,1,'2026-10-21',false),(3,1,'2026-10-20',false),(4,2,'2026-10-21',false);
 CREATE TABLE page_snapshot AS SELECT id,tenant,activity FROM conversations WHERE tenant=1 AND NOT deleted;
 CREATE TABLE brands(id int PRIMARY KEY,head int NOT NULL);INSERT INTO brands VALUES(1,1);
 CREATE TABLE receipts(tenant int,resource int,kind text,key text,body text,result int,PRIMARY KEY(tenant,resource,kind,key));
 CREATE FUNCTION publish(k text,b text,expected int) RETURNS text LANGUAGE plpgsql AS $$
 DECLARE h int;r receipts;BEGIN SELECT head INTO h FROM brands WHERE id=1 FOR UPDATE;
 SELECT * INTO r FROM receipts WHERE tenant=1 AND resource=1 AND kind='publish' AND key=k;
 IF FOUND THEN IF r.body<>b THEN RETURN 'KEY_CONFLICT';END IF;RETURN 'REPLAY:'||r.result;END IF;
 IF h<>expected THEN RETURN 'REVISION_CONFLICT';END IF;
 UPDATE brands SET head=h+1 WHERE id=1;INSERT INTO receipts VALUES(1,1,'publish',k,b,h+1);RETURN 'PUBLISHED:'||(h+1);END $$;
 ''')
 check(1,'same timestamp tie uses stable ID DESC',sql("SELECT string_agg(id::text,',' ORDER BY activity DESC,id DESC) FROM page_snapshot;")=='2,1,3')
 check(2,'keyset next page excludes equal tuple already read',sql("SELECT string_agg(id::text,',' ORDER BY activity DESC,id DESC) FROM page_snapshot WHERE (activity,id)<('2026-10-21'::timestamptz,2);")=='1,3')
 sql("UPDATE conversations SET activity='2026-10-23' WHERE id=1;INSERT INTO conversations VALUES(5,1,'2026-10-24',false);")
 check(3,'mutable activity and new insert cannot reorder frozen membership',sql("SELECT string_agg(id::text,',' ORDER BY activity DESC,id DESC) FROM page_snapshot;")=='2,1,3')
 sql('UPDATE conversations SET deleted=true WHERE id=2;')
 check(4,'live deletion overlays frozen metadata without foreign tenant',sql("SELECT string_agg(s.id::text,',' ORDER BY s.activity DESC,s.id DESC) FROM page_snapshot s JOIN conversations c ON c.id=s.id WHERE c.tenant=1 AND NOT c.deleted;")=='1,3')
 a=subprocess.Popen(cli,stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True,bufsize=1)
 a.stdin.write("SET search_path TO api_fixture;BEGIN;SELECT publish('a','body-a',1);SELECT 'LOCK_HELD';SELECT pg_sleep(0.3);COMMIT;\n");a.stdin.close();lines=[]
 for line in a.stdout:
  lines.append(line.strip())
  if line.strip()=='LOCK_HELD':break
 second=sql("SELECT publish('b','body-b',1);");a.stdout.read();err=a.stderr.read();a.wait(timeout=10)
 check(5,'real same-head writes serialize, second conflicts',a.returncode==0 and 'PUBLISHED:2' in lines and second=='REVISION_CONFLICT')
 check(6,'same-key replay before advanced-head comparison',sql("SELECT publish('a','body-a',1);")=='REPLAY:2')
 check(7,'changed body under same key conflicts',sql("SELECT publish('a','changed',1);")=='KEY_CONFLICT')
 # Separate toy infrastructure identity demonstrates required storage, not an adopted schema/table.
 sql("INSERT INTO receipts VALUES(1,9,'create','create-key','same-body',9);")
 duplicate=sql("INSERT INTO receipts VALUES(1,9,'create','create-key','same-body',10);",False)
 check(8,'scoped unique creation identity prevents duplicate result',duplicate.returncode!=0)
 failure=sql("BEGIN;UPDATE brands SET head=99 WHERE id=1;INSERT INTO receipts VALUES(1,1,'publish','a','duplicate',99);COMMIT;",False)
 check(9,'unique failure rolls back attempted head advance',failure.returncode!=0 and sql('SELECT head FROM brands WHERE id=1;')=='2')
 print('PASS 9 isolated PostgreSQL15 mechanism probes; no application schema/auth/real SSE/provider or migration proof.',flush=True)
finally:
 if started:run('pg_ctl','-D',base/'data','-m','fast','-w','stop');print('TEMP_CLUSTER_STOPPED',flush=True)
