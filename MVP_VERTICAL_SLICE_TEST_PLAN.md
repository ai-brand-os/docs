# Minimum vertical slice and real acceptance plan

Version1.0.0 ·2026-10-21 · reviewed docs `08ac353f2752c9b368af8c85afd4ebbcace10bfd`. Proposed runtime test plan; **none of E2E-01–20 was executed in Task24**. [Baseline](IMPLEMENTATION_BASELINE.md), [backlog](MVP_IMPLEMENTATION_BACKLOG.md), [readiness](MVP_READINESS_ASSESSMENT.md). No live provider/customer result or strategic approval.

## Test fixture and constrained scope

Use **one UTF-8 plain-text file** `product.txt`, a supported MVP format, in an isolated synthetic environment. Fictional Organization “Boreal Supply”, Brand “Boreal”, existing complete Product “Boreal Bottle”. Source bytes, including newline convention and SHA256, are frozen in the test fixture and private object store. Example source:

```text
Product: Boreal Bottle
Description: Reusable 750 mL stainless steel bottle.
Price: USD 29 per bottle.
Claim: Keeps drinks cold for 12 hours.
```

No real customer supplied these claims; all are fictional test facts. Store literal USD text, no unsupported currency conversion. Include a separate negative specimen with instruction injection, forged system/approval text, bad UTF8 and oversized content; it must never approve/change authority. Tests use actual retained source bytes and verified half-open spans, not model-invented offsets. Scanner fake may be used **only for known synthetic fixture admission**, explicitly labeled; real-file security acceptance remains blocked until actual scanner/sandbox evidence. Plain-text narrowing does not remove URL/PDF/DOCX/Markdown from full MVP WP13A.

Create two independent synthetic Owners/Organizations/Brands through trusted test setup (no public multi-org entitlement), then exercise **real login/guards/session storage**. Signup is not claimed tested/resolved by a seeded Owner. Manually initialize approved Organization fields, Brand mission,2–4 manual tones, complete Audience and a complete existing Product with explicit manual value proposition and prior price “USD 35 per bottle.” Profile uses stated historical size1–5 and language value; no CompanySize2/multilingual feature. Readiness must actually satisfy mandatory fields; do not bypass it with completeness70.

Using a complete existing Product is deliberate: per-field imported facts for a **new** Product may not satisfy required relational Product.name/description/valueProposition. The pipeline must not insert fabricated placeholders or approve adjacent undecided values to satisfy Prisma. The full-MVP partial-entity projection policy is an explicit D-KQ-03/D-API-03/D-REV-01 integration gate (see baseline finding I24-02). This test isolates an update, not a claim that new-offer partial approval is already solved. Actual existing entity matching/ref identity is revalidated by KM; the model cannot pick another tenant's Product ID.

## Exact application flow

1. Seed fixture credentials safely, authenticate through actual login, resolve session/current sole Owner→Organization→Brand; reject other tenant.
2. Create/load manual Brand Brain through existing routes/KM; record approved revisionR1 and source-free MANUAL provenance, complete offer/Audience/tone.
3. Submit product.txt with stable Idempotency-Key through existing import route; retain exact bytes/Document/intake/correlation and durable dispatch, no invented input authority.
4. Real worker loads quarantined authorized bytes after scan gate; bounded UTF8 processing emits exact2.0 records and2.2 representation manifest with genuine maps.
5. Extraction invokes Gateway deterministic adapter first; emit typed product changes and support refs. KM validates source/field/identity/binding, compares prior approved price35 with proposed29, freezes eligible set.
6. Existing candidates GET shows pending values, real evidence and honest unknown confidence. Owner explicitly confirms/edits/rejects each. Candidate confirmation creates approved revisionR2..Rn atomically, last verified decision permits durable closure. Stale expected head returns409; retry identical key replays actual prior result before checking advanced head.
7. Confirm Brand current head/complete mandatory facts; show copied approved Brief reflecting final approved price29. Pending/rejected/injected facts do not appear in Brief/context/score.
8. Create Conversation with keyed identity; accept a marketing-copy request through existing POST. Allocate one USER and assistant, ordered slots, approved revision/policy/frozen prior catalog in same transaction.
9. Context loads relevant approved facts from this exact pin and bounded recent history, not raw documents/pending candidates. Explicit relationships/scoring formulas remain disabled; no fresh claim-check UI introduced.
10. Orchestrator invokes Gateway1 with reviewed template/policy. Test mode returns deterministic declared output, e.g. “Meet Boreal Bottle: a reusable750mL stainless steel bottle, USD29 per bottle.” Source tokens/wording may be formatted; each material claim must match the approved answer key.
11. Validate bounded final shape/revision/grounding checks; persist actual final RESPONSE+Message content/COMPLETED together. Gateway1 returns terminal result, not an undocumented provider token stream. Emit accepted then validated buffered derived chunks and completed under reviewed SSE timing policy/live access checks; chunk presentation remains provisional until final event/read. No raw unvalidated provider-token bypass.
12. Browser displays durable completed response, allows copy/basic feedback; safe disconnect recovery GET uses operation/key selector and never blind POST. Parent Conversation remains active.
13. Repeat an explicitly permitted terminal failure/timeout retry with original USER/catalog/pin, new assistant/correlation. Test after-delete/revocation denial and shared-knowledge survival. No regeneration or new cancel/reconnect endpoint.
14. Verify provenance by existing Brand Brain/source projection and private retained audit chain under test authority. Do not add deliverable-source/Context Inspector UI pending D-GTM-02.
15. Run real approved-provider profile separately only after credentials, actual provider/model/privacy/tokenizer/budgets and operation settings are reviewed. Deterministic output proves orchestration behavior, never live quality/latency/cost superiority.

## Required test environments and result rules

| Class/profile | Required infrastructure | What passing proves / excludes |
| --- | --- | --- |
|Unit|Actual app functions/typed parsers/policy boundaries, no network|Pure calculation/guard logic; not auth provider, DB or stream integration|
|Contract|Pinned docs schemas/fixtures and consuming application adapters|Wire shape/version/enums; not cross-row permission/transaction success|
|Database integration|Real disposable PostgreSQL, actual app migrations/supplements, concurrent connections|FK/lock/idempotency/head/rollback semantics; not UI/provider correctness|
|Deterministic integration|Real NestJS HTTP+worker+PG/private objects, real auth, deterministic Gateway; test scanner explicitly constrained|Application pipeline/queue/auth/ref/real network SSE with synthetic provider; not real scanning/model behavior|
|Frontend|Actual Next.js browser via chosen app test runner, real fixture backend for connected cases|Rendering/state/fetch/recovery/keyboard/copy; not just reference state model|
|Provider integration|Exactly approved provider/model, live credentials, permitted synthetic inputs, real tokenizer/template/caps|Actual invocation/usage/failure behavior for identified model/date; no customer effectiveness claim|
|Real end-to-end|Browser→API→worker/objects→review→PG→Context→Gateway approved live provider→persist/SSE/browser|Actual complete selected workflow; all intended components must be real or named stub scope excludes full live PASS|
|Security|Actual guards/worker/ref/fetch/parser/objects/session + adversarial fixtures, network visibility|Specific tested cross-tenant/injection/SSRF/revocation/deletion protections; no certification or universal guarantee|

Harness implemented by WP12: propose scripts `test:e2e:vertical-slice` and `test:e2e:vertical-slice:live` in actual app only after inspecting existing commands. They **do not exist as asserted runnable commands here**. Required runner behavior: start isolated services/migrations, seed two tenants, freeze fixture hashes/config/model, drive real endpoints/browser, inject disconnect/worker kill, assert DB/object consequences, produce per-case JSON with PASS/FAIL/BLOCKED/SKIPPED+reason+app/docs SHA/environment, clean up/stop resources. Live job must fail/mark blocked on missing authorization/config, never silently swap fake adapter and report PASS. CI ordinary synthetic profile has outbound-provider egress disabled and must verify that.

## E2E case matrix — all currently NOT RUN against application

| ID / objective | Setup/action and exact expected assertion | Intended environment / packages |
| --- | --- | --- |
|E2E-01 Owner login/tenant|Seed Owner, real login obtains access+refresh; access verifies AuthSession; invalid/revoked fails401; actual tenant/member checks applied|Real HTTP+PG/auth + browser session; WP03B. Signup oracle separate blocking acceptance|
|E2E-02 manual initialization|Save manual Organization/Brand/Voice/Audience/complete Product; MANUAL approvals/history and actual readiness; no source Document/job created|HTTP+PG+KM/UI; WP04/10A|
|E2E-03 supported import|Submit exact TXT bytes, verify hash/Document/correlation/admission/scan gate and durable worker processing|HTTP+PG+queue/private objects/parser; WP06/07A. Full scanner profile separate|
|E2E-04 source evidence|Real parser bytes→manifest/map→candidate binding resolves exact supporting quote/span/digest; altered quote/source/tenant rejects|Actual parser/object/ref DB integration; WP07A/B|
|E2E-05 human approval|Pending price29 cannot affect approved price35; authorized explicit decision changes only selected field; reject leaves prior state|HTTP+PG+KM/browser; WP08/10A|
|E2E-06 immutable publication|Commit creates new snapshot+revision/score/projections/head; old snapshot unchanged; crash before commit leaves no partial head|Concurrent real PG/application transaction; WP04/08|
|E2E-07 duplicate import|Same scope/key/body/file replays same correlation and no second work effect; changed bytes409; new key active-policy409 if selected|HTTP+PG+worker; WP06; Founder admission policy prerequisite|
|E2E-08 stale revision|Two requests expectedR1: exactly one wins, second409; old approved values not silently overwritten|Real concurrent HTTP/PG; WP04/08|
|E2E-09 publication replay|Lost approval acknowledgement retried identical key after head advanced returns original revision/result; one decision/effect, changed body409|Actual transaction+HTTP; WP08|
|E2E-10 approved context only|Inject pending high-score/untrusted document/other-tenant facts; context and actual provider input contain only approved eligible pin + untrusted bounded conversation data|Application+Gateway spy + ref DB; WP09A. Spy is permitted synthetic profile, live capture restricted|
|E2E-11 pin/order|Accept generation atRn; publishRn+1 during wait, final prompt/response stillRn; concurrent turn/late completion cannot change frozen catalog; invalidated pin blocks|HTTP+PG+delayed adapter+actual context; WP09A/B|
|E2E-12 timeout/retry|Controlled timeout creates durable TIMEOUT not COMPLETED; late callback fenced; explicit allowed retry new assistant/correlation but same USER/catalog/revision; retry budget bounded|Synthetic controllable adapter first; real provider deadline/usage test separately WP12B|
|E2E-13 SSE/disconnect|Real POST/fetch frames ordered accepted/chunks/final; kill socket before accepted receipt delivery and during chunks; generation persists; GET selectors recover pending/final/status, no Last-Event-ID assumption|Real HTTP/proxy+browser+PG; WP09B/10B. Not offline parser fixture only|
|E2E-14 no duplicate USER|Concurrent same-key POST, refresh/retry/lost final ack cannot allocate second USER; active/old-turn retry rejected as selected policy requires|Concurrent HTTP+PG+browser; WP09/10B|
|E2E-15 tenant denial|Other seeded Owner probes nested Product/revision/candidate/Conversation/Message/key/cursor/object ref; same non-disclosing404, no result replay or data mutation|Actual HTTP/ref repositories/worker/private object adapter; WP03B/06–11|
|E2E-16 Conversation delete|DELETE204 after tombstone+unique purge; list/detail/recovery/feedback/stream/late generation deny; physical purge verified separately, shared Brain/source survives|Real HTTP/PG/worker/objects/browser; WP11; backup replay in Ops test profile|
|E2E-17 unavailable evidence|Digest mismatch/forged location/unsupported required source rejects approval; lawful retained-history source unavailability labeled honestly; no new precise quote invented|Actual parser/ref/storage lifecycle+HTTP; WP07/08/11|
|E2E-18 worker crash|Kill after admission/before dispatch, after provider return/before publication, after last decision/before closure ack; restart/lease reclaim yields safe existing effect or reconciliation, never double publication|Actual processes/PG/queue+controlled adapter; WP06/08/11/12A|
|E2E-19 no approval bypass|Model/source/client forges approvedBy/approvedAt/head/status/high score; server rejects/keeps pending; imported tone/manual-only/competitor restriction enforced|Actual controller+KM+provider injection fixture/security tests; WP07/08|
|E2E-20 grounded marketing output|Browser gets nonempty persisted response pinned to approved29 price/product facts, no rejected/injected/old35 claim; copies complete output and submits one basic vote. Independent answer-key reviewer records actual claims|Deterministic profile proves workflow; live profile requires approved real provider and independent review. No model-accuracy claim from fake output|

Mandatory full-MVP extensions include new partial-entity review/persistence policy, all supported sources, manual ongoing edits/history/restore, partial Brief/feedback, signup non-enumeration, collection paging, restore/deletion/source races, full scanner/SSRF corpus, real browser accessibility and operational backup replay. First-slice PASS does not certify full scope.

## Small product-value benchmark — future experiment, no results

Use five fictional product packets × two tasks (initial draft and price/claim update) × two arms =20 outputs as an initial **proposed engineering benchmark**, not five customers or statistical efficacy. Freeze identical source information, manual corrections/fact sheet, brand voice, task/length constraints and update timing. ArmA normal competent project/context setup with a comparable model, ArmB Brand OS reviewed pipeline. Do not use empty chat as weak control or give only Brand OS correct facts. Record exact model/plan/version/settings/date; if hosted project and API cannot match, label whole-product comparison. Availability/privacy approval needed before real model benchmark; deterministic adapter cannot establish comparative quality.

Randomize neutral A/B output labels/order; blind factual/editor raters where possible, with matched plain-format review packet and source evidence. Operators know UI; record blinding failures. Compare per-packet paired outcomes, no cherry-picked regenerations; cap attempts/tasks prospectively, include failures/timeouts/missing evidence. Preregister thresholds under D-VAL-02/D-GTM-03 before collecting claimed benefit results. No new source-panel UI is necessary to measure traceability in a private research packet.

| Measure | Exact observation / denominator | Proposed hypothesis, not approved or measured |
| --- | --- | --- |
|Supported claims|Correct evidence-supported material claims / adjudicable claims; report required-fact coverage|No worse required coverage; improvement remains to measure|
|Unsupported claims|Unsupported/unverifiable material claims / all material claims; outdated-price/forbidden claim counts separate|Zero seeded critical old-price/forbidden claims as test gate, not guarantee for all outputs|
|Editing time|Active editor seconds to same answer-key acceptance, plus setup/review/support time separately|Existing proposed20% median paired improvement remains D-GTM-03 hypothesis, not this review's new approval|
|Brand consistency|Fixed approved voice/fact rubric and conflicting values per repeated opportunity|Non-regression; adjudicators/rubric fixed before outputs|
|Source traceability|Fraction material approved assertions resolvable through retained approved revision→value/source binding; missing/deleted categories disclosed|100% of fixture imported approved fields must resolve when retained, no claimed automatic semantic truth|
|Onboarding effort|Active manual/setup/review minutes plus wall time; do not infer presentation qualification without actual telemetry|TTFV median≤10/p90≤15minutes existing goals only; no result from completed model call|
|Latency|Server acceptance→durable final→browser final receipt, plus import queue/process/review separately|Record p50/p90 observed sample counts when run; no invented SLA|
|Processing cost|Actual extraction+generation provider usage, failed/ambiguous attempts, queue/storage/egress and support allocation|No synthetic fake-token bill or fabricated contribution margin; include initial and repeat-task cost|

Manual fact-sheet agreement is not verified real-world truth; answer key/adjudicator qualifications/unknowns remain visible. Customer validation later: approved20–30 behavior interviews, proposed ten paying businesses/exact price experiment, actual repeated tasks/first renewal/mature retention/contribution margin with consent and costs. D-VAL/GTM/COMP and price$19–59 hypotheses retain Founder/Product ownership. No outreach/payment/customer data or benchmark provider invocation is authorized by this document.
