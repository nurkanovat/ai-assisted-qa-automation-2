Feature: Create new academic program
  DS-1 — As an admin user, I want to create a new academic program
  so that I can begin designing its curriculum structure.
  # Sources: DS-1 (Jira) + Confluence "Program Setup" (Field Definitions,
  # Validation Rules, UI Behavior). Name: required, max 100, unique per org.
  # Description: optional, max 500. Create disabled while name empty; name
  # trimmed on submit; list refreshes in place after every mutation.

  # ------------------------------------------------------------------ Happy paths

  @TC-001 @High @AC-NavigateToForm
  Scenario: Program creation form opens with required fields
    Given I am logged in as admin
    And I am on the Programs page
    When I click "+ New Program"
    Then I see a dialog titled "New Program"
    And the "Program Name" field is visible and editable
    And the "Description" field is visible and editable
    And the "Create" button is present and disabled
    And I see a collapsible "AI Generation Config" section

  @TC-002 @High @AC-SuccessfulCreate
  Scenario: Program is created successfully with valid name and description
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in "Program Name" with "Web Development 2026"
    And I fill in "Description" with "Full-stack web development program"
    And I click "Create"
    Then the modal closes
    And the program list shows "Web Development 2026"

  @TC-003 @Medium @AC-SuccessfulCreate
  Scenario: Program is created with only the required Program Name
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in "Program Name" with "Data Science 2026"
    And I leave the "Description" field empty
    And I click "Create"
    Then the modal closes
    And the program list shows "Data Science 2026"

  @TC-004 @Medium @AC-SuccessfulCreate
  Scenario: Program list updates in place without a page reload
    Given I am logged in as admin
    And I am on the Programs page
    And I am on the program creation form
    When I fill in "Program Name" with "Cybersecurity Fundamentals"
    And I fill in "Description" with "Network security and ethical hacking basics"
    And I click "Create"
    Then the modal closes
    And the program list shows "Cybersecurity Fundamentals" without navigating away

  # ------------------------------------------------------------------ Negative

  @TC-005 @High @AC-EmptyNameValidation
  Scenario: Create is disabled when Program Name is empty
    Given I am logged in as admin
    And I am on the program creation form
    When I leave the "Program Name" field empty
    Then the "Create" button is disabled

  @TC-006 @High @AC-EmptyNameValidation
  Scenario: Empty Program Name does not create a program
    Given I am logged in as admin
    And I am on the program creation form
    When I leave the "Program Name" field empty
    And I fill in "Description" with "Orphan description without a program name"
    And I attempt to submit the form
    Then no new program is added to the program list
    And the program list does not show "Orphan description without a program name"

  @TC-007 @High @Uniqueness
  Scenario: Duplicate program name is rejected
    Given I am logged in as admin
    And a program named "Web Development 2026" already exists
    And I am on the program creation form
    When I fill in "Program Name" with "Web Development 2026"
    And I fill in "Description" with "Duplicate attempt description"
    And I click "Create"
    Then I see a duplicate-name validation error
    And the program list contains exactly one entry named "Web Development 2026"

  @TC-008 @High @Authorization
  Scenario: Non-admin role cannot create a program
    Given I am logged in as a non-admin user
    When I navigate to the Programs page
    Then I do not see an enabled "+ New Program" action
    Or I see an access denied response when attempting to create a program

  @TC-009 @Medium @ModalDismiss
  Scenario: Closing the modal without saving does not create a program
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in "Program Name" with "Unsaved Program Draft"
    And I fill in "Description" with "This should not be persisted"
    And I close the modal without clicking Create
    Then the modal closes
    And the program list does not show "Unsaved Program Draft"

  @TC-010 @Medium @ErrorHandling
  Scenario: API failure during creation shows an error and no false success
    Given I am logged in as admin
    And I am on the program creation form
    And the program creation API will fail
    When I fill in "Program Name" with "API Failure Test Program"
    And I fill in "Description" with "Testing error handling"
    And I click "Create"
    Then I see an error message indicating creation failed
    And the modal does not close as if creation succeeded
    And the program list does not show "API Failure Test Program"

  # ------------------------------------------------------------------ Edge cases

  @TC-011 @Medium @Boundary
  Scenario: Minimum length Program Name (single character) is accepted
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in "Program Name" with "A"
    And I fill in "Description" with "Single character name test"
    And I click "Create"
    Then the modal closes
    And the program list shows "A"

  @TC-012 @Medium @Boundary
  Scenario: Program Name at the maximum allowed length (100 characters) is accepted
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in "Program Name" with a unique name of 100 characters
    And I fill in "Description" with "Max length name test"
    And I click "Create"
    Then the modal closes
    And the program list shows the full 100-character program name

  @TC-013 @Medium @Boundary
  Scenario: Program Name exceeding 100 characters is rejected
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in "Program Name" with a name of 101 characters
    And I fill in "Description" with "Over max length test"
    And I click "Create"
    Then I see a validation error for "Program Name"
    And the program list does not show the over-length name

  @TC-014 @High @Validation
  Scenario: Empty Description is allowed
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in "Program Name" with "Mobile App Development 2026"
    And I leave the "Description" field empty
    Then the "Create" button is enabled
    When I click "Create"
    Then the modal closes
    And the program list shows "Mobile App Development 2026"

  @TC-015 @Low @Boundary
  Scenario: Description at the maximum allowed length (500 characters) is accepted
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in "Program Name" with "UX Design Bootcamp"
    And I fill in "Description" with a string of 500 characters
    And I click "Create"
    Then the modal closes
    And the program list shows "UX Design Bootcamp"

  @TC-016 @Medium @SpecialCharacters
  Scenario: Special characters in Program Name are handled safely
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in "Program Name" with "C++ & C# Programming (2026)"
    And I fill in "Description" with "Languages: C++, C#, and scripting"
    And I click "Create"
    Then the modal closes
    And the program list shows "C++ & C# Programming (2026)"

  @TC-017 @Low @Unicode
  Scenario: Unicode and emoji in fields render correctly
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in "Program Name" with "日本語プログラム 2026"
    And I fill in "Description" with "Multilingual curriculum 🎓"
    And I click "Create"
    Then the modal closes
    And the program list shows "日本語プログラム 2026"

  @TC-018 @Medium @Validation
  Scenario: Leading and trailing whitespace in Program Name is trimmed
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in "Program Name" with "   Web Development 2026   "
    And I fill in "Description" with "Whitespace trimming test"
    And I click "Create"
    Then the program list shows "Web Development 2026"
    And the program list does not show the name with leading or trailing spaces

  @TC-019 @High @Validation
  Scenario: Whitespace-only Program Name is treated as empty
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in "Program Name" with "     "
    And I fill in "Description" with "Whitespace only name test"
    Then the "Create" button is disabled
    And no new program is added to the program list

  @TC-020 @Medium @Security
  Scenario: HTML/script injection in Description is sanitized
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in "Program Name" with "Security Test Program"
    And I fill in "Description" with "<script>alert('xss')</script>"
    And I click "Create"
    Then no script is executed in the browser
    And the program list shows "Security Test Program"

  @TC-021 @Low @Formatting
  Scenario: Multi-line Description is preserved
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in "Program Name" with "DevOps Pipeline Program"
    And I fill in "Description" with "Week 1: CI/CD basics\nWeek 2: Kubernetes\nWeek 3: Monitoring"
    And I click "Create"
    Then the modal closes
    And the program list shows "DevOps Pipeline Program"

  @TC-022 @Medium @UI
  Scenario: AI Generation Config section toggles visibility
    Given I am logged in as admin
    And I am on the program creation form
    When I click "Show AI Generation Config"
    Then I see the Total Hours and Default Session Hours fields
    When I click "Hide AI Generation Config"
    Then the Total Hours and Default Session Hours fields are hidden

  @TC-023 @Medium @UI
  Scenario: Program list table shows name and description in one Program column
    Given I am logged in as admin
    When I navigate to the Programs page
    Then I see a "Programs" heading and a "+ New Program" button
    And I see a table with a "Program" column
    When I create a program with a name and description
    Then the program name and description appear in the first table cell

  @TC-024 @Medium @ModalDismiss
  Scenario: Modal X button closes the form without saving
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in "Program Name" with "X Close Draft"
    And I click the modal close button
    Then the modal closes
    And the program list does not show "X Close Draft"

  @TC-025 @Low @UI
  Scenario: Program created without a description shows a name-only row
    Given I am logged in as admin
    And I am on the program creation form
    When I fill in "Program Name" with "No Description Program"
    And I leave the "Description" field empty
    And I click "Create"
    Then the program list row for "No Description Program" shows only the program name

# ---------------------------------------------------------------------------
# Ambiguities / gaps to confirm with product / BA (see Test cases/DS-1_ticket_OUTPUT.md):
#   1. Description optionality confirmed by Field Definitions spec (TC-014).
#   2. Uniqueness (TC-007), max-length (TC-013), and trim (TC-018) come from the
#      Confluence Validation Rules / Field Definitions.
#   3. Non-admin authorization (TC-008) not stated in the ticket; assumed per spec roles.
#   4. API-failure behavior (TC-010) not stated in the ticket; assumed graceful error.
# ---------------------------------------------------------------------------
