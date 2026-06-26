# TodoMVC — Test Plan: Add, Complete, and Delete Todos

**Feature:** Core todo list operations  
**Application:** [TodoMVC Demo](https://demo.playwright.dev/todomvc/)  
**Source:** test_template.md  
**Scope:** New todo input (`What needs to be done?`), todo list items, completion toggle, delete control, items-left counter

---

## Positive Flows

### TC-001 — Single todo is added to the list

**Title:** User can add one todo item and see it in the list

**Preconditions:**
- Browser is open
- User navigates to `https://demo.playwright.dev/todomvc/`
- Todo list is empty (fresh page load)

**Steps:**
1. Click the **What needs to be done?** input field
2. Type `Buy groceries`
3. Press **Enter**

**Expected result:**
- Todo list contains one item labeled `Buy groceries`
- Item is shown as active (not completed)
- Footer shows `1 item left`

**Priority:** High

```gherkin
Scenario: Add a single todo item
  Given I am on the TodoMVC page at "https://demo.playwright.dev/todomvc/"
  And the todo list is empty
  When I type "Buy groceries" into the "What needs to be done?" field
  And I press Enter
  Then the todo list shows "Buy groceries"
  And the item "Buy groceries" is not marked completed
  And the footer shows "1 item left"
```

---

### TC-002 — Multiple todos are added in sequence

**Title:** User can add several todo items to the same list

**Preconditions:**
- User is on the TodoMVC page
- Todo list is empty

**Steps:**
1. Add `Buy groceries` and press **Enter**
2. Add `Walk the dog` and press **Enter**
3. Add `Pay electricity bill` and press **Enter**

**Expected result:**
- Todo list shows three items in order: `Buy groceries`, `Walk the dog`, `Pay electricity bill`
- Footer shows `3 items left`
- All items are active

**Priority:** High

```gherkin
Scenario: Add multiple todo items
  Given I am on the TodoMVC page
  And the todo list is empty
  When I add the todo "Buy groceries"
  And I add the todo "Walk the dog"
  And I add the todo "Pay electricity bill"
  Then the todo list shows:
    | Buy groceries        |
    | Walk the dog         |
    | Pay electricity bill |
  And the footer shows "3 items left"
```

---

### TC-003 — Todo item can be marked complete

**Title:** User can complete an active todo item

**Preconditions:**
- User is on the TodoMVC page
- Todo list contains `Buy groceries`

**Steps:**
1. Click the completion toggle checkbox next to `Buy groceries`

**Expected result:**
- Item `Buy groceries` is marked completed (strikethrough / completed styling)
- Footer shows `0 items left`

**Priority:** High

```gherkin
Scenario: Complete a todo item
  Given I am on the TodoMVC page
  And the todo list contains "Buy groceries"
  When I mark "Buy groceries" as completed
  Then the item "Buy groceries" is shown as completed
  And the footer shows "0 items left"
```

---

### TC-004 — Completed todo can be toggled back to active

**Title:** User can uncomplete a previously completed item

**Preconditions:**
- User is on the TodoMVC page
- Todo list contains completed item `Buy groceries`

**Steps:**
1. Click the completion toggle checkbox next to completed `Buy groceries`

**Expected result:**
- Item `Buy groceries` is active again (no completed styling)
- Footer shows `1 item left`

**Priority:** Medium

```gherkin
Scenario: Uncomplete a todo item
  Given I am on the TodoMVC page
  And the todo list contains a completed item "Buy groceries"
  When I mark "Buy groceries" as not completed
  Then the item "Buy groceries" is shown as active
  And the footer shows "1 item left"
```

---

### TC-005 — Todo item is removed from the list

**Title:** User can delete a todo item

**Preconditions:**
- User is on the TodoMVC page
- Todo list contains `Buy groceries` and `Walk the dog`

**Steps:**
1. Hover over `Buy groceries` to reveal the delete control
2. Click the **×** destroy button for `Buy groceries`

**Expected result:**
- `Buy groceries` is removed from the todo list
- `Walk the dog` remains in the list
- Footer shows `1 item left`

**Priority:** High

```gherkin
Scenario: Delete a todo item
  Given I am on the TodoMVC page
  And the todo list contains:
    | Buy groceries |
    | Walk the dog  |
  When I delete the todo "Buy groceries"
  Then the todo list does not show "Buy groceries"
  And the todo list shows "Walk the dog"
  And the footer shows "1 item left"
```

---

### TC-006 — Items-left counter decreases when an item is completed

**Title:** Completing an item updates the active-item counter

**Preconditions:**
- User is on the TodoMVC page
- Todo list contains `Buy groceries` and `Walk the dog`

**Steps:**
1. Mark `Buy groceries` as completed

**Expected result:**
- Footer shows `1 item left` (only active items counted)

**Priority:** Medium

```gherkin
Scenario: Counter reflects only active todos after completion
  Given I am on the TodoMVC page
  And the todo list contains:
    | Buy groceries |
    | Walk the dog  |
  When I mark "Buy groceries" as completed
  Then the footer shows "1 item left"
```

---

### TC-007 — Items-left counter decreases when an item is deleted

**Title:** Deleting an item updates the active-item counter

**Preconditions:**
- User is on the TodoMVC page
- Todo list contains three active items

**Steps:**
1. Delete `Walk the dog`

**Expected result:**
- Footer shows `2 items left`

**Priority:** Medium

```gherkin
Scenario: Counter updates after delete
  Given I am on the TodoMVC page
  And the todo list contains:
    | Buy groceries        |
    | Walk the dog         |
    | Pay electricity bill |
  When I delete the todo "Walk the dog"
  Then the footer shows "2 items left"
```

---

## Negative Flows

### TC-008 — Empty input does not create a todo

**Title:** Submitting an empty todo field leaves the list unchanged

**Preconditions:**
- User is on the TodoMVC page
- Todo list is empty

**Steps:**
1. Click the **What needs to be done?** field
2. Press **Enter** without typing text

**Expected result:**
- Todo list remains empty
- Footer is not shown (no todos exist)
- No blank todo row appears

**Priority:** High

```gherkin
Scenario: Empty todo is not added
  Given I am on the TodoMVC page
  And the todo list is empty
  When I press Enter in the "What needs to be done?" field without entering text
  Then the todo list is empty
  And the todo footer is not visible
```

---

### TC-009 — Whitespace-only input does not create a todo

**Title:** Spaces-only input is rejected and does not add an item

**Preconditions:**
- User is on the TodoMVC page
- Todo list is empty

**Steps:**
1. Type `   ` (spaces only) in **What needs to be done?**
2. Press **Enter**

**Expected result:**
- Todo list remains empty
- No item containing only spaces is created

**Priority:** High

```gherkin
Scenario: Whitespace-only todo is not added
  Given I am on the TodoMVC page
  And the todo list is empty
  When I type "   " into the "What needs to be done?" field
  And I press Enter
  Then the todo list is empty
```

---

### TC-010 — Typing without Enter does not add a todo

**Title:** Partial input stays in the field until Enter is pressed

**Preconditions:**
- User is on the TodoMVC page
- Todo list is empty

**Steps:**
1. Type `Buy groceries` in **What needs to be done?**
2. Do not press **Enter**
3. Click outside the input or tab away

**Expected result:**
- Todo list remains empty until **Enter** is pressed
- Input may retain typed text, but no list item is created prematurely

**Priority:** Medium

```gherkin
Scenario: Todo is not added before Enter
  Given I am on the TodoMVC page
  And the todo list is empty
  When I type "Buy groceries" into the "What needs to be done?" field
  And I do not press Enter
  Then the todo list is empty
```

---

### TC-011 — Deleting one item does not remove other items

**Title:** Delete action affects only the targeted todo

**Preconditions:**
- User is on the TodoMVC page
- Todo list contains `Buy groceries`, `Walk the dog`, and `Pay electricity bill`

**Steps:**
1. Delete `Walk the dog`

**Expected result:**
- `Buy groceries` and `Pay electricity bill` remain
- `Walk the dog` is absent
- List order of remaining items is preserved

**Priority:** High

```gherkin
Scenario: Delete does not affect unrelated todos
  Given I am on the TodoMVC page
  And the todo list contains:
    | Buy groceries        |
    | Walk the dog         |
    | Pay electricity bill |
  When I delete the todo "Walk the dog"
  Then the todo list shows:
    | Buy groceries        |
    | Pay electricity bill |
  And the todo list does not show "Walk the dog"
```

---

### TC-012 — Completing one item does not complete others

**Title:** Completion toggle applies only to the selected item

**Preconditions:**
- User is on the TodoMVC page
- Todo list contains `Buy groceries` and `Walk the dog`

**Steps:**
1. Mark `Buy groceries` as completed

**Expected result:**
- `Buy groceries` is completed
- `Walk the dog` remains active
- Footer shows `1 item left`

**Priority:** High

```gherkin
Scenario: Completing one todo does not complete others
  Given I am on the TodoMVC page
  And the todo list contains:
    | Buy groceries |
    | Walk the dog  |
  When I mark "Buy groceries" as completed
  Then the item "Buy groceries" is shown as completed
  And the item "Walk the dog" is shown as active
  And the footer shows "1 item left"
```

---

### TC-013 — Delete on empty list is not possible

**Title:** No delete controls exist when there are no todos

**Preconditions:**
- User is on the TodoMVC page
- Todo list is empty

**Steps:**
1. Inspect the page for todo rows and destroy buttons

**Expected result:**
- No todo items are displayed
- No delete (**×**) buttons are available

**Priority:** Low

```gherkin
Scenario: Cannot delete when list is empty
  Given I am on the TodoMVC page
  And the todo list is empty
  Then there are no todo items in the list
  And there are no delete buttons visible
```

---

## Edge Cases

### TC-014 — Todo text with special characters is stored correctly

**Title:** Special characters appear literally in the todo label

**Preconditions:**
- User is on the TodoMVC page
- Todo list is empty

**Steps:**
1. Add todo `Buy milk & eggs @ 50% off! (#sale)` and press **Enter**

**Expected result:**
- List shows exact text `Buy milk & eggs @ 50% off! (#sale)`
- Characters are not HTML-encoded or stripped in the UI

**Priority:** Medium

```gherkin
Scenario: Special characters in todo text
  Given I am on the TodoMVC page
  And the todo list is empty
  When I add the todo "Buy milk & eggs @ 50% off! (#sale)"
  Then the todo list shows "Buy milk & eggs @ 50% off! (#sale)"
```

---

### TC-015 — Duplicate todo titles are allowed

**Title:** Identical todo text can be added more than once

**Preconditions:**
- User is on the TodoMVC page
- Todo list is empty

**Steps:**
1. Add `Buy groceries` and press **Enter**
2. Add `Buy groceries` again and press **Enter**

**Expected result:**
- Two separate todo rows both labeled `Buy groceries`
- Footer shows `2 items left`

**Priority:** Medium

```gherkin
Scenario: Duplicate todo titles are permitted
  Given I am on the TodoMVC page
  And the todo list is empty
  When I add the todo "Buy groceries"
  And I add the todo "Buy groceries"
  Then the todo list contains 2 items labeled "Buy groceries"
  And the footer shows "2 items left"
```

---

### TC-016 — Very long todo text is accepted and displayed

**Title:** Long todo label is added without breaking the list layout

**Preconditions:**
- User is on the TodoMVC page
- Todo list is empty

**Steps:**
1. Add a todo with 500 characters: `Plan quarterly review meeting with stakeholders from engineering, product, design, marketing, and customer success to align roadmap priorities deliverables and success metrics for Q3`
2. Press **Enter**

**Expected result:**
- Todo is added to the list
- Full text is stored and visible (wrapped or truncated per UI, but not lost on add)
- No JavaScript error or page crash

**Priority:** Low

```gherkin
Scenario: Long todo text is accepted
  Given I am on the TodoMVC page
  And the todo list is empty
  When I add a todo with 500 characters
  Then the todo list contains 1 item
  And the todo text length is 500 characters
```

---

### TC-017 — Leading and trailing whitespace is trimmed on add

**Title:** Todo label is stored without extra surrounding spaces

**Preconditions:**
- User is on the TodoMVC page
- Todo list is empty

**Steps:**
1. Type `   Buy groceries   ` in **What needs to be done?**
2. Press **Enter**

**Expected result:**
- List shows `Buy groceries` (trimmed)
- No leading or trailing spaces in the displayed label

**Priority:** Medium

```gherkin
Scenario: Todo text is trimmed on create
  Given I am on the TodoMVC page
  And the todo list is empty
  When I type "   Buy groceries   " into the "What needs to be done?" field
  And I press Enter
  Then the todo list shows "Buy groceries"
```

---

### TC-018 — Unicode and emoji characters are preserved

**Title:** Non-ASCII characters render correctly in todo labels

**Preconditions:**
- User is on the TodoMVC page
- Todo list is empty

**Steps:**
1. Add `Buy café supplies 🛒 naïve résumé 日本語` and press **Enter**

**Expected result:**
- Todo list shows the exact Unicode string including emoji
- Item can be completed and deleted normally

**Priority:** Low

```gherkin
Scenario: Unicode and emoji in todo text
  Given I am on the TodoMVC page
  And the todo list is empty
  When I add the todo "Buy café supplies 🛒 naïve résumé 日本語"
  Then the todo list shows "Buy café supplies 🛒 naïve résumé 日本語"
```

---

### TC-019 — HTML-like input is treated as plain text

**Title:** Markup in todo text is not executed as HTML

**Preconditions:**
- User is on the TodoMVC page
- Todo list is empty

**Steps:**
1. Add `<script>alert('xss')</script>` and press **Enter**
2. Add `<b>Bold task</b>` and press **Enter**

**Expected result:**
- Text appears literally in the list
- No script execution or bold rendering from injected tags
- Items behave like normal todos for complete/delete

**Priority:** Medium

```gherkin
Scenario: HTML-like text is stored as plain text
  Given I am on the TodoMVC page
  And the todo list is empty
  When I add the todo "<script>alert('xss')</script>"
  And I add the todo "<b>Bold task</b>"
  Then the todo list shows "<script>alert('xss')</script>"
  And the todo list shows "<b>Bold task</b>"
  And no alert dialog is displayed
```

---

### TC-020 — Single-character todo is accepted

**Title:** Minimum-length meaningful todo (one character) can be added

**Preconditions:**
- User is on the TodoMVC page
- Todo list is empty

**Steps:**
1. Add `A` and press **Enter**

**Expected result:**
- Todo list shows `A`
- Footer shows `1 item left`

**Priority:** Low

```gherkin
Scenario: Single character todo
  Given I am on the TodoMVC page
  And the todo list is empty
  When I add the todo "A"
  Then the todo list shows "A"
  And the footer shows "1 item left"
```

---

### TC-021 — Deleting the last todo clears the list and footer

**Title:** Removing the final item returns the app to the empty state

**Preconditions:**
- User is on the TodoMVC page
- Todo list contains only `Buy groceries`

**Steps:**
1. Delete `Buy groceries`

**Expected result:**
- Todo list is empty
- Footer (filters, counter, clear completed) is hidden
- **What needs to be done?** input remains available

**Priority:** Medium

```gherkin
Scenario: Delete last todo returns to empty state
  Given I am on the TodoMVC page
  And the todo list contains "Buy groceries"
  When I delete the todo "Buy groceries"
  Then the todo list is empty
  And the todo footer is not visible
  And the "What needs to be done?" field is visible
```

---

### TC-022 — Completed item remains in list until deleted

**Title:** Completing an item does not remove it from the list

**Preconditions:**
- User is on the TodoMVC page
- Todo list contains `Buy groceries`

**Steps:**
1. Mark `Buy groceries` as completed

**Expected result:**
- `Buy groceries` still appears in the list with completed styling
- Item is not auto-deleted on completion
- Delete control is still available for the completed item

**Priority:** Medium

```gherkin
Scenario: Completed todo stays in list until deleted
  Given I am on the TodoMVC page
  And the todo list contains "Buy groceries"
  When I mark "Buy groceries" as completed
  Then the todo list shows "Buy groceries"
  And the item "Buy groceries" is shown as completed
  And I can delete the todo "Buy groceries"
```

---

## Coverage Matrix

| Acceptance criterion | Test cases |
|----------------------|------------|
| User can add a todo item to the list | TC-001, TC-002 |
| User can complete an item | TC-003, TC-004, TC-006, TC-012, TC-022 |
| User can delete item from the list | TC-005, TC-007, TC-011, TC-021 |

---

## Ambiguities and Gaps in the Acceptance Criteria

1. **Input validation rules** — AC requires adding an item but does not specify behavior for empty input, whitespace-only input, or trimmed text (TC-008, TC-009, TC-017).

2. **Duplicate policy** — No rule on whether duplicate todo titles are allowed or should be deduplicated (TC-015).

3. **Maximum length** — AC does not define a max character limit for todo text or expected UI behavior when text is very long (TC-016).

4. **Uncomplete behavior** — AC mentions completing an item but not whether toggling back to active is in scope (TC-004).

5. **Delete interaction** — AC says delete is supported but not how (hover **×** button vs keyboard, swipe, etc.); destroy button visibility on touch devices is unspecified (TC-005).

6. **Persistence** — No AC for local storage, page refresh, or session persistence after add/complete/delete.

7. **Counter semantics** — AC does not define whether the items-left count includes only active items or all items (TC-006, TC-007 assume active-only per standard TodoMVC).

8. **Filters and bulk actions** — Demo includes **All / Active / Completed** filters, **Toggle all**, and **Clear completed**; these are out of AC scope but exist in the app.

9. **Accessibility** — Keyboard-only add/complete/delete and screen reader labels are not mentioned in AC.

10. **Error handling** — No guidance for offline mode, slow network, or storage quota failures.

11. **Visual completion state** — AC does not specify strikethrough, checkbox state, or CSS class expectations beyond "complete."

12. **Edit in place** — Standard TodoMVC supports double-click edit; AC does not mention editing existing todo text.
