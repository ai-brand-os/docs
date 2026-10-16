# Documentation governance

Version: 1.0.0. Recorded: 2026-10-16. Status: specified contribution workflow; this record does not grant product, legal or engineering sign-off. Owner: Product and Engineering roles jointly; individual assignments must be recorded when a review is opened.

## Authority and ownership

Authority follows: (1) Founder-approved strategic decisions and Project Bible; (2) Product Bible and approved scope decisions; (3) approved PRDs; (4) Engineering ADRs and service contracts; (5) domain models and database schema. Approval applies only to the recorded revision and subject. The [MVP scope](MVP_SCOPE.md) controls the inclusion matrix under this hierarchy. Technical feasibility may block delivery and trigger escalation; it does not silently change scope.

| Accountable role | Documents / responsibility | Required reviewers |
| --- | --- | --- |
| Founder | Strategic changes, scope exceptions, pending import product choices | Product; Engineering for feasibility |
| Product | Product Bible, MVP matrix, PRDs, packaging, metrics | Engineering; Founder for strategic/scope decisions |
| Architecture / Engineering | Engineering Bible, ADRs, service/API contracts, domain/schema, validation | Product for behavior changes; Security for authentication; data owner for migration/retention impact |
| Product + Engineering | Governance, index, decision register, changelog, Execution/Memory summaries | Affected document owners |
| Legal/privacy + Operations | Retention periods, exceptions, backup/restore and purge policy approval | Engineering and Product; named approving roles and evidence still required |
| Research / UX | Discovery and design records | Product; Engineering when a proposal becomes a contract |

These are accountability roles, not claims that named people have accepted assignments. Contributors may propose edits; document ownership does not itself confer Founder or legal approval.

## Review and conflict workflow

1. Identify the requirement, current revision/status and affected feature, service, schema and acceptance scenarios. Read the decision register and open changelog items before changing behavior.
2. For a conflict, record both source links and contradictory statements, user/data impact, options, recommendation and blocking dependencies. Assign a stable decision ID and accountable role in the [decision register](DECISION_REGISTER.md). Record unresolved technical reconciliation in the [changelog](DOCUMENTATION_CHANGELOG.md), linking the decision if approval is needed.
3. Prepare a reviewable change updating all dependent contracts, examples and diagrams together. Mark new behavior Proposed or Draft where approval is missing. Preserve historical statements with dated correction links instead of altering their apparent original approval.
4. Request the appropriate role's disposition. Capture actual approving identity/role, evidence link, selected option, approved revision and real decision date. Never infer approval from silence, an old Approved heading, a recommendation or a successful schema validation.
5. Reconcile every affected document in the same change, including current status inventories. If blocked, keep the conflict visibly open and identify which behavior cannot receive sign-off; do not choose between conflicting approved sources without the responsible approver.
6. Check links, traceability and relevant validation, then record results and limitations. Close an issue only with evidence and a resolution link. A documentation merge does not establish deployment or customer validation.

Routine typo/link repairs do not require a new product decision. A substantive requirement or policy change does. Lower-level technical contracts may add implementation detail consistent with higher-level intent; they cannot expand entitlements or bypass approval gates.

## Status, versions and history

Use the [README status definitions](README.md#documentation-and-delivery-status). Keep approval lifecycle (Draft, Review required, Approved, Superseded) separate from delivery classification (Specified, Proposed, Future, Implemented). Existing Active labels mean maintained documents, not blanket approval of every amendment. For new or substantively revised documents record title, version, owner role, date, lifecycle status, delivery classification, dependencies and approval evidence or pending decision IDs. Existing documents adopt this metadata on substantive review; do not invent missing historical metadata.

Use semantic document versions: major for incompatible scope/contract changes, minor for compatible requirements or substantive clarification, patch for editorial/link corrections. Preserve existing historical numbering; identify integrated working revisions explicitly. Git commits identify exact text; an approval must identify that revision or a version plus evidence. Append dated change entries summarizing the problem, disposition, affected contracts, validation and remaining gates. Never backdate approval or replace historical logs with current conclusions. Record cross-document reconciliations in [DOCUMENTATION_CHANGELOG.md](DOCUMENTATION_CHANGELOG.md); retain per-document version histories where present.

Keep decision IDs immutable (`D-<AREA>-<NN>`); reference rather than reuse them. Each decision records description, options, recommended default, rationale, approver, status, dependencies, date and evidence. Use Proposed — Pending [role] Approval, Approved, Rejected or Superseded; preserve existing recorded-baseline classifications and their evidence limits. Unknown decision dates remain “not recorded”; audit dates are distinct. Superseding decisions link both ways and preserve rejected alternatives. Engineering ADRs record context, decision, consequences and validation; their namespace must be unambiguous by file because older ADR numbers repeat across documents.

## Language and source preservation

English is canonical for engineering specifications, API/schema contracts, ADRs and acceptance criteria. Label translated copies with language, canonical source link, source revision and translation date; conflicts resolve through review of the English contract. Label bilingual research as research, preserving original observations and source language. Do not rewrite historical discovery, quotes or logs solely to enforce English. Extract a linked English requirement when research informs a current engineering decision. Translation is not independent approval evidence.

## Traceability convention

Use stable references `MVP-01` through `MVP-07` from the scope matrix. Qualify existing requirement numbers with document identity: `BB:FR-3`, `WS:FR-007`, `KI:FR-5`; do not renumber historical requirements. Link to the actual requirement heading (or its parent Functional Requirements heading where requirements are list items). Service references use filename plus existing heading; schema references use exact model/field names and a schema link. An ADR reference includes file and ADR number. New acceptance scenarios should receive stable document-qualified IDs; retain existing case numbers and label older unnumbered cases by heading plus scenario text until explicitly indexed. An identifier alone is not a link.

For each changed requirement, include a traceability row in the owning contract or change record with feature ID, linked requirement, linked service contract, schema model/field, linked acceptance scenario and evidence status. Mark absent dependencies “not yet specified” with a tracked issue; do not invent a test or claim coverage from a similarly named scenario. Distinguish an acceptance specification from an executable test, and a test file from a dated passing result.

| Feature / requirement | Service contract | Persistence | Acceptance specification / evidence |
| --- | --- | --- | --- |
| MVP-03 / [BB:FR-3 human review](prd/01_BRAND_BRAIN_PRD.md#functional-requirements) | [Knowledge Management](services/04_KNOWLEDGE_MANAGEMENT_SERVICE.md) and [provenance contract](KNOWLEDGE_PROVENANCE.md) | [schema](schema.prisma): BrandBrainRevision, Artifact, Brand.currentRevisionId | [Provenance edge-case tests](KNOWLEDGE_PROVENANCE.md#edge-case-acceptance-scenarios--specifications-not-executed-tests): unreviewed extraction must not replace approved knowledge; specification, runtime result not recorded |
| MVP-05 / [WS:FR-007 deletion](prd/02_AI_WORKSPACE_PRD.md#fr-007--delete-conversation) | [Data lifecycle](DATA_LIFECYCLE.md) and [AI Orchestrator](services/06_AI_ORCHESTRATOR.md) | [schema](schema.prisma): Conversation.deletedAt, ConversationPurge, Message | [Lifecycle acceptance scenarios](DATA_LIFECYCLE.md#acceptance-test-scenarios--required-implementation-validation-not-test-results): immediate access denial and reference-aware purge; specification, runtime result not recorded |
| MVP-01 / [Brand Brain readiness](PRODUCT_METRICS.md) | [Knowledge Management](services/04_KNOWLEDGE_MANAGEMENT_SERVICE.md) | [schema](schema.prisma): BrandBrainRevision completeness/readiness fields; BrandVoice.toneAttributes | [SQL probes](validation/POSTGRES_CONSTRAINT_TESTS.sql) and [executed results](validation/TASK08_RESULTS.md) verify database constraints only; do not prove end-to-end readiness |

## Link and reference maintenance

Use relative Markdown links within this repository, including heading fragments for precise requirements. Root `docs/` in project prose refers to this repository root, not a nested folder. All canonical documents must be discoverable from [README](README.md). Nonexistent numbers in a numbered filename sequence do not imply a missing required document.

Run `python3 validation/check_documentation_links.py` from any directory and `git diff --check` from this repository. The checker validates local inline and reference-style Markdown destinations and heading fragments, ignoring fenced examples, remote URLs and images. It does not fetch external links or validate plain-text filenames. Review plain references manually when modifying a contract; historical shorthand may remain when clearly labeled and accompanied by the current link. Required external artifacts must identify their owning repository/location and availability; missing dependencies stay open rather than being silently fabricated. Re-run schema/SQL checks only when relevant contracts change; retain exact commands, versions, environment and limits with results.
