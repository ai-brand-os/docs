'use strict';
// Standalone resolver over trusted, validated fixture projections. Not application authorization.
const {requestHash}=require('./artifact_compatibility.cjs');
const terminalStatuses=['COMPLETED','FAILED','REJECTED_NO_CANDIDATES'];
const key=x=>`${x.candidateArtifactId}/${x.candidateId}`;
const sorted=x=>[...x].sort();
const sameSet=(a,b)=>JSON.stringify(sorted(a))===JSON.stringify(sorted(b));
function resolveImportState(eligibleArtifacts,candidateDecisions,publicationEvidence,currentOperationClaim){
 const c=currentOperationClaim;
 if(!c.authorized)throw new Error('SAFE_404');
 const scope=a=>a.organizationId===c.organizationId&&a.correlationId===c.correlationId&&a.payload.brandId===c.brandId;
 if([...eligibleArtifacts,...candidateDecisions].some(a=>!scope(a)))throw new Error('SAFE_404');
 let phase='SUBMITTED',closureId=null,pubs=[],summary={eligible:0,accepted:0,editedAccepted:0,rejected:0,pending:0,invalidated:0};
 const out=(status,reasonCode,terminal=false,retryAvailable=false,nextAction='WAIT',ids=[])=>{
  const value={projectionVersion:'1.0.0',importId:c.correlationId,correlationId:c.correlationId,brandId:c.brandId,status,reasonCode,progressPhase:phase,candidateSummary:{...summary},pendingDecisionCount:summary.pending,retryAvailable,nextAction,terminal,closureArtifactId:terminal?closureId:null,publicationRefs:sorted(pubs)};
  return {...value,version:requestHash({value,recordIds:sorted(ids),controlHeadId:c.controlHeadId,overlay:{leaseLive:c.leaseLive,sourceActive:c.sourceActive,brandActive:c.brandActive,retryRemaining:c.retryRemaining}})};
 };
 const blocked=(reason='INTEGRITY_BLOCKED')=>out(phase,reason,false,false,'RECONCILE');
 const unique=new Map();for(const a of [...eligibleArtifacts,...candidateDecisions]){if(unique.has(a.artifactId)&&requestHash(unique.get(a.artifactId))!==requestHash(a))return blocked();unique.set(a.artifactId,a);}
 const controls=[...unique.values()].filter(a=>a.payload.variant==='import_control'&&['VALID','ARCHIVED'].includes(a.status)).sort((a,b)=>a.payload.data.sequence-b.payload.data.sequence);
 if(!controls.length)return blocked('RECOVERY_REQUIRED');
 let prev=null,epoch=0,fence=0,seenClosed=false,seenReview=false;
 for(const a of controls){const d=a.payload.data;
  if(seenClosed||d.sequence!==(prev?prev.payload.data.sequence+1:1)||d.previousControlArtifactId!==(prev?.artifactId??null)||a.parentArtifactId!==d.previousControlArtifactId||d.epoch<epoch||d.fence<fence)return blocked();
  if(!prev&&d.event!=='ADMITTED')return blocked();
  if(seenReview&&d.event!=='CLOSED')return blocked();
  if(d.event==='REVIEW_OPENED')seenReview=true;
  if(prev&&d.event==='ADMITTED')return blocked();
  epoch=d.epoch;fence=d.fence;seenClosed=d.event==='CLOSED';prev=a;
 }
 const head=controls.at(-1);phase=head.payload.data.phase;
 if(head.payload.data.event==='CLOSED'&&(new Set(head.payload.data.retainedArtifactIds).size!==head.payload.data.retainedArtifactIds.length||head.payload.data.retainedArtifactIds.some(id=>!unique.has(id))))return blocked();
 if(head.artifactId!==c.controlHeadId)return blocked('RECOVERY_REQUIRED');
 const lastReview=[...controls].reverse().find(a=>a.payload.data.event==='REVIEW_OPENED');
 if(lastReview&&controls.some(a=>a.payload.data.sequence>lastReview.payload.data.sequence&&a.payload.data.event!=='CLOSED'))return blocked();
 const selection=[...controls].reverse().find(a=>['CLAIMED','RETRY_AUTHORIZED'].includes(a.payload.data.event))?.payload.data??head.payload.data;
 if(head.payload.data.event!=='CLOSED'&&(selection.epoch!==c.epoch||selection.fence!==c.fence))return blocked('LEASE_RECOVERY');
 const retained=new Set(selection.retainedArtifactIds),selected=new Map();
 for(const a of [...unique.values()].filter(a=>!['import_control','candidate_decision','approved_snapshot'].includes(a.payload.variant))){
  if(head.payload.data.event==='CLOSED'&&!head.payload.data.retainedArtifactIds.includes(a.artifactId))continue;
  if(['SUPERSEDED','ARCHIVED'].includes(a.status))continue;
  const allowed=retained.has(a.artifactId)||selection.stageBindings.some(b=>b.producingStage===a.producingStage&&b.invocationId===a.payload.invocationId&&a.payload.attemptNumber>=b.minAttemptNumber&&a.payload.attemptNumber<=b.maxAttemptNumber);
  if(!allowed)continue;
  if(retained.has(a.artifactId)&&!(a.status==='VALID'&&a.payload.operationStatus==='SUCCEEDED'))return blocked();
  const stage=a.producingStage,old=selected.get(stage),tuple=[a.payload.attemptNumber,a.payload.checkpointNumber];
  if(old){const ot=[old.payload.attemptNumber,old.payload.checkpointNumber];if(tuple[0]===ot[0]&&tuple[1]===ot[1]&&a.artifactId!==old.artifactId)return blocked();if(tuple[0]<ot[0]||(tuple[0]===ot[0]&&tuple[1]<ot[1]))continue;}
  selected.set(stage,a);
 }
 const chosen=[...selected.values()];
 if(phase==='PROCESSING'&&!chosen.some(a=>a.producingStage==='intake'&&a.status==='VALID'&&a.payload.operationStatus==='SUCCEEDED'))return blocked();
 if(phase==='EXTRACTING'&&!chosen.some(a=>a.producingStage==='quality_validator'&&a.status==='VALID'&&a.payload.operationStatus==='SUCCEEDED'))return blocked();
 const ids=[...controls.map(a=>a.artifactId),...chosen.map(a=>a.artifactId)];
 const success=a=>a&&a.status==='VALID'&&a.payload.operationStatus==='SUCCEEDED';
 const intake=selected.get('intake'),document=selected.get('quality_validator'),extraction=selected.get('candidate_builder'),governance=selected.get('policy_engine');
 if(lastReview){
  const manifest=lastReview.payload.data;
  if(new Set(manifest.reviewCandidateRefs.map(key)).size!==manifest.reviewCandidateRefs.length)return blocked();
  if(![intake,document,extraction,governance].every(success)||governance.payload.data.candidateArtifactId!==extraction.artifactId||!sameSet(manifest.governanceArtifactIds,[governance.artifactId]))return blocked();
  if(!sameSet(manifest.reviewCandidateRefs.map(key),governance.payload.data.eligibleCandidateIds.map(candidateId=>key({candidateArtifactId:extraction.artifactId,candidateId}))))return blocked();
  if(manifest.reviewCandidateRefs.some(r=>!extraction.payload.data.candidateItems.some(x=>x.candidateId===r.candidateId)))return blocked();
  phase='READY_FOR_REVIEW';summary.eligible=manifest.reviewCandidateRefs.length;
  const decisions=new Map();
  for(const a of [...unique.values()].filter(a=>a.payload.variant==='candidate_decision')){
   const d=a.payload.data,k=key(d);if(!manifest.reviewCandidateRefs.some(r=>key(r)===k))return blocked();
   if(a.status!=='VALID'||a.payload.operationStatus!=='SUCCEEDED')continue;
   if(decisions.has(k)&&decisions.get(k).artifactId!==a.artifactId)return blocked();
   decisions.set(k,a);
  }
  for(const r of manifest.reviewCandidateRefs){const a=decisions.get(key(r));if(!a){summary.pending++;continue;}
   const d=a.payload.data;ids.push(a.artifactId);
   if(d.action==='REJECT'){if(d.resultingRevisionId!==null)return blocked();summary.rejected++;continue;}
   const p=publicationEvidence.find(p=>p.revisionId===d.resultingRevisionId&&p.decisionArtifactId===a.artifactId&&p.committed&&p.organizationId===c.organizationId&&p.brandId===c.brandId&&p.expectedRevisionId===d.expectedRevisionId&&p.actorUserId===d.actorUserId&&p.snapshotParentArtifactId===a.artifactId&&p.requiredProjectionsReady);
   if(!p){summary.pending++;continue;}
   pubs.push(p.revisionId);ids.push(p.snapshotArtifactId,p.revisionId);
   if(d.action==='CONFIRM')summary.accepted++;else if(d.action==='EDIT_AND_CONFIRM')summary.editedAccepted++;else return blocked();
  }
 }
 const d=head.payload.data;
 if(d.event==='CLOSED'){
  const close=d.closure;if(!close)return blocked();closureId=head.artifactId;
  if(close.publicStatus==='COMPLETED'){
   if(!lastReview||!summary.eligible||summary.pending||summary.invalidated||!sameSet(d.decisionArtifactIds,[...unique.values()].filter(a=>a.payload.variant==='candidate_decision'&&a.status==='VALID').map(a=>a.artifactId))||!sameSet(d.publicationRevisionIds,pubs))return blocked();
   const expected=summary.rejected===summary.eligible?'NOTHING_ACCEPTED':summary.rejected?'MIXED_DECISIONS':'ALL_ACCEPTED';if(close.outcome!==expected||d.reasonCode!==expected)return blocked();return out('COMPLETED',expected,true,false,'NONE',ids);
  }
  if(close.publicStatus==='REJECTED_NO_CANDIDATES'){
   if(!lastReview||summary.eligible||close.outcome!=='NOTHING_EXTRACTED'||d.publicationRevisionIds.length||d.decisionArtifactIds.length)return blocked();return out('REJECTED_NO_CANDIDATES','NOTHING_EXTRACTED',true,false,'MANUAL_ENTRY',ids);
  }
  if(close.publicStatus!=='FAILED'||!['PIPELINE_FAILED','RETRY_EXHAUSTED','INPUT_UNSAFE','SOURCE_UNAVAILABLE','AUTHORIZATION_REVOKED'].includes(close.outcome)||d.reasonCode!==close.outcome)return blocked();
  if(close.outcome==='RETRY_EXHAUSTED'&&c.retryRemaining)return blocked();
  return out('FAILED',close.outcome,true,false,'MANUAL_ENTRY',ids);
 }
 if(!c.brandActive||!c.sourceActive){if(lastReview){summary.invalidated=summary.pending;summary.pending=0;}return out(phase,'SOURCE_UNAVAILABLE',false,false,'RECONCILE',ids);}
 if(!c.leaseLive&&phase!=='READY_FOR_REVIEW')return out(phase,'LEASE_RECOVERY',false,false,'RECONCILE',ids);
 if(lastReview){
  if(c.forceCloseRequested)return out(phase,'POLICY_REVIEW_REQUIRED',false,false,'REVIEW',ids);
  const intents=[...unique.values()].filter(a=>a.payload.variant==='candidate_decision'&&a.status==='VALID'&&a.payload.data.action!=='REJECT').length;
  if(intents>pubs.length)return out(phase,'PUBLICATION_RECONCILING',false,false,'RECONCILE',ids);
  return out(phase,summary.pending?'REVIEW_PENDING':'FINALIZING',false,false,summary.pending?'REVIEW':'WAIT',ids);
 }
 const partial=chosen.some(a=>a.payload.operationStatus==='PARTIAL'),fail=chosen.find(a=>['FAILED','TIMEOUT','CANCELLED'].includes(a.payload.operationStatus));
 if(partial||fail){const canRetry=c.retryRemaining&&!c.permanentFailure;return out(phase,partial?'PARTIAL_EXECUTION':fail?.payload.operationStatus==='TIMEOUT'?'PROVIDER_TIMEOUT':canRetry?'RETRY_PENDING':'RECOVERY_REQUIRED',false,canRetry,canRetry?'RETRY':'RECONCILE',ids);}
 return out(phase,phase==='SUBMITTED'?'ACCEPTED':'IN_PROGRESS',false,false,'WAIT',ids);
}
// Test-only mutation model. Actual database claims/auth/atomicity require runtime integration.
class ReviewFixture {
 constructor({organizationId,brandId,ownerId,head=null}){Object.assign(this,{organizationId,brandId,ownerId,head});this.receipts=new Map();this.decisions=new Map();this.closed=false;this.manualValue='Preserved manual value';}
 decide(r,principal){if(!principal.authorized||principal.organizationId!==this.organizationId||principal.brandId!==this.brandId||principal.userId!==this.ownerId)throw Error('SAFE_404');const old=this.receipts.get(r.key);if(old){if(old.hash!==requestHash(r))throw Error('CONFLICT');return old.result;}if(this.closed)throw Error('CLOSED');if(r.expectedRevisionId!==this.head||this.decisions.has(r.candidateId))throw Error('CONFLICT');if(!['CONFIRM','EDIT_AND_CONFIRM','REJECT'].includes(r.action)||!r.explicitConfirmation&&r.action!=='REJECT')throw Error('APPROVAL_REQUIRED');const result={decisionId:r.decisionId,resultingRevisionId:r.action==='REJECT'?null:r.revisionId};if(r.action!=='REJECT'){this.head=r.revisionId;this.manualValue=r.value;}this.decisions.set(r.candidateId,result);this.receipts.set(r.key,{hash:requestHash(r),result});return result;}
}
module.exports={resolveImportState,ReviewFixture};
