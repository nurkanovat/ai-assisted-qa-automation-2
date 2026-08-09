# Worked triage → Jira flow

## Example: app bug (after human confirm)

**Signal:** PR check `E2E Tests` red on branch `feature/ds-2-edit-program`.

**1. Pull evidence**

```bash
gh run list --workflow e2e.yml --branch feature/ds-2-edit-program --limit 5
# → run-id 1234567890, conclusion: failure

gh run view 1234567890 --log-failed
gh run download 1234567890 -n playwright-report -D /tmp/ci-triage/1234567890/
```

**2. Read Playwright error** (from log / report `data/`)

- Spec: `tests/edit-program.spec.ts`
- Title: `edited program name appears in the list`
- Expected: `Web Development 2026 (Updated)`
- Actual: list still shows `Web Development 2026`
- Trace: `test-results/edit-program-edited-program-name.../trace.zip`

**3. Cross-reference**

| Layer | Finding |
|-------|---------|
| Spec | Asserts list text matches new name after save — matches AC |
| POM | `pages/programs.page.ts` save + list locators look correct |
| Feature | `features/DS-2.feature` — list must reflect edited name |
| App | No app source in repo; screenshot shows stale name after save |

**4. Classification:** App bug (pending human)

Post PR comment with template. Ask user to confirm before Jira.

**5. After human confirms**

Follow [jira-bug-reporter](../jira-bug-reporter/SKILL.md):

- Parent story: `DS-2` (from `test.describe` / feature file)
- Create sub-task with evidence paths + run id
- Update PR comment with Jira key/URL

Do **not** merge any app or test change automatically.

---

## Example: test issue

**Signal:** Same workflow red; error `Timeout 5000ms exceeded waiting for getByRole('button', { name: 'Save' })`.

**Cross-reference**

| Layer | Finding |
|-------|---------|
| Spec | Clicks Save immediately after fill |
| POM | Locator uses exact name `Save`; UI button is `Save changes` |
| Feature | AC does not prescribe button label wording |

**Classification:** Test issue

**Suggested fix (propose only):** Update POM locator to `getByRole('button', { name: /save/i })` in `pages/programs.page.ts`. Do not push/merge without approval.

**PR comment:** Use template; Classification = Test issue; no Jira.
