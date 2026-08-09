# DS-3 — Test Plan: Program Name Validation and Duplicate Prevention

**Jira:** [DS-3](https://legionqaschool.atlassian.net/browse/DS-3) — Program name validation and duplicate prevention  
**Status:** To Do · **Priority:** Medium  
**Sources:** DS-3 (Jira) + Confluence Program Setup docs (Field Definitions, Validation Rules, UI Behavior) + live app exploration (`https://test.didaxis.studio`)  
**Scope:** **Program Name** validation on create (and related duplicate checks), New Program modal, Programs page, admin access

---

## Jira Acceptance Criteria

**User story:** As an admin user, I want the system to prevent invalid or duplicate program names so that data integrity is maintained.

```gherkin
Scenario: Reject program name with only whitespace
  Given I am on the program creation form
  When I enter "   " as the program name
  And I click Create
  Then the form is not submitted (name is trimmed, treated as empty)

Scenario: Accept program name with special characters
  Given I am on the program creation form
  When I enter "Informatique & IA - Niveau 2" as the program name
  And I fill other required fields
  And I click Create
  Then the program is created successfully

Scenario: Reject duplicate program name
  Given a program "Web Development 2026" already exists
  When I try to create a new program with the same name
  Then I see an error indicating the name already exists
```

---

## Confluence Evidence (Atlassian MCP)

Pulled from the DS Confluence space:

### Program Setup — Field Definitions
- **Program Name:** required, max **100 characters**, unique per organization
- **Description:** optional, max **500 characters**
- Create button disabled when Program Name is empty; name trimmed on submit
- Create/edit modals always show Program Name + Description; AI Generation Config is collapsible

### Program Setup — Validation Rules
- Client: empty name → Create/Save disabled; whitespace-only → trimmed, submission blocked, modal stays open
- Server: duplicate name → 400/409 with error displayed; name >100 → 400; description >500 → 400

### Program Setup — UI Behavior
- Programs page (`/programs`): “Programs” title, “+ New Program”, table with name/description/edit/delete
- After create/edit/delete the list must refresh in place (no manual reload)
- On create failure: error displayed; modal remains for correction

### Live app observations (`https://test.didaxis.studio`, 2026-08-09)
- Login → Programs; “+ New Program” opens **New Program** dialog
- Placeholders: Program Name `e.g. Computer Science BSc`, Description `Brief description`
- **Create** disabled when name empty **and** when name is whitespace-only (`   `)
- Special characters (`Informatique & IA - Niveau 2`) enable **Create**
- Duplicate create: modal closes, second row appears — no effective duplicate rejection
- Leading/trailing spaces appear retained on create (padded name visible in list)
- Name of 120 characters is accepted (spec max is 100)

### Spec vs app gaps (no defect keys)
| Spec / AC requirement | Observed on test.didaxis.studio | Covered by |
| --- | --- | --- |
| Duplicate name rejected with user-visible error | Duplicate create succeeds; second row appears | TC-007, TC-008, TC-011, TC-013, TC-022 |
| Name max 100 characters (server 400) | Names >100 accepted | TC-016, TC-017 |
| Name trimmed on submit | Outer whitespace retained in list | TC-013, TC-014 |
| Whitespace-only rejected | Matches spec — Create disabled | TC-005, TC-009, TC-010 |

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

**Expected result:** Modal closes; **Data Science 2026** appears in the program list without a page reload

**Priority:** High · **Source:** AC + UI Behavior

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

**Expected result:** Program **Informatique & IA - Niveau 2** is created and appears in the program list

**Priority:** High · **Source:** AC

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

**Priority:** Medium · **Source:** AC variation + Field Definitions (free-text name)

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

**Priority:** Medium · **Source:** Field Definitions (string name)

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
3. Observe **Create** / attempt submission

**Expected result:** Form is not submitted; **Create** stays disabled (or modal stays open with no new list row) — observed: Create disabled for whitespace-only

**Priority:** High · **Source:** AC + Validation Rules + live app

```gherkin
Scenario: Reject program name with only whitespace
  Given I am on the program creation form
  When I enter "   " as the program name
  And I fill in Description with "Whitespace-only name validation test"
  Then the Create button is disabled
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
3. Observe **Create** button

**Expected result:** **Create** is disabled; no program created

**Priority:** High · **Source:** Field Definitions + Validation Rules + live app

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

**Expected result:** Error indicates the name already exists; modal remains open; exactly one **Web Development 2026** in the list  
**Live gap:** duplicate create succeeds and adds a second row

**Priority:** High · **Source:** AC + Validation Rules

```gherkin
Scenario: Reject duplicate program name
  Given a program "Web Development 2026" already exists
  And I am on the program creation form
  When I fill in Program Name with "Web Development 2026"
  And I fill in Description with "Duplicate attempt — second web dev cohort"
  And I click Create
  Then I see an error indicating the name already exists
  And the program list contains exactly one entry named "Web Development 2026"
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

**Expected result:** After step 3: duplicate error; Description retained; After step 5: **Web Development 2026 - Cohort B** created

**Priority:** Medium · **Source:** UI Behavior (failure keeps modal) + AC

```gherkin
Scenario: Duplicate error retains form data for correction
  Given a program "Web Development 2026" already exists
  And I am on the program creation form
  When I fill in Program Name with "Web Development 2026"
  And I fill in Description with "Full-stack web development program — cohort B"
  And I click Create
  Then I see an error indicating the name already exists
  And the Description field still shows "Full-stack web development program — cohort B"
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
1. Enter tab characters only in **Program Name**
2. Enter `Tab-only name validation test` in **Description**
3. Observe **Create**

**Expected result:** Form not submitted; Create disabled or blocked; no program created

**Priority:** High · **Source:** Validation Rules (whitespace-only)

```gherkin
Scenario: Tab-only program name is rejected
  Given I am on the program creation form
  When I enter only tab characters as the program name
  And I fill in Description with "Tab-only name validation test"
  Then the Create button is disabled
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
3. Observe **Create**

**Expected result:** Form not submitted; no program created

**Priority:** Medium · **Source:** Validation Rules

```gherkin
Scenario: Mixed whitespace-only program name is rejected
  Given I am on the program creation form
  When I enter "  \t  \t  " as the program name
  And I fill in Description with "Mixed whitespace validation test"
  Then the Create button is disabled
  And no new program is added to the program list
```

---

### TC-011 — Duplicate rejection leaves database unchanged after refresh

**Title:** Failed duplicate create leaves list with a single entry

**Preconditions:**
- User is logged in as admin
- Program **Web Development 2026** already exists
- Program creation form is open

**Steps:**
1. Enter `Web Development 2026` in **Program Name**
2. Enter `Should not persist on duplicate rejection` in **Description**
3. Click **Create**
4. Refresh the Programs page

**Expected result:** Exactly one **Web Development 2026** after refresh

**Priority:** Medium · **Source:** AC + Validation Rules

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

### TC-012 — Duplicate check casing behavior

**Title:** Lowercase variant of an existing name is treated as a duplicate (unique per org)

**Preconditions:**
- User is logged in as admin
- Program **Web Development 2026** already exists
- Program creation form is open

**Steps:**
1. Enter `web development 2026` in **Program Name**
2. Enter `Lowercase duplicate attempt` in **Description**
3. Click **Create**

**Expected result:** Rejected as duplicate with error (case-insensitive uniqueness assumed for data integrity; confirm with BA if case-sensitive)

**Priority:** High · **Source:** Field Definitions (unique per organization) — casing ambiguous

```gherkin
Scenario: Duplicate check rejects case-variant names
  Given a program "Web Development 2026" already exists
  And I am on the program creation form
  When I fill in Program Name with "web development 2026"
  And I fill in Description with "Lowercase duplicate attempt"
  And I click Create
  Then I see an error indicating the name already exists
  And the program list contains exactly one entry matching "Web Development 2026" ignoring case
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

**Expected result:** After trim, duplicate error; exactly one **Web Development 2026**  
**Live gap:** padded name can create another entry

**Priority:** High · **Source:** AC + Field Definitions (trim on submit)

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

**Expected result:** Program saved as **Cybersecurity Fundamentals** (trimmed)  
**Live gap:** outer whitespace retained in list

**Priority:** Medium · **Source:** Field Definitions (trimmed on submit)

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

**Title:** Minimum-length Program Name is accepted

**Preconditions:**
- User is logged in as admin
- Program creation form is open

**Steps:**
1. Enter `A` in **Program Name**
2. Enter `Single character name boundary test` in **Description**
3. Click **Create**

**Expected result:** Program **A** created (no min length in Field Definitions beyond non-empty)

**Priority:** Medium · **Source:** Field Definitions

```gherkin
Scenario: Single character program name is accepted
  Given I am on the program creation form
  When I fill in Program Name with "A"
  And I fill in Description with "Single character name boundary test"
  And I click Create
  Then the program list shows "A"
```

---

### TC-016 — Program Name at maximum allowed length

**Title:** 100-character Program Name is accepted

**Preconditions:**
- User is logged in as admin
- Program creation form is open

**Steps:**
1. Enter a unique name of exactly **100** characters in **Program Name**
2. Enter `Max length name validation test` in **Description**
3. Click **Create**

**Expected result:** Program created; full name shown in list

**Priority:** Medium · **Source:** Field Definitions (max 100)

```gherkin
Scenario: Program name at maximum allowed length
  Given I am on the program creation form
  When I fill in Program Name with a unique 100-character name
  And I fill in Description with "Max length name validation test"
  And I click Create
  Then the program list shows the full 100-character program name
```

---

### TC-017 — Program Name exceeding maximum length is rejected

**Title:** Name over 100 characters is blocked

**Preconditions:**
- User is logged in as admin
- Program creation form is open

**Steps:**
1. Enter a **101+** character string in **Program Name** (probe with 120)
2. Enter `Over max length validation test` in **Description**
3. Click **Create**

**Expected result:** Validation/server error; no program created  
**Live gap:** 120-character name is accepted

**Priority:** Medium · **Source:** Validation Rules (name >100 → 400)

```gherkin
Scenario: Program name exceeding maximum length is rejected
  Given I am on the program creation form
  When I fill in Program Name with a string of 120 characters
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

**Expected result:** Error indicating name already exists; **Data Science 2026** unchanged

**Priority:** High · **Source:** Field Definitions (unique) — edit implied by feature title

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

**Expected result:** Save succeeds; no false duplicate error

**Priority:** Medium · **Source:** Uniqueness semantics

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

### TC-020 — Emoji in Program Name is accepted

**Title:** Emoji in name is stored and displayed

**Preconditions:**
- User is logged in as admin
- Program creation form is open

**Steps:**
1. Enter `Cloud Computing 2026 🎓` in **Program Name**
2. Enter `Cloud platforms and DevOps` in **Description**
3. Click **Create**

**Expected result:** Program created with emoji preserved (free-text string field)

**Priority:** Low · **Source:** Field Definitions

```gherkin
Scenario: Emoji in program name is accepted
  Given I am on the program creation form
  When I fill in Program Name with "Cloud Computing 2026 🎓"
  And I fill in Description with "Cloud platforms and DevOps"
  And I click Create
  Then the program list shows "Cloud Computing 2026 🎓"
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

**Expected result:** No script execution; name shown escaped or rejected

**Priority:** Medium · **Source:** Standard security practice

```gherkin
Scenario: HTML in program name is sanitized or rejected
  Given I am on the program creation form
  When I fill in Program Name with "<script>alert('xss')</script>"
  And I fill in Description with "Security validation test"
  And I click Create
  Then no script is executed in the browser
  And the program list shows the name as escaped text
  Or I see a validation message rejecting the name
```

---

### TC-022 — Double-click Create does not bypass duplicate check

**Title:** Rapid duplicate submissions do not create extra records

**Preconditions:**
- User is logged in as admin
- Program **Web Development 2026** already exists
- Program creation form is open

**Steps:**
1. Enter `Web Development 2026` in **Program Name**
2. Enter `Double-click duplicate test` in **Description**
3. Double-click **Create** quickly

**Expected result:** Duplicate error; exactly one **Web Development 2026** remains

**Priority:** Medium · **Source:** AC + UI Behavior

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
| --- | --- |
| Whitespace-only name trimmed and rejected | TC-005, TC-009, TC-010 |
| Special characters in name accepted | TC-002, TC-003, TC-004, TC-020 |
| Duplicate name on create rejected with error | TC-007, TC-008, TC-011, TC-013, TC-022 |
| Confluence: empty name disables Create | TC-006 |
| Confluence: max 100 / over-max rejected | TC-016, TC-017 |
| Confluence: trim on submit | TC-013, TC-014 |
| Uniqueness on edit (implied) | TC-018, TC-019 |

---

## Ambiguities and Gaps

1. **Create vs edit scope** — ACs cover create only; duplicate on edit implied by uniqueness (TC-018, TC-019).
2. **Error presentation** — AC requires an error for duplicates but does not specify toast vs inline vs modal banner (TC-007). Exact copy unknown.
3. **Case sensitivity** — Spec says unique per org but not whether casing differs (TC-012).
4. **Description required?** — AC says “fill other required fields”; Confluence marks Description optional.
5. **Unicode normalization** — Visually similar / NFC vs NFD duplicates not specified.
6. **Concurrent duplicate creation** — Two admins creating the same name simultaneously not covered.
7. **Live gaps** — Duplicate prevention, max-100 enforcement, and trim-on-submit do not match Confluence as of live exploration; tests should assert the AC/spec and fail until the product matches.
