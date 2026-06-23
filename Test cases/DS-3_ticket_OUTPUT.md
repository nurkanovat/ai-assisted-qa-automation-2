# DS-3 — Test Plan: Program Name Validation and Duplicate Prevention

**Feature:** Program name validation and duplicate prevention  
**Source:** DS-3_ticket_INPUT  
**Scope:** **Program Name** validation on create (and related duplicate checks), program creation modal, Programs page, admin access

---

## Positive Flows

### TC-001 — Valid program name is accepted and program is created

**Title:** Standard alphanumeric Program Name passes validation and persists

**Preconditions:**
- User is logged in as admin
- Program creation form is open
- No program named **Data Science 2026** exists

**Steps:**
1. Enter `Data Science 2026` in **Program Name**
2. Enter `Introduction to statistics and machine learning` in **Description**
3. Click **Create**

**Expected result:** Modal closes; **Data Science 2026** appears in the program list

**Priority:** High

```gherkin
Scenario: Valid program name is accepted
  Given I am logged in as admin
  And I am on the program creation form
  When I fill in Program Name with "Data Science 2026"
  And I fill in Description with "Introduction to statistics and machine learning"
  And I click Create
  Then the modal closes
  And the program list shows "Data Science 2026"
```

---

### TC-002 — Program name with special characters is created successfully

**Title:** Ampersand and hyphen in Program Name are accepted

**Preconditions:**
- User is logged in as admin
- Program creation form is open
- No program named **Informatique & IA - Niveau 2** exists

**Steps:**
1. Enter `Informatique & IA - Niveau 2` in **Program Name**
2. Enter `Programme de deuxième niveau en informatique et intelligence artificielle` in **Description**
3. Click **Create**

**Expected result:** Program **Informatique & IA - Niveau 2** is created successfully and appears in the program list

**Priority:** High

```gherkin
Scenario: Accept program name with special characters
  Given I am on the program creation form
  When I enter "Informatique & IA - Niveau 2" as the program name
  And I fill in Description with "Programme de deuxième niveau en informatique et intelligence artificielle"
  And I click Create
  Then the program is created successfully
  And the program list shows "Informatique & IA - Niveau 2"
```

---

### TC-003 — Program name with programming-language special characters is accepted

**Title:** Plus signs, hash signs, and parentheses in Program Name are allowed

**Preconditions:**
- User is logged in as admin
- Program creation form is open

**Steps:**
1. Enter `C++ & C# Programming (2026)` in **Program Name**
2. Enter `Languages: C++, C#, and scripting fundamentals` in **Description**
3. Click **Create**

**Expected result:** Program **C++ & C# Programming (2026)** is created and displayed without encoding corruption

**Priority:** Medium

```gherkin
Scenario: Programming special characters in program name are accepted
  Given I am on the program creation form
  When I fill in Program Name with "C++ & C# Programming (2026)"
  And I fill in Description with "Languages: C++, C#, and scripting fundamentals"
  And I click Create
  Then the program is created successfully
  And the program list shows "C++ & C# Programming (2026)"
```

---

### TC-004 — Unicode Program Name is accepted

**Title:** Non-Latin characters in Program Name pass validation

**Preconditions:**
- User is logged in as admin
- Program creation form is open

**Steps:**
1. Enter `日本語プログラム 2026` in **Program Name**
2. Enter `Multilingual curriculum track` in **Description**
3. Click **Create**

**Expected result:** Program **日本語プログラム 2026** is created and renders correctly in the list

**Priority:** Medium

```gherkin
Scenario: Unicode program name is accepted
  Given I am on the program creation form
  When I fill in Program Name with "日本語プログラム 2026"
  And I fill in Description with "Multilingual curriculum track"
  And I click Create
  Then the program is created successfully
  And the program list shows "日本語プログラム 2026"
```

---

## Negative Flows

### TC-005 — Whitespace-only Program Name is rejected

**Title:** Name trimmed to empty prevents form submission

**Preconditions:**
- User is logged in as admin
- Program creation form is open

**Steps:**
1. Enter `   ` (three spaces) in **Program Name**
2. Enter `Whitespace-only name validation test` in **Description**
3. Click **Create**

**Expected result:**
- Form is not submitted
- No new program is added to the list
- **Create** is disabled or validation feedback indicates Program Name is required

**Priority:** High

```gherkin
Scenario: Reject program name with only whitespace
  Given I am on the program creation form
  When I enter "   " as the program name
  And I fill in Description with "Whitespace-only name validation test"
  And I click Create
  Then the form is not submitted
  And no new program is added to the program list
```

---

### TC-006 — Empty Program Name prevents submission

**Title:** Blank Program Name is blocked before create

**Preconditions:**
- User is logged in as admin
- Program creation form is open

**Steps:**
1. Leave **Program Name** empty
2. Enter `Description without a program name` in **Description**
3. Observe **Create** button and attempt submission

**Expected result:** **Create** is disabled or submission blocked; no program created

**Priority:** High

```gherkin
Scenario: Empty program name prevents submission
  Given I am on the program creation form
  When I leave the Program Name field empty
  And I fill in Description with "Description without a program name"
  Then the Create button is disabled
  And no new program is added to the program list
```

---

### TC-007 — Duplicate Program Name on create shows error

**Title:** Existing name is rejected with a clear duplicate error

**Preconditions:**
- User is logged in as admin
- Program **Web Development 2026** already exists
- Program creation form is open

**Steps:**
1. Enter `Web Development 2026` in **Program Name**
2. Enter `Duplicate attempt — second web dev cohort` in **Description**
3. Click **Create**

**Expected result:**
- Error message indicates the name already exists
- Modal remains open
- No second **Web Development 2026** entry in the program list

**Priority:** High

```gherkin
Scenario: Reject duplicate program name
  Given a program "Web Development 2026" already exists
  And I am on the program creation form
  When I fill in Program Name with "Web Development 2026"
  And I fill in Description with "Duplicate attempt — second web dev cohort"
  And I click Create
  Then I see an error indicating the name already exists
  And the program list does not contain a duplicate entry for "Web Development 2026"
```

---

### TC-008 — Duplicate error preserves entered form data

**Title:** User can correct Program Name after duplicate rejection

**Preconditions:**
- User is logged in as admin
- Program **Web Development 2026** already exists
- Program creation form is open

**Steps:**
1. Enter `Web Development 2026` in **Program Name**
2. Enter `Full-stack web development program — cohort B` in **Description**
3. Click **Create** and observe duplicate error
4. Change **Program Name** to `Web Development 2026 - Cohort B`
5. Click **Create**

**Expected result:**
- After step 3: duplicate error shown; **Description** value retained
- After step 5: **Web Development 2026 - Cohort B** created successfully

**Priority:** Medium

```gherkin
Scenario: Duplicate error retains form data for correction
  Given a program "Web Development 2026" already exists
  And I am on the program creation form
  When I fill in Program Name with "Web Development 2026"
  And I fill in Description with "Full-stack web development program — cohort B"
  And I click Create
  Then I see an error indicating the name already exists
  When I change the Program Name to "Web Development 2026 - Cohort B"
  And I click Create
  Then the program list shows "Web Development 2026 - Cohort B"
```

---

### TC-009 — Tab-only Program Name is rejected as empty

**Title:** Tab characters trimmed to empty prevent submission

**Preconditions:**
- User is logged in as admin
- Program creation form is open

**Steps:**
1. Enter `\t\t\t` (tab characters only) in **Program Name**
2. Enter `Tab-only name validation test` in **Description**
3. Click **Create**

**Expected result:** Form not submitted; no program created; validation treats name as empty

**Priority:** High

```gherkin
Scenario: Tab-only program name is rejected
  Given I am on the program creation form
  When I enter only tab characters as the program name
  And I fill in Description with "Tab-only name validation test"
  And I click Create
  Then the form is not submitted
  And no new program is added to the program list
```

---

### TC-010 — Mixed whitespace-only Program Name is rejected

**Title:** Combination of spaces and tabs treated as empty after trim

**Preconditions:**
- User is logged in as admin
- Program creation form is open

**Steps:**
1. Enter `  \t  \t  ` in **Program Name**
2. Enter `Mixed whitespace validation test` in **Description**
3. Click **Create**

**Expected result:** Form not submitted; no program created

**Priority:** Medium

```gherkin
Scenario: Mixed whitespace-only program name is rejected
  Given I am on the program creation form
  When I enter "  \t  \t  " as the program name
  And I fill in Description with "Mixed whitespace validation test"
  And I click Create
  Then the form is not submitted
  And no new program is added to the program list
```

---

### TC-011 — Duplicate name does not partially persist on API failure recovery

**Title:** Failed duplicate create leaves database unchanged

**Preconditions:**
- User is logged in as admin
- Program **Web Development 2026** already exists
- Program creation form is open

**Steps:**
1. Enter `Web Development 2026` in **Program Name**
2. Enter `Should not persist on duplicate rejection` in **Description**
3. Click **Create**
4. Refresh the Programs page

**Expected result:** Exactly one **Web Development 2026** in the list after refresh; no ghost or partial record

**Priority:** Medium

```gherkin
Scenario: Duplicate rejection does not leave partial records
  Given a program "Web Development 2026" already exists
  And I am on the program creation form
  When I fill in Program Name with "Web Development 2026"
  And I fill in Description with "Should not persist on duplicate rejection"
  And I click Create
  Then I see an error indicating the name already exists
  When I refresh the Programs page
  Then exactly one program named "Web Development 2026" exists in the program list
```

---

## Edge Cases

### TC-012 — Duplicate check is case-sensitive or case-insensitive per spec

**Title:** Casing variant of existing name follows defined duplicate rule

**Preconditions:**
- User is logged in as admin
- Program **Web Development 2026** already exists
- Program creation form is open

**Steps:**
1. Enter `web development 2026` in **Program Name**
2. Enter `Lowercase duplicate attempt` in **Description**
3. Click **Create**

**Expected result (document actual product behavior):
- Rejected as duplicate (case-insensitive match), **or**
- Accepted as distinct name (case-sensitive match)
- Behavior is consistent and documented

**Priority:** High

```gherkin
Scenario: Duplicate check casing behavior
  Given a program "Web Development 2026" already exists
  And I am on the program creation form
  When I fill in Program Name with "web development 2026"
  And I fill in Description with "Lowercase duplicate attempt"
  And I click Create
  Then I see an error indicating the name already exists
  Or the program list shows "web development 2026" if names are case-sensitive
```

---

### TC-013 — Duplicate attempt with leading/trailing spaces on new name

**Title:** Trimmed duplicate name matches existing program

**Preconditions:**
- User is logged in as admin
- Program **Web Development 2026** already exists
- Program creation form is open

**Steps:**
1. Enter `   Web Development 2026   ` in **Program Name**
2. Enter `Padded duplicate name attempt` in **Description**
3. Click **Create**

**Expected result:**
- After trim, name matches existing **Web Development 2026**
- Duplicate error shown; no second program created

**Priority:** High

```gherkin
Scenario: Duplicate detected after trimming padded program name
  Given a program "Web Development 2026" already exists
  And I am on the program creation form
  When I fill in Program Name with "   Web Development 2026   "
  And I fill in Description with "Padded duplicate name attempt"
  And I click Create
  Then I see an error indicating the name already exists
  And exactly one program named "Web Development 2026" exists in the program list
```

---

### TC-014 — Valid name with leading/trailing spaces is trimmed and created

**Title:** Non-duplicate padded name is saved without outer whitespace

**Preconditions:**
- User is logged in as admin
- Program creation form is open
- No program named **Cybersecurity Fundamentals** exists

**Steps:**
1. Enter `   Cybersecurity Fundamentals   ` in **Program Name**
2. Enter `Network security and ethical hacking basics` in **Description**
3. Click **Create**

**Expected result:** Program saved as **Cybersecurity Fundamentals** (trimmed); appears once in list

**Priority:** Medium

```gherkin
Scenario: Valid padded program name is trimmed on create
  Given I am on the program creation form
  When I fill in Program Name with "   Cybersecurity Fundamentals   "
  And I fill in Description with "Network security and ethical hacking basics"
  And I click Create
  Then the program list shows "Cybersecurity Fundamentals"
  And the program list does not show a name with leading or trailing spaces
```

---

### TC-015 — Single-character Program Name boundary

**Title:** Minimum-length Program Name is accepted or clearly rejected

**Preconditions:**
- User is logged in as admin
- Program creation form is open

**Steps:**
1. Enter `A` in **Program Name**
2. Enter `Single character name boundary test` in **Description**
3. Click **Create**

**Expected result:** Program **A** created, or validation error if minimum length > 1

**Priority:** Medium

```gherkin
Scenario: Single character program name boundary
  Given I am on the program creation form
  When I fill in Program Name with "A"
  And I fill in Description with "Single character name boundary test"
  And I click Create
  Then the program list shows "A"
  Or I see a validation message if minimum length is greater than one character
```

---

### TC-016 — Program Name at maximum allowed length

**Title:** Max-length Program Name is accepted

**Preconditions:**
- User is logged in as admin
- Program creation form is open

**Steps:**
1. Enter `Advanced Web Development and Cloud Architecture Specialization Program Track 2026 Edition Alpha` (100 characters) in **Program Name**
2. Enter `Max length name validation test` in **Description**
3. Click **Create**

**Expected result:** Program created with full name in list, or clear max-length validation if limit is lower

**Priority:** Medium

```gherkin
Scenario: Program name at maximum allowed length
  Given I am on the program creation form
  When I fill in Program Name with "Advanced Web Development and Cloud Architecture Specialization Program Track 2026 Edition Alpha"
  And I fill in Description with "Max length name validation test"
  And I click Create
  Then the program list shows the full program name
  Or I see a validation message if the name exceeds the maximum length
```

---

### TC-017 — Program Name exceeding maximum length is rejected

**Title:** Over-limit Program Name is blocked before create

**Preconditions:**
- User is logged in as admin
- Program creation form is open

**Steps:**
1. Enter a 256-character string in **Program Name**
2. Enter `Over max length validation test` in **Description**
3. Click **Create**

**Expected result:** Validation error or **Create** disabled; no program created

**Priority:** Medium

```gherkin
Scenario: Program name exceeding maximum length is rejected
  Given I am on the program creation form
  When I fill in Program Name with a string of 256 characters
  And I fill in Description with "Over max length validation test"
  And I click Create
  Then I see a validation message for Program Name
  And no new program is added to the program list
```

---

### TC-018 — Duplicate Program Name rejected on edit

**Title:** Rename to existing name is blocked during edit

**Preconditions:**
- User is logged in as admin
- Programs **Web Development 2026** and **Data Science 2026** exist
- Edit form for **Data Science 2026** is open

**Steps:**
1. Change **Program Name** to `Web Development 2026`
2. Click **Save**

**Expected result:** Error indicating name already exists; **Data Science 2026** unchanged in list

**Priority:** High

```gherkin
Scenario: Duplicate program name rejected on edit
  Given a program "Web Development 2026" already exists
  And I am editing "Data Science 2026"
  When I change the Program Name to "Web Development 2026"
  And I click Save
  Then I see an error indicating the name already exists
  And the program list still shows "Data Science 2026"
```

---

### TC-019 — Edit to unchanged own name does not trigger duplicate error

**Title:** Saving a program under its current name is allowed

**Preconditions:**
- User is logged in as admin
- Program **Web Development 2026** exists
- Edit form for **Web Development 2026** is open

**Steps:**
1. Leave **Program Name** as `Web Development 2026`
2. Change **Description** to `Updated description only`
3. Click **Save**

**Expected result:** Save succeeds; no false duplicate error against the same record

**Priority:** Medium

```gherkin
Scenario: Edit with same program name does not trigger duplicate error
  Given a program "Web Development 2026" already exists
  And I am editing "Web Development 2026"
  When I leave the Program Name as "Web Development 2026"
  And I change the Description to "Updated description only"
  And I click Save
  Then the modal closes
  And I do not see an error indicating the name already exists
```

---

### TC-020 — Emoji in Program Name is handled consistently

**Title:** Emoji in name passes or fails validation with clear feedback

**Preconditions:**
- User is logged in as admin
- Program creation form is open

**Steps:**
1. Enter `Cloud Computing 2026 🎓` in **Program Name**
2. Enter `Cloud platforms and DevOps` in **Description**
3. Click **Create**

**Expected result:** Program created with emoji preserved, or validation error if emoji disallowed

**Priority:** Low

```gherkin
Scenario: Emoji in program name validation
  Given I am on the program creation form
  When I fill in Program Name with "Cloud Computing 2026 🎓"
  And I fill in Description with "Cloud platforms and DevOps"
  And I click Create
  Then the program list shows "Cloud Computing 2026 🎓"
  Or I see a validation message if emoji are not allowed in program names
```

---

### TC-021 — HTML/script characters in Program Name are sanitized

**Title:** Malicious characters in name do not execute in UI

**Preconditions:**
- User is logged in as admin
- Program creation form is open

**Steps:**
1. Enter `<script>alert('xss')</script>` in **Program Name**
2. Enter `Security validation test` in **Description**
3. Click **Create** (if allowed)
4. View the program in the list

**Expected result:**
- No script execution in browser
- Name stored/displayed escaped or rejected with validation message

**Priority:** Medium

```gherkin
Scenario: HTML in program name is sanitized or rejected
  Given I am on the program creation form
  When I fill in Program Name with "<script>alert('xss')</script>"
  And I fill in Description with "Security validation test"
  And I click Create
  Then no script is executed in the browser
  And I see a validation message
  Or the program list shows the name as escaped text
```

---

### TC-022 — Double-click Create does not bypass duplicate check

**Title:** Rapid duplicate submissions create at most one rejected attempt

**Preconditions:**
- User is logged in as admin
- Program **Web Development 2026** already exists
- Program creation form is open

**Steps:**
1. Enter `Web Development 2026` in **Program Name**
2. Enter `Double-click duplicate test` in **Description**
3. Double-click **Create** quickly

**Expected result:**
- Duplicate error shown
- Exactly one **Web Development 2026** remains in the program list

**Priority:** Medium

```gherkin
Scenario: Double submit on duplicate name does not create extra records
  Given a program "Web Development 2026" already exists
  And I am on the program creation form
  When I fill in Program Name with "Web Development 2026"
  And I fill in Description with "Double-click duplicate test"
  And I double-click Create
  Then I see an error indicating the name already exists
  And exactly one program named "Web Development 2026" exists in the program list
```

---

## Coverage Matrix

| Acceptance criterion | Test cases |
|----------------------|------------|
| Whitespace-only name trimmed and rejected | TC-005, TC-009, TC-010 |
| Special characters in name accepted | TC-002, TC-003, TC-004 |
| Duplicate name on create rejected with error | TC-007, TC-008, TC-011, TC-013, TC-022 |

---

## Ambiguities and Gaps in the Acceptance Criteria

1. **Create vs edit scope** — ACs cover create only; duplicate prevention on edit is implied by the feature title but not specified (TC-018, TC-019).

2. **Whitespace trim timing** — AC states name is trimmed and treated as empty but does not say whether trim happens on blur, on submit, or continuously (TC-005, TC-014).

3. **Error presentation** — AC requires an error for duplicates but does not specify inline field error, toast, or modal banner (TC-007).

4. **Exact duplicate error message** — Wording ("name already exists" vs "Program Name must be unique") is not defined.

5. **Case sensitivity** — No rule for `Web Development 2026` vs `web development 2026` (TC-012).

6. **Leading/trailing spaces on valid names** — AC covers whitespace-only; behavior for padded but otherwise valid names is unspecified (TC-013, TC-014).

7. **Character allowlist** — AC shows `&` and `-` as allowed; full set of permitted special characters is not listed (TC-003, TC-020, TC-021).

8. **Max/min length** — No length constraints in AC (TC-015, TC-016, TC-017).

9. **Description required?** — AC says "fill other required fields" but does not name **Description** or empty-Description behavior.

10. **Create button state** — Unclear whether **Create** is disabled for whitespace-only names or only blocked on click (TC-005 vs TC-006).

11. **Unicode normalization** — Visually similar characters (e.g. full-width vs half-width) and NFC/NFD duplicates are not addressed.

12. **Concurrent duplicate creation** — Two admins creating the same name simultaneously is not covered.

13. **Login / role** — Admin role assumed from related tickets; non-admin validation bypass is not in AC.

14. **Persistence after duplicate error** — Whether form values are retained after duplicate rejection is unspecified (TC-008).

15. **Trim characters** — Only spaces shown in AC example; tabs, newlines, and non-breaking spaces are not explicitly listed (TC-009, TC-010).
