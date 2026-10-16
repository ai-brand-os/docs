# Conversation Deletion and Data Lifecycle

Effective design: 2026-10-13. Status: proposed documentation/schema design, not implemented. The retention periods below require legal and operational approval before release. [MVP_SCOPE.md](MVP_SCOPE.md) governs feature inclusion; this document governs deletion and retention. Account/Organization erasure is a separate policy, not implied by conversation deletion.

## User-visible deletion and states

An authorized Owner confirms deletion. The API checks tenant membership, conversation ownership and current state, then atomically sets `Conversation.deletedAt` once and creates one durable `ConversationPurge` record. A successful DELETE returns 204 only after this transaction commits. That timestamp means **pending physical deletion**, not completed erasure. Repeated authorized DELETE requests return 204 while the tombstone or purge receipt exists, without changing the timestamp or restarting the deadline. Unauthorized or unknown IDs return a non-disclosing 404. Purge receipts are not a normal user content API.

From commit onward, normal list/history/search, message/artifact reads, feedback writes, generation, retrieval, operations on conversation-derived Brief copies, memory lookup, exports and downloads must not expose the conversation or its messages. Every nested route checks its conversation’s `deletedAt`, not just list filters. There is no user restore/undo operation in MVP. Browser views and caches are invalidated; retained data is accessible only to narrowly authorized purge/exception operators. Already delivered content on a user’s device cannot be recalled. Independently approved Brand Brief/knowledge access is unaffected by deleting a Conversation.

Requests in progress must recheck deletion under the same row-lock/transaction serialization used for deletion before committing messages, artifacts, feedback or memory. Stream delivery must check the tombstone before emitting further content and terminate on deletion. A provider task is cancelled where possible; late output is discarded and transient buffers cleaned. Publication/download gateways must recheck deletion, so previously issued URLs cannot bypass the tombstone. Future exports must use revocable access; a non-revocable presigned URL cannot satisfy immediate inaccessibility.

Conversation states: `Active → Pending physical deletion → Physically removed from active systems`. A terminal MessageStatus belongs to one assistant attempt and never closes the persistent multi-turn container; see [Workspace State Management](prd/02_AI_WORKSPACE_PRD.md#state-management). Failure or approved retention exception keeps data inaccessible; it never returns to Active. `ConversationPurge.status` records PENDING, RUNNING, RETRY_REQUIRED, BLOCKED, EXCEPTION, or COMPLETED independently of user visibility. COMPLETED means verified active-system removal of conversation-owned data, **not backup erasure**.

## Retention matrix — proposed, awaiting approval

| Data class                                                                                         | On deletion commit                                 | Active-system removal / retention proposal                                | Scope and safeguards                                                                                                                                                                                     |
| -------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Conversation, messages, conversation-specific feedback                                             | All normal access blocked                          | Remove within 30 days of original `deletedAt`                             | Physical Conversation removal cascades Messages and Feedback; explicit purge may remove Messages earlier.                                                                                                |
| Generation artifacts: Prompt Context, Prompt, Response, generation errors/retries                  | Access and retrieval blocked                       | Same 30-day target                                                        | Explicit `Artifact.conversationId`; never delete by correlation or recursive ancestry alone. Includes prompts and copied knowledge context, not the source knowledge itself.                             |
| Working memory, caches, indexes, temporary payloads and queued/in-flight tasks                     | Invalidate/deny access; stop publication           | Same 30-day target, preferably immediately                                | Delete all conversation-keyed operational memory and derived indexes. Future conversation memory inherits this lifecycle. Knowledge Memory referencing approved Brand Brain facts is preserved.          |
| Exported files, render snapshots, derivative previews if applicable                                | Revoke gateways/links and stop jobs                | Same 30-day target including object versions/replicas                     | Phase 2 only; no ExportJob in MVP. Add export resources to the purge inventory before launching exports.                                                                                                 |
| Imported Documents, candidate/approved Brand Brain knowledge, versions and shared source artifacts | Unchanged by conversation deletion                 | Governed by independent knowledge/source policy                           | Retain because independent workflows depend on them. Do not erase through a generation artifact’s parent, retrieved context, sourceArtifactId, Document or KnowledgeIndex reference.                     |
| Minimal deletion receipt and content-free security/operational audit                               | Restricted access                                  | Proposed 180 days after completion; then expire                           | Store identifiers, timestamps, status, attempt count, bounded safe error codes and exception reference. No prompt, response, source excerpts, full payloads or raw error text. Duration awaits approval. |
| Backup snapshots                                                                                   | Not immediately erased; unavailable to normal APIs | Proposed maximum 90 days from snapshot creation, including replica copies | Separate approval required. Last pre-deletion snapshot can retain data until its own expiry. Restores must reapply deletion ledger before becoming accessible.                                           |

“Within 30 days” is a proposed active-system target, not an approved legal commitment. Legal/operational sign-off must define jurisdiction, processors, storage versions, provider logging/deletion capabilities and verification. Provider-side retained request data must have an approved retention/deletion arrangement; sending a delete request does not itself prove provider erasure. No processor may be silently excluded from the inventory or completion evidence.

Backup expiry is independent of the 30-day target. Proposed maximum 90-day snapshot lifetime does not mean 90 days after purge: each snapshot expires by its creation date plus 90 days. Copies and archived backups must not renew the original lifetime. No immediate backup erasure is promised. An encrypted, access-restricted deletion ledger survives at least the oldest restorable backup plus a proposed 7-day restore-validation margin; its exact lifetime and handling of any held backup await approval. Restore into quarantine, replay deletion and hold rules, remove affected active data, verify, then allow serving traffic. Replay must occur even if a ConversationPurge row was not present in the restored snapshot.

## Ownership, sharing and authorization

New generation artifacts are exclusively owned by one Conversation through `conversationId`; the application requires this for PROMPT_CONTEXT, PROMPT, RESPONSE and their failed/retry variants. Imported knowledge/source artifacts have no conversation owner. `Message.responseArtifactId` is an explicit restricted FK. Services validate same Organization, expected artifact type and same conversation owner at write time; the UUID FK alone cannot prove these constraints. Imported/approved knowledge must never acquire conversationId merely because it was retrieved. A purge checks both ownership and generation type/producer before deleting; misclassified source/knowledge ownership blocks repair rather than authorizing erasure. Existing rows require reviewed ownership backfill and FK validation before this lifecycle can be enabled; unmapped generation rows fail closed for normal artifact access and block erasure verification.

Ownership and references are different: reading a shared approved fact does not transfer its ownership. A purge inventories explicit ownership, message references, operational resource keys and external inventory, then checks reverse references including Artifact children, Document.latestArtifactId, business sourceArtifactId, KnowledgeIndex.latestArtifactId, BrandBrainRevision.artifactId and historical/current JSON evidence/derivation references per KNOWLEDGE_PROVENANCE.md, and other retained workflows. Correlation IDs trace execution; they are not deletion boundaries. All reference-creating writers must reject references to generation artifacts whose owner is pending deletion and serialize reference checks with purge (lock referenced rows or equivalent transaction safeguards), including polymorphic application-enforced references. A preflight scan without write coordination is insufficient. Never walk upward deleting source parents or downward deleting arbitrary shared descendants.

Generation artifacts must not be shared directly across conversations in new writes. Reusing content requires a separately owned copy with explicit provenance, not a foreign conversation’s artifact reference. If legacy sharing, mismatched tenant ownership or missing ownership is found, mark BLOCKED, alert operators and reconcile references. Preserve legitimate independent knowledge, but remove/redact the deleted conversation’s copied payload where safe. Detachment or redaction requires reviewed migration semantics and provenance repair; do not silently null an owner or delete a shared object. An unresolved dependency cannot be counted as successful erasure.

User deletion uses tenant-scoped Owner authorization. Purge workers use a dedicated service identity and fetch the durable request by both organizationId and conversationId; they validate ownership of every resource and operate only on the approved manifest. Worker authority is independent of whether the requester later loses login access, but does not authorize deletion of another tenant’s data. Direct hard-deletion endpoints, broad organization cascades and unscoped artifact deletes are prohibited for this workflow.

## Purge execution, failures and exceptions

1. The deletion transaction writes the tombstone and uniquely keyed purge request. `requestedAt` is the original deletedAt; `targetPurgeAt` is that instant plus 30 elapsed days under the proposed policy. Dispatch after commit; a scanner discovers PENDING and retryable work if queue publication fails.
2. A worker claims a lease using status/lockedAt and a fencing leaseToken checked on every destructive step/status update, validates tenant and tombstone, builds a resource manifest, and prevents generation/publication from recreating owned data. Check approved holds before destructive steps.
3. Revoke access and delete operational memory, caches/search/vector indexes, tasks, transient payloads and external objects. Record safe, content-free step evidence. Missing resources count as already removed only after scope checks; other errors do not.
4. In a transaction, delete Messages (Feedback cascades), then exclusively owned generation artifacts child-before-parent. Artifact lineage and Message→Artifact FKs use Restrict. Unexpected retained references block rather than cascade into other workflows. Finally delete the Conversation; remaining Message/Feedback cascades are a safety net. Recheck for any owned artifacts before removing the parent.
5. Reconcile external inventory and database absence. Mark the independent purge receipt COMPLETED only after all required resources are verified absent; record completedAt. A crash after row deletion but before receipt update resumes external verification using the request and non-content manifest. A missing parent row alone is not completion proof.

The manifest lives in restricted operational storage, contains opaque resource identifiers and step state, never copies user content, and follows receipt retention. Purge request storage is independent of the Conversation so final erasure cannot delete retry evidence. Scheduler recovery must handle an expired worker lease. Retries are idempotent with bounded exponential backoff; proposed schedule 1 minute, 5 minutes, 30 minutes, 2 hours, then at most daily, with no backoff allowed to silently postpone the target. If overdue, continue recovery attempts and incident escalation until verified completion or an approved exception; do not abandon remaining deletion work. Each claim increments attemptCount; failures set RETRY_REQUIRED and nextAttemptAt plus a safe lastErrorCode. Retry budget exhaustion or dependency conflicts set BLOCKED and alert Operations; operator repair can requeue without clearing deletedAt or extending targetPurgeAt. Alert on unfinished jobs older than proposed 24 hours and escalate before the 30-day target. Exceeding the target is a recorded incident, not automatic completion or an invented retention exception.

Legal holds or other approved statutory/security retention exceptions must be explicit, narrow, documented and time-bounded where permitted. Record exceptionRef and reviewAt, legal authority/reason outside content logs, responsible approver, affected resources and expiry/review requirements. Status EXCEPTION preserves denial of normal access; purge unaffected resources where possible. Reassess at least every proposed 30 days, and resume remaining purge promptly on release. A hold may override the target only with approved legal/operational justification; retry failure is not a hold. The receipt must distinguish delayed/excepted removal from completed removal. Separate knowledge deletion requests and account erasure require their own authorized inventory and policy.

## Sequence diagram

```mermaid
sequenceDiagram
    actor Owner
    participant API as Workspace API
    participant DB as Database
    participant Queue as Queue / Recovery Scanner
    participant Worker as Purge Worker
    participant Stores as Memory / Indexes / Object Stores
    Owner->>API: Confirm DELETE conversation
    API->>DB: Tenant/Owner check; lock Conversation
    API->>DB: Transaction: deletedAt + unique purge request
    DB-->>API: Commit
    API-->>Owner: 204; hidden immediately, erasure pending
    API->>Queue: Dispatch committed request
    Note over API,DB: All content routes and late writes reject deletedAt != null
    Queue->>Worker: Claim request (scanner recovers missed dispatch)
    Worker->>DB: Validate tenant, ownership, references and holds
    alt Approved retention exception
        Worker->>DB: EXCEPTION + reference + reviewAt
        Note over API,Stores: Normal access remains denied
    else No exception
        Worker->>Stores: Remove owned memory/indexes/files; verify
        Worker->>DB: Messages/Feedback; owned artifacts child-first; Conversation
        Worker->>Stores: Reconcile all external resource absence
        alt Verified active-system removal
            Worker->>DB: COMPLETED + completedAt; minimal independent receipt
        else Failure or protected dependency
            Worker->>DB: RETRY_REQUIRED or BLOCKED; preserve evidence
            Worker->>Queue: Retry / alert Operations
        end
    end
    Note over DB,Stores: Proposed active removal ≤30 days; backups expire separately
```

## Acceptance-test scenarios — required implementation validation, not test results

| Scenario                                        | Expected assertion                                                                                                                                                                                                           |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Owner deletes a populated Conversation          | Transaction commits tombstone + one purge request; list, detail, nested Message, artifact, feedback, retrieval, generation and download operations no longer expose content. UI confirmation says pending permanent removal. |
| Another tenant probes ID or calls DELETE        | Non-disclosing 404; no tombstone, job, resource lookup leakage or purge mutation.                                                                                                                                            |
| Repeated/concurrent authorized DELETE           | One request keyed by conversationId; stable deletedAt/requestedAt/targetPurgeAt; 204 while receipt exists. Unknown IDs remain 404.                                                                                           |
| Generation/feedback races deletion              | Lock/transaction serialization and stream recheck prevent content publication or writes after deletion commit; late provider output discarded.                                                                               |
| Queue dispatch fails after commit               | Data stays inaccessible; scanner queues durable PENDING request. Crash before commit leaves neither tombstone nor request.                                                                                                   |
| Purge ordinary Conversation                     | Messages and Feedback removed; owned prompt/context/response/error artifacts, working memory, caches/indexes and applicable files verified absent; receipt survives.                                                         |
| Artifacts depend on imported Brand Brain facts  | Purge only conversation-owned copies; source Document, approved knowledge, version history, KnowledgeIndex and another conversation remain valid.                                                                            |
| Legacy shared artifact or cross-tenant mismatch | Restrict/reference check blocks unsafe deletion; BLOCKED + alert; no shared knowledge or other tenant mutation.                                                                                                              |
| Worker crashes after partial file/DB cleanup    | Idempotent retry tolerates scoped missing resources; resumes inventory even if Conversation is gone; COMPLETED only after reconciliation.                                                                                    |
| Failed purge, expired lease, target overdue     | Recover/retry from durable request; no user visibility; safe failure metadata, escalation, unchanged deadline; never mark completed merely on timeout.                                                                       |
| Approved hold and later release                 | EXCEPTION with reviewAt/reference; retained data inaccessible; unaffected resources removed; release resumes remaining work without treating failure as a hold.                                                              |
| Backup still exists after active purge          | Completion wording excludes backups; backup expires under independently approved schedule; restore replays deletion ledger before any API is enabled.                                                                        |
| Future export link/worker exists                | Tombstone revokes gateway even for old links; queued export cancelled, late upload cleaned; object versions removed before completion.                                                                                       |
| Unmapped historical generation artifact         | Ownership backfill/reconciliation fails closed; cannot claim full erasure or mass-delete a correlation chain.                                                                                                                |

## Policy and operational decisions awaiting approval

| Decision                                        | Required approval              | Proposed baseline / unresolved detail                                                                                                             |
| ----------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Active-system removal target                    | Legal + Operations + Product   | 30 days from deletion commit; inventory and processor obligations must be confirmed.                                                              |
| Backup expiry and restore ledger                | Legal + Operations/Security    | 90 days from snapshot creation; ledger survives restorable window + 7 days; actual schedules and held-copy handling unresolved.                   |
| Audit/receipt duration and allowed fields       | Legal + Security + Operations  | 180 days after completion; approve minimization, identifiers, access and exceptions.                                                              |
| Holds and other retention exceptions            | Legal + Security + Operations  | Approvers, legal bases, review/release procedures; proposed 30-day review cadence.                                                                |
| Purge retry and incident operations             | Operations + Engineering       | Backoff, leases, retry budget, 24-hour alert, target breach escalation, evidence and ownership backfill before deployment.                        |
| External providers and future exports           | Legal + Engineering/Operations | Processor-side retention, revocable downloads, object versions and evidence before enabling those paths.                                          |
| Independent source/approved-knowledge retention | Legal + Product + Operations   | Conversation deletion preserves shared knowledge; no universal “never erased” promise. Define separate deletion requests and retention schedules. |

No proposed interval is represented as approved or implemented. This task changes documentation and planned Prisma relationships only; it does not deploy a worker, execute a purge, or erase backups.

## Design verification record — historical before Task 08

Relative document links and heading anchors pass checks, `git diff --check` passes, and static schema checks confirm exclusive generation ownership, restricted artifact/parent/root relationships, Message/Feedback cascades, and a Conversation-independent purge receipt. The updated models and relations pass installed Prisma 7.8.0 validation on a temporary copy with only the pre-existing datasource URL line omitted. The committed schema retains its existing configuration syntax; the known Prisma version/configuration mismatch remains separate engineering work. Acceptance scenarios above are specifications, not executed runtime tests. No database migration or purge was performed.

## Task 08 validation update

[ADR-009](domain/08_BACKEND_AUTH_AND_CONSTRAINTS_ADR.md) supersedes the prior schema-level datasource URL workaround. Exact schema.prisma validates with installed Prisma 7; SQL constraints were tested against generated DDL in private PostgreSQL and rolled back. Current planned schema also includes AuthSession security state; no user-facing feature or identity vendor is added. Historical validation records above describe earlier schema versions; [TASK08_RESULTS.md](validation/TASK08_RESULTS.md) records current commands/results. Production migrations and runtime behavior remain unverified.
