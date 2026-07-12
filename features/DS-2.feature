Feature: Edit existing program details
  DS-2 — As an admin user, I want to edit an existing program's details
  so that I can correct or update program information after creation.
  # Sources: DS-2 (Jira) + Confluence "Program Setup" (Field Definitions,
  # Validation Rules, UI Behavior). Name: required, max 100, unique per org,
  # trimmed on submit. Description: optional, max 500. Edit via the pencil
  # (edit) icon opens the "Edit Program" modal pre-populated; Save disabled
  # while name empty; list refreshes in place after every mutation.
  # Admin/Editor can edit; Viewer is read-only.

  # ------------------------------------------------------------------ Happy paths

  @TC-001 @High @AC-OpenForEditing
  Scenario: Edit form opens pre-populated with the program's current data
    Given I am on the Programs page
    And a program "Web Development 2026" exists
    When I click the edit icon on "Web Development 2026"
    Then I see the edit form pre-populated with the program's current data
    And the "Program Name" field shows "Web Development 2026"
    And the "Description" field shows "Full-stack web development program"
    And the "Save" button is enabled

  @TC-002 @High @AC-EditName
  Scenario: Program name update is saved and shown immediately in the list
    Given I am editing "Web Development 2026"
    When I change the "Program Name" to "Web Development 2026 - Updated"
    And I click "Save"
    Then the modal closes
    And the program list immediately shows "Web Development 2026 - Updated"
    And the program list does not show "Web Development 2026"

  @TC-003 @High @AC-PreserveUnchanged
  Scenario: Editing only the Description preserves the Program Name
    Given I am editing "Web Development 2026"
    And the "Description" is "Full-stack web development program"
    When I change only the "Description" to "Full-stack web development program - revised curriculum"
    And I click "Save"
    Then the "Program Name" remains "Web Development 2026"
    And the "Description" is "Full-stack web development program - revised curriculum"

  @TC-004 @Medium @AC-EditName
  Scenario: Both Program Name and Description are updated in one save
    Given I am editing "Cybersecurity Fundamentals"
    When I change the "Program Name" to "Cybersecurity Fundamentals 2026"
    And I change the "Description" to "Network security, ethical hacking, and incident response"
    And I click "Save"
    Then the modal closes
    And the program list shows "Cybersecurity Fundamentals 2026"

  @TC-005 @Low @NoChange
  Scenario: Saving with no changes keeps program data intact
    Given I am editing "Mobile App Development 2026"
    And I have not modified any field
    When I click "Save"
    Then the program list still shows "Mobile App Development 2026"
    And reopening the edit form shows the original Program Name and Description

  @TC-006 @Medium @UI
  Scenario: Edit modal exposes the collapsible AI Generation Config section
    Given I am editing "Web Development 2026"
    When I click "Show AI Generation Config"
    Then I see the Total Hours and Default Session Hours fields
    When I click "Hide AI Generation Config"
    Then the AI Generation Config fields are hidden

  # ------------------------------------------------------------------ Negative

  @TC-007 @High @EmptyNameValidation
  Scenario: Save is disabled when Program Name is cleared
    Given I am editing "Web Development 2026"
    When I clear the "Program Name" field
    Then the "Save" button is disabled
    And the program list still shows "Web Development 2026"

  @TC-008 @High @EmptyNameValidation
  Scenario: Cleared Program Name does not persist via forced submission
    Given I am editing "Web Development 2026"
    When I clear the "Program Name" field
    And I fill in "Description" with "Attempted empty name save"
    And I attempt to submit the edit form
    Then the program list still shows "Web Development 2026"
    And no program exists with an empty name

  @TC-009 @Medium @ModalDismiss
  Scenario: Closing the modal without saving discards edits
    Given I am editing "Web Development 2026"
    When I change the "Program Name" to "Unsaved Edit Draft"
    And I change the "Description" to "This change should not be saved"
    And I close the edit modal without saving
    Then the modal closes
    And the program list shows "Web Development 2026"
    And the program list does not show "Unsaved Edit Draft"

  @TC-010 @High @Authorization
  Scenario: Viewer (read-only) role cannot edit a program
    Given I am logged in as a viewer with read-only access
    And a program "Web Development 2026" exists
    When I navigate to the Programs page
    Then I do not see an enabled edit action for "Web Development 2026"
    Or I see an access denied response when attempting to edit the program

  @TC-011 @High @Uniqueness
  Scenario: Renaming to an existing program name is rejected
    Given I am editing "Data Science 2026"
    And a program named "Web Development 2026" already exists
    When I change the "Program Name" to "Web Development 2026"
    And I click "Save"
    Then I see a duplicate-name validation or error message
    And the program list still shows "Data Science 2026"
    And the program list contains exactly one entry named "Web Development 2026"

  @TC-012 @Medium @Concurrency
  Scenario: Editing a concurrently deleted program is handled safely
    Given I am editing "Web Development 2026"
    And the program "Web Development 2026" has been deleted in another session
    When I change the "Description" to "Edited after deletion"
    And I click "Save"
    Then I see an error message indicating the program no longer exists
    And the program list does not show "Web Development 2026" with stale edited data

  # ------------------------------------------------------------------ Edge cases

  @TC-013 @Medium @Boundary
  Scenario: Single-character Program Name is accepted on edit
    Given I am editing "Web Development 2026"
    When I change the "Program Name" to "A"
    And I click "Save"
    Then the modal closes
    And the program list shows "A"

  @TC-014 @Medium @Boundary
  Scenario: Program Name at the maximum allowed length (100 characters) is accepted
    Given I am editing "Web Development 2026"
    When I change the "Program Name" to a unique name of 100 characters
    And I click "Save"
    Then the modal closes
    And the program list shows the full 100-character program name

  @TC-015 @Medium @Boundary
  Scenario: Program Name exceeding 100 characters is rejected on edit
    Given I am editing "Web Development 2026"
    When I change the "Program Name" to a name of 101 characters
    And I click "Save"
    Then I see a validation error for "Program Name"
    And the program list still shows "Web Development 2026"

  @TC-016 @High @Validation
  Scenario: Empty Description is allowed on edit
    Given I am editing "Web Development 2026"
    When I clear the "Description" field
    And I click "Save"
    Then the modal closes
    And reopening the edit form shows an empty Description

  @TC-017 @Low @Boundary
  Scenario: Description at the maximum allowed length (500 characters) is accepted
    Given I am editing "UX Design Bootcamp"
    When I change the "Description" to a string of 500 characters
    And I click "Save"
    Then the modal closes
    And reopening the edit form shows the full 500-character Description

  @TC-018 @Low @Boundary
  Scenario: Description exceeding 500 characters is rejected on edit
    Given I am editing "Web Development 2026"
    When I change the "Description" to a string of 501 characters
    And I click "Save"
    Then I see a validation error for "Description"
    And the over-length description is not saved

  @TC-019 @Medium @SpecialCharacters
  Scenario: Special characters in edited fields are handled safely
    Given I am editing "Web Development 2026"
    When I change the "Program Name" to "C++ & C# Programming (2026)"
    And I change the "Description" to "Languages: C++, C#, and scripting"
    And I click "Save"
    Then the modal closes
    And the program list shows "C++ & C# Programming (2026)"

  @TC-020 @Low @Unicode
  Scenario: Unicode and emoji in edited fields render correctly
    Given I am editing "Web Development 2026"
    When I change the "Program Name" to "日本語プログラム 2026"
    And I change the "Description" to "Multilingual curriculum 🎓"
    And I click "Save"
    Then the modal closes
    And the program list shows "日本語プログラム 2026"

  @TC-021 @Medium @Validation
  Scenario: Leading and trailing whitespace in Program Name is trimmed on edit
    Given I am editing "Web Development 2026"
    When I change the "Program Name" to "   Web Development 2026 - Updated   "
    And I click "Save"
    Then the program list shows "Web Development 2026 - Updated"
    And the program list does not show the name with leading or trailing spaces

  @TC-022 @High @Validation
  Scenario: Whitespace-only Program Name is treated as empty on edit
    Given I am editing "Web Development 2026"
    When I change the "Program Name" to "     "
    Then the "Save" button is disabled
    And the program list still shows "Web Development 2026"

  @TC-023 @Medium @Security
  Scenario: HTML/script injection in Description is sanitized on edit
    Given I am editing "Web Development 2026"
    When I change the "Description" to "<script>alert('xss')</script>"
    And I click "Save"
    Then no script is executed in the browser
    And the program list still shows "Web Development 2026"

  @TC-024 @Low @Formatting
  Scenario: Multi-line Description is preserved on edit
    Given I am editing "DevOps Pipeline Program"
    When I change the "Description" to "Week 1: CI/CD basics\nWeek 2: Kubernetes\nWeek 3: Monitoring"
    And I click "Save"
    Then reopening the edit form shows the Description with its line breaks preserved

  @TC-025 @Medium @Uniqueness
  Scenario: No-op rename to the same name does not trigger a duplicate error
    Given I am editing "Web Development 2026"
    When I leave the "Program Name" as "Web Development 2026"
    And I change the "Description" to "Minor description tweak only"
    And I click "Save"
    Then the modal closes
    And the program list shows "Web Development 2026"
    And I do not see a duplicate-name validation error

# ---------------------------------------------------------------------------
# Ambiguities / gaps to confirm with product / BA:
#   1. Pre-population scope (AC1): assumed Program Name + Description only.
#   2. Empty / whitespace-only name on edit: Save disabled per Confluence
#      Validation Rules (TC-007/008/022).
#   3. Description optional on edit (Field Definitions) — clearing allowed (TC-016).
#   4. Uniqueness on rename (TC-011), name/description length limits (TC-015/018),
#      and trim on submit (TC-021) come from the Confluence Validation Rules /
#      Field Definitions.
#   5. Modal dismiss (X / Cancel / click-outside) discards unsaved edits (TC-009).
#   6. Authorization: Admin & Editor may edit, Viewer read-only (Confluence roles);
#      not stated in the DS-2 acceptance criteria (TC-010).
# ---------------------------------------------------------------------------
