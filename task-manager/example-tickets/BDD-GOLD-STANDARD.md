Feature: Paint selection in car configurator

  As a customer configuring my car,
  I want to choose a paint color and see it reflected immediately,
  So that I can visualize my choices and understand any pricing impact.

  Background:
    Given the user is on the car configurator page at "https://example.com/configurator"
    And the available paint options are displayed

  @scenario_verify_paint_preview_updates
  Scenario: Selecting a paint color updates the car preview  
    # This scenario verifies that the customer sees immediate visual feedback when choosing a paint color.
    When the user selects the paint color "Red Metallic"
    Then the car preview should update to show the "Red Metallic" paint
    And the selected paint should be visually highlighted
