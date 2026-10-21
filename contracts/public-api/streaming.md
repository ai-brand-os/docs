# Single-response SSE and post-disconnect recovery

Proposed D-API-01/03/06 with D-HIST-01–04/D-REV-02, not enabled streaming/replay. Existing POST `/api/v1/conversations/{id}/messages` only. No public reconnect/cancel/regeneration route, Last-Event-ID promise or durable event log. [Event shapes](1.0.0/schemas.json) define accepted/chunk/completed/failed; [tests](../../validation/public_api.test.cjs) are offline parsing/state models.

## Request and acceptance

Authenticated fetch POST (native EventSource cannot send the required body/Authorization). Headers Authorization:Bearer, Content-Type:application/json, Accept:text/event-stream, Idempotency-Key; cookie credentials are not business auth and no cookie-CSRF alternate accepted. CORS as [transport](transport.md). Body `{content}`; proposed optional retry variant `{content,retryOfOperationId}` only after D-API-06/D-HIST-03 approval; original exact content retained, terminal latest USER/attempt and original catalog/revision required. No regeneration property or fallback permission from client.

Before SSE headers: auth/scope/deletion/readiness, DTO/input and configured budget preflight, idempotency/reference/policy checks, atomic acceptance USER+assistant+Artifact2.5 receipt+pin/catalog. Rejection is normal HTTP4xx/5xx JSON Error; create no partial accepted turn. Once acceptance commits it survives connection failure even if headers/accepted event are lost. Server200 Content-Type:text/event-stream;charset=utf-8, Cache-Control:no-store,no-transform; disable proxy buffering/compression that prevents timely frames, expose request ID, transport timeouts reviewed independently of provider deadline. No response status switch after headers.

## Wire framing and invariants

Each UTF8 frame exactly `event: <name>\ndata: <single-line JSON>\n\n`; LF emission, CRLF accepted by parser. JSON contains the same event discriminator. No id/retry fields (no replay semantics), no multiline raw data or `[DONE]` alias. Escaped newlines live inside JSON string. Parser supports chunked UTF8/partial frames across arbitrary network byte boundaries, caps buffered bytes/frames and rejects malformed JSON/unknown event/duplicate data/type mismatch as transport protocol error; it does not mark durable generation FAILED. CRLF normalization must not corrupt JSON escaped characters. Empty EOF buffer after terminal event is normal; EOF with incomplete frame or no terminal is disconnected/recovering. Heartbeat, if needed for reviewed intermediary idle timeout, is comment `: keepalive\n\n` only, no state/IDs; interval is D-API-01/Operations, no unreviewed deadline/default. Flush accepted promptly after commit; proxy-only synthetic stream tests are still required.

1. `accepted`: operationId,userMessageId,assistantMessageId,correlationId,approvedRevisionId,status=QUEUED. Exactly first data event; may report acceptance while durable state has advanced. Client records accepted identifiers/key. It cannot infer generation success.
2. `chunk`: same operation/assistant, index0..N−1 consecutive, text nonempty. contextLimitation=NONE/HISTORY_LIMITED/CURRENT_REQUEST_ONLY is the reviewed safe history-availability disposition, fixed for this selection. Show any limitation notice with the first chunk (or completed event when no chunks); it exposes no retrieved facts/prompt. CURRENT_REQUEST_ONLY requires D-HIST-02 policy permission, never generic ungrounded chat. Append inert text in a provisional response region; sanitize markdown/no remote resources or HTML execution. Duplicate exact index/text may be ignored in UI, conflicting duplicate/out-of-order/gap causes recovering; never reorder guessed tokens.
3. `completed`: same IDs,status=COMPLETED, finalChunkCount, authoritative full content and the same contextLimitation. Only emitted after validated nonempty final RESPONSE linkage+Message COMPLETED+content commits atomically with live gates. Matches full concatenated chunks for a live stream; replay from terminal receipt has zero chunks, count0 and full durable content. Client replaces provisional buffer once, marks completed and allows copy/feedback. Identical duplicate final event ignored; divergent duplicate is protocol failure/re-read. Do not make parent Conversation terminal.
4. `failed`: same IDs,status=FAILED/TIMEOUT/CANCELLED with matching safe code and retryAvailable. Only after durable corresponding terminal transition; provisional text discarded as completed answer and labeled incomplete. No raw provider error. Closes stream; no completed later. CANCELLED is a server terminal outcome, no client cancel feature. Timeout does not close Conversation.

After acceptance, failures before durable terminal commit (e.g. DB unavailable/revocation) cannot honestly emit a persisted failed status. Close transport and recover later; operational coordinator reconciles abandoned attempts under reviewed deadlines/fencing. Before each event emission recheck live auth/tombstone. If denied/deleted: stop further content, terminate stream, clear server buffers, best-effort stop provider. No late content-bearing terminal event after deletion; frontend immediately clears its scoped view when deletion is known. Already delivered bytes cannot be recalled. In-flight loss does not cancel durable operation and no synthetic FAILED/CANCELLED is persisted merely for a disconnected socket. Internal provider retry remains bounded same accepted attempt.

## Recovery without another generation

Client stores current key/IDs in scoped in-memory application state; optional same-session tab refresh recovery stores only opaque pending key/Conversation IDs in sessionStorage after privacy review, **never JWT/content**. Without approved browser persistence, page refresh uses current Conversation history; unknown operation association is displayed as unresolved, no guessed retry. Browser-tab closure doesn't prove cancel; server continues or reaches its own configured outcome. Never blindly retry POST after network error/401, including generic HTTP-client retry middleware.

Reauthenticate if necessary, GET existing Conversation (optionally operationId; if accepted event absent use X-Accepted-Request-Key). Reauthorize first. recoveredAttempt gives current validated durable Message projection, independent of message-page position.401 clears local credentials/data;404 clears scoped cache and says unavailable without distinguishing deletion/foreign IDs;503/transport failure waits/backoff bounded by reviewed polling policy, not a new generation. Pending DRAFT/SUBMITTING/QUEUED/PREPARING_CONTEXT/GENERATING → waiting/recovering, content=null, no copy/feedback/Retry button. COMPLETED → replace provisional text with durable final exactly once. FAILED/CANCELLED/TIMEOUT → show safe terminal explanation; explicit terminal retry only if retryAvailable and policy approved. It creates a new assistant/correlation/operation with original USER/catalog/revision, not another USER; latest-turn/active-sibling rules enforced server-side. Regeneration disabled pending D-HIST-03/D-REV-02, not conflated with retry.

If receipt GET404 but Conversation still visible, acceptance may be unknown/in-flight or receipt unavailable. Display unresolved, poll boundedly under reviewed policy or support recovery; **do not conclude no acceptance and automatically resend with a new key**. Event received but persistence read still pending due to replica lag must not downgrade completed proof; read recovery uses authoritative consistency, not eventual replica as terminal evidence. Expired unavailable receipt requires explicit safe operational reconciliation before offering retry. Mobile disconnect/refresh/lost final acknowledgement follow same path. First-value presentation acknowledgement requires the separate reviewed telemetry transport; receiving completed alone is not activation.

```mermaid
sequenceDiagram
    participant UI
    participant API as Workspace controller
    participant DB
    participant Worker
    UI->>API: POST content + same logical key
    API->>DB: Authorized atomic USER/assistant/receipt/pin
    DB-->>API: Commit acceptance
    API-->>UI: accepted SSE
    API->>Worker: Accepted operation
    Worker-->>UI: Provisional chunks through live checks
    Note over UI,API: Transport lost; no cancel or new POST
    Worker->>DB: Validated final + COMPLETED atomically
    UI->>API: GET Conversation + operation/key selector
    API->>DB: Reauthorize, tombstone, receipt + current attempt
    API-->>UI: Durable completed content or pending/terminal/null
```
