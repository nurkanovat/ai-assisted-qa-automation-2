# DS-3 — Program Name Validation and Duplicate Prevention

## Ticket

**Feature:** Program name validation and duplicate prevention  
**Role:** Admin user

## Acceptance Criteria

### Scenario: Reject program name with only whitespace

```gherkin
Given I am on the program creation form
When I enter "   " as the program name
And I click Create
Then the form is not submitted (name is trimmed, treated as empty)
```

### Scenario: Accept program name with special characters

```gherkin
Given I am on the program creation form
When I enter "Informatique & IA - Niveau 2" as the program name
And I fill other required fields
And I click Create
Then the program is created successfully
```

### Scenario: Reject duplicate program name

```gherkin
Given a program "Web Development 2026" already exists
When I try to create a new program with the same name
Then I see an error indicating the name already exists
```

## Form Fields

| Field         | Notes                                                                 |
|---------------|-----------------------------------------------------------------------|
| Program Name  | Required; trimmed before validation; whitespace-only treated as empty |
| Description   | Required for successful create per "fill other required fields" in AC |

## UI Elements

| Element        | Label / Text   |
|----------------|----------------|
| Page           | Programs       |
| Action button  | + New Program  |
| Submit button  | Create         |
| Container      | Modal          |

## Validation Rules (from AC)

| Rule                         | Behavior                                              |
|------------------------------|-------------------------------------------------------|
| Whitespace-only name         | Trimmed; treated as empty; form not submitted         |
| Special characters in name   | Allowed (e.g. `&`, `-`, spaces within name)           |
| Duplicate name on create     | Rejected with error indicating name already exists      |

## Test Plan Requirements

- All test cases must be in Gherkin
- Cover every AC with at least one test case
- Add edge cases the ACs do not mention (boundary values, empty inputs, special characters, duplicates, max-length)
- Add negative test cases (what should NOT happen)
- Structure each test case with: ID, Title, Preconditions, Steps, Expected result, Priority (High / Medium / Low)
- Group by: Positive flows, Negative flows, Edge cases
- Use real field names and values, not placeholders
