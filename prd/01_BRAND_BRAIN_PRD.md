# AI Brand OS — Brand Brain PRD

Document: **01_BRAND_BRAIN_PRD.md**

Version: **1.0.0**

Status: Draft — Pending Approval

Owner: Product

Priority: P0

Last Updated: 2026-07-01

---

# Purpose

This document defines the functional requirements, data model, onboarding flow, and acceptance criteria for **Brand Brain** — the first production module of AI Brand OS.

Brand Brain is the structured representation of a business that every AI interaction consumes. This PRD defines what Brand Brain **contains** and **how a user builds it**. It does not define:

- How knowledge is extracted from documents/websites (see Knowledge Engine service specs and the forthcoming `07_KNOWLEDGE_IMPORT_PRD.md`).
- How AI Workspace consumes Brand Brain to generate content (see `06_AI_WORKSPACE_PRD.md`, not yet written).

This separation is intentional (Founder Decision, 2026-07-01): Brand Brain is the **data product**. Import is the **acquisition mechanism**. Keeping them separate protects both documents from scope bleed.

---

# Problem This PRD Solves

Per `01_PRODUCT_DISCOVERY.md`, the core hypothesis is:

> If businesses configure their brand once, and AI permanently remembers it, they will trust AI outputs more, generate content faster, and become paying subscribers.

Brand Brain is the mechanism that makes "configure once" possible. Without a clearly bounded data model, engineering will either under-build (Brand Brain becomes a glorified settings page) or over-build (Brand Brain tries to capture everything in the Domain Model on day one, delaying launch).

---

# Scope Decision (Founder-Approved)

## In Scope for MVP Brand Brain

| Entity                            | Required for Completion? | Cardinality                            |
| --------------------------------- | ------------------------ | -------------------------------------- |
| Organization Profile              | Yes                      | 1 per Organization                     |
| Brand Profile (incl. Brand Voice) | Yes                      | 1 per Organization (MVP: single brand) |
| Products / Services               | Yes (min. 1)             | 1..N                                   |
| Target Audience                   | Yes (min. 1)             | 1..N                                   |
| Competitors                       | No (Recommended)         | 0..N                                   |
| Business Goals                    | No (Recommended)         | 1                                      |

## Explicitly Out of Scope for Brand Brain MVP

Deferred to Phase 2+ per `02_PRODUCT_BIBLE.md` Roadmap:

- Persona (richer sub-profiles of Audience)
- Campaign
- Asset (logos, brand guideline files as structured objects)
- Channel
- Content (generated output; lives in AI Workspace, not Brand Brain)
- Multi-brand support (MVP = one Brand per Organization, per `02_PRODUCT_BIBLE.md`: _"The MVP supports one primary brand."_)

If a future feature requests any of these, it must go through the Feature Acceptance Rules in `01_PROJECT_BIBLE.md` before being added here.

---

# Relationship to Other Documents

```text
01_BRAND_BRAIN.md (Domain Model)
        │
        ▼  (defines business entities & relationships)
01_BRAND_BRAIN_PRD.md  ← this document
        │
        ▼  (defines fields, UX, acceptance criteria)
04_KNOWLEDGE_MANAGEMENT_SERVICE.md   (persists Approved Knowledge Artifacts)
03_KNOWLEDGE_EXTRACTION_SERVICE.md   (proposes auto-filled field values)
02_DOCUMENT_PROCESSING_SERVICE.md    (parses imported website/docs)
01_INGESTION_SERVICE.md              (accepts raw import — pending cleanup, see Open Questions)
        │
        ▼  (consumed by)
05_CONTEXT_ENGINE.md                 (retrieves Brand Brain fields for AI prompts)
```

Brand Brain does not talk to the Knowledge pipeline directly in the UI sense — the user experience described in this PRD triggers that pipeline, but the pipeline's internal mechanics are governed by the four existing service specs, not by this PRD.

---

# Brand Brain Data Model

Each field below carries a `source` attribute: `manual` (user-typed), `imported` (auto-filled by Knowledge Extraction, user confirms), or `both`.

## 1. Organization Profile

| Field             | Type                             | Required | Source                   |
| ----------------- | -------------------------------- | -------- | ------------------------ |
| Organization Name | text                             | Yes      | both                     |
| Industry          | enum (predefined list + "Other") | Yes      | both                     |
| Company Size      | enum: 1–5 / 6–20 / 21–50 / 50+   | Yes      | manual                   |
| Website URL       | url                              | No       | manual (triggers import) |
| Primary Region    | enum                             | Yes      | manual                   |
| Primary Language  | enum                             | Yes      | manual                   |

## 2. Brand Profile

| Field                                            | Type                                                                                                         | Required | Source |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ | -------- | ------ |
| Brand Name                                       | text                                                                                                         | Yes      | both   |
| Mission Statement                                | text (≤300 chars)                                                                                            | Yes      | both   |
| Vision Statement                                 | text (≤300 chars)                                                                                            | No       | both   |
| Core Values                                      | list of tags                                                                                                 | No       | both   |
| Brand Voice — Tone Attributes                    | multi-select (2–4 from a fixed taxonomy, e.g. Professional, Friendly, Bold, Playful, Authoritative, Minimal) | Yes      | manual |
| Brand Voice — Vocabulary Do's                    | list of short phrases                                                                                        | No       | manual |
| Brand Voice — Vocabulary Don'ts                  | list of short phrases                                                                                        | No       | manual |
| Sample Writing (existing content pasted by user) | text block                                                                                                   | No       | manual |

## 3. Products / Services (repeatable, 1..N)

| Field             | Type | Required | Source |
| ----------------- | ---- | -------- | ------ |
| Name              | text | Yes      | both   |
| Description       | text | Yes      | both   |
| Value Proposition | text | Yes      | manual |
| Key Features      | list | No       | both   |
| Pricing Model     | text | No       | both   |

## 4. Target Audience (repeatable, 1..N)

| Field               | Type | Required | Source |
| ------------------- | ---- | -------- | ------ |
| Segment Name        | text | Yes      | manual |
| Description         | text | Yes      | manual |
| Pain Points         | list | Yes      | manual |
| Goals / Motivations | list | No       | manual |

## 5. Competitors (repeatable, 0..N) — Recommended, not required

| Field                 | Type | Required | Source |
| --------------------- | ---- | -------- | ------ |
| Competitor Name       | text | No       | both   |
| Website               | url  | No       | manual |
| Differentiation Notes | text | No       | manual |

## 6. Business Goals

| Field              | Type                                                   | Required | Source |
| ------------------ | ------------------------------------------------------ | -------- | ------ |
| Primary Goal       | enum: Awareness / Lead Gen / Sales / Retention / Other | No       | manual |
| Success Definition | text                                                   | No       | manual |

---

# Brand Brain Completeness Score

Ties directly to the Success Metric in `01_PRODUCT_DISCOVERY.md`: _Brand Brain Completion > 70%_.

## Formula

```
Completeness % = (Required fields filled / Total required fields) × 80
               + (Recommended entities with ≥1 record / 2) × 20
```

- **Required fields** = every field marked `Required: Yes` above (Organization, Brand Profile, ≥1 Product, ≥1 Audience).
- **Recommended entities** = Competitors (≥1 record) and Business Goals (Primary Goal set).

This weighting is deliberate: a user should be able to hit "Wow Moment" (first generation) without ever touching Competitors or Business Goals. Those two only push the score from ~80% toward 100%, encouraging — not blocking — completion.

## Display Rule

The Completeness Score is shown as a persistent progress indicator in the AI Workspace sidebar. It must never block content generation — Brand Brain can be used for AI generation the moment all _required_ fields are filled, even at <100%.

---

# Onboarding Flow (Hybrid)

```
Step 1 — Create Organization
   Organization Name, Industry, Company Size, Region, Language
        │
        ▼
Step 2 — Website Import (optional)
   User provides Website URL (or skips)
   → Triggers Ingestion → Document Processing → Knowledge Extraction pipeline
   → Knowledge Management returns Approved / Needs Review candidate values
        │
        ▼
Step 3 — Review & Confirm
   Auto-filled fields shown with source badge ("Imported from yoursite.com")
   and confidence indicator for low-confidence fields.
   User edits, confirms, or deletes each proposed value.
   Fields with no import match are shown empty.
        │
        ▼
Step 4 — Complete Required Fields
   Short form for anything still missing:
   Mission Statement, Brand Voice tone selection (mandatory manual — see
   Open Questions), ≥1 Product, ≥1 Audience segment.
        │
        ▼
Step 5 — First Generation ("Wow Moment")
   User is prompted to generate one piece of content (e.g. a social caption)
   using the Brand Brain they just built.
   This step is the activation event tracked for the Activation Rate KPI.
```

## Fallback Behavior

- If no Website URL is provided → skip Step 2 and Step 3 entirely, go straight to Step 4 as a plain form.
- If import fails or times out (>30s) → show a non-blocking notice, fall back to the manual form for all fields.
- Import failure must never prevent onboarding completion.

## Target Time-to-Complete

< 10 minutes end-to-end, per `01_PRODUCT_DISCOVERY.md` Success Metrics (Time To First Value).

---

# Functional Requirements

- **FR-1**: System shall allow a user to create exactly one Organization and one Brand during MVP onboarding.
- **FR-2**: System shall allow optional Website URL submission to trigger the Knowledge import pipeline.
- **FR-3**: System shall display all auto-imported field values with a visible source indicator and require explicit user confirmation before they count toward Completeness Score.
- **FR-4**: System shall allow manual entry/edit of every field regardless of import status.
- **FR-5**: System shall support 1..N repeatable records for Products/Services, Audience, and Competitors.
- **FR-6**: System shall calculate and persist a Completeness Score after every Brand Brain edit.
- **FR-7**: System shall allow content generation once all Required fields (per data model) are filled, independent of overall Completeness Score.
- **FR-8**: System shall persist every Brand Brain field change through the Knowledge Management Service with full version history. (no silent overwrites — aligns with ADR-003 in `04_KNOWLEDGE_MANAGEMENT_SERVICE.md`).
- **FR-9**: System shall allow editing Brand Brain at any time after onboarding, not just during initial setup.
- **FR-10**: System shall record which fields were AI-imported vs. manually entered, for provenance (aligns with Knowledge domain invariant: _"Every Knowledge item originates from at least one Document"_ — manually entered fields originate from a synthetic "User Input" source).

---

# Non-Functional Requirements

- **Multi-tenancy**: Every Brand Brain record strictly isolated per Organization (per `03_ENGINEERING_BIBLE.md` Multi-Tenancy rules — no cross-tenant access).
- **Performance**: Import pipeline (Step 2–3) should return results within 30 seconds for a typical marketing website (<50 pages crawled in MVP — page limit is an Engineering decision, not fixed here).
- **AI Provider Agnostic**: Field extraction must not hardcode a specific LLM provider (per `01_PROJECT_BIBLE.md` AI Strategy).
- **Auditability**: Every field change must be traceable to a version and a source, per Knowledge Management Service audit requirements.

---

# Acceptance Criteria

- Given a user with no website, when they complete Step 4 manually, then they can generate content without ever seeing an import step.
- Given a user who provides a website URL, when import completes, then every extracted field shows a source badge and is editable before being saved.
- Given a user has filled all Required fields but zero Recommended fields, when they view their Completeness Score, then it shows approximately 80%, and content generation remains available.
- Given a user edits an existing Brand Brain field post-onboarding, when the edit is saved, then a new Knowledge version is created and the previous version remains retrievable.
- Given import fails or times out, when the user reaches Step 3, then they see a clear fallback message and can proceed manually without errors.

---

# Success Metrics (inherited from Product Discovery / Market Research)

| Metric                           | Target       |
| -------------------------------- | ------------ |
| Brand Brain Completion Rate      | > 70%        |
| Time to First Value              | < 15 minutes |
| Activation Rate (reaches Step 5) | > 60%        |

---

# Dependencies

- `01_BRAND_BRAIN.md` (Domain Model) — entity definitions and relationships.
- `04_KNOWLEDGE_MANAGEMENT_SERVICE.md` — persistence, versioning, approval policy.
- `03_KNOWLEDGE_EXTRACTION_SERVICE.md` — candidate field extraction during import.
- `01_INGESTION_SERVICE.md` — accepts raw website/document input.
- `02_DOCUMENT_PROCESSING_SERVICE.md` — parses accepted input into structured documents.
- `05_CONTEXT_ENGINE.md` — downstream consumer of Brand Brain fields.

---

# Explicitly Deferred (Do Not Build Now)

- Multi-brand switching UI.
- Persona sub-profiles.
- Campaign / Content / Asset / Channel entities.
- Dynamic Trust Score for imported fields (MVP uses static confidence from Knowledge Extraction Service only).
- Human Review workflow for low-confidence imports (MVP: user review during onboarding _is_ the review step; no separate admin queue).

---

# Open Questions

1. Should **Brand Voice — Tone Attributes** be import-eligible, or always manual? (Currently marked manual-only above — tone is subjective and mis-imported tone could be worse than no tone. Recommend keeping manual-only unless Knowledge Extraction proves reliable here post-MVP.)
2. ~~`01_INGESTION_SERVICE.md` duplicates logic covered by Document Processing + Knowledge Extraction.~~ **Resolved 2026-07-01** — `01_INGESTION_SERVICE.md` v2.0.0 reduced to a thin intake layer (validation + forwarding only). No further action needed before Step 2 is built.
3. Fixed taxonomy for Industry and Tone Attributes needs an actual finite list — not defined in this PRD, needs a short UX/content task before development starts.
4. Should Competitors support auto-import (e.g. detecting competitor names mentioned on the client's own website), or manual-only for MVP? Recommend manual-only for MVP — low value, adds import complexity.

---

# Decision Log

## 2026-07-01

- Brand Brain MVP scope fixed to: Organization, Brand Profile, Products/Services, Audience (required) + Competitors, Business Goals (recommended, non-blocking).
- Onboarding flow approved as Hybrid (auto-import + short manual form).
- Knowledge Import mechanics kept out of this PRD; will be covered by a dedicated `07_KNOWLEDGE_IMPORT_PRD.md`.
- Persona, Campaign, Asset, Channel, Content confirmed deferred past MVP for Brand Brain purposes.

---

# Related Documents

`01_BRAND_BRAIN.md` (Domain Model)

`02_PRODUCT_BIBLE.md`

`04_KNOWLEDGE_MANAGEMENT_SERVICE.md`

`03_KNOWLEDGE_EXTRACTION_SERVICE.md`

`02_AI_WORKSPACE_PRD.md`

`07_KNOWLEDGE_IMPORT_PRD.md` (not yet written — recommended next)

---

# Status

Draft — Pending Founder Approval

Version

1.0.0

Effective Date

Pending

---

# END OF DOCUMENT
