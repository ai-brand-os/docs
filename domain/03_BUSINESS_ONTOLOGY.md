# Business Ontology — AI Brand OS

Document

03_BUSINESS_ONTOLOGY.md

Version

1.0.0

Status

Draft — Pending Architecture & Product Review

Owner

Architecture

Priority

P0

Last Updated

2026-07-02

---

# Purpose

This document is the **semantic reference model** consumed by:

- `03_KNOWLEDGE_EXTRACTION_SERVICE.md` — Stage 4 (Entity Classification), ADR-004
- `04_KNOWLEDGE_MANAGEMENT_SERVICE.md` — Stage 3 (Ontology Validation)

Both services currently reference "the Business Ontology" without a concrete definition. This document closes that gap.

The Business Ontology does not invent new business concepts. It **formalizes** the entities and relationships already defined narratively in `01_DOMAIN_MODEL.md` into a structure that can be mechanically validated: allowed entity types, required attributes, cardinality rules, allowed relationships, and controlled vocabularies.

---

# Mission

Provide one machine-checkable, versioned definition of "what a valid piece of business knowledge looks like," so that Knowledge Extraction can classify consistently and Knowledge Management can validate deterministically — without either service re-deriving business rules independently.

---

# Relationship to Other Documents

```text
01_DOMAIN_MODEL.md
        │  (narrative entities, relationships, invariants)
        ▼
03_BUSINESS_ONTOLOGY.md   ← this document
        │  (formal schema: types, cardinality, taxonomies)
        ▼
03_KNOWLEDGE_EXTRACTION_SERVICE.md   (Stage 4 — classifies candidates against this schema)
04_KNOWLEDGE_MANAGEMENT_SERVICE.md   (Stage 3 — validates candidates against this schema)
        │
        ▼
02_ARTIFACT_MODEL.md   (carries Ontology Version on every Knowledge artifact)
```

Attribute-level field definitions for Organization, Brand, Product/Service, Audience, and Competitor are **inherited directly from `01_BRAND_BRAIN_PRD.md`** (Brand Brain Data Model section) rather than redefined here. This document adds the structural rules (types, relationships, cardinality) around those fields. If the two documents ever diverge on a field, the Brand Brain PRD is authoritative for UX/data-entry scope, and this document must be updated to match — per Decision Priority in `01_PROJECT_BIBLE.md` (Approved PRDs rank above Engineering-owned reference documents).

**Dependency risk:** `01_BRAND_BRAIN_PRD.md` is currently `Draft — Pending Founder Approval`. This ontology inherits its attribute definitions from that PRD's current draft. If the PRD's field list changes before approval, this document's Entity Attribute tables must be updated in the same revision cycle.

---

# Ontology Principles

## Single Meaning

Every entity type has exactly one definition, reused by every service. No service may locally redefine what a "Product" or "Audience" is.

## Stability

Entity type names must remain stable, per the Domain Model's "Stable Language" principle. Renaming an entity type is a breaking ontology change (see Governance & Versioning).

## Deterministic First

Ontology validation is rule-based pattern matching against this schema — not an LLM judgment call. This preserves the "Trust First" principle from the Knowledge Management Service.

## MVP Discipline

Entity types that exist in the long-term Domain Model but are out of scope for the Brand Brain MVP are registered as **Reserved**, not deleted. This preserves naming stability for Phase 2+ without allowing knowledge to be classified into them today.

## Explicit, Not Implicit, Cardinality

Every relationship declares cardinality. "Ontology Validation" in the Knowledge Management Service is only implementable if cardinality is explicit and enforceable.

---

# Ontology Structure

The ontology is composed of four registries:

1. **Entity Type Registry** — the nouns of the business domain.
2. **Attribute Registry** — the fields each entity type may carry.
3. **Relationship Type Registry** — the verbs connecting entity types.
4. **Controlled Vocabulary Registry** — fixed taxonomies for enum-typed fields.

---

# 1. Entity Type Registry

| Entity Type  | Aggregate Root | MVP Status | Description                                                                                                                  |
| ------------ | -------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Organization | Organization   | Active     | The business using AI Brand OS. Root of the tenant boundary.                                                                 |
| Brand        | Organization   | Active     | A brand identity owned by an Organization. MVP constrains cardinality to exactly 1 per Organization (see Cardinality Notes). |
| BrandVoice   | Brand          | Active     | Communication style rules belonging to exactly one Brand.                                                                    |
| Product      | Organization   | Active     | A commercial offering (product delivery model).                                                                              |
| Service      | Organization   | Active     | A commercial offering (service delivery model).                                                                              |
| Audience     | Organization   | Active     | A target customer segment.                                                                                                   |
| Competitor   | Organization   | Active     | A competing organization or offering.                                                                                        |
| Document     | Organization   | Active     | An imported knowledge source. Not itself business knowledge.                                                                 |
| Knowledge    | Brand          | Active     | Validated business knowledge derived from one or more Documents.                                                             |
| Persona      | Audience       | Reserved   | Detailed sub-profile of an Audience. Deferred per Brand Brain PRD.                                                           |
| Content      | Organization   | Reserved   | Generated communication artifact. Owned by AI Workspace, not Brand Brain.                                                    |
| Campaign     | Organization   | Reserved   | Coordinated marketing initiative. Deferred.                                                                                  |
| Asset        | Organization   | Reserved   | Reusable brand resource (logo, guideline file, etc). Deferred.                                                               |
| Channel      | Organization   | Reserved   | Communication medium (website, LinkedIn, etc). Deferred.                                                                     |

**Reserved** entity types must not be produced by Knowledge Extraction Stage 4 (Entity Classification) or accepted by Knowledge Management Stage 3 (Ontology Validation) until their status is changed to Active through the Governance process below.

---

# 2. Attribute Registry

Attribute definitions for Active entity types. Fields marked "PRD" are sourced verbatim from `01_BRAND_BRAIN_PRD.md` and must be kept in sync with it.

## Organization

Source: Brand Brain PRD §1 (Organization Profile)

| Attribute       | Type                             | Required | Source |
| --------------- | -------------------------------- | -------- | ------ |
| name            | text                             | Yes      | both   |
| industry        | enum: `Industry Taxonomy`        | Yes      | both   |
| companySize     | enum: `1–5 / 6–20 / 21–50 / 50+` | Yes      | manual |
| websiteUrl      | url                              | No       | manual |
| primaryRegion   | enum                             | Yes      | manual |
| primaryLanguage | enum                             | Yes      | manual |

## Brand

Source: Brand Brain PRD §2 (Brand Profile), excluding Brand Voice fields (modeled as a separate entity, see below)

| Attribute        | Type              | Required | Source |
| ---------------- | ----------------- | -------- | ------ |
| name             | text              | Yes      | both   |
| missionStatement | text (≤300 chars) | Yes      | both   |
| visionStatement  | text (≤300 chars) | No       | both   |
| coreValues       | list of tags      | No       | both   |
| sampleWriting    | text block        | No       | manual |

**Ontology Decision — Business Goals:** `01_BRAND_BRAIN_PRD.md` §6 defines "Business Goals" (Primary Goal, Success Definition) as a data section, but `01_DOMAIN_MODEL.md` does not list Business Goals as a core entity. To avoid introducing an aggregate the Domain Model does not recognize, this ontology models Business Goals as an **attribute group on Brand**, not a standalone entity type:

| Attribute         | Type                                                     | Required | Source |
| ----------------- | -------------------------------------------------------- | -------- | ------ |
| primaryGoal       | enum: `Awareness / Lead Gen / Sales / Retention / Other` | No       | manual |
| successDefinition | text                                                     | No       | manual |

This is a formal ontology decision (see ADR-003) and should be flagged to Product for confirmation during Brand Brain PRD approval — if Product intends Business Goals to become a first-class entity in Phase 2 (e.g. to support multiple goals per Campaign), the Domain Model must be updated first.

## BrandVoice

Source: Brand Brain PRD §2 (Brand Voice fields)

| Attribute       | Type                                | Required | Source      |
| --------------- | ----------------------------------- | -------- | ----------- |
| toneAttributes  | multi-select (2–4), `Tone Taxonomy` | Yes      | manual only |
| vocabularyDos   | list of short phrases               | No       | manual      |
| vocabularyDonts | list of short phrases               | No       | manual      |

**Note:** `toneAttributes` is explicitly `manual only` — Knowledge Extraction must never propose values for this attribute, per Brand Brain PRD Open Question #1 ("mis-imported tone could be worse than no tone"). This is enforced at the ontology level, not just the UX level: any Knowledge Candidate Artifact that attempts to classify an extracted value into `BrandVoice.toneAttributes` must be rejected at Ontology Validation regardless of extraction confidence.

## Product / Service

Source: Brand Brain PRD §3. Product and Service share an identical attribute schema (per Domain Model, they differ only in delivery model, not in Brand Brain data shape).

| Attribute        | Type | Required | Source |
| ---------------- | ---- | -------- | ------ |
| name             | text | Yes      | both   |
| description      | text | Yes      | both   |
| valueProposition | text | Yes      | manual |
| keyFeatures      | list | No       | both   |
| pricingModel     | text | No       | both   |

## Audience

Source: Brand Brain PRD §4

| Attribute   | Type | Required | Source |
| ----------- | ---- | -------- | ------ |
| segmentName | text | Yes      | manual |
| description | text | Yes      | manual |
| painPoints  | list | Yes      | manual |
| goals       | list | No       | manual |

## Competitor

Source: Brand Brain PRD §5

| Attribute            | Type | Required | Source |
| -------------------- | ---- | -------- | ------ |
| name                 | text | No       | both   |
| website              | url  | No       | manual |
| differentiationNotes | text | No       | manual |

## Document

Structural attributes only — Document is a source pointer, not knowledge (per Domain Model: "Documents themselves are not business knowledge").

| Attribute             | Type                                              | Required | Source |
| --------------------- | ------------------------------------------------- | -------- | ------ |
| sourceType            | enum: `upload / url`                              | Yes      | system |
| originalFilenameOrUrl | text                                              | Yes      | system |
| processingStatus      | enum: per `01_DOMAIN_MODEL.md` Document lifecycle | Yes      | system |

## Knowledge

Structural attributes only — the actual business content is expressed as classified instances of the entity types above. These fields describe the knowledge record itself.

| Attribute           | Type                                           | Required | Source                                |
| ------------------- | ---------------------------------------------- | -------- | ------------------------------------- |
| describesEntityType | enum: any Active Entity Type in this registry  | Yes      | system                                |
| knowledgeConfidence | number 0–100                                   | Yes      | system (Knowledge Management Service) |
| ontologyVersion     | semver                                         | Yes      | system                                |
| provenance          | Provenance object (see `02_ARTIFACT_MODEL.md`) | Yes      | system                                |

---

# 3. Relationship Type Registry

Cardinality is read as `Source → Target`. All relationships are directional; an inverse phrasing (e.g. "BELONGS TO") is implied and not separately registered.

| Relationship    | Source            | Target                                                 | Cardinality                                                | MVP Status |
| --------------- | ----------------- | ------------------------------------------------------ | ---------------------------------------------------------- | ---------- |
| HAS             | Organization      | Brand                                                  | 1 → 1 (MVP constraint; Domain Model allows 1..N long-term) | Active     |
| HAS             | Organization      | Product                                                | 1 → 0..N                                                   | Active     |
| HAS             | Organization      | Service                                                | 1 → 0..N                                                   | Active     |
| HAS             | Organization      | Audience                                               | 1 → 0..N                                                   | Active     |
| HAS             | Organization      | Document                                               | 1 → 0..N                                                   | Active     |
| HAS             | Organization      | Competitor                                             | 1 → 0..N                                                   | Active     |
| HAS             | Brand             | BrandVoice                                             | 1 → 1                                                      | Active     |
| HAS             | Brand             | Knowledge                                              | 1 → 0..N                                                   | Active     |
| TARGETS         | Product           | Audience                                               | 1 → 1..N                                                   | Active     |
| TARGETS         | Service           | Audience                                               | 1 → 1..N                                                   | Active     |
| USES            | Product           | BrandVoice                                             | 1 → 1                                                      | Active     |
| USES            | Service           | BrandVoice                                             | 1 → 1                                                      | Active     |
| PRODUCES        | Document          | Knowledge                                              | 1 → 1..N (only after approval)                             | Active     |
| ORIGINATES FROM | Knowledge         | Document                                               | 1..N → 1..N                                                | Active     |
| MAY DESCRIBE    | Knowledge         | Product / Service / Audience / Competitor / BrandVoice | 0..N → 0..N                                                | Active     |
| COMPETES WITH   | Competitor        | Product / Service / Organization                       | 0..N → 0..N                                                | Active     |
| HAS             | Audience          | Persona                                                | 1 → 0..N                                                   | Reserved   |
| GENERATES       | Product / Service | Content                                                | 1 → 0..N                                                   | Reserved   |
| MAY APPEAR IN   | Product / Service | Campaign                                               | 0..N → 0..N                                                | Reserved   |
| DISTRIBUTES     | Channel           | Content                                                | 1 → 0..N                                                   | Reserved   |

**Cardinality note on Organization → Brand:** the Domain Model narratively allows multi-brand (`Organization HAS 1..N Brands`) as the long-term shape, while the Product Bible and Brand Brain PRD constrain MVP to exactly one Brand per Organization. This ontology enforces the **MVP constraint (1 → 1)** at the validation layer today. When multi-brand ships (Product Bible Phase 2), this row must change to `1 → 1..N` and this change requires a Product Bible-authorized ontology version bump (see Governance).

---

# 4. Controlled Vocabulary Registry

The Brand Brain PRD flags two taxonomies as undefined ("Open Question #3"). This ontology proposes starter lists to unblock development. **These lists are Draft and require explicit Product/UX sign-off before being locked for MVP** — they are proposals, not approved final content.

## Industry Taxonomy (proposed)

E-commerce & Retail · Professional Services · SaaS & Technology · Health & Wellness · Food & Beverage · Education & Coaching · Real Estate · Finance & Insurance · Marketing & Creative Agencies · Fashion & Apparel · Home & Lifestyle · Travel & Hospitality · Nonprofit & Community · Manufacturing & Industrial · Other

## Tone Attributes Taxonomy (proposed)

Professional · Friendly · Bold · Playful · Authoritative · Minimal · Empathetic · Confident · Witty · Formal · Warm · Direct

Per Brand Brain PRD, users select 2–4 from this list.

## Company Size (locked — sourced from Brand Brain PRD)

`1–5` / `6–20` / `21–50` / `50+`

## Primary Goal (locked — sourced from Brand Brain PRD)

`Awareness` / `Lead Gen` / `Sales` / `Retention` / `Other`

Vocabularies are versioned independently from the structural schema (see ADR-002) — adding an Industry value is not a breaking ontology change.

---

# Domain Constraints (Machine-Checkable Invariants)

These formalize `01_DOMAIN_MODEL.md`'s Domain Invariants section into rules the Knowledge Management Service's Ontology Validation stage can execute directly:

- Every entity instance must carry exactly one `organizationId`.
- Every `Knowledge` instance must carry exactly one `brandId`.
- Every `Brand` instance must carry exactly one `organizationId`.
- Every `BrandVoice` instance must carry exactly one `brandId`, and every `Brand` must resolve to exactly one `BrandVoice`.
- Every `Knowledge` instance must resolve to at least one `Document` via `ORIGINATES FROM`, **or** carry a `provenance.source = "user_input"` marker for manually entered fields (per Brand Brain PRD FR-10).
- `describesEntityType` on a `Knowledge` instance must reference an **Active** entity type. Candidates referencing a **Reserved** entity type fail Ontology Validation and are routed to `Reject`, not `Human Review` (reserved types have no governance policy defined yet).
- `BrandVoice.toneAttributes` may never be set by a Knowledge Candidate Artifact whose provenance is `imported`; only `manual` provenance is valid for this attribute.
- Cross-organization relationships are forbidden. Any relationship whose source and target entities resolve to different `organizationId` values fails validation unconditionally.

---

# Governance & Versioning

## Ontology Version

Every Knowledge Candidate Artifact and Approved Knowledge Artifact carries an `ontologyVersion` field (semantic versioning: `MAJOR.MINOR.PATCH`).

- **MAJOR** — breaking change: entity type removed/renamed, relationship cardinality tightened, required attribute added to an existing entity. Requires Architecture + Product sign-off and a migration plan for already-approved Knowledge (existing Knowledge is never retroactively invalidated; it retains its original `ontologyVersion` and remains valid under that version).
- **MINOR** — additive, non-breaking change: new optional attribute, new Reserved→Active entity type promotion, new relationship type. Architecture sign-off only.
- **PATCH** — controlled vocabulary changes (adding an Industry value, adding a Tone Attribute). No approval gate beyond Architecture review; vocabularies are explicitly designed to change more often than structure (ADR-002).

## Change Process

Ontology changes follow the Documentation Hierarchy in `01_PROJECT_BIBLE.md`: this document is Architecture-owned, but any change that contradicts `01_DOMAIN_MODEL.md` (Product-owned entity definitions) or `01_BRAND_BRAIN_PRD.md` (Product-owned field definitions) requires those documents to be updated in the same change, not after.

## Backward Compatibility

Approved Knowledge is immutable (per Knowledge Management Service). Ontology version bumps never retroactively re-validate existing Knowledge. Ontology Validation logic must be capable of running multiple ontology-version rule sets concurrently for as long as any Approved Knowledge references an older version.

---

# Non-Responsibilities

This document, and the ontology it defines, does **not**:

- Calculate Knowledge Confidence (Knowledge Management Service).
- Resolve conflicts between contradictory knowledge (Knowledge Management Service).
- Perform extraction or interpretation (Knowledge Extraction Service).
- Define storage schema, database tables, or indexes (Engineering Bible / implementation).
- Define artifact structure or lineage (`02_ARTIFACT_MODEL.md`).

The ontology is a passive, referenced schema — never an active service.

---

# MVP Scope

Included (Active):

Organization, Brand, BrandVoice, Product, Service, Audience, Competitor, Document, Knowledge — matching `01_DOMAIN_MODEL.md` MVP Scope exactly.

Reserved (defined for naming stability, not usable until promoted):

Persona, Content, Campaign, Asset, Channel.

---

# Open Items Requiring Founder / Product Decision

1. **Business Goals modeling** (see Attribute Registry, Brand section) — confirm attribute-group approach is acceptable, or elevate to a first-class entity in the Domain Model.
2. **Industry and Tone Attributes taxonomies** — the lists above are proposals; need explicit Product/UX approval before Engineering builds against them (directly resolves Brand Brain PRD Open Question #3).
3. **Reserved entity promotion policy** — no process yet exists for promoting a Reserved entity (e.g. Persona) to Active. Recommend this be defined alongside the Phase 2 roadmap kickoff, not now.

---

# Architectural Decisions

## ADR-001

Ontology entity types are a 1:1 mirror of `01_DOMAIN_MODEL.md` entity names — no renaming, no synonyms.

Reason: Domain Model's "Single Meaning" and "Stable Language" principles are violated if the ontology introduces parallel terminology.

## ADR-002

Controlled Vocabularies (enums) are versioned independently (PATCH-level) from structural schema (entity/relationship/attribute definitions, MAJOR/MINOR-level).

Reason: Adding "Manufacturing" to the Industry list should not require the same review rigor as adding a new entity type. Coupling them would slow down harmless content changes.

## ADR-003

"Business Goals" is modeled as an attribute group on `Brand`, not a standalone entity type.

Reason: `01_DOMAIN_MODEL.md` does not define a Business Goals aggregate. Introducing one unilaterally at the ontology layer would violate the documentation hierarchy (Domain Model is Product-owned and higher-priority than this Architecture-owned document). This is a stopgap; Product should confirm or formally extend the Domain Model.

## ADR-004

Ontology Validation is rule-based and deterministic only in MVP — no AI-assisted ontology validation, even though Knowledge Extraction's classification stage may use AI-assisted classification upstream.

Reason: Preserves the Knowledge Management Service's "Trust First" and "Deterministic Governance" design principles. AI-assisted classification proposes; deterministic rules gate.

---

# Definition of Done

The Business Ontology is complete when:

- Every Active entity type has a published attribute schema.
- Every relationship has explicit cardinality.
- Controlled vocabularies exist for every enum-typed attribute referenced by the Brand Brain PRD.
- Domain Constraints are stated in a form directly executable by the Knowledge Management Service's Ontology Validation stage.
- Ontology Version governance rules are defined and do not conflict with the Knowledge Management Service's immutability guarantees.
- All open items are either resolved or explicitly flagged for Founder/Product decision (not silently assumed).

---

# Related Documents

`01_DOMAIN_MODEL.md`

`02_ARTIFACT_MODEL.md`

`01_BRAND_BRAIN_PRD.md`

`03_KNOWLEDGE_EXTRACTION_SERVICE.md`

`04_KNOWLEDGE_MANAGEMENT_SERVICE.md`

`01_PROJECT_BIBLE.md`

---

# Version History

## Version 1.0.0

Initial production-ready Business Ontology.

Defines:

- Entity Type Registry (9 Active, 5 Reserved)
- Attribute Registry (inherited from Brand Brain PRD)
- Relationship Type Registry with explicit cardinality
- Controlled Vocabulary Registry, including proposed Industry and Tone taxonomies
- Domain Constraints as machine-checkable invariants
- Ontology Governance & Versioning model
- Explicit resolution (or flagging) of gaps between Domain Model and Brand Brain PRD

---

# Status

Draft — Pending Architecture & Product Review

Version

1.0.0

Effective Date

Pending

---

# END OF DOCUMENT
