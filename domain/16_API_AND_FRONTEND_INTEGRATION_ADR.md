# ADR-017 — Production-oriented API and frontend integration contracts

2026-10-21. Owner: Architecture + Product + Frontend + Security; Design/Operations/Privacy review their dependencies. **Specified — Pending Product/Architecture/Frontend/Security Review (D-AUD-08)**. No responsible reviewer approval/date is recorded. Seven-feature MVP unchanged; modular NestJS backend and ADR-009 retained. “Production-oriented” describes design detail, not production evidence.

## Audit before changes

The API baseline has38 core operations (four auth, three Organization,20 Brand/entity/voice, one Brief, four import, six Workspace) and eight already-incorporated provenance operations. Baseline entity routes expand the identical services/audiences/competitors pattern. The proposed knowledge-change-candidates facade is separately unapproved and excluded. All46 are inventoried, including gated provenance routes; no new public route added. Controller owners remain the existing five modules; six core services are DI-only.

| Existing source / contradiction | Specification reconciliation | Adoption gate |
| --- | --- | --- |
| API list has mostly blank DTOs; full PRDs/provenance demand versions/history/restore | One OpenAPI3.1 and closed typed DTO bundle;46-row matrix | D-API-03/07, integrated PRD reviews |
| Baseline failure envelope lacks request ID/fields/retry; nonstream success undefined | Preserve success/error names, proposed safe extra Error fields; success/data/meta,204/SSE exceptions | D-API-03/07 actual reader compatibility |
| lastActivityAt mutable; Message createdAt not acceptance order | Frozen metadata list snapshots, signed scoped cursors, tie-breaking; sequence-backed messages | D-API-02, D-HIST-01 |
| ADR-009 demands signup non-enumeration but immediate session versus duplicate409 differs observably | Explicit blocking Security/Product review of uniform acceptance/login handoff or compliant alternative; no new flow enabled | D-API-03 |
| Conversation has no durable create identity | Required keyed creation cannot be enabled without reviewed nullable key storage/infra receipt | D-API-03 storage proposal; no Prisma change here |
| SSE disconnected before accepted event leaves caller uncertain | Retain key, GET existing Conversation with scoped header selector; recoveredAttempt independent of page | D-API-01/03/06, D-HIST-03/04/D-REV-02 |
| PRD says reconnect/read, but no reconnect endpoint/event log | Read recovery only; explicit terminal retry variant gated; no Last-Event-ID promise | D-API-01/06 |
| Import readiness called ImportCompleted in metrics | Preserve name as review-ready; distinct ImportClosed durable terminal; reuse original status schema | D-IMP-LC-01/02, D-API-05 |
| Metrics require validated presentation but inventory has no telemetry transport | Typed minimized event registry; signal transport explicitly blocked pending smallest reviewed amendment | D-API-05/D-POL-01/D-ARCH-01 |
| Design references external full kit/tokens, historical dropdown | Missing-design register, static MVP label, behavioral accessibility expectations | D-API-04; D-IMP-03 placement |
| Provenance expects graph restore but no public edge-edit review contract | Typed field DTOs only; unsupported relationship restore rejects, not partial loss | D-REL-02/D-API-03 |

Audit sources: README/scope/register/audit/changelog, metrics/lifecycle/security/provenance, all three PRDs, Domain/Artifact/Database/API, ADR-009/012/016, Component Kit, Product/Engineering Bibles, all six service specifications, Prisma, existing contracts and Task18/22 evidence. These sources provide design and historical evidence, not implementation approval. External Design Foundations/full kit remains unavailable.

## Proposed decision

Use [public-api1.0.0](../contracts/public-api/README.md) as the canonical structural/transport/client contract, subject to named reviews. [Endpoint matrix](../contracts/public-api/ENDPOINT_MATRIX.md) links each route to controller, PRD, auth, DTO/status/errors, mutation/pagination profile, frontend and gates. Shared profiles apply normatively to each operation. Error registry/typed DTOs have one source; PRDs reference them rather than inventing parallel fields.

Access Bearer+authoritative session and actual tenant checks; refresh cookie/Origin+reviewed CSRF header per ADR-009. Strong read isolation, approval/revision preconditions and typed safe public projections. Human save approves reviewed manual changes, imported data remains separate pending review. No extra Document/extraction job for manual Brand initialization/publication. Unknown confidence is null, completeness is independently persisted, readiness never a score threshold.

SSE accepted event follows acceptance commit, chunks provisional, completed after durable validated transaction, failed only after durable terminal state. Disconnect is presentation recovery, never cancellation. GET same operation/key; no automatic POST retry/new USER. New terminal retry variant needs explicit D-HIST-03/D-REV-02/D-API-06 review. Provider/context public controllers, multi-org, team, exports, advanced memory, relationship controls and regeneration UI remain excluded/gated.

## Alternatives and tradeoffs requiring review

Live keyset lastActivityAt is simpler but permits repeats/skips when updated; frozen bounded identifier snapshot is recommended, with extra shared cache/expiry complexity. Offset unsupported. Durable SSE event replay would require storage/retention/new transport review; existing read recovery is recommended. Conversation create identity could be nullable scoped key columns or reviewed infrastructure receipt; neither storage choice is silently selected. Cookie CSRF recommendations and browser tab coordination require actual deployment testing; no identity vendor invented. Presentation telemetry cannot be inferred from completed generation; blocked transport is preferable to fabricated activation evidence. These are proposed defaults, not new approvals.

## Migration, evidence and acceptance limits

[Compatibility plan](../contracts/public-api/COMPATIBILITY.md) lists prerequisites, historical version behavior, rollback/disablement and exact alias mapping. No existing contract bundle, Prisma or SQL supplement changes; no migration applied. Future create-key/order/snapshot/outbox storage review and deployment are necessary before writers. Runtime numeric budgets/rate limits/receipt retention/cursor expiry/auth password policy must be reviewed, not synthetic defaults.

[Task23 results](../validation/TASK23_RESULTS.md) records actual tests, protected-file comparison and coverage. AT-23-01–40 plus negative fixtures cover offline schema/authorization/cursor/idempotency/stream/recovery/frontend models; isolated SQL tests cover mechanisms only. Neither proves real JWT/CORS/SSRF/parser/provider, network SSE/proxy, cross-replica queues/cache, accessibility or end-to-end delivery. D-AUD-08 specification is reviewable; conditional gaps (creation identity storage, telemetry transport, relationship restoration and authentic history cutover) remain disclosed rather than declared runtime-ready. No approval of Founder/quality/history/security/policy/commercial gates.
