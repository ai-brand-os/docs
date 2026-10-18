# AI Brand OS — Brand Brain PRD

> Scope authority (2026-10-13): [MVP_SCOPE.md](../MVP_SCOPE.md). This document specifies intended behavior; design approval does not establish implementation. Historical decisions and long-term concepts do not expand MVP.

Document: **01_BRAND_BRAIN_PRD.md**

Version: **1.2.0 — integrated working revision**

Status: Draft — Pending Engineering Review (D-REV-01; import decisions D-IMP-01/02/03 pending)

Owner: Product

Priority: P0

Last Updated: 2026-10-13 (audit date; historical baseline approval retained)

---

# Purpose

This document defines the functional requirements, data model, onboarding flow, and acceptance criteria for **Brand Brain** — the first production module of AI Brand OS.

Brand Brain is the structured representation of a business that every AI interaction consumes. This PRD defines what Brand Brain **contains** and **how a user builds it**. It does not define:

- How knowledge is extracted from documents/websites (see Knowledge Engine service specs and [Knowledge Import PRD](03_KNOWLEDGE_IMPORT_PRD.md)).
- How AI Workspace consumes Brand Brain to generate content.

This separation is intentional (Founder Decision, 2026-07-01): Brand Brain is the **data product**. Import is the **acquisition mechanism**. Keeping them separate protects both documents from scope bleed.

---

# Problem This PRD Solves

Per `01_PRODUCT_DISCOVERY.md`, the core hypothesis is:

> If businesses configure their brand once, and AI permanently remembers it, they will trust AI outputs more, generate content faster, and become paying subscribers.

Brand Brain is the mechanism that makes "configure once" possible. Without a clearly bounded data model, engineering will either under-build (Brand Brain becomes a glorified settings page) or over-build (Brand Brain tries to capture everything in the Domain Model on day one, delaying launch).

---

# Scope Decision (Historical Founder-approved baseline; later amendments require current review)

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
01_DOMAIN_MODEL.md (Domain Model)
        │
        ▼  (defines business entities & relationships)
01_BRAND_BRAIN_PRD.md  ← this document
        │
        ▼  (defines fields, UX, acceptance criteria)
04_KNOWLEDGE_MANAGEMENT_SERVICE.md   (persists Approved Knowledge Artifacts)
03_KNOWLEDGE_EXTRACTION_SERVICE.md   (proposes auto-filled field values)
02_DOCUMENT_PROCESSING_SERVICE.md    (parses imported website/docs)
01_INGESTION_SERVICE.md              (accepts raw import; baseline duplication cleanup recorded as resolved)
        │
        ▼  (consumed by)
05_CONTEXT_ENGINE.md                 (retrieves Brand Brain fields for AI prompts)
```

Brand Brain does not talk to the Knowledge pipeline directly in the UI sense — the user experience described in this PRD triggers that pipeline, but the pipeline's internal mechanics are governed by the four existing service specs, not by this PRD.

---

# Brand Brain Data Model

Every material field carries explicit MANUAL, IMPORTED or DERIVED origin and versioned approval/evidence/verification metadata per [KNOWLEDGE_PROVENANCE.md](../KNOWLEDGE_PROVENANCE.md). Table “Source” describes eligibility: both means manual or imported is allowed, never a stored provenance category. Derived claims require documented inputs and explicit approval; automatic knowledge inference remains deferred. Manual-only fields remain manual-only.

## 1. Organization Profile

| Field             | Type                             | Required | Source                   |
| ----------------- | -------------------------------- | -------- | ------------------------ |
| Organization Name | text                             | Yes      | both                     |
| Industry          | enum (predefined list + "Other") | Yes      | both                     |
| Company Size      | enum: 1–5 / 6–20 / 21–50 / 50+   | Yes      | manual                   |
| Website URL       | url                              | No       | manual (triggers import) |
| Primary Region    | Historical unspecified enum; proposed market prose D-KQ-02                             | Yes      | manual                   |
| Primary Language  | Historical unspecified enum; proposed single BCP47 D-KQ-02                             | Yes      | manual                   |

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
| Competitor Name       | text | No       | manual |
| Website               | url  | No       | manual |
| Differentiation Notes | text | No       | manual |

## 6. Business Goals

| Field              | Type                                                   | Required | Source |
| ------------------ | ------------------------------------------------------ | -------- | ------ |
| Primary Goal       | enum: Awareness / Lead Gen / Sales / Retention / Other | No       | manual |
| Success Definition | text                                                   | No       | manual |

---

# Brand Brain Completeness Score

Completeness is an individual revision’s weighted 0–100 score. The proposed >70% seven-day readiness completion rate is a cohort goal, not a ≥70-point generation gate. Measurement authority: [PRODUCT_METRICS.md](../PRODUCT_METRICS.md).

## Formula

Calculation v2 uses [PRODUCT_METRICS.md](../PRODUCT_METRICS.md#completeness--calculation-version-2): 14 mandatory field slots total 80 points (mission and tone 10 each, other mandatory slots 5 each), plus 10 each for an approved named Competitor and Primary Goal. Product or Service satisfies the offer group. Only complete approved repeatable members enter generation context. Persist the versioned score/missing paths/ontology/calculation timestamp with each approved revision; historical v1 snapshots remain unchanged.

## Display Rule

The Completeness Score is shown as a persistent progress indicator in the AI Workspace sidebar. The score itself is not a generation gate. Readiness requires valid approved mandatory facts, a complete offer and Audience, manual tone, a current approved revision and an unarchived Brand, even when completeness is below 100%. Pending imports do not fill slots. Live request gates are separate from persisted approval-time readiness.

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
   → Knowledge Management returns governance-eligible candidate values; rejected values remain absent
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
   Mission Statement, Brand Voice tone selection (mandatory manual),
   ≥1 complete Product or Service, ≥1 complete Audience segment.
        │
        ▼
Step 5 — First Generation ("Wow Moment")
   User is prompted to generate one piece of content (e.g. a social caption)
   using the Brand Brain they just built.
   A generation request or entering this step is not activation. QualifiedFirstValue is emitted only after a usable completed output grounded in approved facts is presented; a useful partial approved Brief can also qualify without generation readiness.
```

## Fallback Behavior

- If no Website URL is provided → skip Step 2 and Step 3 entirely, go straight to Step 4 as a plain form.
- If import fails or exceeds the ~30s UX wait target → show a non-blocking notice and allow manual entry. This UI fallback does not impose a worker deadline, cancel the import, decide pending candidates or release its proposed admission slot; polling/closure follows [ADR-012](../domain/11_IMPORT_LIFECYCLE_ADR.md).
- Import failure must never prevent onboarding completion.

## Proposed Time-to-First-Value Goals

Median ≤10 minutes and p90 ≤15 minutes, measured from OnboardingStarted to the first presented usable output grounded in approved Brand Brain facts. All pauses/retries count; abandonment and exclusions follow PRODUCT_METRICS.md. Form completion time is a separate diagnostic, not first value. These are goals, not observed results.

---

# Functional Requirements

- **FR-1**: System shall allow a user to create exactly one Organization and one Brand during MVP onboarding, with no additional Organizations or Brands permitted afterward in MVP.
- **FR-2**: System shall allow optional Website URL submission to trigger the Knowledge import pipeline. Request-level limit/admission/placement depend on [D-IMP-01](../DECISION_REGISTER.md#d-imp-01), [D-IMP-02](../DECISION_REGISTER.md#d-imp-02), [D-IMP-03](../DECISION_REGISTER.md#d-imp-03); Founder choices remain pending.
- **FR-3**: System shall display all auto-imported field values with a visible source indicator and require explicit user confirmation before they count toward Completeness Score.
- **FR-4**: System shall allow manual entry/edit of every field regardless of import status.
- **FR-5**: System shall support repeatable Products/Services and Audiences, with at least one complete approved offer (Product OR Service) and Audience required for readiness. Competitors are optional (0..N); draft groups may be empty.
- **FR-6**: System shall apply PRODUCT_METRICS.md calculation v2 and persist a completeness snapshot on every approved BrandBrainRevision, including score, missing mandatory field paths, ontology/calculation versions and calculatedAt. GET reads that snapshot; it never silently recalculates history.
- **FR-7**: System shall evaluate readiness independently of score; ≥70 never bypasses missing mandatory fields: current approved revision, valid mandatory fields, ≥1 complete Product or Service, ≥1 complete Audience, valid manual tone and unarchived Brand. Runtime authorization/deletion/provider gates remain separate.
- **FR-8**: System shall persist every Brand Brain field change through the Knowledge Management Service with full version history. (no silent overwrites — aligns with ADR-003 in `04_KNOWLEDGE_MANAGEMENT_SERVICE.md`).
- **FR-9**: System shall allow editing Brand Brain at any time after onboarding, not just during initial setup. This recorded baseline does not approve a dedicated Knowledge Base screen; post-onboarding import placement is [D-IMP-03](../DECISION_REGISTER.md#d-imp-03).
- **FR-10**: System shall track origin for every material field (MANUAL, IMPORTED, DERIVED); source Artifact/Document and available location for imports; explicit derivation inputs for derived claims; approval status, approver/time, introducing/superseded revisions and last verification. No fabricated attribution or silent unreviewed replacement. See KNOWLEDGE_PROVENANCE.md.
- **FR-11**: System shall display a copyable Brand Brief assembled only from current Owner-approved Organization, Brand Profile, Brand Voice, Products/Services, Audience, and optional Competitor/Business Goal knowledge. Omit unapproved or missing fields; never invent facts. Copy preserves readable section labels and text. After an approved edit, refresh the Brief from current approved state. No download, file generation, or background export job is required.
- **FR-12**: System shall preserve immutable approved field values, introducing/superseded revision links, approver/time and verification history; expose version/field history and typed diffs.
- **FR-13**: System shall present contradictory proposals and stale/unknown verification with approved/proposed values and evidence; Owner may keep, replace, edit or verify. Revisions use expectedRevisionId and idempotency; conflicts cannot silently overwrite approved facts.
- **FR-14**: System shall preview and restore an earlier approved Brand Brain version by creating a new approved revision under the current ontology, preserving intervening history and prior verification dates unless explicitly reverified.

---

# Non-Functional Requirements

- **Multi-tenancy**: Every Brand Brain record strictly isolated per Organization (per `03_ENGINEERING_BIBLE.md` Multi-Tenancy rules — no cross-tenant access).
- **Performance**: Import pipeline (Step 2–3) should return results within 30 seconds for one typical marketing website page (one submitted URL per job; no crawling in MVP).
- **AI Provider Agnostic**: Field extraction must not hardcode a specific LLM provider (per `01_PROJECT_BIBLE.md` AI Strategy).
- **Auditability**: Every field change must be traceable to a version and a source, per Knowledge Management Service audit requirements.

---

# Acceptance Criteria

- Given a user with no website, when they complete Step 4 manually, then they can generate content without ever seeing an import step.
- Given a user who provides a website URL, when import completes, then every extracted field shows a source badge and is editable before being saved.
- Given an unarchived Brand has all 14 valid approved mandatory slots and zero recommendation points, its revision snapshot stores score 80 and readiness true. Conversely, under v2 a missing five-point mandatory field with both recommendations stores score 95 but readiness false; exactly 70 with missing tone or mission is also not ready.
- Given a user edits an existing Brand Brain field post-onboarding, when the edit is saved, then a new Knowledge version is created and the previous version remains retrievable.
- Given import fails or times out, when the user reaches Step 3, then they see a clear fallback message and can proceed manually without errors.

---

# Success Metrics (inherited from Product Discovery / Market Research)

| Metric                           | Target       |
| -------------------------------- | ------------ |
| Seven-day readiness completion rate | Proposed >70% of eligible mature-cohort starts; not a field-score rule |
| Time to first value, median | Proposed ≤10 minutes |
| Time to first value, p90 | Proposed ≤15 minutes |
| Seven-day activation rate | Proposed >60% reaching QualifiedFirstValue, not entering Step 5 |

---

# Dependencies

- `01_DOMAIN_MODEL.md` (Domain Model) — entity definitions and relationships.
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
- Dynamic source-reputation learning is deferred. Extraction confidence, Knowledge Management confidence/trust and Context Score are distinct indicators, never approval or factual accuracy. Their formulas/thresholds require D-AUD-03 review.
- Delegated/admin review queue (Phase 2). Single-owner conflict/stale review, field history, version inspection and restore are MVP requirements.

---

# Resolved Questions (formerly Open Questions)

1. **Brand Voice — Tone Attributes import eligibility.** RESOLVED:
   manual-only, permanently. This is now enforced as a hard Domain
   Constraint in `03_BUSINESS_ONTOLOGY.md`, not just a UX preference — any
   Knowledge Candidate Artifact attempting to set `toneAttributes` with
   `provenance.extractionMethod != user_input` fails Ontology Validation
   unconditionally.

2. **Ingestion Service scope duplication.** RESOLVED 2026-07-01 — see prior
   entry, `01_INGESTION_SERVICE.md` v2.0.0.

3. **Industry / Tone Attribute taxonomies.** RESOLVED: locked as v1 lists,
   see `03_BUSINESS_ONTOLOGY.md` Controlled Vocabulary Registry. One
   addition made to the Industry list: `Beauty & Personal Care`, added
   because the Beachhead Market explicitly includes e-commerce brands
   (`02_MARKET_RESEARCH.md`, Segment B) that don't fit cleanly under
   "Fashion & Apparel" or "Home & Lifestyle". Locked as PATCH-versioned —
   future additions do not require Founder approval, only Architecture
   review, per Ontology Governance rules.

4. **Competitor auto-import.** RESOLVED: manual-only for MVP, per original
   recommendation in this document. Low value relative to import
   complexity added.

---

# Decision Log

## 2026-07-01

- Brand Brain MVP scope fixed to: Organization, Brand Profile, Products/Services, Audience (required) + Competitors, Business Goals (recommended, non-blocking).
- Onboarding flow approved as Hybrid (auto-import + short manual form).
- Knowledge Import mechanics kept out of this PRD; will be covered by a dedicated `03_KNOWLEDGE_IMPORT_PRD.md`.
- Persona, Campaign, Asset, Channel, Content confirmed deferred past MVP for Brand Brain purposes.

## 2026-07-02

- Brand Brain PRD approved for Engineering Design. All four Open Questions
  resolved (see Resolved Questions section above).
- Business Ontology approved in the same session — see its own Decision Log.

---

# Related Documents

`01_DOMAIN_MODEL.md` (Domain Model)

`02_PRODUCT_BIBLE.md`

`04_KNOWLEDGE_MANAGEMENT_SERVICE.md`

`03_KNOWLEDGE_EXTRACTION_SERVICE.md`

`02_AI_WORKSPACE_PRD.md`

`03_KNOWLEDGE_IMPORT_PRD.md`

---

## Field provenance acceptance contract

[KNOWLEDGE_PROVENANCE.md](../KNOWLEDGE_PROVENANCE.md) defines the payload contract, APIs, sample records, referential integrity, migration prerequisites and edge-case scenarios required for FR-6/7/8/10/12/13/14. Design approval does not establish implementation. Tests must prove import/manual origin changes, source locations, immutable histories, same-head concurrency, stale review, new-revision restoration, Service-only readiness and persisted score independence.

---

## Commercial account boundary

[COMMERCIAL_PACKAGING.md](../COMMERCIAL_PACKAGING.md) applies FR-1 identically to proposed Starter and Pro: one business, one Organization, one Brand and one Owner. Tier labels cannot authorize additional client Organizations, brands, members or Agency workflows. Signup creates the sole Owner membership; normal MVP operations reject additional memberships/Organization creation and do not expose switching. Historical multiple-membership data needs reviewed reconciliation, not silent access. Agency subscriptions/portfolios, client isolation/billing/roles and switching are separate Phase 2 requirements; prices remain proposed until payment evidence exists.

---

## Limited setup and onboarding measurement acceptance

An incomplete Brain supports manual setup/import/review, approved knowledge/history inspection, accessible prior conversations and a visibly partial approved Brief. With no approved facts, show guidance/missing fields but do not generate business-grounded answers or count templates/empty summaries as first value. New context-aware generation requires effective readiness, not score ≥70. [PRODUCT_METRICS.md](../PRODUCT_METRICS.md) defines exact events, cohort/abandonment rules and the required 0%, 70%, 100% and missing-mandatory acceptance cases. No target is an observed result.

---

## Approval scope and decision evidence

The 2026-07-01/02 baseline scope/design decisions and resolved tone/taxonomy/competitor questions remain recorded evidence [D-BB-01](../DECISION_REGISTER.md#preserved-evidence-based-decisions-and-remaining-review-ownership). They do not sign off every subsequent October amendment. Current integrated revision awaits Product/Architecture review (D-REV-01); import acquisition paths disclose D-IMP-01/02/03. Manual baseline choices and completed ADRs are preserved. No new Founder approval date or identity is supplied by this audit.

---

# END OF DOCUMENT


# Task 10 — Security acceptance and release dependency

[SECURITY_THREAT_MODEL.md](../SECURITY_THREAT_MODEL.md) is the shared security contract. SEC-01–06 and the applicable SEC-AT-01–08 scenarios are mandatory launch gates, pending implementation evidence and Security review; this addition grants no PRD sign-off. Every mutation and artifact/retrieval operation requires server-side tenant/Owner authorization. Imported and retrieved material is data, never policy authority; AI extraction and automated eligibility cannot approve knowledge. Candidate review access is distinct from generation eligibility.

Import UI limits are advisory: the server enforces scan/quarantine, type/size and fetch/redirect protections. A blocked source returns a safe reason and manual-entry fallback without leaking internal destinations or malware payloads. Generation uses only approved tenant-scoped knowledge and reviewed provider processing, with safe response rendering and no automatic external image/link loading. The full assembled system prompt, credentials and internal context artifact are not exposed through debug UI; authorized business facts may appear in useful responses and the approved Brand Brief. Context hiding is a UX choice, not a security boundary or a promise that approved facts can never appear in responses.

Acceptance mapping: import → SEC-AT-01/02/03/04/07; Brand Brain review/edit/restore → SEC-AT-04/05/07/08; Workspace generation/history/feedback/copy/deletion → SEC-AT-01/04/06/08. Provider disclosures, finite operational budgets and storage/retention readiness remain D-SEC-01/02/03 in the [decision register](../DECISION_REGISTER.md). Tests listed here are specifications, not executed results.


# Task 11 — Approval-based knowledge improvement

Explicit field correction/save is a reviewed mutation; it must record reason/diff and publish via existing revision/idempotency controls. Inspect and restore use provenance APIs, with restore appending a newly approved revision. No automatic conversation learning or inferred preferences are included.

[KNOWLEDGE_LEARNING_LIFECYCLE.md](../KNOWLEDGE_LEARNING_LIFECYCLE.md) defines the MVP/later boundary, minimum payload/API contracts, correction acceptance, independently reviewed factual accuracy, staleness and paired repeated-error metrics, plus KL-AT-01–14 acceptance scenarios. This is specified behavior pending review/implementation evidence, not a claim of training, automatic accuracy improvement or new approval.


# Task 14 — Strategic interpretation and scope boundary

[COMPETITIVE_STRATEGY.md](../COMPETITIVE_STRATEGY.md) proposes evidence-backed business knowledge as positioning, not a unique or delivered advantage. [DIFFERENTIATION_ROADMAP.md](../DIFFERENTIATION_ROADMAP.md) maps A/B/C to existing commitments and new later proposals. Existing field provenance, explicit Owner approval, approved revision/context and copyable Brief requirements remain; no automatic monitoring, full knowledge export, connected API/MCP, delegated review or multi-brand capability is added to this PRD. Numeric comparative benefit targets are proposed experiments, not this revision’s performance guarantees or observed results. D-COMP-01/02 and existing PRD/scope/security gates remain pending.


# Task 15 — Proposed single-product commercial test

[GO_TO_MARKET_STRATEGY.md](../GO_TO_MARKET_STRATEGY.md) proposes e-commerce validation using one page URL OR one supported product fact document per import job, plus explicit manual brand/offer facts and Owner approval. Another source is a distinct job under the selected admission rule, not catalog crawling/batch import. Existing mandatory readiness/provenance/versioning and copyable approved Brief contracts remain. A deliverable-level source/claim panel is pending D-GTM-02, not already delivered. Segment, first $29 offer and experiment thresholds remain proposals; no PRD approval is upgraded.


## Task18 — Import review versus Brand Brain publication

Import confirmation remains a per-item authorized publication transaction. A successful revision may coexist with undecided import candidates. [ADR-012](../domain/11_IMPORT_LIFECYCLE_ADR.md) defines full review coverage, closure, stale-head conflict/replay and proposed admission release; it never allows pending/model-derived knowledge to count as approved. All-rejected review closes with no new revision; manual approved fields remain unchanged unless explicitly confirmed for replacement. No new navigation surface or import format; Founder D-IMP-01/02/03 remain pending.


## Task19 — Honest source badges and evidence precision

FR-3/10 provenance follows [ADR-013](../domain/12_SOURCE_EVIDENCE_MAPPING_ADR.md): exact/structural/normalized-only/unavailable evidence labels are separate from confidence and approval. Show actual captured source identity and safe available excerpts/anchors; never normalized offsets as PDF/HTML source coordinates. Lack of precise offsets alone does not reject a legitimate candidate, but forged/digest-invalid evidence is ineligible and deleted required source blocks imported approval. Ambiguous currency/date interpretation stays unresolved or explicit manual correction. No new source format, screen, OCR, monitoring or automatic approval. D-AUD-05/D-EVID-01/02 and existing PRD/policy gates require review.


## Task20 — Relationship persistence and lifecycle

**Specified — Pending Architecture/Product Review (D-AUD-06).** [ADR-014](../domain/13_ONTOLOGY_RELATIONSHIP_PERSISTENCE_ADR.md) and [canonical registry/contracts](../contracts/ontology-relations/README.md) define the versioned mapping.

FR-REL-01 (specified architecture dependency; not new MVP UI): approved relationship assertions, when Product-authorized, must have stable scoped identity, human decision/provenance, exact snapshot reconstruction and restore. Existing readiness/mandatory facts do not require a TARGETS form or per-offer Audience association. Proposed TARGETS cardinality/USES derivation and predicate review transport remain D-REL-02; archive/reactivation D-REL-03. No candidate/self-approval. Current removal includes reviewed incident-edge removal; history remains subject to retention. Acceptance maps to AT-20-01–30; offline tests do not establish implementation or product approval.


## Task21 — Taxonomy and knowledge-quality contracts

**Specified — Pending Product/Architecture Review (D-AUD-03).** [ADR-015](../domain/14_KNOWLEDGE_QUALITY_AND_TAXONOMY_ADR.md) and [canonical quality1.0 contracts](../contracts/knowledge-quality/README.md) define semantics, versions, calculations and review gates.

FR-KQ-01 (specified, pending review): show indicator meaning/missing state and actual source precision separately; no generic percentage of truth. Preserve locked taxonomies/manual Tone. Historical company-size1 remains current; proposed size2 boundary requires D-KQ-01 and explicit new confirmation, never relabel old21–50/50+. Primary market prose/single BCP47 output preference are proposed D-KQ-02, not new geography/multilingual workflows. Unknown required values keep setup incomplete; current required Organization fields cannot store invented unknown enum values. All numeric formulas default disabled; source/candidate validation failures block independently and all eligible fact changes require Owner approval. AT-21-01–30 are offline acceptance cases, not runtime delivery or approved UX.
