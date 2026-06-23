# DS-2 — Test Plan: Edit Existing Program Details

**Feature:** Edit existing program details  
**Source:** DS-2_ticket_INPUT  
**Scope:** Programs page, edit modal (`Program Name`, `Description`), **Save** action, edit icon per program row

---

## Positive Flows

### TC-001 — Edit form opens with current program data pre-populated

**Title:** Edit modal shows existing Program Name and Description values

**Preconditions:**
- User is logged in as admin
- Programs page is open
- Program **Web Development 2026** exists with Description **Full-stack web development program**

**Steps:**
1. Navigate to the Programs page
2. Locate **Web Development 2026** in the program list
3. Click the edit icon on **Web Development 2026**

**Expected result:** Edit form (modal) opens with **Program Name** = `Web Development 2026` and **Description** = `Full-stack web development program`

**Priority:** High

```gherkin
Scenario: Open program for editing
  Given I am on the Programs page
  And a program "Web Development 2026" exists
  When I click the edit icon on "Web Development 2026"
  Then I see the edit form pre-populated with the program's current data
  And the Program Name field shows "Web Development 2026"
  And the Description field shows "Full-stack web development program"
```

---

### TC-002 — Program name update is saved and reflected in the list

**Title:** Renamed program appears in the list immediately after Save

**Preconditions:**
- User is logged in as admin
- Program **Web Development 2026** exists
- Edit form for **Web Development 2026** is open

**Steps:**
1. Change **Program Name** to `Web Development 2026 - Updated`
2. Click **Save**

**Expected result:**
- Modal closes
- Program list shows **Web Development 2026 - Updated**
- **Web Development 2026** no longer appears as the program name in the list

**Priority:** High

```gherkin
Scenario: Successfully edit a program name
  Given I am editing "Web Development 2026"
  When I change the Program Name to "Web Development 2026 - Updated"
  And I click Save
  Then the modal closes
  And the program list immediately shows "Web Development 2026 - Updated"
```

---

### TC-003 — Unchanged fields are preserved when only Description is edited

**Title:** Partial edit updates only the modified field

**Preconditions:**
- User is logged in as admin
- Program **Web Development 2026** exists with Description **Full-stack web development program**
- Edit form for **Web Development 2026** is open

**Steps:**
1. Confirm **Program Name** is `Web Development 2026`
2. Change **Description** to `Full-stack web development program — revised curriculum`
3. Click **Save**
4. Re-open the edit form for **Web Development 2026**

**Expected result:**
- **Program Name** remains `Web Development 2026`
- **Description** is `Full-stack web development program — revised curriculum`
- No other fields were altered unintentionally

**Priority:** High

```gherkin
Scenario: Edit preserves unchanged fields
  Given I am editing a program
  And the Program Name is "Web Development 2026"
  And the Description is "Full-stack web development program"
  When I only change the Description to "Full-stack web development program — revised curriculum"
  And I click Save
  Then the Program Name remains "Web Development 2026"
  And the Description is "Full-stack web development program — revised curriculum"
```

---

### TC-004 — Program list updates in place without page reload

**Title:** List reflects edits without navigating away from Programs page

**Preconditions:**
- User is logged in as admin
- Programs page is open
- Program **Data Science 2026** exists with Description **Introduction to statistics and machine learning**

**Steps:**
1. Click the edit icon on **Data Science 2026**
2. Change **Program Name** to `Data Science 2026 - Advanced Track`
3. Click **Save**
4. Observe the program list on the same Programs page

**Expected result:** **Data Science 2026 - Advanced Track** appears in the list without a full page reload or manual refresh

**Priority:** Medium

```gherkin
Scenario: Program list updates in place after edit
  Given I am on the Programs page
  And a program "Data Science 2026" exists
  When I click the edit icon on "Data Science 2026"
  And I change the Program Name to "Data Science 2026 - Advanced Track"
  And I click Save
  Then the modal closes
  And the program list on the Programs page shows "Data Science 2026 - Advanced Track"
```

---

### TC-005 — Both Program Name and Description can be updated in one save

**Title:** Full edit of all form fields persists correctly

**Preconditions:**
- User is logged in as admin
- Program **Cybersecurity Fundamentals** exists with Description **Network security and ethical hacking basics**
- Edit form is open for **Cybersecurity Fundamentals**

**Steps:**
1. Change **Program Name** to `Cybersecurity Fundamentals 2026`
2. Change **Description** to `Network security, ethical hacking, and incident response`
3. Click **Save**
4. Re-open the edit form for **Cybersecurity Fundamentals 2026**

**Expected result:** Both fields reflect the new values after save and re-open

**Priority:** Medium

```gherkin
Scenario: Edit both program name and description
  Given I am editing "Cybersecurity Fundamentals"
  When I change the Program Name to "Cybersecurity Fundamentals 2026"
  And I change the Description to "Network security, ethical hacking, and incident response"
  And I click Save
  Then the modal closes
  And the program list shows "Cybersecurity Fundamentals 2026"
  And when I open the edit form for "Cybersecurity Fundamentals 2026"
  Then the Description shows "Network security, ethical hacking, and incident response"
```

---

### TC-006 — Saving with no changes keeps program data intact

**Title:** Save without modifications does not corrupt existing data

**Preconditions:**
- User is logged in as admin
- Program **Mobile App Development 2026** exists with Description **iOS and Android development**
- Edit form is open with original values loaded

**Steps:**
1. Do not change any field
2. Click **Save**

**Expected result:**
- Modal closes (or remains open with clear feedback — per product rule)
- Program list still shows **Mobile App Development 2026** with unchanged data on re-open

**Priority:** Low

```gherkin
Scenario: Save without changes preserves program data
  Given I am editing "Mobile App Development 2026"
  And I have not modified any field
  When I click Save
  Then the program list still shows "Mobile App Development 2026"
  And when I open the edit form again
  Then the Program Name and Description match the original values
```

---

## Negative Flows

### TC-007 — Save is disabled when Program Name is cleared

**Title:** Empty Program Name blocks save on edit

**Preconditions:**
- User is logged in as admin
- Edit form for **Web Development 2026** is open

**Steps:**
1. Clear **Program Name** completely
2. Leave **Description** as `Full-stack web development program`
3. Observe the **Save** button

**Expected result:** **Save** button is disabled; original program **Web Development 2026** remains unchanged in the list

**Priority:** High

```gherkin
Scenario: Validation prevents empty program name on edit
  Given I am editing "Web Development 2026"
  When I clear the Program Name field
  Then the Save button is disabled
  And the program list still shows "Web Development 2026"
```

---

### TC-008 — Cleared Program Name does not persist via forced submission

**Title:** Empty name cannot update the program through UI workarounds

**Preconditions:**
- User is logged in as admin
- Edit form for **Web Development 2026** is open

**Steps:**
1. Clear **Program Name**
2. Keep **Description** as `Attempted empty name save`
3. Attempt to submit via keyboard or forced interaction if **Save** appears enabled

**Expected result:**
- Program is not updated with an empty name
- **Web Development 2026** remains in the program list
- Modal stays open or submission is blocked with validation feedback

**Priority:** High

```gherkin
Scenario: Empty program name does not update the program
  Given I am editing "Web Development 2026"
  When I clear the Program Name field
  And I fill in Description with "Attempted empty name save"
  And I attempt to submit the edit form
  Then the program list still shows "Web Development 2026"
  And no program exists with an empty name
```

---

### TC-009 — Closing modal without saving discards edits

**Title:** Cancel/close does not persist unsaved changes

**Preconditions:**
- User is logged in as admin
- Edit form for **Web Development 2026** is open

**Steps:**
1. Change **Program Name** to `Unsaved Edit Draft`
2. Change **Description** to `This change should not be saved`
3. Close the modal (Cancel, X, or Escape — per UI)

**Expected result:**
- Modal closes
- Program list still shows **Web Development 2026**
- Re-opening edit shows original Description **Full-stack web development program**

**Priority:** Medium

```gherkin
Scenario: Closing the edit modal without saving discards changes
  Given I am editing "Web Development 2026"
  When I change the Program Name to "Unsaved Edit Draft"
  And I change the Description to "This change should not be saved"
  And I close the edit modal without saving
  Then the modal closes
  And the program list shows "Web Development 2026"
  And the program list does not show "Unsaved Edit Draft"
```

---

### TC-010 — Non-admin cannot edit programs

**Title:** Non-admin users cannot modify program details

**Preconditions:**
- User is logged in as a non-admin role (e.g. instructor or student)
- Program **Web Development 2026** exists

**Steps:**
1. Navigate to the Programs page (if accessible)
2. Look for the edit icon on **Web Development 2026**
3. If visible, attempt to open the form and change **Program Name** to `Unauthorized Edit`

**Expected result:**
- Edit icon is hidden or disabled, **or**
- Access is denied (403 / redirect / error message)
- **Web Development 2026** is unchanged

**Priority:** High

```gherkin
Scenario: Non-admin cannot edit a program
  Given I am logged in as a non-admin user
  And a program "Web Development 2026" exists
  When I navigate to the Programs page
  Then I do not see an enabled edit action for "Web Development 2026"
  Or I see an access denied message when attempting to edit the program
```

---

### TC-011 — Renaming to an existing program name is rejected or handled consistently

**Title:** Duplicate Program Name on edit follows the same business rule as create

**Preconditions:**
- User is logged in as admin
- Programs **Web Development 2026** and **Data Science 2026** exist
- Edit form for **Data Science 2026** is open

**Steps:**
1. Change **Program Name** to `Web Development 2026`
2. Click **Save**

**Expected result (one of — document actual product behavior):
- Validation or error message indicating duplicate name, **or**
- Save blocked with clear feedback
- **Data Science 2026** remains unchanged in the list if save fails
- Program list does not contain an unintended duplicate entry

**Priority:** High

```gherkin
Scenario: Duplicate program name on edit is handled per business rules
  Given I am editing "Data Science 2026"
  And a program named "Web Development 2026" already exists
  When I change the Program Name to "Web Development 2026"
  And I click Save
  Then the system responds with a clear validation or error message
  And the program list still shows "Data Science 2026"
  And the program list does not contain an unintended duplicate entry
```

---

### TC-012 — API failure during save does not show false success

**Title:** Failed save shows error and keeps recoverable form data

**Preconditions:**
- User is logged in as admin
- Edit form for **Web Development 2026** is open
- Backend update endpoint is unavailable or returns an error (simulated)

**Steps:**
1. Change **Program Name** to `API Failure Edit Test`
2. Click **Save** while the API fails

**Expected result:**
- Modal does not close as if save succeeded
- User sees an error message
- Program list still shows **Web Development 2026**
- Form retains `API Failure Edit Test` so the user can retry

**Priority:** Medium

```gherkin
Scenario: API failure during program edit shows error
  Given I am editing "Web Development 2026"
  And the program update API will fail
  When I change the Program Name to "API Failure Edit Test"
  And I click Save
  Then I see an error message indicating the update failed
  And the modal does not close as if the edit succeeded
  And the program list still shows "Web Development 2026"
```

---

### TC-013 — Edit of a concurrently deleted program is handled safely

**Title:** Saving edits to a deleted program does not corrupt the list

**Preconditions:**
- User is logged in as admin
- Edit form for **Web Development 2026** is open
- Another session or process deletes **Web Development 2026** before Save

**Steps:**
1. Change **Description** to `Edited after deletion`
2. Click **Save**

**Expected result:**
- Clear error (e.g. program not found / conflict)
- No orphan or ghost entry in the program list
- User is not shown a false success state

**Priority:** Medium

```gherkin
Scenario: Save edit on deleted program shows error
  Given I am editing "Web Development 2026"
  And the program "Web Development 2026" has been deleted in another session
  When I change the Description to "Edited after deletion"
  And I click Save
  Then I see an error message indicating the program no longer exists
  And the program list does not show "Web Development 2026" with stale edited data
```

---

## Edge Cases

### TC-014 — Single-character Program Name on edit

**Title:** Minimum-length Program Name boundary is enforced consistently on edit

**Preconditions:**
- User is logged in as admin
- Edit form for **Web Development 2026** is open

**Steps:**
1. Change **Program Name** to `A`
2. Click **Save**

**Expected result:** Program is saved as **A** (or validation error if minimum length > 1); list reflects the outcome

**Priority:** Medium

```gherkin
Scenario: Minimum length program name on edit
  Given I am editing "Web Development 2026"
  When I change the Program Name to "A"
  And I click Save
  Then the program list shows "A"
  Or I see a validation message if minimum length is greater than one character
```

---

### TC-015 — Program Name at maximum allowed length on edit

**Title:** Max-length Program Name is accepted or clearly rejected on edit

**Preconditions:**
- User is logged in as admin
- Edit form for **Web Development 2026** is open

**Steps:**
1. Change **Program Name** to `Advanced Web Development and Cloud Architecture Specialization Program Track 2026 Edition Alpha` (100 characters)
2. Click **Save**

**Expected result:** Full name appears in the list, or clear max-length validation if 100 exceeds the limit

**Priority:** Medium

```gherkin
Scenario: Program name at maximum allowed length on edit
  Given I am editing "Web Development 2026"
  When I change the Program Name to "Advanced Web Development and Cloud Architecture Specialization Program Track 2026 Edition Alpha"
  And I click Save
  Then the modal closes
  And the program list shows the full program name
  Or I see a validation message if the name exceeds the maximum length
```

---

### TC-016 — Program Name exceeding maximum length is rejected on edit

**Title:** Over-max Program Name is blocked on save

**Preconditions:**
- User is logged in as admin
- Edit form for **Web Development 2026** is open

**Steps:**
1. Change **Program Name** to a 256-character string
2. Attempt to click **Save**

**Expected result:**
- **Save** disabled or validation error shown
- **Web Development 2026** unchanged in the list if save fails

**Priority:** Medium

```gherkin
Scenario: Program name exceeding maximum length is rejected on edit
  Given I am editing "Web Development 2026"
  When I change the Program Name to a string of 256 characters
  And I click Save
  Then I see a validation message for Program Name
  And the program list still shows "Web Development 2026"
```

---

### TC-017 — Empty Description on edit

**Title:** Clearing Description on edit follows the same optional/required rule as create

**Preconditions:**
- User is logged in as admin
- Edit form for **Web Development 2026** is open

**Steps:**
1. Leave **Program Name** as `Web Development 2026`
2. Clear **Description**
3. Observe **Save** button and submit if enabled

**Expected result (per spec):
- If optional: save succeeds; Description is empty on re-open
- If required: **Save** disabled or validation error; original Description preserved

**Priority:** High

```gherkin
Scenario: Empty description on edit boundary behavior
  Given I am editing "Web Development 2026"
  When I clear the Description field
  And I click Save
  Then the Save button is disabled
  Or the modal closes and the Description is empty when I reopen the edit form
  Or the original Description "Full-stack web development program" is preserved
```

---

### TC-018 — Description at maximum allowed length on edit

**Title:** Long Description is stored correctly after edit

**Preconditions:**
- User is logged in as admin
- Edit form for **UX Design Bootcamp** is open

**Steps:**
1. Leave **Program Name** unchanged
2. Change **Description** to a 2000-character string
3. Click **Save**
4. Re-open the edit form

**Expected result:** Full Description stored without silent truncation (or validation if over limit)

**Priority:** Low

```gherkin
Scenario: Description at maximum allowed length on edit
  Given I am editing "UX Design Bootcamp"
  When I change the Description to a string of 2000 characters
  And I click Save
  Then the modal closes
  And when I reopen the edit form for "UX Design Bootcamp"
  Then the Description contains the full 2000-character text
```

---

### TC-019 — Special characters in Program Name on edit

**Title:** Special characters in edited fields render safely

**Preconditions:**
- User is logged in as admin
- Edit form for **Web Development 2026** is open

**Steps:**
1. Change **Program Name** to `C++ & C# Programming (2026)`
2. Change **Description** to `Languages: C++, C#, and scripting`
3. Click **Save**

**Expected result:**
- List shows `C++ & C# Programming (2026)` without encoding corruption
- No broken HTML or script execution in UI

**Priority:** Medium

```gherkin
Scenario: Special characters in edited program name and description
  Given I am editing "Web Development 2026"
  When I change the Program Name to "C++ & C# Programming (2026)"
  And I change the Description to "Languages: C++, C#, and scripting"
  And I click Save
  Then the modal closes
  And the program list shows "C++ & C# Programming (2026)"
```

---

### TC-020 — Unicode and emoji in edited fields

**Title:** Unicode Program Name and emoji Description render correctly after edit

**Preconditions:**
- User is logged in as admin
- Edit form for **Web Development 2026** is open

**Steps:**
1. Change **Program Name** to `日本語プログラム 2026`
2. Change **Description** to `Multilingual curriculum 🎓`
3. Click **Save**

**Expected result:** **日本語プログラム 2026** appears correctly in the list; emoji preserved on re-open

**Priority:** Low

```gherkin
Scenario: Unicode and emoji in edited program fields
  Given I am editing "Web Development 2026"
  When I change the Program Name to "日本語プログラム 2026"
  And I change the Description to "Multilingual curriculum 🎓"
  And I click Save
  Then the modal closes
  And the program list shows "日本語プログラム 2026"
```

---

### TC-021 — Leading and trailing whitespace in Program Name on edit

**Title:** Whitespace trimming on edit matches create behavior

**Preconditions:**
- User is logged in as admin
- Edit form for **Web Development 2026** is open

**Steps:**
1. Change **Program Name** to `   Web Development 2026 - Updated   `
2. Click **Save**

**Expected result (document actual behavior):
- Trimmed to `Web Development 2026 - Updated`, **or**
- Stored exactly as entered including spaces
- No unintended duplicate with existing names

**Priority:** Medium

```gherkin
Scenario: Leading and trailing whitespace in edited program name
  Given I am editing "Web Development 2026"
  When I change the Program Name to "   Web Development 2026 - Updated   "
  And I click Save
  Then the program list shows "Web Development 2026 - Updated"
  Or the program list shows the name exactly as entered including spaces
```

---

### TC-022 — Whitespace-only Program Name on edit is rejected

**Title:** Whitespace-only Program Name is treated as empty on edit

**Preconditions:**
- User is logged in as admin
- Edit form for **Web Development 2026** is open

**Steps:**
1. Change **Program Name** to `     ` (spaces only)
2. Observe **Save** button

**Expected result:** **Save** disabled or validation error; **Web Development 2026** unchanged in list

**Priority:** High

```gherkin
Scenario: Whitespace-only program name is rejected on edit
  Given I am editing "Web Development 2026"
  When I change the Program Name to "     "
  Then the Save button is disabled
  Or I see a validation message for Program Name
  And the program list still shows "Web Development 2026"
```

---

### TC-023 — HTML/script injection in Description on edit

**Title:** Malicious Description input does not execute after edit

**Preconditions:**
- User is logged in as admin
- Edit form for **Web Development 2026** is open

**Steps:**
1. Change **Description** to `<script>alert('xss')</script>`
2. Click **Save**
3. View the program in the list and re-open edit

**Expected result:**
- No script execution in browser
- Content escaped or sanitized in display
- **Program Name** remains `Web Development 2026`

**Priority:** Medium

```gherkin
Scenario: HTML injection in edited description is sanitized
  Given I am editing "Web Development 2026"
  When I change the Description to "<script>alert('xss')</script>"
  And I click Save
  Then no script is executed in the browser
  And the program list still shows "Web Development 2026"
```

---

### TC-024 — Double-click Save does not duplicate or corrupt data

**Title:** Repeated Save clicks produce exactly one update

**Preconditions:**
- User is logged in as admin
- Edit form for **Cloud Computing 2026** is open

**Steps:**
1. Change **Program Name** to `Cloud Computing 2026 - Enterprise`
2. Double-click **Save** quickly

**Expected result:**
- Exactly one program named **Cloud Computing 2026 - Enterprise** in the list
- No duplicate rows or partial/corrupt state

**Priority:** Medium

```gherkin
Scenario: Double submit on edit does not corrupt program data
  Given I am editing "Cloud Computing 2026"
  When I change the Program Name to "Cloud Computing 2026 - Enterprise"
  And I double-click Save
  Then the modal closes
  And exactly one program named "Cloud Computing 2026 - Enterprise" exists in the program list
```

---

### TC-025 — Multi-line Description is preserved on edit

**Title:** Line breaks in Description survive save and re-open

**Preconditions:**
- User is logged in as admin
- Edit form for **DevOps Pipeline Program** is open

**Steps:**
1. Change **Description** to:
   ```
   Week 1: CI/CD basics
   Week 2: Kubernetes
   Week 3: Monitoring
   ```
2. Click **Save**
3. Re-open the edit form

**Expected result:** Line breaks preserved in stored and displayed Description

**Priority:** Low

```gherkin
Scenario: Multi-line description is preserved on edit
  Given I am editing "DevOps Pipeline Program"
  When I change the Description to "Week 1: CI/CD basics\nWeek 2: Kubernetes\nWeek 3: Monitoring"
  And I click Save
  Then when I reopen the edit form for "DevOps Pipeline Program"
  Then the Description preserves the line breaks
```

---

### TC-026 — Renaming to the same Program Name succeeds (no-op rename)

**Title:** Saving the unchanged Program Name does not error

**Preconditions:**
- User is logged in as admin
- Edit form for **Web Development 2026** is open

**Steps:**
1. Leave **Program Name** as `Web Development 2026`
2. Change **Description** to `Minor description tweak only`
3. Click **Save**

**Expected result:** Save succeeds; **Web Development 2026** remains in list; no false duplicate-name error against itself

**Priority:** Medium

```gherkin
Scenario: Edit with unchanged program name does not trigger duplicate error
  Given I am editing "Web Development 2026"
  When I leave the Program Name as "Web Development 2026"
  And I change the Description to "Minor description tweak only"
  And I click Save
  Then the modal closes
  And the program list shows "Web Development 2026"
  And I do not see a duplicate name validation error
```

---

## Coverage Matrix

| Acceptance criterion | Test cases |
|----------------------|------------|
| Open edit form; pre-populated with current data | TC-001 |
| Edit Program Name; Save; modal closes; list updated | TC-002, TC-004 |
| Partial edit preserves unchanged fields | TC-003, TC-026 |

---

## Ambiguities and Gaps in the Acceptance Criteria

1. **Field label inconsistency** — AC uses "Name"; create flow uses **Program Name**. Test plan assumes **Program Name** unless the UI label differs.

2. **Pre-population detail** — AC says "current data" but does not list fields explicitly. Assumed: **Program Name** and **Description** only (matching create form). Audit fields (created date, modified by) are not mentioned.

3. **Login / role** — Create AC requires admin login; edit AC only says "on the Programs page." Non-admin edit behavior is unspecified (TC-010).

4. **Empty Program Name on edit** — Create AC disables **Create** when name is empty; edit AC does not state whether **Save** follows the same rule (TC-007, TC-008).

5. **Description required on edit?** — AC allows Description-only change but does not say whether Description can be cleared (TC-017).

6. **Field constraints** — No max/min length, trim rules, or character set for edit (TC-014–TC-016, TC-021, TC-022).

7. **Duplicate names on rename** — No rule when renaming to an existing program name (TC-011). Unclear whether editing a program to its own current name counts as duplicate (TC-026).

8. **Modal dismiss behavior** — Cancel, Escape, click-outside, and unsaved-change confirmation are not defined (TC-009).

9. **Success feedback** — AC covers modal close and list update but not toast/message, sort order after rename, or whether the row keeps the same position.

10. **Description visibility** — AC verifies Name in list after rename; does not say whether updated Description is visible in list, detail, or tooltip (TC-003).

11. **Save with no changes** — Not specified whether **Save** is enabled or what happens when no fields changed (TC-006).

12. **Error handling** — Network/API failures, concurrent edit/delete, and optimistic UI rollback are not in AC (TC-012, TC-013).

13. **Edit entry point** — AC references "edit icon" only; keyboard access, row click, or bulk edit are not specified.

14. **Persistence** — No AC for browser refresh after edit, or whether edits survive logout/login.

15. **Relationship to create validation** — Unclear whether edit reuses identical validation rules as create for all boundary cases.
