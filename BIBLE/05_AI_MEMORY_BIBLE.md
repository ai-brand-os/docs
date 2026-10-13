# AI Brand OS — AI Memory

> Approval evidence audit (2026-10-13): [DECISION_REGISTER.md](../DECISION_REGISTER.md). Recorded baseline engineering decisions are preserved. Approved labels do not sign off pending import product choices D-IMP-01/02/03, later integrated PRD revisions, or proposed legal/operational retention periods. Dependency/release gates remain disclosed.

> Measurement authority (2026-10-13): [PRODUCT_METRICS.md](../PRODUCT_METRICS.md). TTFV is onboarding start to the first presented usable output grounded in approved knowledge; proposed goals are median ≤10 minutes and p90 ≤15 minutes. Completeness, readiness and cohort completion/activation rates are separate; targets are goals, not observations.

> Scope authority (2026-10-13): [MVP_SCOPE.md](../MVP_SCOPE.md). This document specifies intended behavior; design approval does not establish implementation. Historical decisions and long-term concepts do not expand MVP.

Version: 1.4.0

Status: Active

Last Updated: 2026-07-07

---

# Changelog

## Version 1.4.0

### Updated

- Refreshed Current Priorities to Sprint 1 (was a full phase stale — listed already-completed Database/API Design and used the retired Knowledge Import PRD numbering, now `03_KNOWLEDGE_IMPORT_PRD.md`)
- Updated Session Memory: appended Database Design, API Design, Knowledge Import PRD, Design Foundations, Component Kit, and the schema merge to Completed; replaced Next with Sprint 1 items
- Marked PRD approval sequencing and broken cross-file references as mitigated/resolved

## Version 1.2.0

### Updated

- Synced Session Memory (Completed / Next) with actual project state — was listing already-completed work as "Next"
- Registered Business Ontology and Artifact Model as completed drafts
- Added new Confirmed Product Decision: Business Goals modeled as Brand attribute group, not a new entity
- Flagged Brand Brain PRD approval as the current blocking priority

## Version 1.1.0

### Updated

- Separated Vision from MVP
- Brand Brain promoted to core product
- Added validated MVP strategy
- Updated project priorities
- Updated execution workflow
- Added strategic decisions

---

# Project Identity

Project Name

AI Brand OS

Category

AI SaaS

Mission

Build the AI Operating System for modern brands by starting with a focused, validated MVP centered around Brand Brain.

---

# Vision

Long-Term Vision

An AI Operating System capable of managing every marketing activity for a business.

Future capabilities include

- Content
- Images
- Video
- Publishing
- Community Management
- Analytics
- AI Sales
- Marketing Automation

This vision should never influence MVP scope.

---

# MVP Mission

Validate one assumption only:

Businesses will pay for an AI that permanently understands their brand and generates consistent marketing content.

---

# Founder

Role

Founder & Lead Engineer

Responsibilities

- Product Execution
- Engineering
- Technical Leadership
- Final Decisions

---

# AI Role

The AI permanently acts as

- Virtual Co-Founder
- Head of Product
- Solution Architect
- Startup Advisor
- Technical Advisor
- Documentation Owner

The AI should challenge assumptions instead of confirming them.

---

# Product Philosophy

Everything starts from Brand Brain.

Every feature must strengthen Brand Brain.

Customer value is more important than engineering complexity.

Validation is more important than feature count.

Shipping is more important than perfection.

---

# Confirmed Product Decisions

Approved

- Vision separated from MVP
- Brand Brain is the product foundation
- AI Workspace is the primary interface
- Knowledge Base uses RAG
- Multi-tenant SaaS
- Subscription business model
- Validation-first strategy
- Ingestion Service reduced to thin intake layer (v2.0.0) — no parsing/extraction/persistence logic in Ingestion
- Business Ontology entity types locked 1:1 to Domain Model naming — no parallel terminology
- "Business Goals" modeled as an attribute group on Brand, not a new Domain Model entity (pending Product confirmation)
- Single shared Artifact base contract across all six Core Domain services (Ingestion, Document Processing, Knowledge
  Extraction, Knowledge Management, Context Engine, AI Orchestrator)
- Backend framework: NestJS (reversed from Laravel, 2026-07-02)
- Database: PostgreSQL (reversed from MySQL, 2026-07-02)
- Brand Brain PRD: fully approved, all Open Questions closed
- Business Ontology: fully approved, all Open Items closed
- Industry Taxonomy includes Beauty & Personal Care (added to match
  Beachhead e-commerce segment)

Rejected

- Large MVP
- Publishing in Version 1
- Building automation before validation
- Feature-first planning
- Ontology validation using AI/LLM judgment (kept deterministic-only in MVP, per Knowledge Management Service "Trust First" principle)

---

# Current MVP Scope

Canonical definition: [MVP_SCOPE.md](../MVP_SCOPE.md).

Included:

- Brand Brain creation and editing
- Single-source knowledge import (one URL or one supported file per job)
- Human review and approval
- Persistent approved business knowledge
- Context-aware AI Workspace (including content drafts, history, and response copying)
- Basic response feedback
- Copyable, approved Brand Brief

Authentication, tenant isolation, storage, and single-owner Organization setup are supporting dependencies, not additional product modules. MVP permits one Organization and one Brand per account; multiple Organizations must not bypass the multi-brand exclusion.

Excluded:

- Background file exports — Phase 2
- Conversation PDF/DOCX exports — Phase 2
- Multi-brand management, including multiple client Organizations — Phase 2
- Team collaboration, invitations, shared access, and delegated roles — Phase 2
- Advanced integrations, scheduled sync, and external tool actions — Phase 4
- Publishing, scheduling, analytics, dedicated campaigns, assets, and personas — Phase 3 or later
- Agents, automation, marketplace, public API, image/video generation — Phase 4 or later

---

# Beachhead Market

Primary Customers

- Small Businesses
- E-commerce Stores
- Freelancers/creators only for their own or one authorized business within MVP limits

Later-phase research

- Agencies, multi-client freelancers and teams — Phase 2 research, not launch-ready packaging

Future expansion happens only after product-market fit.

---

# Technology Decisions

Frontend

- Next.js

Backend

- NestJS (TypeScript) — changed from Laravel 2026-07-02; founder has 9
  years frontend/TypeScript experience and no prior backend experience,
  favoring same-language stack over Laravel's batteries-included ecosystem

Workers

- Go

Database

- PostgreSQL — changed from MySQL 2026-07-02; JSONB fits the Artifact
  Model's semi-structured payloads better than MySQL JSON

Cache

- Redis

Vector Database

- Qdrant

Storage

- Cloudflare R2

Architecture

- Modular Monolith

---

# Startup Principles

Always

- Validate first
- Ship fast
- Learn continuously
- Reduce scope
- Protect focus
- Measure outcomes

Never

- Build speculative features
- Over-engineer
- Increase MVP scope without evidence
- Optimize before validation

---

# AI Working Rules

Every recommendation should evaluate

- Customer Value
- Business Impact
- MVP Relevance
- Development Complexity
- Risks
- Alternatives
- Long-Term Scalability

Never approve ideas automatically.

Always identify trade-offs.

---

# Current Priorities

Priority 1

Sprint 1 documentation correction pass (status reconciliation, State
Management fix, broken-reference fixes, schema merge record)

Priority 2

Task-management connector selection + Sprint 1 task breakdown

Priority 3

Component Kit fixes (border-radius standardization; error states → Ember
token)

Priority 4

Authentication implementation

Priority 5

Organizations implementation

---

# Current Risks

High

- Scope Creep
- Weak Differentiation
- Building Too Early

Medium

- AI Cost
- Knowledge Quality
- User Activation

Low

- UI Complexity

Mitigated / Resolved

- PRD approval sequencing — current issue reopened by evidence audit. Import’s Approved label did not record Founder disposition of D-IMP-01/02/03; current PRD review/sign-off gates are in DECISION_REGISTER.md. Historical baseline architecture decisions remain recorded.
- Broken cross-file references (was Medium) — resolved 2026-07-07. All five identified and fixed; see Execution Bible Known Risks → Resolved.

---

# Session Memory

Completed

- Five Bible structure finalized
- Product Vision finalized
- MVP Strategy finalized
- Beachhead Market selected
- Product Positioning finalized
- Brand Brain selected as the foundation
- Publishing removed from MVP
- Product Discovery
- Market Research
- Competitor Analysis
- Domain Model (`domain/01_DOMAIN_MODEL.md`)
- AI Workspace PRD (approved)
- Brand Brain PRD (drafted, pending Founder approval)
- Ingestion Service, Document Processing Service, Knowledge Extraction Service, Knowledge Management Service, Context Engine, AI Orchestrator — all six Core Domain service specs
- Business Ontology (`domain/03_BUSINESS_ONTOLOGY.md`) — drafted, resolves prior gap where Knowledge Extraction/Management referenced an undefined ontology
- Artifact Model (`domain/02_ARTIFACT_MODEL.md`) — drafted, resolves prior gap where all six Core Domain services referenced an undefined artifact contract
- Backend framework reversed to NestJS; database reversed to PostgreSQL
- Brand Brain PRD Open Questions resolved and approved
- Business Ontology Open Items resolved and approved
- Database Design (`domain/04_DATABASE_DESIGN.md`) — approved
- API Design (`domain/05_API_DESIGN.md`) — approved
- Knowledge Import PRD drafted; current status Proposed — Pending Founder Approval (D-IMP-01/02/03), not approved
- Design Foundations
- Component Kit (drafted; fixes pending — see Sprint 1)
- Schema merge (Passes 1–3 → single `schema.prisma`); pass files retired
- Sprint 1 documentation correction pass

Next

- Select task-management connector (ClickUp already connected)
- Component Kit fixes
- Authentication implementation
- Organizations implementation

---

# Session Workflow

Every future session follows this order

1. Review current project state
2. Review documentation
3. Identify risks
4. Recommend highest-impact task
5. Produce production-ready documentation
6. Update relevant Bible documents

---

# Documentation Rules

The Bible documents are the single source of truth.

No important decision should remain only inside chat history.

Every strategic decision updates AI Memory.

Every product decision updates Product Bible.

Every execution decision updates Execution Bible.

Every architecture decision updates Engineering Bible.

---

# Success Definition

The MVP succeeds when customers

- reach effective readiness with all mandatory approved facts, independent of completeness score
- receive first usable presented approved-grounded output and repeatedly use brand-aware content; activation/readiness definitions follow PRODUCT_METRICS.md
- trust AI outputs
- become paying subscribers

Only after this validation should AI Brand OS expand into a complete marketing operating system.

---

END OF DOCUMENT
