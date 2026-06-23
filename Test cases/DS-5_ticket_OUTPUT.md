# DS-5 — Test Plan: Program List Filtering and Display

**Feature:** Program list filtering and display  
**Source:** DS-5_ticket_INPUT  
**Scope:** Programs page, program list rows (Program Name, Description), empty state, admin access

---

## Positive Flows

### TC-001 — Program list displays name and description for each program

**Title:** Existing programs show Program Name and Description in the list

**Preconditions:**
- User is logged in as admin
- Program **Web Development 2026** exists with Description **Full-stack web development program**
- Program **Data Science 2026** exists with Description **Introduction to statistics and machine learning**

**Steps:**
1. Navigate to the Programs page
2. Observe the program list

**Expected result:**
- List shows **Web Development 2026** with Description **Full-stack web development program**
- List shows **Data Science 2026** with Description **Introduction to statistics and machine learning**

**Priority:** High

```gherkin
Scenario: Display program list with key details
  Given programs exist in the system
  And a program "Web Development 2026" exists with description "Full-stack web development program"
  And a program "Data Science 2026" exists with description "Introduction to statistics and machine learning"
  When I navigate to the Programs page
  Then I see a list showing each program's name and description
  And the list shows "Web Development 2026" with description "Full-stack web development program"
  And the list shows "Data Science 2026" with description "Introduction to statistics and machine learning"
```

---

### TC-002 — Multiple programs are all visible in the list

**Title:** List renders every program without omission

**Preconditions:**
- User is logged in as admin
- Programs **Web Development 2026**, **Cybersecurity Fundamentals**, and **UX Design Bootcamp** exist

**Steps:**
1. Navigate to the Programs page
2. Count visible program entries

**Expected result:** All three programs appear in the list, each with its name and description

**Priority:** High

```gherkin
Scenario: All existing programs appear in the list
  Given I am logged in as admin
  And a program "Web Development 2026" exists
  And a program "Cybersecurity Fundamentals" exists
  And a program "UX Design Bootcamp" exists
  When I navigate to the Programs page
  Then the program list shows "Web Development 2026"
  And the program list shows "Cybersecurity Fundamentals"
  And the program list shows "UX Design Bootcamp"
```

---

### TC-003 — Empty state message is shown when no programs exist

**Title:** Programs page shows no-data message when list is empty

**Preconditions:**
- User is logged in as admin
- No programs exist in the system

**Steps:**
1. Navigate to the Programs page
2. Observe the page content

**Expected result:**
- Message indicates no programs have been created
- No program rows are displayed

**Priority:** High

```gherkin
Scenario: Empty state when no programs exist
  Given no programs exist
  When I navigate to the Programs page
  Then I see a message indicating no programs have been created
  And I do not see any program rows in the list
```

---

### TC-004 — Empty state includes prompt to create the first program

**Title:** Empty state guides user to create a program

**Preconditions:**
- User is logged in as admin
- No programs exist in the system

**Steps:**
1. Navigate to the Programs page
2. Observe the empty state area

**Expected result:**
- Prompt to create the first program is visible (e.g. link or **+ New Program** call-to-action)

**Priority:** High

```gherkin
Scenario: Empty state prompts user to create first program
  Given no programs exist
  When I navigate to the Programs page
  Then I see a message indicating no programs have been created
  And I see a prompt to create the first program
```

---

### TC-005 — List updates after creating a program from empty state

**Title:** First created program replaces empty state with list row

**Preconditions:**
- User is logged in as admin
- No programs exist
- User is on the Programs page empty state

**Steps:**
1. Click **+ New Program** (or the empty-state create prompt)
2. Enter `Web Development 2026` in **Program Name**
3. Enter `Full-stack web development program` in **Description**
4. Click **Create**
5. Observe the Programs page

**Expected result:**
- Empty state message is no longer shown
- List displays **Web Development 2026** with **Full-stack web development program**

**Priority:** Medium

```gherkin
Scenario: List replaces empty state after first program is created
  Given no programs exist
  And I am on the Programs page
  When I click "+ New Program"
  And I fill in Program Name with "Web Development 2026"
  And I fill in Description with "Full-stack web development program"
  And I click Create
  Then I see a list showing "Web Development 2026" with description "Full-stack web development program"
  And I do not see a message indicating no programs have been created
```

---

### TC-006 — List persists after page refresh

**Title:** Program list data remains visible after reload

**Preconditions:**
- User is logged in as admin
- Program **Web Development 2026** exists with Description **Full-stack web development program**

**Steps:**
1. Navigate to the Programs page
2. Confirm **Web Development 2026** is visible
3. Refresh the page

**Expected result:** **Web Development 2026** and its description still appear in the list

**Priority:** Medium

```gherkin
Scenario: Program list persists after page refresh
  Given a program "Web Development 2026" exists with description "Full-stack web development program"
  When I navigate to the Programs page
  And I refresh the page
  Then the program list shows "Web Development 2026" with description "Full-stack web development program"
```

---

## Negative Flows

### TC-007 — Empty state is not shown when programs exist

**Title:** Populated list does not display empty-state messaging

**Preconditions:**
- User is logged in as admin
- Program **Web Development 2026** exists

**Steps:**
1. Navigate to the Programs page
2. Observe page content

**Expected result:**
- Program list is shown
- Empty-state message and create-first-program prompt are not displayed

**Priority:** High

```gherkin
Scenario: Empty state is hidden when programs exist
  Given a program "Web Development 2026" exists
  When I navigate to the Programs page
  Then I see a list showing "Web Development 2026"
  And I do not see a message indicating no programs have been created
```

---

### TC-008 — List does not show stale programs after deletion

**Title:** Deleted program is removed from displayed list

**Preconditions:**
- User is logged in as admin
- Programs **Test Program** and **Data Science 2026** exist

**Steps:**
1. Navigate to the Programs page
2. Delete **Test Program** and confirm
3. Observe the program list

**Expected result:**
- **Test Program** is not shown
- **Data Science 2026** remains visible with its description

**Priority:** High

```gherkin
Scenario: Deleted program is not shown in list
  Given a program "Test Program" exists
  And a program "Data Science 2026" exists
  When I navigate to the Programs page
  And I delete "Test Program"
  Then the program list does not show "Test Program"
  And the program list still shows "Data Science 2026"
```

---

### TC-009 — List does not display internal or unrelated fields

**Title:** Only Program Name and Description are shown per row

**Preconditions:**
- User is logged in as admin
- Program **Web Development 2026** exists

**Steps:**
1. Navigate to the Programs page
2. Inspect a program list row for **Web Development 2026**

**Expected result:**
- Row shows Program Name and Description
- Internal IDs, raw JSON, or unrelated metadata are not exposed in the list UI

**Priority:** Medium

```gherkin
Scenario: List shows only intended program details
  Given a program "Web Development 2026" exists with description "Full-stack web development program"
  When I navigate to the Programs page
  Then I see "Web Development 2026" with description "Full-stack web development program"
  And I do not see internal program identifiers in the list
```

---

### TC-010 — Non-admin unauthorized access does not leak program data

**Title:** Unauthorized users do not see program list content

**Preconditions:**
- User is logged in as a non-admin role (e.g. student) without list access
- Programs exist in the system

**Steps:**
1. Attempt to navigate to the Programs page

**Expected result:**
- Access denied, redirect, or hidden page
- Program names and descriptions are not visible to unauthorized users

**Priority:** High

```gherkin
Scenario: Non-admin without access cannot view program list
  Given programs exist in the system
  And I am logged in as a non-admin user without Programs page access
  When I attempt to navigate to the Programs page
  Then I do not see the program list with program names and descriptions
  Or I see an access denied message
```

---

### TC-011 — API failure does not show false empty state

**Title:** Load error is distinct from genuine empty list

**Preconditions:**
- User is logged in as admin
- Programs exist in the system
- Programs list API is unavailable or returns an error (simulated)

**Steps:**
1. Navigate to the Programs page while the API fails

**Expected result:**
- Error message or retry option is shown
- Empty-state "no programs created" message is not shown when programs actually exist

**Priority:** Medium

```gherkin
Scenario: API failure does not show false empty state
  Given programs exist in the system
  And the programs list API will fail
  When I navigate to the Programs page
  Then I see an error message indicating the list could not be loaded
  And I do not see a message indicating no programs have been created
```

---

## Edge Cases

### TC-012 — Program name with special characters displays correctly

**Title:** Special characters in Program Name render without corruption

**Preconditions:**
- User is logged in as admin
- Program **C++ & C# Programming (2026)** exists with Description **Languages: C++, C#, and scripting**

**Steps:**
1. Navigate to the Programs page
2. Locate **C++ & C# Programming (2026)** in the list

**Expected result:** Name and description display exactly as stored; no HTML encoding issues or broken characters

**Priority:** Medium

```gherkin
Scenario: Special characters display correctly in program list
  Given a program "C++ & C# Programming (2026)" exists with description "Languages: C++, C#, and scripting"
  When I navigate to the Programs page
  Then the program list shows "C++ & C# Programming (2026)" with description "Languages: C++, C#, and scripting"
```

---

### TC-013 — Unicode program name and description display correctly

**Title:** Non-Latin characters and emoji render properly in the list

**Preconditions:**
- User is logged in as admin
- Program **日本語プログラム 2026** exists with Description **Multilingual curriculum 🎓**

**Steps:**
1. Navigate to the Programs page
2. Observe the row for **日本語プログラム 2026**

**Expected result:** Unicode name and emoji description display correctly

**Priority:** Low

```gherkin
Scenario: Unicode and emoji display correctly in program list
  Given a program "日本語プログラム 2026" exists with description "Multilingual curriculum 🎓"
  When I navigate to the Programs page
  Then the program list shows "日本語プログラム 2026" with description "Multilingual curriculum 🎓"
```

---

### TC-014 — Long program name displays without breaking layout

**Title:** Maximum-length Program Name is readable in the list

**Preconditions:**
- User is logged in as admin
- Program **Advanced Web Development and Cloud Architecture Specialization Program Track 2026 Edition Alpha** exists (100 characters)

**Steps:**
1. Navigate to the Programs page
2. Observe how the long name is displayed

**Expected result:**
- Full name is visible, truncated with ellipsis, or wrapped per UI design
- List layout remains usable; no overflow overlap with other columns

**Priority:** Medium

```gherkin
Scenario: Long program name displays without layout break
  Given a program "Advanced Web Development and Cloud Architecture Specialization Program Track 2026 Edition Alpha" exists
  When I navigate to the Programs page
  Then the program list shows "Advanced Web Development and Cloud Architecture Specialization Program Track 2026 Edition Alpha"
  And the list layout remains readable
```

---

### TC-015 — Long description displays without breaking layout

**Title:** Lengthy Description is handled in list display

**Preconditions:**
- User is logged in as admin
- Program **DevOps Pipeline Program** exists with a 500-character Description

**Steps:**
1. Navigate to the Programs page
2. Observe the Description column for **DevOps Pipeline Program**

**Expected result:**
- Description is truncated, wrapped, or expandable per UI design
- Row height and layout remain consistent

**Priority:** Low

```gherkin
Scenario: Long description displays without layout break
  Given a program "DevOps Pipeline Program" exists with a description of 500 characters
  When I navigate to the Programs page
  Then the program list shows "DevOps Pipeline Program"
  And the description is displayed without breaking the list layout
```

---

### TC-016 — Empty description is displayed consistently

**Title:** Program with no Description shows defined empty-state in list

**Preconditions:**
- User is logged in as admin
- Program **Mobile App Development 2026** exists with an empty Description

**Steps:**
1. Navigate to the Programs page
2. Observe the row for **Mobile App Development 2026**

**Expected result:**
- Program Name is shown
- Empty Description shows blank, em dash, or "No description" per UI spec — not undefined/null text

**Priority:** Medium

```gherkin
Scenario: Empty description display in program list
  Given a program "Mobile App Development 2026" exists with an empty description
  When I navigate to the Programs page
  Then the program list shows "Mobile App Development 2026"
  And the description field does not show "null" or "undefined"
```

---

### TC-017 — Single program list displays correctly

**Title:** List with one program shows one row without empty-state

**Preconditions:**
- User is logged in as admin
- Only program **Web Development 2026** exists

**Steps:**
1. Navigate to the Programs page

**Expected result:**
- One list row for **Web Development 2026**
- No empty-state message

**Priority:** Medium

```gherkin
Scenario: Single program list displays correctly
  Given only a program "Web Development 2026" exists with description "Full-stack web development program"
  When I navigate to the Programs page
  Then I see a list showing "Web Development 2026" with description "Full-stack web development program"
  And I do not see a message indicating no programs have been created
```

---

### TC-018 — HTML in description is escaped in list display

**Title:** Malicious Description content does not execute in list

**Preconditions:**
- User is logged in as admin
- Program **Security Test Program** exists with Description `<script>alert('xss')</script>`

**Steps:**
1. Navigate to the Programs page
2. View the Description for **Security Test Program**

**Expected result:**
- No script execution
- Description rendered as escaped/safe text

**Priority:** Medium

```gherkin
Scenario: HTML in description is escaped in list display
  Given a program "Security Test Program" exists with description "<script>alert('xss')</script>"
  When I navigate to the Programs page
  Then no script is executed in the browser
  And the program list shows "Security Test Program"
```

---

### TC-019 — Programs with duplicate names are distinguishable in list

**Title:** Duplicate Program Names do not collapse into one row

**Preconditions:**
- User is logged in as admin
- Two distinct programs both named **Web Development 2026** exist (if product allows duplicates) with different descriptions

**Steps:**
1. Navigate to the Programs page
2. Count rows named **Web Development 2026**

**Expected result:**
- Each program record appears as a separate row with its own description
- Or duplicate names are prevented at create time (document actual behavior)

**Priority:** Low

```gherkin
Scenario: Duplicate program names display as separate rows
  Given two programs named "Web Development 2026" exist with different descriptions
  When I navigate to the Programs page
  Then I see two list entries for "Web Development 2026"
  Or only one program named "Web Development 2026" exists if duplicates are prevented
```

---

### TC-020 — Large number of programs displays without failure

**Title:** List handles many programs gracefully

**Preconditions:**
- User is logged in as admin
- 50 or more programs exist (e.g. **Program 001** through **Program 050**)

**Steps:**
1. Navigate to the Programs page
2. Scroll or paginate through the list

**Expected result:**
- All programs are accessible via scroll, pagination, or virtual list
- Page remains responsive; no missing or duplicated rows

**Priority:** Low

```gherkin
Scenario: Large program list displays without failure
  Given 50 programs exist in the system
  When I navigate to the Programs page
  Then I can view all programs in the list
  And each visible program shows its name and description
```

---

### TC-021 — List reflects updated description after edit

**Title:** Edited Description appears in list without full reload

**Preconditions:**
- User is logged in as admin
- Program **Web Development 2026** exists with Description **Full-stack web development program**
- User is on the Programs page

**Steps:**
1. Edit **Web Development 2026** and change Description to `Full-stack web development program — revised`
2. Save and return to the Programs page list

**Expected result:** List shows updated Description **Full-stack web development program — revised**

**Priority:** Medium

```gherkin
Scenario: List shows updated description after edit
  Given a program "Web Development 2026" exists with description "Full-stack web development program"
  And I am on the Programs page
  When I edit "Web Development 2026" and change the Description to "Full-stack web development program — revised"
  And I save the changes
  Then the program list shows "Web Development 2026" with description "Full-stack web development program — revised"
```

---

### TC-022 — Multi-line description displays in list

**Title:** Line breaks in Description are preserved or formatted in list view

**Preconditions:**
- User is logged in as admin
- Program **DevOps Pipeline Program** exists with multi-line Description:
  ```
  Week 1: CI/CD basics
  Week 2: Kubernetes
  Week 3: Monitoring
  ```

**Steps:**
1. Navigate to the Programs page
2. Observe Description display for **DevOps Pipeline Program**

**Expected result:** Multi-line content is shown with line breaks, truncated preview, or tooltip per UI design

**Priority:** Low

```gherkin
Scenario: Multi-line description displays in program list
  Given a program "DevOps Pipeline Program" exists with a multi-line description
  When I navigate to the Programs page
  Then the program list shows "DevOps Pipeline Program"
  And the description content is readable
```

---

## Coverage Matrix

| Acceptance criterion | Test cases |
|----------------------|------------|
| List shows each program's name and description | TC-001, TC-002, TC-006, TC-021 |
| Empty state message when no programs | TC-003, TC-007 |
| Prompt to create first program in empty state | TC-004, TC-005 |

---

## Ambiguities and Gaps in the Acceptance Criteria

1. **Filtering not specified** — Feature title includes "filtering" but ACs cover display and empty state only; no search, sort, or filter criteria defined.

2. **List layout** — AC does not specify table vs. cards, column headers, or row actions (edit/delete icons).

3. **Empty description** — Behavior when Description is empty is not defined (TC-016).

4. **Exact empty-state copy** — Wording of "no programs" message and create prompt not specified (TC-003, TC-004).

5. **Create prompt interaction** — Unclear whether prompt is text only or a clickable **+ New Program** button (TC-004, TC-005).

6. **Sort order** — Default ordering (alphabetical, created date) not specified.

7. **Pagination / virtualization** — No rule for large lists (TC-020).

8. **Long text handling** — Truncation, tooltip, or wrap rules for name/description not in AC (TC-014, TC-015).

9. **Login / role** — Admin assumed from related tickets; read-only or partial list access for other roles not defined (TC-010).

10. **Loading state** — No AC for spinner/skeleton while list loads; distinction from empty state unclear (TC-011).

11. **Error handling** — API failure vs. genuine empty list not differentiated in AC (TC-011).

12. **Description visibility format** — Full text vs. truncated preview in list not specified.

13. **Duplicate names in list** — How duplicate Program Names appear is not defined (TC-019).

14. **Related actions in list** — Edit/delete icons, row click behavior not mentioned.

15. **Refresh behavior** — Manual refresh and cache/stale data rules not in AC (TC-006).

16. **Special characters and security** — Display encoding and XSS handling not in AC (TC-012, TC-018).

17. **Single vs. multiple program edge cases** — Transition from empty to first program not in AC (TC-005, TC-017).
