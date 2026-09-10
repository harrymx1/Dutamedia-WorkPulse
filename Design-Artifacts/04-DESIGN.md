# DESIGN System — WorkPulse
## Daily Accountability & Blocker Log System (Dutamedia)

**Versi:** 1.1

## Brand Personality
Internal accountability tool — calm, human, and trustworthy, **not** a
surveillance dashboard. Light theme built around Dutamedia's brand
identity (white + green), generous whitespace, soft edges. The
interface should feel like a daily journal with structure, not a
monitoring panel. Status must be legible at a glance, but the overall
tone stays supportive rather than alarming — even RED/No Submission
states are informative, never punitive-looking.

## Color Palette

### Base & Surface
- Background base: `#F7FAF9`
- Surface (cards/sidebar/panels): `#FFFFFF`
- Surface elevated (inputs/modals/dropdowns): `#EFF5F2`
- Border subtle: `#DCE7E2`
- Border strong (focus/active): `#A9C7BC`

### Text
- Text primary: `#0E211B`
- Text secondary: `#5C6E68`
- Text on-accent (buttons): `#FFFFFF`

### Accent — Brand Colors
- Accent primary: `#00674D`
- Accent secondary: `#12915F`
- Accent gradient: `linear-gradient(135deg, #00674D 0%, #12915F 100%)` — primary CTA only

## Status Colors — Three Independent Systems (never merge visually)

WorkPulse has three status "languages" that answer different questions.
They must never be combined into one badge or one color family, or users
will misread one for another.

### 1. Daily Status (GREEN / AMBER / RED) — "how risky is the work"
Filled pill, solid dot indicator, highest visual weight. Deliberately kept
in a different tone family from brand green (bright "traffic-light" green
vs deep brand teal-green) so brand identity and task status are never
visually conflated.
| Status | Text | Background | Border |
|---|---|---|---|
| GREEN | `#15803D` | `rgba(34,197,94,0.12)` | `rgba(34,197,94,0.3)` |
| AMBER | `#B45309` | `rgba(245,158,11,0.12)` | `rgba(245,158,11,0.3)` |
| RED | `#B91C1C` | `rgba(220,38,38,0.12)` | `rgba(220,38,38,0.3)` |

### 2. Submission Timing (On-Time / Late / No Submission) — "was it submitted on time"
Outlined pill (border only, no fill), small clock/check icon — a different
shape+color family from Daily Status so the two are never confused (e.g.
"Late" must not look like "AMBER").
| State | Text/Border | Icon |
|---|---|---|
| On-Time | `#0369A1` | check |
| Late | `#C2410C` | clock |
| No Submission | `#475569` (neutral slate — this is a factual event, not a verdict) | dash/empty |

### 3. Blocker Severity
| Severity | Text | Background |
|---|---|---|
| Low | `#475569` | `rgba(100,116,139,0.1)` |
| Medium | `#A16207` | `rgba(202,138,4,0.12)` |
| High | `#C2410C` | `rgba(194,65,12,0.12)` |
| Critical | `#B91C1C` | `rgba(220,38,38,0.12)` |

### Supporting tags
| Tag | Text | Background | Used for |
|---|---|---|---|
| Blocker: Open | `#475569` | `rgba(100,116,139,0.1)` | Blocker lifecycle start |
| Blocker: Acknowledged/In Progress | `#0369A1` | `rgba(2,132,199,0.1)` | Active handling |
| Blocker: Resolved/Closed | `#15803D` | `rgba(34,197,94,0.1)` | Done |
| Blocker: Accepted Risk | `#7C2D12` | `rgba(194,65,12,0.08)` | Alternative resolution |
| Correction: Minor | `#334155` | `rgba(51,65,85,0.08)` | ClassificationTag |
| Correction: Material | `#0284C7` | `rgba(2,132,199,0.1)` | ClassificationTag — informational, not alarming |
| Correction: Pending/Applied/Rejected | slate/green/red (reuse Daily-Status semantics: neutral/positive/negative) | — | Correction status |
| Leave: Pending | `#475569` | `rgba(100,116,139,0.1)` | |
| Leave: Approved | `#15803D` | `rgba(34,197,94,0.1)` | |
| Leave: Rejected | `#B91C1C` | `rgba(220,38,38,0.1)` | |
| Compliance: Reminder Sent | `#0369A1` | `rgba(2,132,199,0.1)` | |
| Compliance: Coaching | `#A16207` | `rgba(202,138,4,0.12)` | |
| Compliance: Recorded Warning | `#C2410C` | `rgba(194,65,12,0.12)` | |
| Compliance: Escalated | `#B91C1C` | `rgba(220,38,38,0.12)` | |

## Typography
- Heading font: **Plus Jakarta Sans** (weight 600/700/800)
- Body font: **Plus Jakarta Sans** (weight 400/500)
- Meta/badge/mono font: **JetBrains Mono** (weight 400) — timestamps, IDs, countdown (ObjectionWindowIndicator)
- H1: `clamp(1.5rem, 3vw, 2rem)`
- H2: `1.25rem`
- H3: `1.0625rem`
- Body: `0.9375rem`
- Caption/meta: `0.8125rem`

## Spacing & Shape
- Spacing scale: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 px
- Card border-radius: `10px`
- Button border-radius: `8px`
- Input border-radius: `8px`
- Badge/pill border-radius: `999px`
- Modal border-radius: `14px`

## Layout
- Max content width: `1200px`, centered
- Sidebar width (desktop): `232px`, fixed, collapsible on tablet
- Content area: flex-1, scrollable
- Top navbar height: `56px`
- One shell, sidebar sections adapt to active role (per UI/UX Spec Section 2) — no dual-portal split

## Components & Patterns

### Buttons
- Primary: gradient background, white text, subtle lift on hover (no glow — reserve that visual language for RED/Critical only)
- Secondary: transparent, border-subtle, hover border accent-primary
- Danger: `#DC2626` background — destructive confirms only (Reject, Object with reason), never routine navigation
- Ghost: no border, text-secondary, hover text-primary + surface-elevated bg

### Cards
- Background: surface (white), border: border-subtle 1px, no shadow by default
- Hover (clickable): border-color accent-primary, no translateY lift (keeps the tone calm/static rather than "gamified")

### StatusBadge vs SubmissionTimingBadge
- `StatusBadge`: filled pill, dot indicator, mono 0.7rem — Daily Status colors only
- `SubmissionTimingBadge`: outlined pill, icon instead of dot, always rendered next to (never merged with) StatusBadge
- Never the same shape (filled vs outlined) — the primary way users tell them apart at a glance

### CommitmentCard
- Equal visual weight for Commitment (1–3) and Additional Work — Additional Work gets a small `AdditionalWorkTag` (neutral slate) instead of being visually demoted
- Shows: text, Reference/Task Link (if any), Initial Risk dot, Outcome control, Continuation control (two separate segmented controls side-by-side, never one dropdown)

### BlockerCard + ActionPanel
- ActionPanel renders only the buttons valid for the current lifecycle state (hide, never disable)
- `AuthorityTag` (pill, icon-only accent, text "Org" or "Project") sits next to Owner Needed — always visible, never a tooltip-only distinction

### LockedIndicator
- Distinct banner strip (icon + text: "Baseline locked since [cutoff time]") above the read-only form
- Neutral slate, not red — locked is a normal, expected state, not an error

### DraftBanner
- Dashed-border banner above copy-forward content, accent-secondary left border, with inline Confirm/Edit buttons

### ClassificationTag + ObjectionWindowIndicator
- `ClassificationTag`: small pill, Minor = slate, Material = sky blue
- `ObjectionWindowIndicator`: countdown chip in JetBrains Mono, color shifts neutral→amber only in the final reminder window, not the whole duration

### ValidationPromptModal
- Modal, max-width 480px, always offers both "Keep my choice (with reason)" and "Use suggested status" as equally-weighted buttons — never styles the suggested option as more prominent

### RoleBasedPromptHint
- Placeholder-style inline text inside the commitment input (italic, text-secondary), disappears on focus/typing — never a separate required field

### NotificationBell / Notification Center
- Bell icon with unread count badge (accent-secondary background)
- Dropdown preview (last 5) + link to full `/notifications`
- Read/unread differentiated by background tint only (surface-elevated for unread), not bold text

### FilterBar
- Consistent horizontal bar: dropdowns left-aligned, search (if applicable) right-aligned
- Same component, same placement across Team/Function/Management Pulse, Blocker Queue, Compliance Queue, My History, Reports, Leave Approval Queue

### ExportButton
- Ghost button, icon + "Export", positioned top-right of the content it exports — always tied to the scope currently on screen

### EffectiveDatePicker + PolicyVersionHistory
- `EffectiveDatePicker`: date input that disables/blocks any date before today (no retroactive structural changes)
- `PolicyVersionHistory`: simple vertical timeline list (version, effective date, owner, [current] tag on active version)

### Modals (Confirm)
- Overlay: `rgba(15,23,42,0.55)` backdrop
- Card: surface background, 14px radius, max-width 420px (confirm) / 560px (form)
- Destructive confirm (Reject, Object): danger-colored icon + button
- Always Cancel (ghost) + Confirm (primary or danger) pair

### Toast
- Slide in from bottom-right, max-width 320px, auto-dismiss 4s
- Success: accent-primary left border; Error: `#DC2626` left border; Warning: `#D97706` left border

## Page Layout Patterns

### Self-Service Area (My Today, My History, Notifications, Profile)
Sidebar (role-adaptive) + main area:
- PageHeader (title + primary action, e.g. "Raise Blocker")
- Content — CommitmentCard list or detail view
- Simpler than Management area — fewer filters, more whitespace, single-column focus

### Management & Governance Area (Team/Function/Management Pulse, Queues, Reports, Policy Settings)
Sidebar + main area:
- PageHeader (title, scope label e.g. "Function: Engineering", export/action button)
- Exception-first summary widgets (`ExceptionSummaryWidget`) at top — always above any full data table
- FilterBar
- DataTable or grouped list below

## Motion
- Transition duration: 150–200ms, ease-out
- No hover-lift on cards — keeps the product feeling stable/calm, not "interactive/gamey"
- ObjectionWindowIndicator countdown ticks without animation flourish (plain number update)
- Modal: opacity + translateY(6px → 0) fade-in
- Toast: translateY(8px → 0) + opacity on enter
- All Status/Timing badges: zero animation — must be instantly, statically readable
- Respect `prefers-reduced-motion`

## Do's
- Always render StatusBadge and SubmissionTimingBadge as visually distinct shapes (filled vs outlined) wherever both appear
- Always show AuthorityTag when a blocker/escalation owner comes from Project Authority rather than the default organizational line
- Hide actions that are invalid for the current state — never show them disabled
- Keep No Submission neutral-toned (slate), never red — it's a compliance event, not a verdict
- Give Additional Work equal visual weight to planned Commitments

## Don'ts
- Don't let brand green (accent primary/secondary) visually merge with Status GREEN — they answer different questions (brand identity vs task risk) and must stay in the tones defined above
- Don't combine Outcome and Continuation into a single dropdown/control
- Don't style the Status Suggestion Engine's recommended option as more prominent than the user's own choice in ValidationPromptModal
- Don't use red or urgency styling for the full duration of an Objection Window — only near its deadline
- Don't add hover-lift/glow/gamified motion — this product should feel calm and administrative, not exciting
- Don't put more than 3 action buttons visible at once on any page