# BDD Task Execution Rules for MCP Atlassian Framework

## 📋 **Multi-Ticket Execution Guidelines**

### **🚨 MANDATORY ENFORCEMENT RULES**

When multiple Jira tickets are provided for any task execution, these rules ensure proper separation, traceability, and maintainability.

#### **Rule 1: Separate Feature Files Required**
**When multiple tickets are provided, each ticket MUST have its own separate feature files for both human-readable and TAF versions.**

##### **Task 2 (Human-Readable BDD)**
- **Single Ticket**: One feature file
  - Format: `[TICKET-ID]_[functionality]_human_readable.feature`
  - Example: `[PROJECT-12345]_[functionality]_human_readable.feature`

- **Multiple Tickets**: Separate feature file for each ticket
  - Format: `[TICKET-ID]_[functionality]_human_readable.feature` (one per ticket)
  - Examples:
    - `[PROJECT-12345]_[functionality]_human_readable.feature`
    - `[PROJECT-12346]_[functionality]_human_readable.feature`

##### **Task 3 (TAF-Compatible BDD)**
- **Single Ticket**: One TAF feature file
  - Format: `[TICKET-ID]_[functionality]_taf_compatible.feature`
  - Example: `[PROJECT-12345]_[functionality]_taf_compatible.feature`

- **Multiple Tickets**: Separate TAF feature file for each ticket
  - Format: `[TICKET-ID]_[functionality]_taf_compatible.feature` (one per ticket)
  - Examples:
    - `[PROJECT-12345]_[functionality]_taf_compatible.feature`
    - `[PROJECT-12346]_[functionality]_taf_compatible.feature`

#### **Rule 2: Single Conversation Log Permitted**
**Multiple tickets may share a single conversation log file for analysis and documentation purposes.**

##### **Conversation Log Naming**
- **Single Ticket**: `[JIRA-ID]_[feature_name]_conversation.md`
- **Multiple Tickets**: `[JIRA-ID1]_[JIRA-ID2]_[feature_name]_conversation.md`

##### **Examples**
- Single: `[PROJECT-114992]_[feature_name]_conversation.md`
- Multiple: `[PROJECT-121261]_[PROJECT-125806]_[feature_name]_conversation.md`

#### **Rule 3: Assessment Report Naming**
**Assessment reports should include all ticket IDs when multiple tickets are involved.**

##### **Assessment Report Naming**
- **Single Ticket**: `[TICKET-ID]_automation_assessment_report.md`
- **Multiple Tickets**: `[TICKET-ID1]_[TICKET-ID2]_automation_assessment_report.md`

#### **🎯 Rationale for Separation**
- **Clear Traceability**: Each ticket has its own dedicated feature file
- **Independent Development**: Teams can work on different tickets independently
- **Easier Maintenance**: Updates to one ticket don't affect others
- **Proper Separation of Concerns**: Each file focuses on specific ticket requirements
- **Version Control**: Cleaner git history and easier code reviews
- **Testing Isolation**: Test failures can be traced to specific tickets

#### **🚨 Enforcement Checkpoints**
- [ ] **Multiple Tickets Detected**: Check if more than one ticket ID provided
- [ ] **Separate Files Created**: Verify each ticket has its own feature files
- [ ] **Proper Naming**: Confirm files follow naming convention with individual ticket IDs
- [ ] **Content Separation**: Ensure each file contains only scenarios for its specific ticket
- [ ] **Documentation Updated**: Conversation log documents separate file creation

---

## 🎯 Core Task Execution Principles

### **MANDATORY TASK WORKFLOW**
- **SEQUENTIAL EXECUTION**: Tasks must be executed in numerical order (1→2→3)
- **GATE COMPLETION**: Each task requires completion validation before proceeding
- **EVIDENCE REQUIRED**: All task outputs must be documented and saved
- **NO TASK SKIPPING**: Every task step must be completed for quality assurance

### **CRITICAL INTEGRATION REQUIREMENTS**
- **MCP CONNECTOR USAGE**: All Jira/Confluence interactions must use MCP tools
- **ARTIFACT STORAGE**: All outputs saved to `aiGenerated` structure
- **CONVERSATION LOGGING**: Mandatory logging for all task executions
- **RULE COMPLIANCE**: Each task must reference and follow specific rule files

```markdown
## Integration Testing Scope Rules

### **Single Ticket Scope Enforcement**
- [ ] **Primary Functionality Only**: Test only functionality explicitly mentioned in ticket
- [ ] **No Cross-System Integration**: Avoid testing interactions with other systems unless specified
- [ ] **No Session Management**: Exclude multi-request session state testing unless required
- [ ] **No Workflow Integration**: Avoid testing integration with broader user workflows

### **Integration Test Inclusion Criteria**
Include integration scenarios ONLY if:
- [ ] Ticket explicitly mentions integration requirements
- [ ] Acceptance criteria specify cross-system behavior
- [ ] Integration is core to the ticket's primary functionality
- [ ] Integration failure would prevent ticket completion

### **Alternative Approaches**
For excluded integration concerns:
- **System Integration**: Use dedicated integration test suites
- **Workflow Testing**: Use end-to-end test frameworks
- **Session Management**: Use session-specific test tools

### **Task 2 vs Task 3 Architecture Separation**
#### **Task 2 - Human-Readable BDD**:
- **Language**: Plain English, user perspective, business terminology
- **Data**: Specific test values for clarity (postcodes, URLs, messages)
- **Focus**: What the user experiences and observes
- **Error Handling**: Use business language, avoid technical error codes

#### **Task 3 - TAF-Compatible BDD**:
- **Language**: Technical precision, framework patterns, validation details
- **Data**: Memory variables, constants, configuration references
- **Focus**: How the system validates and what APIs to check
- **Error Handling**: Include technical error codes in comments for validation
```

## 📋 Task Execution Format

### **Standard Task Invocation**
```
Execute Task [Number] for [Input]
```

**Examples:**
- `Execute Task 1 for [PROJECT-117800]`
- `Execute Task 2 for specification 699546162 section 8.4.1.2.2`
- `Execute Task 3 for [PROJECT-121261]`

---

## 🔍 Task 1: Specification Analysis and Requirement Detection

### **🎯 Primary Objective**
Extract, analyze, and clarify requirements from Jira tickets and Confluence specifications with enhanced requirement detection capabilities.

### **📚 Required Rule References**
- **PRIMARY**: `bdd_prd.md` (MUST be applied first)
- **SECONDARY**: Specification conventions (integrated below)
- **LOGGING**: `conversation_logging_rules.md` (documentation requirements)

### **📥 Input Requirements**
- **JIRA Ticket ID**: Format `PROJECT-NUMBER` (e.g., [PROJECT-117800])
- **OR Specification Reference**: Format `NUMBER section X.X.X.X` (e.g., 699546162 section 8.4.1.2.2)

### **⚙️ Execution Process**

#### **Step 1.1: Data Acquisition**
```markdown
1. **Query Jira Ticket**: Use MCP connector to retrieve complete ticket data
2. **Download Attachments**: Process all Confluence attachments if present
3. **Parse Specifications**: Extract relevant specification sections
4. **Validate Data**: Ensure all required information is accessible
```

#### **Step 1.2: Enhanced Requirement Detection (MANDATORY)**

##### **🎯 Detection Purpose and Context**
```markdown
**Root Cause Prevention**: Close gaps that allowed toggle testing requirements to be missed (e.g., [PROJECT-121237])
**Common Issues**: Requirements embedded in QA sections, toggle conditions overlooked, conditional logic missed
**Quality Gate**: Task 1 cannot complete without comprehensive requirement detection
```

##### **🔍 QA-Embedded Requirements Detection**
- [ ] **Scan for "As a QA" acceptance criteria** - Extract hidden functional requirements
- [ ] **Search for "QA testing" or "Testing" sections** - Look beyond standard AC sections
- [ ] **Extract toggle/feature flag conditions** from QA test scenarios (Toggle = ON/OFF)
- [ ] **Identify state-dependent behaviors** mentioned in testing sections
- [ ] **Convert QA scenarios to functional requirements** using "As a customer" perspective

##### **🔀 Conditional Logic Requirements Detection**
- [ ] **Search for conditional statements**: IF/WHEN/GIVEN [condition] THEN [behavior]
- [ ] **Identify feature toggles, flags, or switches** mentioned anywhere in ticket
- [ ] **Look for toggle keywords**: "toggle", "flag", "switch", "mode", "state"
- [ ] **Extract environment-dependent behaviors** (dev/test/prod differences)
- [ ] **Detect version-dependent functionality** (V1 vs V2, legacy vs new)
- [ ] **Identify ON/OFF conditions**: "enabled/disabled", "active/inactive" states

##### **🔄 Hidden State Requirements Detection**
- [ ] **Analyze implicit state changes** not explicitly documented
- [ ] **Identify prerequisite conditions** for functionality
- [ ] **Extract error handling requirements** from edge cases
- [ ] **Detect integration dependencies** with other systems

##### **🔍 Crossed-Out Requirements Detection**
- [ ] **Scan for crossed-out text** - Look for `-text-`, `~~text~~`, strikethrough formatting
- [ ] **Exclude from scenarios** - Do not implement crossed-out requirements in test generation
- [ ] **Document in conversation log** - Record all excluded requirements

##### **✅ Cross-Reference Validation Requirements**
- [ ] **Every toggle condition** has test scenarios for both states (ON and OFF)
- [ ] **Every "As a QA" scenario** has corresponding functional requirement
- [ ] **Every conditional statement** has positive and negative test paths
- [ ] **Gap analysis completed** for missing negative scenarios

##### **📋 Mandatory Output Documentation**

###### **Toggle/State Analysis Section**
```markdown
**Toggle References Found**: [List all toggle/flag/switch references]
**Behavioral Differences**: [Document Toggle ON vs OFF behaviors]
**Functional Requirements**: [Extract functional requirements from toggle conditions]
**Test Coverage**: [Ensure both states have test scenarios]
```

###### **QA-Embedded Requirements Section**
```markdown
**QA Scenarios Found**: [List all "As a QA" scenarios discovered]
**Functional Requirements**: [Convert QA scenarios to user perspective]
**Business Value**: [Explain functional benefit from user perspective]
**Test Scenarios**: [Map to actual user test scenarios]
```

###### **Conditional Logic Requirements Section**
```markdown
**Conditions Found**: [List all IF/WHEN/GIVEN conditional statements]
**Test Scenarios**: [Create scenario for each conditional path]
**Positive Paths**: [Test scenarios for condition = true]
**Negative Paths**: [Test scenarios for condition = false]
**Edge Cases**: [Boundary conditions and error states]
```

##### **🚨 Quality Gate Requirements**
```markdown
Task 1 Cannot Complete Without:
- [ ] All toggle/flag references analyzed and documented
- [ ] All QA scenarios converted to functional requirements
- [ ] All conditional logic mapped to comprehensive test scenarios
- [ ] Gap analysis completed for missing negative scenarios
- [ ] Cross-reference validation completed for all requirements
- [ ] Both positive and negative test paths identified for all conditions
```

#### **Step 1.3: Output Generation**
##### **MANDATORY PRE-FILE-CREATION CHECKLIST**
```markdown
Before creating any files, verify:
1. [ ] Check artifact_storage_configuration_rules.md
2. [ ] Use aiGenerated environment variable pattern  
3. [ ] Verify directory structure: aiGenerated/ at root level
4. [ ] Never hardcode paths within mcp-atlassian
5. **Apply Naming Conventions**: Follow specification and reference conventions below
6. **Create Conversation Log**: Store in `aiGenerated/conversations/`
7. **Document Analysis**: Include all detection results
8. **Validate Completeness**: Ensure all requirements captured
```

#### **📋 Specification and Reference Conventions**
```markdown
**Feature File Requirements**:
- All test cases must include specification reference in Feature description
  Example: `Feature: Vehicle Operation [SPEC-123]`
- Each scenario must reference specific acceptance criteria from Jira ticket
  Example: `Scenario: Successfully start a car with key ignition [AC-456]`

**Specification Documentation**:
- When explaining specifications, include reference number at beginning
  Example: `[SPEC-123] The system shall...`
- Acceptance criteria must reference parent specification
  Example: `[SPEC-123-AC2] When the user...`
- Implementation comments must reference both specification and AC numbers
  Example: `# Implementation for [SPEC-123-AC2]`

**Jira Integration**:
- Any reference beginning with '[PROJECT]-' treated as Jira ticket
- Use MCP connector to query Jira tickets for additional information
- Include ticket references in all generated documentation
```

### **📤 Required Outputs**
- **Conversation Log**: `[JIRA-ID]_[feature_name]_conversation.md`
- **Requirements Summary**: Structured analysis of all detected requirements
- **Specification Clarifications**: Any ambiguities or missing information identified
- **Next Steps**: Recommendations for Task 2 execution

---

## 📝 Task 2: BDD Scenario Generation and Validation

### **🎯 Primary Objective**
Generate comprehensive BDD scenarios based on analyzed requirements with proper validation and example verification.

### **📚 Required Rule References**
- **VALIDATION**: `task2_example_response_check.md` (scenario validation)
- **FRAMEWORK**: `bdd_unified_framework_guide.md` (BDD standards)
- **TECHNICAL**: `bdd_technical_implementation_guide.md` (implementation details)

### **📥 Input Requirements**
- **Completed Task 1**: Validated requirement analysis
- **Specification Reference**: Clear requirement documentation
- **Context Information**: Business rules and acceptance criteria

### **⚙️ Execution Process**

#### **Step 2.1: Scenario Design**
```markdown
1. **Map Requirements to Scenarios**: Convert each requirement to testable scenarios
2. **Apply BDD Patterns**: Use Given-When-Then structure consistently
3. **Include Edge Cases**: Cover error conditions and boundary cases
4. **Validate Business Logic**: Ensure scenarios reflect actual business rules
```

#### **Step 2.2: Example Response Validation**
```markdown
1. **Generate Test Examples**: Create realistic test data and expected outcomes
2. **Validate Response Formats**: Ensure examples match expected system behavior
3. **Cross-Reference Requirements**: Verify scenarios cover all identified requirements
4. **Stakeholder Review**: Prepare scenarios for business validation
```

#### **Step 2.3: Complete Request/Response Analysis (JO Backend Only)**
```markdown
**Applies to**: JO_BACKEND_API scenarios only
**Purpose**: Extract complete request/response documentation from specification and user examples

**Phase 1: Extract Request Fragments from Specification**
1. **Use MCP connector** to retrieve full specification content
2. **Search for JSON request examples** in the specification
3. **Extract ALL request fragments** related to the scenarioType
4. **Catalog request structures** by functionality:
   - Basic request structure
   - Command structures (PreselectAction, etc.)
   - CartContext variations
   - Multi-channel differences

**Phase 2: Analyze User-Provided Response Examples**
1. **Check if user mentioned example responses** in context
2. **If example file provided**: Load and analyze key structure elements
3. **Extract response validation points**:
   - Top-level fields and data types
   - Section structures and hierarchies
   - Action structures and required fields
   - Content attributes and roles
4. **Identify critical validation fields** for BDD scenarios

**Phase 3: Generate Complete Request/Response Documentation**
1. **Include complete request examples** in scenario comments
2. **Map request structures to Given/When steps**
3. **Include precise response validation** in Then/And steps
4. **Reference both spec fragments AND response examples**
5. **Create complete request-response cycle documentation**

**Example Integration**:
```gherkin
Scenario: Verify JO processes complete request and returns structured response
  # Request Example: {complete JSON from specification}
  # Response validation based on: [user example file]
  Given the SPA sends a FETCH_PRODUCTS request with complete structure from spec
  And the request includes all required fields from specification
  When JO processes the complete request
  Then the JO response should include exact fields from user example
  And the response should match the structure from actual response file
  And the complete request-response cycle should be documented
```
```

### **📤 Required Outputs**
- **BDD Feature Files**: Human-readable scenarios in Gherkin format
- **Test Data Examples**: Realistic data sets for scenario execution
- **Validation Report**: Confirmation of requirement coverage
- **Review Documentation**: Prepared materials for stakeholder review

---

## 🔧 Task 3: TAF Automation Assessment and Implementation

### **🎯 Primary Objective**
Assess BDD scenarios for TAF automation suitability and convert appropriate scenarios to TAF-compatible format.

### **📚 Required Rule References**
- **ASSESSMENT**: `automation_suitability_assessment_rules.md` (comprehensive suitability criteria and enforcement)

### **📥 Input Requirements**
- **Completed Task 2**: Validated BDD scenarios
- **Technical Context**: Understanding of TAF framework capabilities
- **Business Priority**: Importance and frequency of scenarios

### **⚙️ Execution Process**

#### **Step 3.1: Suitability Assessment**
```markdown
1. **Apply Assessment Criteria**: Use mandatory assessment template
2. **Classify Scenarios**: Categorize by automation suitability
3. **Document Decisions**: Provide clear justification for each decision
4. **Generate Assessment Report**: Comprehensive suitability analysis
```

#### **Step 3.2: TAF Conversion with API Validation - COMPLETE REWRITE**

**CRITICAL: Task 3 TAF Conversion is a COMPLETE REWRITE**

**DO NOT** modify Task 2 scenarios - **COMPLETELY REWRITE** them using:
- **BDD Element State Validation Rules** for all assertions
- **BDD Technical Implementation Guide** for all step patterns
- **Framework-specific syntax** replacing all human-readable language
- **Technical precision** with specific element identifiers
- **Only approved scenarios** from automation assessment report

```markdown
1. **REWRITE Suitable Scenarios**: Complete transformation using TAF technical patterns
2. **Apply Element State Validation**: Use "elementName" expected to be [condition] patterns
3. **Apply Technical Step Patterns**: Use framework-specific action and navigation steps
4. **Add API Validation Reminders**: Include mandatory API validation comments
5. **Validate Technical Accuracy**: Ensure all steps use proper TAF framework syntax
6. **Document Limitations**: Note any functionality not automatable
```

#### **📋 Mandatory API Validation Requirements**
```markdown
**API Validation Comment Template** (Required for ALL TAF scenarios):
```gherkin
Scenario: Verify product card shows breakdown when TV extras included
  # REMINDER: Validate API requests/responses in step implementation
  # - Check [product] selection API request contains correct data
  # - Verify API response matches expected format per spec
  # - Ensure UI displays API response data correctly
  Given I set "[USER-DATA-VAR]" from the user_data json to memory
  When the user completes selection on choose page with on below options:
    | section | value                           |
    | [PRODUCT-SECTION]  | [PRODUCT-NAME-EXAMPLE] and [ADDON-NAME] |
  Then "[productBreakdown]" has text that contains "[ADDON-NAME]"
```

**API Validation Standards**:
- **Every TAF scenario** must include API validation reminder comments
- **Specific API focus** - Comments must be relevant to APIs involved in each scenario
- **Specification validation** - Focus on validating against documented API specs
- **UI-API correlation** - Ensure UI displays API response data correctly
- **Implementation separation** - Keep detailed implementation in step definitions
- **Expected behavior focus** - Ensure API calls match expected behavior per specifications
```

### **📤 Required Outputs**
- **Assessment Report**: `[JIRA-ID]_automation_assessment_report.md`
- **TAF Feature Files**: Automation-ready scenarios
- **Implementation Notes**: Technical guidance for automation team
- **Coverage Analysis**: Percentage of requirements automated vs manual

---

## 🚨 Quality Gates and Validation

### **Task Completion Criteria**
Each task must meet these criteria before proceeding:

#### **Task 1 Completion Gate**
- [ ] All requirements extracted and documented
- [ ] Enhanced detection rules applied
- [ ] Conversation log created and populated
- [ ] Specification clarifications identified

#### **Task 2 Completion Gate**
- [ ] BDD scenarios generated for all requirements
- [ ] Example responses validated
- [ ] Business logic verified
- [ ] Stakeholder review materials prepared

#### **Task 3 Completion Gate**
- [ ] Suitability assessment completed for all scenarios
- [ ] TAF conversion completed for suitable scenarios
- [ ] Assessment report generated
- [ ] Implementation guidance documented

### **Failure Recovery Process**
If any task fails validation:
1. **Identify Gap**: Document specific failure points
2. **Apply Corrections**: Address identified issues
3. **Re-validate**: Repeat validation process
4. **Document Resolution**: Record corrective actions taken

---

## 🔍 Task 4: Ticket Comparison and Consolidation Analysis

### **🎯 Primary Objective**
Compare current ticket with suspected similar ticket(s) to determine relationship and optimal approach, preventing assumptions and ensuring evidence-based decisions.

### **📥 Input Requirements**
- **Current Ticket**: The ticket being worked on
- **Suspected Similar Ticket(s)**: Previously processed ticket(s) that seem related
- **Reason for Comparison**: Why you think they might be similar

### **⚙️ Execution Process**

#### **Step 4.1: Evidence Gathering**
```markdown
1. **Load Both Tickets**: Retrieve full content of current and suspected similar ticket(s)
2. **Extract Key Elements**: Requirements, acceptance criteria, functionality described
3. **Document Similarities**: What made you think they were related
4. **Document Differences**: What appears different between them
```

#### **Step 4.2: Detailed Comparison Analysis**
```markdown
1. **Functional Overlap Assessment**:
   - Same business functionality? (Yes/No/Partial)
   - Same user journey? (Yes/No/Partial)
   - Same validation criteria? (Yes/No/Partial)
   - Same technical implementation area? (Yes/No/Partial)

2. **Architecture Layer Analysis**:
   - Current ticket primary layer: NBA/JO/SPA/Cross-Layer
   - Comparison ticket primary layer: NBA/JO/SPA/Cross-Layer
   - Layer relationship: Same/Different/Complementary

3. **Requirement Overlap Matrix**:
   - List all ACs from current ticket
   - List all ACs from comparison ticket
   - Map overlapping requirements
   - Identify unique requirements in each
```

#### **Step 4.3: Relationship Classification**
```markdown
**Relationship Type** (Select ONE):
- [ ] **IDENTICAL**: Same functionality, same requirements
- [ ] **OVERLAPPING**: Significant shared functionality with some differences
- [ ] **COMPLEMENTARY**: Related but different aspects of same feature
- [ ] **SEQUENTIAL**: One depends on or builds upon the other
- [ ] **UNRELATED**: Initial assumption was incorrect, no meaningful relationship

**Evidence Summary**: [Detailed justification for classification]
```

#### **Step 4.4: Consolidation Decision**
```markdown
Based on relationship classification, determine approach:

**If IDENTICAL**:
- [ ] Use existing test scenarios (reference only)
- [ ] Update existing scenarios to cover both tickets
- [ ] Document cross-reference in conversation log

**If OVERLAPPING**:
- [ ] Create combined scenarios covering both tickets
- [ ] Create separate scenarios with shared setup/teardown
- [ ] Extend existing scenarios to cover additional requirements

**If COMPLEMENTARY**:
- [ ] Create separate but linked scenarios
- [ ] Reference existing scenarios in new ticket documentation
- [ ] Ensure test coverage doesn't have gaps between tickets

**If SEQUENTIAL**:
- [ ] Determine execution order dependency
- [ ] Create linked test scenarios with proper sequencing
- [ ] Document prerequisite relationships

**If UNRELATED**:
- [ ] Proceed with separate, independent scenarios
- [ ] Document why initial assumption was incorrect
- [ ] Continue with normal Tasks 1-3 workflow
```

### **📤 Required Outputs**
- **Comparison Analysis Report**: `[CURRENT-TICKET]_vs_[COMPARISON-TICKET]_analysis.md`
- **Relationship Classification**: Evidence-based classification with justification
- **Consolidation Decision**: Clear approach for handling both tickets
- **Updated Conversation Log**: Document comparison process and decisions

### **🚨 Quality Gates**
```markdown
Task 4 Cannot Complete Without:
- [ ] Both tickets fully analyzed with evidence
- [ ] Relationship classification supported by specific examples
- [ ] Consolidation decision clearly justified
- [ ] Approach documented for implementation in subsequent tasks
- [ ] Cross-references updated in conversation logs
```

### **🔧 Integration with Tasks 1-3**

#### **When to Execute Task 4**
- **Before Task 1**: If you suspect similarity before starting analysis
- **During Task 1**: If similar requirements discovered during analysis
- **Before Task 2**: If you remember similar scenarios from previous work
- **Before Task 3**: If automation approach might benefit from existing work

#### **Task Flow with Task 4**
```
Standard Flow: Task 1 → Task 2 → Task 3

With Comparison: 
Task 1 → Task 4 (if needed) → Task 2 → Task 3
OR
Task 4 → Task 1 → Task 2 → Task 3
```