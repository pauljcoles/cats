# Conversation Log: Bundles Unavailable Popup

**Ticket(s)**: DIGILBB-114383
**Created**: Sat Jul  5 11:02:08 BST 2025
**Last Updated**: Sat Jul  5 11:02:08 BST 2025
**Current Task**: Task 1

## 🔍 Initial Feature Analysis

### **Summary of Sources Reviewed**
- **Jira Tickets**: DIGILBB-114383 - SPA: Popup to be displayed when Bundles aren't available at customer premise
- **Specifications**: Confluence page 699546162 - Soft Bundles - Phase 1 (comprehensive technical design document)
- **Attachments**: 5 image attachments showing popup designs and mockups from Figma
- **Additional Sources**: Figma design reference for Soft Bundles & Portfolio Refresh 2025

### **Initial Approach to Test Case Creation**
- **Primary Testing Strategy**: Focus on error handling and user experience when bundles are unavailable
- **Testing Focus Areas**: 
  1. Error popup display and messaging
  2. Navigation functionality from error popup
  3. API error handling (ContinuableError.POQ.NoProductsEligible)
  4. User journey recovery paths
- **Risk Assessment**: Critical user experience issue - customers must have clear guidance when bundles unavailable
- **Testing Priorities**: 
  1. Error popup display (highest priority)
  2. Navigation buttons functionality
  3. Error message clarity and user guidance

### **Generated Artifact Locations**
- **Human-readable Feature File**: `aiGenerated/aiFeatures/DIGILBB-114383_bundles_unavailable_popup_human_readable.feature`
- **TAF-compatible Feature File**: `aiGenerated/aiFeatures/DIGILBB-114383_bundles_unavailable_popup_taf_compatible.feature`
- **Assessment Report**: `aiGenerated/reports/automation-assessment/DIGILBB-114383_automation_assessment_report.md`

### **Plain English Summary of Changes/Requirements**
This feature implements an error handling popup that displays when customers try to access bundles that aren't available at their address. When the Journey Orchestrator (JO) returns a specific error (ContinuableError.POQ.NoProductsEligible), the SPA displays a user-friendly popup explaining the situation and providing two navigation options: "See broadband deals" (redirects to service pattern page) and "Back to shop" (returns to main broadband page). This ensures customers aren't left stranded when bundles are unavailable and provides clear paths to alternative options.

### **All Requirements with Specification References**
- **REQ-001**: Display error popup when bundles unavailable - *Reference: [DIGILBB-114383-AC1]*
- **REQ-002**: Handle ContinuableError.POQ.NoProductsEligible error from JO - *Reference: [SPEC-699546162-Error-Handling]*
- **REQ-003**: Provide "See broadband deals" navigation button - *Reference: [DIGILBB-114383-AC3]*
- **REQ-004**: Provide "Back to shop" navigation button - *Reference: [DIGILBB-114383-AC2]*
- **REQ-005**: Navigate to correct URLs based on button selection - *Reference: [DIGILBB-114383-AC2-AC3]*
- **REQ-006**: Display appropriate error message as per Figma design - *Reference: [DIGILBB-114383-Figma-Design]*

### **All Acceptance Criteria**

#### **From Jira Ticket**
- **AC-1** (from DIGILBB-114383): Display message to customer when Bundles aren't available at customer premise
  - *Specification Reference*: [SPEC-699546162-Section-Error-Handling]
- **AC-2** (from DIGILBB-114383): On click on 'Back to shop', navigate customer to shop page
  - *Specification Reference*: [DIGILBB-114383-Navigation-Requirements]
- **AC-3** (from DIGILBB-114383): On click of 'See broadband deals' User goes back to the beginning of the service checker journey
  - *Specification Reference*: [DIGILBB-114383-Navigation-Requirements]

#### **From Specifications**
- **SPEC-AC-1** (from SPEC-699546162-Error-Handling): JO to model continuable error responses when no actions are available
- **SPEC-AC-2** (from SPEC-699546162-Error-Handling): UI to show error if response contains error object

### **Acceptance Criteria in Given/When/Then Format**

#### **AC-1**: Display message to customer when Bundles aren't available at customer premise
```gherkin
Given customer navigates to Bundle PDP
When JO returns an error object with errorCode as ContinuableError.POQ.NoProductsEligible
Then message informing the same should be displayed to customer as per FIGMA with CTAs:
  - See broadband deals
  - Back to shop
```

#### **AC-2**: On click on 'Back to shop', navigate customer to shop page
```gherkin
Given Bundles aren't available at customer premise
And popup is displayed to customer explaining the same
When customer clicks on 'Back to shop' button
Then SPA should navigate user back to shop page - https://ee.co.uk/broadband
```

#### **AC-3**: On click of 'See broadband deals' User goes back to the beginning of the service checker journey
```gherkin
Given Bundles aren't available at customer premise
And popup is displayed to customer explaining the same
When customer clicks on 'See broadband deals' button
Then SPA should navigate user to service pattern page: https://ee.co.uk/broadband/packages
```

### **Identified Test Scenarios**

#### **Positive Scenarios**
- **Scenario 1**: Error popup displays when JO returns ContinuableError.POQ.NoProductsEligible
- **Scenario 2**: "Back to shop" button navigates to correct URL (ee.co.uk/broadband)
- **Scenario 3**: "See broadband deals" button navigates to correct URL (ee.co.uk/broadband/packages)
- **Scenario 4**: Error message displays correct content as per Figma design

#### **Negative Scenarios**
- **Scenario 1**: Verify popup doesn't display for other error types
- **Scenario 2**: Verify navigation works correctly from different entry points
- **Scenario 3**: Verify popup behavior when accessed via direct URL manipulation

### **Flagged Ambiguities or Gaps**
- **Ambiguity 1**: AC4 (X button functionality) is crossed out in the ticket - unclear if this should be implemented
- **Gap 1**: No specific error message text provided in ticket, only reference to Figma design
- **Gap 2**: No specification of popup styling or exact visual requirements beyond Figma reference

### **Inferred Requirements Section**
- **Inferred REQ-1**: Popup should be modal and prevent interaction with underlying page
- **Inferred REQ-2**: Error handling should be graceful and not break the user journey
- **Inferred REQ-3**: Navigation should maintain user context where possible

### **Nice to Have Requirements Section**
- **Nice-to-Have 1**: Analytics tracking for error popup interactions
- **Nice-to-Have 2**: A11y compliance for screen readers and keyboard navigation
- **Nice-to-Have 3**: Mobile-optimized popup display

### **Specification Gaps Section**
- **Gap 1**: Detailed error message content not specified in technical specification
- **Gap 2**: No mention of popup timeout or auto-dismiss behavior
- **Gap 3**: Integration testing scenarios with JO error responses not detailed

### **Jira Ticket Gaps Section**
- **Gap 1**: Crossed-out AC4 creates uncertainty about X button implementation
- **Gap 2**: No acceptance criteria for mobile device behavior
- **Gap 3**: No error logging or monitoring requirements specified

### **Things We Should Check Section**

#### **Accessibility Requirements**
- Popup should be accessible via keyboard navigation
- Screen reader compatibility for error message
- Focus management when popup opens and closes
- High contrast mode compatibility

#### **Performance Requirements**
- Popup should display immediately when error occurs
- Navigation should be responsive and not cause delays
- Error handling should not impact overall page performance

#### **Security Requirements**
- URL navigation should be validated to prevent injection attacks
- Error messages should not expose sensitive system information

#### **Integration Requirements**
- Proper handling of JO API error responses
- Integration with existing navigation framework
- Compatibility with current bundle PDP implementation

#### **Browser/Device Compatibility**
- Cross-browser compatibility for popup display
- Mobile device responsive design
- Touch interaction support for mobile devices

#### **Other Considerations**
- Error logging for monitoring and debugging
- User analytics for popup interaction tracking
- Graceful degradation if JavaScript is disabled
- Integration with existing error handling patterns