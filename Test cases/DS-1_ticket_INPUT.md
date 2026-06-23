# DS-1 — Create New Academic Program

## Ticket

**Feature:** Create new academic program  
**Role:** Admin user

## Acceptance Criteria

### Scenario: Navigate to program creation form

```gherkin
Given I am logged in as admin
When I navigate to the Programs page
And I click "+ New Program"
Then I see the program creation form with fields: Program Name, Description
```

### Scenario: Successfully create a program

```gherkin
Given I am on the program creation form
When I fill in Program Name with "Web Development 2026"
And I fill in Description with "Full-stack web development program"
And I click Create
Then the modal closes
And the program list shows "Web Development 2026"
```

### Scenario: Validation prevents empty program name

```gherkin
Given I am on the program creation form
When I leave the Program Name field empty
Then the Create button is disabled
```

## Form Fields

| Field         | Notes                                      |
|---------------|--------------------------------------------|
| Program Name  | Required; Create disabled when empty       |
| Description   | Not specified in AC                        |

## UI Elements

| Element        | Label / Text   |
|----------------|----------------|
| Page           | Programs       |
| Action button  | + New Program  |
| Submit button  | Create         |
| Container      | Modal          |

## Test Plan Requirements

- All test cases must be in Gherkin
- Cover every AC with at least one test case
- Add edge cases the ACs do not mention (boundary values, empty inputs, special characters, duplicates, max-length)
- Add negative test cases (what should NOT happen)
- Structure each test case with: ID, Title, Preconditions, Steps, Expected result, Priority (High / Medium / Low)
- Group by: Positive flows, Negative flows, Edge cases
- Use real field names and values, not placeholders
