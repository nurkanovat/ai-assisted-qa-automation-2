---
name: self-heal
description: Heals Playwright test drift by re-discovering broken locators in the live UI and patching POMs with minimal role-based diffs. Use when the build is red because a locator broke, fix the drifted selector, the test broke after a UI change, or heal the suite — ONLY after triage classifies the red run as a test issue (drift). Never use for a real app bug; route those to bug-reporter instead.
---

# Self-Heal (Locator Drift)

Repairs one drifted locator per run. Every heal becomes a PR. Patches POMs
only — never weaken spec assertions to go green.

## Prerequisites

Triage must have classified the failure as **Test issue (drift)** — broken
locator, renamed accessible name, stale role, or equivalent selector drift.
See [ci-failure-triage](../ci-failure-triage/SKILL.md).

If classification is **App bug**, **Inconclusive**, or missing: **stop**.
Do not heal. Route to [jira-bug-reporter](../jira-bug-reporter/SKILL.md)
(or back to triage for classification).

## Steps

### 1. Confirm drift classification

Require triage output that explicitly names **Test issue (drift)** (or
equivalent drift/locator wording). No triage artifact → stop and run triage
first. Wrong classification → stop and route to bug-reporter.

### 2. Locate the failing locator

From the Playwright trace and error:

- Identify the failing test, step, and timeout/assertion
- Trace the call stack to the POM method and `pages/*.ts` property
- Record the **old locator** (exact constructor expression) and file:line

Pull trace from CI artifact per [ci-failure-triage](../ci-failure-triage/SKILL.md)
or local `test-results/` / `playwright-report/`.

### 3. Re-discover the element (Agent-Browser)

Open the app at the failing step's URL/state via Agent-Browser (Playwright MCP).

1. Reproduce navigation/actions from the spec up to (not past) the failing step
2. Read the **accessibility tree** (`browser_snapshot`) — roles, names, states
3. Find the target element by **role + current accessible name** (and state if
   needed), not CSS/XPath/pixels
4. Derive the replacement locator using [pom-conventions](../pom-conventions/SKILL.md)
   priority: `getByRole` → `getByLabel` / `getByPlaceholder` → `getByText` →
   `getByTestId` (last resort; comment why)

If the element is missing or behavior contradicts AC, **stop** — this is not
drift; re-classify and route to bug-reporter.

### 4. Patch the POM (minimal diff)

Edit **only** the drifted locator in `pages/*.ts`:

- Smallest role-based change that matches the live a11y tree
- Do **not** edit the spec file, assertions, waits, fixtures, or app source
- Do **not** change assertion meaning, drop assertions, or swap to weaker checks

### 5. Re-run and prove green (assertions unchanged)

```bash
npx playwright test <spec> -g "<failing test title>"
```

Before/after: `git diff tests/` must be **empty**. Any spec diff → revert and
escalate — green via a weakened assertion is a **bug**; stop and report.

The run must pass with **assertions unchanged**. Flaky pass → do not ship;
investigate or stop.

### 6. Report and open a PR

Deliver:

| Field | Content |
|-------|---------|
| **Classification** | Test issue (drift) — triage ref / run id |
| **POM** | `pages/<File>.ts` line |
| **Locator diff** | old → new (exact expressions) |
| **A11y evidence** | role + accessible name from snapshot |
| **Proof** | green re-run command + pass output |

Open a PR for the POM patch. One locator repair per run — do not batch
multiple heals. Link the failing CI run and triage comment. Human merges;
never merge automatically.

## Rules

- **One repair per run** — fix the single locator triage identified; queue
  additional drift for separate runs/PRs
- **Every heal becomes a PR** — no drive-by commits on unrelated branches
- **POM only** — specs hold assertions; POMs hold locators
- **No assertion weakening** — if the only path to green is changing a spec
  assertion, escalate; do not self-heal
- **Drift only** — wrong UI behavior, missing features, API errors, and a11y
  violations are app bugs, not locator drift

## Related skills

- [ci-failure-triage](../ci-failure-triage/SKILL.md) — required first; drift gate
- [pom-conventions](../pom-conventions/SKILL.md) — locator priority and shape
- [jira-bug-reporter](../jira-bug-reporter/SKILL.md) — when drift re-classifies as app bug
