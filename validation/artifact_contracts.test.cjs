'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const { referenceErrors } = require('./artifact_reference_checks.cjs');
const base = path.resolve(__dirname, '../contracts/artifacts/2.0.0');
const load = file => JSON.parse(fs.readFileSync(path.join(base, file), 'utf8'));
// Prefer npm-installed local pinned dev dependencies; optional read-only tooling reuse is explicit.
let Ajv, addFormats;
if (process.env.ARTIFACT_VALIDATOR_PACKAGE_ROOT) {
  const req = createRequire(path.resolve(process.env.ARTIFACT_VALIDATOR_PACKAGE_ROOT, 'package.json'));
  Ajv = req('ajv/dist/2020').default;
  addFormats = req('ajv-formats');
} else {
  Ajv = require('ajv/dist/2020').default;
  addFormats = require('ajv-formats');
}
const ajv = new Ajv({ allErrors: true, strict: true, strictTypes: false, strictRequired: false, validateFormats: true });
addFormats(ajv);
const schemas = fs.readdirSync(base).filter(x => x.endsWith('.schema.json')).map(load);
schemas.forEach(schema => { assert(ajv.validateSchema(schema), JSON.stringify(ajv.errors)); ajv.addSchema(schema); });
const validate = ajv.getSchema('urn:ai-brand-os:artifact:2.0.0:envelope');
const registry = load('registry.json');
const valid = load('examples/valid.json');
const invalid = load('examples/invalid.json');
const catalog = load('examples/reference-catalog.json');
let checks = 0;
function accepts(a, name) { assert(validate(a), `${name}: ${JSON.stringify(validate.errors)}`); checks++; }
function rejects(a, name) { assert(!validate(a), `${name} unexpectedly accepted`); checks++; }
const clone = a => JSON.parse(JSON.stringify(a));
const outcome = (a, status) => {
  a.payload.operationStatus = status;
  a.status = status === 'SUCCEEDED' ? 'VALID' : ['PENDING', 'PARTIAL'].includes(status) ? 'CREATED' : 'INVALID';
  if (status === 'PENDING') a.payload.data = null;
  a.payload.error = ['FAILED', 'CANCELLED', 'TIMEOUT'].includes(status) ? {
    code: status === 'FAILED' ? 'INTERNAL_ERROR' : status, message: 'Safe fictional diagnostic',
    retryable: status !== 'CANCELLED', retryAfterMs: null, violationPaths: [], diagnosticId: a.artifactId,
  } : null;
};
for (const sample of valid) {
  accepts(sample.artifact, sample.name);
  assert.deepEqual(referenceErrors(sample.artifact, id => catalog[id]), [], `reference fixture ${sample.name}`); checks++;
}
for (const sample of invalid) {
  if (sample.expectedLayer === 'schema') rejects(sample.artifact, sample.name);
  else { accepts(sample.artifact, sample.name); assert(referenceErrors(sample.artifact, id => catalog[id]).length, sample.name); checks++; }
}
for (const variant of registry.variants) {
  const sample = valid.find(x => x.name === variant.variant).artifact;
  for (const stage of variant.stages) for (const state of variant.outcomes) {
    const a = clone(sample); a.producingStage = stage; outcome(a, state); accepts(a, `${stage}/${state}`);
    const mismatch = clone(a); if (['FAILED','CANCELLED','TIMEOUT'].includes(state)) mismatch.status='VALID'; else mismatch.payload.error={code:'INTERNAL_ERROR',message:'Unexpected error',retryable:false,retryAfterMs:null,violationPaths:[],diagnosticId:a.artifactId};
    rejects(mismatch, `artifact/operation status mismatch ${stage}/${state}`);
  }
  const unknown = clone(sample); unknown.payload.variant = 'invented'; rejects(unknown, 'unknown variant');
  const extra = clone(sample); extra.payload.extraField = 'not allowed'; rejects(extra, 'unknown payload property');
  const producer = clone(sample); producer.producingService = producer.producingService === 'INGESTION' ? 'AI_ORCHESTRATOR' : 'INGESTION'; rejects(producer, 'wrong producer');
  const stage = clone(sample); stage.producingStage = 'invented_stage'; rejects(stage, 'unknown stage');
}
for (const sample of valid) {
  for (const status of ['CREATED','VALID','INVALID','SUPERSEDED','ARCHIVED']) {
    const a = clone(sample.artifact); a.status = status;
    const expected = ['FAILED','CANCELLED','TIMEOUT'].includes(a.payload.operationStatus) ? status === 'INVALID' :
      a.artifactType === 'APPROVED_KNOWLEDGE' ? status !== 'CREATED' && status !== 'INVALID' : true;
    if (expected) accepts(a, `lifecycle ${sample.name}/${status}`); else rejects(a, `lifecycle ${sample.name}/${status}`);
  }
}
const approved = clone(valid.find(x => x.name === 'approved_snapshot').artifact);
for (const state of ['PENDING','PARTIAL','FAILED','CANCELLED','TIMEOUT']) { const a=clone(approved); outcome(a,state); rejects(a, `unapproved snapshot ${state}`); }
const importedTone = clone(approved); const tone = importedTone.payload.data.facts.find(x => x.fieldPath==='toneAttributes');
tone.origin='IMPORTED'; tone.manual=null; tone.evidence=[valid.find(x => x.name==='extraction').artifact.payload.data.candidateItems[0].change.evidence[0]];
rejects(importedTone, 'manual-only imported tone');
const noUnknownConfidence=clone(valid.find(x=>x.name==='context').artifact); noUnknownConfidence.payload.data.contextScore={value:null,basis:'fabricated'}; rejects(noUnknownConfidence,'unknown score requires null basis');
const missing = clone(valid.find(x=>x.name==='structured_document').artifact); missing.payload.data.chunks[0].locationUnavailableReason=null; rejects(missing,'missing source location reason');
const badUuid=clone(approved); badUuid.artifactId='revision-1'; rejects(badUuid,'UUID format');
const badTime=clone(approved); badTime.createdAt='yesterday'; rejects(badTime,'timestamp format');
const extraBase=clone(approved); extraBase.ontologyVersion='1.1.0'; rejects(extraBase,'payload metadata placed in base');
for (const version of ['1.0.0','2.0.1','2.1.0','3.0.0']) { const a=clone(approved); a.schemaVersion=version; rejects(a,`unregistered version ${version}`); }
const prisma = fs.readFileSync(path.resolve(__dirname,'../schema.prisma'),'utf8');
for (const [key, name] of [['artifactTypes','ArtifactType'],['artifactStatuses','ArtifactStatus'],['producingServices','ProducingService']]) {
  const block=prisma.match(new RegExp(`enum ${name}\\s*\\{([^}]+)\\}`))[1];
  const values=[...block.matchAll(/^\s*([A-Z][A-Z_0-9]*)\s*(?:\/\/.*)?$/gm)].map(x=>x[1]);
  assert.deepEqual(registry[key],values); checks++;
}
const { requestHash, retryDisposition, readVersion } = require('./artifact_compatibility.cjs');
const requestA={method:'PATCH',target:'brand-field',body:{expectedRevisionId:null,value:'Fixture'}};
const requestB={body:{value:'Fixture',expectedRevisionId:null},target:'brand-field',method:'PATCH'};
assert.equal(requestHash(requestA),requestHash(requestB)); checks++;
assert.notEqual(requestHash(requestA),requestHash({...requestA,body:{...requestA.body,value:'Changed'}})); checks++;
assert.equal(retryDisposition(null,{requestHash:requestHash(requestA)}),'NEW'); checks++;
assert.equal(retryDisposition({requestHash:requestHash(requestA)},{requestHash:requestHash(requestB)}),'REPLAY'); checks++;
assert.equal(retryDisposition({requestHash:requestHash(requestA)},{requestHash:'different'}),'CONFLICT'); checks++;
for (const status of ['Created','Valid','Invalid','Superseded','Archived']) {
  const legacy=readVersion({schemaVersion:'1.0.0',id:approved.artifactId,status});
  assert.equal(legacy.classification,'LEGACY_OPAQUE'); assert.equal(legacy.generationEligible,false); checks+=2;
}
assert.equal(readVersion({schemaVersion:'2.0.0'}).classification,'CURRENT_REQUIRES_VALIDATION'); checks++;
assert.equal(readVersion({schemaVersion:'2.1.0'}).classification,'UNSUPPORTED_VERSION'); checks++;
assert.equal(readVersion({schemaVersion:'1.0.0',status:'approved'}).classification,'LEGACY_QUARANTINE'); checks++;
const deletedCatalog=clone(catalog); const conversationId=valid.find(x=>x.name==='context').artifact.conversationId;
deletedCatalog[conversationId].deletedAt='2026-10-16T11:00:00Z';
assert(referenceErrors(valid.find(x=>x.name==='context').artifact,id=>deletedCatalog[id]).some(x=>x.code==='CONVERSATION_DELETED')); checks++;
const cancel=clone(valid.find(x=>x.name==='response').artifact); outcome(cancel,'CANCELLED'); cancel.payload.error.code='TIMEOUT'; rejects(cancel,'cancel error code mismatch');
const pending=clone(valid.find(x=>x.name==='response').artifact); outcome(pending,'PENDING'); pending.payload.data={generatedResponse:'should not exist before work'}; rejects(pending,'pending result must be null');
const unsafeManual=clone(valid.find(x=>x.name==='manual_commit').artifact); unsafeManual.parentArtifactId=approved.artifactId; rejects(unsafeManual,'initial manual root must not have parent');
const manual=valid.find(x=>x.name==='manual_commit').artifact;
const noSources=clone(catalog);
for(const [id,row] of Object.entries(noSources)) if(row.kind==='Document' || row.kind==='Artifact' && ['RAW_INTAKE','PROCESSING_INTERMEDIATE','STRUCTURED_DOCUMENT'].includes(row.artifactType)) delete noSources[id];
assert.deepEqual(referenceErrors(manual,id=>noSources[id]),[]); checks++;
assert.deepEqual(referenceErrors(approved,id=>noSources[id]),[]); checks++;
for(const sampleName of ['intake','context','response']) {
 const a=clone(valid.find(x=>x.name===sampleName).artifact); a.status='INVALID'; accepts(a,'consumer rejects successful record '+sampleName);
 const p=clone(a); outcome(p,'PENDING'); p.status='VALID'; accepts(p,'well-shaped pending checkpoint accepted, not success '+sampleName);
}
const foreignCatalog=clone(catalog); const sourceId=valid.find(x=>x.name==='extraction').artifact.payload.data.provenance.sourceArtifactId;
foreignCatalog[sourceId].organizationId='00000000-0000-4000-8000-000000000099';
assert(referenceErrors(valid.find(x=>x.name==='extraction').artifact,id=>foreignCatalog[id]).some(x=>x.code==='REFERENCE_TENANT')); checks++;
for(const [name,mutate,code] of [
 ['prompt',a=>a.payload.data.contextVersion='9.0.0','PROMPT_CONTEXT_MISMATCH'],
 ['response',a=>a.payload.data.promptVersion='9.0.0','RESPONSE_PROMPT_MISMATCH'],
 ['context',a=>a.payload.data.selectedKnowledge[0].factKey.fieldPath='nonexistent','REVISION_FACT_MISSING'],
 ['extraction',a=>a.payload.data.candidateRelationships[0].target.candidateId=a.artifactId,'RELATIONSHIP_CANDIDATE_MISSING']
]) {
 const a=clone(valid.find(x=>x.name===name).artifact); mutate(a); accepts(a,'structurally valid mismatched reference '+code);
 assert(referenceErrors(a,id=>catalog[id]).some(e=>e.code===code)); checks++;
}
const invalidAttempt=clone(manual); invalidAttempt.payload.attemptNumber=0; rejects(invalidAttempt,'attemptNumber starts at one');
const baseDecision=valid.find(x=>x.name==='candidate_decision').artifact;
const reject=clone(baseDecision); reject.payload.data.action='REJECT'; reject.payload.data.resultingRevisionId=null; accepts(reject,'terminal rejection is valid audit data');
const forgedReject=clone(reject); forgedReject.payload.data.resultingRevisionId=approved.payload.data.revisionId; rejects(forgedReject,'rejection cannot publish');
const edited=clone(baseDecision); edited.payload.data.action='EDIT_AND_CONFIRM'; edited.payload.data.reason='Owner corrects imported proposal'; edited.payload.data.changes=[clone(manual.payload.data.changes[0])]; accepts(edited,'edited confirmation retains a typed reviewed diff');
const noEditReason=clone(edited); noEditReason.payload.data.reason=null; rejects(noEditReason,'edited confirmation requires reason');
for(const kind of ['MANUAL_EDIT','VERIFY','RESTORE']) {
 const a=clone(manual); a.parentArtifactId=approved.artifactId; a.payload.data.kind=kind;
 a.payload.data.expectedRevisionId=approved.payload.data.revisionId;
 a.payload.data.resultingRevisionId='00000000-0000-4000-8000-000000000077';
 if(kind==='VERIFY') {a.payload.data.changes=[]; a.payload.data.verifiedFactKeys=[clone(factKeyForTest())];}
 if(kind==='RESTORE') {a.payload.data.changes=[]; a.payload.data.restoredFromRevisionId=approved.payload.data.revisionId;}
 accepts(a,'manual '+kind+' schema');
 const noHead=clone(a); noHead.payload.data.expectedRevisionId=null; rejects(noHead,'manual '+kind+' requires expected head');
}
function factKeyForTest() {const f=approved.payload.data.facts[0]; return {entityType:f.entityType,entityId:f.entityId,fieldPath:f.fieldPath};}
const noFacts=clone(approved); noFacts.payload.data.facts=[]; noFacts.payload.data.changes.kind='MANUAL_EDIT'; noFacts.payload.data.changes.removedFactKeys=approved.payload.data.facts.map(f=>({entityType:f.entityType,entityId:f.entityId,fieldPath:f.fieldPath})); noFacts.payload.data.calculationSelection={offerEntityId:null,audienceEntityId:null}; accepts(noFacts,'explicitly cleared snapshot is structurally valid but not generation-ready');
console.log(`PASS: ${schemas.length} Draft 2020-12 schemas; ${registry.variants.length} variants; ${valid.length} valid/${invalid.length} invalid fixtures; ${checks} assertions`);
console.log('Coverage: every registered stage/outcome and all five ArtifactStatus values; offline reference checks only, no DB authorization/publication test.');
