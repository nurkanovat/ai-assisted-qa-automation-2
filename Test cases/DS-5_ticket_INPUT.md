# DS-5 — Program List Filtering and Display

## Ticket

**Feature:** Program list filtering and display  
**Role:** Admin user

## Acceptance Criteria

### Scenario: Display program list with key details

```gherkin
Given programs exist in the system
When I navigate to the Programs page
Then I see a list showing each program's name and description
```

### Scenario: Empty state when no programs exist

```gherkin
Given no programs exist
When I navigate to the Programs page
Then I see a message indicating no programs have been created
And I see a prompt to create the first program
```

## UI Elements

| Element        | Label / Text   |
|----------------|----------------|
| Page           | Programs       |
| List columns   | Program Name, Description (per program row) |
| Action button  | + New Program  |
| Empty state    | No programs message + create prompt |

## Test Plan Requirements

- All test cases must be in Gherkin
- Cover every AC with at least one test case
- Add edge cases the ACs do not mention (boundary values, empty inputs, special characters, duplicates, max-length)
- Add negative test cases (what should NOT happen)
- Structure each test case with: ID, Title, Preconditions, Steps, Expected result, Priority (High / Medium / Low)
- Group by: Positive flows, Negative flows, Edge cases
- Use real field names and values, not placeholders
