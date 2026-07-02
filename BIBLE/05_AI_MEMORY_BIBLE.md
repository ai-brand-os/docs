# AI Brand OS — AI Memory

Version: 1.3.0

Status: Active

Last Updated: 2026-07-02

---

# Changelog

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

Included

- Authentication
- Organizations
- Brands
- Brand Brain
- Knowledge Base
- AI Workspace
- Caption Generation
- Manual Review
- Export

Excluded

- Image Generation
- Publishing
- Calendar
- AI Characters
- Video
- Analytics
- Community Agent
- Sales Agent
- Marketplace
- API

---

# Beachhead Market

Primary Customers

- Small Businesses
- E-commerce Stores
- Marketing Freelancers
- Small Agencies
- Content Creators

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

Fix remaining broken cross-file references (Known Risk, Medium)

Priority 2

Database Design (PostgreSQL schema from Domain Model + Ontology +
Artifact Model)

Priority 3

API Design (NestJS module boundaries)

Priority 4

Write Knowledge Import PRD (07)

Priority 5

Database Design

Priority 6

System Architecture / API Design

Priority 7

Implementation

---

# Current Risks

High

- Scope Creep
- Weak Differentiation
- Building Too Early
- PRD approval sequencing (AI Workspace PRD approved ahead of its Brand Brain PRD dependency)

Medium

- AI Cost
- Knowledge Quality
- User Activation
- Broken cross-file references (filenames only, not scope — see Execution Bible Known Risks)

Low

- UI Complexity

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

Next

- Fix broken cross-references
- PostgreSQL schema design
- NestJS module/API design
- Knowledge Import PRD

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

- complete Brand Brain
- repeatedly generate brand-aware content
- trust AI outputs
- become paying subscribers

Only after this validation should AI Brand OS expand into a complete marketing operating system.

---

END OF DOCUMENT
