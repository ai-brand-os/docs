# Task17 validation record — internal AI Provider Gateway

Executed 2026-10-18 in this documentation repository with Node v22.19.0, Python3 and read-only adjacent compatible Ajv8/ajv-formats tooling. No dependency installation, provider call, external schema fetch, application implementation, database migration or runtime deployment occurred.

## Commands and actual results

```sh
ARTIFACT_VALIDATOR_PACKAGE_ROOT=../backend/node_modules/ajv-formats node validation/ai_provider_gateway.test.cjs
ARTIFACT_VALIDATOR_PACKAGE_ROOT=../backend/node_modules/ajv-formats node validation/artifact_contracts.test.cjs
python3 validation/check_documentation_links.py
python3 validation/check_documentation_contracts.py
git diff --check
git diff HEAD -- schema.prisma contracts/artifacts/2.0.0
```

- Gateway: PASS AT-17-01 through AT-17-17 individually; six new local Draft2020-12 schemas with four valid example documents and four invalid examples, plus shape, source-allowlist, partial/failure, deadline and policy probes. Uses unchanged Artifact v2 common errors and existing generation/extraction fixtures. Exact output reports 17 named offline cases, not a fabricated runtime assertion count.
- Existing Artifact suite: PASS ten Draft2020-12 schemas, 16 variants, 16 valid/12 invalid fixtures, **783 assertions**; every registered stage/outcome and all five ArtifactStatus values. Existing offline reference tests remain distinct from real authorization/publication.
- Documentation contract checker: PASS enum/table/diagram, MVP Brand uniqueness/export exclusions, four source relations, purge/revisions, SQL reference, completeness weights, events and Markdown fence balance.
- Local Markdown link/anchor checker: PASS, **1022 local destinations checked, 0 errors**. External URLs are not verified by this checker.
- Whitespace check: PASS, no output.
- Protected-file diff: empty. Additionally compared each tracked file's bytes to `git show HEAD:<path>` in Python: **14 Artifact v2.0.0 files and schema.prisma byte-identical to HEAD**. Prisma SHA256 remains `a05d7b92d3a87b811f530131374fc1de3fb96cb294036dc39e70152923aa6385`. No Prisma changes proposed, so Prisma validation was not rerun, as requested; earlier validation evidence is historical.

## Coverage and limits

The test-only `FixtureGateway` uses a fake adapter, synthetic reviewed-policy flag/clock/grants, process-local receipts and in-memory final selection. It validates executable policy expectations for unauthorized/mismatched tenants, unreviewed providers, requested ceilings, safe timeout/error/retry normalization, forbidden output properties/references, source-policy separation, no extraction Workspace output, generation Artifact mapping/final-validation gate, duplicate receipt conflict/replay, content-free telemetry, disabled fallback, no auto-approval and late cancellation/authorization/deletion/fence denial. It also validates existing PARTIAL and failure artifacts rather than marking partial results successful. Deterministic-only fixtures retain RULE provenance and make no provider call.

This does **not** test real credentials or grant issuance, provider terms/regions/training/retention, adversarial model obedience, tokenizers/pricing/invoices, HTTP cancellation, distributed rates/quotas/reservations, concurrent queue leases, transaction fencing/idempotency, source evidence truth, database tenant authorization, Message/SSE recovery or final user presentation. Validated generation/extraction artifacts reuse synthetic v2 fixtures; this is contract conformance, not an end-to-end pipeline or factual-accuracy test. In-memory receipt replay is not proof of exactly-once distributed processing or provider charging. No Mermaid renderer or production security integration is claimed tested.

## Decision and release gates

D-AUD-02: **Specified — Pending Architecture/Security Review**, not Approved. D-SEC-02 actual provider/privacy approval remains open. D-GW-01 operational values require Architecture/Engineering/Security/Operations review, Product budget/UX and Legal/privacy retention input. D-ARCH-01/02 queue/quota/capacity implementation, D-AUD-04 Artifact review, D-AUD-07/D-IMP-02 partial/closure UX, D-AUD-01 history, D-AUD-08 transport and D-POL-01/D-SEC-03 retention remain separately open. [ADR-011](../domain/10_AI_PROVIDER_GATEWAY_ADR.md) specifies runtime integration and approval responsibilities. No new Founder decision or MVP capability is approved.

## Changed-file summary

- Added `domain/10_AI_PROVIDER_GATEWAY_ADR.md`: audit matrix, ownership/policy, before/after graphs, sequences, security/retry/cost rules, metadata/compatibility mapping and review gates.
- Added `contracts/ai-provider/README.md` and `1.0.0/`: six schemas, registry, four valid examples and invalid-example catalog. Ephemeral DTOs; no additional business persistence.
- Added `validation/ai_provider_gateway.test.cjs` and this result record; added `test:gateway` to validation/package.json.
- Reconciled Product/Engineering Bibles, Extraction/Orchestrator/KM specs, Artifact/API models, lean ADR, security model, Artifact contract overview, decision register, final audit, documentation changelog and README index. Existing Artifact v2 bundle and Prisma are unchanged.

Exact changed-file inventory (31 files):

```text
BIBLE/02_PRODUCT_BIBLE.md
BIBLE/03_ENGINEERING_BIBLE.md
DECISION_REGISTER.md
DOCUMENTATION_CHANGELOG.md
FINAL_CONSISTENCY_AUDIT.md
README.md
SECURITY_THREAT_MODEL.md
contracts/ai-provider/1.0.0/common.schema.json
contracts/ai-provider/1.0.0/examples/extraction-request.json
contracts/ai-provider/1.0.0/examples/generation-request.json
contracts/ai-provider/1.0.0/examples/invalid.json
contracts/ai-provider/1.0.0/examples/policy.json
contracts/ai-provider/1.0.0/examples/success-response.json
contracts/ai-provider/1.0.0/extraction-output.schema.json
contracts/ai-provider/1.0.0/generation-output.schema.json
contracts/ai-provider/1.0.0/policy.schema.json
contracts/ai-provider/1.0.0/registry.json
contracts/ai-provider/1.0.0/request.schema.json
contracts/ai-provider/1.0.0/response.schema.json
contracts/ai-provider/README.md
contracts/artifacts/README.md
domain/02_ARTIFACT_MODEL.md
domain/05_API_DESIGN.md
domain/09_LEAN_MVP_ARCHITECTURE_ADR.md
domain/10_AI_PROVIDER_GATEWAY_ADR.md
services/03_KNOWLEDGE_EXTRACTION_SERVICE.md
services/04_KNOWLEDGE_MANAGEMENT_SERVICE.md
services/06_AI_ORCHESTRATOR.md
validation/TASK17_RESULTS.md
validation/ai_provider_gateway.test.cjs
validation/package.json
```
