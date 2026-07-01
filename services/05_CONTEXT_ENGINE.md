# Service Specification — Context Engine

Document

05_CONTEXT_ENGINE.md

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

The Context Engine assembles the optimal business context for AI execution.

It retrieves, ranks, enriches and compresses organizational knowledge into a structured Prompt Context Artifact.

The service never generates prompts or AI responses.

---

# Mission

Deliver the smallest, highest-quality context that maximizes AI response quality.

---

# Responsibilities

The Context Engine is responsible for:

- Intent analysis
- Retrieval planning
- Knowledge retrieval
- Context ranking
- Business rule injection
- Brand voice injection
- Organization memory selection
- Context compression
- Context scoring
- Prompt Context Artifact generation
- Creating a Context Assembly Job

---

# Non-Responsibilities

The service must never:

- Generate prompts
- Select AI providers
- Call LLM APIs
- Produce AI responses
- Validate business knowledge
- Persist knowledge

---

# Input

Accepted inputs:

- User Request
- Approved Knowledge Artifacts
- Organization Memory
- Business Rules
- Conversation Context (Future)

---

# Output

Prompt Context Artifact

Containing:

- Relevant Knowledge
- Supporting Evidence
- Business Rules
- Brand Voice
- Memory
- Retrieval Metadata
- Context Score
- Context Assembly Status

The artifact is optimized for downstream prompt generation.

---

# Core Principle

Retrieval finds information.

Context Assembly prepares intelligence.

These are different responsibilities.

---

# Context Assembly Pipeline

```
User Request
        │
        ▼
Intent Analyzer
        │
        ▼
Retrieval Planner
        │
        ▼
Knowledge Retrieval
        │
        ▼
Context Ranking
        │
        ▼
Business Rule Injection
        │
        ▼
Brand Voice Injection
        │
        ▼
Memory Selection
        │
        ▼
Context Compression
        │
        ▼
Prompt Context Artifact
```

---

# Design Principles

Quality over quantity.

Only relevant knowledge should enter the context.

---

Composable.

Every stage operates independently.

---

Deterministic where possible.

Ranking should rely on deterministic scoring before AI reasoning.

---

Provider Independent.

The Context Engine must remain independent from any LLM vendor.

---

Explainable.

Every context element must preserve provenance.

---

# Success Criteria

The Context Engine succeeds when:

- Retrieved context is relevant.
- Context size is minimized.
- Business rules are preserved.
- Brand voice remains consistent.
- Provenance is maintained.
- Prompt Context Artifacts are reusable.
- Every request produces exactly one Prompt Context Artifact.

---

Status

Draft

---

# Context Assembly Pipeline

Every request follows the same context assembly pipeline.

```
User Request
        │
        ▼
Intent Analyzer
        │
        ▼
Retrieval Planner
        │
        ▼
Knowledge Retrieval
        │
        ▼
Context Ranking
        │
        ▼
Business Rule Injection
        │
        ▼
Brand Voice Injection
        │
        ▼
Memory Selection
        │
        ▼
Context Compression
        │
        ▼
Context Validation
        │
        ▼
Prompt Context Artifact
```

Each stage produces a new immutable Context Artifact.

---

# Stage 1 — Intent Analyzer

Purpose

Understand the objective of the user request.

Outputs

- Intent
- Required knowledge domains
- Required business entities
- Required memory types
- Retrieval strategy

Intent analysis should be deterministic whenever possible.

---

# Stage 2 — Retrieval Planner

Purpose

Create an optimized retrieval plan.

Planner decisions include:

- Which indexes to search
- Retrieval depth
- Graph traversal
- Semantic search
- Hybrid search
- Metadata filters

The planner optimizes quality before speed.

---

# Stage 3 — Knowledge Retrieval

Purpose

Retrieve candidate knowledge.

Possible retrieval strategies

- Vector Search
- Knowledge Graph Traversal
- Keyword Search
- Metadata Filtering
- Hybrid Retrieval

The service may combine multiple retrieval methods.

---

# Stage 4 — Context Ranking

Purpose

Rank retrieved knowledge by usefulness.

Ranking signals include:

- Semantic similarity
- Knowledge Confidence
- Source Trust Score
- Freshness
- Business priority
- Entity importance
- User intent alignment

Ranking should minimize irrelevant context.

---

# Stage 5 — Business Rule Injection

Purpose

Inject mandatory organizational rules.

Examples

- Compliance policies
- Writing restrictions
- Legal requirements
- Product limitations
- Organization guidelines

Business rules always override retrieved knowledge when conflicts occur.

---

# Stage 6 — Brand Voice Injection

Purpose

Inject organization-specific communication style.

Examples

- Tone
- Personality
- Vocabulary
- Writing conventions
- Messaging principles

Brand Voice is retrieved from the Knowledge Domain.

---

# Stage 7 — Memory Selection

Purpose

Select additional contextual memory.

Memory Types

Knowledge Memory

Approved organizational knowledge.

Working Memory

Temporary execution state for the current request.

Conversation Memory

Multi-turn conversational history.

Organizational Memory

Reusable organizational preferences and reusable assets.

The MVP includes:

- Knowledge Memory
- Working Memory

---

# Stage 8 — Context Compression

Purpose

Reduce context size without losing important information.

Compression strategies

- Remove redundancy
- Merge similar facts
- Summarize low-priority knowledge
- Preserve critical evidence
- Preserve provenance

Compression must never change business meaning.

---

# Stage 9 — Context Validation

Purpose

Validate the final Prompt Context Artifact.

Validation includes

- Required business rules
- Required brand voice
- Required provenance
- Context size limits
- Duplicate removal
- Missing mandatory entities

Invalid contexts must never be sent downstream.

---

# Prompt Context Artifact

Contains

- Selected Knowledge
- Business Rules
- Brand Voice
- Memory
- Evidence
- Provenance
- Retrieval Metadata
- Context Score
- Assembly Version

Prompt Context Artifacts are immutable.

---

# Context Quality Score

Every generated context receives a quality score.

Signals include:

- Coverage
- Relevance
- Confidence
- Diversity
- Freshness
- Compression Quality

The score is used for monitoring and future optimization.

---

# Processing Guarantees

The Context Engine guarantees:

- Explainable context assembly
- Full provenance
- Provider independence
- Deterministic execution where possible
- Minimal redundant context
- Immutable Prompt Context Artifacts
- Idempotent context assembly

---

Status

Draft

---

# Service Interfaces

The Context Engine exposes application interfaces for context assembly.

Primary operations:

- Build Context
- Get Context Assembly Job Status
- Rebuild Context

The service never exposes internal retrieval or ranking stages.

---

# Upstream Dependencies

The service accepts requests only from:

- AI Orchestrator

Future:

- Workflow Engine
- Agent Runtime

Direct user access is prohibited.

---

# Downstream Integrations

The Context Engine produces Prompt Context Artifacts for:

- AI Orchestrator

The service must never communicate directly with:

- LLM Providers
- Prompt Templates
- User Interfaces

---

# Retrieval Strategy

The retrieval strategy is configurable.

Supported strategies:

- Vector Retrieval
- Knowledge Graph Retrieval
- Keyword Retrieval
- Metadata Filtering
- Hybrid Retrieval

The Retrieval Planner selects one or more strategies for every request.

---

# Context Profiles

The Context Engine supports configurable Context Profiles.

Examples:

- Marketing
- Customer Support
- Sales
- Product
- Executive

Each profile defines:

- Retrieval priorities
- Preferred knowledge domains
- Business rules
- Brand Voice configuration
- Memory selection policy

MVP:

Context Profiles are configurable but optional.

---

# Context Budget

Every Prompt Context Artifact must respect a configurable context budget.

The budget includes:

- Maximum tokens
- Maximum knowledge artifacts
- Maximum memory artifacts
- Maximum business rules
- Maximum evidence references

Context Compression is responsible for enforcing these limits.

---

# Artifact Contract

Every Prompt Context Artifact contains:

- Artifact ID
- Assembly Version
- Retrieval Strategy
- Context Profile
- Selected Knowledge
- Business Rules
- Brand Voice
- Memory
- Evidence
- Provenance
- Context Score
- Timestamp

Artifacts are immutable.

---

# Security Requirements

The service must enforce:

- Authorization
- Provenance integrity
- Retrieval isolation
- Secure memory access
- Context size enforcement

Sensitive organizational knowledge must never leak across organizations.

---

# Observability

Operational metrics include:

- Retrieval latency
- Ranking latency
- Compression latency
- Context size
- Context Quality Score
- Context Assembly Success Rate
- Average Context Build Time
- Retrieval source distribution
- Cache hit ratio (Future)

Telemetry must never expose confidential organizational content.

---

# Architectural Decisions

## ADR-001

Context Assembly is separated from Prompt Generation.

Reason:

Context quality and prompt quality evolve independently.

---

## ADR-002

Retrieval is only one stage of Context Assembly.

Reason:

High-quality AI responses require more than document retrieval.

---

## ADR-003

Memory is modeled as multiple independent memory types.

Reason:

Different memory categories have different lifecycles and retrieval strategies.

---

## ADR-004

Context Profiles are configuration-driven.

Reason:

Organizations should customize context behavior without changing service logic.

---

# MVP Scope

Included:

- Intent Analysis
- Retrieval Planning
- Hybrid Retrieval
- Context Ranking
- Business Rule Injection
- Brand Voice Injection
- Knowledge Memory
- Working Memory
- Context Compression
- Context Validation
- Prompt Context Artifact generation

---

# Deferred Features

Post-MVP:

- Conversation Memory
- Organizational Memory
- Adaptive Context Profiles
- Predictive Retrieval
- Cache-aware Retrieval
- Personalized Context Assembly
- Multi-agent Context Sharing

---

# Definition of Done

The Context Engine is complete when:

- Prompt Context Artifacts are generated successfully.
- Context quality is measurable.
- Business Rules are injected correctly.
- Brand Voice remains consistent.
- Context size respects configured budgets.
- Provenance is preserved.
- Retrieval strategies are configurable.
- Every context assembly request produces exactly one traceable Context Assembly Job.
- Documentation is synchronized.

Implementation without explainable context assembly is considered incomplete.

---

# Related Documents

docs/services/04_KNOWLEDGE_MANAGEMENT_SERVICE.md

docs/services/06_AI_ORCHESTRATOR.md

docs/domain/02_ARTIFACT_MODEL.md

docs/domain/03_BUSINESS_ONTOLOGY.md

03_ENGINEERING_BIBLE.md

---

# Version History

## Version 1.0.0

Initial production-ready specification for the Context Engine.

Defines:

- Context Assembly pipeline
- Retrieval strategies
- Memory model
- Context Profiles
- Artifact contract
- Context Quality Score
- Architectural decisions

---

# Status

Approved for Architecture & Engineering Design

Version

1.0.0

Effective Date

2026-06-30

---

# END OF DOCUMENT
