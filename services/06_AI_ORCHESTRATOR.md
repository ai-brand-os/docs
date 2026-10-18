# Service Specification — AI Orchestrator

> Task16 (2026-10-17): [canonical Artifact v2 contracts](../contracts/artifacts/README.md) and the [registered schemas](../contracts/artifacts/2.0.0/artifact.schema.json) define exact envelope/payload/stage/status/error structure. This service emits PROMPT / RESPONSE, variants prompt_stage / prompt / response_stage / response. D-AUD-04 is specified with conformance evidence, **pending Architecture/Engineering review**, not Approved. Existing product/provider/history/policy decisions remain open.

> Task17 (2026-10-18): D-AUD-02 is **Specified — Pending Architecture/Security Review** under [ADR-011](../domain/10_AI_PROVIDER_GATEWAY_ADR.md) and [Gateway DTO contracts](../contracts/ai-provider/README.md). Orchestrator retains Workspace planning, generation templates/model requests, logical retries, final validation and Message completion; provider invocation uses Gateway. Extraction separately calls Gateway, never this Workspace interface. D-AUD-01 history remains open.

> Final audit (2026-10-16): “Intake/Processing/Extraction/Knowledge Management/Context Assembly/AI Execution Job” means a logical correlated operation/status view, not an additional Prisma domain table. Queue transport state is infrastructure-owned under [ADR-010](../domain/09_LEAN_MVP_ARCHITECTURE_ADR.md). Current working text requires integrated review; historical approval footers are not current sign-off.

> Approval evidence audit (2026-10-13): [DECISION_REGISTER.md](../DECISION_REGISTER.md). Recorded baseline engineering decisions are preserved. Approved labels do not sign off pending import product choices D-IMP-01/02/03, later integrated PRD revisions, or proposed legal/operational retention periods. Dependency/release gates remain disclosed.

> Scope authority (2026-10-13): [MVP_SCOPE.md](../MVP_SCOPE.md). This document specifies intended behavior; design approval does not establish implementation. Historical decisions and long-term concepts do not expand MVP.

Document

[06_AI_ORCHESTRATOR.md](06_AI_ORCHESTRATOR.md)

Version

1.0.0

Status

Draft

Owner

Architecture

Priority

P0

---

# Purpose

The AI Orchestrator coordinates the Workspace assistant-generation lifecycle. Extraction has a separate Gateway invocation path.

It transforms a user request into a validated AI response by orchestrating context assembly, prompt construction, model execution and response validation.

The AI Orchestrator owns Workspace planning and response completion.

---

# Mission

Execute AI requests in a reliable, provider-independent and observable manner.

---

# Responsibilities

The AI Orchestrator is responsible for:

- Capability detection
- Execution planning
- Context requests
- Prompt construction
- Prompt version selection
- Model selection
- Tool selection
- LLM execution
- Response validation
- Response artifact generation
- Execution telemetry
- Creating an AI Execution Job

---

# Non-Responsibilities

The service must never:

- Retrieve knowledge
- Validate knowledge
- Store knowledge
- Assemble context
- Manage Business Ontology

Those responsibilities belong to other services.

---

# Input

Accepted inputs

- User Request
- Prompt Context Artifact

Future

- Workflow Request
- Agent Request
- Scheduled Execution

---

# Output

Emit PROMPT / RESPONSE using [canonical Artifact v2 contracts](../contracts/artifacts/README.md) and the [typed payload schema](../contracts/artifacts/2.0.0/response.schema.json). Result fields live in payload.data; IDs/correlation/producer/stage/schemaVersion/ArtifactStatus live in the envelope. Registered variants: prompt_stage / prompt / response_stage / response. Every checkpoint has exact operationStatus PENDING/PARTIAL/SUCCEEDED/FAILED/CANCELLED/TIMEOUT where allowed by its schema; terminal commits and approved snapshots are SUCCEEDED only. Final downstream use requires VALID + SUCCEEDED and the appropriate final variant, never a partial/error record or eligibility-only knowledge approval. No service-specific payload/error enum may be invented.

---

# Core Principle

Execution is independent from intelligence.

The Context Engine prepares intelligence.

The AI Orchestrator executes it.

---

# Execution Pipeline

```
User Request
        │
        ▼
Capability Detection
        │
        ▼
Execution Planning
        │
        ▼
Context Request
        │
        ▼
Model Selection under shared policy
        │
        ▼
Tool Selection (empty in MVP)
        │
        ▼
Prompt Builder
        │
        ▼
Prompt Artifact
        │
        ▼
Gateway LLM Execution
        │
        ▼
Response Validation
        │
        ▼
Response Artifact
```

---

# Design Principles

Provider Independent

Execution must remain independent from LLM vendors.

---

Deterministic First

Execution decisions should follow rules whenever possible.

---

Observable

Every execution step must produce telemetry.

---

Composable

Every execution stage must be independently replaceable.

---

Secure

Sensitive prompts must remain protected.

---

# Success Criteria

The AI Orchestrator succeeds when:

- The optimal execution plan is selected.
- Context is consumed correctly.
- Prompt versions are traceable.
- Model selection is explainable.
- Responses are validated.
- Execution is fully observable.
- Each completed assistant attempt has one selected final response outcome; response_stage checkpoints/provider retries do not duplicate Message completion.

---

Status

Draft

---

# Capability Registry

The AI Orchestrator executes registered capabilities.

A Capability defines how a business task should be executed.

Capabilities are configuration-driven.

New capabilities may be added without changing orchestration logic.

---

# Capability Definition

Each Capability defines:

- Capability ID
- Name
- Description
- Prompt Template
- Context Profile
- Supported Models
- Required Tools
- Validation Policy
- Execution Policy
- Version

Capabilities are versioned independently.

---

# Execution Pipeline

Every execution follows the same pipeline.

```
User Request
        │
        ▼
Capability Detection
        │
        ▼
Capability Resolution
        │
        ▼
Execution Planning
        │
        ▼
Context Request
        │
        ▼
Model Selection under shared policy
        │
        ▼
Tool Resolution (empty in MVP)
        │
        ▼
Prompt Builder
        │
        ▼
Prompt Artifact
        │
        ▼
Gateway LLM Execution
        │
        ▼
Response Validation
        │
        ▼
Response Artifact
```

Each stage produces immutable execution artifacts.

---

# Stage 1 — Capability Detection

Purpose

Identify which business capability should handle the request.

Detection inputs

- User Intent
- Organization Configuration
- Available Capabilities

Detection should be deterministic whenever possible.

---

# Stage 2 — Capability Resolution

Purpose

Load the selected capability definition.

Loaded configuration includes:

- Prompt Template
- Context Profile
- Validation Policy
- Execution Policy
- Allowed Models
- Required Tools

---

# Stage 3 — Execution Planning

Purpose

Create an execution plan.

Planning includes:

- Context requirements
- Prompt template selection
- Model candidates
- Tool requirements
- Validation strategy

---

# Stage 4 — Context Request

Purpose

Request a Prompt Context Artifact from the Context Engine.

The Orchestrator never assembles context itself.

---

# Stage 5 — Prompt Builder

Purpose

Generate a Prompt Artifact.

Inputs

- Prompt Template
- Prompt Context Artifact
- Capability Configuration

Outputs

Prompt Artifact

Prompt Builder is deterministic. Stage numbers identify responsibilities; policy model/tool resolution must finish before the final PROMPT serialization so its modelConfiguration records the exact authorized request, as shown in the execution diagrams.

---

# Stage 6 — Model Selection

Purpose

Choose the optimal AI model.

Selection signals include:

- Capability requirements
- Cost policy
- Latency policy
- Context size
- Organization preferences
- Model availability

Model selection remains provider-independent.

---

# Stage 7 — Tool Resolution

Purpose

Determine which tools are required.

Examples

- Web Search
- Knowledge Search
- Calculator
- Workflow Execution
- External APIs

These tool examples are future-only. MVP uses no external/model-directed tools; existing PROMPT tools remains empty.

---

# Stage 8 — LLM Execution

Purpose

Execute the Prompt Artifact using the selected model through the shared internal AI Provider Gateway.

Execution records:

- Tokens
- Cost
- Latency
- Model Version
- Provider
- Retry Count

Gateway bounds transport retries; Orchestrator logical retries consume the same remaining operation-wide cost, attempt and deadline budget under [ADR-011](../domain/10_AI_PROVIDER_GATEWAY_ADR.md).

---

# Stage 9 — Response Validation

Purpose

Validate generated responses.

Validation includes:

- Output schema
- Policy compliance
- Safety checks
- Business rule compliance
- Required citations
- Format validation

Invalid responses may be regenerated according to policy.

---

# Prompt Artifact

Emit PROMPT / RESPONSE using [canonical Artifact v2 contracts](../contracts/artifacts/README.md) and the [typed payload schema](../contracts/artifacts/2.0.0/response.schema.json). Result fields live in payload.data; IDs/correlation/producer/stage/schemaVersion/ArtifactStatus live in the envelope. Registered variants: prompt_stage / prompt / response_stage / response. Every checkpoint has exact operationStatus PENDING/PARTIAL/SUCCEEDED/FAILED/CANCELLED/TIMEOUT where allowed by its schema; terminal commits and approved snapshots are SUCCEEDED only. Final downstream use requires VALID + SUCCEEDED and the appropriate final variant, never a partial/error record or eligibility-only knowledge approval. No service-specific payload/error enum may be invented. Prompt success contains actual messages and context/template/capability/model metadata. Model keys remain server-reviewed registry identifiers, not a new provider choice. Tools remain empty in MVP; no public cancel operation is added.

---

# Execution Guarantees

The AI Orchestrator guarantees:

- Provider independence
- Versioned execution
- Deterministic planning
- Immutable execution artifacts
- Explainable model selection
- Observable execution lifecycle
- Idempotent execution planning

---

Status

Draft

---

# Service Interfaces

The AI Orchestrator exposes application interfaces for AI execution.

Primary operations:

- Execute Request
- Get AI Execution Job Status
- Retry Execution

The service never exposes internal execution stages.

---

# Upstream Dependencies

The AI Orchestrator accepts requests from:

- API Layer
- Future Workflow Engine

Direct provider SDK/transport access is prohibited in all domain services, including Orchestrator. Only shared Gateway-owned adapters may contact the reviewed provider. Extraction is a separate authorized Gateway caller, not an Orchestrator upstream dependency.

---

# Downstream Dependencies

The AI Orchestrator communicates with:

- Context Engine
- Internal AI Provider Gateway (DI-only)

The AI Orchestrator never accesses the Knowledge Domain directly.

---

# Prompt Builder

The Prompt Builder constructs the final prompt.

Inputs:

- Prompt Template
- Prompt Context Artifact
- User Request

Output:

- Prompt Artifact

Prompt construction must be deterministic.

---

# Model Selection

The AI Orchestrator selects the most appropriate model.

Selection criteria:

- Organization configuration
- Context size
- Cost policy
- Latency requirements
- Model availability

The service must remain provider-independent.

Potential adapter targets (Phase 4 expansion; MVP requires one configured provider, selection unresolved):

- OpenAI
- Anthropic
- Google Gemini

Additional providers can be added without changing orchestration logic.

---

# LLM Provider Adapter

All provider communication passes through the shared internal AI Provider Gateway, which invokes its private provider adapter. Orchestrator depends on the Gateway interface, not adapter/vendor SDKs. Extraction uses the same platform interface independently.

Responsibilities:

- Request formatting
- Authentication
- Vendor response and usage-field normalization

Gateway owns shared policy, caller authorization, budget/deadline enforcement, bounded transport retry/backoff and normalized safe errors. Adapter transport retries are disabled; Orchestrator owns logical regeneration within the same remaining operation budget. See [ADR-011](../domain/10_AI_PROVIDER_GATEWAY_ADR.md#reliability-cancellation-and-accounting).

Business logic must never depend on provider-specific APIs.

---

# Response Validation

Every AI response is validated before returning it.

Validation includes:

- Output format
- Required structure
- Business rule compliance
- Citation presence (when required)
- Safety checks

Invalid responses may be regenerated according to execution policy.

---

# Response Artifact

Emit PROMPT / RESPONSE using [canonical Artifact v2 contracts](../contracts/artifacts/README.md) and the [typed payload schema](../contracts/artifacts/2.0.0/response.schema.json). Result fields live in payload.data; IDs/correlation/producer/stage/schemaVersion/ArtifactStatus live in the envelope. Registered variants: prompt_stage / prompt / response_stage / response. Every checkpoint has exact operationStatus PENDING/PARTIAL/SUCCEEDED/FAILED/CANCELLED/TIMEOUT where allowed by its schema; terminal commits and approved snapshots are SUCCEEDED only. Final downstream use requires VALID + SUCCEEDED and the appropriate final variant, never a partial/error record or eligibility-only knowledge approval. No service-specific payload/error enum may be invented. Successful final response_validation requires passed validation and nonempty generatedResponse; only then can durable Message linkage commit COMPLETED. Other outcomes remain operational checkpoints and cannot complete a Conversation or count as first value.

---

# Security Requirements

The service must enforce:

- Secure provider credentials
- Request authorization
- Prompt protection
- Response sanitization
- Execution isolation

Prompts and business context cross the external-provider boundary only under the [security provider contract](../SECURITY_THREAT_MODEL.md#upload-quarantine-and-provider-contracts). Do not claim they remain wholly inside the platform.

---

# Observability

Operational metrics include:

- Total Executions
- Success Rate
- Failure Rate
- Retry Count
- Average Latency
- Token Usage
- Estimated Cost
- Model Distribution
- Average Planning Time
- Context Build Duration

Execution telemetry must not contain confidential business information.

---

# Architectural Decisions

## ADR-001

Prompt construction is separated from Context Assembly.

Reason:

Context preparation and prompt formatting evolve independently.

---

## ADR-002

Provider communication is abstracted through Gateway-owned Provider Adapters, with [ADR-011](../domain/10_AI_PROVIDER_GATEWAY_ADR.md) specifying the shared DI-only invocation boundary. This preserves the original vendor abstraction; it does not route extraction through Workspace.

Reason:

Changing LLM vendors must not affect business logic.

---

## ADR-003

Every execution produces an immutable Response Artifact.

Reason:

Execution history must remain traceable and reproducible.

---

## ADR-004

Model selection is policy-driven.

Reason:

Organizations should optimize for cost, latency or quality without changing application code.

---

# MVP Scope

Included:

- Intent handling
- Context request
- Prompt Builder
- Model selection
- One configured provider behind a provider-independent adapter (additional providers Phase 4)
- Provider Adapter
- Response validation
- Response Artifact generation
- Execution telemetry

---

# Deferred Features

Post-MVP:

- Multi-model execution
- Parallel inference
- Parallel/multi-provider streaming orchestration (Phase 4; single-response SSE streaming is MVP)
- Delegated output approval workflows (Phase 2; knowledge approval is MVP in Knowledge Management)
- Automatic response evaluation
- Agent execution
- Workflow execution

---

# Definition of Done

The AI Orchestrator is complete when:

- Requests execute successfully.
- Prompt Artifacts are generated correctly.
- Model selection follows configured policies.
- Responses are validated before delivery.
- Execution metadata is recorded.
- Provider independence is maintained.
- Every execution request produces exactly one traceable AI Execution Job.
- Documentation is synchronized.

Implementation without provider abstraction is considered incomplete.

---

# Related Documents

docs/services/05_CONTEXT_ENGINE.md

docs/services/04_KNOWLEDGE_MANAGEMENT_SERVICE.md

docs/domain/02_ARTIFACT_MODEL.md

[03_ENGINEERING_BIBLE.md](../BIBLE/03_ENGINEERING_BIBLE.md)

---

# Version History

## Version 1.0.0

Initial design baseline; production readiness was not verified. Original specification for the AI Orchestrator.

Defines:

- Execution pipeline
- Prompt Builder
- Provider abstraction
- Model selection
- Response validation
- Response Artifact
- Execution telemetry

---

# Status

Draft — current integrated Architecture/Engineering review pending; historical baseline evidence retained

Version

1.0.0

Effective Date

2026-06-30

---

## Conversation deletion and retention contract

Prompt, Response, error and retry artifacts carry explicit conversationId ownership and same-tenant validation. Recheck tombstone under transaction serialization before committing generation output and before emitting stream content; cancel tasks where possible and discard late output. The purge inventory includes transient buffers, queued attempts, provider-request identifiers and processors under approved retention arrangements. Correlation IDs and source parents never authorize deleting imported knowledge.

Canonical lifecycle: [DATA_LIFECYCLE.md](../DATA_LIFECYCLE.md). Proposed active-system removal within 30 days requires legal and operational approval; backups expire separately. Normal service access cannot bypass deletedAt, retry/exception retention remains inaccessible, and purge completion requires verified inventory cleanup. This specifies planned behavior, not an implemented purge process.

---

## Generation output measurement

[PRODUCT_METRICS.md](../PRODUCT_METRICS.md) separates GenerationRequested/GenerationCompleted from QualifiedFirstValue. Only a completed validated readable output with nonempty approved grounding can qualify after OutputPresented; failures, refusals, first tokens and unapproved context do not. Preserve revision/grounding references and safe diagnostic IDs, without sending business content to telemetry.

---

## Workspace lifecycle ownership

The execution pipeline above is per assistant generation attempt, not a Conversation state machine. [Workspace State Management](../prd/02_AI_WORKSPACE_PRD.md#state-management) is canonical: PREPARING_CONTEXT covers context retrieval/validation; GENERATING covers prompt execution/provider retries and response validation; COMPLETED requires durable final response linkage. FAILED/CANCELLED/TIMEOUT terminate only that Message. Gateway terminal status is transport/structural execution metadata, not an independent Conversation state or permission to bypass the Message commit checks; its payload operationStatus is defined in the canonical v2 contract, pending Architecture/Engineering review. Completing provider execution alone cannot mark a Message COMPLETED before response validation/linkage commits. Conversation persists for later turns. Internal bounded provider retries do not reset a terminal Message; explicit user retry allocates a new attempt. Timeout budgets/cancel API details remain open; see DOCUMENTATION_CHANGELOG.md.

---

## Current backend and authentication boundary

Implementation target: NestJS dependency-injected core module with Prisma/PostgreSQL persistence behind its permitted application boundary, per [ADR-009](../domain/08_BACKEND_AUTH_AND_CONSTRAINTS_ADR.md). The service does not create public login endpoints, issue user tokens, or choose an identity vendor. Receive validated principal/Organization context, enforce tenant ownership for reads/writes and pass deletion/readiness guards where relevant. Provider/API credentials remain server-side configuration and are distinct from user sessions; never persist access/refresh tokens in artifacts or knowledge. SQL list cardinality/NOT NULL guards supplement, rather than replace, approved-field/provenance validation. These are planned contracts, not implemented-provider claims.

---

# END OF DOCUMENT


# Task 10 — Security launch contract

SEC-T01/04/06 require one explicitly reviewed MVP provider and no provider/region/model fallback, minimal tenant-scoped context, server-only credentials, no model-controlled network/tools or knowledge publication, and pre-release output/stream checks. Recheck authorization/deletion on async completion and streaming. Redact provider errors and logs; safely render output and never auto-fetch model-generated links or images.

[SECURITY_THREAT_MODEL.md](../SECURITY_THREAT_MODEL.md) defines mandatory SEC-01–06, threat controls SEC-T01–08 and acceptance scenarios SEC-AT-01–08. These are specified launch gates, not implemented controls or a new approval. Security/Engineering must record enabled-path evidence and resolve provider, parser/limit and operational decisions D-SEC-01/02/03 before release. Optional later defenses cannot replace mandatory isolation, authorization or human approval.


# Task 12 — Lean MVP deployment boundary

Run as a NestJS module calling the shared internal Gateway and its reviewed replaceable provider adapters. Normal assistant generation may dispatch through Gateway from the API role with persisted Message state/SSE; introduce a queue path for measured capacity/backpressure without making a Conversation terminal. Import provider work runs in the shared worker role. Keep attempts bounded/idempotent, no database transaction held over provider I/O and no unreviewed provider fallback.

[ADR-010](../domain/09_LEAN_MVP_ARCHITECTURE_ADR.md) recommends one backend codebase/release with API and worker roles, PostgreSQL-backed jobs, private object storage and isolated parsers. Redis/BullMQ, Qdrant, Go application workers and independent domain microservices are conditional future alternatives. No infrastructure migration or runtime verification is claimed; D-ARCH-01/02 and existing security/policy gates remain pending.


## Task17 — Canonical provider invocation and acceptance

[ADR-011](../domain/10_AI_PROVIDER_GATEWAY_ADR.md) defines exact extraction/generation sequences, responsibility/policy matrix, partial/failure handling, safe error mapping, total retry/cost limits, lease fencing and cancellation/authorization rechecks before publication. [Gateway DTO contracts](../contracts/ai-provider/README.md) defines exact request/response/null/schema rules and AT-17-01–17. Gateway success is neither human approval nor Message completion. Extraction emits only existing KNOWLEDGE_CANDIDATE; Context/Prompt/Response remain their existing producers. v2.0.0 and Prisma are unchanged. Provider execution metadata absent from extraction payloads belongs only in reviewed content-free operational telemetry, never a new ledger.

One reviewed MVP provider is required, none selected here. D-AUD-02 review, D-SEC-02 disclosure/privacy, D-GW-01 numeric policies and actual runtime/tenant/queue integration evidence remain launch dependencies. Standalone fixture tests do not demonstrate deployed controls. No new endpoint, microservice or product capability is introduced.
