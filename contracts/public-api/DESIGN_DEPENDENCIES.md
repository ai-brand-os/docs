# Missing design dependencies

2026-10-21, D-API-04. Repository Component Kit documents only the Organization label/switcher/divider. No accessible external artifact version/location is supplied. Token *names* are historical references; values, contrast and component-wide conformance cannot be verified. Do not fabricate Figma URLs, colors, typography or approval. Phase2 switcher behavior stays future.

| Artifact | Required behavior | Owner | Availability | Workflow | Proposed fallback | Approval |
| --- | --- | --- | --- | --- | --- | --- |
| Design Foundations | Resolve --pulse/--surface/--border values, typography, spacing, focus/contrast | Design | External, location/version unavailable | All | Semantic HTML + existing app styles only after app review; no new invented tokens | Pending Design/Frontend |
| Full Component Kit | Button/input/modal/skeleton/status/error variants and responsive composition | Design + Frontend | External, unavailable | All | Native accessible controls and behavior matrix for prototype; production visual review blocked | Pending |
| Error Ember token | Error color/contrast and non-color text/icon states | Design | Historical fix referenced, no values supplied | Forms/errors | Visible text labels/aria errors, no guessed Ember hex | Pending |
| Sidebar/shell | Static Organization identity, brand navigation, mobile/focus behavior | Design + Product | Static label/divider specified locally, full layouts missing | Workspace/onboarding | Preserve one-org static label; do not render Phase2 dropdown | Pending visual review |
| Import placement/review | Embedded versus separate placement and safe source/score warnings | Product + Founder/Design | D-IMP-03 pending; no approved mockup | Import | Existing Brand Brain location only if reviewed; no mandatory new screen | Pending Founder/Product |
| Stream/recovery/approval conflict | Incomplete text, retry limits, head diff, accessibility | Frontend + Design/Product | Proposed state matrix only | Workspace/Brand | Existing view status text/inline controls; no Context Inspector or new technical screen | Pending D-API-01/04/06 |

Keyboard/focus/error/loading/screen-reader behavior is in [frontend states](FRONTEND_STATES.md). Layout uses existing shell assumptions (Header, Sidebar, Conversation area, prompt input) without asserting breakpoints/pixel sizes. No additional design dependencies are treated as delivered by offline tests. Screenshot, screen-reader, keyboard, contrast and mobile QA must reference actual application/design versions later.
