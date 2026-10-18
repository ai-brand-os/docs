'use strict';
// Narrow offline reference algorithms. Real services must load trusted scope/policy/source records.
const {requestHash}=require('../../../validation/artifact_compatibility.cjs');
const T=require('./taxonomies.json'),R=require('./scores.json');const copy=x=>JSON.parse(JSON.stringify(x));
const fail=code=>{throw Error(code);},same=(a,b)=>requestHash(a)===requestHash(b),order=(a,b)=>Buffer.compare(Buffer.from(a),Buffer.from(b));
const empty=(state,reason)=>({state,value:null,reasons:[reason]});
function companySize(count){if(count===null)return empty('UNKNOWN','HEADCOUNT_UNKNOWN');if(!Number.isSafeInteger(count)||count<1)fail('INVALID_HEADCOUNT');const b=T.vocabularies.CompanySize.proposedValues.find(b=>count>=b.min&&(b.max===null||count<=b.max));return {state:'KNOWN',value:b.key,reasons:[]};}
function historicalSize(value,version){if(version!=='historical-v1')fail('TAXONOMY_VERSION');const v=T.vocabularies.CompanySize.values.find(v=>v.key===value||v.label===value);if(!v)fail('INVALID_LEGACY_VALUE');return {version,value,interpretation:'PRESERVE_ORIGINAL_NO_REBUCKET'};}
function vocabulary(name,value){const v=T.vocabularies[name];if(!v||!v.values.some(x=>x.key===value))fail('UNSUPPORTED_CONTROLLED_VALUE');return value;}
function country(value,profile){if(value===null)return empty('UNKNOWN','COUNTRY_UNKNOWN');if(typeof value!=='string'||!/^[a-zA-Z]{2}$/.test(value))fail('INVALID_COUNTRY');const s=value.toUpperCase();if(!profile.countries.includes(s))fail('UNSUPPORTED_COUNTRY');return s;}
function language(value,profile){if(value===null)return empty('UNKNOWN','LANGUAGE_UNKNOWN');if(typeof value!=='string'||!value||value!==value.trim()||!/^[a-zA-Z]{2,8}(?:-[a-zA-Z0-9]{1,8})*$/.test(value))fail('INVALID_LANGUAGE');const raw=value.toLowerCase(),alias=profile.languageAliases[raw],canonical=profile.tags.find(t=>t.toLowerCase()===(alias||raw).toLowerCase());if(!canonical)fail('UNSUPPORTED_LANGUAGE');return canonical;}
function market(value){if(value===null)return empty('UNKNOWN','MARKET_UNKNOWN');if(typeof value!=='string')fail('INVALID_MARKET');const s=value.trim();if(!s||Array.from(s).length>200||/[\u0000-\u001f\u007f]/u.test(s))fail('INVALID_MARKET');return s;}
const shape=(x,keys)=>{if(!x||typeof x!=='object'||Array.isArray(x)||Object.keys(x).sort().join('|')!==keys.slice().sort().join('|'))fail('INPUT_SHAPE');};
function authorize(p,policy){if(!policy.authorized||p.scope.organizationId!==policy.organizationId||p.scope.brandId!==policy.brandId)fail('SAFE_404');if(p.scope.revisionId!==policy.revisionId)fail('MIXED_REVISION');if(!Number.isFinite(Date.parse(p.asOf)))fail('INVALID_ASOF');}
function normalize(indicator,input){shape(input,['checks','requiredFactRefs','selectedFactRefs','manifestState']);if(!['KNOWN','UNKNOWN','NOT_APPLICABLE'].includes(input.manifestState))fail('MANIFEST_STATE');for(const k of ['checks','requiredFactRefs','selectedFactRefs'])if(!Array.isArray(input[k]))fail('INPUT_SHAPE');
 const rule=R.indicators.find(x=>x.indicator===indicator);if(!rule)fail('INDICATOR');const checks=input.checks.map(x=>{shape(x,['key','status','reason','referenceIds']);if(!['PASS','FAIL','UNKNOWN','UNAVAILABLE','NOT_APPLICABLE','INVALID'].includes(x.status)||!Array.isArray(x.referenceIds)||x.referenceIds.some(r=>typeof r!=='string')||!(x.reason===null||typeof x.reason==='string'&&x.reason.length))fail('INVALID_CHECK');if(x.status==='NOT_APPLICABLE'&&x.reason===null)fail('NA_REQUIRES_REASON');return {...x,referenceIds:[...new Set(x.referenceIds)].sort(order)};});
 const keys=checks.map(x=>x.key);if(new Set(keys).size!==keys.length||keys.length!==rule.checks.length||keys.some(k=>!rule.checks.includes(k)))fail('CHECK_KEYS');checks.sort((a,b)=>rule.checks.indexOf(a.key)-rule.checks.indexOf(b.key));
 for(const k of ['requiredFactRefs','selectedFactRefs'])if(input[k].some(x=>typeof x!=='string'||!x.length))fail('FACT_REF');
 if(indicator!=='CONTEXT_QUALITY'&&(input.manifestState!=='NOT_APPLICABLE'||input.requiredFactRefs.length||input.selectedFactRefs.length))fail('INPUT_SHAPE');
 return {checks,manifestState:input.manifestState,requiredFactRefs:[...new Set(input.requiredFactRefs)].sort(order),selectedFactRefs:[...new Set(input.selectedFactRefs)].sort(order)};
}
const roundRatio=(n,d)=>Number((200n*BigInt(n)+BigInt(d))/(2n*BigInt(d)));
function evaluate(p,policy){authorize(p,policy);if(!['historical-v1','company-size-2'].includes(p.taxonomyVersion)||!policy.permittedTaxonomyVersions.includes(p.taxonomyVersion))fail('TAXONOMY_VERSION');const rule=R.indicators.find(x=>x.indicator===p.indicator);if(!rule||p.formulaVersion!==rule.formulaVersion||p.inputVersion!=='1.0.0')fail('FORMULA_VERSION');
 const inputs=normalize(p.indicator,p.inputs),enabled=policy.reviewedFormulas.includes(p.formulaVersion);if(enabled&&!policy.reviewDecisionArtifactId)fail('UNREVIEWED_FORMULA');
 let state='KNOWN',value=null,passed=0,failed=0,excluded=0,applicable=0,reasons=[];
 if(!enabled){state='NOT_EVALUATED';reasons=['FORMULA_DISABLED'];}
 else if(p.indicator==='CONTEXT_QUALITY'){for(const ref of [...inputs.requiredFactRefs,...inputs.selectedFactRefs]){let v;try{v=JSON.parse(ref);}catch{fail('FACT_REF');}if(!Array.isArray(v)||v.length!==5||v[0]!==p.scope.revisionId)fail('MIXED_REVISION');if(!policy.allowedFactRefs.includes(ref))fail('SAFE_404');}applicable=inputs.requiredFactRefs.length;passed=inputs.requiredFactRefs.filter(x=>inputs.selectedFactRefs.includes(x)).length;failed=applicable-passed;if(inputs.manifestState==='UNKNOWN'){state='UNKNOWN';reasons=['MANIFEST_UNKNOWN'];}else if(!applicable||inputs.manifestState==='NOT_APPLICABLE'){state='NOT_APPLICABLE';reasons=['NO_REQUIRED_INPUTS'];}else value=roundRatio(passed,applicable);}
 else{excluded=inputs.checks.filter(x=>x.status==='NOT_APPLICABLE').length;applicable=inputs.checks.length-excluded;passed=inputs.checks.filter(x=>x.status==='PASS').length;failed=inputs.checks.filter(x=>x.status==='FAIL').length;
  for(const s of ['INVALID','UNAVAILABLE','UNKNOWN'])if(inputs.checks.some(x=>x.status===s)){state=s;reasons=[s+'_INPUT'];break;}
  if(state==='KNOWN'){if(!applicable){state='NOT_APPLICABLE';reasons=['NO_APPLICABLE_CHECKS'];}else value=roundRatio(passed,applicable);}}
 const policyDecisionArtifactId=enabled?policy.reviewDecisionArtifactId:null;
 const inputHash=requestHash({scope:p.scope,subject:p.subject,asOf:p.asOf,taxonomyVersion:p.taxonomyVersion,formulaSetVersion:'1.0.0',formulaVersion:p.formulaVersion,inputVersion:p.inputVersion,policyDecisionArtifactId,inputs});
 const score={indicator:p.indicator,state,value,formulaVersion:p.formulaVersion,inputVersion:p.inputVersion,policyDecisionArtifactId,inputs,explanation:{passed,failed,excluded,applicable,rounding:'RATIONAL_HALF_UP_INTEGER',reasons},inputHash};score.resultHash=requestHash(score);return score;
}
function verify(score,p,policy){const expected=evaluate({...p,indicator:score.indicator,formulaVersion:score.formulaVersion,inputVersion:score.inputVersion,inputs:score.inputs},policy);if(!same(score,expected))fail('TAMPERED_SCORE');return true;}
function legacy(score,assessmentArtifactId){if(score.state!=='KNOWN')return {value:null,basis:null};if(typeof assessmentArtifactId!=='string'||!assessmentArtifactId.length)fail('ASSESSMENT_REFERENCE_REQUIRED');return {value:score.value,basis:'quality:'+assessmentArtifactId+':'+score.indicator+':'+score.formulaVersion+':'+score.inputHash};}
function projectEntity(scores){for(const s of scores)if(s.state==='KNOWN'&&(!Number.isInteger(s.value)||s.value<0||s.value>100))fail('INVALID_SCORE');if(!scores.length||scores.some(s=>s.indicator!=='KNOWLEDGE_CONFIDENCE'||s.state!=='KNOWN'))return {materialize:false,reason:'SCORE_UNAVAILABLE'};return {materialize:true,value:Math.min(...scores.map(s=>s.value))};}
function evidencePolicy(classification,{ambiguous=false,corrupt=false}={}){if(corrupt||classification==='INVALID')return {numericAccuracy:null,action:'BLOCK_INVALID'};if(ambiguous)return {numericAccuracy:null,action:'CORRECTION_REQUIRED'};if(!R.categorical.EVIDENCE_QUALITY.includes(classification))fail('EVIDENCE_CLASS');return {numericAccuracy:null,action:['NORMALIZED_ONLY','UNAVAILABLE'].includes(classification)?'REVIEW_WARNING':'REVIEW_REQUIRED'};}
function tokens(s){return [...new Set((s.normalize('NFKC').toLowerCase().match(/[\p{L}\p{N}]+/gu)||[]))];}
function rank(facts,{scope,query,requiredKeys=[],requestedEntities=[],authorized,ready,reviewed=false}){if(!authorized)fail('SAFE_404');if(!ready)fail('NOT_READY');const q=reviewed?tokens(query):[],required=new Set(reviewed?requiredKeys:[]),entities=new Set(reviewed?requestedEntities:[]);
 const eligible=facts.filter(f=>f.approved&&!f.deleted&&!f.archived&&f.valid);
 for(const f of eligible){if(f.organizationId!==scope.organizationId||f.brandId!==scope.brandId)fail('SAFE_404');if(f.revisionId!==scope.revisionId)fail('MIXED_REVISION');}
 const scored=eligible.map(f=>({f,identity:[f.entityType,f.entityId,f.fieldPath,f.valueRevisionId].join('\u0000'),required:required.has(f.key)?1:0,entity:entities.has(f.entityId)?1:0,matches:tokens(f.text).filter(x=>q.includes(x)).length}));
 scored.sort((a,b)=>b.required-a.required||b.entity-a.entity||b.matches-a.matches||order(a.identity,b.identity));return scored.map(x=>x.f);
}
function permitGeneration({authorized,ready,approved,sourceValid,securityAllowed}){return authorized&&ready&&approved&&sourceValid&&securityAllowed;}
module.exports={companySize,historicalSize,vocabulary,country,language,market,evaluate,verify,legacy,projectEntity,evidencePolicy,rank,permitGeneration,roundRatio,copy};
// Trusted subject metadata is supplied by a same-tenant authorized repository lookup.
function validateAttachment(a,subject,policy){
 const d=a.payload.data;authorize({scope:{organizationId:d.organizationId,brandId:d.brandId,revisionId:d.revisionId},asOf:d.asOf},policy);const expected={CANDIDATE:['KNOWLEDGE_EXTRACTION','KNOWLEDGE_CANDIDATE','EXTRACTION_CONFIDENCE'],APPROVED_ENTITY:['KNOWLEDGE_MANAGEMENT','APPROVED_KNOWLEDGE','KNOWLEDGE_CONFIDENCE'],CONTEXT:['CONTEXT_ENGINE','PROMPT_CONTEXT','CONTEXT_QUALITY'],DOCUMENT_METADATA:['DOCUMENT_PROCESSING','STRUCTURED_DOCUMENT',null]}[d.subject.kind];
 if(!expected||a.producingService!==expected[0]||subject.artifactType!==expected[1])fail('PRODUCER_SUBJECT');
 if(a.organizationId!==d.organizationId||a.payload.brandId!==d.brandId||subject.organizationId!==d.organizationId||subject.brandId!==d.brandId)fail('SAFE_404');
 if(a.parentArtifactId!==subject.artifactId||d.subject.subjectArtifactId!==subject.artifactId||a.correlationId!==subject.correlationId||a.conversationId!==subject.conversationId)fail('SUBJECT_LINK');
 if(d.taxonomyVersion!==subject.taxonomyVersion)fail('TAXONOMY_VERSION');
 if(d.revisionId!==subject.revisionId||(['APPROVED_ENTITY','CONTEXT'].includes(d.subject.kind)&&d.revisionId===null))fail('MIXED_REVISION');
 if(!subject.validSubjectKeys.includes(d.subject.subjectKey))fail('SUBJECT_KEY');
 if(d.subject.kind==='APPROVED_ENTITY'&&d.operationId!==subject.publicationOperationId)fail('PUBLICATION_OPERATION');
 if(d.scores.length!==(expected[2]===null?0:1))fail('INDICATOR_COVERAGE');
 if(d.scores.some(x=>x.indicator!==expected[2]))fail('INDICATOR_OWNER');
 const unique=new Set();for(const score of d.scores){if(unique.has(score.indicator))fail('DUPLICATE_INDICATOR');unique.add(score.indicator);verify(score,{scope:{organizationId:d.organizationId,brandId:d.brandId,revisionId:d.revisionId},subject:d.subject,asOf:d.asOf,taxonomyVersion:d.taxonomyVersion},policy);}return true;
}
module.exports.validateAttachment=validateAttachment;
