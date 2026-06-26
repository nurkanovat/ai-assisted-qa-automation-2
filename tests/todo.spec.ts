import { test, expect, Page } from '@playwright/test';

const TODO_URL = 'https://demo.playwright.dev/todomvc/';

async function gotoTodoPage(page: Page) {
  await page.goto(TODO_URL);
}

async function addTodo(page: Page, text: string) {
  const input = page.getByPlaceholder('What needs to be done?');
  await input.click();
  await input.fill(text);
  await input.press('Enter');
}

function todoListItems(page: Page) {
  return page.getByRole('listitem').filter({ has: page.getByRole('checkbox') });
}

function todoItem(page: Page, text: string) {
  return todoListItems(page).filter({ hasText: text });
}

async function completeTodo(page: Page, text: string) {
  await todoItem(page, text).getByRole('checkbox').check();
}

async function uncompleteTodo(page: Page, text: string) {
  await todoItem(page, text).getByRole('checkbox').uncheck();
}

async function deleteTodo(page: Page, text: string) {
  const item = todoItem(page, text);
  await item.hover();
  await item.getByRole('button').click();
}

// TC-001 — Single todo is added to the list
test('TC-001: user can add one todo item and see it in the list', async ({ page }) => {
  await gotoTodoPage(page);

  await addTodo(page, 'Buy groceries');

  await expect(page.getByText('Buy groceries')).toBeVisible();
  await expect(todoItem(page, 'Buy groceries').getByRole('checkbox')).not.toBeChecked();
  await expect(page.getByText('1 item left')).toBeVisible();
});

// TC-002 — Multiple todos are added in sequence
test('TC-002: user can add several todo items to the same list', async ({ page }) => {
  await gotoTodoPage(page);

  await addTodo(page, 'Buy groceries');
  await addTodo(page, 'Walk the dog');
  await addTodo(page, 'Pay electricity bill');

  const items = todoListItems(page);
  await expect(items.nth(0)).toContainText('Buy groceries');
  await expect(items.nth(1)).toContainText('Walk the dog');
  await expect(items.nth(2)).toContainText('Pay electricity bill');
  await expect(page.getByText('3 items left')).toBeVisible();
});

// TC-003 — Todo item can be marked complete
test('TC-003: user can complete an active todo item', async ({ page }) => {
  await gotoTodoPage(page);
  await addTodo(page, 'Buy groceries');

  await completeTodo(page, 'Buy groceries');

  await expect(todoItem(page, 'Buy groceries').getByRole('checkbox')).toBeChecked();
  await expect(page.getByText('0 items left')).toBeVisible();
});

// TC-004 — Completed todo can be toggled back to active
test('TC-004: user can uncomplete a previously completed item', async ({ page }) => {
  await gotoTodoPage(page);
  await addTodo(page, 'Buy groceries');
  await completeTodo(page, 'Buy groceries');

  await uncompleteTodo(page, 'Buy groceries');

  await expect(todoItem(page, 'Buy groceries').getByRole('checkbox')).not.toBeChecked();
  await expect(page.getByText('1 item left')).toBeVisible();
});

// TC-005 — Todo item is removed from the list
test('TC-005: user can delete a todo item', async ({ page }) => {
  await gotoTodoPage(page);
  await addTodo(page, 'Buy groceries');
  await addTodo(page, 'Walk the dog');

  await deleteTodo(page, 'Buy groceries');

  await expect(page.getByText('Buy groceries')).not.toBeVisible();
  await expect(page.getByText('Walk the dog')).toBeVisible();
  await expect(page.getByText('1 item left')).toBeVisible();
});

// TC-006 — Items-left counter decreases when an item is completed
test('TC-006: completing an item updates the active-item counter', async ({ page }) => {
  await gotoTodoPage(page);
  await addTodo(page, 'Buy groceries');
  await addTodo(page, 'Walk the dog');

  await completeTodo(page, 'Buy groceries');

  await expect(page.getByText('1 item left')).toBeVisible();
});

// TC-007 — Items-left counter decreases when an item is deleted
test('TC-007: deleting an item updates the active-item counter', async ({ page }) => {
  await gotoTodoPage(page);
  await addTodo(page, 'Buy groceries');
  await addTodo(page, 'Walk the dog');
  await addTodo(page, 'Pay electricity bill');

  await deleteTodo(page, 'Walk the dog');

  await expect(page.getByText('2 items left')).toBeVisible();
});

// TC-008 — Empty input does not create a todo
test('TC-008: submitting an empty todo field leaves the list unchanged', async ({ page }) => {
  await gotoTodoPage(page);

  const input = page.getByPlaceholder('What needs to be done?');
  await input.click();
  await input.press('Enter');

  await expect(todoListItems(page)).toHaveCount(0);
  await expect(page.getByText(/item(s)? left/)).not.toBeVisible();
});

// TC-009 — Whitespace-only input does not create a todo
test('TC-009: spaces-only input is rejected and does not add an item', async ({ page }) => {
  await gotoTodoPage(page);

  await addTodo(page, '   ');

  await expect(todoListItems(page)).toHaveCount(0);
});

// TC-010 — Typing without Enter does not add a todo
test('TC-010: partial input stays in the field until Enter is pressed', async ({ page }) => {
  await gotoTodoPage(page);

  const input = page.getByPlaceholder('What needs to be done?');
  await input.fill('Buy groceries');
  await page.getByText('todos').click();

  await expect(todoListItems(page)).toHaveCount(0);
});

// TC-011 — Deleting one item does not remove other items
test('TC-011: delete action affects only the targeted todo', async ({ page }) => {
  await gotoTodoPage(page);
  await addTodo(page, 'Buy groceries');
  await addTodo(page, 'Walk the dog');
  await addTodo(page, 'Pay electricity bill');

  await deleteTodo(page, 'Walk the dog');

  const items = todoListItems(page);
  await expect(items).toHaveCount(2);
  await expect(items.nth(0)).toContainText('Buy groceries');
  await expect(items.nth(1)).toContainText('Pay electricity bill');
  await expect(page.getByText('Walk the dog')).not.toBeVisible();
});

// TC-012 — Completing one item does not complete others
test('TC-012: completion toggle applies only to the selected item', async ({ page }) => {
  await gotoTodoPage(page);
  await addTodo(page, 'Buy groceries');
  await addTodo(page, 'Walk the dog');

  await completeTodo(page, 'Buy groceries');

  await expect(todoItem(page, 'Buy groceries').getByRole('checkbox')).toBeChecked();
  await expect(todoItem(page, 'Walk the dog').getByRole('checkbox')).not.toBeChecked();
  await expect(page.getByText('1 item left')).toBeVisible();
});

// TC-013 — Delete on empty list is not possible
test('TC-013: no delete controls exist when there are no todos', async ({ page }) => {
  await gotoTodoPage(page);

  await expect(todoListItems(page)).toHaveCount(0);
});

// TC-014 — Todo text with special characters is stored correctly
test('TC-014: special characters appear literally in the todo label', async ({ page }) => {
  await gotoTodoPage(page);

  const specialText = 'Buy milk & eggs @ 50% off! (#sale)';
  await addTodo(page, specialText);

  await expect(page.getByText(specialText)).toBeVisible();
});

// TC-015 — Duplicate todo titles are allowed
test('TC-015: identical todo text can be added more than once', async ({ page }) => {
  await gotoTodoPage(page);

  await addTodo(page, 'Buy groceries');
  await addTodo(page, 'Buy groceries');

  await expect(todoItem(page, 'Buy groceries')).toHaveCount(2);
  await expect(page.getByText('2 items left')).toBeVisible();
});

// TC-016 — Very long todo text is accepted and displayed
test('TC-016: long todo label is added without breaking the list layout', async ({ page }) => {
  await gotoTodoPage(page);

  const longText =
    'Plan quarterly review meeting with stakeholders from engineering, product, design, marketing, and customer success to align roadmap priorities deliverables and success metrics for Q3'.repeat(
      3,
    ).slice(0, 500);

  await addTodo(page, longText);

  await expect(todoListItems(page)).toHaveCount(1);
  await expect(page.getByText(longText)).toBeVisible();
});

// TC-017 — Leading and trailing whitespace is trimmed on add
test('TC-017: todo label is stored without extra surrounding spaces', async ({ page }) => {
  await gotoTodoPage(page);

  const input = page.getByPlaceholder('What needs to be done?');
  await input.fill('   Buy groceries   ');
  await input.press('Enter');

  await expect(todoItem(page, 'Buy groceries')).toBeVisible();
  await expect(todoItem(page, 'Buy groceries').getByText('Buy groceries', { exact: true })).toBeVisible();
});

// TC-018 — Unicode and emoji characters are preserved
test('TC-018: non-ASCII characters render correctly in todo labels', async ({ page }) => {
  await gotoTodoPage(page);

  const unicodeText = 'Buy café supplies 🛒 naïve résumé 日本語';
  await addTodo(page, unicodeText);

  await expect(page.getByText(unicodeText)).toBeVisible();
});

// TC-019 — HTML-like input is treated as plain text
test('TC-019: markup in todo text is not executed as HTML', async ({ page }) => {
  await gotoTodoPage(page);

  page.on('dialog', (dialog) => dialog.accept());

  await addTodo(page, "<script>alert('xss')</script>");
  await addTodo(page, '<b>Bold task</b>');

  await expect(page.getByText("<script>alert('xss')</script>")).toBeVisible();
  await expect(page.getByText('<b>Bold task</b>')).toBeVisible();
});

// TC-020 — Single-character todo is accepted
test('TC-020: minimum-length meaningful todo can be added', async ({ page }) => {
  await gotoTodoPage(page);

  await addTodo(page, 'A');

  await expect(page.getByText('A', { exact: true })).toBeVisible();
  await expect(page.getByText('1 item left')).toBeVisible();
});

// TC-021 — Deleting the last todo clears the list and footer
test('TC-021: removing the final item returns the app to the empty state', async ({ page }) => {
  await gotoTodoPage(page);
  await addTodo(page, 'Buy groceries');

  await deleteTodo(page, 'Buy groceries');

  await expect(todoListItems(page)).toHaveCount(0);
  await expect(page.getByText(/item(s)? left/)).not.toBeVisible();
  await expect(page.getByPlaceholder('What needs to be done?')).toBeVisible();
});

// TC-022 — Completed item remains in list until deleted
test('TC-022: completing an item does not remove it from the list', async ({ page }) => {
  await gotoTodoPage(page);
  await addTodo(page, 'Buy groceries');

  await completeTodo(page, 'Buy groceries');

  await expect(page.getByText('Buy groceries')).toBeVisible();
  await expect(todoItem(page, 'Buy groceries').getByRole('checkbox')).toBeChecked();

  const item = todoItem(page, 'Buy groceries');
  await item.hover();
  await expect(item.getByRole('button')).toBeVisible();
});
