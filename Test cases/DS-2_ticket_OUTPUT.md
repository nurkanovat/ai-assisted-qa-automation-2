# DS-2 — Test Plan: Edit Existing Program Details

**Jira:** [DS-2](https://legionqaschool.atlassian.net/browse/DS-2) — Edit existing program details  
**Status:** In Progress · **Priority:** High · **Labels:** `mvp`, `program-setup`, `tests-generated`  
**Sources:** DS-2 (Jira) + Confluence Program Setup docs (Field Definitions, Validation Rules, UI Behavior) + linked defects (DS-9, DS-38, DS-89, DS-116, …) + local `DS-2_ticket_INPUT`  
**Scope:** Programs page (`/programs`), Edit Program modal (`Program Name`, `Description`, collapsible AI Generation Config), ✏️ edit icon per program row, **Save** action, in-place list refresh, admin/editor authorization  
**Note on live app:** `https://test.didaxis.studio/programs` redirects to `/login`; no credentials were available, so UI details below are taken from the Confluence "Program Setup — UI Behavior" spec.

---

## Jira Acceptance Criteria (quoted)

**User story:** As an admin user, I want to edit an existing program's details so that I can correct or update program information after creation.

```gherkin
Scenario: Open program for editing
  Given I am on the Programs page
  And a program "Web Development 2026" exists
  When I click the edit icon on "Web Development 2026"
  Then I see the edit form pre-populated with the program's current data

Scenario: Successfully edit a program name
  Given I am editing "Web Development 2026"
  When I change the Name to "Web Development 2026 - Updated"
  And I click Save
  Then the modal closes
  And the program list immediately shows "Web Development 2026 - Updated"

Scenario: Edit preserves unchanged fields
  Given I am editing a program
  When I only change the Description
  And I click Save
  Then the Name and other fields remain unchanged
```

The ticket only lists happy-path ACs. The cases below combine these with the Confluence spec, the known defects, and shared behavior with the Create flow (DS-1).

---

## Confluence Evidence (Atlassian MCP — DS space)

### Field Definitions ([233078785](https://legionqaschool.atlassian.net/wiki/spaces/DS/pages/233078785/Program+Setup+Field+Definitions))
- **Program Name:** required, **max 100 characters**, **unique per organization**, **trimmed on submit**.
- **Description:** optional, **max 500 characters**, default empty.
- Create and Edit modals share the same layout: Program Name (TextInput) + Description (Textarea) always visible; **AI Generation Config** is a collapsible section (Total Hours, Default Session Hours = 4, Default Exam Hours = 3, Target Audience, Focus Areas, Sync/Async Ratio = 70%).

### Validation Rules ([233111553](https://legionqaschool.atlassian.net/wiki/spaces/DS/pages/233111553/Program+Setup+Validation+Rules))
- Client: empty name → **Save disabled**; whitespace-only name → trimmed, empty check blocks submission (modal stays open).
- Server: duplicate name → **400/409 + error shown**; name > 100 chars → 400; description > 500 chars → 400.

### UI Behavior ([233111568](https://legionqaschool.atlassian.net/wiki/spaces/DS/pages/233111568/Program+Setup+UI+Behavior))
- **Roles:** ADMIN = full CRUD; **EDITOR = can create and edit**; **VIEWER = read-only**. "+ New Program" and edit/delete icons visible to ADMIN and EDITOR.
- **Edit flow:** click **✏️** icon on a row → **"Edit Program"** modal opens **pre-populated** → modify fields → **Save** → API update → on success modal closes and **list refreshes with updated data visible immediately**; on failure an error is displayed.
- **List Refresh (Critical):** after any mutation the list MUST reflect the change **without a manual refresh** (re-fetched from server).
- Modals close via **X, Cancel, or clicking outside**; **Save disabled when Program Name is empty**.

### Spec vs App gaps — open defects (tests expected to fail until fixed)
| Spec requirement | Observed app behavior | Test(s) | Jira defects |
|---|---|---|---|
| List refreshes in place after edit | Stale name / needs manual refresh; sometimes a **new row** is added instead of updating | TC-002, TC-004, TC-007 | [DS-9](https://legionqaschool.atlassian.net/browse/DS-9), [DS-108](https://legionqaschool.atlassian.net/browse/DS-108), [DS-99](https://legionqaschool.atlassian.net/browse/DS-99) |
| Unique program name on rename | Duplicate name accepted on Save, no error shown | TC-013 | [DS-38](https://legionqaschool.atlassian.net/browse/DS-38), [DS-164](https://legionqaschool.atlassian.net/browse/DS-164), [DS-126](https://legionqaschool.atlassian.net/browse/DS-126), [DS-131](https://legionqaschool.atlassian.net/browse/DS-131) |
| Case-insensitive uniqueness | Case-only duplicate name accepted | TC-014 | [DS-127](https://legionqaschool.atlassian.net/browse/DS-127), [DS-129](https://legionqaschool.atlassian.net/browse/DS-129) |
| Name max 100 chars enforced on edit | Names > 100 (even > 255) accepted; long name can time out on save | TC-019 | [DS-39](https://legionqaschool.atlassian.net/browse/DS-39), [DS-95](https://legionqaschool.atlassian.net/browse/DS-95), [DS-170](https://legionqaschool.atlassian.net/browse/DS-170), [DS-40](https://legionqaschool.atlassian.net/browse/DS-40) |
| Description max 500 chars enforced | Description > 500 (even > 2000) accepted | TC-022 | [DS-144](https://legionqaschool.atlassian.net/browse/DS-144) |
| Name trimmed on submit | Leading/trailing whitespace not trimmed on edit | TC-025 | [DS-171](https://legionqaschool.atlassian.net/browse/DS-171), [DS-143](https://legionqaschool.atlassian.net/browse/DS-143) |
| Input sanitized | XSS script payload accepted in Program Name on edit | TC-027 | [DS-89](https://legionqaschool.atlassian.net/browse/DS-89) |
| API failure shows error | CRUD API failures show no user-visible error; modal not stable | TC-015 | [DS-116](https://legionqaschool.atlassian.net/browse/DS-116), [DS-36](https://legionqaschool.atlassian.net/browse/DS-36) |
| Single Save per submit | Rapid double-click Save fires duplicate PATCH (no guard) | TC-029 | [DS-41](https://legionqaschool.atlassian.net/browse/DS-41), [DS-96](https://legionqaschool.atlassian.net/browse/DS-96), [DS-128](https://legionqaschool.atlassian.net/browse/DS-128), [DS-130](https://legionqaschool.atlassian.net/browse/DS-130) |
| ✏️ edit icon present and clickable | Edit icon missing / rendered as broken image / not clickable | TC-032 | [DS-57](https://legionqaschool.atlassian.net/browse/DS-57), [DS-81](https://legionqaschool.atlassian.net/browse/DS-81), [DS-93](https://legionqaschool.atlassian.net/browse/DS-93), [DS-94](https://legionqaschool.atlassian.net/browse/DS-94) |

---

## Positive Flows

### TC-001 — Edit form opens with current program data pre-populated

**Title:** Edit modal shows existing Program Name and Description values (AC1)

**Preconditions:**
- User is logged in as admin
- Programs page is open
- Program **Web Development 2026** exists with Description **Full-stack web development program**

**Steps:**
1. Navigate to the Programs page
2. Locate **Web Development 2026** in the program list
3. Click the **✏️** edit icon on **Web Development 2026**

**Expected result:** An **"Edit Program"** modal opens with **Program Name** = `Web Development 2026` and **Description** = `Full-stack web development program`; a collapsible **AI Generation Config** section is present; **Save** is enabled

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

**Title:** Renamed program appears in the list immediately after Save (AC2)

**Preconditions:**
- User is logged in as admin
- Program **Web Development 2026** exists
- Edit Program form for **Web Development 2026** is open

**Steps:**
1. Change **Program Name** to `Web Development 2026 - Updated`
2. Click **Save**

**Expected result:**
- Modal closes
- Program list shows **Web Development 2026 - Updated** immediately (no manual refresh — Confluence List Refresh rule)
- **Web Development 2026** no longer appears as a program name in the list

**Priority:** High · *Known defect: [DS-9](https://legionqaschool.atlassian.net/browse/DS-9) / [DS-108](https://legionqaschool.atlassian.net/browse/DS-108) — list may show stale name until refresh*

```gherkin
Scenario: Successfully edit a program name
  Given I am editing "Web Development 2026"
  When I change the Program Name to "Web Development 2026 - Updated"
  And I click Save
  Then the modal closes
  And the program list immediately shows "Web Development 2026 - Updated"
  And the program list does not show "Web Development 2026"
```

---

### TC-003 — Unchanged fields are preserved when only Description is edited

**Title:** Partial edit updates only the modified field (AC3)

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
- No other fields (AI config) were altered unintentionally

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

**Title:** List reflects edits without navigating away or manual refresh (Confluence List Refresh rule)

**Preconditions:**
- User is logged in as admin
- Programs page is open
- Program **Data Science 2026** exists

**Steps:**
1. Click the **✏️** icon on **Data Science 2026**
2. Change **Program Name** to `Data Science 2026 - Advanced Track`
3. Click **Save**
4. Observe the program list on the same Programs page (do not manually refresh)

**Expected result:** **Data Science 2026 - Advanced Track** appears in the list without a full page reload or manual refresh

**Priority:** High · *Known defect: [DS-9](https://legionqaschool.atlassian.net/browse/DS-9), [DS-108](https://legionqaschool.atlassian.net/browse/DS-108)*

```gherkin
Scenario: Program list updates in place after edit
  Given I am on the Programs page
  And a program "Data Science 2026" exists
  When I click the edit icon on "Data Science 2026"
  And I change the Program Name to "Data Science 2026 - Advanced Track"
  And I click Save
  Then the modal closes
  And the program list on the Programs page shows "Data Science 2026 - Advanced Track" without a manual refresh
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

**Expected result:** Modal closes; program list still shows **Mobile App Development 2026** with unchanged data on re-open

**Priority:** Low

```gherkin
Scenario: Save without changes preserves program data
  Given I am editing "Mobile App Development 2026"
  And I have not modified any field
  When I click Save
  Then the program list still shows "Mobile App Development 2026"
  And when I open the edit form again the Program Name and Description match the original values
```

---

### TC-007 — Edit updates the existing row in place (no duplicate row)

**Title:** Editing a program modifies its row rather than adding a new one

**Preconditions:**
- User is logged in as admin
- Exactly one program **Cloud Computing 2026** exists

**Steps:**
1. Note the number of rows in the program list
2. Edit **Cloud Computing 2026** and change Description to `AWS, Azure, and GCP fundamentals`
3. Click **Save**

**Expected result:** The list still has the same number of rows; **Cloud Computing 2026** appears exactly once with the updated data (no second/duplicate row)

**Priority:** High · *Known defect: [DS-99](https://legionqaschool.atlassian.net/browse/DS-99) — edit creates an additional row*

```gherkin
Scenario: Edit updates the existing row in place
  Given I am on the Programs page
  And exactly one program "Cloud Computing 2026" exists
  When I edit "Cloud Computing 2026" and change the Description
  And I click Save
  Then exactly one program named "Cloud Computing 2026" exists in the list
  And no duplicate row is added
```

---

### TC-008 — Edit modal exposes the collapsible AI Generation Config section

**Title:** Edit form shows the same AI Generation Config section as Create

**Preconditions:**
- User is logged in as admin
- Edit form for **Web Development 2026** is open

**Steps:**
1. Click **Show AI Generation Config**
2. Observe the expanded fields
3. Click **Hide AI Generation Config**

**Expected result:** Expanded section shows Total Hours, Default Session Hours (4), Default Exam Hours (3), Target Audience, Focus Areas, Sync/Async Ratio (70%); toggling hides them again

**Priority:** Medium

```gherkin
Scenario: AI Generation Config toggles visibility on edit
  Given I am editing "Web Development 2026"
  When I click "Show AI Generation Config"
  Then I see the Total Hours and Default Session Hours fields
  When I click "Hide AI Generation Config"
  Then the AI Generation Config fields are hidden
```

---

## Negative Flows

### TC-009 — Save is disabled when Program Name is cleared

**Title:** Empty Program Name blocks save on edit (Validation Rules)

**Preconditions:**
- User is logged in as admin
- Edit form for **Web Development 2026** is open

**Steps:**
1. Clear **Program Name** completely
2. Leave **Description** as `Full-stack web development program`
3. Observe the **Save** button

**Expected result:** **Save** button is disabled; **Web Development 2026** remains unchanged in the list

**Priority:** High

```gherkin
Scenario: Validation prevents empty program name on edit
  Given I am editing "Web Development 2026"
  When I clear the Program Name field
  Then the Save button is disabled
  And the program list still shows "Web Development 2026"
```

---

### TC-010 — Cleared Program Name does not persist via forced submission

**Title:** Empty name cannot update the program through UI workarounds

**Preconditions:**
- User is logged in as admin
- Edit form for **Web Development 2026** is open

**Steps:**
1. Clear **Program Name**
2. Keep **Description** as `Attempted empty name save`
3. Attempt to submit via keyboard/Enter or forced interaction if **Save** appears enabled

**Expected result:**
- Program is not updated with an empty name
- **Web Development 2026** remains in the program list
- Modal stays open or submission is blocked

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

### TC-011 — Closing the modal without saving discards edits

**Title:** Cancel / X / click-outside does not persist unsaved changes

**Preconditions:**
- User is logged in as admin
- Edit form for **Web Development 2026** is open

**Steps:**
1. Change **Program Name** to `Unsaved Edit Draft`
2. Change **Description** to `This change should not be saved`
3. Close the modal via Cancel, X, or clicking outside (per UI Behavior spec)

**Expected result:**
- Modal closes
- Program list still shows **Web Development 2026**
- Re-opening edit shows the original Description **Full-stack web development program**

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

### TC-012 — Viewer (read-only) role cannot edit programs

**Title:** Users without edit permission cannot modify program details

**Preconditions:**
- User is logged in as a **Viewer** (read-only) role
- Program **Web Development 2026** exists

**Steps:**
1. Navigate to the Programs page
2. Look for the **✏️** edit icon on **Web Development 2026**
3. If visible, attempt to open the form and change **Program Name** to `Unauthorized Edit`

**Expected result:**
- Edit icon is hidden/disabled for Viewer, **or**
- Access is denied (403 / redirect / error)
- **Web Development 2026** is unchanged
- (Per spec, Admin and Editor roles *can* edit)

**Priority:** High

```gherkin
Scenario: Viewer role cannot edit a program
  Given I am logged in as a viewer (read-only) user
  And a program "Web Development 2026" exists
  When I navigate to the Programs page
  Then I do not see an enabled edit action for "Web Development 2026"
  Or I see an access denied message when attempting to edit the program
```

---

### TC-013 — Renaming to an existing program name is rejected

**Title:** Duplicate Program Name on rename returns a validation/error (Validation Rules)

**Preconditions:**
- User is logged in as admin
- Programs **Web Development 2026** and **Data Science 2026** exist
- Edit form for **Data Science 2026** is open

**Steps:**
1. Change **Program Name** to `Web Development 2026`
2. Click **Save**

**Expected result (per Confluence — duplicate name → 400/409, error shown):**
- Duplicate-name error is displayed
- **Data Science 2026** remains unchanged
- The list does not contain two entries named **Web Development 2026**

**Priority:** High · *Known defect: [DS-38](https://legionqaschool.atlassian.net/browse/DS-38), [DS-164](https://legionqaschool.atlassian.net/browse/DS-164), [DS-126](https://legionqaschool.atlassian.net/browse/DS-126) — duplicate accepted, no error*

```gherkin
Scenario: Duplicate program name on edit is rejected
  Given I am editing "Data Science 2026"
  And a program named "Web Development 2026" already exists
  When I change the Program Name to "Web Development 2026"
  And I click Save
  Then I see a duplicate-name validation or error message
  And the program list still shows "Data Science 2026"
  And the program list contains exactly one entry named "Web Development 2026"
```

---

### TC-014 — Case-only duplicate program name is rejected

**Title:** Uniqueness is case-insensitive on rename

**Preconditions:**
- User is logged in as admin
- Program **Web Development 2026** exists
- Edit form for **Data Science 2026** is open

**Steps:**
1. Change **Program Name** to `web development 2026` (case-only difference)
2. Click **Save**

**Expected result:** Treated as a duplicate — validation/error shown; no case-variant duplicate created

**Priority:** Medium · *Known defect: [DS-127](https://legionqaschool.atlassian.net/browse/DS-127), [DS-129](https://legionqaschool.atlassian.net/browse/DS-129)*

```gherkin
Scenario: Case-only duplicate program name is rejected on edit
  Given I am editing "Data Science 2026"
  And a program named "Web Development 2026" already exists
  When I change the Program Name to "web development 2026"
  And I click Save
  Then I see a duplicate-name validation or error message
  And the program list does not contain a case-variant duplicate
```

---

### TC-015 — API failure during save shows an error and no false success

**Title:** Failed save surfaces an error and keeps recoverable form data (UI Behavior: "on failure error displayed")

**Preconditions:**
- User is logged in as admin
- Edit form for **Web Development 2026** is open
- Backend update endpoint returns an error (simulated)

**Steps:**
1. Change **Program Name** to `API Failure Edit Test`
2. Click **Save** while the API fails

**Expected result:**
- User sees an error message
- Modal does not close as if save succeeded
- Program list still shows **Web Development 2026**
- Form retains `API Failure Edit Test` so the user can retry

**Priority:** Medium · *Known defect: [DS-116](https://legionqaschool.atlassian.net/browse/DS-116), [DS-36](https://legionqaschool.atlassian.net/browse/DS-36) — CRUD failures show no visible error*

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

### TC-016 — Editing a concurrently deleted program is handled safely

**Title:** Saving edits to a deleted program does not corrupt the list

**Preconditions:**
- User is logged in as admin
- Edit form for **Web Development 2026** is open
- Another session deletes **Web Development 2026** before Save

**Steps:**
1. Change **Description** to `Edited after deletion`
2. Click **Save**

**Expected result:** Clear error (program not found / conflict); no ghost row; no false success

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

### TC-017 — Single-character Program Name on edit

**Title:** Minimum-length Program Name boundary on edit

**Preconditions:**
- User is logged in as admin
- Edit form for **Web Development 2026** is open

**Steps:**
1. Change **Program Name** to `A`
2. Click **Save**

**Expected result:** Program is saved as **A** (spec sets no minimum > 1); list reflects the change

**Priority:** Medium

```gherkin
Scenario: Minimum length program name on edit
  Given I am editing "Web Development 2026"
  When I change the Program Name to "A"
  And I click Save
  Then the program list shows "A"
```

---

### TC-018 — Program Name at maximum allowed length (100 characters) on edit

**Title:** 100-character Program Name is accepted (Field Definitions max)

**Preconditions:**
- User is logged in as admin
- Edit form for **Web Development 2026** is open

**Steps:**
1. Change **Program Name** to a unique 100-character string
2. Click **Save**

**Expected result:** Program is saved with the full 100-character name visible in the list

**Priority:** Medium

```gherkin
Scenario: Program name at maximum allowed length on edit
  Given I am editing "Web Development 2026"
  When I change the Program Name to a unique string of 100 characters
  And I click Save
  Then the modal closes
  And the program list shows the full 100-character program name
```

---

### TC-019 — Program Name exceeding 100 characters is rejected on edit

**Title:** Over-max Program Name is blocked (Validation Rules: > 100 → 400)

**Preconditions:**
- User is logged in as admin
- Edit form for **Web Development 2026** is open

**Steps:**
1. Change **Program Name** to a 101-character string
2. Click **Save**

**Expected result (per spec):** Validation error (max 100); program not updated; **Web Development 2026** unchanged

**Priority:** Medium · *Known defect: [DS-39](https://legionqaschool.atlassian.net/browse/DS-39), [DS-95](https://legionqaschool.atlassian.net/browse/DS-95), [DS-170](https://legionqaschool.atlassian.net/browse/DS-170) — names > 100 (even > 255) accepted; [DS-40](https://legionqaschool.atlassian.net/browse/DS-40) — long name times out on save*

```gherkin
Scenario: Program name exceeding 100 characters is rejected on edit
  Given I am editing "Web Development 2026"
  When I change the Program Name to a string of 101 characters
  And I click Save
  Then I see a validation message for Program Name
  And the program list still shows "Web Development 2026"
```

---

### TC-020 — Empty Description on edit is allowed

**Title:** Clearing an optional Description saves successfully (Field Definitions: Description optional)

**Preconditions:**
- User is logged in as admin
- Edit form for **Web Development 2026** (Description populated) is open

**Steps:**
1. Leave **Program Name** as `Web Development 2026`
2. Clear **Description**
3. Click **Save**

**Expected result:** Save succeeds; Description is empty on re-open; row shows name only

**Priority:** High

```gherkin
Scenario: Empty description on edit is allowed
  Given I am editing "Web Development 2026"
  When I clear the Description field
  And I click Save
  Then the modal closes
  And when I reopen the edit form the Description is empty
```

---

### TC-021 — Description at maximum allowed length (500 characters) on edit

**Title:** 500-character Description is stored correctly after edit

**Preconditions:**
- User is logged in as admin
- Edit form for **UX Design Bootcamp** is open

**Steps:**
1. Leave **Program Name** unchanged
2. Change **Description** to a 500-character string
3. Click **Save**, then re-open the edit form

**Expected result:** Full 500-character Description stored without silent truncation

**Priority:** Low

```gherkin
Scenario: Description at maximum allowed length on edit
  Given I am editing "UX Design Bootcamp"
  When I change the Description to a string of 500 characters
  And I click Save
  Then the modal closes
  And when I reopen the edit form the Description contains the full 500-character text
```

---

### TC-022 — Description exceeding 500 characters is rejected on edit

**Title:** Over-max Description is blocked (Validation Rules: > 500 → 400)

**Preconditions:**
- User is logged in as admin
- Edit form for **Web Development 2026** is open

**Steps:**
1. Change **Description** to a 501-character string
2. Click **Save**

**Expected result (per spec):** Validation error; Description not saved over the limit

**Priority:** Low · *Known defect: [DS-144](https://legionqaschool.atlassian.net/browse/DS-144) — descriptions > 500 (even > 2000) accepted*

```gherkin
Scenario: Description exceeding 500 characters is rejected on edit
  Given I am editing "Web Development 2026"
  When I change the Description to a string of 501 characters
  And I click Save
  Then I see a validation message for Description
  And the over-length description is not saved
```

---

### TC-023 — Special characters in Program Name on edit

**Title:** Special characters in edited fields render safely

**Preconditions:**
- User is logged in as admin
- Edit form for **Web Development 2026** is open

**Steps:**
1. Change **Program Name** to `C++ & C# Programming (2026)`
2. Change **Description** to `Languages: C++, C#, and scripting`
3. Click **Save**

**Expected result:** List shows `C++ & C# Programming (2026)` with no encoding corruption or broken HTML

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

### TC-024 — Unicode and emoji in edited fields

**Title:** Unicode Program Name and emoji Description render correctly after edit

**Preconditions:**
- User is logged in as admin
- Edit form for **Web Development 2026** is open

**Steps:**
1. Change **Program Name** to `日本語プログラム 2026`
2. Change **Description** to `Multilingual curriculum 🎓`
3. Click **Save**

**Expected result:** **日本語プログラム 2026** appears correctly; emoji preserved on re-open

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

### TC-025 — Leading and trailing whitespace in Program Name is trimmed on edit

**Title:** Whitespace trimming on edit matches Field Definitions ("trimmed on submit")

**Preconditions:**
- User is logged in as admin
- Edit form for **Web Development 2026** is open

**Steps:**
1. Change **Program Name** to `   Web Development 2026 - Updated   `
2. Click **Save**

**Expected result (per spec):** Stored name trimmed to `Web Development 2026 - Updated`; no leading/trailing spaces

**Priority:** Medium · *Known defect: [DS-171](https://legionqaschool.atlassian.net/browse/DS-171), [DS-143](https://legionqaschool.atlassian.net/browse/DS-143) — whitespace not trimmed on edit*

```gherkin
Scenario: Leading and trailing whitespace in edited program name is trimmed
  Given I am editing "Web Development 2026"
  When I change the Program Name to "   Web Development 2026 - Updated   "
  And I click Save
  Then the program list shows "Web Development 2026 - Updated"
  And the program list does not show the name with leading or trailing spaces
```

---

### TC-026 — Whitespace-only Program Name on edit is rejected

**Title:** Whitespace-only Program Name is treated as empty on edit (Validation Rules)

**Preconditions:**
- User is logged in as admin
- Edit form for **Web Development 2026** is open

**Steps:**
1. Change **Program Name** to `     ` (spaces only)
2. Observe the **Save** button / attempt to submit

**Expected result:** **Save** disabled or submission blocked (trimmed → empty); **Web Development 2026** unchanged

**Priority:** High

```gherkin
Scenario: Whitespace-only program name is rejected on edit
  Given I am editing "Web Development 2026"
  When I change the Program Name to "     "
  Then the Save button is disabled
  And the program list still shows "Web Development 2026"
```

---

### TC-027 — XSS payload in Program Name is sanitized on edit

**Title:** Script payload in Program Name does not execute after edit

**Preconditions:**
- User is logged in as admin
- Edit form for **Web Development 2026** is open

**Steps:**
1. Change **Program Name** to `<script>alert('xss')</script>`
2. Click **Save**
3. View the program list

**Expected result:** No script executes; the value is escaped/sanitized (or rejected). No alert dialog fires.

**Priority:** Medium · *Known defect: [DS-89](https://legionqaschool.atlassian.net/browse/DS-89) — XSS payload accepted in Program Name on edit*

```gherkin
Scenario: XSS payload in edited program name is sanitized
  Given I am editing "Web Development 2026"
  When I change the Program Name to "<script>alert('xss')</script>"
  And I click Save
  Then no script is executed in the browser
  And no alert dialog appears
```

---

### TC-028 — HTML/script injection in Description is sanitized on edit

**Title:** Malicious Description input does not execute after edit

**Preconditions:**
- User is logged in as admin
- Edit form for **Web Development 2026** is open

**Steps:**
1. Change **Description** to `<script>alert('xss')</script>`
2. Click **Save**
3. View the program in the list and re-open edit

**Expected result:** No script execution; content escaped/sanitized; **Program Name** remains `Web Development 2026`

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

### TC-029 — Double-click Save does not send duplicate updates

**Title:** Rapid double-click Save produces exactly one update (no duplicate PATCH)

**Preconditions:**
- User is logged in as admin
- Edit form for **Cloud Computing 2026** is open

**Steps:**
1. Change **Program Name** to `Cloud Computing 2026 - Enterprise`
2. Double-click **Save** quickly

**Expected result:** Exactly one update; one program named **Cloud Computing 2026 - Enterprise**; only one PATCH request sent; no duplicate/corrupt state

**Priority:** Medium · *Known defect: [DS-41](https://legionqaschool.atlassian.net/browse/DS-41), [DS-96](https://legionqaschool.atlassian.net/browse/DS-96), [DS-128](https://legionqaschool.atlassian.net/browse/DS-128) — double-click fires 2 PATCH requests*

```gherkin
Scenario: Double submit on edit does not send duplicate updates
  Given I am editing "Cloud Computing 2026"
  When I change the Program Name to "Cloud Computing 2026 - Enterprise"
  And I double-click Save
  Then the modal closes
  And exactly one program named "Cloud Computing 2026 - Enterprise" exists in the program list
  And only one update request is sent
```

---

### TC-030 — Multi-line Description is preserved on edit

**Title:** Line breaks in Description survive save and re-open

**Preconditions:**
- User is logged in as admin
- Edit form for **DevOps Pipeline Program** is open

**Steps:**
1. Change **Description** to a multi-line value (`Week 1: CI/CD basics` / `Week 2: Kubernetes` / `Week 3: Monitoring`)
2. Click **Save**, then re-open the edit form

**Expected result:** Line breaks preserved in stored and displayed Description

**Priority:** Low

```gherkin
Scenario: Multi-line description is preserved on edit
  Given I am editing "DevOps Pipeline Program"
  When I change the Description to "Week 1: CI/CD basics\nWeek 2: Kubernetes\nWeek 3: Monitoring"
  And I click Save
  Then when I reopen the edit form the Description preserves the line breaks
```

---

### TC-031 — No-op rename (same name) does not trigger a duplicate error

**Title:** Saving the unchanged Program Name does not error against itself

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

### TC-032 — Edit icon (✏️) is present and clickable on each program row

**Title:** Every program row exposes a working edit affordance

**Preconditions:**
- User is logged in as admin
- Programs page has at least one program

**Steps:**
1. Navigate to the Programs page
2. Inspect each program row's action cell
3. Click the **✏️** edit icon on **Web Development 2026**

**Expected result:** A clickable **✏️** edit icon is rendered on each row (not a broken image); clicking it opens the **Edit Program** modal

**Priority:** Medium · *Known defect: [DS-57](https://legionqaschool.atlassian.net/browse/DS-57), [DS-81](https://legionqaschool.atlassian.net/browse/DS-81), [DS-93](https://legionqaschool.atlassian.net/browse/DS-93), [DS-94](https://legionqaschool.atlassian.net/browse/DS-94) — edit icon missing / renders as image / not clickable*

```gherkin
Scenario: Edit icon is present and clickable per row
  Given I am on the Programs page
  And a program "Web Development 2026" exists
  Then I see a clickable edit icon on the "Web Development 2026" row
  When I click the edit icon on "Web Development 2026"
  Then the Edit Program modal opens
```

---

## Coverage Matrix

| Acceptance criterion / spec rule | Test cases |
|----------------------------------|------------|
| AC1 — Open edit form pre-populated with current data | TC-001, TC-032 |
| AC2 — Edit name; Save; modal closes; list updates immediately | TC-002, TC-004, TC-007 |
| AC3 — Partial edit preserves unchanged fields | TC-003, TC-005, TC-031 |
| List refresh in place (Confluence critical rule) | TC-002, TC-004, TC-007 |
| Empty / whitespace name → Save disabled | TC-009, TC-010, TC-026 |
| Uniqueness (incl. case) on rename | TC-013, TC-014, TC-031 |
| Name/Description length limits (100 / 500) | TC-017, TC-018, TC-019, TC-021, TC-022 |
| Trim on submit | TC-025, TC-026 |
| Input sanitization / security | TC-023, TC-027, TC-028 |
| Authorization (Admin/Editor edit; Viewer read-only) | TC-012 |
| Error handling / concurrency | TC-015, TC-016 |
| Double-submit guard | TC-029 |
| UI (AI config, modal dismiss, edit icon, unicode, multi-line) | TC-008, TC-011, TC-024, TC-030, TC-032 |
| Empty description allowed / no-op save | TC-006, TC-020 |

---

## Ambiguities and Gaps in the Acceptance Criteria

1. **Field label** — AC uses "Name"; Create flow and spec use **Program Name**. Assumed **Program Name**.
2. **Pre-population scope** — AC says "current data" but doesn't enumerate fields. Assumed Program Name + Description (+ AI config if previously set).
3. **Empty/whitespace name on edit** — Not stated in AC; taken from Validation Rules (Save disabled / trimmed empty → blocked). TC-009, TC-010, TC-026.
4. **Description optional on edit** — AC allows Description-only change but not whether it can be cleared. Field Definitions says optional → TC-020.
5. **Length limits on edit** — AC silent; spec sets Name ≤ 100, Description ≤ 500. Multiple defects show the app currently accepts far larger values (255+/2000+), a spec-vs-app conflict — TC-018, TC-019, TC-021, TC-022.
6. **Uniqueness on rename** — AC silent; spec requires unique per org. Case-sensitivity unspecified — TC-013, TC-014. Renaming a program to its own name must not error — TC-031.
7. **Modal dismiss** — Spec allows X / Cancel / click-outside; unsaved-change confirmation not defined — TC-011.
8. **List refresh** — Confluence marks in-place refresh "Critical"; several open defects (DS-9, DS-99, DS-108) contradict it — TC-002, TC-004, TC-007.
9. **Success feedback** — Whether a toast appears, and whether the edited row keeps its position/sort order, is unspecified.
10. **Authorization** — Edit AC says only "on the Programs page." Spec: Admin/Editor can edit, Viewer read-only — TC-012.
11. **Error handling** — API failure, concurrent delete, and optimistic-UI rollback not in AC; several open defects (DS-116, DS-36) — TC-015, TC-016.
12. **Double-submit** — No AC; open defects (DS-41, DS-96, DS-128) show duplicate PATCH on double-click — TC-029.
13. **Edit affordance** — AC references an "edit icon"; open defects (DS-57, DS-93, DS-94) show it missing/broken — TC-032.
14. **Security** — Sanitization not in AC; DS-89 shows XSS accepted in Program Name — TC-027, TC-028.
