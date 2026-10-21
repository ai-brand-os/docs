# Privacy-aware product telemetry registry

Proposed1.0.0 / D-API-05 and D-POL-01. Not observed usage, activation, retention or conversion. [Typed events](1.0.0/telemetry.schema.json) and [registry](1.0.0/telemetry-registry.json) preserve all13 PRODUCT_METRICS names and add seven explicit review/closure/outcome/feedback/deletion events (20 total). GenerationRequested is the accepted event; no competing GenerationAccepted alias. Historical ImportCompleted means ready for human review, **never terminal completion**; ImportClosed is verified terminal closure.

| Name | Trigger | Producer | Dedupe business identity |
| --- | --- | --- | --- |
| OnboardingStarted | Validated initial setup presentation | Application telemetry adapter | instance |
| OnboardingInterrupted | Exit or reviewed inactivity monitor | Application telemetry adapter | instance |
| OnboardingResumed | Validated reentry same instance | Application telemetry adapter | instance |
| BrandBrainRevisionApproved | After atomic approval commit; first occurrence is first approved Brain | KM outbox | revision |
| BrandBrainReadinessEvaluated | Actual approval/archival/compatibility evaluation | KM/application outbox | evaluation |
| ImportSubmitted | Admission commits | KnowledgeImport outbox | import |
| ImportCompleted | Eligible frozen review set established, NOT closure | KnowledgeImport outbox | import |
| ImportFailed | Durable failure closure | KnowledgeImport outbox | import |
| GenerationRequested | Accepted USER/assistant/receipt commits; canonical generation accepted name | Workspace outbox | operation |
| OutputPresented | Authorized server validates UI final readable-output acknowledgement | Application telemetry adapter | presentation |
| OutputUsabilityConfirmed | Accepted optional usability/copy/helpful action on presented valid output | Application telemetry adapter | action |
| QualifiedFirstValue | First valid OutputPresented join once per initial instance | Cohort processor | instance |
| OnboardingWindowClosed | Mature start+7day cohort under measurement version | Cohort processor | instance |
| ReviewOpened | Validated display of authorized frozen review set | Application telemetry adapter | review visit |
| CandidateDecisionRecorded | Immutable decision/publication transaction commits | KM outbox | decision |
| ImportClosed | Verified durable CLOSED projection commits | KnowledgeImport outbox | closure |
| GenerationCompleted | Validated final RESPONSE + Message COMPLETED commit | Workspace outbox | operation |
| GenerationFailed | Durable terminal assistant failure; not transport disconnect | Workspace outbox | operation |
| FeedbackSubmitted | Unique vote transaction commits | Workspace outbox | feedback |
| ConversationDeletionRequested | Tombstone+purge request commits | Workspace outbox | deletion |

## Fields applying to every event

Required eventName/eventVersion/contractVersion, stable eventId, occurredAt/serverRecordedAt UTC assigned by server (UI clocks cannot backdate); pseudonymous accountId/organizationId/brandId, onboardingInstanceId and browserSessionId (explicit null when not applicable/allowed). Brand null only for precreation onboarding events/window closure; initial instance joins later Brand without restarting clock. consentState PERMITTED or NOT_REQUIRED only after reviewed lawful-purpose policy, cohort INITIAL_ONBOARDING/EXISTING/INTERNAL_TEST and attribution DIRECT/UNKNOWN. No browser-supplied tenant, consent assertion or marketing referrer URL trusted. All identity references in product event storage are purpose-scoped pseudonyms, resolvable only by restricted authorized join adapter, not raw email/session credentials; opaque output/revision/fact-key IDs are minimized references, not fact values. Proposed adapter/library inside current backend, not a new microservice or analytics vendor. Exact fields/optionality/null vocabulary in schema; no arbitrary properties.

Class P applies to every event: restricted pseudonymous product-use/behavior data, not anonymous; no source text, quotation, prompt/answer, filename/URL, credential, IP or raw provider diagnostic. Property allowlists plus schema validation and registered code/version/fact-key validation before enqueue; arbitrary strings cannot disguise business text as a version/reason/field key. Values originate from authorized committed records or reviewed enum registries, never freeform browser properties. IDs alone do not exempt consent/retention. User opt-out/unavailable permission suppresses product event emission and records authorized aggregate unmeasurable counts where lawful; no fabricated successful conversion. Required operational security/deletion receipts follow separately approved purpose policy and cannot be copied into product analytics by calling it essential.

All events emit once per stable server business identity and event name/version using transaction/outbox where tied to mutation. Consumers dedupe by purpose/tenant/eventId and verify same canonical body; altered duplicate quarantined, no double activation. Replay reuses eventId/occurredAt, serverRecordedAt is original authoritative receipt time. Out-of-order prerequisites wait boundedly under reviewed retention; missing reference/join invalidates qualification rather than imputing0. Outbox retention/retry/poison handling and idempotency durability are D-ARCH-01/D-API-05, no table/queue schema invented as implemented. Reconciliation IDs are scoped, redacted from general logs. Pseudonym mapping deletion and aggregate survival need D-POL-01/legal approval, no arbitrary new TTL.

OnboardingStarted/Resumed/Interrupted, ReviewOpened, OutputPresented and copy/usable acknowledgements require validated **browser presentation signals**. Existing baseline has no public telemetry ingestion route or confirmed transport. **D-API-05 blocks these instrumentation paths** until Product/Architecture/Frontend/Security/Privacy choose a same-application authenticated adapter/transport or explicitly review the smallest endpoint amendment. This task creates no public analytics endpoint and does not infer presentation from GET/generation completion. Helpful feedback supplies a supplementary usability signal only after output-presentation evidence; without it FeedbackSubmitted remains valid but qualification unavailable. Brief stable output identity is derived server-side from Brand+revision+partial/full view version, no export record.

QualifiedFirstValue uses server validation receipt time of first final readable grounded presentation with pinned authorized revision/support, once per instance; elapsedMs nonnegative and equals qualifiedAt−startedAt. Repeated reloads cannot reset startedAt or first outcome; missing events/consent/joins reported as unmeasurable/exclusions with counts under PRODUCT_METRICS, not successes. Converter percentiles/censored seven-day cohort and goals median≤10minutes/p90≤15minutes unchanged. New events do not imply benchmark results, model training or automatic learning.

## Operational metrics are separate

Aggregate request latency/status by route template, queue age/lease failures/retries, finite resource usage, provider cost/timeout, cursor rejection, SSE disconnect and purge overdue counts are operational signals with separately restricted retention/access. A socket failure count is not GenerationFailed or an AI quality measure. Avoid high-cardinality/raw resource IDs and any content/credentials in metric labels. Product analytics outage must not bypass approval/security/deletion; transactional success may await durable required operational receipt but never a third-party analytics service. Review budgets/alerts and privacy policy before launch.
