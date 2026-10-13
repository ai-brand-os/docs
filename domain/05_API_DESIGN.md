# API Design — AI Brand OS

> Approval evidence audit (2026-10-13): [DECISION_REGISTER.md](../DECISION_REGISTER.md). Recorded baseline engineering decisions are preserved. Approved labels do not sign off pending import product choices D-IMP-01/02/03, later integrated PRD revisions, or proposed legal/operational retention periods. Dependency/release gates remain disclosed.

> Scope authority (2026-10-13): [MVP_SCOPE.md](../MVP_SCOPE.md). This document specifies intended behavior; design approval does not establish implementation. Historical decisions and long-term concepts do not expand MVP.

Document

05_API_DESIGN.md

Version

1.0.0

Status

Approved

Owner

Architecture

Priority

P0

Last Updated

2026-07-02

---

# Purpose

This document defines the NestJS module architecture and the public REST API surface for AI Brand OS. It translates recorded baseline service specifications (Ingestion, Document Processing, Knowledge Extraction, Knowledge Management, Context Engine, AI Orchestrator), the AI Workspace PRD, the Brand Brain PRD, and the Knowledge Import PRD into concrete NestJS modules and HTTP endpoints.

It does not redefine business logic — every module here is a thin translation layer over decisions already made in those documents.

---

# Mission

Give every future endpoint a single, predictable home: one NestJS module per bounded context, mapped 1:1 to an already-approved service or PRD, with a public surface small enough that most of the platform's complexity never needs to cross an HTTP boundary at all.

---

# Core Architectural Clarification (Read Before Anything Else)

The six Core Domain service specs (`01_INGESTION_SERVICE.md` through `06_AI_ORCHESTRATOR.md`) describe "Service Interfaces" and "Primary Operations" in provider-agnostic language. Given the Modular Monolith decision (`03_ENGINEERING_BIBLE.md`), these are **not** six internal HTTP services calling each other over the network. They are six NestJS modules in one process, calling each other's exported providers directly via Dependency Injection.

This matters because it resolves an ambiguity none of the six specs settled explicitly: "the service exposes application interfaces" means a TypeScript interface + injectable provider, not a controller. Only modules explicitly listed in the Public API Surface below have HTTP controllers. Everything else is DI-only.

---

# Relationship to Other Documents

```text
02_PRODUCT_BIBLE.md            (module list, layer boundaries)
03_ENGINEERING_BIBLE.md        (Modular Monolith decision, auth strategy)
01_INGESTION_SERVICE.md ... 06_AI_ORCHESTRATOR.md   (internal module contracts)
02_AI_WORKSPACE_PRD.md         (Conversation/Message endpoints)
01_BRAND_BRAIN_PRD.md          (Brand Brain field endpoints)
03_KNOWLEDGE_IMPORT_PRD.md     (import job endpoints)
domain/04_DATABASE_DESIGN.md   (underlying tables each endpoint reads/writes)
        │
        ▼
05_API_DESIGN.md  ← this document
```

---

# NestJS Module Map

Follows `02_PRODUCT_BIBLE.md`'s four-layer architecture and its Module Dependency Rule (`Platform Services → Core Domain → Core Applications`, one-directional, no reverse dependencies).

```text
AppModule
│
├── Platform Layer
│   ├── AuthModule
│   ├── UsersModule
│   └── OrganizationsModule
│
├── Core Domain Layer
│   ├── BrandModule                (Brand, BrandVoice)
│   ├── KnowledgeEngineModule
│   │   ├── IngestionModule
│   │   ├── DocumentProcessingModule
│   │   ├── KnowledgeExtractionModule
│   │   └── KnowledgeManagementModule
│   ├── ContextEngineModule
│   └── AIOrchestratorModule
│
└── Core Application Layer
    ├── AIWorkspaceModule           (Conversation, Message, Feedback)
    └── KnowledgeImportModule       (orchestrates KnowledgeEngineModule on behalf of the UI)
```

Import product scope gates: [D-IMP-01/02/03](../DECISION_REGISTER.md#decisions-requiring-founder-input) remain Proposed — Pending Founder Approval. Module/controller architecture is recorded; admission/UI choices are conditional proposals until disposition.

`KnowledgeImportModule` is a thin Core Application module, not a Core Domain one — it exists specifically to implement `03_KNOWLEDGE_IMPORT_PRD.md`'s UX contract (job status polling, one-job-in-flight rule, candidate review) on top of the four Knowledge Engine modules. This keeps the PRD's product-layer rules (BR-1 through BR-5) out of the Core Domain modules, which must stay UX-agnostic per every service spec's own Non-Responsibilities section.

---

# Public API Surface

Everything not listed here is DI-only, per the Core Architectural Clarification. Base path: `/api/v1`.

## Auth (Platform)

| Method | Path            | Notes                                                                                                   |
| ------ | --------------- | ------------------------------------------------------------------------------------------------------- |
| POST   | `/auth/signup`  | Creates User + Organization (Owner role) in one step — Brand created separately in onboarding, not here |
| POST   | `/auth/login`   | Returns access + refresh JWT pair                                                                       |
| POST   | `/auth/refresh` | Rotates refresh token                                                                                   |
| POST   | `/auth/logout`  | Revokes refresh token                                                                                   |

## Organizations (Platform)

| Method | Path                         | Notes                                                                                                                         |
| ------ | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/organizations`             | Returns the sole MVP Organization; additional Organizations and switching are Phase 2 — see ADR-005                                        |
| GET    | `/organizations/:id`         |                                                                                                                               |
| PATCH  | `/organizations/:id`         | Industry, company size, region, language                                                                                      |

## Brand Brain (`BrandModule`)

| Method                                                                                               | Path                              | Notes                                                                                                                    |
| ---------------------------------------------------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| POST                                                                                                 | `/organizations/:id/brand`        | MVP: fails if a Brand already exists (enforces Ontology 1:1 cardinality)                                                 |
| GET                                                                                                  | `/organizations/:id/brand`        | Includes currentRevisionId and persisted revision completeness plus effective readiness (ADR-002; KNOWLEDGE_PROVENANCE.md)                                                        |
| PATCH                                                                                                | `/organizations/:id/brand`        | Mission, vision, core values, business goals                                                                             |
| PATCH                                                                                                | `/organizations/:id/brand/voice`  | Tone/vocabulary manual-only; revision/evidence approval transaction with expectedRevisionId + Idempotency-Key |
| POST                                                                                                 | `/brands/:id/products`            |                                                                                                                          |
| GET                                                                                                  | `/brands/:id/products`            |                                                                                                                          |
| PATCH                                                                                                | `/brands/:id/products/:productId` |                                                                                                                          |
| DELETE                                                                                               | `/brands/:id/products/:productId` |                                                                                                                          |
| _(identical pattern for `/brands/:id/services`, `/brands/:id/audiences`, `/brands/:id/competitors`)_ |                                   |                                                                                                                          |

## Approved Brand Brief (`BrandModule`)

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/brands/:id/brief` | Returns copyable text from current human-approved knowledge only (Brand Brain FR-11); no file, job, or generated unreviewed claims. |

## Knowledge Import (`KnowledgeImportModule`)

| Method | Path                                                             | Notes                                                                                                                                                                                                                |
| ------ | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/brands/:id/import`                                             | Body: `{ sourceType: "url" \| "file", url? }` or multipart file. Proposed rejection with 409 if a job is in-flight (PRD BR-2 / D-IMP-02 pending Founder approval)                                                                                           |
| GET    | `/brands/:id/import-jobs/:correlationId`                         | Returns one of the UX-facing Job Lifecycle states from `03_KNOWLEDGE_IMPORT_PRD.md` — resolved by reading the latest `Artifact` row for that `correlationId`, not a dedicated status table (Database Design ADR-001) |
| GET    | `/brands/:id/import-jobs/:correlationId/candidates`              | Returns governance-eligible `AutoApproved` candidates, still pending human confirmation (Gate 1 already passed)                                                                                                                                                       |
| PATCH  | `/brands/:id/import-jobs/:correlationId/candidates/:candidateId` | Body: `{ action: "confirm" \| "edit" \| "delete", value?, expectedRevisionId }`, Idempotency-Key — Gate 2 creates approved revision or records rejection                                                                                                                                         |

## AI Workspace (`AIWorkspaceModule`)

| Method | Path                          | Notes                                                                                                        |
| ------ | ----------------------------- | ------------------------------------------------------------------------------------------------------------ |
| POST   | `/brands/:id/conversations`   |                                                                                                              |
| GET    | `/brands/:id/conversations`   | Ordered by `lastActivityAt` (FR-006)                                                                         |
| GET    | `/conversations/:id`          | Restores messages                                                                                            |
| DELETE | `/conversations/:id`          | 204 after tenant-authorized tombstone + durable purge commit; immediate denial of all normal access; physical removal pending (DATA_LIFECYCLE.md / ADR-006)                                                                        |
| POST   | `/conversations/:id/messages` | Body: `{ content: string }`. Response: Server-Sent Events stream (see ADR-003 below)                         |
| POST   | `/messages/:id/feedback`      | Body: `{ rating: "helpful" \| "not_helpful" }`. 409 on duplicate (unique constraint on `feedback.messageId`) |

---

# Request/Response Conventions

## Error Format

Inherited unchanged from `03_ENGINEERING_BIBLE.md`:

```json
{
  "success": false,
  "error": {
    "code": "",
    "message": ""
  }
}
```

## Authentication

JWT access token (short-lived) + refresh token (long-lived, rotated on use), via `@nestjs/passport` + `@nestjs/jwt`. Replaces the Engineering Bible's original "JWT / Sanctum" line — Sanctum was Laravel-specific and no longer applies after the NestJS decision.

## Authorization

Every endpoint under `/organizations/:id/*` and `/brands/:id/*` enforces membership + role via a shared NestJS Guard, checking the canonical role enum (`Owner/Admin/Editor/Viewer`, per Gap Closure Patch 2026-07-02) — never re-implemented per-module.

## Conversation deletion access gate

All direct and nested Conversation, Message, Feedback, generation Artifact and memory operations must check deletedAt IS NULL after tenant authorization. Deletion is idempotent while the tenant-scoped request/receipt exists; unknown or unauthorized IDs return 404. Serialize generation/feedback writes and stream publication with deletion. Purge/exception operators use separate narrowly scoped service access; there is no public Conversation restore or purge receipt endpoint; approved Brand Brain version restoration is a separate knowledge operation. See [DATA_LIFECYCLE.md](../DATA_LIFECYCLE.md).

## Multi-Tenancy

Every query is scoped by `organizationId` (and `brandId` where applicable) at the repository layer, not just the controller layer — matching `domain/02_ARTIFACT_MODEL.md`'s Security requirement that tenant isolation have no exceptions.

---

# Architectural Decisions

## ADR-001 — Minimal Public Surface, DI for Everything Else

**Decision:** Only `AuthModule`, `OrganizationsModule`, `BrandModule`, `KnowledgeImportModule`, and `AIWorkspaceModule` expose HTTP controllers. `IngestionModule` through `AIOrchestratorModule` are DI-only.

**Reason:** Every one of the six Core Domain service specs already restricts its own upstream callers (e.g., Ingestion Service: _"Direct user access is prohibited... accepts requests only from Brand Brain onboarding flow / Knowledge Import"_). Giving them HTTP controllers anyway would mean maintaining an unused public contract for six services that explicitly forbid direct external access.

## ADR-002 — Persisted Revision Completeness, Separate Effective Readiness

**Decision (2026-10-13):** Supersedes compute-on-read-only completeness. BrandBrainRevision persists score, missing mandatory paths, ontology/calculation versions and calculatedAt for its immutable approved Artifact snapshot. GET returns the current head snapshot; historical scores never drift. Effective readiness separately checks required approved facts, complete offer/Audience, manual tone, current ontology compatibility and Brand archival. Runtime request authorization/deletion/provider gates are separate.

**Reason:** The versioned result is reproducible and inspectable with prior approved facts. There is no duplicate score column on Brand. See [KNOWLEDGE_PROVENANCE.md](../KNOWLEDGE_PROVENANCE.md#api-contracts-ownertenant-scoped-planned) for field reads/history/diff/verify/restore contracts and all mutation concurrency/idempotency rules.

## ADR-003 — Server-Sent Events for Message Streaming, Not WebSockets

**Decision:** `POST /conversations/:id/messages` returns a Server-Sent Events (SSE) stream, not a WebSocket connection.

**Reason:** AI Workspace PRD FR-004 requires streaming responses, but the interaction is strictly one-directional (server → client, token by token) and short-lived (one response per request). WebSockets solve a bidirectional, long-lived connection problem AI Brand OS doesn't have in MVP. SSE is simpler to implement, debug, and reason about — matches the "boring over clever" principle already applied to the Database Design's polling-over-push decision for import job status.

## ADR-005 — Single Organization and Brand Per Account in MVP

**Decision (2026-10-13):** Supersedes the previous multiple-Organization MVP decision. Signup provisions one owned Organization; a user cannot create additional Organizations or access other users’ tenants in MVP. The Brand remains unique per Organization. Enforce the per-account restriction in the application service transaction; relational cardinality alone does not enforce the product limit.

**Reason:** Multiple client Organizations would expose multi-brand management through a workaround. Organization creation beyond signup, membership listing/invitations, switching, and delegated role access are Phase 2. [COMMERCIAL_PACKAGING.md](../COMMERCIAL_PACKAGING.md) applies the same limit to proposed Starter/Pro offers; future independent memberships do not create an Agency subscription, portfolio or consolidated billing relationship.

## ADR-004 — `KnowledgeImportModule` as a Core Application, Not Core Domain

**Decision:** The PRD-specific rules from `03_KNOWLEDGE_IMPORT_PRD.md` (one-job-in-flight, UX-facing Job Lifecycle mapping, Two-Gate Model surfacing) live in a new `KnowledgeImportModule` in the Core Application layer, not inside any of the four Knowledge Engine modules.

**Reason:** Every Knowledge Engine service spec's Non-Responsibilities section explicitly forbids UX/product-layer concerns leaking into that service. Placing PRD rules there would violate specs already Approved for Architecture & Engineering Design. `KnowledgeImportModule` depends on (imports) the four Knowledge Engine modules but adds no business logic of its own beyond orchestration and status derivation.

---

# MVP Scope

Included in this API Design:

- All endpoints listed in Public API Surface above, scoped to the sole Owner and Brand. No export, extra Organization creation, or team endpoints are MVP.
- DI-only internal module wiring for all six Core Domain services.

# Deferred

- `POST /organizations/:id/members` (multi-user invite) — reserved path, not implemented, per Product Bible Phase 2.
- Any endpoint implying batch import, scheduled import, or concurrent import jobs — matches Knowledge Import PRD's Explicitly Deferred list.
- Any Context Inspector / retrieved-context-preview endpoint — matches AI Workspace PRD's Context Visibility section (hidden in MVP).

---

# Definition of Done

The API Design is complete when:

- Every Functional Requirement in `01_BRAND_BRAIN_PRD.md`, `03_KNOWLEDGE_IMPORT_PRD.md`, and `02_AI_WORKSPACE_PRD.md` maps to exactly one endpoint above.
- No Core Domain service gains a public controller that its own spec's Upstream Dependencies section forbids.
- Every endpoint's authorization path resolves to the canonical role enum, with no per-module role redefinition.
- Documentation is synchronized with `domain/04_DATABASE_DESIGN.md` (no endpoint implies a table that doesn't exist, and no table lacks an endpoint if the PRDs require one).

---

# Related Documents

`02_PRODUCT_BIBLE.md`

`03_ENGINEERING_BIBLE.md`

`01_INGESTION_SERVICE.md`

`02_DOCUMENT_PROCESSING_SERVICE.md`

`03_KNOWLEDGE_EXTRACTION_SERVICE.md`

`04_KNOWLEDGE_MANAGEMENT_SERVICE.md`

`05_CONTEXT_ENGINE.md`

`06_AI_ORCHESTRATOR.md`

`01_BRAND_BRAIN_PRD.md`

`02_AI_WORKSPACE_PRD.md`

`03_KNOWLEDGE_IMPORT_PRD.md`

`domain/04_DATABASE_DESIGN.md`

---

# Version History

## Version 1.0.0

Initial production-ready API Design.

Defines:

- NestJS module map across all three product layers
- Minimal public REST surface (5 controller-owning modules out of 9 total)
- Request/response conventions (error format, auth, multi-tenancy enforcement)
- 4 Architectural Decisions, including SSE-over-WebSocket and the historical computed-only completeness call (superseded by persisted revision snapshots on 2026-10-13)

---

## Brand Brain provenance API surface

The planned public contracts in [KNOWLEDGE_PROVENANCE.md](../KNOWLEDGE_PROVENANCE.md#api-contracts-ownertenant-scoped-planned) are part of this API design: knowledge read, revision list/detail, field-history, revision-diff, explicit verify, restore-preview and restore. Existing entity PATCH/DELETE and import confirm/edit use expectedRevisionId and Idempotency-Key and return newRevisionId, persisted completeness and effective readiness. Owner/tenant authorization applies to every historical revision and source citation. No direct projection setter or pointer rollback endpoint exists.

---

## Metrics and incomplete-user response contract

GET Brand Brain/knowledge returns the pinned persisted completeness snapshot, current effectiveReady/readinessReasons and missing mandatory keys, per [PRODUCT_METRICS.md](../PRODUCT_METRICS.md). A no-head response explicitly shows draft 0/no persisted calculation timestamp. Generation APIs reject not-ready/ungrounded requests; read/review/edit and partial approved Brief remain available under their normal tenant/deletion checks. Output presentation acknowledgements are authenticated application telemetry operations validating tenant/output/revision evidence before QualifiedFirstValue; accepting raw client grounded=true is prohibited. No public analytics dashboard is implied.

---

# END OF DOCUMENT
