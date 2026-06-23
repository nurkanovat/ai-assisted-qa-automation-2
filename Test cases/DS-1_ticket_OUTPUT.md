# DS-1 — Test Plan: Create New Academic Program

**Feature:** Create new academic program  
**Source:** DS-1_ticket_INPUT  
**Scope:** Program creation modal (`Program Name`, `Description`), Programs page, admin access

---

## Positive Flows

### TC-001 — Program creation form displays required fields

**Title:** Admin sees Program Name and Description on the creation form

**Preconditions:**
- User is logged in as admin
- Programs page is available

**Steps:**
1. Navigate to the Programs page
2. Click **+ New Program**

**Expected result:** Program creation form (modal) opens with **Program Name** and **Description** fields visible and editable

**Priority:** High

```gherkin
Scenario: Navigate to program creation form
  Given I am logged in as admin
  When I navigate to the Programs page
  And I click "+ New Program"
  Then I see the program creation form with fields: Program Name, Description
```

---

### TC-002 — Program is created and appears in the list

**Title:** Valid program is saved and shown in the program list

**Preconditions:**
- User is logged in as admin
- Program creation form is open

**Steps:**
1. Enter `Web Development 2026` in **Program Name**
2. Enter `Full-stack web development program` in **Description**
3. Click **Create**

**Expected result:**
- Modal closes
- Program list includes **Web Development 2026**
- Description is stored (visible in list or detail if the UI shows it)

**Priority:** High

```gherkin
Scenario: Successfully create a program
  Given I am on the program creation form
  When I fill in Program Name with "Web Development 2026"
  And I fill in Description with "Full-stack web development program"
  And I click Create
  Then the modal closes
  And the program list shows "Web Development 2026"
```

---

### TC-003 — Program can be created with description only populated alongside valid name

**Title:** Program is created when both fields contain valid text

**Preconditions:**
- User is logged in as admin
- Program creation form is open

**Steps:**
1. Enter `Data Science 2026` in **Program Name**
2. Enter `Introduction to statistics and machine learning` in **Description**
3. Click **Create**

**Expected result:** Modal closes; **Data Science 2026** appears in the program list

**Priority:** Medium

```gherkin
Scenario: Create program with descriptive text in both fields
  Given I am logged in as admin
  And I am on the program creation form
  When I fill in Program Name with "Data Science 2026"
  And I fill in Description with "Introduction to statistics and machine learning"
  And I click Create
  Then the modal closes
  And the program list shows "Data Science 2026"
```

---

### TC-004 — New program appears without full page reload

**Title:** Program list updates immediately after successful creation

**Preconditions:**
- User is logged in as admin
- Programs page is open with the creation form visible

**Steps:**
1. Note the current program list
2. Fill **Program Name** with `Cybersecurity Fundamentals`
3. Fill **Description** with `Network security and ethical hacking basics`
4. Click **Create**

**Expected result:** **Cybersecurity Fundamentals** appears in the list without navigating away from the Programs page

**Priority:** Medium

```gherkin
Scenario: Program list updates in place after creation
  Given I am logged in as admin
  And I am on the Programs page
  And I am on the program creation form
  When I fill in Program Name with "Cybersecurity Fundamentals"
  And I fill in Description with "Network security and ethical hacking basics"
  And I click Create
  Then the modal closes
  And the program list on the Programs page shows "Cybersecurity Fundamentals"
```

---

## Negative Flows

### TC-005 — Create is disabled when Program Name is empty

**Title:** Empty Program Name prevents submission

**Preconditions:**
- User is logged in as admin
- Program creation form is open

**Steps:**
1. Leave **Program Name** empty
2. Optionally fill **Description** with `Some description`
3. Observe the **Create** button

**Expected result:** **Create** button is disabled; no program is created

**Priority:** High

```gherkin
Scenario: Validation prevents empty program name
  Given I am on the program creation form
  When I leave the Program Name field empty
  Then the Create button is disabled
```

---

### TC-006 — Program is not created when Create cannot be clicked

**Title:** Empty name does not create a program via UI

**Preconditions:**
- User is logged in as admin
- Program creation form is open

**Steps:**
1. Leave **Program Name** empty
2. Fill **Description** with `Orphan description without a program name`
3. Attempt to click **Create** (if possible via keyboard or forced interaction)

**Expected result:**
- Program is not created
- **Orphan description without a program name** does not appear anywhere in the program list
- Modal remains open or submission is blocked

**Priority:** High

```gherkin
Scenario: Empty program name does not create a program
  Given I am logged in as admin
  And I am on the program creation form
  When I leave the Program Name field empty
  And I fill in Description with "Orphan description without a program name"
  And I attempt to submit the form
  Then no new program is added to the program list
  And the program list does not show "Orphan description without a program name"
```

---

### TC-007 — Non-admin cannot open or use program creation

**Title:** Non-admin users cannot create programs

**Preconditions:**
- User is logged in as a non-admin role (e.g. instructor or student)
- Programs page may or may not be visible per permissions

**Steps:**
1. Navigate to the Programs page (if accessible)
2. Look for **+ New Program**
3. If visible, attempt to open the form and create a program

**Expected result:**
- **+ New Program** is hidden or disabled, **or**
- Access is denied (403 / redirect / error message)
- No program is created

**Priority:** High

```gherkin
Scenario: Non-admin cannot create a program
  Given I am logged in as a non-admin user
  When I navigate to the Programs page
  Then I do not see an enabled "+ New Program" action
  Or I see an access denied message when attempting to create a program
```

---

### TC-008 — Closing modal without saving does not create a program

**Title:** Cancel/close discards unsaved program data

**Preconditions:**
- User is logged in as admin
- Program creation form is open

**Steps:**
1. Fill **Program Name** with `Unsaved Program Draft`
2. Fill **Description** with `This should not be persisted`
3. Close the modal (Cancel, X, or Escape — per UI)

**Expected result:**
- Modal closes
- **Unsaved Program Draft** does not appear in the program list

**Priority:** Medium

```gherkin
Scenario: Closing the modal without saving does not create a program
  Given I am logged in as admin
  And I am on the program creation form
  When I fill in Program Name with "Unsaved Program Draft"
  And I fill in Description with "This should not be persisted"
  And I close the program creation modal without saving
  Then the modal closes
  And the program list does not show "Unsaved Program Draft"
```

---

### TC-009 — Duplicate program name is rejected or handled consistently

**Title:** Creating a program with an existing name does not silently duplicate

**Preconditions:**
- User is logged in as admin
- A program named **Web Development 2026** already exists

**Steps:**
1. Open program creation form
2. Enter **Web Development 2026** in **Program Name**
3. Enter `Duplicate attempt description` in **Description**
4. Click **Create**

**Expected result (one of — document actual product behavior):
- Error message indicating duplicate name, **or**
- Create blocked with validation message, **or**
- Duplicate allowed but clearly distinguished (if product allows duplicates)

Program list behavior must match the defined business rule

**Priority:** High

```gherkin
Scenario: Duplicate program name is handled per business rules
  Given I am logged in as admin
  And a program named "Web Development 2026" already exists
  And I am on the program creation form
  When I fill in Program Name with "Web Development 2026"
  And I fill in Description with "Duplicate attempt description"
  And I click Create
  Then the system responds with a clear validation or error message
  And the program list does not contain an unintended duplicate entry
```

---

### TC-010 — Server/API failure does not show false success

**Title:** Failed create shows error and keeps data recoverable

**Preconditions:**
- User is logged in as admin
- Program creation form is open
- Backend create endpoint is unavailable or returns an error (simulated)

**Steps:**
1. Fill **Program Name** with `API Failure Test Program`
2. Fill **Description** with `Testing error handling`
3. Click **Create** while the API fails

**Expected result:**
- Modal does not close with a false success state
- User sees an error message
- **API Failure Test Program** does not appear in the list
- Entered values remain editable so the user can retry

**Priority:** Medium

```gherkin
Scenario: API failure during program creation shows error
  Given I am logged in as admin
  And I am on the program creation form
  And the program creation API will fail
  When I fill in Program Name with "API Failure Test Program"
  And I fill in Description with "Testing error handling"
  And I click Create
  Then I see an error message indicating creation failed
  And the modal does not close as if creation succeeded
  And the program list does not show "API Failure Test Program"
```

---

## Edge Cases

### TC-011 — Minimum valid Program Name (single character)

**Title:** Single-character Program Name is accepted if within rules

**Preconditions:**
- User is logged in as admin
- Program creation form is open

**Steps:**
1. Enter `A` in **Program Name**
2. Enter `Single character name test` in **Description**
3. Click **Create**

**Expected result:** Program **A** is created and appears in the list (or validation error if min length > 1)

**Priority:** Medium

```gherkin
Scenario: Minimum length program name boundary
  Given I am logged in as admin
  And I am on the program creation form
  When I fill in Program Name with "A"
  And I fill in Description with "Single character name test"
  And I click Create
  Then the program list shows "A"
  Or I see a validation message if minimum length is greater than one character
```

---

### TC-012 — Program Name at maximum allowed length

**Title:** Program Name at max length is accepted or clearly rejected

**Preconditions:**
- User is logged in as admin
- Program creation form is open
- Max length for Program Name is known (e.g. 100 characters — adjust to spec)

**Steps:**
1. Enter a 100-character name: `Advanced Web Development and Cloud Architecture Specialization Program Track 2026 Edition Alpha`
2. Enter `Max length name test` in **Description**
3. Click **Create**

**Expected result:** Program is created with full name visible in list, or clear max-length validation if 100 exceeds limit

**Priority:** Medium

```gherkin
Scenario: Program name at maximum allowed length
  Given I am logged in as admin
  And I am on the program creation form
  When I fill in Program Name with "Advanced Web Development and Cloud Architecture Specialization Program Track 2026 Edition Alpha"
  And I fill in Description with "Max length name test"
  And I click Create
  Then the modal closes
  And the program list shows the full program name
  Or I see a validation message if the name exceeds the maximum length
```

---

### TC-013 — Program Name exceeds maximum length

**Title:** Over-max Program Name is blocked

**Preconditions:**
- User is logged in as admin
- Program creation form is open

**Steps:**
1. Enter a 256-character Program Name (or one character beyond documented max)
2. Enter `Over max length test` in **Description**
3. Attempt to click **Create**

**Expected result:**
- **Create** disabled or validation error shown
- No truncated program saved without user awareness

**Priority:** Medium

```gherkin
Scenario: Program name exceeding maximum length is rejected
  Given I am logged in as admin
  And I am on the program creation form
  When I fill in Program Name with a string of 256 characters
  And I fill in Description with "Over max length test"
  And I click Create
  Then I see a validation message for Program Name
  And no new program is added to the program list
```

---

### TC-014 — Empty Description is allowed or rejected consistently

**Title:** Empty Description behavior is defined and enforced

**Preconditions:**
- User is logged in as admin
- Program creation form is open

**Steps:**
1. Enter `Mobile App Development 2026` in **Program Name**
2. Leave **Description** empty
3. Observe **Create** button and submit if enabled

**Expected result (per spec):
- If optional: program created; list shows **Mobile App Development 2026**
- If required: **Create** disabled or validation error; program not created

**Priority:** High

```gherkin
Scenario: Empty description boundary behavior
  Given I am logged in as admin
  And I am on the program creation form
  When I fill in Program Name with "Mobile App Development 2026"
  And I leave the Description field empty
  Then the Create button is disabled
  Or I can click Create and the program list shows "Mobile App Development 2026"
```

---

### TC-015 — Description at maximum allowed length

**Title:** Long Description is stored correctly

**Preconditions:**
- User is logged in as admin
- Program creation form is open

**Steps:**
1. Enter `UX Design Bootcamp` in **Program Name**
2. Enter a 2000-character Description (or documented max)
3. Click **Create**

**Expected result:** Program created; Description stored without silent truncation (or validation if over limit)

**Priority:** Low

```gherkin
Scenario: Description at maximum allowed length
  Given I am logged in as admin
  And I am on the program creation form
  When I fill in Program Name with "UX Design Bootcamp"
  And I fill in Description with a string of 2000 characters
  And I click Create
  Then the modal closes
  And the program list shows "UX Design Bootcamp"
```

---

### TC-016 — Special characters in Program Name

**Title:** Program Name with special characters is handled safely

**Preconditions:**
- User is logged in as admin
- Program creation form is open

**Steps:**
1. Enter `C++ & C# Programming (2026)` in **Program Name**
2. Enter `Languages: C++, C#, and scripting` in **Description**
3. Click **Create**

**Expected result:**
- Program created and displayed as `C++ & C# Programming (2026)` (no encoding corruption)
- No script execution or broken HTML in UI

**Priority:** Medium

```gherkin
Scenario: Special characters in program name and description
  Given I am logged in as admin
  And I am on the program creation form
  When I fill in Program Name with "C++ & C# Programming (2026)"
  And I fill in Description with "Languages: C++, C#, and scripting"
  And I click Create
  Then the modal closes
  And the program list shows "C++ & C# Programming (2026)"
```

---

### TC-017 — Unicode and emoji in fields

**Title:** Unicode Program Name and Description render correctly

**Preconditions:**
- User is logged in as admin
- Program creation form is open

**Steps:**
1. Enter `日本語プログラム 2026` in **Program Name**
2. Enter `Multilingual curriculum 🎓` in **Description**
3. Click **Create**

**Expected result:** Program **日本語プログラム 2026** appears correctly in the list; emoji preserved in Description

**Priority:** Low

```gherkin
Scenario: Unicode and emoji in program fields
  Given I am logged in as admin
  And I am on the program creation form
  When I fill in Program Name with "日本語プログラム 2026"
  And I fill in Description with "Multilingual curriculum 🎓"
  And I click Create
  Then the modal closes
  And the program list shows "日本語プログラム 2026"
```

---

### TC-018 — Leading and trailing whitespace in Program Name

**Title:** Whitespace-only or trimmed names behave per spec

**Preconditions:**
- User is logged in as admin
- Program creation form is open

**Steps:**
1. Enter `   Web Development 2026   ` (leading/trailing spaces) in **Program Name**
2. Fill **Description** with `Whitespace trimming test`
3. Click **Create**

**Expected result (document actual behavior):
- Trimmed to `Web Development 2026`, **or**
- Stored with spaces as entered
- No duplicate confusion with existing **Web Development 2026**

**Priority:** Medium

```gherkin
Scenario: Leading and trailing whitespace in program name
  Given I am logged in as admin
  And I am on the program creation form
  When I fill in Program Name with "   Web Development 2026   "
  And I fill in Description with "Whitespace trimming test"
  And I click Create
  Then the program list shows "Web Development 2026"
  Or the program list shows the name exactly as entered including spaces
```

---

### TC-019 — Program Name with only whitespace

**Title:** Whitespace-only Program Name is treated as empty

**Preconditions:**
- User is logged in as admin
- Program creation form is open

**Steps:**
1. Enter `     ` (spaces only) in **Program Name**
2. Fill **Description** with `Whitespace only name test`
3. Observe **Create** button

**Expected result:** **Create** disabled or validation error; no program created

**Priority:** High

```gherkin
Scenario: Whitespace-only program name is rejected
  Given I am logged in as admin
  And I am on the program creation form
  When I fill in Program Name with "     "
  And I fill in Description with "Whitespace only name test"
  Then the Create button is disabled
  Or I see a validation message for Program Name
  And no new program is added to the program list
```

---

### TC-020 — HTML/script injection in Description

**Title:** Malicious input in Description does not execute in UI

**Preconditions:**
- User is logged in as admin
- Program creation form is open

**Steps:**
1. Enter `Security Test Program` in **Program Name**
2. Enter `<script>alert('xss')</script>` in **Description**
3. Click **Create**
4. View the program in the list/detail

**Expected result:**
- No script execution
- Content escaped or sanitized in display
- Program **Security Test Program** may still be created if input is sanitized server-side

**Priority:** Medium

```gherkin
Scenario: HTML injection in description is sanitized
  Given I am logged in as admin
  And I am on the program creation form
  When I fill in Program Name with "Security Test Program"
  And I fill in Description with "<script>alert('xss')</script>"
  And I click Create
  Then no script is executed in the browser
  And the program list shows "Security Test Program"
```

---

### TC-021 — Double-click Create does not create duplicate programs

**Title:** Repeated Create clicks do not duplicate the same program

**Preconditions:**
- User is logged in as admin
- Program creation form is open

**Steps:**
1. Enter `Cloud Computing 2026` in **Program Name**
2. Enter `AWS and Azure fundamentals` in **Description**
3. Double-click **Create** quickly

**Expected result:** Exactly one **Cloud Computing 2026** entry in the program list

**Priority:** Medium

```gherkin
Scenario: Double submit does not create duplicate programs
  Given I am logged in as admin
  And I am on the program creation form
  When I fill in Program Name with "Cloud Computing 2026"
  And I fill in Description with "AWS and Azure fundamentals"
  And I double-click Create
  Then the modal closes
  And exactly one program named "Cloud Computing 2026" exists in the program list
```

---

### TC-022 — Newline characters in Description

**Title:** Multi-line Description is preserved

**Preconditions:**
- User is logged in as admin
- Program creation form is open

**Steps:**
1. Enter `DevOps Pipeline Program` in **Program Name**
2. Enter multi-line Description:
   ```
   Week 1: CI/CD basics
   Week 2: Kubernetes
   Week 3: Monitoring
   ```
3. Click **Create**

**Expected result:** Program created; line breaks preserved in stored/displayed Description

**Priority:** Low

```gherkin
Scenario: Multi-line description is preserved
  Given I am logged in as admin
  And I am on the program creation form
  When I fill in Program Name with "DevOps Pipeline Program"
  And I fill in Description with "Week 1: CI/CD basics\nWeek 2: Kubernetes\nWeek 3: Monitoring"
  And I click Create
  Then the modal closes
  And the program list shows "DevOps Pipeline Program"
```

---

## Coverage Matrix

| Acceptance criterion | Test cases |
|----------------------|------------|
| Navigate to form; fields visible | TC-001 |
| Successful create; modal closes; list updated | TC-002, TC-004 |
| Empty Program Name → Create disabled | TC-005, TC-006, TC-019 |

---

## Ambiguities and Gaps in the Acceptance Criteria

1. **Description required?** AC only validates empty **Program Name**. Whether **Description** is optional, required, or has its own validation is unspecified (TC-014).

2. **Field constraints missing** — No max/min length, character set, or trim rules for **Program Name** or **Description** (TC-011–TC-013, TC-015, TC-018, TC-019).

3. **Duplicate names** — No rule for duplicate **Program Name** (TC-009).

4. **Modal dismiss behavior** — Cancel, Escape, click-outside, and unsaved-data handling are not defined (TC-008).

5. **Success feedback** — AC says modal closes and list updates, but not toast/message, sort order, or default list position for new programs.

6. **Description visibility** — AC does not say whether **Description** appears in the list, detail view, or tooltip after create.

7. **Authorization scope** — "Logged in as admin" is stated; non-admin behavior and role matrix are not in AC (TC-007).

8. **Error handling** — Network/API failures, timeout, and retry behavior are not covered in AC (TC-010).

9. **Create button state** — AC only covers empty name; unclear if disabled during submit, after validation errors, or when only whitespace is entered.

10. **UI labels and actions** — Assumed labels **+ New Program**, **Create**, and modal pattern; cancel button label and alternate entry points (URL deep link) not specified.

11. **Data persistence** — No AC for refresh persistence, edit/delete after create, or audit fields (created by, created at).

12. **Concurrent creation** — Two admins creating the same name at the same time is not addressed.
