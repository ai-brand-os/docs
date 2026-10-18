'use strict';
// Conformance reference helpers; callers still require real authorization/transactions.
const { createHash } = require('node:crypto');
const sha = value => createHash('sha256').update(value, 'utf8').digest('hex');
function stableJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(stableJson).join(',') + ']';
  return '{' + Object.keys(value).sort().map(k => JSON.stringify(k) + ':' + stableJson(value[k])).join(',') + '}';
}
function requestHash(dto) { return sha(stableJson(dto)); }
function retryDisposition(existing, incoming) {
  // Existing is fetched only under the same Organization/Brand/actor/operation-kind/key scope.
  if (!existing) return 'NEW';
  if (existing.requestHash !== incoming.requestHash) return 'CONFLICT';
  return 'REPLAY';
}
function readVersion(header) {
  if (header.schemaVersion === '2.0.0') return { classification: 'CURRENT_REQUIRES_VALIDATION' };
  if (header.schemaVersion !== '1.0.0') return { classification: 'UNSUPPORTED_VERSION' };
  const statuses={Created:'CREATED',Valid:'VALID',Invalid:'INVALID',Superseded:'SUPERSEDED',Archived:'ARCHIVED'};
  const status=statuses[header.status] || header.status;
  if (!['CREATED','VALID','INVALID','SUPERSEDED','ARCHIVED'].includes(status)) return { classification: 'LEGACY_QUARANTINE' };
  return { classification: 'LEGACY_OPAQUE', status, artifactId: header.artifactId || header.id,
    generationEligible: false, writable: false };
}
module.exports = { requestHash, retryDisposition, readVersion };
