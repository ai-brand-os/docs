# AI Brand OS — Product Bible

> Task 15 proposal (2026-10-16): [GO_TO_MARKET_STRATEGY.md](../GO_TO_MARKET_STRATEGY.md), [PRICING_EXPERIMENTS.md](../PRICING_EXPERIMENTS.md) and [90_DAY_VALIDATION_ROADMAP.md](../90_DAY_VALIDATION_ROADMAP.md) propose a small single-brand e-commerce cohort already using AI, one-product reviewed-facts workflow, blinded equal-information comparison and a $19–59 pricing experiment. D-GTM-01/02/03 remain pending: no new segment, positioning, price or source/claim UI is Founder-approved. Existing broader/mixed recruitment remains baseline until an explicit prospective amendment; no customer results or delivery are implied.

## Task 14 — Proposed differentiation, pending strategic approval

Proposed positioning: **“AI Brand OS is a verified, portable source of truth for business knowledge that keeps AI-generated work accurate, consistent, and up to date.”**

This is a strategic hypothesis under D-COMP-01/02, not a delivered guarantee or scope expansion. “Verified” means explicit Owner review/evidence, not guaranteed factual truth; portability is MVP manual Brief reuse, with machine interchange/connected tools later; freshness requires maintained approved facts, not automatic synchronization. [COMPETITIVE_STRATEGY.md](../COMPETITIVE_STRATEGY.md) supplies dated primary-source findings and capability uncertainties; [DIFFERENTIATION_ROADMAP.md](../DIFFERENTIATION_ROADMAP.md) separates existing provenance/review/versioning commitments from later monitoring/portability proposals. Persistent context, brand knowledge, structured product facts, governance and cross-tool delivery already have competitive overlap. No first/only/unique or proven-moat claim is supported. Safe current wording: AI Brand OS is designed to help one business review, version and reuse approved facts in AI work, with a copyable approved Brand Brief.

> Market evidence audit (2026-10-16): [MARKET_VALIDATION_PLAN.md](../MARKET_VALIDATION_PLAN.md) and [ASSUMPTION_REGISTER.md](../ASSUMPTION_REGISTER.md) distinguish strategy/approval from customer evidence. Market demand, tier pricing, retention and moat remain hypotheses without linked customer records. Success/Definition-of-Ready statements are goals or required gates, not reports that they were achieved. Historical document/design completion does not satisfy the existing customer-validation gate.

> Approval evidence audit (2026-10-13): [DECISION_REGISTER.md](../DECISION_REGISTER.md). Recorded baseline engineering decisions are preserved. Approved labels do not sign off pending import product choices D-IMP-01/02/03, later integrated PRD revisions, or proposed legal/operational retention periods. Dependency/release gates remain disclosed.

> Measurement authority (2026-10-13): [PRODUCT_METRICS.md](../PRODUCT_METRICS.md). TTFV is onboarding start to the first presented usable output grounded in approved knowledge; proposed goals are median ≤10 minutes and p90 ≤15 minutes. Completeness, readiness and cohort completion/activation rates are separate; targets are goals, not observations.

> Scope authority (2026-10-13): [MVP_SCOPE.md](../MVP_SCOPE.md). This document specifies intended behavior; design approval does not establish implementation. Historical decisions and long-term concepts do not expand MVP.

Document: 02_PRODUCT_BIBLE.md

Version: 2.0.0

Status: Active

Last Updated: 2026-06-29

Owner: Product

---

# Purpose

This document defines the product architecture, domain boundaries, module hierarchy, MVP scope, and long-term evolution of AI Brand OS.

It serves as the authoritative reference for product planning and functional design.

Implementation details belong in the Engineering Bible.

Detailed feature specifications belong in PRDs.

---

# Product Vision

AI Brand OS is building the operating system that enables AI to permanently understand a business.

AI Brand OS specifies a persistent Brand Brain that organizes approved business knowledge and applies it to contextual AI work. The MVP updates facts through reviewed single-source imports and explicit Owner corrections, not autonomous interaction learning. Broader marketing workflows remain later-phase.

The platform serves as the foundation for AI-native marketing applications by combining brand intelligence, structured knowledge, contextual reasoning, and content generation into a unified system.

---

# Product Mission

Enable every business to build an AI that truly understands its brand, knowledge, products, customers, and communication style, so every AI-generated output remains accurate, consistent, and aligned with the business identity.

---

# Product Architecture

The product is organized into four layers.

```text
AI Brand OS

├── Core Domain
│
├── Core Applications
│
├── Platform Services
│
└── Future Applications
```

Each layer has a distinct responsibility.

---

# Layer 1 — Core Domain

The Core Domain represents the primary intellectual property of AI Brand OS.

It contains the intelligence layer that differentiates the platform.

Components:

- Brand Brain
- Knowledge Engine
  ├── Ingestion Service
  ├── Document Processing Service
  ├── Knowledge Extraction Service
  └── Knowledge Management Service
- Context Engine
- Context-owned Knowledge/Working selection and Workspace bounded HistoryReader; inferred long-term Memory Engine is future

Every other module depends on this layer.

---

# Layer 2 — Core Applications

Core Applications provide user-facing experiences built on top of the Core Domain.

Initial applications include:

- AI Workspace
  - AI Chat
  - Content Generation

Applications should remain lightweight and delegate business intelligence to the Core Domain.

---

# Layer 3 — Platform Services

Platform Services support the operation of the product.

Modules include:

- Authentication
- Organizations
- Billing (future delivery proposal; MVP payment/pricing research does not imply a billing module)
- User Management
- Settings
- Notifications
- File Storage

These services should remain independent from business intelligence.

---

# Layer 4 — Future Applications

Future applications extend the platform without changing the intelligence layer.

Examples include:

- Campaign Planner
- SEO Assistant
- Email Generator
- Ads Generator
- Landing Page Builder
- AI Agents
- Automation
- Analytics

Each application must consume the existing intelligence layer rather than creating its own knowledge model.

---

# Core Product Principle

Business understanding is the product.

Applications are merely different ways of using that understanding.

---

# Product Boundaries

AI Brand OS owns:

- Business Intelligence
- Organizational Knowledge
- Context Generation
- Memory
- AI Orchestration

AI Brand OS does not attempt to own:

- Foundation AI Models
- CRM
- CMS
- Social Publishing
- Graphic Design

These may integrate in the future but are not core responsibilities.

---

# Core Domain

The Core Domain contains the product’s knowledge contracts; competitive uniqueness or defensibility is unproven.

Its responsibility is not generating AI outputs.

Its responsibility is enabling AI to understand a business.

The Core Domain consists of four components.

- Brand Brain
- Knowledge Engine
  ├── Ingestion Service
  ├── Document Processing Service
  ├── Knowledge Extraction Service
  └── Knowledge Management Service
- Context Engine
- Context-owned Knowledge/Working selection and Workspace bounded HistoryReader; inferred long-term Memory Engine is future

---

# Brand Brain

## Purpose

Brand Brain is the canonical knowledge model of a business.

It contains structured, validated, and continuously evolving business intelligence.

Brand Brain is the primary strategic asset of AI Brand OS.

---

## Responsibilities

Brand Brain stores and organizes information about:

- Organization
- Brand
- Products
- Services
- Customers
- Target Audience
- Positioning
- Brand Voice
- Competitors
- Marketing Strategy
- Business Goals
- Historical Decisions
- Approved Content
- Key Terminology

It represents the single source of truth for business understanding.

---

## Design Principles

Brand Brain must be:

- Structured
- Versioned
- Searchable
- Explainable
- Continuously improving

Every AI capability depends on its quality.

---

# Knowledge Engine

## Purpose

Knowledge Engine is the knowledge acquisition capability of AI Brand OS.

The planned design uses four service modules:

- Ingestion Service
- Document Processing Service
- Knowledge Extraction Service
- Knowledge Management Service

Raw inputs may include:

- Website content
- Documents
- PDFs
- User input
- AI conversations — future approved acquisition design, outside MVP
- Approved outputs — future approved acquisition design, outside MVP; copying/rating does not approve facts

The engine validates, classifies, enriches, and links this information before it becomes part of Brand Brain.

---

## Responsibilities

- Knowledge ingestion
- Classification
- Deduplication
- Validation
- Entity extraction
- Relationship mapping
- Version control

The Knowledge Engine protects the integrity of Brand Brain.

---

# Context Engine

## Purpose

The Context Engine prepares optimal AI context for every interaction.

Rather than sending the entire Brand Brain to an LLM, it selects only the most relevant information.

---

## Responsibilities

- Context retrieval
- Context ranking
- Context compression
- Provider-neutral context assembly (final Prompt Builder belongs to AI Orchestrator)
- Token optimization
- Provider-neutral context payload (Workspace execution belongs to AI Orchestrator; provider adapters belong to the shared internal Gateway under [ADR-011](../domain/10_AI_PROVIDER_GATEWAY_ADR.md), pending Architecture/Security review)

The goal is to maximize response quality while minimizing token usage.

---

# Domain Relationships

Business Knowledge

↓

Knowledge Engine

↓

Brand Brain

↓

Context Engine

↓

LLM

↓

AI Response

↓

User Feedback (MVP rating only; no automatic knowledge mutation)

Separately: Owner correction or scoped import → candidate review → explicit approval → versioned revision → future context.

Improvement is measured under [KNOWLEDGE_LEARNING_LIFECYCLE.md](../KNOWLEDGE_LEARNING_LIFECYCLE.md), not guaranteed by collecting feedback. Automatic conversation-derived candidates, inferred preferences and model fine-tuning are outside MVP.

---

# Domain Rules

The following rules are mandatory.

Brand Brain is the only source of business truth.

Knowledge enters Brand Brain only through the Knowledge Engine.

All AI requests pass through the Context Engine.

Applications must never bypass the Core Domain.

---

# Strategic Importance

The Core Domain is the proposed focus of competitive execution; advantage requires comparative customer evidence.

Every future product capability should strengthen this layer rather than replace or duplicate it.

---

# Success Criteria

The Core Domain succeeds when:

- Business understanding continuously improves.
- AI responses become more accurate over time.
- Context quality increases.
- Customer trust increases.
- Switching costs increase due to accumulated intelligence.

---

# Product Modules

The product is composed of independent but interconnected modules.

Each module has a clear responsibility and communicates through the shared intelligence layer.

---

# Core Modules

## Authentication

Purpose

Manage user authentication and authorization.

Responsibilities

- Sign up
- Login
- Password management
- Session management
- Identity verification

---

## Organizations

Purpose

Represent a company or workspace.

Responsibilities

- Organization management
- Sole Owner membership and Organization ownership in MVP
- Team membership/invitations and Agency client relationships — Phase 2 proposal
- Subscription assignment/consolidated Agency billing — future packaging proposal; automated billing is not an MVP module

---

## Brand

Purpose

Represent a single brand inside an organization.

Responsibilities

- Brand profile
- Brand settings
- Language
- Region
- Industry
- Default AI configuration

One organization may contain multiple brands in future releases.

The MVP supports one Brand in one Organization for the sole Owner account. Starter and Pro pricing hypotheses do not change this limit.

---

## Brand Brain

Purpose

Store the structured intelligence of the brand.

Dependencies

- Knowledge Engine
  ├── Ingestion Service
  ├── Document Processing Service
  ├── Knowledge Extraction Service
  └── Knowledge Management Service
- Context Engine

Status

Core MVP Module

---

## Knowledge Engine

Purpose

Transform raw knowledge into structured business intelligence.

Dependencies

- Brand Brain

Status

Core MVP Module

---

## Context Engine

Purpose

Generate optimized AI context for every request.

Dependencies

- Brand Brain

Status

Core MVP Module

---

## AI Workspace

Purpose

Provide the primary interface for interacting with AI.

Capabilities

- AI Chat
- Content Requests
- Context Preview (Future)
- History

Dependencies

- Context Engine

Status

Core MVP Module

---

## Content Generation

Purpose

Generate business-aware marketing content.

Supported MVP Outputs

- Blog Posts
- Social Media Posts
- Email Drafts
- Product Descriptions
- Marketing Copy

Every generation must consume Brand Brain context.

---

# Platform Modules

The following modules support the platform but do not contain business intelligence.

- Authentication
- Organizations
- Billing (future delivery proposal; MVP payment/pricing research does not imply a billing module)
- User Management
- Settings
- File Storage
- Notifications
- Context Engine memory selection in MVP; standalone preference/conversation-memory service is a future design, with bounded history specified in ADR-016, pending D-AUD-01 Product/Architecture/Security review

---

# Future Modules

These modules are intentionally excluded from the MVP.

- Campaign Planner
- SEO Assistant
- Ads Generator
- Email Campaigns
- Landing Page Builder
- AI Agents
- Workflow Automation
- Integrations
- Analytics
- Marketplace

Each future module must consume the Core Domain.

---

# MVP Scope

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

# MVP Success Criteria

The MVP is successful if users:

- Complete onboarding.
- Build a usable Brand Brain.
- Generate context-aware content.
- Return to the platform regularly.
- Provide scoped customer-payment and retention evidence for a proposed single-business offer; payment does not validate Agency capabilities.
- Trust the platform more over time.
- Pursue proposed TTFV goals of median ≤10 minutes and p90 ≤15 minutes under PRODUCT_METRICS.md; no observed results are claimed.
- Successfully build an initial Brand Brain.
- Receive the first usable presented output grounded in approved knowledge (Workspace response when ready or useful partial approved Brief); requesting generation alone is not activation.

The MVP is not intended to maximize feature count.

Its purpose is learning and validation.

---

# Module Dependency Rules

The dependency direction is fixed.

Platform Services

↓

Core Domain

↓

Core Applications

↓

Future Applications

Reverse dependencies are not allowed.

This protects the architecture from becoming tightly coupled.

---

# Product Roadmap

The roadmap is organized around validated customer value rather than feature quantity.

## Phase 1 — MVP

The seven features in [MVP_SCOPE.md](../MVP_SCOPE.md) define this phase. The modules below are supporting architecture, not separate deliverables.

Objective

Validate that businesses are willing to pay for AI that understands their business.

Modules

- Authentication
- Organizations
- Brand
- Brand Brain
- Knowledge Engine
  ├── Ingestion Service
  ├── Document Processing Service
  ├── Knowledge Extraction Service
  └── Knowledge Management Service
- Context Engine
- AI Workspace
- Content Generation

Success Criteria

- Successful onboarding
- Active Brand Brain usage
- High-quality context-aware outputs
- Paying customers
- Strong customer retention

---

## Phase 2 — Portability and Team Collaboration

Objective

Propose expansion from a single business/Owner to explicitly authorized teams and agency/client portfolios, only after demand and payment validation.

Potential Modules

- Multi-brand support (separate per-Organization cardinality migration)
- Agency subscription and explicitly isolated client portfolio/dashboard
- Multiple Organization memberships with explicit grants; membership alone is not an Agency workspace
- Client/Brand switching with full context reset and knowledge isolation
- Agency/client billing ownership and bounded entitlements
- Team collaboration
- Shared workspaces
- Roles & permissions
- Delegated and multi-stage approval workflows (single-owner knowledge approval is MVP)
- Background file exports
- Conversation PDF/DOCX exports (see `domain/06_FUTURE_EXPORT_DESIGN.md`)

---

## Phase 3 — Marketing Intelligence

Objective

Turn accumulated knowledge into actionable marketing insights.

Potential Modules

- Campaign Planner
- SEO Assistant
- Email Campaigns
- Ads Assistant
- Landing Page Generator
- Content Calendar

---

## Phase 4 — AI Automation

Objective

Allow AI to execute repetitive marketing workflows.

Potential Modules

- Workflow Automation
- AI Agents
- Integrations
- Scheduled Tasks
- External Tool Actions

---

## Phase 5 — Business Intelligence Platform

Objective

Become the intelligence layer for the entire business.

Potential Modules

- Strategic Recommendations
- Decision Support
- Predictive Insights
- Cross-functional AI
- Enterprise Capabilities

---

# Release Strategy

Every release should improve at least one of the following:

- Customer activation
- Customer retention
- Intelligence quality
- Context quality
- Revenue
- Product simplicity

Avoid releasing features that only increase complexity.

---

# Product Lifecycle

Every module follows the same lifecycle.

1. Discovery
2. Validation
3. PRD
4. UX Design
5. Technical Design
6. Development
7. Internal Testing
8. Beta Release
9. General Availability
10. Continuous Improvement

No module should skip validation.

---

# Product KPIs

Primary KPIs

- Activation Rate
- Time to First Value
- Seven-day readiness completion rate (not a field-score threshold)
- Weekly Active Organizations
- Monthly Active Users
- Paid Conversion Rate
- Customer Retention
- Net Revenue Retention
- Customer Satisfaction

Operational KPIs

- TTFV median and p90, with converter/cohort/abandonment counts (proposed goals: ≤10 and ≤15 minutes)
- Knowledge Processing Time
- Context Retrieval Latency
- AI Response Quality
- Approved Brand Brief Copied
- Brand Brain Completeness

---

# Product Constraints

The following constraints intentionally limit product scope.

- One shared intelligence layer.
- One primary onboarding flow.
- One Brand Brain per brand.
- One AI Workspace experience.
- AI-provider agnostic architecture.
- Knowledge-first design.

These constraints may evolve only after Product-Market Fit.

---

# Product Governance

The list below expresses product evaluation priorities, not a competing document-authority hierarchy. Apply [documentation governance](../DOCUMENTATION_GOVERNANCE.md#authority-and-ownership) for conflicts. Evaluate decisions using:

1. Customer Value
2. Project Bible
3. Product Bible
4. Approved PRDs
5. Engineering Constraints

No feature should be approved because a competitor offers it.

---

# Decision Log

Major product decisions should be documented.

Each decision must include:

- Date
- Decision
- Reason
- Alternatives Considered
- Expected Impact

Historical decisions should never be silently overwritten.

---

# Definition of Product Success

AI Brand OS succeeds when:

- Businesses trust the platform as their primary AI workspace.
- Brand Brain becomes the organization's source of truth.
- AI outputs improve measurably over time.
- Customers become increasingly dependent on accumulated intelligence rather than generated content.
- The platform demonstrates strong retention and willingness to pay.

---

# Version History

## Version 2.0.0

Major Changes

- Reorganized product around Domain-Driven Design principles.
- Introduced layered product architecture.
- Established Brand Brain as the core product asset.
- Defined Knowledge Engine and Context Engine responsibilities.
- Reduced MVP scope to validation-focused modules.
- Added roadmap based on customer validation stages.
- Introduced governance, KPIs, and product lifecycle.

---

# Related Documents

[01_PROJECT_BIBLE.md](01_PROJECT_BIBLE.md)
[03_ENGINEERING_BIBLE.md](03_ENGINEERING_BIBLE.md)
[04_EXECUTION_BIBLE.md](04_EXECUTION_BIBLE.md)
[04_POSITIONING.md](../discovery/04_POSITIONING.md)
[01_BRAND_BRAIN_PRD.md](../prd/01_BRAND_BRAIN_PRD.md)
[02_AI_WORKSPACE_PRD.md](../prd/02_AI_WORKSPACE_PRD.md)
[05_AI_MEMORY_BIBLE.md](05_AI_MEMORY_BIBLE.md)

---

# Status

Approved

Version

2.0.0

Effective Date

2026-06-29

---

## Commercial packaging authority

[COMMERCIAL_PACKAGING.md](../COMMERCIAL_PACKAGING.md) defines proposed Starter/Pro test offers, the seven-feature entitlement matrix, a fixed one-Organization/one-Brand/one-Owner MVP boundary, and Phase 2 Agency prerequisites. No plan promises unlimited brands/resources, multiple clients, collaboration or unimplemented premium features. All AI Brand OS pricing remains proposed until actual customer payment evidence is recorded against the delivered offer.

---

# END OF DOCUMENT


## Task21 — Taxonomy and knowledge-quality contracts

**Specified — Pending Product/Architecture Review (D-AUD-03).** [ADR-015](../domain/14_KNOWLEDGE_QUALITY_AND_TAXONOMY_ADR.md) and [canonical quality1.0 contracts](../contracts/knowledge-quality/README.md) define semantics, versions, calculations and review gates.

Region/language under Brand settings are views of the Organization profile semantics, not duplicate independent country/locale/market sources of truth. Proposed primaryRegion is market prose and primaryLanguage one confirmed BCP47 output preference under D-KQ-02; no multilingual-management feature. Product owns pending company-size boundaries and scoring/review messaging. Confidence/coverage/completeness/readiness/accuracy remain separate; high percentages never grant approval or imply measured product benefit.


## Task22 — Bounded conversation history

**Specified — Pending Product/Architecture/Security Review (D-AUD-01), 2026-10-21.** [ADR-016](../domain/15_CONVERSATION_CONTEXT_AND_HISTORY_ADR.md) and [history1.0 contracts](../contracts/conversation-context/README.md) define canonical rules and pending gates.

Existing multi-turn Workspace needs bounded authorized prior messages, not merely persisted history. Approved Knowledge, Conversation History and attempt-local Working Memory are MVP contract inputs; generated summaries/preferences/background memory agents/cross-conversation search remain future. No autonomous conversation learning or automatic business-fact approval. Current-only fallback/orphan-user behavior/latest-turn retry/concurrent acceptance and conditional regeneration require D-HIST/Product review; no new UI or broader capability. History remains untrusted and subordinate to the selected approved Brain facts.


## Task23 — Public API integration review

[ADR-017](../domain/16_API_AND_FRONTEND_INTEGRATION_ADR.md) and [public contracts](../contracts/public-api/README.md) provide proposed typed adapters, UI transitions and minimized telemetry for the same seven features/sole Owner. D-AUD-08 is Specified — Pending Product/Architecture/Frontend/Security Review. Framework, DI/module boundaries, human approval and single-response SSE preserved; API contract delivery is not infrastructure migration, working telemetry, accessible visual-design proof or runtime security approval.
