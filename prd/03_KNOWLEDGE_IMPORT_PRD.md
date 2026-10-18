# AI Brand OS — Knowledge Import PRD

> Scope authority (2026-10-13): [MVP_SCOPE.md](../MVP_SCOPE.md). This document specifies intended behavior; design approval does not establish implementation. Historical decisions and long-term concepts do not expand MVP.

Document: **03_KNOWLEDGE_IMPORT_PRD.md**

Version: **1.1.0 — approval audit working revision**

Status: Proposed — Pending Founder Approval (D-IMP-01/02/03); Engineering Sign-off Blocked

Owner: Product

Priority: P0

Last Updated: 2026-10-13 (audit date; not an approval date)

---

# Purpose

This document defines the **user-facing product experience** of importing knowledge into Brand Brain — both during onboarding and on an ongoing basis afterward.

It is distinct from:

- **What Brand Brain contains** — `01_BRAND_BRAIN_PRD.md`.
- **How the pipeline works internally** — the four Knowledge Engine service specs (`01_INGESTION_SERVICE.md`, `02_DOCUMENT_PROCESSING_SERVICE.md`, `03_KNOWLEDGE_EXTRACTION_SERVICE.md`, `04_KNOWLEDGE_MANAGEMENT_SERVICE.md`).

This PRD is the missing layer between those two: the concrete UX contract (states, requests, review flow) that API Design needs in order to define real endpoints instead of guessing them. Per `domain/04_DATABASE_DESIGN.md`, the schema already reuses the unified `artifacts` table for pipeline history — this document defines how the frontend observes and interacts with that pipeline, not a new storage model.

---

# Problem This PRD Solves

`01_BRAND_BRAIN_PRD.md` fully specifies only one import path: Website URL, during onboarding Step 2. Two gaps exist that would otherwise force API Design to guess:

1. **File upload** (PDF, DOCX, Markdown, Plain Text) is specified by the Ingestion baseline. This PRD proposes its UI/request boundary, with D-IMP-01/03 still pending; parser support does not approve those product choices.
2. **Post-onboarding import** extends the recorded editing baseline. Required knowledge acquisition does not establish approval of a dedicated screen; D-IMP-03 chooses dedicated versus embedded placement.

Without this PRD, API Design would need to invent both — repeating the exact class of mistake already flagged in `04_EXECUTION_BIBLE.md` Known Risks ("PRD approval sequencing").

---

# Scope Decisions — Proposed, Pending Founder Approval

The canonical MVP requires single-source knowledge import. The original granular choices below have no unambiguous recorded Founder approval; they remain proposals even where later specifications adopted them. [DECISION_REGISTER.md](../DECISION_REGISTER.md) records evidence, options, recommended defaults and approvers. Engineering sign-off for this integrated import PRD is blocked until all three have recorded dispositions.

1. **[D-IMP-01](../DECISION_REGISTER.md#d-imp-01) — Proposed — Pending Founder Approval: single-source request limit for MVP (one submitted URL or one supported file per job; no recursive site crawl)** (no batch/multi-file). Matches `01_INGESTION_SERVICE.md` Deferred Features ("Scheduled or batch imports"). Keeps the review UX simple — one set of candidate fields to confirm at a time, not a merge-conflict UI across multiple documents.
2. **[D-IMP-02](../DECISION_REGISTER.md#d-imp-02) — Proposed — Pending Founder Approval: only one import job in-flight per Brand at a time.** Avoids concurrent-pipeline-run complexity in the MVP. A second import attempt while one is running is rejected with a clear message, not queued.
3. **[D-IMP-03](../DECISION_REGISTER.md#d-imp-03) — Proposed — Pending Founder Approval: a dedicated "Knowledge Base" screen** as the proposed post-onboarding entry point for adding more source material. This is new UI surface, not previously specified anywhere — flagging explicitly since it's a genuine scope addition, not just documentation cleanup.

---

# Import Entry Points

## Entry Point 1 — Onboarding (existing, Brand Brain PRD Step 2)

Website URL only. Unchanged from `01_BRAND_BRAIN_PRD.md`. This PRD does not modify onboarding — it only extends the same underlying mechanism to the second entry point below.

## Entry Point 2 — Proposed Knowledge Base Screen (post-onboarding; D-IMP-03 pending)

Proposed dedicated-screen entry point, pending [D-IMP-03](../DECISION_REGISTER.md#d-imp-03). Founder may instead select embedded Brand Brain import/review; the requirement is post-onboarding access, not an already-approved separate screen. The proposed screen would be accessible after onboarding from Brand Brain settings. Supports both Website URL and File upload (PDF, DOCX, Markdown, Plain Text). Triggers the identical pipeline (Ingestion → Document Processing → Knowledge Extraction → Knowledge Management) and the identical Review & Confirm UX as onboarding — no second review pattern is introduced.

---

# Import Job Lifecycle (UX-Facing States)

These states describe the aggregate source import, not a Message, Conversation, individual Artifact or worker lease. [ADR-012](../domain/11_IMPORT_LIFECYCLE_ADR.md) is the canonical deterministic resolver and review-closure specification: **Specified — Pending Product/Architecture Review (D-AUD-07)**. The existing public vocabulary is preserved:

```text
SUBMITTED → VALIDATING → PROCESSING → EXTRACTING → READY_FOR_REVIEW
                                                    ↓
                                                 COMPLETED
Terminal alternatives: FAILED; REJECTED_NO_CANDIDATES
```

COMPLETED requires durable closure after every frozen eligible candidate has a terminal human decision and every accepted item has actual committed publication evidence. Reasons distinguish ALL_ACCEPTED, MIXED_DECISIONS and NOTHING_ACCEPTED. All rejected is not NOTHING_EXTRACTED; successful pipeline with zero eligible candidates closes REJECTED_NO_CANDIDATES. Undecided items keep READY_FOR_REVIEW; full coverage waiting for durable closure is FINALIZING reason, still nonterminal. Incremental item publication remains allowed by Gate 2 and never implies whole-import completion.

The resolver uses all authorized selected attempts, frozen candidate refs, immutable decisions, committed revisions and closure evidence; no latest-row-only inference. [Proposed Artifact2.1 control extension](../contracts/artifacts/2.1.0/README.md), pending D-IMP-LC-01, supplies the missing operation/closure representation in the existing artifacts table. Original Artifact2.0 and Gateway1.0 files stay unchanged. No dedicated authoritative ImportJob/status store is added. Readers/writers cannot enable the proposal without review.

FAILED is terminal only after permanent/exhausted/revoked operation closure. Recoverable failure, partial extraction and expired worker lease remain in their existing phase with a typed reason and bounded retry/recovery action. Terminal operations never reopen; explicit later submission uses a new correlation. Partial extraction after required-model failure never enters review or silently succeeds. No new CANCELLED/EXPIRED/ABANDONED/FINALIZING public status is added.

## Polling Contract

The existing status GET returns the [versioned safe application projection](../contracts/import-lifecycle/README.md): public status/reason, phase, full candidate counts/pending count, retry/action, terminal flag, closure/publication refs and version/ETag. Polling stops only when terminal=true; no client disconnect or navigation event finishes review, cancels work or releases admission. Concrete interval/request timeouts and generic response/error integration remain D-AUD-08/R22; no new polling transport is introduced. The ~30-second import goal is a performance target, not a worker/provider deadline or observed SLA. Manual fallback can appear after the UX wait without cancelling the durable operation.

---

# Review & Confirm Flow

Reuses the exact UX already defined in `01_BRAND_BRAIN_PRD.md` Step 3 (source badges, confidence indicators, per-field edit/confirm/delete) for **both** entry points — onboarding and the new Knowledge Base screen. No second design pattern is introduced.

## Clarifying the Two-Gate Model (implicit in Brand Brain PRD, made explicit here)

There are two independent gates a candidate value passes through, and this PRD makes the distinction explicit since it was previously only implied:

**Gate 1 — Knowledge Management governance** (automatic, per `04_KNOWLEDGE_MANAGEMENT_SERVICE.md`, Policy Engine returns eligibility or rejection for MVP). A candidate is either eligible for human review (legacy label `AutoApproved`, not knowledge approval) or `Rejected` by deterministic rules. Rejected candidates are **never shown to the user** — the corresponding field is simply left empty, consistent with Brand Brain PRD's existing rule: _"Fields with no import match are shown empty."_

**Gate 2 — User confirmation and authoritative persistence** (manual, per Brand Brain PRD FR-3). Only eligible candidates (legacy `AutoApproved` label) reach this gate; they remain unapproved until the authorized Owner confirms. The user still must explicitly confirm, edit, or delete each one — governance approval alone does not count a field as complete toward the Completeness Score or make it retrievable by AI. Confirmation invokes Knowledge Management to atomically create a full approved Artifact snapshot and BrandBrainRevision, persist completeness, update current projections/KnowledgeIndex and switch Brand.currentRevisionId. Field evidence/source location, approval/verification and superseded links follow KNOWLEDGE_PROVENANCE.md. expectedRevisionId and Idempotency-Key prevent concurrent overwrites. Pending candidates remain provisional artifacts. Editing revalidates the candidate before confirmation; deleting it leaves approved state untouched.

This two-gate model was already functionally present in Brand Brain PRD but never named — naming it here prevents a future engineer from assuming governance approval alone is sufficient to populate a field.

---

# Functional Requirements

## FR-1 — Submit Website URL (Onboarding)

Decision dependency: [D-IMP-01](../DECISION_REGISTER.md#d-imp-01). Pending choices are proposed, not Founder-approved.

Unchanged from `01_BRAND_BRAIN_PRD.md` FR-2.

## FR-2 — Submit Website URL (Post-Onboarding)

Decision dependency: [D-IMP-01](../DECISION_REGISTER.md#d-imp-01), [D-IMP-02](../DECISION_REGISTER.md#d-imp-02), [D-IMP-03](../DECISION_REGISTER.md#d-imp-03). Pending choices are proposed, not Founder-approved.

### Description

From the Knowledge Base screen, a user may submit a Website URL at any time, subject to the one-job-in-flight rule.

### Acceptance Criteria

- URL is validated client-side (well-formed) and server-side (reachable) before submission.
- If a job is already in-flight for this Brand, submission is rejected with a clear message naming the in-flight job.
- On success, the user is shown the Job Lifecycle states in real time via polling.

## FR-3 — Submit File Upload

Decision dependency: [D-IMP-01](../DECISION_REGISTER.md#d-imp-01), [D-IMP-02](../DECISION_REGISTER.md#d-imp-02), [D-IMP-03](../DECISION_REGISTER.md#d-imp-03). Pending choices are proposed, not Founder-approved.

### Description

From the Knowledge Base screen, a user may upload a single file (PDF, DOCX, Markdown, or Plain Text).

### Validation Rules

- File type restricted to the four supported formats (client-side check, re-validated server-side by Ingestion Service).
- File size limit is Engineering-owned (per `01_INGESTION_SERVICE.md` — "Maximum file size (configurable, Engineering-owned limit)"), surfaced to the user as a clear pre-upload limit, not a post-submission failure.
- Subject to the same one-job-in-flight rule as FR-2.

### Acceptance Criteria

- Unsupported file types are rejected before upload begins, not after.
- Upload progress is shown distinctly from pipeline processing progress (these are two different waits: transferring bytes vs. the pipeline running).

## FR-4 — Poll Import Job Status

Engineering basis: [D-ENG-01/02](../DECISION_REGISTER.md#preserved-evidence-based-decisions-and-remaining-review-ownership); preserved artifact/application boundary. Detailed state resolver is specified in [ADR-012](../domain/11_IMPORT_LIFECYCLE_ADR.md), pending Product/Architecture review and runtime implementation.

### Description

The frontend polls job status using the Job Lifecycle states defined above.

### Acceptance Criteria

- Each state maps to a distinct, plain-language UI message (no raw pipeline/stage names shown to the user).
- Polling stops only for terminal=true with verified durable closure (`COMPLETED`, `FAILED`, `REJECTED_NO_CANDIDATES`); transient failures remain nonterminal.

## FR-5 — Review & Confirm Extracted Candidates

Existing approval/versioning behavior is task-directed; dedicated placement and admission assumptions depend on [D-IMP-02](../DECISION_REGISTER.md#d-imp-02) and [D-IMP-03](../DECISION_REGISTER.md#d-imp-03).

### Description

Once `READY_FOR_REVIEW`, the user sees only `AutoApproved` candidates (per the Two-Gate Model above), each with a source badge and confidence indicator, and may edit, confirm, or delete each independently.

### Acceptance Criteria

- Identical to `01_BRAND_BRAIN_PRD.md` FR-3, applied to both entry points.
- Confirming a field creates a new approved revision and returns its persisted completeness snapshot immediately; pending values never contribute. Contradictory proposals show approved/proposed values and evidence for explicit keep/replace/edit review.

## FR-6 — Handle Zero Eligible Candidates

### Description

If Knowledge Management finds zero eligible candidates from an otherwise successful pipeline run, this is not treated as a failure.

### Acceptance Criteria

- User sees a clear, non-alarming message (e.g., "We couldn't confidently extract anything usable from this source — you can fill these fields manually").
- No retry is auto-triggered; user may attempt a different source.

## FR-7 — Import Failure Fallback

### Description

Unchanged in spirit from `01_BRAND_BRAIN_PRD.md`'s existing fallback behavior, extended to file uploads.

### Acceptance Criteria

- Any pipeline failure (Ingestion validation failure, Document Processing failure, a bounded timeout under the review-pending ADR-012 deadline/recovery design and still-unapproved operational values (the 30s UI/performance goal is not a universal worker deadline)) surfaces a clear, non-technical message.
- User can always proceed manually — import failure never blocks Brand Brain completion.

---

# Business Rules

## BR-1

Every import job is scoped to exactly one Organization and exactly one Brand. No cross-brand import exists in MVP (consistent with MVP's one-Brand-per-Organization constraint).

## BR-2

Decision dependency: [D-IMP-02](../DECISION_REGISTER.md#d-imp-02). Pending choices are proposed, not Founder-approved.

Only one import job may be in-flight per Brand at a time.

## BR-3

Import always passes through Ingestion Service validation first — the frontend never talks to Document Processing, Knowledge Extraction, or Knowledge Management directly (matches every service spec's Upstream Dependencies section).

## BR-4

User confirmation (Gate 2) is required regardless of Knowledge Management's governance outcome (Gate 1). Auto-approval is eligibility only. It never creates an APPROVED_KNOWLEDGE artifact, updates current business tables or KnowledgeIndex, or exposes candidates to Context Engine before user confirmation.

## BR-5

Rejected candidates (Gate 1 failures) are never surfaced to the user as rejected — the field is simply left empty, indistinguishable from "no import match found." This avoids exposing internal governance mechanics as user-facing error states.

---

# Edge Cases

## EC-1

Decision dependency: [D-IMP-02](../DECISION_REGISTER.md#d-imp-02). Pending choices are proposed, not Founder-approved.

User submits a second import while one is in-flight.

Expected Result

Rejected immediately with a message identifying the in-flight job; no queueing.

---

## EC-2

Decision dependency: [D-IMP-03](../DECISION_REGISTER.md#d-imp-03). Pending choices are proposed, not Founder-approved.

User uploads a file, then navigates away before the job completes.

Expected Result

Job continues processing server-side. Returning to the Knowledge Base screen shows current status (not restarted).

---

## EC-3

Import produces candidates for a field the user already manually filled.

Expected Result

Per `01_BRAND_BRAIN_PRD.md`, manual entries are never silently overwritten. The candidate is shown as a suggested change with the current manual value visible for comparison; user explicitly chooses to keep or replace.

---

## EC-4

Website import targets a site requiring authentication or blocking crawlers (robots.txt disallow).

Expected Result

Ingestion Service validation fails fast (reachable but not crawlable is still a validation failure). Clear message; manual fallback available.

---

# Non-Functional Requirements

- **Performance:** Inherits the <30 second target from `01_BRAND_BRAIN_PRD.md`. No new performance target introduced for file uploads specifically, though large files may need a separate upload-transfer-time budget (Engineering to define alongside file size limit).
- **No streaming infrastructure required:** Simple interval polling is sufficient for MVP; explicitly not a WebSocket/SSE requirement.
- **AI Provider Agnostic:** Inherited from every upstream service spec — this PRD introduces no new AI provider dependency.

---

# Explicitly Deferred (Do Not Build Now)

- Batch / multi-file import.
- Scheduled or recurring imports.
- Concurrent import jobs per Brand.
- Audio, video, image, OCR import (matches Ingestion Service Deferred Features).
- Delegated Human Review admin queue and multi-stage approval (Phase 2). Single-owner candidate review and confirmation are required in MVP.
- Pipeline operational import history/audit log dashboard remains deferred. Brand Brain approved revision/field history, inspection and restore are required MVP behavior per KNOWLEDGE_PROVENANCE.md.

---

# Acceptance Criteria (Document-Level)

- Given a user with an in-flight import job, when they attempt a second import for the same Brand, then the second attempt is rejected with a clear message, not queued.
- Given a user uploads an unsupported file type, when they attempt to upload, then known unsupported extensions are rejected by UI preflight; server validation also checks actual size, MIME/signature and scan results after quarantined transfer. Spoofed types cannot bypass server rejection or reach parsing.
- Given a pipeline run completes with zero governance-eligible candidates, when the user views the result, then they see a non-alarming message and can proceed manually.
- Given a candidate conflicts with an existing manually-entered value, when the user reviews it, then both values are visible for comparison before any overwrite occurs.
- Given any import failure at any stage, when the user returns to Brand Brain, then onboarding/editing is never blocked — manual entry is always available.

---

# Success Metrics

Inherited from `01_PRODUCT_DISCOVERY.md` / `01_BRAND_BRAIN_PRD.md`:

| Metric                                                        | Target                                                    |
| ------------------------------------------------------------- | --------------------------------------------------------- |
| Import Success Rate (job reaches READY_FOR_REVIEW)            | Not yet baselined — track from Private Alpha              |
| Time to first value | Proposed median ≤10 minutes and p90 ≤15 minutes, per PRODUCT_METRICS.md; not observed |
| Post-onboarding import usage (Knowledge Base screen adoption) | Not yet baselined — new surface, track from Private Alpha |

---

# Dependencies

- `01_INGESTION_SERVICE.md` — validation, source types, size limits.
- `02_DOCUMENT_PROCESSING_SERVICE.md` — pipeline stages surfaced (indirectly) via status mapping.
- `03_KNOWLEDGE_EXTRACTION_SERVICE.md` — candidate generation, confidence.
- `04_KNOWLEDGE_MANAGEMENT_SERVICE.md` — governance (Gate 1).
- `01_BRAND_BRAIN_PRD.md` — field model, Review & Confirm UX, Completeness Score.
- `domain/02_ARTIFACT_MODEL.md` — `correlationId` / status derivation for the polling contract.
- `domain/04_DATABASE_DESIGN.md` — confirms no new status table is needed.

---

# Decision Log

## 2026-07-02 — historical proposal/adoption record (no Founder disposition recorded)

The original log’s confirmed/adopted wording did not identify an approver or close the explicit confirmation request. It is preserved below as drafting history, not proof of Founder sign-off.

- Knowledge Import PRD written, closing the last P0 backlog documentation gap before API Design.
- Original drafting claim: single-document import (no batch) “confirmed”; approval identity/disposition not recorded (D-IMP-01 pending).
- One-job-in-flight-per-Brand rule adopted by the draft to avoid concurrent-pipeline complexity; no Founder disposition recorded (D-IMP-02 pending).
- Dedicated Knowledge Base screen proposed as new post-onboarding UI scope; no Founder disposition recorded (D-IMP-03 pending).
- Two-Gate Model (Knowledge Management governance vs. user confirmation) made explicit — was previously only implied in Brand Brain PRD.
- Job status polling explicitly designed to reuse the existing `artifacts` table (derived view via `correlationId`) rather than introduce new status-tracking storage, per Database Design ADR-001.

---

# Related Documents

`01_BRAND_BRAIN_PRD.md`

`01_INGESTION_SERVICE.md`

`02_DOCUMENT_PROCESSING_SERVICE.md`

`03_KNOWLEDGE_EXTRACTION_SERVICE.md`

`04_KNOWLEDGE_MANAGEMENT_SERVICE.md`

`domain/02_ARTIFACT_MODEL.md`

`domain/04_DATABASE_DESIGN.md`

`02_PRODUCT_BIBLE.md`

---

# Version History

## Version 1.0.0

Initial Knowledge Import design draft, historically labeled Approved despite unresolved confirmation requests; production readiness was not established.

Defines:

- Two import entry points (onboarding + new post-onboarding Knowledge Base screen)
- UX-facing Job Lifecycle states, derived from the existing Artifact Model rather than new storage
- Two-Gate Model (governance vs. user confirmation), made explicit
- Functional requirements, business rules, edge cases
- Explicit MVP deferral list, matching upstream service specs

---

## Approval restoration criteria

Record actual Founder selection/evidence/date for D-IMP-01/02/03; update conditional requirements, navigation and API constraints to that selection; then Product/Architecture reviews the integrated revision and records engineering-design sign-off. No automatic status upgrade occurs from an ADR that merely references a product rule. Storage/module choices D-ENG-01/02 remain recorded decisions. No runtime implementation or Founder approval is claimed by this audit.

---

# END OF DOCUMENT


# Task 10 — Security acceptance and release dependency

[SECURITY_THREAT_MODEL.md](../SECURITY_THREAT_MODEL.md) is the shared security contract. SEC-01–06 and the applicable SEC-AT-01–08 scenarios are mandatory launch gates, pending implementation evidence and Security review; this addition grants no PRD sign-off. Every mutation and artifact/retrieval operation requires server-side tenant/Owner authorization. Imported and retrieved material is data, never policy authority; AI extraction and automated eligibility cannot approve knowledge. Candidate review access is distinct from generation eligibility.

Import UI limits are advisory: the server enforces scan/quarantine, type/size and fetch/redirect protections. A blocked source returns a safe reason and manual-entry fallback without leaking internal destinations or malware payloads. Generation uses only approved tenant-scoped knowledge and reviewed provider processing, with safe response rendering and no automatic external image/link loading. The full assembled system prompt, credentials and internal context artifact are not exposed through debug UI; authorized business facts may appear in useful responses and the approved Brand Brief. Context hiding is a UX choice, not a security boundary or a promise that approved facts can never appear in responses.

Acceptance mapping: import → SEC-AT-01/02/03/04/07; Brand Brain review/edit/restore → SEC-AT-04/05/07/08; Workspace generation/history/feedback/copy/deletion → SEC-AT-01/04/06/08. Provider disclosures, finite operational budgets and storage/retention readiness remain D-SEC-01/02/03 in the [decision register](../DECISION_REGISTER.md). Tests listed here are specifications, not executed results.


# Task 11 — Approval-based knowledge improvement

Scoped import extraction remains the MVP automated candidate source; eligible items enter the existing Owner review flow. Rejecting a proposal does not remove an approved fact. Candidate decisions and versioned publication follow the learning lifecycle; whole-import aggregation is specified by ADR-012 / D-AUD-07 with review pending; UI/admission choices remain D-IMP-02/03.

[KNOWLEDGE_LEARNING_LIFECYCLE.md](../KNOWLEDGE_LEARNING_LIFECYCLE.md) defines the MVP/later boundary, minimum payload/API contracts, correction acceptance, independently reviewed factual accuracy, staleness and paired repeated-error metrics, plus KL-AT-01–14 acceptance scenarios. This is specified behavior pending review/implementation evidence, not a claim of training, automatic accuracy improvement or new approval.


# Task 14 — Strategic interpretation and scope boundary

[COMPETITIVE_STRATEGY.md](../COMPETITIVE_STRATEGY.md) proposes evidence-backed business knowledge as positioning, not a unique or delivered advantage. [DIFFERENTIATION_ROADMAP.md](../DIFFERENTIATION_ROADMAP.md) maps A/B/C to existing commitments and new later proposals. Existing field provenance, explicit Owner approval, approved revision/context and copyable Brief requirements remain; no automatic monitoring, full knowledge export, connected API/MCP, delegated review or multi-brand capability is added to this PRD. Numeric comparative benefit targets are proposed experiments, not this revision’s performance guarantees or observed results. D-COMP-01/02 and existing PRD/scope/security gates remain pending.


# Task 15 — Proposed single-product commercial test

[GO_TO_MARKET_STRATEGY.md](../GO_TO_MARKET_STRATEGY.md) proposes e-commerce validation using one page URL OR one supported product fact document per import job, plus explicit manual brand/offer facts and Owner approval. Another source is a distinct job under the selected admission rule, not catalog crawling/batch import. Existing mandatory readiness/provenance/versioning and copyable approved Brief contracts remain. A deliverable-level source/claim panel is pending D-GTM-02, not already delivered. Segment, first $29 offer and experiment thresholds remain proposals; no PRD approval is upgraded.
