# 03_ENGINEERING_BIBLE.md

> Final audit (2026-10-16): Image/video workers, publishing, webhooks and character consistency sketches are future Phase 3/4 designs. Provider names are replaceable integration targets, not evidence that multiple providers are enabled. Launch-relevant security/purge/revision end-to-end scenarios require execution before release even where browser automation is described as future. See [final-audit decisions](../DECISION_REGISTER.md#final-audit-decisions) for options and ownership.

> Approval evidence audit (2026-10-13): [DECISION_REGISTER.md](../DECISION_REGISTER.md). Recorded baseline engineering decisions are preserved. Approved labels do not sign off pending import product choices D-IMP-01/02/03, later integrated PRD revisions, or proposed legal/operational retention periods. Dependency/release gates remain disclosed.

> Measurement authority (2026-10-13): [PRODUCT_METRICS.md](../PRODUCT_METRICS.md). TTFV is onboarding start to the first presented usable output grounded in approved knowledge; proposed goals are median ≤10 minutes and p90 ≤15 minutes. Completeness, readiness and cohort completion/activation rates are separate; targets are goals, not observations.

> Scope authority (2026-10-13): [MVP_SCOPE.md](../MVP_SCOPE.md). This document specifies intended behavior; design approval does not establish implementation. Historical decisions and long-term concepts do not expand MVP.

# AI Brand OS — Engineering Bible

Version: 1.1.0

Status: Active

---

# Engineering Philosophy

Build for simplicity first.

Scale when required.

Avoid over-engineering.

Prefer maintainability over cleverness.

Every architectural decision must support long-term growth.

---

# Technology Stack — recommended MVP deployment

[ADR-010](../domain/09_LEAN_MVP_ARCHITECTURE_ADR.md) recommends the lean MVP baseline, pending Architecture/Security/Operations review. This is not a migration report.

## Frontend

- Next.js and TypeScript
- Tailwind CSS, TanStack Query, React Hook Form, Zod and shadcn/ui remain UI choices.

## Backend

- NestJS TypeScript modular monolith, REST and SSE
- Prisma 7 over PostgreSQL; runtime datasource configuration and adapter per ADR-009
- One backend codebase/release with API and asynchronous worker roles

## Workers

NestJS/TypeScript workers run durable import, retry and cleanup work through a PostgreSQL-backed queue adapter; pg-boss is recommended pending compatibility/transaction review. Parser/scanner isolation is mandatory and separate from the HTTP event loop. No Go application workers are required for MVP. Go/media compute is future and profiling-dependent.

## Database and storage

- PostgreSQL: authoritative business state, artifacts/revisions and library-owned operational queue schema (not yet installed)
- Private S3-compatible object storage for original/quarantined files; Cloudflare R2 remains a proposed vendor behind an adapter
- Structured/keyword retrieval of approved facts initially; pgvector is the first vector option only if evaluated retrieval needs justify it
- Redis/BullMQ and Qdrant are deferred alternatives requiring measured triggers; no default Redis cache
- Meilisearch is future, outside MVP

## High Level Architecture

```text
Next.js → NestJS API role → PostgreSQL / private object storage
                    │
              reviewed AI adapters

NestJS worker role (same backend release) → PostgreSQL durable queue
                    ├── restricted public URL fetch adapter
                    ├── isolated scanner/parser execution
                    ├── private object storage
                    └── reviewed AI adapters
```

The full MVP/future diagrams, dependency table, complexity estimate, migration/rollback plan and measurable scaling triggers are in ADR-010. Service boundaries are NestJS module contracts, not independent domain microservice deployments.

---

# System Architecture

Frontend

↓

API Layer

↓

Business Layer

↓

Domain Layer

↓

Infrastructure Layer

↓

External Services

---

# Core Services

- Authentication
- Organizations
- Brands
- Brand Brain
- Knowledge Base
- Knowledge Engine
  ├── Ingestion Service
  ├── Document Processing Service
  ├── Knowledge Extraction Service
  └── Knowledge Management Service
- Context Engine
- AI Workspace
- Content Generation

---

# API Principles

- REST First
- Versioned APIs
- Stateless
- Consistent Responses
- Resource-Based Endpoints
- Pagination
- Filtering
- Validation
- Rate Limiting

---

# Authentication

Planned NestJS-compatible contract: local credential validation, signed access/refresh JWTs, Guards and a Prisma-backed AuthSession token-family/revocation store. @nestjs/jwt and optional Passport integration are design components; no implemented identity provider or external vendor is claimed.

[ADR-009](../domain/08_BACKEND_AUTH_AND_CONSTRAINTS_ADR.md) defines token purposes, signature/issuer/audience validation, per-request revocation checks, fixed expiry/atomic refresh rotation, reuse detection, TLS/password hashing, browser memory/secure HttpOnly cookie handling, CSRF/CORS and tenant-scoped authorization. Proposed access/session lifetimes remain Security/Engineering-reviewed configuration, not implemented settings. Refresh secrets/credentials never enter business knowledge or telemetry.

---

# Authorization

MVP exposes only the sole Owner’s one Organization and Brand, checked through current database membership and resource ownership on every direct/nested operation. Do not trust route/body/JWT tenant or role values as permission. Access also observes Conversation tombstones and relevant readiness gates.

Admin/Editor/Viewer enum values support later Phase 2 role design, not MVP team access. Custom roles are future scope. Core modules receive validated tenant/principal context through application services; internal purge workers use separate scoped service identities. Authentication and tenant authorization are separate checks, as specified in ADR-009.

---

# Multi-Tenancy

Every resource belongs to:

Organization

↓

Brand

↓

User

No cross-tenant access.

---

# Database Principles

- Normalize business data.
- Field knowledge follows [KNOWLEDGE_PROVENANCE.md](../KNOWLEDGE_PROVENANCE.md): approved Artifact snapshots are canonical values, BrandBrainRevision holds approval/history/completeness metadata, and current business tables/KnowledgeIndex are transactional projections. No silent AI replacement or independent score/provenance store.
- Avoid duplicate records.
- Use foreign keys.
- Soft deletes where appropriate: Conversation.deletedAt means inaccessible and pending physical deletion, not completed erasure.
- Apply [DATA_LIFECYCLE.md](../DATA_LIFECYCLE.md) to API filters, transaction races, explicit generation-artifact ownership, durable purge/retries, shared knowledge safeguards and backup restore replay.
- Proposed active-system removal within 30 days requires legal/operational approval; backups have a separately approved expiration schedule and are not erased immediately.
- Conversation→Message→Feedback cascades apply only to physical removal; Restrict FKs protect artifact lineage and prevent Organization/Brand/User deletion from bypassing the conversation purge.
- UUIDs for public identifiers.

---

# Queue Strategy

Queues

- AI Generation
- Image Jobs
- Video Jobs
- Publishing
- Notifications
- Imports
- Webhooks

Heavy jobs must never block API requests.

---

# AI Layer

MVP: one explicitly configured and reviewed provider; no vendor is selected or approved here. Additional vendor adapters and self-hosted models are future options. No provider/model/region fallback is allowed.

[ADR-011](../domain/10_AI_PROVIDER_GATEWAY_ADR.md) specifies a shared internal NestJS AI Provider Gateway, DI-only in the same API/worker codebase. Extraction owns its templates, deterministic-first decisions and candidate semantics; Orchestrator owns Workspace planning, generation templates/model requests and final Message completion. Both call the [versioned Gateway contract](../contracts/ai-provider/README.md); only Gateway-owned adapters import vendor SDKs or hold credentials. Gateway enforces purpose/tenant policy, total cost/token/deadline/attempt limits and privacy-safe telemetry, with no knowledge access/publication. D-AUD-02 remains pending Architecture/Security review; D-SEC-02 and D-GW-01 remain approval gates. No runtime implementation is claimed.

Never couple business logic to one provider.

---

# Prompt Strategy

Prompts are versioned.

Prompts are stored.

Prompts are reusable.

Prompt changes must be tracked.

---

# Character Consistency

Character data includes:

- Identity
- Face
- Style
- Prompt Template
- Negative Prompt
- Seed (when supported)
- Reference Assets

---

# Knowledge Base

MVP supports a single page URL or supported PDF/DOCX/Markdown/plain-text source per import proposal, under existing D-IMP approvals and security limits. Website crawling, media intake and background inference are future. Raw sources remain untrusted; only approved versioned business facts enter generation retrieval.

Baseline retrieval is bounded structured/keyword selection from PostgreSQL approved state. Embeddings are not declared stored in Qdrant. Introduce pgvector first only after quality/latency evaluation establishes need, with a separately reviewed derived-projection schema; Qdrant is a conditional future alternative.

---

# Background Workers

Use a durable PostgreSQL queue adapter and NestJS worker role from the same backend release for import parsing/extraction orchestration, delayed retries and cleanup scheduling. Preserve the independent ConversationPurge ledger and artifact-derived import status. API generation may stream directly; queue only for measured backpressure. Parser/scanner subprocesses require sandbox restrictions. Finite retries, idempotency, recovery and queue transaction review are launch requirements in [ADR-010](../domain/09_LEAN_MVP_ARCHITECTURE_ADR.md).

Video/image rendering, general webhooks and advanced scheduled analytics are future designs. No Go worker infrastructure is claimed migrated or deployed.

---

# Error Handling

Standard Error Format

```json
{
  "success": false,
  "error": {
    "code": "",
    "message": ""
  }
}
```

---

# Logging

Levels

- Debug
- Info
- Warning
- Error
- Critical

Centralized logging required.

---

# Monitoring

Track

- API Response Time
- Queue Length
- Worker Health
- AI Latency
- Error Rate
- Storage Usage

---

# Security

- HTTPS Everywhere
- Encrypted Secrets
- Signed URLs
- Input Validation
- Output Escaping
- Rate Limiting
- CSRF Protection
- XSS Protection
- SQL Injection Protection

---

# Coding Standards

- SOLID
- DRY
- KISS
- Clean Architecture
- Repository Pattern (only when useful)
- Service Layer
- DTOs
- Dependency Injection

---

# Git Workflow

Main

↓

Develop

↓

Feature Branches

↓

Pull Request

↓

Review

↓

Merge

---

# Branch Naming

feature/

fix/

refactor/

hotfix/

release/

---

# Commit Convention

feat:

fix:

refactor:

docs:

test:

chore:

---

# Testing Strategy

Backend

- Unit Tests
- Feature Tests
- API Tests

Frontend

- Unit Tests
- Component Tests
- E2E (Future)

---

# CI/CD

Pipeline

Lint

↓

Tests

↓

Build

↓

Deploy

---

# Deployment Strategy

Development

↓

Staging

↓

Production

---

# Scalability Principles

Stateless APIs

Horizontal Scaling

Queue-Based Processing

Cache Frequently Used Data

Separate Heavy AI Workloads

---

# Engineering Rules

Never optimize prematurely.

Never introduce unnecessary complexity.

Every dependency must have a reason.

Every architecture decision should be documented.

Prefer boring, proven technologies.

---

## ADR — Backend Framework & Database (2026-07-02)

### Decision

Backend framework changed from Laravel (PHP) to NestJS (TypeScript).
Primary database changed from MySQL to PostgreSQL.

### Context

Original v1.0.0 Engineering Bible approved Laravel + MySQL. This decision
was made without a founder-background variable factored in.

### Reason — Database (MySQL → PostgreSQL)

The Artifact Model (`domain/02_ARTIFACT_MODEL.md`) defines every one of the
seven artifact types with a semi-structured `payload` field, plus versioned,
append-only records (Knowledge Candidate, Approved Knowledge, Provenance).
PostgreSQL's native JSONB with GIN indexing supports this shape significantly
better than MySQL's JSON type, both for query performance and for future
optional consolidation with pgvector. Switching cost is near-zero: Database
Design had not yet started at time of decision.

### Reason — Backend Framework (Laravel → NestJS)

Founder has 9 years of frontend engineering experience (TypeScript/JavaScript
ecosystem) and no prior backend experience. The learning curve for backend
_concepts_ (data modeling, auth flows, queues, multi-tenancy, caching) is
equivalent regardless of framework language. The learning curve for backend
_syntax and ecosystem_, however, is substantially lower in NestJS given
existing TypeScript fluency, versus Laravel requiring simultaneous PHP
acquisition. Additional benefit: a single language across Next.js frontend
and NestJS backend allows shared types/DTOs and reduces context-switching
overhead for a solo/small founding team.

### Alternatives Considered

- Keep Laravel: rejected. Its framework-integrated authentication, billing
  and ORM tools are a productivity advantage, but this is outweighed
  by the founder's zero PHP fluency against 9 years of TypeScript fluency.
  NestJS has production-grade equivalents (Passport.js / `@nestjs/passport`,
  Prisma (chosen ORM), optional future billing SDK integration, and queue adapters).
  Historical Redis/BullMQ deployment assumptions are superseded for MVP planning by ADR-010; no existing Redis deployment is established by this record.

### Expected Impact

- No change to Domain Model, Business Ontology, or Artifact Model — these
  are framework-agnostic by design (per Domain Model's "Technology
  Independent" principle).
- Database Design phase should proceed directly against PostgreSQL.
- Historical ORM deferral is superseded by Database ADR-005 and ADR-009: Prisma is chosen. Task 08 removes the legacy schema-level URL and exact-schema Prisma 7 validation passes. Runtime deployment/adapter/secret checks remain required; TypeORM is not an open current alternative.

### Supersedes

This entry supersedes the original Backend/Database rows in the "Decisions
→ Approved" table of `04_EXECUTION_BIBLE.md` version 1.2.0. That entry is
NOT deleted — see the corresponding Execution Bible update below, which
preserves the original decision as historical record per Product Bible's
"Historical decisions should never be silently overwritten" rule.

END OF DOCUMENT

## ADR-009 technology and database audit

Current framework NestJS and ORM Prisma are fixed architecture choices. [ADR-009](../domain/08_BACKEND_AUTH_AND_CONSTRAINTS_ADR.md) consolidates their rationale, planned JWT/session security, Prisma 7 configuration and NULL-safe SQL. [MVP_CONSTRAINTS.sql](../sql/MVP_CONSTRAINTS.sql) is the reviewed migration supplement; Prisma scalar-list types/defaults alone do not provide database NOT NULL or cardinality checks. Exact-schema and isolated PostgreSQL results are in validation/TASK08_RESULTS.md. No production migration or authentication provider implementation is implied.
