'use strict';
const H=require('./ontology_relations.cjs'),legacy=require('../contracts/artifacts/2.0.0/examples/valid.json');
const uid=n=>'00000000-0000-4000-8000-'+String(n).padStart(12,'0');
function fixture(type='PRODUCT'){
 const s=H.copy(legacy.find(x=>x.name==='approved_snapshot').artifact);s.schemaVersion='2.3.0';s.producingStage='publish_snapshot';s.payload.data.ontologyVersion='1.2.0';
 const d=s.payload.data,organizationId=s.organizationId,brandId=s.payload.brandId,source=d.members.find(x=>x.entityType==='PRODUCT'),audience=d.members.find(x=>x.entityType==='AUDIENCE');
 if(type==='SERVICE'){source.entityType='SERVICE';source.entityId=uid(41);d.facts=d.facts.filter(f=>f.entityType!=='PRODUCT');}
 const e={relationshipType:'TARGETS',sourceEntityType:type,sourceEntityId:source.entityId,targetEntityType:'AUDIENCE',targetEntityId:audience.entityId,organizationId,brandId,origin:'MANUAL',introducingRevisionId:d.revisionId,lastApprovedRevisionId:d.revisionId,supersedesApprovalRevisionId:null,approvalDecisionArtifactId:uid(50),supportingFactRefs:[],evidenceRefs:[]};e.relationshipId=H.id(e);
 d.relationships={registryVersion:'1.0.0',ontologyVersion:'1.2.0',revisionId:d.revisionId,edges:[e],membershipDispositions:d.members.filter(m=>!['ORGANIZATION','BRAND'].includes(m.entityType)).map(m=>({...m,disposition:'ACTIVE'}))};
 const c={authorized:true,organizationId,brandId,brandArchived:false,ownership:Object.fromEntries(d.members.map(m=>[m.entityId,{...m,organizationId,brandId}])),approvals:{[uid(50)]:{authorizedHuman:true,organizationId,brandId,revisionId:d.revisionId,edgeIds:[e.relationshipId]}},supports:[],bindings:[],deletedIds:[],staleValues:[]};
 return {s,c,e,d};
}
function imported(){
 const f=fixture(),SF=require('./source_evidence_fixture.cjs'),S=require('./source_evidence.cjs');
 const x=f.d.facts.find(x=>x.entityType==='PRODUCT'&&x.fieldPath==='description');x.value='Designed for Example customers';x.origin='IMPORTED';x.manual=null;
 const source=SF.fixture(x.value);for(const o of [source.m,source.b,source.context,...Object.values(source.store)]){o.organizationId=f.c.organizationId;o.brandId=f.c.brandId;}
 x.evidence=H.copy(source.context.legacyEvidence);const validation=S.validateBinding(source.m,source.b,source.store,source.context);f.source=source;
 const ref={snapshotArtifactId:f.s.artifactId,revisionId:f.d.revisionId,factKey:{entityType:x.entityType,entityId:x.entityId,fieldPath:x.fieldPath},valueRevisionId:x.valueRevisionId};
 f.e.origin='IMPORTED';f.e.supportingFactRefs=[ref];f.e.evidenceRefs=[{bindingArtifactId:SF.artifact(source.b,'evidence_binding').artifactId,evidenceId:source.b.entries[0].evidenceId}];
 f.c.supports=[{ref,approved:true,supportsPredicate:true}];f.c.bindings=[{...f.e.evidenceRefs[0],valid:validation.classification==='VERIFIED_EXACT',organizationId:f.c.organizationId,brandId:f.c.brandId,valueRevisionId:x.valueRevisionId}];return f;
}
module.exports={fixture,imported,uid};
