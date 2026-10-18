'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{createRequire}=require('node:module');
const request=process.env.ARTIFACT_VALIDATOR_PACKAGE_ROOT?createRequire(path.resolve(process.env.ARTIFACT_VALIDATOR_PACKAGE_ROOT,'package.json')):require;
const Ajv=request('ajv/dist/2020').default,formats=request('ajv-formats'),ajv=new Ajv({strict:true,strictTypes:false,strictRequired:false,allErrors:true});formats(ajv);
const H=require('./ontology_relations.cjs'),F=require('./ontology_relations.fixtures.cjs'),S=require('./source_evidence.cjs'),SF=require('./source_evidence_fixture.cjs');
const root=path.resolve(__dirname,'..'),read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
for(const dir of ['contracts/artifacts/2.0.0','contracts/artifacts/2.3.0','contracts/ontology-relations/1.0.0'])for(const f of fs.readdirSync(path.join(root,dir)).filter(f=>f.endsWith('.schema.json'))){const s=read(dir+'/'+f);assert(ajv.validateSchema(s),JSON.stringify(ajv.errors));ajv.addSchema(s);}
const schema=(id,x)=>assert(ajv.getSchema(id)(x),JSON.stringify(ajv.errors));
const validate=f=>H.validate(f.s,f.c,{reviewed:true}),retrieve=(f,o={})=>H.retrieve(f.s,f.c,{reviewed:true,...o});
let count=0;function test(id,f){f();count++;console.log('PASS AT-20-'+String(id).padStart(2,'0'));}
test(1,()=>{const f=F.fixture();validate(f);assert.equal(f.c.ownership[f.c.brandId].organizationId,f.c.organizationId);assert.equal(f.d.relationships.edges.filter(e=>e.relationshipType==='HAS').length,0);});
test(2,()=>{const f=F.fixture(),v=f.d.members.find(m=>m.entityType==='BRAND_VOICE');assert.equal(f.c.ownership[v.entityId].brandId,f.c.brandId);f.c.ownership[v.entityId].brandId=F.uid(99);assert.throws(()=>validate(f),/OWNERSHIP/);});
for(const [n,type] of [[3,'PRODUCT'],[4,'SERVICE']])test(n,()=>{const f=F.fixture(type);validate(f);const restored=H.restore(f.s,f.c,{reviewed:true});assert.deepEqual(restored.payload.data.relationships.edges,[f.e]);});
test(5,()=>{const f=F.fixture();assert(!retrieve(f).edges.some(e=>e.relationshipType==='USES'));assert.equal(retrieve(f,{uses:true}).edges.filter(e=>e.relationshipType==='USES').length,1);assert.throws(()=>H.validate(f.s,f.c),/POLICY_DISABLED/);});
test(6,()=>{const f=F.fixture();assert.equal(H.id(f.e),H.id(H.copy(f.e)));f.d.relationships.edges.push(H.copy(f.e));assert.throws(()=>validate(f),/DUPLICATE/);});
test(7,()=>{const r=read('contracts/ontology-relations/1.0.0/registry.json'),inverse=r.relationships.find(x=>x.relationshipType==='ORIGINATES_FROM');assert.equal(inverse.inverseOf,'PRODUCES');assert.equal(inverse.persisted,false);const f=F.fixture();f.e.relationshipType='ORIGINATES_FROM';assert.throws(()=>validate(f),/PAIR/);});
test(8,()=>{const f=F.fixture();f.e.organizationId=F.uid(99);assert.throws(()=>validate(f),/TENANT/);});
test(9,()=>{const f=F.fixture();f.e.brandId=F.uid(99);assert.throws(()=>validate(f),/BRAND/);});
test(10,()=>{const f=F.fixture();f.e.targetEntityId=F.uid(99);f.e.relationshipId=H.id(f.e);assert.throws(()=>validate(f),/DANGLING/);});
test(11,()=>{const f=F.fixture();f.e.targetEntityType='PERSONA';assert.throws(()=>validate(f),/PAIR/);});
test(12,()=>{const f=F.fixture();f.d.relationships.edges=[];f.d.members=f.d.members.filter(m=>m.entityType!=='AUDIENCE');f.d.facts=f.d.facts.filter(f=>f.entityType!=='AUDIENCE');f.d.relationships.membershipDispositions=f.d.relationships.membershipDispositions.filter(m=>m.entityType!=='AUDIENCE');validate(f);});
test(13,()=>{const f=F.fixture();f.d.relationships.edges=[];H.validate(f.s,f.c,{ready:true,reviewed:true});f.d.relationships.membershipDispositions.find(m=>m.entityType==='AUDIENCE').disposition='ARCHIVED';assert.throws(()=>H.validate(f.s,f.c,{ready:true,reviewed:true}),/NOT_READY/);});
test(14,()=>{const f=F.fixture();f.c.authorized=false;assert.throws(()=>validate(f),/SAFE_404/);});
test(15,()=>{const f=F.fixture();f.c.approvals[f.e.approvalDecisionArtifactId].authorizedHuman=false;assert.throws(()=>validate(f),/APPROVAL/);});
const req=f=>({human:true,reviewed:true,key:'request-1',hash:'a'.repeat(64),expectedRevisionId:f.d.revisionId});const state=f=>({organizationId:f.c.organizationId,brandId:f.c.brandId,head:f.d.revisionId,receipts:{},commits:0});
test(16,()=>{const f=F.fixture(),r=req(f);r.expectedRevisionId=F.uid(99);assert.throws(()=>H.publish(state(f),f.s,f.c,r),/STALE_REVISION/);});
test(17,()=>{const f=F.fixture(),historical=H.copy(f.s);f.d.relationships.edges=[];assert.deepEqual(H.restore(historical,f.c,{reviewed:true}).payload.data.relationships.edges,historical.payload.data.relationships.edges);assert.equal(f.d.relationships.edges.length,0);});
test(18,()=>{const f=F.fixture();assert.deepEqual(retrieve(f,{cache:{revisionId:F.uid(99),edges:[]}}).edges,[f.e]);});
test(19,()=>{const f=F.fixture(),fake=H.copy(f.e);fake.targetEntityId=F.uid(99);assert.deepEqual(retrieve(f,{cache:{edges:[fake]}}).edges,[f.e]);});
test(20,()=>{const f=F.fixture();f.d.relationships.membershipDispositions.find(m=>m.entityType==='AUDIENCE').disposition='ARCHIVED';assert.equal(retrieve(f).edges.length,0);assert.equal(f.d.relationships.edges.length,1);});
test(21,()=>{const f=F.fixture(),before=H.id(f.e);f.d.facts.find(f=>f.entityType==='PRODUCT').value='Renamed';assert.equal(H.id(f.e),before);});
test(22,()=>{const f=F.fixture(),next=H.copy(f.e);next.sourceEntityId=F.uid(101);assert.notEqual(H.id(next),f.e.relationshipId);});
test(23,()=>{const f=SF.fixture();assert.equal(S.validateBinding(f.m,f.b,f.store,f.context).classification,'VERIFIED_EXACT');});
test(24,()=>{const f=F.fixture();delete f.d.relationships;assert.equal(validate(f).availability,'NOT_RECORDED');assert.throws(()=>H.restore(f.s,f.c,{reviewed:true}),/NOT_RECORDED/);const x=F.fixture();x.d.relationships.ontologyVersion='99.0.0';assert.throws(()=>validate(x),/VERSION_GATE/);});
test(25,()=>{const f=F.fixture();validate(f);assert.equal(f.e.evidenceRefs.length,0);assert(!f.d.members.some(m=>m.entityType==='DOCUMENT'));});
test(26,()=>{const f=F.imported();validate(f);schema('urn:ai-brand-os:ontology-relations:1.0.0:edge',f.e);schema('urn:ai-brand-os:artifact:2.3.0:approved_snapshot',f.s);assert.equal(S.validateBinding(f.source.m,f.source.b,f.source.store,f.source.context).classification,'VERIFIED_EXACT');f.c.supports[0].supportsPredicate=false;assert.throws(()=>validate(f),/SUPPORT/);const x=F.imported();x.c.bindings[0].brandId=F.uid(99);assert.throws(()=>validate(x),/EVIDENCE/);});
test(27,()=>{const f=F.fixture();f.s.unapprovedCandidateRelationships=[{relationshipType:'USES'}];assert.deepEqual(retrieve(f).edges,[f.e]);});
test(28,()=>{const f=F.fixture();f.d.relationships.revisionId=F.uid(99);assert.throws(()=>retrieve(f),/MIXED_REVISION/);});
test(29,()=>{const f=F.fixture(),s=state(f),r=req(f);const first=H.publish(s,f.s,f.c,r);s.head=F.uid(99);assert.deepEqual(H.publish(s,f.s,f.c,r),first);assert.equal(s.commits,1);assert.equal(s.snapshot.payload.data.relationships.edges.length,1);assert.throws(()=>H.publish(s,f.s,f.c,{...r,hash:'b'.repeat(64)}),/IDEMPOTENCY_CONFLICT/);});
test(30,()=>{const f=F.fixture();schema('urn:ai-brand-os:artifact:2.3.0:approved_snapshot',f.s);assert(!ajv.getSchema('urn:ai-brand-os:artifact:2.0.0:envelope')(f.s));for(const x of read('contracts/artifacts/2.0.0/examples/valid.json'))schema('urn:ai-brand-os:artifact:2.0.0:envelope',x.artifact);const {resolveImportState}=require('./import_lifecycle.cjs'),x=read('validation/import_lifecycle.fixtures.json');x.artifacts.push(x.closure);x.claim.controlHeadId=x.closure.artifactId;assert.equal(resolveImportState(x.artifacts,x.decisions,x.publicationEvidence,x.claim).status,'COMPLETED');});
// Persisted positive/negative fixtures are validated too; semantic and syntax rejection are distinct.
for(const x of read('contracts/artifacts/2.3.0/examples/valid.json'))schema('urn:ai-brand-os:artifact:2.3.0:'+x.payload.variant,x);
for(const x of read('contracts/ontology-relations/1.0.0/examples/invalid.json')){const f=F.fixture();Object.assign(f.e,x.patch);assert.throws(()=>validate(f),undefined,x.name);}
const registry=read('contracts/ontology-relations/1.0.0/registry.json');assert.equal(registry.relationships.filter(x=>x.status==='Active').length,22);assert.equal(registry.relationships.filter(x=>x.status==='Reserved').length,6);
console.log(`PASS: ${count} named offline ontology cases; 7 new schemas and positive/negative fixtures. No runtime database, auth, queue or concurrency integration proof.`);
// Boundary and negative probes beyond the 30 named acceptance cases.
{
 const f=F.fixture(),history=H.copy(f.s),intro=f.e.introducingRevisionId;f.d.relationships.edges=[];f.d.revisionId=F.uid(901);f.d.relationships.revisionId=F.uid(901);
 const r=H.prepareRestore(history,f.s,f.c,{revisionId:F.uid(902),artifactId:F.uid(903),commitId:F.uid(904),reviewed:true});
 assert.equal(r.revisionMetadata.previousRevisionId,F.uid(901));assert.equal(r.revisionMetadata.restoredFromRevisionId,history.payload.data.revisionId);assert.equal(r.snapshot.payload.data.relationships.edges[0].relationshipId,history.payload.data.relationships.edges[0].relationshipId);assert.equal(r.snapshot.payload.data.relationships.edges[0].introducingRevisionId,intro);assert.equal(r.snapshot.payload.data.relationships.edges[0].lastApprovedRevisionId,F.uid(902));assert.equal(history.payload.data.relationships.edges[0].lastApprovedRevisionId,intro);
}
{
 const f=F.fixture();for(let n=1;n<=34;n++){const m={entityType:'AUDIENCE',entityId:F.uid(1000+n)};f.d.members.push(m);f.d.relationships.membershipDispositions.push({...m,disposition:'ACTIVE'});f.c.ownership[m.entityId]={...m,organizationId:f.c.organizationId,brandId:f.c.brandId};const e=H.copy(f.e);e.targetEntityId=m.entityId;e.relationshipId=H.id(e);f.d.relationships.edges.push(e);f.c.approvals[e.approvalDecisionArtifactId].edgeIds.push(e.relationshipId);}
 const r=retrieve(f);assert(r.truncated);assert.equal(r.reason,'NODE_LIMIT');assert.equal(r.edges.length,31);assert.equal(new Set(r.edges.flatMap(e=>[e.sourceEntityId,e.targetEntityId])).size,32);
 const ref={snapshotArtifactId:f.s.artifactId,revisionId:f.d.revisionId,relationshipId:r.edges[0].relationshipId,derivationRule:null};assert(H.validateSelected(ref,f.s,f.c));assert.throws(()=>H.validateSelected({...ref,revisionId:F.uid(999)},f.s,f.c),/MIXED_REVISION/);
}
{
 const f=F.imported();f.c.staleValues.push(f.e.supportingFactRefs[0].valueRevisionId);assert.equal(retrieve(f).edges.length,0);const x=F.fixture();x.c.brandArchived=true;assert.throws(()=>retrieve(x),/ARCHIVED/);
 const edge=ajv.getSchema('urn:ai-brand-os:ontology-relations:1.0.0:edge');assert(!edge({...F.fixture().e,origin:'AI_APPROVED'}));assert(!edge({...F.fixture().e,extra:true}));assert(!edge({...F.fixture().e,sourceEntityId:'8A2C6F9E-4F38-5F81-8BEE-2B6595C7CD6C'}));
}
console.log('PASS: additional restore-publication metadata/backlink, 32-node truncation, selected-ref, stale-support, archive and malformed-shape probes.');

{const f=F.fixture(),s=state(f),r=req(f);H.publish(s,f.s,f.c,r);assert.throws(()=>H.publish(s,f.s,{...f.c,brandId:F.uid(999)},r),/SAFE_404/);console.log('PASS: authorized foreign-scope receipt replay rejected before lookup.');}
