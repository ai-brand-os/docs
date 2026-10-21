# Public API and frontend contracts

2026-10-21. **Specified — Pending Product/Architecture/Frontend/Security Review (D-AUD-08)**. This is a proposed first public contract, not a released API or implementation report. [ADR-017](../../domain/16_API_AND_FRONTEND_INTEGRATION_ADR.md) records scope, audit findings, dependencies and review owners.

- [OpenAPI 3.1](1.0.0/openapi.json), [closed JSON Schema DTOs](1.0.0/schemas.json), [route manifest](1.0.0/routes.json).
- [Endpoint coverage matrix](ENDPOINT_MATRIX.md): 46 operations, 38 core and eight provenance operations already incorporated by reference in the API baseline. The latter remain gated; route presence does not create approval.
- [Transport/auth/mutations](transport.md), [error registry](1.0.0/error-registry.json), [pagination](pagination.md), [SSE/recovery](streaming.md).
- [Frontend transitions](FRONTEND_STATES.md), [design dependency register](DESIGN_DEPENDENCIES.md), [telemetry](TELEMETRY.md) and [typed events](1.0.0/telemetry.schema.json).
- [Compatibility and migration](COMPATIBILITY.md), [fixtures](1.0.0/examples/valid.json), [negative fixtures](1.0.0/examples/invalid.json), [executable tests](../../validation/public_api.test.cjs), [actual results](../../validation/TASK23_RESULTS.md).

JSON Schema is normative for structure, required/optional/null and vocabulary. The linked prose is normative for authorization, cross-field/reference invariants, transaction identity, policy gates and UX; validation of JSON alone cannot establish these. Public DTOs project retained authorized records, never a new knowledge, status or Artifact authority. No new public endpoint, provider, separately deployed service, paid analytics dependency or seven-feature MVP expansion.

Reproduce with `ARTIFACT_VALIDATOR_PACKAGE_ROOT=../backend/node_modules/ajv-formats node validation/public_api.test.cjs` or install the pinned validation/package.json dev dependencies and run `npm --prefix validation run test:public-api`. No remote schema fetching. Historical versions stay immutable; proposed 1.0.0 is reviewable, not an approval to enable writers.
