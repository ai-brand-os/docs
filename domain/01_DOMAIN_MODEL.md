# Domain Model — AI Brand OS

> Final audit (2026-10-16): Storage cardinality and readiness differ: drafts may have no Voice, offers, Audience, sources or approved facts. Readiness requires one complete approved Product OR Service and Audience plus mandatory manual Voice. D-AUD-06 tracks TARGETS/USES and entity lifecycle projection gaps; conceptual edges are not implemented joins. See [final-audit decisions](../DECISION_REGISTER.md#final-audit-decisions) for options and ownership.

> Approval evidence audit (2026-10-13): [DECISION_REGISTER.md](../DECISION_REGISTER.md). Recorded baseline engineering decisions are preserved. Approved labels do not sign off pending import product choices D-IMP-01/02/03, later integrated PRD revisions, or proposed legal/operational retention periods. Dependency/release gates remain disclosed.

> Scope authority (2026-10-13): [MVP_SCOPE.md](../MVP_SCOPE.md). This document specifies intended behavior; design approval does not establish implementation. Historical decisions and long-term concepts do not expand MVP.

Document

[01_DOMAIN_MODEL.md](01_DOMAIN_MODEL.md)

Version

1.0.0

Status

Draft — current integrated Architecture/Engineering review pending; historical baseline evidence retained

Owner

Architecture

Priority

P0

---

# Purpose

This document defines the business domain of AI Brand OS.

It establishes the core business entities, their responsibilities, relationships and business boundaries.

The Domain Model is independent from:

- Database design
- AI providers
- APIs
- Infrastructure
- Implementation details

It represents the business reality of the platform.

---

# Mission

Provide a shared business language across Product, Engineering and AI systems.

The Domain Model serves as the foundation for:

- Business Ontology
- Knowledge Graph
- Service Design
- API Design
- Data Modeling

---

# Domain Principles

## Business First

The domain reflects how organizations manage their brand and knowledge.

Technology must adapt to the domain—not the opposite.

---

## Technology Independent

The model must not depend on:

- SQL
- NoSQL
- Vector Databases
- Graph Databases
- LLM Providers

---

## Stable Language

Entity names should remain stable over time.

Implementation may change.

Business language should not.

---

## Single Meaning

Every business concept has exactly one definition.

Different services must never redefine the same concept.

---

## Explicit Ownership

Every business entity has a clear owner.

Ownership prevents ambiguity across services.

---

# Core Domain

AI Brand OS exists to transform organizational knowledge into consistent AI-generated business outputs.

The platform enables organizations to:

- Capture business knowledge
- Organize institutional knowledge
- Maintain brand consistency
- Generate AI-powered content
- Reuse organizational intelligence
- Improve content quality over time

The platform does not own customer business processes.

It supports and augments them.

---

# Domain Boundaries

Inside the Domain:

- Organizations
- Brand Knowledge
- Products
- Audiences
- Content
- Assets
- Brand Voice
- Knowledge
- Documents

Outside the Domain:

- LLM Providers
- Authentication Systems
- Billing Systems
- Payment Providers
- Notification Services
- Third-party Integrations

These systems interact with AI Brand OS but are not part of its business domain.

---

# Ubiquitous Language

All stakeholders must use the same terminology.

Examples:

Organization

The business using AI Brand OS.

Brand

Represents the business identity managed by an Organization.

A Brand owns its Brand Voice and Brand Brain.

Product

A commercial offering created by an Organization.

Knowledge

Approved business information available for AI.

Document

A source of business information.

Brand Voice

Rules defining how an organization communicates.

Audience

A group of people the organization communicates with.

Content

Any reusable communication artifact produced for an audience.

Campaign

A coordinated marketing initiative.

Asset

Reusable business resources.

Every service must adopt these definitions without modification.

---

# Domain Scope (MVP)

Organization, Brand, BrandVoice, Product, Service, Audience, Competitor, Document, and Knowledge support the seven features in [MVP_SCOPE.md](../MVP_SCOPE.md). Content drafts are Workspace responses; persistent Content, Assets, Campaigns, Personas, and Channels are reserved for Phase 3 or later.

---

# Core Domain Entities

The following entities represent the core business concepts of AI Brand OS.

Each entity has a single business responsibility and a clearly defined ownership.

---

# Organization

## Description

Represents a business using AI Brand OS.

The Organization is the top-level domain entity.

All other business entities belong to exactly one Organization.

## Owns

- Brand Voice
- Products
- Services
- Audiences
- Campaigns
- Content
- Assets
- Knowledge
- Documents

---

# Product

## Description

Represents a commercial offering provided by an Organization.

Products are one of the primary sources of business knowledge.

## Business Responsibilities

- Define value proposition
- Describe features
- Define positioning
- Define pricing strategy
- Define messaging

Products may evolve over time.

Historical knowledge should remain traceable.

---

# Service

## Description

Represents a non-product commercial offering.

Services share many characteristics with Products but differ in delivery model.

Examples:

- Consulting
- Agency Services
- Coaching
- Maintenance
- Training

---

# Audience

## Description

Represents a target customer group.

An Audience defines who the organization communicates with.

Audience knowledge influences:

- Messaging
- Tone
- Content
- Campaigns

---

# Persona

## Description

Represents a detailed profile within an Audience.

A Persona provides richer business context for AI generation.

Personas are reserved for Phase 3, excluded from MVP, and described here only as a future domain concept.

---

# Brand Voice

## Description

Represents the communication principles of an Organization.

Brand Voice defines:

- Tone
- Style
- Vocabulary
- Writing rules
- Messaging principles

Brand Voice is organizational knowledge.

It is not generated content.

---

# Content

## Description

Represents reusable communication artifacts created for an Audience.

Examples:

- Blog articles
- Social posts
- Emails
- Landing pages
- Advertisements
- Video scripts
- Case studies

Content may be AI-generated, human-authored or collaboratively created.

---

# Campaign

## Description

Represents a coordinated marketing initiative.

Campaigns organize content around a shared business objective.

Campaigns may target:

- Products
- Services
- Audiences
- Channels

---

# Asset

## Description

Represents reusable business resources.

Examples:

- Logos
- Images
- PDFs
- Brand guidelines
- Sales materials
- Presentations
- Videos

Assets provide supporting business context.

---

# Document

## Description

Represents an imported source of organizational knowledge.

Examples:

- PDFs
- DOCX
- PPTX
- Web Pages
- Notion exports
- Google Docs
- Markdown files

The list above describes long-term source possibilities. MVP accepts one Website URL or one PDF, DOCX, Markdown, or Plain Text file per import job. PPTX, connected Google Docs/Notion, and other advanced sources are deferred to Phase 4.

Documents are inputs to the knowledge pipeline.

Documents themselves are not business knowledge.

---

# Knowledge

## Description

Represents explicitly approved organizational knowledge from manual entry, imported evidence or documented derivation; manual facts require no fabricated Document.

Knowledge is the primary business asset consumed by AI.

Knowledge always has:

- Provenance
- Confidence
- Ownership
- Version history

Only approved Knowledge is available for AI execution. Every material field has MANUAL/IMPORTED/DERIVED provenance, approval/verification attribution and historical supersession per [KNOWLEDGE_PROVENANCE.md](../KNOWLEDGE_PROVENANCE.md). The canonical approved Artifact snapshot is selected by Brand.currentRevisionId; business tables and KnowledgeIndex are current-state projections, not independent facts. Pending proposals cannot replace approved fields. History inspection/restoration appends a new approved revision, preserving all prior versions.

---

# Competitor

## Description

Represents a competing organization or offering relevant to business strategy.

Competitor knowledge supports:

- Positioning
- Differentiation
- Comparative messaging
- Strategic analysis

Competitors are optional during MVP but included in the domain model for future expansion.

---

# Channel

## Description

Represents a communication medium used by an Organization.

Examples:

- Website
- LinkedIn
- Instagram
- X
- Email
- YouTube

Channels influence content format and communication constraints.

---

# Domain Ownership

Each entity has one authoritative owner.

| Entity       | Owner                        |
| ------------ | ---------------------------- |
| Organization | Organization                 |
| Product      | Organization                 |
| Service      | Organization                 |
| Audience     | Organization                 |
| Persona      | Organization                 |
| Brand Voice  | Organization                 |
| Content      | Organization                 |
| Campaign     | Organization                 |
| Asset        | Organization                 |
| Document     | Organization                 |
| Knowledge    | Knowledge Management Service |
| Competitor   | Organization                 |
| Channel      | Organization                 |
| Brand        | Organization                 |

---

# Entity Relationships

The Domain Model defines conceptual relationships between business entities.

Relationships describe business meaning.

They do not define database implementation.

---

# Relationship Principles

Relationships represent business reality.

They are independent from storage technology.

All relationships are directional.

Every relationship has explicit business meaning.

---

# Organization Relationships

Organization

HAS

0..N Products

---

Organization

HAS

0..N Services

---

Organization

HAS

0..1 Brand in MVP draft; exactly 1 after onboarding (Phase 2 multi-brand requires separate approval)

---

Organization

HAS

0..N Audiences

---

Organization

HAS

1..N Campaigns

---

Organization

HAS

1..N Content Assets

---

Organization

HAS

0..N Documents

---

Organization

HAS

0..N Knowledge Items

---

Organization

HAS

0..N Competitors

---

Organization

USES

1..N Channels

---

# Brand Relationships

Brand

BELONGS TO

1 Organization

---

Brand

HAS

0..1 Brand Voice during draft; 1 valid manually approved Voice for readiness

---

Brand

HAS

0..N Knowledge Items

---

# Product Relationships

Product

TARGETS

1..N Audiences

---

Product

HAS

0..N Personas

---

Product

USES

1 Brand Voice

---

Product

GENERATES

0..N Content Assets

---

Product

BELONGS TO

1 Organization

---

Product

MAY APPEAR IN

0..N Campaigns

---

# Service Relationships

Service

TARGETS

1..N Audiences

---

Service

USES

1 Brand Voice

---

Service

GENERATES

0..N Content Assets

---

Service

BELONGS TO

1 Organization

---

# Audience Relationships

Audience

BELONGS TO

1 Organization

---

Audience

HAS

0..N Personas

---

Audience

CONSUMES

0..N Content Assets

---

Audience

IS TARGET OF

0..N Campaigns

---

# Persona Relationships

Persona

BELONGS TO

1 Audience

---

Persona

INFLUENCES

Messaging

Tone

Content Strategy

---

# Brand Voice Relationships

Brand Voice

BELONGS TO

1 Brand

---

Brand Voice

GUIDES

Products

Services

Campaigns

Content

---

# Campaign Relationships

Campaign

PROMOTES

1..N Products

OR

1..N Services

---

Campaign

TARGETS

1..N Audiences

---

Campaign

USES

1..N Channels

---

Campaign

PRODUCES

0..N Content Assets

---

# Content Relationships

Content

BELONGS TO

1 Organization

---

Content

SUPPORTS

1 Campaign

(optional)

---

Content

PROMOTES

0..1 Product

---

Content

PROMOTES

0..1 Service

---

Content

USES

1 Brand Voice

---

Content

TARGETS

1 Audience

---

Content

MAY REFERENCE

0..N Knowledge Items

---

# Asset Relationships

Asset

BELONGS TO

1 Organization

---

Asset

SUPPORTS

Products

Services

Campaigns

Content

---

# Document Relationships

Document

BELONGS TO

1 Organization

---

Document

PRODUCES

0..N Knowledge Items after explicit approval; no eligible extraction may produce zero

---

Document

MAY REFERENCE

Products

Services

Campaigns

Assets

Audiences

Competitors

---

# Knowledge Relationships

Knowledge

BELONGS TO

1 Brand

---

Knowledge

ORIGINATES FROM

0..N Documents: MANUAL facts need no source Document; IMPORTED facts require valid source/evidence references

---

Knowledge

MAY DESCRIBE

Products

Services

Audiences

Competitors

Campaigns

Assets

Brand Voice

Channels

---

Knowledge

IS USED BY

Context Engine

---

Knowledge

HAS

Provenance

Version

Confidence

---

# Competitor Relationships

Competitor

COMPETES WITH

Products

Services

Organization

---

Competitor

MAY TARGET

Shared Audiences

---

# Channel Relationships

Channel

BELONGS TO

1 Organization

---

Channel

DISTRIBUTES

Content

---

Channel

IS USED BY

Campaigns

---

# Relationship Constraints

Relationships describe business meaning only.

Storage implementation is defined separately.

Ontology definitions extend these relationships.

Knowledge Graph implementations materialize these relationships.

---

# Entity Lifecycle

Each business entity follows a defined lifecycle.

The lifecycle describes business evolution rather than technical implementation.

---

## Organization

Created

↓

Configured

↓

Operational

↓

Archived

---

## Product

Draft

↓

Active

↓

Updated

↓

Retired

---

## Service

Draft

↓

Active

↓

Updated

↓

Retired

---

## Audience

Defined

↓

Validated

↓

Refined

↓

Archived

---

## Persona

Draft

↓

Validated

↓

Updated

↓

Archived

---

## Brand Voice

Draft

↓

Approved

↓

Applied

↓

Revised

---

## Brand

Draft

↓

Active

↓

Archived

A Brand is Draft while required approved fact slots are incomplete, and becomes Active through the approval transaction once business readiness is met (Brand Brain FR-7). Later approved removal of a mandatory fact returns an unarchived Brand to Draft; archival is a separate explicit control. MVP removal uses Archived; any later physical Brand/knowledge erasure requires the independent retention policy and reference-aware workflow, not a universal never-erased promise. Conversations referencing an
Archived Brand become read-only (see `02_AI_WORKSPACE_PRD.md` EC-005).

---

## Campaign

Planned

↓

Active

↓

Completed

↓

Archived

---

## Content

Draft

↓

Generated

↓

Reviewed

↓

Published

↓

Archived

---

## Asset

Created

↓

Approved

↓

Available

↓

Archived

---

## Document

Imported

↓

Processed

↓

Extracted

↓

Archived

---

## Knowledge

Extracted

↓

Reviewed

↓

Approved

↓

Versioned

↓

Deprecated

Only approved Knowledge is available for AI execution. Every material field has MANUAL/IMPORTED/DERIVED provenance, approval/verification attribution and historical supersession per [KNOWLEDGE_PROVENANCE.md](../KNOWLEDGE_PROVENANCE.md). The canonical approved Artifact snapshot is selected by Brand.currentRevisionId; business tables and KnowledgeIndex are current-state projections, not independent facts. Pending proposals cannot replace approved fields. History inspection/restoration appends a new approved revision, preserving all prior versions.

---

# Aggregate Boundaries

Aggregate boundaries define ownership consistency within the business domain.

Organization is the root aggregate.

Brand is the primary business aggregate within an Organization.

The following entities belong to an Organization:

- Product
- Service
- Audience
- Persona
- Campaign
- Content
- Asset
- Document
- Competitor
- Channel
- Brand

Cross-organization relationships are not permitted.

---

# Domain Invariants

The following business rules must always be true.

- Every entity belongs to exactly one Organization.
- Every material fact records MANUAL author/time, IMPORTED source Artifact/Document/location, or DERIVED pinned input/evidence lineage; manual facts do not require a fabricated Document.
- Only approved Knowledge may be used by AI.
- Every Content item follows exactly one Brand Voice.
- Every Document belongs to one Organization.
- Every Product belongs to one Organization.
- Every Service belongs to one Organization.
- Every Campaign belongs to one Organization.
- AI execution never consumes raw Documents directly.
- Every Brand belongs to exactly one Organization.
- Every Brand Voice belongs to exactly one Brand.
- Every Knowledge item belongs to exactly one Brand.

---

# High-Level Domain Events

The domain produces business events describing significant business changes.

Examples include:

- Organization Created
- Product Created
- Product Updated
- Brand Voice Approved
- Document Imported
- Knowledge Approved
- Campaign Started
- Campaign Completed
- Content Published

Detailed event contracts are defined separately within the Architecture documentation.

---

# MVP Scope

Included:

- Organization
- Product
- Service
- Audience
- Brand Voice
- Document
- Knowledge
- Competitor
- Brand

<!-- - Content
- Asset
- Persona
- Campaign
- Channel -->

---

# Out of Scope

The following concepts are intentionally excluded from the MVP domain model:

- Billing
- Credits
- Subscription Plans
- Authentication
- Notifications
- AI Providers
- Prompt Artifacts
- Response Artifacts
- Workflow Execution
- Infrastructure Components

These concerns belong to other architectural layers and are not part of the core business domain.

---

# Definition of Done

The Domain Model is considered complete when:

- Core business entities are defined.
- Entity responsibilities are unambiguous.
- Business relationships are documented.
- Domain invariants are established.
- Entity lifecycles are documented.
- Shared business terminology is consistent across the platform.

---

# Related Documents

[03_BUSINESS_ONTOLOGY.md](03_BUSINESS_ONTOLOGY.md)

[01_PROJECT_BIBLE.md](../BIBLE/01_PROJECT_BIBLE.md)

[02_PRODUCT_BIBLE.md](../BIBLE/02_PRODUCT_BIBLE.md)

[03_ENGINEERING_BIBLE.md](../BIBLE/03_ENGINEERING_BIBLE.md)

---

# Version History

## Version 1.0.0

Initial design baseline; production readiness was not verified. Original Domain Model for AI Brand OS.

Defines:

- Core business entities
- Business relationships
- Aggregate boundaries
- Entity lifecycles
- Domain invariants
- High-level domain events

---

# Status

Draft — current integrated Architecture/Engineering review pending; historical baseline evidence retained

Version

1.0.0

Effective Date

2026-06-30

---

## Knowledge revision product requirements

BrandBrainRevision orders immutable approved full snapshots and approval metadata; it is supporting persistence, not another business domain. Field history, conflicts, stale verification, review and restore are required Brand Brain behavior. Completeness snapshots persist per approved revision and are separate from effective generation readiness. Repeatable records retain stable historical logical IDs even if current membership is removed. SourceArtifactId on current records is last materialization lineage; actual origin belongs to each fact. See [KNOWLEDGE_PROVENANCE.md](../KNOWLEDGE_PROVENANCE.md) for API, validation, integrity, migration and acceptance contracts.

---

## Workspace lifecycle boundary

A Conversation is a persistent multi-turn interaction container, not a business artifact lifecycle or a single assistant execution. The Workspace PRD owns its Active → pending physical deletion → verified removal lifecycle and the separate per-assistant MessageStatus state machine. A completed/failed/cancelled/timed-out assistant attempt never closes the Conversation to subsequent authorized ready turns. [State Management](../prd/02_AI_WORKSPACE_PRD.md#state-management) and DATA_LIFECYCLE.md define deletion/access safeguards.

---

# END OF DOCUMENT


# Task 11 — Approval-based knowledge improvement

Knowledge improvement reuses candidate artifacts, explicit Owner decisions and immutable approved revisions. Persistent storage, contextual reasoning, future preference memory, verified updates and model fine-tuning are separate mechanisms. No new learning aggregate or alternate business authority is introduced.

[KNOWLEDGE_LEARNING_LIFECYCLE.md](../KNOWLEDGE_LEARNING_LIFECYCLE.md) defines the MVP/later boundary, minimum payload/API contracts, correction acceptance, independently reviewed factual accuracy, staleness and paired repeated-error metrics, plus KL-AT-01–14 acceptance scenarios. This is specified behavior pending review/implementation evidence, not a claim of training, automatic accuracy improvement or new approval.
