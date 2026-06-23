# DS-4 — Delete Program with Confirmation

## Ticket

**Feature:** Delete program with confirmation  
**Role:** Admin user

## Acceptance Criteria

### Scenario: Delete program with confirmation

```gherkin
Given a program "Test Program" exists
When I click the delete icon for "Test Program"
Then I see a confirmation dialog
When I confirm deletion
Then "Test Program" is removed from the program list
```

### Scenario: Cancel program deletion

```gherkin
Given I click the delete icon for a program
When I see the confirmation dialog
And I click Cancel
Then the program still exists in the list
```

## UI Elements

| Element              | Label / Text                          |
|----------------------|---------------------------------------|
| Page                 | Programs                              |
| Action control       | Delete icon (per program row)         |
| Confirmation dialog  | Shown before deletion                 |
| Confirm action       | Confirm / Delete (per UI)             |
| Cancel action        | Cancel                                |

## Test Plan Requirements

- All test cases must be in Gherkin
- Cover every AC with at least one test case
- Add edge cases the ACs do not mention (boundary values, empty inputs, special characters, duplicates, max-length)
- Add negative test cases (what should NOT happen)
- Structure each test case with: ID, Title, Preconditions, Steps, Expected result, Priority (High / Medium / Low)
- Group by: Positive flows, Negative flows, Edge cases
- Use real field names and values, not placeholders
