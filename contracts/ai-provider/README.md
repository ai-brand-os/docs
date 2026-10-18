# Internal AI Provider Gateway contracts

Version **1.0.0**. Date 2026-10-18. **Specified — Pending Architecture/Security Review**, D-AUD-02. [ADR-011](../../domain/10_AI_PROVIDER_GATEWAY_ADR.md) owns responsibilities, policy, flows, security and recovery. These are ephemeral, DI-only invocation DTOs in one NestJS backend release, not public API endpoints, Prisma models, Artifact payload replacements or an implemented provider integration.

## Registry and validation

[Local registry](1.0.0/registry.json), [request](1.0.0/request.schema.json), [terminal response](1.0.0/response.schema.json), [policy configuration](1.0.0/policy.schema.json), [common types](1.0.0/common.schema.json), [extraction output](1.0.0/extraction-output.schema.json) and [generation output](1.0.0/generation-output.schema.json) use Draft2020-12. Load locally with the unchanged [Artifact v2 common types](../artifacts/2.0.0/common.schema.json) to reuse the exact safe error object. URNs never trigger network fetching. Reject unregistered versions/refs/properties, duplicate JSON object keys, invalid formats, nonfinite values and oversized bytes before decoding; no coercion, default injection or property removal. Duplicate-key/raw-byte parsing checks remain runtime gates, beyond Ajv's parsed-object fixtures.

All object properties are required, including nullable properties. No optional properties exist in 1.0.0. Null means explicitly unavailable/not applicable, never an omitted default, fabricated zero or permission bypass. Unknown keys are rejected. Schema maxima are defensive serialization ceilings, not approved operational limits; reviewed policy must impose finite equal or stricter caps. DTO status is a local terminal invocation discriminator, not a new ArtifactStatus or Conversation lifecycle. Pending/in-progress is an in-memory call/queue state; partial provider output never returns a successful terminal DTO. Caller artifacts retain all existing PENDING/PARTIAL outcomes.

## Request fields and trust

| Field | Meaning / validation beyond shape |
| --- | --- |
| contractVersion | Exact registered 1.0.0; unknown version fails closed |
| invocationId, correlationId | Existing stage invocation and operation correlation UUIDs; fresh identity per stage invocation, stable on physical and logical retries. Each physical retry consumes the next Artifact attemptNumber; request attemptNumber is the first reserved number in this admitted batch. Terminal checkpoint number = request attemptNumber + max(physicalAttempts,1) − 1. The next logical retry starts after all consumed attempt numbers, with a distinct receipt and the same stage invocationId |
| organizationId, brandId | Asserted UUIDs must equal authenticated grant and all referenced objects; never derive authorization from JSON |
| purpose, caller | KNOWLEDGE_EXTRACTION ↔ KNOWLEDGE_EXTRACTION; WORKSPACE_GENERATION ↔ AI_ORCHESTRATOR. Enum pair is not authentication; trusted opaque DI execution context must independently match |
| promptTemplateId/Version, trustedInstructionRef | Caller-owned registered template ID/semver and trusted registryKey/SHA256; Gateway verifies their exact binding and purpose, then loads server instructions. No user instruction text is trusted |
| task.content | Bounded untrusted source excerpts or generation task/context text; may contain malicious instructions; cannot set execution policy. Minimize and screen before egress |
| task.evidence | Allowlisted evidence UUIDs bound to real same-tenant source Artifact/Document and authorized validated input; source location remains in caller's original evidence map. No invented original offsets (D-AUD-05). Generation may use [] because its pinned context references remain in the caller's PROMPT_CONTEXT/PROMPT |
| task.requestedFieldRefs | Registered extraction slot keys; output must be a subset, ontology/importable-field restrictions checked by Extraction. Generation uses [] |
| task.dataClassification | BUSINESS_INTERNAL or SENSITIVE_REVIEWED; latter does not itself approve sensitive disclosure. Trusted classification must agree and policy/consent must permit it |
| expectedOutputSchemaRef | Exact locally registered extraction-output or generation-output URN matching purpose. Caller cannot supply an arbitrary schema/URL |
| requirements | Registered capabilityKey; requiredCapabilities TEXT/STRUCTURED_JSON supported by selected model. Extraction requestedModelKey is null; generation is a nonempty exact registry model key requested by Orchestrator |
| policyRef | Exact reviewed ID/version; missing, unreviewed or purpose/tenant-ineligible policy denies |
| limits | Positive finite maxInputTokens/maxOutputTokens/maxOutputBytes/timeoutMs/maxPhysicalAttempts and nonnegative decimal-string maxCost amount/currency. Zero cost ceiling permits no positive-cost execution. Enforce actual tokenization/upper-bound cost, not string length or requested output alone |
| attempt | Positive logical attemptNumber, scoped UUID idempotencyKey, SHA256 requestHash. stable-json-v1 hashes the request excluding requestHash itself, preserving array order; changed request under same scoped key is CONFLICT |
| execution | Absolute deadlineAt, internal cancellationId and workRef. Deadline=min(request deadline, now+timeoutMs, remaining operation deadline). Cancellation signal/state lives in trusted runtime infrastructure, not mutable JSON |
| workRef | IMPORT id is import correlation; sourceArtifactId is STRUCTURED_DOCUMENT; jobId and leaseFence are required non-null/current. MESSAGE id is existing assistant Message; sourceArtifactId is PROMPT, with authorized PROMPT_CONTEXT/approved revision linkage. API execution may have null jobId/leaseFence under its Message claim; queued generation requires both non-null/current. Paired job/lease nullability is enforced by schema; validate current claim/lease at runtime |

Source artifact IDs, evidence IDs, model requests, template/policy versions and requestHash never establish authority. A trusted application/worker grant binds current Owner membership/session/Brand and job or Message; Gateway must compare every assertion. Evidence IDs must be unique with no duplicate field mapping. Output evidence and field references must resolve to the allowlisted request and genuine source, not merely valid UUIDs. Gateway performs structural/reference allowlist checks; Extraction independently checks source support, ontology/values and creates candidate IDs itself. Candidate value schema supports bounded string or string-list proposals only; numeric/date/price interpretation follows ontology and source-preserving caller rules, never silent normalization. Manual-only tone/competitor fields cannot be emitted by import. Source citation strings or model confidence do not prove a fact.

## Response semantics

| Field | Meaning / nullable rules |
| --- | --- |
| contractVersion/invocationId/purpose | Match request exactly |
| status | SUCCEEDED, FAILED, CANCELLED, TIMEOUT. Timeout/cancel require matching exact error code. No partial success |
| providerKey/modelKey | Exact executed registered keys; null before selection, otherwise both selected even if transport fails. Must match policy and generation PROMPT modelConfiguration |
| output | SUCCEEDED requires purpose-specific typed output, error null. Other states require output null and exact Artifact v2 safe error; fragments remain caller checkpoints, not unvalidated success output |
| output extraction | kind EXTRACTION_PROPOSALS; proposals fieldRef/evidenceId/value/confidenceIndicator. No approval, approver, tenant IDs or knowledge mutation. Confidence 0..1 is an uncalibrated indicator; null unknown. Empty proposals permitted; semantic coverage belongs to Extractor |
| output generation | kind GENERATED_TEXT, nonempty bounded text. Gateway structural success is separate from Orchestrator final safety/grounding/business validation |
| usage | inputTokens/outputTokens nonnegative integer or null. UNKNOWN requires both null; MEASURED/ESTIMATED require at least one available count at runtime. Record measured vs estimated; sum all physical attempts, unknown if any billable attempt cannot be counted safely |
| estimatedCost | Decimal-string amount and ISO-style uppercase three-letter currency or null unknown; not invoice/billing evidence. Must use reviewed price version/currency, account retries, preserve unknownness |
| latencyMs | Nonnegative total elapsed time including physical attempts/backoff, not provider-only latency |
| template/policy refs | Exact request refs, traceable through content-free telemetry; provider cannot change them |
| execution | physicalAttempts includes every dispatched transport attempt and determines the last consumed existing Artifact attemptNumber; zero for preflight denial. regionKey/priceVersion nullable before selection; vendorRequestDigest null unless approved privacy-safe digest available. externalChargePossible false for no call, true when any dispatched call may have incurred a charge, including timeout/cancellation |
| error | Exact existing closed safe error {code,message,retryable,retryAfterMs,violationPaths,diagnosticId}; never raw vendor exception/body, stack, prompt or credentials. retryable is advisory, never permission beyond original budget |

Permanent failures: POLICY_DENIED for caller/policy/disclosure denial; REFERENCE_INVALID for tenant/reference mismatch (public adapters must hide existence); INPUT_INVALID/CONTRACT_INVALID for malformed DTO; OUTPUT_INVALID for bounded/schema/allowlist-invalid output. RESOURCE_LIMIT is retryable only for reviewed transient admission/rate constraints, not excessive requested ceilings. PROVIDER_FAILED is retryable only for transient connection/429/5xx; vendor auth and permanent 4xx are not. CANCELLED is not retryable; TIMEOUT may be retried only if a new admitted attempt fits the original operation budget. Exhaustion never triggers fallback. Reuse exact codes; do not add provider-specific error enums.

The terminal-response contract applies once a trusted request can be decoded and an invocation ID established. Malformed input without a valid invocation ID raises an internal safe contract-validation exception before dispatch (CONTRACT_INVALID with diagnostic ID), rather than inventing a response ID or echoing unsafe input. No public HTTP error interface is added.

## Policy, persistence and compatibility

Policy schema describes a single provider, explicit region/price version, disclosure classes, per-purpose default/allowed models and limits, fallbackEnabled=false, and finite global/per-tenant concurrency, rates, max backoff, dedup window, uncertainty margin and telemetry retention. Schema shape or reviewEvidenceRef text cannot grant approval: deployment registry must resolve real reviewer evidence and current approved status. Default model must be in the allowlist; models must support capabilities; global/tenant/per-purpose limits and reservations must agree. A security/privacy approved deployment may use a stricter null/unknown-region rule; no unproven residency is inferred from a key.

See [ADR policy precedence and budgets](../../domain/10_AI_PROVIDER_GATEWAY_ADR.md#provider-policy-and-precedence). D-GW-01 leaves actual values pending; D-SEC-02 leaves provider/data handling unapproved. All fixture numbers/keys are fictional. Gateway has no business ledger, knowledge access or artifact production. Existing caller artifacts own durable operation receipts; shared quota/lease/rate state belongs to reviewed infrastructure (ADR-010), with no new Prisma entity. DTOs containing raw task/output are not telemetry and must not be logged or stored wholesale.

[Artifact mapping and migration](../../domain/10_AI_PROVIDER_GATEWAY_ADR.md#artifact-compatibility-and-migration) preserves v2.0.0 files and Prisma. No data migration is needed. Load exact contract/template/policy readers before callers; reject unknown versions with CONTRACT_INVALID, retain old registered readers for in-flight work or explicitly drain it, never reinterpret historical artifacts. Immutable bundle changes require a new registered version: closed-reader additive changes need explicit minor-version rollout, breaking semantic/type changes major. Rollback disables new calls, retains historical readers/artifacts and never retries through an incompatible version or unapproved provider. No conversion of model success into human approval.

## Examples and executable acceptance

Valid shape examples: [extraction request](1.0.0/examples/extraction-request.json), [generation request](1.0.0/examples/generation-request.json), [unknown-usage success response](1.0.0/examples/success-response.json), [synthetic policy](1.0.0/examples/policy.json). [Invalid examples](1.0.0/examples/invalid.json) cover injected trusted fields, missing success output, fallback and unknown version. Request examples have illustrative hashes; the test computes the actual fingerprint before policy dispatch. Syntactically valid references still need live authorization checks.

Run `ARTIFACT_VALIDATOR_PACKAGE_ROOT=../backend/node_modules/ajv-formats node validation/ai_provider_gateway.test.cjs` from the repository root, or install pinned [validation dependencies](../../validation/package.json) and run `npm --prefix validation run test:gateway`. No network schema resolution/provider/database is used. [Task17 results](../../validation/TASK17_RESULTS.md) reports actual execution and limits. The fixture harness is a test-only behavioral model, not a production NestJS module, security proof, quota implementation or vendor adapter.

| Acceptance | Offline fixture scenario / runtime proof still required |
| --- | --- |
| AT-17-01 | Deterministic-only result avoids fake adapter and retains unapproved candidate semantics |
| AT-17-02 | Authorized extraction uses reviewed synthetic policy/caller and typed output |
| AT-17-03 | Claimed DTO caller without trusted capability is denied before adapter |
| AT-17-04 | Mismatched trusted tenant / evidence denied |
| AT-17-05 | Disabled/unapproved registry provider denied |
| AT-17-06 | Over-budget request denied before transport |
| AT-17-07 | Synthetic adapter timeout normalizes TIMEOUT with possible unknown charge |
| AT-17-08 | Fake 429/5xx use bounded same-provider retries; no hidden adapter retries |
| AT-17-09 | Invalid structured/forged approval output denied and no approved publication |
| AT-17-10 | Source injection text cannot change configured provider/template/budgets; no claim of perfect model obedience |
| AT-17-11 | Extraction caller emits only existing extraction artifact; no Message/Workspace artifacts |
| AT-17-12 | Generation fixture passes unchanged Artifact v2 validation; Message completion gated on final validation |
| AT-17-13 | Same fingerprint receipt replays; changed body conflicts; one selected final outcome |
| AT-17-14 | Telemetry allowlist excludes raw content/credentials/provider bodies |
| AT-17-15 | Outage/unapproved fallback stays closed on same provider |
| AT-17-16 | Provider success alone neither approves facts nor completes Message |
| AT-17-17 | Changed cancellation, authorization, lease, tenant or deletion state blocks downstream publication |

Real provider responses, terms/settings, egress/redaction, distributed quotas/idempotency, lease crashes, transaction races, SSE and cancellation need application integration tests and named reviewer evidence before launch. No passing fixtures close D-SEC-02, D-AUD-04 or other approvals.
