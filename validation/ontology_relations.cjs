'use strict';
// Executable reference model only: not an authorization server or database implementation.
const {createHash}=require('node:crypto'),registry=require('../contracts/ontology-relations/1.0.0/registry.json');
const copy=x=>JSON.parse(JSON.stringify(x)),fail=c=>{throw Error(c);};
const tuple=e=>[e.organizationId,e.brandId,e.relationshipType,e.sourceEntityType,e.sourceEntityId,e.targetEntityType,e.targetEntityId];
const id=e=>'rel_'+createHash('sha256').update(JSON.stringify(tuple(e))).digest('hex');
const key=m=>m.entityType+':'+m.entityId;
function validate(s,c,{ready=false,reviewed=false}={}){
 if(!c.authorized||s.organizationId!==c.organizationId||s.payload.brandId!==c.brandId)fail('SAFE_404');
 const d=s.payload.data,g=d.relationships;if(!g)return {availability:'NOT_RECORDED'};
 if(g.registryVersion!=='1.0.0'||g.ontologyVersion!=='1.2.0'||d.ontologyVersion!=='1.2.0')fail('VERSION_GATE');
 if(g.revisionId!==d.revisionId)fail('MIXED_REVISION');
 const members=new Set(d.members.map(key)),seen=new Set(),disps=new Map();
 if(members.size!==d.members.length)fail('DUPLICATE_MEMBER');
 if(d.members.filter(m=>m.entityType==='ORGANIZATION').length!==1||!members.has('ORGANIZATION:'+c.organizationId)||d.members.filter(m=>m.entityType==='BRAND').length!==1||!members.has('BRAND:'+c.brandId))fail('OWNERSHIP');
 for(const f of d.facts)if(!members.has(f.entityType+':'+f.entityId))fail('DANGLING_FACT');
 for(const m of d.members){const o=c.ownership[m.entityId];if(!o||o.organizationId!==c.organizationId||o.brandId!==c.brandId||o.entityType!==m.entityType)fail('OWNERSHIP');}
 for(const m of g.membershipDispositions){if(disps.has(key(m)))fail('DUPLICATE_DISPOSITION');disps.set(key(m),m.disposition);if((m.disposition==='REMOVED')===members.has(key(m)))fail('MEMBERSHIP_DISPOSITION');}
 for(const m of d.members)if(!['ORGANIZATION','BRAND','DOCUMENT'].includes(m.entityType)&&!disps.has(key(m)))fail('MISSING_DISPOSITION');
 for(const e of g.edges){
  if(e.organizationId!==c.organizationId)fail('TENANT');if(e.brandId!==c.brandId)fail('BRAND');
  const r=registry.relationships.find(r=>r.relationshipType===e.relationshipType&&r.sourceEntityType===e.sourceEntityType&&r.targetEntityType===e.targetEntityType);
  if(!r||r.status!=='Active'||r.category!=='EXPLICIT')fail('PAIR');if(!reviewed)fail('POLICY_DISABLED');
  if(!r.origins.includes(e.origin))fail('ORIGIN');if(e.relationshipId!==id(e))fail('IDENTITY');if(seen.has(e.relationshipId))fail('DUPLICATE');seen.add(e.relationshipId);
  for(const side of ['source','target'])if(!members.has(e[side+'EntityType']+':'+e[side+'EntityId']))fail('DANGLING');
  const approval=c.approvals[e.approvalDecisionArtifactId];if(!approval||!approval.authorizedHuman||approval.organizationId!==c.organizationId||approval.brandId!==c.brandId||approval.revisionId!==e.lastApprovedRevisionId||!approval.edgeIds.includes(e.relationshipId))fail('APPROVAL');
  if(e.origin==='IMPORTED'){
   if(!e.supportingFactRefs.length||!e.evidenceRefs.length)fail('SUPPORT');
   for(const f of e.supportingFactRefs){const actual=c.supports.find(x=>JSON.stringify(x.ref)===JSON.stringify(f));if(!actual||!actual.approved||!actual.supportsPredicate)fail('SUPPORT');}
   for(const ref of e.evidenceRefs){const b=c.bindings.find(b=>b.bindingArtifactId===ref.bindingArtifactId&&b.evidenceId===ref.evidenceId);if(!b||!b.valid||b.organizationId!==c.organizationId||b.brandId!==c.brandId||!e.supportingFactRefs.some(f=>b.valueRevisionId===f.valueRevisionId))fail('EVIDENCE');}
  }
 }
 if(ready){const active=t=>d.members.filter(m=>m.entityType===t&&disps.get(key(m))!=='ARCHIVED').length;
  if(active('BRAND')!==1||active('BRAND_VOICE')!==1||active('AUDIENCE')<1||active('PRODUCT')+active('SERVICE')<1)fail('NOT_READY');}
 return {availability:'RECORDED'};
}
function retrieve(s,c,{reviewed=false,uses=false,cache=null,seeds=[]}={}){
 validate(s,c,{reviewed});if(c.brandArchived)fail('ARCHIVED');const g=s.payload.data.relationships;if(!g)return {availability:'NOT_RECORDED',edges:[],truncated:false,reason:null};
 // Cache is optional; deliberately never trusted without canonical equality. This fixture uses canonical fallback.
 const inactive=new Set(g.membershipDispositions.filter(m=>m.disposition!=='ACTIVE').map(m=>m.entityId));
 let edges=g.edges.filter(e=>!inactive.has(e.sourceEntityId)&&!inactive.has(e.targetEntityId)&&!c.deletedIds.includes(e.sourceEntityId)&&!c.deletedIds.includes(e.targetEntityId)&&(!seeds.length||seeds.includes(e.sourceEntityId)||seeds.includes(e.targetEntityId))&&e.supportingFactRefs.every(f=>!c.staleValues.includes(f.valueRevisionId)));
 if(uses&&reviewed){const voice=s.payload.data.members.find(m=>m.entityType==='BRAND_VOICE'&&!inactive.has(m.entityId));if(voice)for(const m of s.payload.data.members.filter(m=>['PRODUCT','SERVICE'].includes(m.entityType)&&!inactive.has(m.entityId)&&(!seeds.length||seeds.includes(m.entityId)))){const e={organizationId:c.organizationId,brandId:c.brandId,relationshipType:'USES',sourceEntityType:m.entityType,sourceEntityId:m.entityId,targetEntityType:'BRAND_VOICE',targetEntityId:voice.entityId,derivationRule:'USES_SINGLE_APPROVED_VOICE/1.0.0'};e.relationshipId=id(e);edges.push(e);}}
 edges.sort((a,b)=>a.relationshipType.localeCompare(b.relationshipType)||a.relationshipId.localeCompare(b.relationshipId));const result=[],nodes=new Set();let reason=null;
 for(const e of edges){if(result.length===32){reason='EDGE_LIMIT';break;}const n=new Set([...nodes,e.sourceEntityId,e.targetEntityId]);if(n.size>32){reason='NODE_LIMIT';break;}result.push(e);n.forEach(x=>nodes.add(x));}
 return {edges:result,truncated:reason!==null,reason,revisionId:g.revisionId,snapshotArtifactId:s.artifactId};
}
function publish(state,next,c,request){
 if(!c.authorized||!request.human)fail('UNAUTHORIZED');if(state.organizationId!==c.organizationId||state.brandId!==c.brandId)fail('SAFE_404');if(!request.reviewed)fail('POLICY_DISABLED');
 const old=state.receipts[request.key];if(old){if(old.hash!==request.hash)fail('IDEMPOTENCY_CONFLICT');return old.result;}
 if(request.expectedRevisionId!==state.head)fail('STALE_REVISION');validate(next,c,{reviewed:true});
 const result=copy(next);state.head=next.payload.data.revisionId;state.snapshot=result;state.commits++;state.receipts[request.key]={hash:request.hash,result};return result;
}
function restore(history,c,{reviewed=false}={}){if(!history.payload.data.relationships)fail('NOT_RECORDED_REVIEW_REQUIRED');validate(history,c,{reviewed});return copy(history);}
module.exports={id,tuple,key,validate,retrieve,publish,restore,copy};
// Restore publication preparation: new immutable identities/approval backlinks, never pointer rewind.
function prepareRestore(history,current,c,{revisionId,artifactId,commitId,reviewed=false}){
 const s=restore(history,c,{reviewed}),d=s.payload.data,g=d.relationships,prior=current.payload.data.relationships;
 const oldEdges=new Map((prior?.edges||[]).map(e=>[e.relationshipId,e]));
 s.artifactId=artifactId;s.parentArtifactId=commitId;d.revisionId=revisionId;g.revisionId=revisionId;d.changes.kind='RESTORE';
 for(const e of g.edges){const old=oldEdges.get(e.relationshipId);if(!old){e.supersedesApprovalRevisionId=e.lastApprovedRevisionId;e.lastApprovedRevisionId=revisionId;e.approvalDecisionArtifactId=commitId;}}
 return {snapshot:s,revisionMetadata:{revisionId,previousRevisionId:current.payload.data.revisionId,restoredFromRevisionId:history.payload.data.revisionId}};
}
function validateSelected(selection,s,c){
 if(selection.snapshotArtifactId!==s.artifactId||selection.revisionId!==s.payload.data.revisionId)fail('MIXED_REVISION');
 const visible=retrieve(s,c,{reviewed:true,uses:selection.derivationRule!==null}).edges;
 if(!visible.some(e=>e.relationshipId===selection.relationshipId&&(e.derivationRule||null)===selection.derivationRule))fail('UNRESOLVED_CONTEXT');return true;
}
module.exports.prepareRestore=prepareRestore;module.exports.validateSelected=validateSelected;
