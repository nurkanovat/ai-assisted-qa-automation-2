---
name: a11y-checks
description: Adds @axe-core/playwright accessibility scans when generating or reviewing Playwright tests for new pages or components. Apply whenever creating, extending, or reviewing UI tests — even if the user does not mention accessibility, a11y, or axe.
---

# Accessibility Checks

Every Playwright test for a new page or component **must** include accessibility coverage. This is not optional. For the programs page, cover both an axe scan and a keyboard path axe cannot exercise.

## When to apply

- Generate a new Playwright spec or test case for a page or component
- Extend an existing test to cover a new page, modal, drawer, or widget
- Review or refactor any UI test — even if a11y is not mentioned

If the test navigates to or interacts with UI, it needs a11y coverage.

## Required: axe scan (programs page and other UI)

1. Import `AxeBuilder` from `@axe-core/playwright`.
2. Navigate via existing POMs; wait with web-first `expect` visibility checks. No inline locators in the spec.
3. Run the scan with WCAG 2 A/AA tags:

```typescript
import AxeBuilder from "@axe-core/playwright";

const results = await new AxeBuilder({ page })
  .withTags(["wcag2a", "wcag2aa"])
  .analyze();

await expect(results.violations).toEqual([]);
```

4. Assert with web-first `expect(results.violations).toEqual([])` — never bare `assert`, `if (violations.length)`, or manual length checks.
5. **One tag per test** (e.g. `{ tag: "@a11y" }`) — never multiple tags.

### Scoping `.include()` / `.exclude()`

Use `.include()` / `.exclude()` **only** when a third-party widget is noisy — and add a comment explaining why. Do not scope away real app chrome to hide violations.

### Real violations — stop

If the scan finds **real** WCAG violations, **report them and stop**. Never use `.disableRules()` to go green.

## Required: keyboard test (axe cannot do this)

On the programs page (and any primary CTA that opens a dialog):

1. Tab to the primary control (role-based POM locator).
2. Assert `expect(locator).toBeFocused()`.
3. Press Enter.
4. Assert the dialog opens (role-based POM locator, e.g. dialog visible).

Drive every step through existing POMs — no inline locators. One tag per test.

## File placement

- Dedicated a11y coverage: `tests/<feature>.a11y.spec.ts` (see `tests/programs.a11y.spec.ts`)
- Or add axe / keyboard coverage when a functional test already reaches the target UI

Keep axe assertions in test files, not in Page Objects. POMs may expose helpers like `axeIncludeSelector()` only when a documented third-party noise case needs scoping.

## Generating tests checklist

- [ ] Target UI loaded via POM and visible before scanning
- [ ] `AxeBuilder({ page }).withTags(['wcag2a','wcag2aa']).analyze()`
- [ ] `await expect(results.violations).toEqual([])`
- [ ] `.include()` / `.exclude()` only for noisy third-party widgets, with a why-comment
- [ ] No `.disableRules()` — real violations reported and work stopped
- [ ] Keyboard: tab → `toBeFocused()` → Enter → dialog opens (role-based POMs)
- [ ] One tag per test; no inline locators

## Reviewing tests checklist

- [ ] Axe + keyboard cover new pages/components (especially programs)
- [ ] Scans use `wcag2a` / `wcag2aa` tags
- [ ] Violations asserted with web-first `expect`
- [ ] No `.disableRules()` to silence real failures
- [ ] No missing a11y coverage because the user didn't say "accessibility"

If any item fails, add or fix the a11y check before considering the test complete.
