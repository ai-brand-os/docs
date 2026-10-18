#!/usr/bin/env python3
"""Disposable PostgreSQL mechanism probes; deliberately not application schema/integration tests."""
from pathlib import Path
import tempfile,subprocess,os
BIN=Path('/opt/homebrew/opt/postgresql@15/bin')
if not (BIN/'pg_ctl').exists():raise SystemExit('UNAVAILABLE: PostgreSQL15 binaries absent')
base=Path(tempfile.mkdtemp(prefix='ai-brand-os-task18-pg-',dir='/private/tmp'))
print('TEMP_CLUSTER='+str(base),flush=True)
def cmd(name,*args,**kwargs):
 result=subprocess.run([str(BIN/name),*map(str,args)],text=True,capture_output=True,**kwargs)
 if result.returncode:
  print(result.stdout+result.stderr,flush=True)
  result.check_returncode()
 return result
started=False
try:
 cmd('initdb','-D',base/'data','--auth=trust','--no-locale','--encoding=UTF8')
 cmd('pg_ctl','-D',base/'data','-l',base/'postgres.log','-o',f"-F -k {base} -c listen_addresses='' -p 64330",'-w','start');started=True
 psql=[str(BIN/'psql'),'-X','-q','-A','-t','-h',str(base),'-p','64330','-U',os.environ.get('USER','pejman'),'-d','postgres','-v','ON_ERROR_STOP=1']
 def sql(s):return subprocess.run(psql,input=s,text=True,check=True,capture_output=True).stdout.strip()
 sql('''CREATE SCHEMA fixture;
 CREATE TABLE fixture.brand(id int PRIMARY KEY, head int NOT NULL, fence int NOT NULL, closed boolean NOT NULL DEFAULT false);
 CREATE TABLE fixture.decision(key text PRIMARY KEY, body text NOT NULL, revision int NOT NULL);
 CREATE TABLE fixture.revision(id int PRIMARY KEY);
 CREATE TABLE fixture.knowledge_index(brand int PRIMARY KEY, revision int NOT NULL);
 CREATE TABLE fixture.control(seq int PRIMARY KEY, event text NOT NULL);
 INSERT INTO fixture.brand VALUES(1,0,1,false);
 CREATE FUNCTION fixture.publish(k text,b text,expected int,lease int,target int,break_projection boolean DEFAULT false) RETURNS text LANGUAGE plpgsql AS $$
 DECLARE row fixture.brand; d fixture.decision;
 BEGIN
 SELECT * INTO row FROM fixture.brand WHERE id=1 FOR UPDATE;
 SELECT * INTO d FROM fixture.decision WHERE key=k;
 IF FOUND THEN IF d.body=b THEN RETURN 'REPLAY:'||d.revision; ELSE RETURN 'BODY_CONFLICT'; END IF; END IF;
 IF row.closed THEN RETURN 'CLOSED'; END IF;
 IF row.fence<>lease THEN RETURN 'STALE_FENCE'; END IF;
 IF row.head<>expected THEN RETURN 'REVISION_CONFLICT'; END IF;
 INSERT INTO fixture.decision VALUES(k,b,target);
 INSERT INTO fixture.revision VALUES(target);
 UPDATE fixture.brand SET head=target,closed=true WHERE id=1;
 IF break_projection THEN RAISE EXCEPTION 'synthetic required projection failure'; END IF;
 INSERT INTO fixture.knowledge_index VALUES(1,target) ON CONFLICT(brand) DO UPDATE SET revision=EXCLUDED.revision;
 INSERT INTO fixture.control VALUES(target,'CLOSED');
 RETURN 'COMMIT:'||target;
 END $$;
 ''')
 def check(name,condition):
  if not condition:raise AssertionError(name)
  print('PASS '+name,flush=True)
 # Hold the real Brand row lock in one psql process; another session must serialize.
 first=subprocess.Popen(psql,stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True,bufsize=1)
 first.stdin.write("BEGIN; SELECT fixture.publish('one','body',0,1,1); SELECT 'LOCK_HELD'; SELECT pg_sleep(0.5); COMMIT;\n");first.stdin.close()
 lines=[]
 for line in first.stdout:
  lines.append(line.strip())
  if line.strip()=='LOCK_HELD':break
 second=sql("SELECT fixture.publish('two','other',0,1,2);")
 first.stdout.read();err=first.stderr.read();first.wait(timeout=10)
 check('PG18-01 concurrent publication serialized by Brand row lock',first.returncode==0 and 'COMMIT:1' in lines and second=='CLOSED')
 check('PG18-02 lost-ack replay returns original receipt after closure',sql("SELECT fixture.publish('one','body',0,1,1);")=='REPLAY:1')
 check('PG18-03 changed body under same key conflicts',sql("SELECT fixture.publish('one','changed',0,1,1);")=='BODY_CONFLICT')
 check('PG18-04 revision, required index and closure committed together',sql("SELECT (SELECT head FROM fixture.brand)=1 AND (SELECT revision FROM fixture.knowledge_index)=1 AND (SELECT count(*) FROM fixture.control)=1 AND (SELECT count(*) FROM fixture.revision)=1;")=='t')
 sql('UPDATE fixture.brand SET closed=false,fence=2;')
 check('PG18-05 expired worker fence rejected',sql("SELECT fixture.publish('stale','body',1,1,2);")=='STALE_FENCE')
 check('PG18-06 concurrent manual head invalidates expected revision',sql("SELECT fixture.publish('conflict','body',0,2,2);")=='REVISION_CONFLICT')
 failed=subprocess.run(psql,input="SELECT fixture.publish('rollback','body',1,2,2,true);",text=True,capture_output=True)
 check('PG18-07 projection failure rolls back decision, revision, head and closure',failed.returncode!=0 and sql("SELECT (SELECT head FROM fixture.brand)=1 AND NOT EXISTS(SELECT FROM fixture.decision WHERE key='rollback') AND NOT EXISTS(SELECT FROM fixture.revision WHERE id=2) AND (SELECT count(*) FROM fixture.control)=1;")=='t')
 check('PG18-08 open operation prevents proposed admission until closure',sql("BEGIN; SELECT id FROM fixture.brand WHERE id=1 FOR UPDATE; SELECT CASE WHEN closed THEN 'ADMIT' ELSE '409' END FROM fixture.brand WHERE id=1; COMMIT;").splitlines()[-1]=='409')
 print('PASS: 8 isolated PostgreSQL mechanism probes; no application tables, queue library, authorization or provider integration tested.',flush=True)
finally:
 if started:
  result=cmd('pg_ctl','-D',base/'data','-m','fast','-w','stop');print('CLUSTER_STOPPED',flush=True)
