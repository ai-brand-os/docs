# Component Kit — AI Brand OS

Document

01_COMPONENT_KIT.md

Version

1.0.0

Status

Draft

Owner

Design

Priority

P1

Last Updated: 2026-07-15

---

# Purpose

This document is the repo-side, written specification of the Component Kit.

The Component Kit itself originated as a design artifact outside this repository. This document does not restate it in full. It records only those components whose behavior is a documented product decision — the kind of decision that must survive independently of any design tool, because engineering implements against it and other documents reference it.

Components are added here as their behavior is decided, not preemptively.

---

# Design Tokens

This document introduces no new tokens. It composes existing Design Foundations tokens only.

Referenced here:

| Token       | Use in this document                              |
| ----------- | ------------------------------------------------- |
| `--pulse`   | Active/selected state; focus ring                 |
| `--surface` | Switcher background; dropdown panel background    |
| `--border`  | Control border; section divider rule              |

Radius scale used: `6` (dropdown rows), `10` (switcher control, dropdown panel), `999` (organization avatar).

---

# Organization Switcher

The Organization Switcher is the topmost element of the Sidebar. It is not part of the Header — see the Decision Log entry dated 2026-07-15 in `BIBLE/04_EXECUTION_BIBLE.md`.

It establishes which Organization every element below the section divider belongs to.

---

## States

### Single-organization (static label)

When the authenticated user belongs to exactly one Organization, the switcher renders as a static, non-interactive label.

- Organization avatar (radius `999`) + Organization name.
- Background `--surface`, radius `10`.
- No border, no chevron, no hover state, no focus ring — it is not a control.
- Not reachable by keyboard; it is not in the tab order.

Rationale: a switcher with exactly one destination is an affordance that promises an action it cannot perform.

### Multi-organization (dropdown)

When the user belongs to two or more Organizations, the switcher renders as a dropdown trigger.

Trigger:

- Organization avatar (radius `999`) + Organization name + chevron.
- Background `--surface`, 1px `--border`, radius `10`.
- Focus ring `--pulse`.

Panel:

- Background `--surface`, 1px `--border`, radius `10`.
- One row per Organization the user belongs to, each radius `6`.
- The active Organization's row is marked with `--pulse`.
- Row order follows the order returned by `GET /organizations`.

The single-organization case is a rendering state of the same component, not a separate component. The user's membership count can change (`POST /organizations`, per ADR-005 in `domain/05_API_DESIGN.md`), and the switcher must move between these two states without being replaced.

---

## Behavior

### Switching Organization is a full context reset

Selecting a different Organization discards the current Organization's context entirely. It is not a partial state update.

Reset on switch:

- Active Brand.
- Brand-scoped navigation (Brand Brain, Knowledge Base, AI Workspace, Settings).
- Conversation history.
- Any in-memory brand or conversation state.

Reason: Brand is 1:1 with Organization (Ontology cardinality), so no brand-scoped state can survive an Organization change. Retaining any of it would surface one Organization's data beneath another Organization's label — a tenant-isolation failure at the UI layer, and `domain/02_ARTIFACT_MODEL.md` states tenant isolation has no exceptions.

The reset is therefore the correct behavior, not a performance compromise to be optimized away with partial state retention.

### Current Organization comes from the URL

The switcher does not own "current Organization" as component state. The Organization id in the URL path is the source of truth (see the Decision Log entry dated 2026-07-15 in `BIBLE/04_EXECUTION_BIBLE.md`).

Selecting an Organization is a navigation, not a state mutation. The context reset follows from the route change.

---

## Section Divider

A single horizontal rule, 1px `--border`, spanning the Sidebar's inner width, sits directly below the Organization Switcher.

It separates two categories of navigation that must not read as one list:

- **Above the divider — org-level.** What Organization am I in. Answers a question about identity and scope.
- **Below the divider — brand-scoped.** What am I doing inside this Organization. Brand Brain, Knowledge Base, AI Workspace, Settings.

The divider carries meaning; it is not decoration. Everything below it is invalidated when the element above it changes. It is the visual boundary of the context reset described above.

The divider is presentational only and is not exposed to assistive technology as a separator between navigation landmarks; the org-level and brand-scoped groups carry their own labels.

---

# Related Documents

BIBLE/04_EXECUTION_BIBLE.md

prd/02_AI_WORKSPACE_PRD.md

domain/05_API_DESIGN.md

domain/02_ARTIFACT_MODEL.md

---

# Version History

## Version 1.0.0

Initial repo-side Component Kit specification.

- Added the Organization Switcher component spec: single-organization
  (static label) and multi-organization (dropdown) states, the
  full-context-reset switching behavior, and URL-as-source-of-truth for
  current Organization.
- Added the Sidebar section divider pattern separating org-level from
  brand-scoped navigation.
- Composes existing Design Foundations tokens (`--pulse`, `--surface`,
  `--border`; radius 6/10/999). No new tokens introduced.

Scope note: this document covers the Organization Switcher only. The
remainder of the Component Kit still lives outside this repository, and
the outstanding kit-wide fixes tracked in `BIBLE/04_EXECUTION_BIBLE.md`
(border-radius standardization; error states → Ember token) are not
addressed here.

---

# Status

Draft

Version

1.0.0

Effective Date

2026-07-15

---

# END OF DOCUMENT
