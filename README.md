# AI Brand OS documentation

AI Brand OS is a proposed business-aware AI workspace grounded in human-approved, persistent Brand Brain knowledge. The MVP serves one Owner managing one Brand within one Organization. Its seven planned capabilities are Brand Brain editing, single-source import, human approval, persistent approved knowledge, contextual AI work, basic response feedback, and a copyable approved Brand Brief.

This repository contains specifications and validation artifacts, not the application implementation. Start with [MVP scope](MVP_SCOPE.md) and the [decision register](DECISION_REGISTER.md). Current integrated PRDs require review; historical Approved labels do not approve later amendments.

## Recommended reading order

1. [Project Bible](BIBLE/01_PROJECT_BIBLE.md) and [Product Bible](BIBLE/02_PRODUCT_BIBLE.md): strategy and product intent.
2. [MVP scope](MVP_SCOPE.md), [commercial packaging](COMMERCIAL_PACKAGING.md), and [decision register](DECISION_REGISTER.md): boundaries, hypotheses and approval gates.
3. [Brand Brain PRD](prd/01_BRAND_BRAIN_PRD.md), [Workspace PRD](prd/02_AI_WORKSPACE_PRD.md), and [Import PRD](prd/03_KNOWLEDGE_IMPORT_PRD.md): intended user behavior and acceptance requirements.
4. [Knowledge provenance](KNOWLEDGE_PROVENANCE.md), [data lifecycle](DATA_LIFECYCLE.md), and [product metrics](PRODUCT_METRICS.md): shared contracts across features.
5. [Engineering Bible](BIBLE/03_ENGINEERING_BIBLE.md), service specifications and domain designs below: implementation planning.
6. [Governance](DOCUMENTATION_GOVERNANCE.md), [changelog](DOCUMENTATION_CHANGELOG.md), and [validation evidence](validation/TASK08_RESULTS.md): contribution rules, remaining discrepancies and verification limits.

Security launch requirements and threat/test mappings: [Security threat model](SECURITY_THREAT_MODEL.md). Controls are specified, with implementation evidence and review pending.

## Architecture overview

The specified backend is a NestJS modular monolith using Prisma 7 and PostgreSQL. Single-source ingestion passes through document processing and knowledge extraction. Human review gates Knowledge Management publication of immutable approved snapshots. Context Engine retrieves approved, tenant-scoped knowledge; AI Orchestrator generates individual assistant Messages within persistent multi-turn Conversations. Artifacts provide shared pipeline records, while relational projections support queries. [Backend/auth ADR](domain/08_BACKEND_AUTH_AND_CONSTRAINTS_ADR.md) defines planned authentication and database safeguards. This architecture is specified; it is not a deployment report.

## Authority and conflict handling

Apply authority within the decision's subject and recorded approval scope:

1. Founder-approved strategic decisions and the Project Bible.
2. Product Bible and approved scope decisions.
3. Approved PRDs.
4. Engineering ADRs and service contracts.
5. Domain models and database schema.

[MVP_SCOPE.md](MVP_SCOPE.md) is the canonical inclusion matrix under that hierarchy. A pending recommendation does not outrank an approved decision, and schema presence does not authorize a feature. Report conflicts in the decision register, link both sources, identify the accountable approver, and reconcile affected documents together after disposition. Do not silently overwrite higher-level decisions. [Governance](DOCUMENTATION_GOVERNANCE.md) defines the workflow; historical research and execution logs provide evidence rather than new scope authority.

## Documentation and delivery status

| Label | Meaning |
| --- | --- |
| Draft / Review required | Current text awaits its named reviewers; historical approvals cover only their recorded baseline. |
| Approved | Evidence records the approver, decision scope and approved revision; does not mean implemented. |
| Specified | Intended behavior has a written contract; runtime delivery remains unverified unless separately evidenced. |
| Proposed | Hypothesis or recommendation awaiting an identified decision, such as pricing or retention periods. |
| Future | Outside MVP; requires later scope approval and dependencies. |
| Implemented | Requires linked application code and relevant runtime verification for a stated revision/environment. Documentation or schema alone is insufficient. |
| Superseded | Retained historical material replaced by a linked current decision. |

No product workflow is asserted implemented by this index. Executed Prisma and isolated PostgreSQL checks are recorded in [Task 08 results](validation/TASK08_RESULTS.md); they verify schema/constraints, not application behavior. Exports, Agency/multi-brand workspaces and collaboration are future; advanced integrations are later-phase. Starter/Pro prices and numerical onboarding targets remain proposed.

## Repository map and canonical document index

Paths below are relative to this documentation repository; project references to `docs/` mean this root.

| Location | Documents / purpose |
| --- | --- |
| Root contracts | [MVP scope](MVP_SCOPE.md), [data lifecycle](DATA_LIFECYCLE.md), [knowledge provenance](KNOWLEDGE_PROVENANCE.md), [packaging](COMMERCIAL_PACKAGING.md), [metrics](PRODUCT_METRICS.md), [security](SECURITY_THREAT_MODEL.md), [decisions](DECISION_REGISTER.md), [governance](DOCUMENTATION_GOVERNANCE.md), [changelog](DOCUMENTATION_CHANGELOG.md) |
| `BIBLE/` | [Project](BIBLE/01_PROJECT_BIBLE.md), [Product](BIBLE/02_PRODUCT_BIBLE.md), [Engineering](BIBLE/03_ENGINEERING_BIBLE.md), [Execution](BIBLE/04_EXECUTION_BIBLE.md), [AI Memory](BIBLE/05_AI_MEMORY_BIBLE.md). Execution/Memory summarize history and must not override current contracts. |
| `discovery/` | [Product discovery](discovery/01_PRODUCT_DISCOVERY.md), [market research](discovery/02_MARKET_RESEARCH.md), [competitor analysis](discovery/03_COMPETITOR_ANALYSIS.md), [positioning](discovery/04_POSITIONING.md). Research, including bilingual historical notes, is evidence and hypotheses. |
| `prd/` | [Brand Brain](prd/01_BRAND_BRAIN_PRD.md), [AI Workspace](prd/02_AI_WORKSPACE_PRD.md), [Knowledge Import](prd/03_KNOWLEDGE_IMPORT_PRD.md) |
| `services/` | [Ingestion](services/01_INGESTION_SERVICE.md), [Document Processing](services/02_DOCUMENT_PROCESSING_SERVICE.md), [Knowledge Extraction](services/03_KNOWLEDGE_EXTRACTION_SERVICE.md), [Knowledge Management](services/04_KNOWLEDGE_MANAGEMENT_SERVICE.md), [Context Engine](services/05_CONTEXT_ENGINE.md), [AI Orchestrator](services/06_AI_ORCHESTRATOR.md) |
| `domain/` | [Domain model](domain/01_DOMAIN_MODEL.md), [Artifact model](domain/02_ARTIFACT_MODEL.md), [ontology](domain/03_BUSINESS_ONTOLOGY.md), [database design and ADRs](domain/04_DATABASE_DESIGN.md), [API design and ADRs](domain/05_API_DESIGN.md), [future export proposal](domain/06_FUTURE_EXPORT_DESIGN.md), [backend/auth/constraints ADR](domain/08_BACKEND_AUTH_AND_CONSTRAINTS_ADR.md) |
| Schema / SQL | [Prisma schema](schema.prisma), [supplemental migration constraints](sql/MVP_CONSTRAINTS.sql). Planned database contract, not proof migrations ran in application environments. |
| `design/` | [Component kit](design/01_COMPONENT_KIT.md): draft UI specification |
| `validation/` | [PostgreSQL acceptance probes](validation/POSTGRES_CONSTRAINT_TESTS.sql), [executed results](validation/TASK08_RESULTS.md), [Markdown link checker](validation/check_documentation_links.py) |

## Open decisions and contributing

Founder input remains required for [single-document request limits](DECISION_REGISTER.md#d-imp-01), [one active import per Brand](DECISION_REGISTER.md#d-imp-02), and [dedicated versus embedded knowledge UI](DECISION_REGISTER.md#d-imp-03). Current PRD engineering reviews, retention/legal/operational approval, authentication security review, pricing validation and the remaining technical reconciliation items are tracked in the [decision register](DECISION_REGISTER.md) and [changelog](DOCUMENTATION_CHANGELOG.md). A recommended default is not sign-off.

English is canonical for engineering contracts. Clearly labeled translations and bilingual research are welcome; preserve historical research. Follow [governance and traceability](DOCUMENTATION_GOVERNANCE.md) when changing requirements. Run `python3 validation/check_documentation_links.py` and `git diff --check` before review; schema/SQL changes also require the relevant validation described in [Task 08 results](validation/TASK08_RESULTS.md).
