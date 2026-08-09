Feature: Program name validation and duplicate prevention
  DS-3 — As an admin user, I want the system to prevent invalid or duplicate
  program names so that data integrity is maintained.
  # Sources: DS-3 (Jira) + Confluence "Program Setup" (Field Definitions,
  # Validation Rules, UI Behavior) + live app (test.didaxis.studio).
  # Name: required, max 100, unique per org, trimmed on submit.
  # Whitespace-only rejected (Create disabled). Description optional.
  # Live gaps: duplicates accepted, names >100 accepted, trim not applied.

  # ------------------------------------------------------------------ Happy paths

  @TC-001 @High @AC-ValidName
  Scenario: Valid program name is accepted
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in Program Name with "Data Science 2026"
    And I fill in Description with "Introduction to statistics and machine learning"
    And I click Create
    Then the modal closes
    And the program list shows "Data Science 2026"

  @TC-002 @High @AC-SpecialCharacters
  Scenario: Accept program name with special characters
    Given I am on the program creation form
    When I enter "Informatique & IA - Niveau 2" as the program name
    And I fill in Description with "Programme de deuxième niveau en informatique et intelligence artificielle"
    And I click Create
    Then the program is created successfully
    And the program list shows "Informatique & IA - Niveau 2"

  @TC-003 @Medium @AC-SpecialCharacters
  Scenario: Programming special characters in program name are accepted
    Given I am on the program creation form
    When I fill in Program Name with "C++ & C# Programming (2026)"
    And I fill in Description with "Languages: C++, C#, and scripting fundamentals"
    And I click Create
    Then the program is created successfully
    And the program list shows "C++ & C# Programming (2026)"

  @TC-004 @Medium @Unicode
  Scenario: Unicode program name is accepted
    Given I am on the program creation form
    When I fill in Program Name with "日本語プログラム 2026"
    And I fill in Description with "Multilingual curriculum track"
    And I click Create
    Then the program is created successfully
    And the program list shows "日本語プログラム 2026"

  # ------------------------------------------------------------------ Negative

  @TC-005 @High @AC-WhitespaceOnly
  Scenario: Reject program name with only whitespace
    Given I am on the program creation form
    When I enter "   " as the program name
    And I fill in Description with "Whitespace-only name validation test"
    Then the Create button is disabled
    And no new program is added to the program list

  @TC-006 @High @EmptyName
  Scenario: Empty program name prevents submission
    Given I am on the program creation form
    When I leave the Program Name field empty
    And I fill in Description with "Description without a program name"
    Then the Create button is disabled
    And no new program is added to the program list

  @TC-007 @High @AC-Duplicate
  Scenario: Reject duplicate program name
    Given a program "Web Development 2026" already exists
    And I am on the program creation form
    When I fill in Program Name with "Web Development 2026"
    And I fill in Description with "Duplicate attempt — second web dev cohort"
    And I click Create
    Then I see an error indicating the name already exists
    And the program list contains exactly one entry named "Web Development 2026"

  @TC-008 @Medium @AC-Duplicate
  Scenario: Duplicate error retains form data for correction
    Given a program "Web Development 2026" already exists
    And I am on the program creation form
    When I fill in Program Name with "Web Development 2026"
    And I fill in Description with "Full-stack web development program — cohort B"
    And I click Create
    Then I see an error indicating the name already exists
    And the Description field still shows "Full-stack web development program — cohort B"
    When I change the Program Name to "Web Development 2026 - Cohort B"
    And I click Create
    Then the program list shows "Web Development 2026 - Cohort B"

  @TC-009 @High @AC-WhitespaceOnly
  Scenario: Tab-only program name is rejected
    Given I am on the program creation form
    When I enter only tab characters as the program name
    And I fill in Description with "Tab-only name validation test"
    Then the Create button is disabled
    And no new program is added to the program list

  @TC-010 @Medium @AC-WhitespaceOnly
  Scenario: Mixed whitespace-only program name is rejected
    Given I am on the program creation form
    When I enter "  \t  \t  " as the program name
    And I fill in Description with "Mixed whitespace validation test"
    Then the Create button is disabled
    And no new program is added to the program list

  @TC-011 @Medium @AC-Duplicate
  Scenario: Duplicate rejection does not leave partial records
    Given a program "Web Development 2026" already exists
    And I am on the program creation form
    When I fill in Program Name with "Web Development 2026"
    And I fill in Description with "Should not persist on duplicate rejection"
    And I click Create
    Then I see an error indicating the name already exists
    When I refresh the Programs page
    Then exactly one program named "Web Development 2026" exists in the program list

  # ------------------------------------------------------------------ Edge cases

  @TC-012 @High @Uniqueness
  Scenario: Duplicate check rejects case-variant names
    Given a program "Web Development 2026" already exists
    And I am on the program creation form
    When I fill in Program Name with "web development 2026"
    And I fill in Description with "Lowercase duplicate attempt"
    And I click Create
    Then I see an error indicating the name already exists

  @TC-013 @High @AC-Duplicate
  Scenario: Duplicate detected after trimming padded program name
    Given a program "Web Development 2026" already exists
    And I am on the program creation form
    When I fill in Program Name with "   Web Development 2026   "
    And I fill in Description with "Padded duplicate name attempt"
    And I click Create
    Then I see an error indicating the name already exists
    And exactly one program named "Web Development 2026" exists in the program list

  @TC-014 @Medium @Trim
  Scenario: Valid padded program name is trimmed on create
    Given I am on the program creation form
    When I fill in Program Name with "   Cybersecurity Fundamentals   "
    And I fill in Description with "Network security and ethical hacking basics"
    And I click Create
    Then the program list shows "Cybersecurity Fundamentals"
    And the program list does not show a name with leading or trailing spaces

  @TC-015 @Medium @Boundary
  Scenario: Single character program name is accepted
    Given I am on the program creation form
    When I fill in Program Name with "A"
    And I fill in Description with "Single character name boundary test"
    And I click Create
    Then the program list shows "A"

  @TC-016 @Medium @Boundary
  Scenario: Program name at maximum allowed length
    Given I am on the program creation form
    When I fill in Program Name with a unique 100-character name
    And I fill in Description with "Max length name validation test"
    And I click Create
    Then the program list shows the full 100-character program name

  @TC-017 @Medium @Boundary
  Scenario: Program name exceeding maximum length is rejected
    Given I am on the program creation form
    When I fill in Program Name with a string of 120 characters
    And I fill in Description with "Over max length validation test"
    And I click Create
    Then I see a validation message for Program Name
    And no new program is added to the program list

  @TC-018 @High @Uniqueness
  Scenario: Duplicate program name rejected on edit
    Given a program "Web Development 2026" already exists
    And I am editing "Data Science 2026"
    When I change the Program Name to "Web Development 2026"
    And I click Save
    Then I see an error indicating the name already exists
    And the program list still shows "Data Science 2026"

  @TC-019 @Medium @Uniqueness
  Scenario: Edit with same program name does not trigger duplicate error
    Given a program "Web Development 2026" already exists
    And I am editing "Web Development 2026"
    When I leave the Program Name as "Web Development 2026"
    And I change the Description to "Updated description only"
    And I click Save
    Then the modal closes
    And I do not see an error indicating the name already exists

  @TC-020 @Low @SpecialCharacters
  Scenario: Emoji in program name is accepted
    Given I am on the program creation form
    When I fill in Program Name with "Cloud Computing 2026 🎓"
    And I fill in Description with "Cloud platforms and DevOps"
    And I click Create
    Then the program list shows "Cloud Computing 2026 🎓"

  @TC-021 @Medium @Security
  Scenario: HTML in program name is sanitized or rejected
    Given I am on the program creation form
    When I fill in Program Name with "<script>alert('xss')</script>"
    And I fill in Description with "Security validation test"
    And I click Create
    Then no script is executed in the browser
    And the program list shows the name as escaped text
    Or I see a validation message rejecting the name

  @TC-022 @Medium @AC-Duplicate
  Scenario: Double submit on duplicate name does not create extra records
    Given a program "Web Development 2026" already exists
    And I am on the program creation form
    When I fill in Program Name with "Web Development 2026"
    And I fill in Description with "Double-click duplicate test"
    And I double-click Create
    Then I see an error indicating the name already exists
    And exactly one program named "Web Development 2026" exists in the program list
