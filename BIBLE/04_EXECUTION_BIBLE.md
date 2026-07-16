# AI Brand OS — Execution Bible

Version: 1.4.0

Status: Active

Last Updated: 2026-07-15

---

# Changelog

## Version 1.4.0

### Updated

- Added Decision Log entry (2026-07-15): Organization Switcher relocated to Sidebar, not Header
- Recorded the org-id-in-URL-path routing convention (`/[local]/[orgId]/...`) as a **new architectural decision** — previously undocumented; not yet homed in `domain/05_API_DESIGN.md`
- Registered `design/01_COMPONENT_KIT.md` (v1.0.0, Draft) in Documentation Status

## Version 1.3.0

### Updated

- Closed Sprint 0 (planning/design complete); opened Sprint 1 (Authentication + Organizations)
- Rewrote Sprint Tasks for Sprint 1 — moved all completed design-phase items to Done
- Verified and resolved the five broken cross-file references (now enumerated under Known Risks → Resolved)
- Recorded the schema pass-file merge into a single `schema.prisma`
- Refreshed Immediate Next Steps and the Release Plan current-phase pointer

## Version 1.2.0

### Updated

- Synced Documentation Status table with actual document states (was previously stale — several completed/approved documents were still shown as Pending)
- Registered `domain/02_ARTIFACT_MODEL.md` and `domain/03_BUSINESS_ONTOLOGY.md` as new P0 documents
- Added Decision Log entries for Artifact Model and Business Ontology
- Flagged PRD approval sequencing risk (AI Workspace PRD approved ahead of its dependency, Brand Brain PRD)
- Flagged broken cross-file references discovered during documentation review
- Updated Immediate Next Steps to reflect current state

## Version 1.1.0

### Updated

- Refined MVP scope
- Removed Publishing from MVP
- Added Product Validation phase
- Updated Sprint 0 objectives
- Re-prioritized backlog
- Added validation milestones
- Updated documentation roadmap

---

# Project Status

Project Phase

Phase 1 — Architecture complete → entering Development (Sprint 1: Auth + Organizations)

Project Health

🟡 Healthy, with open foundational gaps (see Known Risks)

Overall Progress

15%

---

# Current Sprint

Sprint 1

Status

Active

Duration

Development — Foundation

Objective

Implement the platform foundation: Authentication and Organizations. Sprint 0 (planning, product, and architecture documentation) is closed — all P0 design documents are approved.

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
- Manual Approval
- Export

Excluded

- Image Generation
- Publishing
- Content Calendar
- Video Generation
- AI Characters
- Comment Automation
- DM Automation
- Analytics
- Sales Agent
- Marketplace
- Public API

---

# Active Backlog

## P0

- ✅ Product Discovery
- ✅ Market Research
- ✅ Competitor Analysis
- ✅ Positioning
- ✅ Brand Brain PRD approval
- ✅ AI Workspace PRD
- ✅ Domain Model
- ✅ Business Ontology Approved for Architecture & Engineering Design
- ✅ Artifact Model approval
- ✅ Knowledge Engine service specs (4 services)
- ✅ Context Engine spec
- ✅ AI Orchestrator spec
- ✅ Database Design
- ✅ System Architecture / API Design
- ✅ Knowledge Import PRD (`03_KNOWLEDGE_IMPORT_PRD.md`)

---

## P1

- Authentication implementation
- Organizations implementation
- Brand Management implementation
- Knowledge Base implementation

---

## P2

- Content Calendar
- Publishing
- Analytics

---

## P3

- Community Agent
- Sales Agent
- Marketplace
- Enterprise Features

---

# Sprint Tasks

## Todo

- Select task-management connector (Jira / Linear / ClickUp — note: ClickUp is already connected to the workspace)
- Resolve Component Kit issues (border-radius standardization; error states → Ember token)
- Authentication implementation
- Organizations implementation

---

## In Progress

_(empty at Sprint 1 start)_

---

## Done

- Product Vision
- MVP Strategy
- Beachhead Market
- Product Positioning
- Product Discovery
- Market Research
- Competitor Analysis
- Domain Model (Approved for Architecture & Engineering Design)
- Business Ontology (Approved for Architecture & Engineering Design)
- Artifact Model (Approved for Engineering Design)
- Brand Brain PRD (Approved for Engineering Design)
- AI Workspace PRD (Approved for Engineering Design)
- Knowledge Import PRD (Approved for Engineering Design)
- Ingestion Service spec (v2.0.0)
- Document Processing Service spec
- Knowledge Extraction Service spec
- Knowledge Management Service spec
- Context Engine spec
- AI Orchestrator spec
- Database Design (Approved)
- API Design (Approved)
- Schema merge (Passes 1–3 → single `schema.prisma`); pass files retired
- Fixed the five broken cross-file references (see Known Risks → Resolved)

---

# Open Questions

- Pricing Model (hypothesis exists, not validated)
- Credit System
- Website Crawling Strategy (page-limit is flagged as Engineering-owned in Brand Brain PRD, not yet fixed)
- Knowledge Sync Strategy
- AI Routing Strategy
- Export Formats
- Multi-language Support
- Industry / Tone Attribute taxonomies — proposed in Business Ontology, need Product/UX lock-in
- Reserved-entity promotion policy (Persona, Content, Campaign, Asset, Channel) — not yet defined

---

# Known Risks

## High

- Scope Creep
- Building Too Much Before Validation
- Weak Product Differentiation
- **Backend framework changeover risk.** NestJS decision reverses an
  already-Approved Laravel decision. No code was written against Laravel,
  so risk is purely planning-cost, not rework-cost. Ensure no remaining
  document references Laravel/Eloquent-specific patterns before Database
  Design begins.

## Medium

- AI Costs
- RAG Quality
- Knowledge Extraction Accuracy

## Low

- UI Complexity

## Resolved (2026-07-07)

- **Five broken cross-file references** (previously tracked as an outstanding item but never enumerated) — all identified and fixed this session:
  1. `prd/02_AI_WORKSPACE_PRD.md` title alias `01_AI_WORKSPACE.md` — removed
  2. `prd/02_AI_WORKSPACE_PRD.md` Related Documents → `02_BRAND_BRAIN_MANAGER.md` (nonexistent) — replaced with current canonical paths
  3. `prd/02_AI_WORKSPACE_PRD.md` Related Documents → `03_KNOWLEDGE_ENGINE.md` (nonexistent) — replaced with current canonical paths
  4. `domain/01_DOMAIN_MODEL.md` Related Documents → `02_BUSINESS_ONTOLOGY.md` — corrected to `03_BUSINESS_ONTOLOGY.md`
  5. `services/01_INGESTION_SERVICE.md` Upstream Dependencies → `05_BRAND_BRAIN_PRD.md` — corrected to `01_BRAND_BRAIN_PRD.md`

---

# Decisions

## Approved

Architecture

- Modular Monolith

Frontend

- Next.js

Backend

- NestJS (TypeScript) — changed from Laravel, 2026-07-02, see Engineering
  Bible ADR

Workers

- Go

Database

- PostgreSQL — changed from MySQL, 2026-07-02, see Engineering Bible ADR

Vector Database

- Qdrant

Storage

- Cloudflare R2

Product Strategy

- Brand Brain First

MVP Strategy

- Validate before Automation

Domain & Ontology

- Domain Model finalized (`domain/01_DOMAIN_MODEL.md`)
- Business Ontology Approved for Architecture & Engineering Design, entity types locked to Domain Model 1:1 (`domain/03_BUSINESS_ONTOLOGY.md`)
- Artifact Model drafted, single base contract for all six Core Domain services (`domain/02_ARTIFACT_MODEL.md`)

---

## Rejected

Microservices

Reason

Unnecessary complexity.

---

Publishing in MVP

Reason

Does not validate the core hypothesis.

Adds unnecessary implementation complexity.

---

Full ontology-driven entity for "Business Goals"

Reason

Not recognized by the Domain Model as a first-class entity. Modeled instead as an attribute group on Brand pending Product confirmation (see Business Ontology ADR-003).

---

# Architecture Decision Records

See per-service ADRs inside each service specification document. Cross-cutting ADRs affecting multiple services are consolidated in `domain/02_ARTIFACT_MODEL.md` and `domain/03_BUSINESS_ONTOLOGY.md`.

---

# Decision Log

## 2026-06-29

Decision

Separate Vision from MVP.

---

Decision

Brand Brain becomes the entire MVP foundation.

---

Decision

Publishing postponed until Phase 2.

---

## 2026-07-01

Decision

`01_INGESTION_SERVICE.md` reduced from v1.0.0 (full pipeline, duplicated downstream responsibilities) to v2.0.0 (thin intake/validation layer only).

Reason

v1.0.0 duplicated parsing, extraction, and persistence logic already owned by Document Processing, Knowledge Extraction, and Knowledge Management services.

---

Decision

Brand Brain PRD scope fixed: Organization, Brand Profile, Products/Services, Audience (required) + Competitors, Business Goals (recommended, non-blocking).

---

## 2026-07-02

Decision

Created `domain/02_ARTIFACT_MODEL.md` — single base artifact contract for Ingestion, Document Processing, Knowledge Extraction, Knowledge Management, Context Engine, and AI Orchestrator. Resolves a foundational gap where five P0 services referenced an undefined artifact contract.

Created `domain/03_BUSINESS_ONTOLOGY.md` — formal entity/relationship/attribute schema referenced by Knowledge Extraction (classification) and Knowledge Management (ontology validation). Resolves a foundational gap where two P0 services referenced an undefined ontology.

Expected Impact

Unblocks implementation of Knowledge Extraction Stage 4 (Entity Classification) and Knowledge Management Stage 3 (Ontology Validation), both previously non-implementable without this document.

"Business Goals" modeled as an attribute group on Brand rather than a new Domain Model entity, pending Product confirmation.

---

## 2026-07-04

Decision

Marketing/SEO website (Home, Pricing, About Us, Contact Us, and other SEO-oriented pages) is explicitly deferred, not part of current MVP design/build scope.

Reason

Not a documented MVP module. Product Bible's four layers (Core Domain, Core Applications, Platform Services, Future Applications) and this document's own "Current MVP Scope" list contain no marketing website module — building it now would be undocumented scope addition, the same category of risk already flagged for the Knowledge Base screen.
Pricing Model is an open, unvalidated hypothesis (see Open Questions below). A Pricing page built now would either publish unvalidated numbers or need a full rebuild once pricing is confirmed.
Go-To-Market sequencing (discovery/02_MARKET_RESEARCH.md) places SEO/Content Marketing as Priority 1–2 acquisition channels for the Public Beta / Paid Growth phase, not Private Alpha (10–20 users, direct outreach/communities). Building SEO pages now has no near-term audience and no compounding benefit yet — SEO takes months to produce traffic regardless of when it's built.
The product itself is not yet functional (still in Component Kit / pre-Development). Marketing copy for Home/About would have no real customer proof points (testimonials, usage data) to draw from yet.

Revisit trigger

Reopen this decision once: (a) core MVP (Auth, Brand Brain, Knowledge Base, AI Workspace) is functional and in Private Alpha, and (b) Pricing Model moves from hypothesis to validated decision.

Alternative considered and not adopted for now

A single minimal waitlist/coming-soon page (not a full multi-page site) was raised as a lower-cost option for early signal-gathering. Not rejected outright, but not scheduled — separate decision if/when the founder wants to test outreach before Private Alpha starts.

---

## 2026-07-07

Decision

The three schema pass files were merged into a single `schema.prisma`. Required back-relations were added (Prisma mandates two-sided relations: User → conversations/exportJobs, Organization → artifacts/products/services/audiences/competitors/documents/knowledgeIndex/conversations, Brand → knowledgeIndex/conversations, Conversation → exportJobs). Post-migration SQL notes were consolidated into one section (5 items: 2 raw SQL constraints, 3 app-layer constraints). The pass files (`schema_pass1/2/3`) were retired — single source of truth.

Sprint 1 documentation correction pass applied: AI Workspace PRD → v1.1.1 (status markers, State Management split into per-Message + Conversation lifecycles, Related Documents); Domain Model status reconciled to a single approved marker; all five broken cross-file references fixed.

Sprint 0 closed (planning and architecture documentation complete); Sprint 1 (Authentication + Organizations) opened.

---

## 2026-07-15

Decision

Organization Switcher relocated to Sidebar (not Header).

Reason

Multi-org navigation needs to be visually separated from brand-scoped actions. A Header holding the Organization selector, the Brand selector, and brand-level actions side by side conflated two different questions — *which Organization am I in* versus *what am I doing inside it* — with no visual boundary between them. Placing the Organization Switcher at the top of the Sidebar, above a section divider, makes that boundary structural: everything below the divider is brand-scoped and is invalidated when the element above it changes. Claude Design output validated this pattern.

Scope

Layout and component decision only. `prd/02_AI_WORKSPACE_PRD.md` → v1.1.2 (Header/Sidebar responsibilities); new `design/01_COMPONENT_KIT.md` v1.0.0 (Organization Switcher spec + section divider pattern, composing existing tokens — no new tokens). No new endpoints implied; `domain/05_API_DESIGN.md`'s endpoint list is unchanged. `GET /organizations` (already specified, per ADR-005) is sufficient to populate the switcher.

---

Decision

Organization id in the URL path is the source of truth for "current Organization" — route shape `/[local]/[orgId]/...`.

Status

**New architectural decision.** Not previously documented anywhere. `domain/05_API_DESIGN.md` specifies `organizationId` scoping at the repository layer (Multi-Tenancy) and multi-org membership (ADR-005), but is silent on how the frontend resolves the current Organization. This entry records the decision; it does not yet have a home in the API Design document.

Reason

The Organization Switcher's context-reset behavior needs a single unambiguous source for "current Organization." URL-as-source-of-truth makes switching a navigation rather than a state mutation, makes org context shareable and deep-linkable, and makes the full context reset fall out of the route change instead of requiring manual teardown of client state. The alternative — current Organization held in client state or a cookie — would let the URL and the visible Organization disagree, which is a tenant-isolation hazard at the UI layer.

Follow-up

Confirm whether this belongs in `domain/05_API_DESIGN.md` (frontend routing convention alongside the Multi-Tenancy section) or in a separate frontend architecture document that does not exist yet. Not actioned here — the API Design endpoint list was explicitly out of scope for this change.

---

# Sprint Log

Sprint 0

Started

2026-06-29

Goal

Finish planning before implementation.

Status Update (2026-07-02)

Core Domain service specs and foundational architecture documents (Domain Model, Business Ontology, Artifact Model) are complete in draft form. Remaining blockers before Sprint 1 (Architecture/Database Design) can start: Brand Brain PRD founder approval, Business Ontology / Artifact Model review, and resolution of the broken cross-references listed under Known Risks.

Status Update (2026-07-07)

Sprint 0 closed. All P0 planning, product, and architecture documents are approved (Domain Model, Business Ontology, Artifact Model, Brand Brain PRD, AI Workspace PRD, Knowledge Import PRD, Database Design, API Design). Schema merged into a single `schema.prisma`; the three pass files retired. All five broken cross-file references fixed. Sprint 1 (Authentication + Organizations) opened.

---

# Release Plan

Phase 0

Discovery

↓

Validation

↓

PRDs

↓

Architecture

↓

Development ← **current phase**

↓

Private Beta

↓

Public Beta

↓

Version 1.0

---

# Definition of Ready

A feature is ready when

- Customer problem is validated
- PRD exists
- UX flow approved
- Acceptance Criteria written
- Dependencies identified

---

# Definition of Done

A feature is complete when

- Implemented
- Tested
- Reviewed
- Documented
- Released

---

# KPIs

Product

- Activation Rate
- Brand Completion Rate
- Time To First Value

Business

- Trial Conversion
- Paid Conversion
- MRR

AI

- AI Cost per User
- Generation Success Rate
- Average Response Time

---

# Documentation Status

| Document                     | Status                                            |
| ---------------------------- | ------------------------------------------------- |
| Project Bible                | ✅ Approved (v2.0.0)                              |
| Product Bible                | ✅ Approved (v2.0.0)                              |
| Engineering Bible            | ✅ Complete (v1.0.0)                              |
| Execution Bible              | ✅ Updated (v1.4.0)                               |
| AI Memory                    | ✅ Approved                                       |
| Product Discovery            | ✅ Completed                                      |
| Market Research              | ✅ Completed                                      |
| Competitor Analysis          | ✅ Completed                                      |
| Positioning                  | ✅ Completed                                      |
| Domain Model                 | ✅ Approved for Architecture & Engineering Design |
| Business Ontology            | ✅ Approved for Architecture & Engineering Design |
| Artifact Model               | ✅ Approved for Engineering Design                |
| Brand Brain PRD              | ✅ Approved for Engineering Design                |
| AI Workspace PRD             | ✅ Approved for Engineering Design                |
| Ingestion Service            | ✅ Approved                                       |
| Document Processing Service  | ✅ Approved for Architecture & Engineering Design |
| Knowledge Extraction Service | ✅ Approved for Architecture & Engineering Design |
| Knowledge Management Service | ✅ Approved for Architecture & Engineering Design |
| Context Engine               | ✅ Approved for Architecture & Engineering Design |
| AI Orchestrator              | ✅ Approved for Architecture & Engineering Design |
| Knowledge Import PRD         | ✅ Approved for Engineering Design                |
| Database Design              | ✅ Approved                                       |
| API Design                   | ✅ Approved                                       |
| Component Kit                | 🟡 Draft (v1.0.0 — Organization Switcher only)    |

---

# Immediate Next Steps

1. Select the task-management connector for Sprint 1 tracking (ClickUp is
   already connected to the workspace).
2. Resolve outstanding Component Kit issues (border-radius standardization;
   error states → Ember token).
3. Begin Authentication implementation.
4. Begin Organizations implementation.

(Sprint 0 planning/design work — Database Design, API Design, Knowledge
Import PRD, and the five broken cross-file references — is complete.)

---

## 2026-07-02 (continued)

Decision

Backend framework changed Laravel → NestJS. Database changed MySQL →
PostgreSQL. Full reasoning in `03_ENGINEERING_BIBLE.md` ADR
"Backend Framework & Database (2026-07-02)".

---

Decision

Brand Brain PRD approved for Engineering Design. All four Open Questions
resolved in-session with Founder.

---

Decision

Business Ontology approved for Architecture & Engineering Design. All
three Open Items resolved in-session with Founder.

## 2026-07-02 (continued, part 4)

Decision

Database Design has been officially documented (`domain/04_DATABASE_DESIGN.md`, v1.0.0, Draft — Pending Architecture Review). 06 ADRs (Architecture Decision Records) have been registered, the most critical being: utilizing a single unified `artifacts` table instead of seven separate tables, and deprecating `AIRequest`/`AIResponse` in favor of directly utilizing the `Artifact Model`.

**Flagged (New, Medium)**  
Three documentation gaps that must be resolved in a single corrective pass:

1. **Role enum mismatch**
2. **Lack of a defined lifecycle for `Brand`**
3. **The need to revise the "Domain Model" section in `02_AI_WORKSPACE_PRD.md`**

Here is the clear, professional English translation:

---

## 2026-07-02 (continued, part 5)

**Decision**  
The three documentation gaps flagged in `domain/04_DATABASE_DESIGN.md` have been resolved:

1. **Role enum was unified** — `Owner/Admin/Editor/Viewer` is now canonical in `02_AI_WORKSPACE_PRD.md` v1.1.0 (replacing the previous local `Member`).
2. **Brand Lifecycle was defined** (`Draft → Active → Archived`) in `01_DOMAIN_MODEL.md`; Schema Pass 1 was patched (added `status` field).
3. `02_AI_WORKSPACE_PRD.md` v1.1.0: **WorkspaceSession and AIRequest/AIResponse were removed**, references now point to the Artifact Model; **EC-005 was updated accordingly**.

**Expected Impact**  
No documentation gaps remain from the Database Design phase. Ready to begin **API Design**.

---

---

END OF DOCUMENT
