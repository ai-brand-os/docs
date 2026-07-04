# API Design — AI Brand OS

Document

05_API_DESIGN.md

Version

1.0.0

Status

Draft — Pending Architecture Review

Owner

Architecture

Priority

P0

Last Updated

2026-07-02

---

# Purpose

This document defines the NestJS module architecture and the public REST API surface for AI Brand OS. It translates the already-approved service specifications (Ingestion, Document Processing, Knowledge Extraction, Knowledge Management, Context Engine, AI Orchestrator), the AI Workspace PRD, the Brand Brain PRD, and the Knowledge Import PRD into concrete NestJS modules and HTTP endpoints.

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
07_KNOWLEDGE_IMPORT_PRD.md     (import job endpoints)
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
    ├── AIWorkspaceModule           (Conversation, Message, Feedback, ExportJob)
    └── KnowledgeImportModule       (orchestrates KnowledgeEngineModule on behalf of the UI)
```

`KnowledgeImportModule` is a thin Core Application module, not a Core Domain one — it exists specifically to implement `07_KNOWLEDGE_IMPORT_PRD.md`'s UX contract (job status polling, one-job-in-flight rule, candidate review) on top of the four Knowledge Engine modules. This keeps the PRD's product-layer rules (BR-1 through BR-5) out of the Core Domain modules, which must stay UX-agnostic per every service spec's own Non-Responsibilities section.

---

# Public API Surface

Everything not listed here is DI-only, per the Core Architectural Clarification. Base path: `/api/v1`.

## Auth (Platform)

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/auth/signup` | Creates User + Organization (Owner role) in one step — Brand created separately in onboarding, not here |
| POST | `/auth/login` | Returns access + refresh JWT pair |
| POST | `/auth/refresh` | Rotates refresh token |
| POST | `/auth/logout` | Revokes refresh token |

## Organizations (Platform)

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/organizations` | Lists all Organizations the authenticated user belongs to (org switcher) — see ADR-005 |
| POST | `/organizations` | Creates an additional Organization; caller becomes Owner. Distinct from the Organization auto-created at signup — see ADR-005 |
| GET | `/organizations/:id` | |
| PATCH | `/organizations/:id` | Industry, company size, region, language |
| GET | `/organizations/:id/members` | |
| POST | `/organizations/:id/members` | Deferred to Phase 2 per Product Bible (no multi-user invite flow in MVP) — endpoint reserved, not implemented |

## Brand Brain (`BrandModule`)

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/organizations/:id/brand` | MVP: fails if a Brand already exists (enforces Ontology 1:1 cardinality) |
| GET | `/organizations/:id/brand` | Includes `completenessScore` (computed, not stored — see ADR-002) |
| PATCH | `/organizations/:id/brand` | Mission, vision, core values, business goals |
| PATCH | `/organizations/:id/brand/voice` | Tone attributes, vocabulary — always `source: manual` server-side, regardless of request body (Ontology hard constraint) |
| POST | `/brands/:id/products` | |
| GET | `/brands/:id/products` | |
| PATCH | `/brands/:id/products/:productId` | |
| DELETE | `/brands/:id/products/:productId` | |
| *(identical pattern for `/brands/:id/services`, `/brands/:id/audiences`, `/brands/:id/competitors`)* | | |

## Knowledge Import (`KnowledgeImportModule`)

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/brands/:id/import` | Body: `{ sourceType: "url" \| "file", url? }` or multipart file. Rejects with 409 if a job is already in-flight (PRD BR-2) |
| GET | `/brands/:id/import-jobs/:correlationId` | Returns one of the UX-facing Job Lifecycle states from `07_KNOWLEDGE_IMPORT_PRD.md` — resolved by reading the latest `Artifact` row for that `correlationId`, not a dedicated status table (Database Design ADR-001) |
| GET | `/brands/:id/import-jobs/:correlationId/candidates` | Returns only `AutoApproved` candidates (Gate 1 already passed) |
| PATCH | `/brands/:id/import-jobs/:correlationId/candidates/:candidateId` | Body: `{ action: "confirm" \| "edit" \| "delete", value? }` — this is Gate 2 |

## AI Workspace (`AIWorkspaceModule`)

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/brands/:id/conversations` | |
| GET | `/brands/:id/conversations` | Ordered by `lastActivityAt` (FR-006) |
| GET | `/conversations/:id` | Restores messages |
| DELETE | `/conversations/:id` | Soft delete (Database Design ADR-006) |
| POST | `/conversations/:id/messages` | Body: `{ content: string }`. Response: Server-Sent Events stream (see ADR-003 below) |
| POST | `/messages/:id/feedback` | Body: `{ rating: "helpful" \| "not_helpful" }`. 409 on duplicate (unique constraint on `feedback.messageId`) |
| POST | `/conversations/:id/export` | Creates an `ExportJob` |
| GET | `/export-jobs/:id` | |

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

## Multi-Tenancy

Every query is scoped by `organizationId` (and `brandId` where applicable) at the repository layer, not just the controller layer — matching `domain/02_ARTIFACT_MODEL.md`'s Security requirement that tenant isolation have no exceptions.

---

# Architectural Decisions

## ADR-001 — Minimal Public Surface, DI for Everything Else

**Decision:** Only `AuthModule`, `OrganizationsModule`, `BrandModule`, `KnowledgeImportModule`, and `AIWorkspaceModule` expose HTTP controllers. `IngestionModule` through `AIOrchestratorModule` are DI-only.

**Reason:** Every one of the six Core Domain service specs already restricts its own upstream callers (e.g., Ingestion Service: *"Direct user access is prohibited... accepts requests only from Brand Brain onboarding flow / Knowledge Import"*). Giving them HTTP controllers anyway would mean maintaining an unused public contract for six services that explicitly forbid direct external access.

## ADR-002 — Completeness Score Is Computed, Not Stored

**Decision:** `GET /organizations/:id/brand` computes `completenessScore` on read from current field state, rather than persisting it as a column.

**Reason:** `01_BRAND_BRAIN_PRD.md`'s formula is a pure function of already-stored data (required fields filled ÷ total required, plus recommended entities present). Storing a derived value risks drift from the source fields it's derived from — matches Domain Model's "Knowledge should continuously compound" only for facts, not for calculations that already have a single source of truth.

## ADR-003 — Server-Sent Events for Message Streaming, Not WebSockets

**Decision:** `POST /conversations/:id/messages` returns a Server-Sent Events (SSE) stream, not a WebSocket connection.

**Reason:** AI Workspace PRD FR-004 requires streaming responses, but the interaction is strictly one-directional (server → client, token by token) and short-lived (one response per request). WebSockets solve a bidirectional, long-lived connection problem AI Brand OS doesn't have in MVP. SSE is simpler to implement, debug, and reason about — matches the "boring over clever" principle already applied to the Database Design's polling-over-push decision for import job status.

## ADR-005 — Multiple Organizations Per User Is MVP Scope, Not Phase 2

**Decision:** `POST /organizations` allows an already-authenticated user to create additional Organizations beyond the one auto-created at signup. `organization_members` (Pass 1 schema) already models this as many-to-many, so no schema change is required — only the missing endpoint.

**Reason:** This was an initial oversight in this document's first draft — the Auth section's signup endpoint implicitly assumed one Organization per user for life. That assumption directly conflicts with the Marketing Freelancer and Small Agency personas in `02_MARKET_RESEARCH.md` Segment C, who are explicitly part of the Beachhead Market specifically *because* they manage multiple clients/brands simultaneously. Since MVP constrains Brand to 1:1 with Organization (Ontology cardinality), a freelancer with multiple clients necessarily needs multiple Organizations — one per client. Deferring this to Phase 2 would mean the MVP fails a primary persona it was explicitly built to serve, not a nice-to-have.

**Scope boundary:** This does not reopen the Organization membership *invite* flow (`POST /organizations/:id/members` stays deferred — that's collaboration, a different feature). It only allows a single user to create and own multiple Organizations independently, with no cross-user sharing implied.

## ADR-004 — `KnowledgeImportModule` as a Core Application, Not Core Domain

**Decision:** The PRD-specific rules from `07_KNOWLEDGE_IMPORT_PRD.md` (one-job-in-flight, UX-facing Job Lifecycle mapping, Two-Gate Model surfacing) live in a new `KnowledgeImportModule` in the Core Application layer, not inside any of the four Knowledge Engine modules.

**Reason:** Every Knowledge Engine service spec's Non-Responsibilities section explicitly forbids UX/product-layer concerns leaking into that service. Placing PRD rules there would violate specs already Approved for Architecture & Engineering Design. `KnowledgeImportModule` depends on (imports) the four Knowledge Engine modules but adds no business logic of its own beyond orchestration and status derivation.

---

# MVP Scope

Included in this API Design:

- All endpoints listed in Public API Surface above.
- DI-only internal module wiring for all six Core Domain services.

# Deferred

- `POST /organizations/:id/members` (multi-user invite) — reserved path, not implemented, per Product Bible Phase 2.
- Any endpoint implying batch import, scheduled import, or concurrent import jobs — matches Knowledge Import PRD's Explicitly Deferred list.
- Any Context Inspector / retrieved-context-preview endpoint — matches AI Workspace PRD's Context Visibility section (hidden in MVP).

---

# Definition of Done

The API Design is complete when:

- Every Functional Requirement in `01_BRAND_BRAIN_PRD.md`, `07_KNOWLEDGE_IMPORT_PRD.md`, and `02_AI_WORKSPACE_PRD.md` maps to exactly one endpoint above.
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

`07_KNOWLEDGE_IMPORT_PRD.md`

`domain/04_DATABASE_DESIGN.md`

---

# Version History

## Version 1.0.0

Initial production-ready API Design.

Defines:

- NestJS module map across all three product layers
- Minimal public REST surface (5 controller-owning modules out of 9 total)
- Request/response conventions (error format, auth, multi-tenancy enforcement)
- 4 Architectural Decisions, including the SSE-over-WebSocket and computed-not-stored Completeness Score calls

---

# Status

Draft — Pending Architecture Review

Version

1.0.0

Effective Date

Pending

---

# END OF DOCUMENT
