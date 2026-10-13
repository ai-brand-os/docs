# Future File Export Design — Phase 2 Proposal

> Approval evidence audit (2026-10-13): [DECISION_REGISTER.md](../DECISION_REGISTER.md). Recorded baseline engineering decisions are preserved. Approved labels do not sign off pending import product choices D-IMP-01/02/03, later integrated PRD revisions, or proposed legal/operational retention periods. Dependency/release gates remain disclosed.

Status: proposed design, excluded from MVP; not implemented. Authority: [MVP_SCOPE.md](../MVP_SCOPE.md).

MVP provides clipboard copying of AI responses and an approved Brand Brief. Neither requires a background job, file renderer, export endpoint, or export storage. No remaining MVP workflow requires ExportJob; it and ExportJobStatus and their User/Conversation relations have been removed from schema.prisma.

If Phase 2 approves file portability, specify background rendering for conversation PDF/DOCX and any separately approved Brief download. This proposal is separate from the MVP schema and must not be applied as an MVP migration.

## Proposed lifecycle and ownership

A future ExportJob would include id, organizationId, brandId, conversationId (optional only if another export type is approved), requestedByUserId, export kind/format, immutable source snapshot or source version references, status, createdAt, startedAt, completedAt, expiresAt, object-storage key, safe failure code, attempt count, and idempotency key. Proposed status values: PENDING, RUNNING, COMPLETED, FAILED, EXPIRED. User and Conversation back-relations would be reintroduced only with approved requirements. Tenant ownership must be validated on creation, job reads, worker execution, and download authorization.

Proposed endpoints: POST /conversations/:id/export to enqueue an authorized snapshot; GET /export-jobs/:id for owner-scoped status; an authorized download endpoint or short-lived signed download URL after completion. These routes are not part of the MVP API. Do not store permanent public fileUrl values.

Workers would render bounded snapshots, upload private files, and transition jobs idempotently. Define retry budgets, cancellation/deletion semantics, expiry cleanup, access revocation, quotas, and sanitization before implementation. Conversation deletion must immediately revoke gateway access and queued work, then remove owned files, snapshots and object versions within the proposed active-system target in [DATA_LIFECYCLE.md](../DATA_LIFECYCLE.md), subject to approval. Download authorization must recheck the tombstone; non-revocable presigned links are insufficient. Export inventories must survive Conversation removal until cleanup verification completes; completion excludes backups. Human-approved knowledge and AI-generated draft responses must remain visibly distinct in rendered files.

## Open future decisions

Product must select initial formats and export kinds; Engineering must select renderer, queue and storage lifecycle; Product and Engineering must approve snapshot fidelity, download lifetime, retry/retention limits, tenant authorization, and deletion behavior. Reintroducing schema models requires a reviewed Phase 2 migration and integration validation; removal from this design repository does not drop any deployed table automatically.
