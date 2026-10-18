# Knowledge quality and taxonomy contracts

**Version1.0.0 — Specified, pending Product/Architecture review D-AUD-03.** [ADR-015](../../domain/14_KNOWLEDGE_QUALITY_AND_TAXONOMY_ADR.md) defines the audit/before-after matrices, indicator meanings, exact formulas, missing data, ownership, persistence alternatives and remaining gates. All new numeric formulas/company-size taxonomy2 and profile changes are proposed and disabled; tests simulate reviewed policy without claiming approval.

Canonical files:

- [Taxonomy registry](1.0.0/taxonomies.json): all material business fields, exact locked Industry/Tone/PrimaryGoal keys/labels, historical size1 and proposed size2, normalization and migration.
- [Score registry](1.0.0/scores.json): explicit formulas, inputs, owners, fixed precision, disabled defaults and deterministic rank; no generic scoring engine or custom weights.
- [Field state schema](1.0.0/field-value.schema.json), [score schema](1.0.0/score.schema.json), [assessment schema](1.0.0/assessment.schema.json), [reference algorithms](1.0.0/reference.cjs).
- [Representative standards profile](1.0.0/standards-fixture.json), [valid report](1.0.0/examples/valid.json), [invalid examples](1.0.0/examples/invalid.json). The standards fixture is a small offline sample, not the complete assigned ISO/IANA inventory or an enabled language/market feature.
- [Proposed Artifact2.4](../artifacts/2.4.0/README.md) supplies a separately reviewed storage attachment; earlier bundles and Prisma remain unchanged. [Execution report](../../validation/TASK21_RESULTS.md) contains actual commands, test scope and changed files.

## Calculation and input contract

EXTRACTION_CONFIDENCE=`roundHalfUp(100*PASS/applicable)` across literalPreserved, classificationValid, parseUnambiguous and sourceBindingResolved. KNOWLEDGE_CONFIDENCE uses the same arithmetic across supportResolved, interpretationResolved, verificationCurrent and sourcePolicyAcceptable. All equal-weight checks are procedural support tests, not probabilities of truth. SOURCE_TRUST and EVIDENCE_QUALITY remain categorical; no invented numerical conversion. CONTEXT_QUALITY is a coverage proxy: distinct selected∩required fact refs / distinct required refs ×100, same rounding. Completeness stays calculation2 in PRODUCT_METRICS; readiness and activation are separate gates/events.

Score inputs are closed objects: checks, manifestState, requiredFactRefs, selectedFactRefs. Checks use exact registry keys once each; no arbitrary weights or unknown keys. Each check has explicit status, reason (nullable unless NOT_APPLICABLE), and actual referenceIds. In check formulas manifestState=NOT_APPLICABLE and both fact-ref arrays are empty. Context has no check keys; manifestState=KNOWN/UNKNOWN/NOT_APPLICABLE distinguishes a valid manifest, unknown requirements and no applicable requirements. Nonempty context fact refs are exact JSON strings of `[approvedRevisionId,entityType,entityId,fieldPath,valueRevisionId]`, deduplicated/sorted by UTF8 bytes, resolved through trusted same-tenant approved snapshot lookup. No model-supplied field PASS or policy flag is authority.

States KNOWN/UNKNOWN/NOT_EVALUATED/UNAVAILABLE/NOT_APPLICABLE/INVALID never collapse into zero. Required null is different from absent. Only KNOWN permits numeric value; genuine all-fail checks can produce0. Unknown/unavailable checks with recorded reasons do not earn/fail points. No applicable inputs yields NOT_APPLICABLE. Disabled formula yields NOT_EVALUATED; malformed inputs/version still reject. Non-finite, negative/out-of-range/fractional score values reject. Ratio rounding uses exact integers (e.g.2/3→67), no arbitrary floating precision or ML coefficients. Invalid weights, NA without reason and omitted checks reject.

Hash exact normalized input + scope/subject/taxonomy/formula-set/formula/input versions/asOf/policyDecisionArtifactId with stable-json-v1/SHA256. ResultHash binds every result/explanation field except resultHash. Verify through deterministic recomputation, not hash trust alone; hashes do not authenticate source, policy or actor. AsOf and immutable source/fact refs are inputs for reproducible freshness. Production must pin Unicode/registry implementation versions, validate actual subject/source ownership/approval and load reviewed formula policy from trusted configuration. Reference fixtures assume those lookup boundaries and do not implement a server.

Recalculation appends a new assessment after explicit edit, observed source/binding change, verification, policy/formula or request change. Historical result/input/asOf/version remain immutable. Historical unversioned numeric values remain LEGACY_UNSPECIFIED, not recalibrated or proof of accuracy. A replay uses the original trusted policy-decision record, not current enablement settings. Future formulas require new registered versions, review and readers; unknown versions reject new calculations. Retain historical readers on rollback.

## Persistence and compatibility

Current required KnowledgeIndex.knowledgeConfidence cannot safely represent non-KNOWN. Proposed D-KQ-03 chooses conditional index omission plus authoritative snapshot fallback, preserving schema; no -1/0/50 sentinel. Old integers without reproducible basis are not new scores. Existing business projections remain atomic; KnowledgeIndex is conditionally materialized only after reviewed policy and all applicable material-field scores are known. If unsafe for actual workload, review nullable schema/reference migration separately; no change is made here. New company-size2 key also cannot map to old SIZE_21_50; Product selection must precede any enum migration/writer.

Older Artifact confidence/contextScore objects can carry `{value:null,basis:null}`. That is historically unspecified missing data, not proof of a particular new state. Full new dispositions/formula/inputs require proposed2.4 attachment; no JSON smuggling into basis. Known legacy adapter uses numeric value plus a reference to the actual assessment; non-KNOWN maps null/null while new readers inspect the attachment. No change to source-evidence1, ontology-relations1, Artifact2.0–2.3 or Gateway1. No relationship/fact auto-approval, index authority, new dashboard or monitoring integration.

D-KQ-01 owns company boundaries; D-KQ-02 standards/market/language profile; D-KQ-03 assessment storage/index/draft/migration; D-KQ-04 support formulas/source policy; D-KQ-05 ranking/coverage. The Decision Register records approvers and disabled defaults. No quality threshold is approved for generation, activation, publication or customer benefit claims.

## Required signal derivation (producer responsibility)

The reference function calculates from an already validated signal snapshot. Production must derive signals from real references using these rules, not trust a check array supplied by a model or client:

| Check | PASS / FAIL / unresolved source |
| --- | --- |
| literalPreserved | Actual candidate field literal agrees with retained support text/declared reviewed interpretation under Source Evidence1; known altered/unsupported literal FAIL, missing support UNKNOWN, inaccessible required bytes UNAVAILABLE |
| classificationValid | Exact Active entity/field/origin/type vocabulary validations pass; known invalid classification FAIL and existing governance blocks independently |
| parseUnambiguous | Actual parser/binding diagnostics have no unresolved interpretation, ambiguous reading order or numeric/date/currency meaning; known ambiguity FAIL, unavailable diagnostics UNKNOWN. Exact coordinates alone do not pass semantic interpretation |
| sourceBindingResolved | Actual selected original-candidate binding/manifest/source identity and digest resolve under current policy; genuine normalized-only/structural support retains its category/warning and is not zero accuracy; corrupt refs INVALID, inaccessible required source UNAVAILABLE |
| supportResolved | Manual author/input provenance, imported approved support refs/binding or allowed derivation inputs resolve in the actual subject. No Document invented for manual support. Forged/mismatched refs INVALID |
| interpretationResolved | Literal value needs no unsupported inference, or explicit allowed manual correction establishes intended meaning; ambiguous currency/date/locale FAIL, unknown intended meaning UNKNOWN |
| verificationCurrent | Resolve actual verifiedInRevisionId/time and explicit verificationDueAt against recorded asOf. Not yet due PASS; due at or before asOf, observed changed source or stale derivation FAIL. No verification/due policy UNKNOWN; no invented TTL or automatic approval bonus |
| sourcePolicyAcceptable | Actual independently reviewed policy ACCEPTED_FOR_USE for this exact source/policy PASS; REVIEW_REQUIRED/REJECTED FAIL, UNASSESSED/missing review UNKNOWN; manual fact with no external source may be NA with reason. It never reads Knowledge Confidence |

Artifact2.4 pins actual source/policy/subject references and publication operation. Schema/score arithmetic does not prove these signals are honest. Evidence/source policy flow into support checks; support score does not feed Source Trust. Completeness/readiness do not depend on numeric confidence. Context coverage uses eligible approved refs, not these procedural checks; its value never feeds fact approval. This directed dependency graph has no confidence/trust cycle.
