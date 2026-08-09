---
name: pom-conventions
description: Page Object Model conventions for Playwright tests in this
  project. Apply whenever generating, refactoring, or reviewing any
  Playwright test that interacts with the Didaxis UI — even if the user
  doesn't say "POM". Tests should never contain inline locators.
---

# Page Object Model Conventions

All UI interactions go through Page Objects in `pages/`. Tests describe
intent; POMs handle mechanics.

## Steps

1. One Page Object class per page or distinct component.
   Examples: `LoginPage`, `ProgramsPage`, `NewProgramModal`.

2. Define locators as `readonly` properties in the constructor, in priority
   order: `getByRole` → `getByLabel` / `getByPlaceholder` → `getByText` →
   `getByTestId` (escape hatch only — comment why). Never CSS, XPath, or
   brittle text. When a locator matches more than one element, disambiguate
   with `.filter({ hasText })`, not `.first()`.

3. Provide methods for user actions: `goto`, `clickX`, `fillY`, `submit`.
   Methods perform actions; they do not assert. Never `waitForTimeout` in
   POMs — callers use web-first `expect(locator).toBeVisible()` /
   `.toBeEnabled()` / `.toHaveText()`. Never gate on
   `expect(await locator.isVisible()).toBe(true)`; use
   `expect(locator).toBeVisible()`.

4. **No assertions inside Page Objects.** All `expect(...)` calls
   live in the test files, never in `pages/`.

5. Compose POMs when a page contains distinct components — e.g.
   `ProgramsPage` holds a `NewProgramModal` instance.

6. Import POMs at the top of each spec; instantiate with `new XxxPage(page)`.

## Output
Page Object files in `pages/`. Tests in `tests/` that import them.
