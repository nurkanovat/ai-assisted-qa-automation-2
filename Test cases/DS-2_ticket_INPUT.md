# DS-2 — Edit Existing Program Details

## Ticket

**Feature:** Edit existing program details  
**Role:** Admin user

## Acceptance Criteria

### Scenario: Open program for editing

```gherkin
Given I am on the Programs page
And a program "Web Development 2026" exists
When I click the edit icon on "Web Development 2026"
Then I see the edit form pre-populated with the program's current data
```

### Scenario: Successfully edit a program name

```gherkin
Given I am editing "Web Development 2026"
When I change the Name to "Web Development 2026 - Updated"
And I click Save
Then the modal closes
And the program list immediately shows "Web Development 2026 - Updated"
```

### Scenario: Edit preserves unchanged fields

```gherkin
Given I am editing a program
When I only change the Description
And I click Save
Then the Name and other fields remain unchanged
```

## Form Fields

| Field         | Notes                                              |
|---------------|----------------------------------------------------|
| Program Name  | Required; pre-populated on open; Save disabled when empty |
| Description   | Pre-populated on open; optional/required not specified in AC |

## UI Elements

| Element        | Label / Text   |
|----------------|----------------|
| Page           | Programs       |
| Action control | Edit icon (per program row) |
| Submit button  | Save           |
| Container      | Modal          |

## Test Plan Requirements

- All test cases must be in Gherkin
- Cover every AC with at least one test case
- Add edge cases the ACs do not mention (boundary values, empty inputs, special characters, duplicates, max-length)
- Add negative test cases (what should NOT happen)
- Structure each test case with: ID, Title, Preconditions, Steps, Expected result, Priority (High / Medium / Low)
- Group by: Positive flows, Negative flows, Edge cases
- Use real field names and values, not placeholders
