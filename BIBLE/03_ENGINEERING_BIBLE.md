# 03_ENGINEERING_BIBLE.md

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

# Technology Stack

## Frontend

- Next.js
- TypeScript
- Tailwind CSS
- React Query (TanStack Query)
- React Hook Form
- Zod
- shadcn/ui

---

## Backend

- NestJS
- TypeScript
- REST API
- BullMQ (Redis-backed queues)
- Prisma or TypeORM (ORM — final choice deferred to Database Design phase)

---

## Workers

- Go

Responsibilities:

- AI Jobs
- Video Processing
- Image Processing
- Queue Consumers
- Heavy Background Tasks

---

## Database

Primary

- PostgreSQL

Cache

- Redis

Vector Database

- Qdrant

Object Storage

- Cloudflare R2

Search (Future)

- Meilisearch

---

# High Level Architecture

```text
Next.js
      │
 REST API
      │
NestJS Backend
      │
 ├── PostgreSQL
 ├── Redis
 ├── Qdrant
 ├── Cloudflare R2
 └── Queue (BullMQ)

          │

Go Workers

          │

AI Providers
```

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

- JWT / Sanctum
- Refresh Tokens
- Role Based Access Control
- Organization Isolation

---

# Authorization

Roles

- Owner
- Admin
- Editor
- Viewer

Future

- Custom Roles

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
- Avoid duplicate records.
- Use foreign keys.
- Soft deletes where appropriate.
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

Providers

- OpenAI
- Claude
- Gemini

Future

- Self-hosted Models

AI abstraction layer required.

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

Supports

- PDFs
- Website Crawling
- DOCX
- TXT
- Markdown
- FAQs

Embeddings stored in Qdrant.

---

# Background Workers

Handled by Go.

Examples

- AI Generation
- Video Rendering
- Image Rendering
- Webhook Processing
- Scheduled Jobs
- Analytics Processing

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

- Keep Laravel: rejected. Laravel's batteries-included ecosystem (Sanctum,
  Cashier, Eloquent) is a real productivity advantage, but it is outweighed
  by the founder's zero PHP fluency against 9 years of TypeScript fluency.
  NestJS has production-grade equivalents (Passport.js / `@nestjs/passport`,
  Prisma or TypeORM, Stripe SDK directly, BullMQ for queues on the existing
  Redis instance).

### Expected Impact

- No change to Domain Model, Business Ontology, or Artifact Model — these
  are framework-agnostic by design (per Domain Model's "Technology
  Independent" principle).
- Database Design phase should proceed directly against PostgreSQL.
- ORM choice (Prisma vs TypeORM) is deferred to Database Design — not
  decided in this session.

### Supersedes

This entry supersedes the original Backend/Database rows in the "Decisions
→ Approved" table of `04_EXECUTION_BIBLE.md` version 1.2.0. That entry is
NOT deleted — see the corresponding Execution Bible update below, which
preserves the original decision as historical record per Product Bible's
"Historical decisions should never be silently overwritten" rule.

END OF DOCUMENT
