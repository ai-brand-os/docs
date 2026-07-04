# AI Brand OS — Knowledge Import PRD

Document: **07_KNOWLEDGE_IMPORT_PRD.md**

Version: **1.0.0**

Status: Approved for Engineering Design

Owner: Product

Priority: P0

Last Updated: 2026-07-02

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

1. **File upload** (PDF, DOCX, Markdown, Plain Text) is already Approved MVP scope in `01_INGESTION_SERVICE.md`, but no product flow describes how a user submits a file or what they see while it processes.
2. **Post-onboarding import** — Brand Brain PRD FR-9 requires editing Brand Brain "at any time after onboarding," which implies adding new source material later, not just during Step 2. No screen or flow for this exists in any approved document.

Without this PRD, API Design would need to invent both — repeating the exact class of mistake already flagged in `04_EXECUTION_BIBLE.md` Known Risks ("PRD approval sequencing").

---

# Scope Decisions (Founder Confirmation Requested)

Three quick calls made in this draft — flag if any should change before this PRD is treated as Approved:

1. **Single-document import only for MVP** (no batch/multi-file). Matches `01_INGESTION_SERVICE.md` Deferred Features ("Scheduled or batch imports"). Keeps the review UX simple — one set of candidate fields to confirm at a time, not a merge-conflict UI across multiple documents.
2. **Only one import job in-flight per Brand at a time.** Avoids concurrent-pipeline-run complexity in the MVP. A second import attempt while one is running is rejected with a clear message, not queued.
3. **A new "Knowledge Base" screen is introduced** (referenced only by module name in `02_PRODUCT_BIBLE.md`, never designed) as the post-onboarding entry point for adding more source material. This is new UI surface, not previously specified anywhere — flagging explicitly since it's a genuine scope addition, not just documentation cleanup.

---

# Import Entry Points

## Entry Point 1 — Onboarding (existing, Brand Brain PRD Step 2)

Website URL only. Unchanged from `01_BRAND_BRAIN_PRD.md`. This PRD does not modify onboarding — it only extends the same underlying mechanism to the second entry point below.

## Entry Point 2 — Knowledge Base Screen (new, post-onboarding)

Accessible any time after onboarding from Brand Brain settings. Supports both Website URL and File upload (PDF, DOCX, Markdown, Plain Text). Triggers the identical pipeline (Ingestion → Document Processing → Knowledge Extraction → Knowledge Management) and the identical Review & Confirm UX as onboarding — no second review pattern is introduced.

---

# Import Job Lifecycle (UX-Facing States)

The frontend needs a small set of user-friendly states to poll against — not the full Artifact Model pipeline detail. Per `domain/04_DATABASE_DESIGN.md` ADR-001 (single `artifacts` table), the backend resolves these states by reading the **latest Artifact for the request's `correlationId`** and mapping its `producingService` / `producingStage` / `status` to one of the labels below. No new status-tracking table is introduced — this is a derived view, not new storage.

```
SUBMITTED
    ↓
VALIDATING        (Ingestion Service gate)
    ↓
PROCESSING        (Document Processing pipeline)
    ↓
EXTRACTING        (Knowledge Extraction pipeline)
    ↓
READY_FOR_REVIEW  (Knowledge Management returned Approved candidates)
    ↓
COMPLETED         (user confirmed values into Brand Brain)

Failure states: FAILED (any stage), REJECTED_NO_CANDIDATES (pipeline
completed but Knowledge Management approved zero candidates — not an
error, just nothing usable was found)
```

## Polling Contract

Frontend polls job status on an interval (simple polling, not WebSocket/streaming — matches `01_BRAND_BRAIN_PRD.md`'s existing 30-second import target, which does not require push infrastructure). This is a deliberate MVP simplicity choice: real-time streaming status adds infrastructure complexity with no proportional UX benefit for a ≤30 second wait.

---

# Review & Confirm Flow

Reuses the exact UX already defined in `01_BRAND_BRAIN_PRD.md` Step 3 (source badges, confidence indicators, per-field edit/confirm/delete) for **both** entry points — onboarding and the new Knowledge Base screen. No second design pattern is introduced.

## Clarifying the Two-Gate Model (implicit in Brand Brain PRD, made explicit here)

There are two independent gates a candidate value passes through, and this PRD makes the distinction explicit since it was previously only implied:

**Gate 1 — Knowledge Management governance** (automatic, per `04_KNOWLEDGE_MANAGEMENT_SERVICE.md`, Policy Engine is Auto-Approve-only for MVP). A candidate is either `AutoApproved` or `Rejected` by deterministic rules. Rejected candidates are **never shown to the user** — the corresponding field is simply left empty, consistent with Brand Brain PRD's existing rule: _"Fields with no import match are shown empty."_

**Gate 2 — User confirmation** (manual, per Brand Brain PRD FR-3). Only `AutoApproved` candidates reach this gate. The user still must explicitly confirm, edit, or delete each one — governance approval alone does not count a field as complete toward the Completeness Score.

This two-gate model was already functionally present in Brand Brain PRD but never named — naming it here prevents a future engineer from assuming governance approval alone is sufficient to populate a field.

---

# Functional Requirements

## FR-1 — Submit Website URL (Onboarding)

Unchanged from `01_BRAND_BRAIN_PRD.md` FR-2.

## FR-2 — Submit Website URL (Post-Onboarding)

### Description

From the Knowledge Base screen, a user may submit a Website URL at any time, subject to the one-job-in-flight rule.

### Acceptance Criteria

- URL is validated client-side (well-formed) and server-side (reachable) before submission.
- If a job is already in-flight for this Brand, submission is rejected with a clear message naming the in-flight job.
- On success, the user is shown the Job Lifecycle states in real time via polling.

## FR-3 — Submit File Upload

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

### Description

The frontend polls job status using the Job Lifecycle states defined above.

### Acceptance Criteria

- Each state maps to a distinct, plain-language UI message (no raw pipeline/stage names shown to the user).
- Polling stops automatically on any terminal state (`COMPLETED`, `FAILED`, `REJECTED_NO_CANDIDATES`).

## FR-5 — Review & Confirm Extracted Candidates

### Description

Once `READY_FOR_REVIEW`, the user sees only `AutoApproved` candidates (per the Two-Gate Model above), each with a source badge and confidence indicator, and may edit, confirm, or delete each independently.

### Acceptance Criteria

- Identical to `01_BRAND_BRAIN_PRD.md` FR-3, applied to both entry points.
- Confirming a field updates the Completeness Score immediately (no separate save step).

## FR-6 — Handle Zero Approved Candidates

### Description

If Knowledge Management approves zero candidates from an otherwise successful pipeline run, this is not treated as a failure.

### Acceptance Criteria

- User sees a clear, non-alarming message (e.g., "We couldn't confidently extract anything usable from this source — you can fill these fields manually").
- No retry is auto-triggered; user may attempt a different source.

## FR-7 — Import Failure Fallback

### Description

Unchanged in spirit from `01_BRAND_BRAIN_PRD.md`'s existing fallback behavior, extended to file uploads.

### Acceptance Criteria

- Any pipeline failure (Ingestion validation failure, Document Processing failure, timeout >30s) surfaces a clear, non-technical message.
- User can always proceed manually — import failure never blocks Brand Brain completion.

---

# Business Rules

## BR-1

Every import job is scoped to exactly one Organization and exactly one Brand. No cross-brand import exists in MVP (consistent with MVP's one-Brand-per-Organization constraint).

## BR-2

Only one import job may be in-flight per Brand at a time.

## BR-3

Import always passes through Ingestion Service validation first — the frontend never talks to Document Processing, Knowledge Extraction, or Knowledge Management directly (matches every service spec's Upstream Dependencies section).

## BR-4

User confirmation (Gate 2) is required regardless of Knowledge Management's governance outcome (Gate 1). Auto-approval never silently writes to Brand Brain without user confirmation.

## BR-5

Rejected candidates (Gate 1 failures) are never surfaced to the user as rejected — the field is simply left empty, indistinguishable from "no import match found." This avoids exposing internal governance mechanics as user-facing error states.

---

# Edge Cases

## EC-1

User submits a second import while one is in-flight.

Expected Result

Rejected immediately with a message identifying the in-flight job; no queueing.

---

## EC-2

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
- Human Review admin queue (matches Knowledge Management Service MVP Scope: Auto-Approve-only Policy Engine).
- Import history / audit log UI (the underlying data exists in `artifacts` per Database Design, but no UI is built for it in MVP).

---

# Acceptance Criteria (Document-Level)

- Given a user with an in-flight import job, when they attempt a second import for the same Brand, then the second attempt is rejected with a clear message, not queued.
- Given a user uploads an unsupported file type, when they attempt to upload, then the rejection happens before any network transfer begins.
- Given a pipeline run completes with zero approved candidates, when the user views the result, then they see a non-alarming message and can proceed manually.
- Given a candidate conflicts with an existing manually-entered value, when the user reviews it, then both values are visible for comparison before any overwrite occurs.
- Given any import failure at any stage, when the user returns to Brand Brain, then onboarding/editing is never blocked — manual entry is always available.

---

# Success Metrics

Inherited from `01_PRODUCT_DISCOVERY.md` / `01_BRAND_BRAIN_PRD.md`:

| Metric                                                        | Target                                                    |
| ------------------------------------------------------------- | --------------------------------------------------------- |
| Import Success Rate (job reaches READY_FOR_REVIEW)            | Not yet baselined — track from Private Alpha              |
| Time to First Value                                           | < 15 minutes (inherited)                                  |
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

## 2026-07-02

- Knowledge Import PRD written, closing the last P0 backlog documentation gap before API Design.
- Single-document import (no batch) confirmed for MVP.
- One-job-in-flight-per-Brand rule adopted to avoid concurrent-pipeline complexity.
- New "Knowledge Base" screen introduced as the post-onboarding import entry point — flagged as genuine new scope, not just documentation cleanup.
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

Initial production-ready Knowledge Import PRD.

Defines:

- Two import entry points (onboarding + new post-onboarding Knowledge Base screen)
- UX-facing Job Lifecycle states, derived from the existing Artifact Model rather than new storage
- Two-Gate Model (governance vs. user confirmation), made explicit
- Functional requirements, business rules, edge cases
- Explicit MVP deferral list, matching upstream service specs

---

# Status

Draft — Pending Founder Approval

Version

1.0.0

Effective Date

Pending

---

# END OF DOCUMENT
