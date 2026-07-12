---
name: jira-ticket-to-gherkin
description: Turns a Jira ticket's acceptance criteria into a full, reviewable QA test plan and Gherkin test scenarios, enriched with Confluence specs and live app behavior. Use this skill whenever the user references a Jira ticket (DS-1, DS-2, etc.) and asks for test cases, a test plan, scenarios, or wants to plan testing for a ticket — even if they don't say the word "Gherkin".
---

# Jira Ticket to Gherkin Test Cases

Generate a comprehensive, reviewable QA test plan from a Jira ticket. The
output is a human-readable checkpoint — the QA reviews it before any
Playwright code gets written.

Do NOT stop at the ticket's acceptance criteria. A ticket usually lists only
the happy-path ACs; real coverage comes from combining the ticket with the
supporting specs and the actual application behavior.

Do NOT gather, reference, or tag linked Jira defects. Derive test cases only
from the ticket's acceptance criteria, the Confluence specs, and observed app
behavior. Coverage for validation and edge scenarios comes from the spec rules
and standard QA practice — never from a bug ticket.

## Step 1 — Gather ALL sources (not just the ticket)

Coverage is only as good as the inputs. Always pull every source that exists,
and note in the plan which source each scenario came from.

1. **Jira ticket** (Atlassian MCP `getJiraIssue`): title, description, user
   story, every acceptance criterion, priority, labels. Do not gather linked
   defects.
2. **Confluence specs** (Atlassian MCP `searchConfluenceUsingCql` +
   `getConfluencePage`): search the ticket's space for the feature's docs
   (e.g. "Program Setup"). Extract field definitions (types, required,
   min/max length, uniqueness, defaults), validation rules (client + server),
   UI behavior (layout, modals, empty states, refresh behavior), and roles.
3. **Live app exploration** (Playwright MCP), when a test URL is available:
   open the feature, capture real UI labels, placeholders, button states,
   table layout, and confirm spec-vs-app gaps. Use real observed values.

## Step 2 — Derive test cases from every source

Produce test cases in three groups. Aim for thorough coverage, not the
minimum — a single-AC ticket backed by specs and app behavior typically
yields 20+ cases.

- **Positive flows:** each AC happy path, plus valid variations (required
  field only, partial edits, list refresh in place).
- **Negative flows:** empty/disabled submit, unauthorized role, cancel/close
  discards data, duplicate names, server/API failure, each server-side
  validation rule.
- **Edge cases:** min/max field lengths (from spec constraints), boundary
  just-over-max, whitespace-only and leading/trailing whitespace (trim),
  special characters, unicode/emoji, HTML/script injection, multi-line input,
  double-submit dedupe, collapsible/optional UI sections, table/layout checks.

## Step 3 — Format each test case

Number every case `TC-001`, `TC-002`, … Give each one:

- **Title:** one-line intent
- **Preconditions:** state/role/data required
- **Steps:** numbered user actions with real, specific values
- **Expected result:** observable outcome; cite the spec when relevant
- **Priority:** High / Medium / Low
- A fenced `gherkin` block with a single `Scenario` in Given / When / Then form

Use real, specific values everywhere (e.g. "Web Development 2026") — never
placeholders.

## Step 4 — Write the two deliverables

1. **Markdown test plan** → `Test cases/<TICKET-KEY>_ticket_OUTPUT.md`
   - Header: ticket link, status, source list, scope
   - The Jira acceptance criteria (quoted)
   - Confluence evidence summary + a spec-vs-app gap table (no defect keys)
   - `## Positive Flows`, `## Negative Flows`, `## Edge Cases` with the TC cases
   - A `## Coverage Matrix` mapping each acceptance criterion → test case IDs
   - A `## Ambiguities and Gaps` list for the QA to resolve

2. **Gherkin feature file** → `features/<TICKET-KEY>.feature`
   - One `Feature` named after the ticket, with a one-line summary under it
   - Group scenarios with comments: `# Happy paths`, `# Negative`, `# Edge cases`
   - Tag every scenario for traceability and filtering:
     `@TC-001 @High @AC-<short-name>`
   - Descriptive scenario names, concrete UI values, Given / When / Then steps
   - Keep it in sync with the Markdown plan (one scenario per TC)
