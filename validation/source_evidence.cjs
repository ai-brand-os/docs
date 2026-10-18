'use strict';
// Offline byte/map/anchor contract helpers; no parser, object gateway or production authorization.
const {createHash}=require('node:crypto');
const {TextDecoder}=require('node:util');
const {requestHash}=require('./artifact_compatibility.cjs');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const hashText=text=>{if(!scalar(text))throw Error('UNICODE_INVALID');return sha(Buffer.from(text,'utf8'));};
const scalar=text=>!/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u.test(text);
const decode=bytes=>{const value=new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(bytes);if(!scalar(value))throw Error('UNICODE_INVALID');return value;};
const equal=(a,b)=>requestHash(a)===requestHash(b);
function authorize(m,c){if(!c.authorized||m.organizationId!==c.organizationId||m.brandId!==c.brandId)throw Error('SAFE_404');}
function representation(m,ref){const r=m.representations.find(r=>r.representationId===ref.representationId);if(!r||r.contentSha256!==ref.contentSha256)throw Error('REPRESENTATION_INVALID');return r;}
function content(m,ref,store,c){authorize(m,c);const r=representation(m,ref),entry=store[r.representationId];if(!entry||entry.availability==='UNKNOWN')throw Error('SOURCE_UNKNOWN');if(entry.availability!=='RETAINED')throw Error('SOURCE_UNAVAILABLE');if(entry.organizationId!==c.organizationId||entry.brandId!==c.brandId)throw Error('SAFE_404');const bytes=Buffer.from(entry.base64,'base64');if(sha(bytes)!==r.contentSha256||bytes.length!==r.byteLength)throw Error('DIGEST_MISMATCH');return {r,bytes,text:r.encoding==='UTF8'?decode(bytes):null};}
function readSpan(m,s,store,c){const {r,bytes,text}=content(m,s,store,c);if(r.encoding!=='UTF8'||text===null)throw Error('NOT_TEXT');if(!Number.isSafeInteger(s.start)||!Number.isSafeInteger(s.end)||s.start<0||s.end<=s.start)throw Error('RANGE_INVALID');let value;
 if(s.unit==='UNICODE_CODE_POINT'){const cp=Array.from(text);if(s.end>cp.length)throw Error('RANGE_INVALID');value=cp.slice(s.start,s.end).join('');}
 else if(s.unit==='UTF8_BYTE'){if(s.end>bytes.length)throw Error('RANGE_INVALID');decode(bytes.subarray(0,s.start));decode(bytes.subarray(0,s.end));value=decode(bytes.subarray(s.start,s.end));}
 else throw Error('UNIT_INVALID');
 if(s.quote!==null&&s.quote!==value)throw Error('QUOTE_MISMATCH');return value;
}
const cpSpan=(r,start,end,quote=null)=>({representationId:r.representationId,contentSha256:r.contentSha256,start,end,unit:'UNICODE_CODE_POINT',quote});
function validateManifest(m,store,c){authorize(m,c);const ids=m.representations.map(r=>r.representationId);if(new Set(ids).size!==ids.length||m.representations.filter(r=>r.kind==='SOURCE').length!==1)throw Error('REPRESENTATION_INVALID');
 const visit=(id,path=[])=>{if(path.includes(id))throw Error('LINEAGE_CYCLE');const r=m.representations.find(r=>r.representationId===id);if(!r)throw Error('REFERENCE_INVALID');for(const parent of r.parentRepresentationIds)visit(parent,[...path,id]);};
 for(const r of m.representations){visit(r.representationId);if(r.kind==='SOURCE'&&r.parentRepresentationIds.length)throw Error('SOURCE_PARENT');if(r.kind!=='SOURCE'&&!r.parentRepresentationIds.length)throw Error('MISSING_PARENT');if(store[r.representationId]?.availability==='RETAINED')content(m,r,store,c);if(r.encoding==='UTF8'&&r.coordinateSystem!=='UNICODE_CODE_POINT')throw Error('UNIT_INVALID');const as=r.anchors.map(a=>a.anchorId);if(new Set(as).size!==as.length)throw Error('ANCHOR_INVALID');}
 for(const t of m.transforms){const r=m.representations.find(r=>r.representationId===t.outputRepresentationId);if(!r||!equal(r.transform,t.implementation)||!equal([...r.parentRepresentationIds].sort(),[...t.inputRepresentationIds].sort()))throw Error('TRANSFORM_VERSION');if(store[r.representationId]?.availability!=='RETAINED')continue;
  const output=content(m,r,store,c).text;if(output===null)throw Error('NOT_TEXT');let cursor=0;
  for(const seg of t.segments){if(seg.outputStart!==cursor||seg.outputEnd<=cursor||seg.outputEnd>Array.from(output).length)throw Error('MAP_PARTITION');cursor=seg.outputEnd;if(seg.relation==='GAP'&&seg.inputSpans.length||seg.relation!=='GAP'&&!seg.inputSpans.length)throw Error('MAP_INPUT');for(const s of seg.inputSpans){if(!t.inputRepresentationIds.includes(s.representationId))throw Error('MAP_PARENT');if(store[s.representationId]?.availability==='RETAINED')readSpan(m,s,store,c);}
   if(seg.relation==='TRANSFORMED'&&seg.inputSpans.every(s=>store[s.representationId]?.availability==='RETAINED')){const before=seg.inputSpans.map(s=>readSpan(m,s,store,c)).join(''),after=Array.from(output).slice(seg.outputStart,seg.outputEnd).join('');const id=t.implementation.id;let replay;if(id==='fixture.nfc')replay=before.normalize('NFC');else if(id==='fixture.whitespace')replay=before.replace(/ +/g,' ');else if(id==='fixture.crlf')replay=before.replace(/\r\n/g,'\n');else if(id==='fixture.html-parser')replay=before.replace(/&amp;/g,'&');else throw Error('TRANSFORM_UNVERIFIABLE');if(replay!==after)throw Error('TRANSFORM_MISMATCH');}
   if(seg.relation==='EXACT'){if(seg.inputSpans.length!==1)throw Error('MAP_EXACT');const s=seg.inputSpans[0];if(store[s.representationId]?.availability==='RETAINED'&&readSpan(m,s,store,c)!==Array.from(output).slice(seg.outputStart,seg.outputEnd).join(''))throw Error('MAP_EXACT');}
  }
  if(cursor!==Array.from(output).length)throw Error('MAP_PARTITION');for(const s of t.omittedInputSpans){if(!t.inputRepresentationIds.includes(s.representationId))throw Error('MAP_PARENT');if(store[s.representationId]?.availability==='RETAINED')readSpan(m,s,store,c);}
 }
 for(const r of m.representations.filter(r=>r.kind!=='SOURCE'))if(m.transforms.filter(t=>t.outputRepresentationId===r.representationId).length!==1)throw Error('TRANSFORM_MISSING');
}
function traceSpan(m,s,store,c,path=[]){readSpan(m,s,store,c);const r=representation(m,s);if(path.includes(r.representationId))throw Error('LINEAGE_CYCLE');if(r.kind==='SOURCE')return {complete:true,spans:[s],coarse:false};if(s.unit!=='UNICODE_CODE_POINT')throw Error('MAP_UNIT');const t=m.transforms.find(t=>t.outputRepresentationId===r.representationId);if(!t)return {complete:false,spans:[],coarse:false};let complete=true,coarse=false,spans=[];
 for(const seg of t.segments){const start=Math.max(s.start,seg.outputStart),end=Math.min(s.end,seg.outputEnd);if(start>=end)continue;if(seg.relation==='GAP'){complete=false;continue;}if(seg.relation==='TRANSFORMED'&&(start!==seg.outputStart||end!==seg.outputEnd)){complete=false;continue;}
  for(const input of seg.inputSpans){let selected={...input,quote:null};if(seg.relation==='EXACT'){if(input.unit!=='UNICODE_CODE_POINT')throw Error('MAP_UNIT');selected.start=input.start+start-seg.outputStart;selected.end=input.start+end-seg.outputStart;}else coarse=true;
   const part=traceSpan(m,selected,store,c,[...path,r.representationId]);complete=complete&&part.complete;coarse=coarse||part.coarse;spans.push(...part.spans);
  }
 }
 return {complete,spans,coarse};
}
function validateLocator(m,l,store,c){authorize(m,c);
 if(l.kind==='UNAVAILABLE'){representation(m,l.representation);return {classification:'UNAVAILABLE',reason:l.reason};}
 if(l.kind==='STRUCTURAL_SECTION'){const {r,text}=content(m,l.representation,store,c),a=r.anchors.find(a=>a.anchorId===l.anchorId);if(!a||a.visibility==='EXCLUDED')throw Error('ANCHOR_INVALID');if(a.range&&text!==null)readSpan(m,cpSpan(r,a.range.start,a.range.end),store,c);return {classification:'VERIFIED_STRUCTURAL',reason:null};}
 const s=l.span||l.textSpan;readSpan(m,s,store,c);const r=representation(m,s);
 if(l.kind==='NORMALIZED_ONLY'){if(!['NORMALIZED','CHUNK'].includes(r.kind))throw Error('REPRESENTATION_KIND');return {classification:'NORMALIZED_ONLY',reason:l.originalUnavailableReason};}
 if(l.kind==='TEXT_SPAN'){const trace=traceSpan(m,s,store,c);return {classification:trace.complete?(trace.coarse?'VERIFIED_STRUCTURAL':'VERIFIED_EXACT'):'NORMALIZED_ONLY',reason:trace.complete?null:'MAPPING_LOST',originalSpans:trace.spans};}
 if(['PDF_PAGE_SPAN','HTML_ELEMENT_OR_TEXT_SPAN'].includes(l.kind)){
  const src=content(m,l.source,store,c).r,a=r.anchors.find(a=>a.anchorId===l.anchorId);if(src.kind!=='SOURCE'||!a||!equal(r.transform,l.parser)||!r.parentRepresentationIds.includes(src.representationId))throw Error('ANCHOR_INVALID');
  if(a.range&&(s.unit!=='UNICODE_CODE_POINT'||s.start<a.range.start||s.end>a.range.end))throw Error('ANCHOR_RANGE');
  if(l.kind==='PDF_PAGE_SPAN'){
   if(m.capture.format!=='PDF'||l.pageNumber<1||l.pageNumber>m.capture.pdfPageCount||a.pageNumber!==l.pageNumber)throw Error('PAGE_INVALID');if(a.readingOrder==='AMBIGUOUS')return {classification:'UNAVAILABLE',reason:'AMBIGUOUS_ORDER'};
   if(l.bbox!==null){if(!equal(l.bbox,a.bbox)||l.bbox.x+l.bbox.width>l.bbox.pageWidth||l.bbox.y+l.bbox.height>l.bbox.pageHeight)throw Error('BBOX_INVALID');}
  }else{if(m.capture.format!=='HTML'||a.kind!=='HTML_ELEMENT'||a.visibility!=='VISIBLE'||l.elementId!==null&&l.elementId!==a.anchorId||l.displayUrl!==null&&l.displayUrl!==m.capture.finalUrl)throw Error('HTML_ANCHOR_INVALID');}
  return {classification:'VERIFIED_EXACT',reason:null};
 }
 throw Error('LOCATION_KIND');
}
function validateBinding(m,b,store,c){authorize(m,c);if(!c.authorized||b.organizationId!==c.organizationId||b.brandId!==c.brandId)throw Error('SAFE_404');if(b.sourceArtifactId!==m.sourceArtifactId||b.sourceDocumentId!==m.sourceDocumentId||b.correlationId!==m.correlationId)throw Error('REFERENCE_INVALID');
 if(c.mode!=='HISTORY'&&(c.closed||c.selectedCandidateArtifactId!==b.candidateArtifactId))throw Error('STALE_RESULT');
 const expected=c.legacyEvidence.map(requestHash).sort(),actual=b.entries.map(e=>e.legacyEvidenceHash).sort();if(!equal(expected,actual)||new Set(actual).size!==actual.length||new Set(b.entries.map(e=>e.evidenceId)).size!==b.entries.length)throw Error('BINDING_COVERAGE');
 validateManifest(m,store,c);let results=[];
 for(const e of b.entries){const quotes=e.locators.map(l=>(l.span||l.textSpan)?.quote).filter(q=>q!==undefined&&q!==null);if(e.support.literalTexts.some(t=>!quotes.includes(t)))throw Error('UNSUPPORTED_QUOTATION');}
 for(const e of b.entries)for(const l of e.locators){try{results.push(validateLocator(m,l,store,c));}catch(err){if(['SOURCE_UNAVAILABLE','SOURCE_UNKNOWN'].includes(err.message))results.push({classification:'UNAVAILABLE',reason:err.message==='SOURCE_UNKNOWN'?'SOURCE_AVAILABILITY_UNKNOWN':'SOURCE_DELETED'});else throw err;}}
 const source=m.representations.find(r=>r.kind==='SOURCE'),sourceRetained=store[source.representationId]?.availability==='RETAINED';
 const classification=results.some(r=>r.classification==='UNAVAILABLE')?'UNAVAILABLE':results.some(r=>r.classification==='NORMALIZED_ONLY')?'NORMALIZED_ONLY':results.some(r=>r.classification==='VERIFIED_STRUCTURAL')?'VERIFIED_STRUCTURAL':'VERIFIED_EXACT';
 const unsupportedMeaning=b.entries.some(e=>e.support.kind==='INTERPRETED'||e.support.kind!=='LITERAL'&&e.support.proposedInterpretation!==null),meaningWarning=b.entries.some(e=>e.support.kind==='UNRESOLVED'||e.support.ambiguityFlags.length>0);
 return {classification,originalAvailability:store[source.representationId]?.availability||'UNKNOWN',reviewDisposition:!sourceRetained&&c.mode!=='HISTORY'||unsupportedMeaning?'CORRECTION_REQUIRED':meaningWarning||['NORMALIZED_ONLY','UNAVAILABLE'].includes(classification)?'REVIEW_WARNING':'REVIEW_ALLOWED',approvalStatus:'PENDING_REVIEW',results};
}
function preserveLiteral(literal,kind){return {literal,currency:null,isoDate:null,interpretation:kind==='CURRENCY'||kind==='DATE'?'UNRESOLVED':'LITERAL'};}
module.exports={sha,hashText,scalar,decode,readSpan,cpSpan,validateManifest,traceSpan,validateLocator,validateBinding,preserveLiteral};
