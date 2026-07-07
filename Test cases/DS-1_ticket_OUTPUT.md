# DS-1 — Test Plan: Create New Academic Program

**Jira:** [DS-1](https://legionqaschool.atlassian.net/browse/DS-1) — Create new academic program  
**Status:** To Do  
**Source:** DS-1 (Jira) + Confluence Program Setup docs + live app exploration (`https://test.didaxis.studio`)  
**Scope:** Program creation modal (`Program Name`, `Description`, optional AI Generation Config), Programs page, admin access

---

## Jira Acceptance Criteria

**User story:** As an admin user, I want to create a new academic program so that I can begin designing its curriculum structure.

```gherkin
Scenario: Navigate to program creation form
  Given I am logged in as admin
  When I navigate to the Programs page
  And I click "+ New Program"
  Then I see the program creation form with fields: Program Name, Description

Scenario: Successfully create a program
  Given I am on the program creation form
  When I fill in Program Name with "Web Development 2026"
  And I fill in Description with "Full-stack web development program"
  And I click Create
  Then the modal closes
  And the program list shows "Web Development 2026"

Scenario: Validation prevents empty program name
  Given I am on the program creation form
  When I leave the Program Name field empty
  Then the Create button is disabled
```

---

## Confluence Evidence (Atlassian MCP)

Pulled via Atlassian MCP from the DS Confluence space:

### Architecture Overview
- Didaxis Studio uses a **three-layer model**: Session Templates (curriculum) → Scheduled Sessions (calendar) → Assignments (student deliverables).
- Key invariants: calendar is the live data source; MANUAL/LOCKED sessions are immovable; validation debounced at 500ms; generator is deterministic.
- **Relevance to DS-1:** Programs are the top-level entity that anchors curriculum structure before semesters/courses/sessions are added.

### Program Setup — Field Definitions
- **Program Name:** required, max **100 characters**, unique per organization (spec).
- **Description:** optional, max **500 characters**.
- Create/edit modals always show Program Name + Description; **AI Generation Config** is a collapsible section (Total Hours, Default Session/Exam Hours, Target Audience, Focus Areas, Sync/Async Ratio default 70%).
- Create button disabled when Program Name is empty; name trimmed on submit per spec.

### Program Setup — Validation Rules
- Client: empty or whitespace-only name → Create disabled / no submission.
- Server (spec): duplicate name → 400/409; name >100 chars → 400; description >500 chars → 400.

### App vs spec gaps (open defects — tests fail until fixed)
| Spec requirement | Defect | Test | Jira |
|---|---|---|---|
| Unique program name | Duplicates allowed, no error | TC-009 L146 | [DS-133](https://legionqaschool.atlassian.net/browse/DS-133) |
| Name max 100 chars | Names >100 accepted | TC-013 L218 | [DS-134](https://legionqaschool.atlassian.net/browse/DS-134) |
| Name trimmed on submit | Spaces preserved | TC-018 L289 | [DS-135](https://legionqaschool.atlassian.net/browse/DS-135) |
| Single submit per create | Double-click creates 2 | TC-021 L332 | [DS-136](https://legionqaschool.atlassian.net/browse/DS-136) |

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

**Expected result:** Program creation modal opens with **Program Name** (placeholder `e.g. Computer Science BSc`), **Description** (placeholder `Brief description`), **Cancel**, disabled **Create**, and collapsible **▸ Show AI Generation Config** section

**Priority:** High

```gherkin
Scenario: Navigate to program creation form
  Given I am logged in as admin
  When I navigate to the Programs page
  And I click "+ New Program"
  Then I see the program creation form with fields: Program Name, Description
  And the Create button is disabled
  And I see a collapsible "Show AI Generation Config" section
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
- Program list includes **Web Development 2026** in the first table cell
- Description appears as a second line under the program name in the same cell

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

### TC-009 — Duplicate program name is rejected (Confluence Validation Rules)

**Title:** Creating a program with an existing name shows validation error and does not duplicate

**Preconditions:**
- User is logged in as admin
- A program with the target name already exists

**Steps:**
1. Create a program with a unique name
2. Open program creation form again
3. Enter the **same Program Name** and a different **Description**
4. Click **Create**

**Expected result (per Confluence Program Setup — Validation Rules):**
- Server returns 400/409
- User sees a duplicate-name validation or error message
- Program list contains **exactly one** entry for that name

**Priority:** High

```gherkin
Scenario: Duplicate program name is rejected
  Given I am logged in as admin
  And a program with a given name already exists
  And I am on the program creation form
  When I fill in Program Name with the existing name
  And I fill in Description with "Duplicate attempt description"
  And I click Create
  Then the program list contains exactly one entry with that name
  And I see a duplicate-name validation or error message
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

### TC-012 — Program Name at maximum allowed length (100 characters)

**Title:** Program Name at 100 characters is accepted

**Preconditions:**
- User is logged in as admin
- Program creation form is open
- Max length for Program Name is **100 characters** (Confluence Field Definitions)

**Steps:**
1. Enter a unique 100-character Program Name
2. Enter `Max length name test` in **Description**
3. Click **Create**

**Expected result:** Program is created with full name visible in list

**Priority:** Medium

```gherkin
Scenario: Program name at maximum allowed length
  Given I am logged in as admin
  And I am on the program creation form
  When I fill in Program Name with a unique string of 100 characters
  And I fill in Description with "Max length name test"
  And I click Create
  Then the modal closes
  And the program list shows the full program name
```

---

### TC-013 — Program Name exceeding 100 characters is rejected

**Title:** Over-max Program Name is blocked with validation error

**Preconditions:**
- User is logged in as admin
- Program creation form is open

**Steps:**
1. Enter a Program Name longer than 100 characters
2. Enter `Over max length test` in **Description**
3. Click **Create**

**Expected result (Confluence Validation Rules):**
- Program is **not** created
- Validation error shown (max 100 characters)

**Priority:** Medium

```gherkin
Scenario: Program name exceeding 100 characters is rejected
  Given I am logged in as admin
  And I am on the program creation form
  When I fill in Program Name with a string longer than 100 characters
  And I fill in Description with "Over max length test"
  And I click Create
  Then the program list does not show the over-length name
  And I see a validation message for Program Name
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

**Expected result (observed on test.didaxis.studio):**
- **Description is optional:** Create enabled when name is filled
- Program created; list shows program name only (no description line when empty)

**Priority:** High

```gherkin
Scenario: Empty description is allowed
  Given I am logged in as admin
  And I am on the program creation form
  When I fill in Program Name with "Mobile App Development 2026"
  And I leave the Description field empty
  Then the Create button is enabled
  When I click Create
  Then the modal closes
  And the program list shows "Mobile App Development 2026"
```

---

### TC-015 — Description at maximum allowed length

**Title:** Long Description is stored correctly

**Preconditions:**
- User is logged in as admin
- Program creation form is open

**Steps:**
1. Enter `UX Design Bootcamp` in **Program Name**
2. Enter a 500-character Description (Confluence max)
3. Click **Create**

**Expected result:** Program created; Description stored without silent truncation (or validation if over limit)

**Priority:** Low

```gherkin
Scenario: Description at maximum allowed length
  Given I am logged in as admin
  And I am on the program creation form
  When I fill in Program Name with "UX Design Bootcamp"
  And I fill in Description with a string of 500 characters
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

**Expected result (Confluence Field Definitions — trimmed on submit):**
- Stored name is **trimmed** to `Web Development 2026` (no leading/trailing spaces)
- Padded name does **not** appear as a separate list entry

**Priority:** Medium

```gherkin
Scenario: Leading and trailing whitespace in program name is trimmed
  Given I am logged in as admin
  And I am on the program creation form
  When I fill in Program Name with "   Web Development 2026   "
  And I fill in Description with "Whitespace trimming test"
  And I click Create
  Then the program list shows "Web Development 2026"
  And the program list does not show the name with leading or trailing spaces
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

**Expected result:** Exactly one **Cloud Computing 2026** entry in the program list (Create disabled or guarded during submit)

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

### TC-023 — AI Generation Config section expands and collapses

**Title:** Collapsible AI config reveals optional generation fields

**Preconditions:**
- User is logged in as admin
- Program creation form is open

**Steps:**
1. Click **▸ Show AI Generation Config**
2. Observe expanded fields
3. Click **▾ Hide AI Generation Config**

**Expected result:**
- Expanded section shows Total Program Hours, Default Session Hours (default 4), Default Exam Hours (default 3), Target Audience, Focus Areas, Sync/Async Ratio slider (70% default)
- Toggle button label switches between **Show** and **Hide AI Generation Config**

**Priority:** Medium

```gherkin
Scenario: AI Generation Config toggles visibility
  Given I am logged in as admin
  And I am on the program creation form
  When I click "Show AI Generation Config"
  Then I see Total Program Hours and Default Session Hours fields
  When I click "Hide AI Generation Config"
  Then the toggle shows "Show AI Generation Config"
```

---

### TC-024 — Programs page table layout

**Title:** Program list shows name and description in a single Program column

**Preconditions:**
- User is logged in as admin
- Programs page is open

**Steps:**
1. Observe page heading and **+ New Program** button
2. Create a program with name and description
3. Inspect the table row

**Expected result:**
- Table has a **Program** column header
- Row first cell shows program name (paragraph) and description (second paragraph when provided)
- Edit/Delete icon buttons appear in the actions cell

**Priority:** Medium

```gherkin
Scenario: Program list table layout
  Given I am logged in as admin
  When I navigate to the Programs page
  Then I see a "Programs" heading and a "+ New Program" button
  And I see a table with a "Program" column
  When I create a program with a name and description
  Then the program name and description appear in the first table cell
```

---

### TC-025 — Modal X button closes without saving

**Title:** Header close button discards unsaved data

**Preconditions:**
- User is logged in as admin
- Program creation form is open with data entered

**Steps:**
1. Fill **Program Name** with `X Close Draft`
2. Click the **X** button in the modal header

**Expected result:** Modal closes; program is not created

**Priority:** Medium

```gherkin
Scenario: Modal X button closes without saving
  Given I am logged in as admin
  And I am on the program creation form
  When I fill in Program Name with "X Close Draft"
  And I click the modal close button
  Then the modal closes
  And the program list does not show "X Close Draft"
```

---

### TC-026 — Program without description shows name-only row

**Title:** Empty description omits second line in list cell

**Preconditions:**
- User is logged in as admin
- Program creation form is open

**Steps:**
1. Enter a unique program name
2. Leave **Description** empty
3. Click **Create**

**Expected result:** Program row shows only the name paragraph (no description line)

**Priority:** Low

```gherkin
Scenario: Program without description shows name only
  Given I am logged in as admin
  And I am on the program creation form
  When I fill in Program Name with a unique name
  And I leave Description empty
  And I click Create
  Then the program list row shows only the program name
```

---

## Coverage Matrix

| Acceptance criterion | Test cases |
|----------------------|------------|
| Navigate to form; fields visible | TC-001, TC-023, TC-024 |
| Successful create; modal closes; list updated | TC-002, TC-003, TC-004, TC-024, TC-026 |
| Empty Program Name → Create disabled | TC-005, TC-006, TC-019 |

---

## Ambiguities and Gaps in the Acceptance Criteria

1. **Description required?** AC only validates empty **Program Name**. App allows empty Description (TC-014, TC-026); Confluence confirms optional.

2. **Field constraints** — Confluence defines max 100/500 chars; app currently accepts longer values (TC-012, TC-013, TC-015).

3. **Duplicate names** — Confluence expects server rejection; app allows duplicates without error (TC-009). Known bugs: DS-12, DS-13, SS-25.

4. **Modal dismiss behavior** — Cancel, X, and Escape discard unsaved data (TC-008, TC-025).

5. **Success feedback** — No toast; list updates in place without reload (TC-004).

6. **Description visibility** — Description shown as second paragraph in Program table cell when provided (TC-002, TC-024).

7. **Authorization scope** — AC states admin; non-admin blocked when credentials available (TC-007).

8. **Error handling** — API failures keep modal open with entered values (TC-010).

9. **Create button state** — Disabled for empty/whitespace-only name; not disabled during in-flight submit (TC-021).

10. **UI labels** — Button is **+ New Program**; modal title **New Program**; dialog role `New Program`.

11. **AI Generation Config** — Collapsible optional section not mentioned in Jira AC (TC-023).

12. **Spec vs app** — Name trim, uniqueness, and max-length differ from Confluence (see table above).
