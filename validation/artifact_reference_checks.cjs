'use strict';
// Offline conformance checks over a trusted lookup fixture, not authorization or a DB transaction.
function referenceErrors(artifact, lookup) {
  const errors = [];
  const add = (path, code) => errors.push({ path, code });
  const check = (id, kinds, path, types) => {
    if (id === null || id === undefined) return null;
    const record = lookup(id);
    if (!record) { add(path, 'REFERENCE_MISSING'); return null; }
    if (!kinds.includes(record.kind)) add(path, 'REFERENCE_KIND');
    if (record.organizationId !== artifact.organizationId) add(path, 'REFERENCE_TENANT');
    if (record.brandId && record.brandId !== artifact.payload.brandId) add(path, 'REFERENCE_BRAND');
    if (types && !types.includes(record.artifactType)) add(path, 'REFERENCE_ARTIFACT_TYPE');
    return record;
  };
  check(artifact.organizationId, ['Organization'], '/organizationId');
  check(artifact.payload.brandId, ['Brand'], '/payload/brandId');
  const parent = check(artifact.parentArtifactId, ['Artifact'], '/parentArtifactId');
  if (parent) {
    if (artifact.conversationId && parent.conversationId && parent.conversationId !== artifact.conversationId)
      add('/parentArtifactId', 'REFERENCE_CONVERSATION');
    if (!artifact.conversationId && parent.conversationId) add('/parentArtifactId', 'GENERATION_AS_KNOWLEDGE');
    if (parent.correlationId !== artifact.correlationId && artifact.artifactType !== 'PROMPT_CONTEXT' && !['manual_commit', 'publication_attempt'].includes(artifact.payload.variant))
      add('/parentArtifactId', 'CORRELATION_MISMATCH');
  }
  const conversation = check(artifact.conversationId, ['Conversation'], '/conversationId');
  if (conversation && conversation.deletedAt !== null) add('/conversationId', 'CONVERSATION_DELETED');
  const refs = {
    sourceDocumentId: ['Document'], sourceArtifactId: ['Artifact', ['RAW_INTAKE', 'STRUCTURED_DOCUMENT']],
    candidateArtifactId: ['Artifact', ['KNOWLEDGE_CANDIDATE']], contextArtifactId: ['Artifact', ['PROMPT_CONTEXT']],
    promptArtifactId: ['Artifact', ['PROMPT']], approvedArtifactId: ['Artifact', ['APPROVED_KNOWLEDGE']],
    actorUserId: ['User'], authorUserId: ['User'], parentDocumentId: ['Document'],
  };
  const revisions = new Set(['revisionId', 'baseRevisionId', 'expectedRevisionId', 'resultingRevisionId',
    'valueRevisionId', 'supersedesValueRevisionId', 'verifiedInRevisionId', 'restoredFromRevisionId',
    'competingRevisionId', 'approvedRevisionId']);
  function walk(value, path) {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) { value.forEach((x, i) => walk(x, `${path}/${i}`)); return; }
    for (const [key, val] of Object.entries(value)) {
      if (refs[key]) {
        const [kind, types] = refs[key];
        const target = check(val, [kind], `${path}/${key}`, types);
        if (kind === 'Artifact' && target && value.sourceArtifactId === val && target.conversationId)
          add(`${path}/${key}`, 'GENERATION_AS_EVIDENCE');
        if (target && key === 'sourceArtifactId' && value.sourceDocumentId) {
          const doc = lookup(value.sourceDocumentId);
          if (doc && target.correlationId !== doc.correlationId) add(path, 'SOURCE_DOCUMENT_MISMATCH');
          if (value.sourceLocation && value.sourceLocation.chunkId) {
            const chunks = target.payload && target.payload.data && target.payload.data.chunks;
            if (!chunks || !chunks.some(c => c.chunkId === value.sourceLocation.chunkId && c.parentDocumentId === value.sourceDocumentId))
              add(path, 'SOURCE_CHUNK_MISMATCH');
          }
        }
        if (target && ['contextArtifactId', 'promptArtifactId'].includes(key) && target.conversationId !== artifact.conversationId)
          add(`${path}/${key}`, 'REFERENCE_CONVERSATION');
      } else if (revisions.has(key)) check(val, ['BrandBrainRevision'], `${path}/${key}`);
      walk(val, `${path}/${key}`);
    }
    if (value.kind === 'CANDIDATE') {
      const items = artifact.payload.data && artifact.payload.data.candidateItems;
      if (!items || !items.some(item => item.candidateId === value.candidateId)) add(path, 'RELATIONSHIP_CANDIDATE_MISSING');
    }
    if (value.revisionId && value.factKey) {
      const revision = lookup(value.revisionId);
      const snapshot = revision && lookup(revision.artifactId);
      const facts = snapshot && snapshot.payload && snapshot.payload.data && snapshot.payload.data.facts;
      if (!facts || !facts.some(fact => ['entityType','entityId','fieldPath'].every(key => fact[key] === value.factKey[key])))
        add(path, 'REVISION_FACT_MISSING');
      const pinned = artifact.payload.data && artifact.payload.data.provenance && artifact.payload.data.provenance.approvedRevisionId;
      if (pinned && pinned !== value.revisionId) add(path, 'CONTEXT_REVISION_MIX');
    }
    if (value.entityId && value.entityType) {
      const kind = ({ ORGANIZATION: 'Organization', BRAND: 'Brand', DOCUMENT: 'Document' })[value.entityType] || value.entityType;
      check(value.entityId, [kind], `${path}/entityId`);
    }
    if (value.sourceLocation && value.sourceLocation.characterStart !== undefined &&
        value.sourceLocation.characterEnd < value.sourceLocation.characterStart) add(path, 'LOCATION_RANGE');
  }
  walk(artifact.payload, '/payload');
  const data = artifact.payload.data;
  if (data && data.contextArtifactId) {
    const context = lookup(data.contextArtifactId);
    const c = context && context.payload && context.payload.data;
    if (c && (data.contextVersion !== c.assemblyVersion || data.approvedRevisionId !== c.provenance.approvedRevisionId))
      add('/payload/data', 'PROMPT_CONTEXT_MISMATCH');
  }
  if (data && data.promptArtifactId) {
    const prompt = lookup(data.promptArtifactId);
    const p = prompt && prompt.payload && prompt.payload.data;
    if (p && (data.promptVersion !== p.promptVersion || data.approvedRevisionId !== p.approvedRevisionId))
      add('/payload/data', 'RESPONSE_PROMPT_MISMATCH');
  }
  if (data && artifact.payload.variant === 'candidate_decision' && artifact.parentArtifactId !== data.candidateArtifactId)
    add('/parentArtifactId', 'DECISION_PARENT_MISMATCH');
  if (data && artifact.payload.variant === 'manual_commit' && data.expectedRevisionId) {
    const expected = lookup(data.expectedRevisionId);
    if (expected && expected.artifactId !== artifact.parentArtifactId) add('/parentArtifactId', 'MANUAL_HEAD_PARENT_MISMATCH');
  }
  if (data && artifact.payload.variant === 'approved_snapshot' && parent) {
    if (!['manual_commit','candidate_decision'].includes(parent.payload.variant) || !parent.payload.data ||
        parent.payload.data.resultingRevisionId !== data.revisionId)
      add('/parentArtifactId', 'PUBLICATION_COMMIT_MISMATCH');
  }
  if (data && artifact.payload.variant === 'approved_snapshot') {
    const memberKeys = new Set(data.members.map(x => `${x.entityType}:${x.entityId}`));
    if (memberKeys.size !== data.members.length) add('/payload/data/members', 'DUPLICATE_MEMBER');
    const keys = new Set();
    for (const fact of data.facts) {
      const k = `${fact.entityType}:${fact.entityId}:${fact.fieldPath}`;
      if (keys.has(k)) add('/payload/data/facts', 'DUPLICATE_FACT');
      keys.add(k);
      if (!memberKeys.has(`${fact.entityType}:${fact.entityId}`)) add('/payload/data/facts', 'FACT_NONMEMBER');
    }
    const revision = lookup(data.revisionId);
    if (revision && revision.ontologyVersion !== data.ontologyVersion) add('/payload/data/ontologyVersion', 'REVISION_ONTOLOGY_MISMATCH');
    if (revision && revision.artifactId !== artifact.artifactId) add('/payload/data/revisionId', 'REVISION_ARTIFACT_MISMATCH');
  }
  return errors;
}
module.exports = { referenceErrors };
