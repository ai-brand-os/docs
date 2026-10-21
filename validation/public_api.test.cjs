'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{createRequire}=require('node:module');
const request=process.env.ARTIFACT_VALIDATOR_PACKAGE_ROOT?createRequire(path.resolve(process.env.ARTIFACT_VALIDATOR_PACKAGE_ROOT,'package.json')):require;
const Ajv=request('ajv/dist/2020').default,formats=request('ajv-formats'),ajv=new Ajv({strict:true,strictTypes:false,strictRequired:false,allErrors:true});formats(ajv);ajv.addFormat('binary',true);
const root=path.resolve(__dirname,'..'),read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8')),base='contracts/public-api/1.0.0/',S=read(base+'schemas.json'),T=read(base+'telemetry.schema.json'),O=read(base+'openapi.json'),routes=read(base+'routes.json'),M=require('../contracts/public-api/1.0.0/reference.cjs');
for(const s of [read('contracts/import-lifecycle/1.0.0/status.schema.json'),S,T,read(base+'cursor.schema.json')]){assert(ajv.validateSchema(s),JSON.stringify(ajv.errors));ajv.addSchema(s);}
const validate=(name,x)=>ajv.validate({$ref:S.$id+'#/$defs/'+name},x),tv=ajv.getSchema(T.$id),sv=e=>validate('StreamEvent',e),clone=structuredClone;
let fixtures=0;for(const f of read(base+'examples/valid.json')){assert(validate(f.schema,f.value),f.name+' '+JSON.stringify(ajv.errors));fixtures++;}for(const f of read(base+'examples/invalid.json')){assert(!validate(f.schema,f.value),f.name);fixtures++;}
const U=n=>'23000000-0000-4000-8000-'+String(n).padStart(12,'0'),auth={valid:true,revoked:false,role:'OWNER',organizationId:U(1)},state=()=>({organizationId:U(1),brandId:U(2),head:U(3),receipts:{},messages:[],feedback:{}}),bad=(fn,status)=>assert.throws(fn,e=>e.status===status),A=read(base+'examples/valid.json').find(x=>x.schema==='StreamAccepted').value;
const accepted=()=>clone(A),chunk=i=>({event:'chunk',operationId:A.operationId,assistantMessageId:A.assistantMessageId,index:i,text:'Final answer',contextLimitation:'NONE'}),completed=()=>({event:'completed',operationId:A.operationId,assistantMessageId:A.assistantMessageId,status:'COMPLETED',finalChunkCount:1,content:'Final answer',contextLimitation:'NONE'}),start=()=>{const s=new M.Stream(sv);s.feed(Buffer.from(M.frame(A)));return s;};
let count=0;const test=(n,fn)=>{fn();count++;console.log('PASS AT-23-'+String(n).padStart(2,'0'));};
test(1,()=>assert(M.authorize(auth,state())));
test(2,()=>bad(()=>M.authorize(null,state()),401));
test(3,()=>bad(()=>M.authorize({...auth,revoked:true},state()),401));
test(4,()=>bad(()=>M.authorize(auth,{...state(),organizationId:U(4)}),404));
test(5,()=>bad(()=>M.authorize(auth,state(),U(9)),404));
test(6,()=>assert(!validate('ImportURL',{sourceType:'url',url:'file:///etc/passwd'})));
test(7,()=>{assert(!validate('FeedbackRequest',{rating:'up'}));assert(!validate('Send',{content:'x',provider:'forged'}));});
test(8,()=>assert(!validate('Send',{})));
const claims={version:'1.0.0',keyId:'fixture-key',principalId:U(8),organizationId:U(1),brandId:U(2),routeId:'conversation-list',resourceId:null,filterHash:'a'.repeat(64),limit:1,snapshotId:U(10),lastKey:null,expiresAt:'2026-10-21T11:00:00Z'},now=Date.parse('2026-10-21T10:00:00Z'),key='fixture-secret-never-production',rows=[{id:'a',lastActivityAt:'2026-10-21T10:00:00Z'},{id:'b',lastActivityAt:'2026-10-21T10:00:00Z'},{id:'c',lastActivityAt:'2026-10-20T10:00:00Z'}];
test(9,()=>{const p=M.page(M.snapshot(rows),rows,null,1);assert.equal(p.items[0].id,'b');assert.equal(p.hasMore,true);});
test(10,()=>{const frozen=M.snapshot(rows),p=M.page(frozen,rows,'b',2);assert.deepEqual(p.items.map(x=>x.id),['a','c']);rows[0].lastActivityAt='2026-10-22T10:00:00Z';assert.deepEqual(M.page(frozen,rows,null,3).items.map(x=>x.id),['b','a','c']);});
test(11,()=>bad(()=>M.decodeCursor(M.encodeCursor(claims,key)+'x',key,claims,now),400));
test(12,()=>bad(()=>M.decodeCursor(M.encodeCursor(claims,key),key,{...claims,organizationId:U(9)},now),404));
test(13,()=>bad(()=>M.revise(state(),auth,{expectedRevisionId:U(9)},'k'),409));
test(14,()=>{const s=state(),body={expectedRevisionId:s.head,name:'new'},a=M.revise(s,auth,body,'k');assert.deepEqual(M.revise(s,auth,body,'k'),a);assert.equal(Object.keys(s.receipts).length,1);});
test(15,()=>{const s=state(),body={expectedRevisionId:s.head,name:'new'};M.revise(s,auth,body,'k');bad(()=>M.revise(s,auth,{...body,name:'other'},'k'),409);});
test(16,()=>assert(validate('ImportURL',{sourceType:'url',url:'https://example.invalid/product'})));
test(17,()=>bad(()=>M.file('application/x-executable'),415));
const projection=read('contracts/import-lifecycle/1.0.0/example.json'),pending=()=>({...clone(projection),status:'READY_FOR_REVIEW',reasonCode:'REVIEW_PENDING',progressPhase:'READY_FOR_REVIEW',terminal:false,closureArtifactId:null,retryAvailable:false,nextAction:'REVIEW',candidateSummary:{eligible:3,accepted:1,editedAccepted:0,rejected:0,pending:2,invalidated:0},pendingDecisionCount:2});
test(18,()=>{const p=pending();assert(validate('ImportStatus',p));assert(M.checkImport(p).poll);});
test(19,()=>assert.deepEqual(M.checkImport(pending()),{poll:true,pending:2,accepted:1}));
test(20,()=>{assert(!M.checkImport(projection).poll);bad(()=>M.checkImport({...projection,pendingDecisionCount:99}),422);});
test(21,()=>{assert(validate('ConversationCreate',{}));assert(!validate('ConversationCreate',{organizationId:U(1)}));});
test(22,()=>{const s=state(),r=M.accept(s,auth,{content:'Question'},'k');assert.equal(s.messages.length,2);assert(r.operationId);});
test(23,()=>{const s=start();s.feed(Buffer.from(M.frame(chunk(0))));assert.equal(s.state,'streaming');bad(()=>s.feed(Buffer.from(M.frame(chunk(2)))),400);});
test(24,()=>{const s=start();s.feed(Buffer.from(M.frame(chunk(0))+M.frame(completed())));s.feed(Buffer.from(M.frame(completed())));assert.equal(s.state,'completed');});
test(25,()=>{const s=start();s.feed(Buffer.from(M.frame(chunk(0))));s.feed(Buffer.from(M.frame({event:'failed',operationId:A.operationId,assistantMessageId:A.assistantMessageId,status:'FAILED',code:'GENERATION_FAILED',retryAvailable:true})));assert.equal(s.state,'failed');assert.equal(s.chunks.length,0);});
test(26,()=>{const db=state();M.accept(db,auth,{content:'Question'},'k');const s=start();s.end();assert.equal(s.state,'recovering');assert.equal(db.messages[1].status,'QUEUED');});
test(27,()=>{const s=state();M.accept(s,auth,{content:'Question'},'k');Object.assign(s.messages[1],{status:'COMPLETED',content:'Durable answer'});assert.equal(M.recover(s,auth,'k').content,'Durable answer');});
test(28,()=>{const s=state();M.accept(s,auth,{content:'Question'},'k');assert.equal(M.recover(s,auth,'k').status,'QUEUED');assert.equal(M.recover(s,auth,'k').content,null);});
test(29,()=>{const s=state(),a=M.accept(s,auth,{content:'Question'},'k');assert.deepEqual(M.accept(s,auth,{content:'Question'},'k'),a);assert.equal(s.messages.filter(m=>m.role==='USER').length,1);});
test(30,()=>{const s=state();M.accept(s,auth,{content:'Question'},'k');s.deleted=true;bad(()=>M.recover(s,auth,'k'),404);});
test(31,()=>{const s=state();M.accept(s,auth,{content:'Question'},'k');Object.assign(s.messages[1],{status:'FAILED',content:'Unvalidated partial'});assert.equal(M.recover(s,auth,'k').content,null);});
test(32,()=>{const s=state();M.accept(s,auth,{content:'Question'},'k');s.messages[1].status='COMPLETED';M.feedback(s,auth,s.messages[1].id,'HELPFUL');bad(()=>M.feedback(s,auth,s.messages[1].id,'HELPFUL'),409);});
test(33,()=>{assert(validate('Quality',{state:'UNKNOWN',value:null,formulaVersion:null}));assert(!validate('Quality',{state:'UNKNOWN',value:0,formulaVersion:null}));});
test(34,()=>{const s=state(),old=s.head;M.revise(s,auth,{expectedRevisionId:old,name:'A'},'a');bad(()=>M.revise(s,auth,{expectedRevisionId:old,name:'B'},'b'),409);});
const event={eventName:'GenerationCompleted',eventVersion:'1.0.0',contractVersion:'1.0.0',eventId:U(20),occurredAt:'2026-10-21T10:00:00Z',serverRecordedAt:'2026-10-21T10:00:00Z',accountId:U(21),organizationId:U(22),brandId:U(23),onboardingInstanceId:null,browserSessionId:null,consentState:'PERMITTED',cohort:'EXISTING',attribution:'UNKNOWN',data:{outputId:U(24),conversationId:U(25),approvedRevisionId:U(26)}};
test(35,()=>{assert(tv(event),JSON.stringify(tv.errors));assert(!tv({...event,data:{...event.data,content:'raw secret'}}));});
test(36,()=>{const s={};assert.equal(M.telemetry(s,event,tv),1);assert.equal(M.telemetry(s,event,tv),1);bad(()=>M.telemetry(s,{...event,attribution:'DIRECT'},tv),409);});
test(37,()=>{assert.equal(routes.filter(r=>r.path==='/api/v1/organizations').length,1);assert(!routes.some(r=>r.method==='post'&&r.path==='/api/v1/organizations'));assert(fs.readFileSync(path.join(root,'contracts/public-api/DESIGN_DEPENDENCIES.md'),'utf8').includes('static label'));});
test(38,()=>assert(fs.readFileSync(path.join(root,'contracts/public-api/DESIGN_DEPENDENCIES.md'),'utf8').includes('location/version unavailable')));
test(39,()=>{const {execFileSync}=require('node:child_process');const old=execFileSync('git',['ls-tree','-r','--name-only','HEAD','contracts','schema.prisma'],{cwd:root,encoding:'utf8'}).trim().split('\n').filter(x=>x&&!x.startsWith('contracts/public-api/'));for(const file of old)assert(fs.readFileSync(path.join(root,file)).equals(execFileSync('git',['show','HEAD:'+file],{cwd:root,maxBuffer:8*1024*1024})),file+' changed');console.log('Protected existing contract/Prisma files: '+old.length);});
test(40,()=>{assert.equal(routes.length,46);assert.equal(Object.values(O.paths).reduce((n,x)=>n+Object.keys(x).length,0),46);assert(!Object.keys(O.paths).some(p=>/gateway|context|cancel|reconnect|export|members|knowledge-change-candidates/.test(p)));for(const r of routes){const op=O.paths[r.path][r.method];assert(op['x-review-gate']);assert(op.responses[String(r.status)]);if(r.request)assert(op.requestBody);}});
// Required negative transport/reference cases beyond the forty numbered scenarios.
bad(()=>M.input({content:'x'.repeat(100)},'application/json',10),413);bad(()=>M.input({},'text/plain',100),415);bad(()=>M.decodeCursor('../unsafe',key,claims,now),400);bad(()=>start().feed(Buffer.from('event: chunk\ndata: {}\n\n')),400);

const negatives={
 'oversized-input':()=>bad(()=>M.input({content:'x'.repeat(100)},'application/json',10),413),
 'unsafe-cursor':()=>bad(()=>M.decodeCursor('../unsafe',key,claims,now),400),
 'broken-sse-framing':()=>bad(()=>start().feed(Buffer.from('event: chunk\ndata: {}\n\n')),400),
 'unknown-stream-event':()=>bad(()=>start().feed(Buffer.from('event: magic\ndata: {"event":"magic"}\n\n')),400),
 'wrong-content-type':()=>bad(()=>M.input({},'text/plain',100),415),
 'partial-message-transport':()=>{const s=start();s.feed(Buffer.from('event: chunk\ndata: {'));s.end();assert.equal(s.state,'recovering');},
 'late-events-after-deletion':()=>{const s=start();s.deletion();bad(()=>s.feed(Buffer.from(M.frame(chunk(0)))),404);assert.equal(s.chunks.length,0);},
 'unauthorized-revision-reference':()=>bad(()=>M.authorize(auth,{organizationId:U(9),brandId:U(2)},U(2)),404),
 'unavailable-approved-knowledge':()=>bad(()=>M.accept(state(),auth,{content:'x'},'k',false),422),
 'unapproved-generation-fallback':()=>assert(!validate('MessageRequest',{content:'x',allowCurrentOnly:true}))
};
for(const f of read(base+'examples/transport-negative.json')){assert(negatives[f.name]);negatives[f.name]();console.log('PASS negative '+f.name);}
// UTF8 decoder preserves a multibyte character across every possible network boundary.
{const s=new M.Stream(sv),a=clone(A),c={...chunk(0),text:'Answer 🧠'},f={...completed(),content:'Answer 🧠'};for(const byte of Buffer.from(M.frame(a)+M.frame(c)+M.frame(f)))s.feed(Uint8Array.of(byte));s.end();assert.equal(s.state,'completed');assert.equal(s.terminal.content,'Answer 🧠');}
// Deletion suppresses cached list rows; new inserts do not enter frozen pages.
{const live=clone(rows),frozen=M.snapshot(live);live[0].deleted=true;live.push({id:'z',lastActivityAt:'2026-10-23T10:00:00Z'});const p=M.page(frozen,live,null,10);assert(!p.items.some(x=>x.id==='a'||x.id==='z'));}
bad(()=>M.decodeCursor(M.encodeCursor(claims,key),key,claims,Date.parse('2026-10-22T10:00:00Z')),409);
// All OpenAPI references local/registered; no remote schema fetching, every response/operation is typed.
function walk(x){if(!x||typeof x!=='object')return;if(x.$ref){if(x.$ref.startsWith('./schemas.json#/$defs/'))assert(S.$defs[x.$ref.split('/').at(-1)]);else{assert(x.$ref.startsWith('#/components/responses/'));assert(O.components.responses[x.$ref.split('/').at(-1)]);}}for(const v of Object.values(x))walk(v);}
walk(O);assert.equal(O.openapi,'3.1.0');assert.deepEqual(Object.keys(read(base+'error-registry.json')).sort(),['400','401','403','404','409','413','415','422','429','500','503']);
assert.equal(read(base+'telemetry-registry.json').length,20);
console.log('PASS '+count+' numbered scenarios; '+fixtures+' valid/invalid DTO fixtures;10 negative fixtures; UTF8/snapshot/OpenAPI structural checks; offline only');


assert(ajv.validate({$ref:'urn:ai-brand-os:public-api:1.0.0:cursor'},claims),JSON.stringify(ajv.errors));
assert(!ajv.validate({$ref:'urn:ai-brand-os:public-api:1.0.0:cursor'},{...claims,limit:101}));
console.log('PASS cursor claims schema positive/negative');
