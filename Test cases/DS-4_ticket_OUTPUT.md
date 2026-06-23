# DS-4 — Test Plan: Delete Program with Confirmation

**Feature:** Delete program with confirmation  
**Source:** DS-4_ticket_INPUT  
**Scope:** Programs page, delete icon per program row, confirmation dialog, admin access

---

## Positive Flows

### TC-001 — Confirmation dialog appears when delete icon is clicked

**Title:** Delete action requires explicit confirmation before removal

**Preconditions:**
- User is logged in as admin
- Programs page is open
- Program **Test Program** exists in the program list

**Steps:**
1. Locate **Test Program** in the program list
2. Click the delete icon for **Test Program**

**Expected result:** Confirmation dialog is displayed; **Test Program** is still visible in the list

**Priority:** High

```gherkin
Scenario: Delete program shows confirmation dialog
  Given I am logged in as admin
  And I am on the Programs page
  And a program "Test Program" exists
  When I click the delete icon for "Test Program"
  Then I see a confirmation dialog
  And the program list still shows "Test Program"
```

---

### TC-002 — Confirmed deletion removes program from the list

**Title:** Program is permanently removed from the list after confirmation

**Preconditions:**
- User is logged in as admin
- Programs page is open
- Program **Test Program** exists
- Confirmation dialog for **Test Program** is open

**Steps:**
1. Click **Confirm** (or **Delete**) in the confirmation dialog
2. Observe the program list

**Expected result:**
- Confirmation dialog closes
- **Test Program** is removed from the program list immediately

**Priority:** High

```gherkin
Scenario: Delete program with confirmation
  Given a program "Test Program" exists
  And I am on the Programs page
  When I click the delete icon for "Test Program"
  Then I see a confirmation dialog
  When I confirm deletion
  Then "Test Program" is removed from the program list
```

---

### TC-003 — Cancelled deletion keeps program in the list

**Title:** Program remains when deletion is cancelled

**Preconditions:**
- User is logged in as admin
- Programs page is open
- Program **Web Development 2026** exists
- Confirmation dialog is open after clicking delete for **Web Development 2026**

**Steps:**
1. Click **Cancel** in the confirmation dialog
2. Observe the program list

**Expected result:**
- Confirmation dialog closes
- **Web Development 2026** still appears in the program list

**Priority:** High

```gherkin
Scenario: Cancel program deletion
  Given I am logged in as admin
  And I am on the Programs page
  And a program "Web Development 2026" exists
  When I click the delete icon for "Web Development 2026"
  And I see the confirmation dialog
  And I click Cancel
  Then the program still exists in the list
  And the program list shows "Web Development 2026"
```

---

### TC-004 — Program list updates in place after confirmed deletion

**Title:** List refreshes without full page navigation after delete

**Preconditions:**
- User is logged in as admin
- Programs page is open
- Programs **Data Science 2026** and **Cybersecurity Fundamentals** exist

**Steps:**
1. Click the delete icon for **Data Science 2026**
2. Confirm deletion in the dialog
3. Remain on the Programs page

**Expected result:**
- **Data Science 2026** is removed from the list without navigating away
- **Cybersecurity Fundamentals** remains in the list

**Priority:** Medium

```gherkin
Scenario: Program list updates in place after deletion
  Given I am on the Programs page
  And a program "Data Science 2026" exists
  And a program "Cybersecurity Fundamentals" exists
  When I click the delete icon for "Data Science 2026"
  And I confirm deletion
  Then "Data Science 2026" is removed from the program list
  And the program list still shows "Cybersecurity Fundamentals"
```

---

### TC-005 — Deleted program stays removed after page refresh

**Title:** Deletion persists after browser refresh

**Preconditions:**
- User is logged in as admin
- Program **Test Program** existed and was successfully deleted

**Steps:**
1. Confirm **Test Program** is not in the program list
2. Refresh the Programs page

**Expected result:** **Test Program** does not reappear in the program list

**Priority:** Medium

```gherkin
Scenario: Deleted program does not reappear after refresh
  Given a program "Test Program" was deleted successfully
  And I am on the Programs page
  When I refresh the page
  Then the program list does not show "Test Program"
```

---

## Negative Flows

### TC-006 — Program is not deleted without confirmation

**Title:** Closing the dialog without confirming leaves program intact

**Preconditions:**
- User is logged in as admin
- Programs page is open
- Program **Mobile App Development 2026** exists
- Confirmation dialog is open for **Mobile App Development 2026**

**Steps:**
1. Close the confirmation dialog without confirming (X button or Escape — per UI)
2. Observe the program list

**Expected result:**
- **Mobile App Development 2026** remains in the program list
- No deletion occurred

**Priority:** High

```gherkin
Scenario: Program is not deleted without confirmation
  Given I am on the Programs page
  And a program "Mobile App Development 2026" exists
  When I click the delete icon for "Mobile App Development 2026"
  And I see the confirmation dialog
  And I close the confirmation dialog without confirming
  Then the program list still shows "Mobile App Development 2026"
```

---

### TC-007 — Non-admin cannot delete programs

**Title:** Non-admin users cannot remove programs from the list

**Preconditions:**
- User is logged in as a non-admin role (e.g. instructor or student)
- Program **Web Development 2026** exists

**Steps:**
1. Navigate to the Programs page (if accessible)
2. Look for the delete icon on **Web Development 2026**
3. If visible, attempt to delete the program

**Expected result:**
- Delete icon is hidden or disabled, **or**
- Access is denied (403 / redirect / error message)
- **Web Development 2026** remains in the program list

**Priority:** High

```gherkin
Scenario: Non-admin cannot delete a program
  Given I am logged in as a non-admin user
  And a program "Web Development 2026" exists
  When I navigate to the Programs page
  Then I do not see an enabled delete action for "Web Development 2026"
  Or I see an access denied message when attempting to delete the program
```

---

### TC-008 — API failure during delete does not remove program from list

**Title:** Failed delete shows error and keeps program visible

**Preconditions:**
- User is logged in as admin
- Programs page is open
- Program **API Failure Delete Test** exists
- Backend delete endpoint is unavailable or returns an error (simulated)

**Steps:**
1. Click the delete icon for **API Failure Delete Test**
2. Confirm deletion while the API fails
3. Observe the program list

**Expected result:**
- Error message indicating deletion failed
- **API Failure Delete Test** remains in the program list
- User is not shown a false success state

**Priority:** Medium

```gherkin
Scenario: API failure during delete shows error
  Given I am on the Programs page
  And a program "API Failure Delete Test" exists
  And the program delete API will fail
  When I click the delete icon for "API Failure Delete Test"
  And I confirm deletion
  Then I see an error message indicating deletion failed
  And the program list still shows "API Failure Delete Test"
```

---

### TC-009 — Cancelled deletion does not trigger backend delete

**Title:** Cancel prevents any server-side deletion request

**Preconditions:**
- User is logged in as admin
- Programs page is open
- Program **Cloud Computing 2026** exists

**Steps:**
1. Click the delete icon for **Cloud Computing 2026**
2. Click **Cancel** in the confirmation dialog
3. Refresh the Programs page

**Expected result:** **Cloud Computing 2026** still exists after refresh; no partial or soft-delete state

**Priority:** Medium

```gherkin
Scenario: Cancelled deletion does not persist on refresh
  Given I am on the Programs page
  And a program "Cloud Computing 2026" exists
  When I click the delete icon for "Cloud Computing 2026"
  And I see the confirmation dialog
  And I click Cancel
  And I refresh the Programs page
  Then the program list still shows "Cloud Computing 2026"
```

---

### TC-010 — Deleting a program does not remove other programs

**Title:** Delete affects only the targeted program row

**Preconditions:**
- User is logged in as admin
- Programs page is open
- Programs **UX Design Bootcamp**, **DevOps Pipeline Program**, and **Test Program** exist

**Steps:**
1. Click the delete icon for **Test Program**
2. Confirm deletion
3. Observe the full program list

**Expected result:**
- **Test Program** is removed
- **UX Design Bootcamp** and **DevOps Pipeline Program** remain unchanged

**Priority:** High

```gherkin
Scenario: Delete removes only the selected program
  Given I am on the Programs page
  And a program "Test Program" exists
  And a program "UX Design Bootcamp" exists
  And a program "DevOps Pipeline Program" exists
  When I click the delete icon for "Test Program"
  And I confirm deletion
  Then "Test Program" is removed from the program list
  And the program list still shows "UX Design Bootcamp"
  And the program list still shows "DevOps Pipeline Program"
```

---

## Edge Cases

### TC-011 — Delete program with special characters in name

**Title:** Confirmation and deletion work for names containing special characters

**Preconditions:**
- User is logged in as admin
- Programs page is open
- Program **C++ & C# Programming (2026)** exists

**Steps:**
1. Click the delete icon for **C++ & C# Programming (2026)**
2. Confirm the confirmation dialog shows the correct program name
3. Confirm deletion

**Expected result:**
- Confirmation dialog references **C++ & C# Programming (2026)** correctly (no encoding issues)
- Program is removed from the list

**Priority:** Medium

```gherkin
Scenario: Delete program with special characters in name
  Given I am on the Programs page
  And a program "C++ & C# Programming (2026)" exists
  When I click the delete icon for "C++ & C# Programming (2026)"
  Then I see a confirmation dialog
  When I confirm deletion
  Then "C++ & C# Programming (2026)" is removed from the program list
```

---

### TC-012 — Delete program with Unicode name

**Title:** Unicode program name displays correctly in confirmation dialog

**Preconditions:**
- User is logged in as admin
- Programs page is open
- Program **日本語プログラム 2026** exists

**Steps:**
1. Click the delete icon for **日本語プログラム 2026**
2. Verify confirmation dialog content
3. Confirm deletion

**Expected result:** Dialog shows **日本語プログラム 2026** correctly; program removed from list after confirm

**Priority:** Low

```gherkin
Scenario: Delete program with Unicode name
  Given I am on the Programs page
  And a program "日本語プログラム 2026" exists
  When I click the delete icon for "日本語プログラム 2026"
  Then I see a confirmation dialog
  When I confirm deletion
  Then "日本語プログラム 2026" is removed from the program list
```

---

### TC-013 — Delete program with maximum-length name

**Title:** Long program name is handled in confirmation dialog and deletion

**Preconditions:**
- User is logged in as admin
- Programs page is open
- Program **Advanced Web Development and Cloud Architecture Specialization Program Track 2026 Edition Alpha** exists (100 characters)

**Steps:**
1. Click the delete icon for the program
2. Observe confirmation dialog layout and text
3. Confirm deletion

**Expected result:**
- Dialog displays the full or truncated name clearly (per UI design)
- Program is removed from the list after confirmation

**Priority:** Low

```gherkin
Scenario: Delete program with long name
  Given I am on the Programs page
  And a program "Advanced Web Development and Cloud Architecture Specialization Program Track 2026 Edition Alpha" exists
  When I click the delete icon for "Advanced Web Development and Cloud Architecture Specialization Program Track 2026 Edition Alpha"
  Then I see a confirmation dialog
  When I confirm deletion
  Then "Advanced Web Development and Cloud Architecture Specialization Program Track 2026 Edition Alpha" is removed from the program list
```

---

### TC-014 — Delete the last program in the list

**Title:** Empty program list state is shown after deleting the only program

**Preconditions:**
- User is logged in as admin
- Programs page is open
- **Test Program** is the only program in the list

**Steps:**
1. Click the delete icon for **Test Program**
2. Confirm deletion
3. Observe the program list

**Expected result:**
- **Test Program** is removed
- Program list shows empty state (or zero programs) without errors

**Priority:** Medium

```gherkin
Scenario: Delete last program in list
  Given I am on the Programs page
  And "Test Program" is the only program in the list
  When I click the delete icon for "Test Program"
  And I confirm deletion
  Then "Test Program" is removed from the program list
  And the program list shows no programs
```

---

### TC-015 — Double-click confirm does not cause errors

**Title:** Rapid confirm clicks produce a single deletion

**Preconditions:**
- User is logged in as admin
- Programs page is open
- Program **Test Program** exists
- Confirmation dialog is open

**Steps:**
1. Double-click **Confirm** quickly
2. Observe the program list and any error messages

**Expected result:**
- **Test Program** is removed exactly once
- No duplicate API errors or broken UI state

**Priority:** Medium

```gherkin
Scenario: Double confirm click does not cause duplicate delete errors
  Given I am on the Programs page
  And a program "Test Program" exists
  When I click the delete icon for "Test Program"
  And I see a confirmation dialog
  And I double-click confirm deletion
  Then "Test Program" is removed from the program list
  And I do not see duplicate error messages
```

---

### TC-016 — Delete program that is open in edit modal

**Title:** Deleting a program while its edit form is open is handled safely

**Preconditions:**
- User is logged in as admin
- Programs page is open
- Program **Web Development 2026** exists
- Edit form for **Web Development 2026** is open in another tab or the edit modal is open (per UI)

**Steps:**
1. With edit form open, attempt to delete **Web Development 2026** from the list (or close edit and delete — document flow)
2. Confirm deletion in the dialog

**Expected result:**
- Edit modal closes or shows appropriate message
- **Web Development 2026** is removed from the list without orphaned UI state

**Priority:** Medium

```gherkin
Scenario: Delete program while edit form is open
  Given I am on the Programs page
  And a program "Web Development 2026" exists
  And I am editing "Web Development 2026"
  When I click the delete icon for "Web Development 2026"
  And I confirm deletion
  Then "Web Development 2026" is removed from the program list
  And the edit form is no longer open
```

---

### TC-017 — Delete already-deleted program in concurrent session

**Title:** Stale delete attempt shows clear error

**Preconditions:**
- User is logged in as admin
- Programs page is open with **Test Program** visible
- **Test Program** was deleted in another session before confirm

**Steps:**
1. Click the delete icon for **Test Program**
2. Confirm deletion in the dialog

**Expected result:**
- Error indicating program not found or already deleted
- Program list does not show a false success; UI refreshes to current state

**Priority:** Medium

```gherkin
Scenario: Confirm delete on already-deleted program shows error
  Given I am on the Programs page
  And I see a program "Test Program" in the list
  And the program "Test Program" was deleted in another session
  When I click the delete icon for "Test Program"
  And I confirm deletion
  Then I see an error message indicating the program no longer exists
  And the program list does not show "Test Program"
```

---

### TC-018 — Confirmation dialog identifies the correct program among similar names

**Title:** Delete targets the intended program when names are similar

**Preconditions:**
- User is logged in as admin
- Programs page is open
- Programs **Web Development 2026** and **Web Development 2026 - Updated** exist

**Steps:**
1. Click the delete icon for **Web Development 2026** (not the Updated variant)
2. Verify confirmation dialog references **Web Development 2026**
3. Confirm deletion

**Expected result:**
- **Web Development 2026** is removed
- **Web Development 2026 - Updated** remains in the list

**Priority:** High

```gherkin
Scenario: Delete targets correct program among similar names
  Given I am on the Programs page
  And a program "Web Development 2026" exists
  And a program "Web Development 2026 - Updated" exists
  When I click the delete icon for "Web Development 2026"
  Then I see a confirmation dialog for "Web Development 2026"
  When I confirm deletion
  Then "Web Development 2026" is removed from the program list
  And the program list still shows "Web Development 2026 - Updated"
```

---

### TC-019 — Escape key cancels deletion

**Title:** Keyboard dismiss cancels delete without removing program

**Preconditions:**
- User is logged in as admin
- Programs page is open
- Program **Informatique & IA - Niveau 2** exists
- Confirmation dialog is open

**Steps:**
1. Press **Escape**
2. Observe the program list

**Expected result:**
- Confirmation dialog closes
- **Informatique & IA - Niveau 2** remains in the program list

**Priority:** Low

```gherkin
Scenario: Escape key cancels program deletion
  Given I am on the Programs page
  And a program "Informatique & IA - Niveau 2" exists
  When I click the delete icon for "Informatique & IA - Niveau 2"
  And I see a confirmation dialog
  And I press Escape
  Then the confirmation dialog closes
  And the program list still shows "Informatique & IA - Niveau 2"
```

---

### TC-020 — Deleted program name can be reused for new program

**Title:** Name becomes available after successful deletion

**Preconditions:**
- User is logged in as admin
- Program **Test Program** was deleted successfully
- Program creation form is available

**Steps:**
1. Click **+ New Program**
2. Enter `Test Program` in **Program Name**
3. Enter `Recreated after deletion` in **Description**
4. Click **Create**

**Expected result:** New **Test Program** is created successfully and appears in the list

**Priority:** Medium

```gherkin
Scenario: Deleted program name can be reused
  Given a program "Test Program" was deleted successfully
  And I am on the program creation form
  When I fill in Program Name with "Test Program"
  And I fill in Description with "Recreated after deletion"
  And I click Create
  Then the program list shows "Test Program"
```

---

## Coverage Matrix

| Acceptance criterion | Test cases |
|----------------------|------------|
| Delete icon opens confirmation; confirm removes program | TC-001, TC-002, TC-004, TC-005 |
| Cancel keeps program in list | TC-003, TC-006, TC-009, TC-019 |

---

## Ambiguities and Gaps in the Acceptance Criteria

1. **Confirm button label** — AC says "confirm deletion" but does not specify button text (**Confirm**, **Delete**, **Yes**, etc.).

2. **Dialog content** — No requirement for program name, warning message, or irreversibility notice in the confirmation dialog (TC-011, TC-018).

3. **Dismiss methods** — Cancel is specified; Escape, X button, and click-outside behavior are not defined (TC-006, TC-019).

4. **Login / role** — Admin role implied from related tickets; non-admin delete behavior not in AC (TC-007).

5. **List update timing** — AC says program is removed but does not specify immediate in-place update vs. refresh required (TC-004).

6. **Persistence** — No AC for whether deletion survives page refresh or logout/login (TC-005).

7. **Success feedback** — No toast or message after successful deletion; only list update is specified.

8. **Empty list state** — Behavior when deleting the last program is not defined (TC-014).

9. **Error handling** — API failures, network timeout, and concurrent delete conflicts are not in AC (TC-008, TC-017).

10. **Related data** — No rule for cascading delete (courses, enrollments, students linked to the program).

11. **Undo / soft delete** — AC implies hard delete; no recovery or trash/archive behavior specified.

12. **Double submit** — Rapid confirm clicks and idempotency are not addressed (TC-015).

13. **Edit modal interaction** — Deleting a program while it is being edited is not covered in AC (TC-016).

14. **Accessibility** — Keyboard navigation to delete icon and dialog focus trap are not specified.

15. **Similar program names** — No AC ensuring the correct row is deleted when names differ slightly (TC-018).

16. **Name reuse** — Whether a deleted program's name can be reused is not specified (TC-020).
