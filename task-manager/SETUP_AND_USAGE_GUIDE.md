# Task Manager Base Rules: Setup and Usage Guide

## Overview

This guide demonstrates how to set up and use the simplified base rules for AI-driven test automation. The base rules provide patterns for requirement validation, task execution, dynamic context loading, and conversation logging.

---

## Directory Structure

### Required Structure
```
task-manager/
├── base-rules/                           # Core pattern definitions
│   ├── task-execution.md                 # Core workflow patterns  
│   ├── task-requirement-validation.md    # Quality gate patterns
│   ├── dynamic-context-loading.md        # Path resolution patterns
│   └── state-conversation-logging.md     # Documentation patterns
├── context-rules/                        # Domain-specific contexts
│   ├── [DOMAIN]-domain/                  # Per-domain configurations
│   │   ├── business-domain-config.md     # Domain terminology & selectors
│   │   ├── test_data.json               # Domain-specific test data
│   │   └── states/                       # State diagrams (optional)
│   └── car-configurator-states-flow.md  # Shared state/flow context
├── example-tickets/                      # Test requirement examples
│   ├── CARCONF-104.md                    # Good requirements (PASS)
│   ├── CARCONF-103.md                    # Poor requirements (FAIL)
│   └── BDD-GOLD-STANDARD.md              # Perfect BDD example
├── examples/                             # Reference automation examples
└── aiGenerated/                          # AI-generated outputs
    └── [TICKET-ID]/                      # Per-ticket output folder
        ├── [TICKET-ID]_validation_report.md
        ├── [TICKET-ID]_bdd_scenarios.feature
        ├── [TICKET-ID]_assessment_report.md
        ├── [TICKET-ID]_automation_code.md
        └── [TICKET-ID]_conversation.md
```

---

## Step 1: Base Rules Setup

### 1.1 Core Pattern Files
The base rules are already simplified and ready to use:

- **task-execution.md**: Load → Validate → Execute → Document pattern
- **task-requirement-validation.md**: Stop early validation gates  
- **dynamic-context-loading.md**: Environment-aware path resolution
- **state-conversation-logging.md**: Structured documentation templates

### 1.2 Validation of Base Rules
All base rules have been validated and cleaned:
- ✅ Unicode characters replaced with ASCII equivalents
- ✅ Pseudocode syntax verified for AI parsing
- ✅ Essential patterns extracted from complex implementations
- ✅ Buildable examples ready for adaptation

---

## Step 2: Domain Configuration

### 2.1 Create Domain Directory
```bash
mkdir -p context-rules/[YOUR-DOMAIN]-domain
```

### 2.2 Domain Configuration Files

#### business-domain-config.md Template
```markdown
# [Domain Name] Configuration

## Domain Identity
- **Brand**: [Brand Name]
- **Domain Prefix**: [PREFIX] 
- **Ticket Pattern**: [PREFIX]-XXXXX
- **Market**: [Market Description]

## Business Terminology
- **[Business Term 1]**: Definition and usage
- **[Business Term 2]**: Definition and usage

## Component Selectors  
- **[Component 1]**: [CSS selector or test-id]
- **[Component 2]**: [CSS selector or test-id]

## Business Processes
- **[Process 1]**: Description of business flow
- **[Process 2]**: Description of business flow
```

#### test_data.json Template
```json
{
  "colors": {
    "C001": "[Color Name 1]",
    "C002": "[Color Name 2]"
  },
  "packages": {
    "P001": {
      "name": "[Package Name]",
      "includes": ["[Feature 1]", "[Feature 2]"],
      "excludes": ["[Incompatible Feature]"]
    }
  },
  "constraints": [
    {
      "rule": "[Business Rule Description]",
      "type": "exclusion|requirement",
      "conflict": {
        "[entity1]": "[value1]",
        "[entity2]": "[value2]"
      }
    }
  ]
}
```

---

## Step 3: Task Execution Workflow

### 3.1 Task 1: Requirement Validation

#### Input
- Jira ticket or requirement document
- Domain configuration (if available)

#### Process
```pseudocode
TASK_1_EXECUTION(ticket_data):
    // Load validation context
    validation_rules = LOAD_VALIDATION_RULES()
    domain_context = LOAD_DOMAIN_CONTEXT(ticket_prefix) 
    
    // Run validation gates
    validation_result = RUN_VALIDATION_CHECKS(ticket_data)
    
    IF validation_result.status == "FAIL":
        PRESENT_OPTIONS([
            "STOP - Fix requirements first",
            "CONTINUE - Accept lower quality", 
            "REWRITE - Apply single responsibility",
            "PREVIEW - See potential scenarios"
        ])
    
    // Document results
    CREATE_CONVERSATION_LOG(validation_result)
```

#### Expected Outputs
- ✅ **PASS**: Requirements ready for BDD generation
- ❌ **FAIL**: Specific issues identified with improvement suggestions
- 📋 **Analysis Report**: Structured breakdown of requirements and priorities
- 📁 **Files Generated**: 
  - `aiGenerated/[TICKET-ID]/[TICKET-ID]_validation_report.md`
  - `aiGenerated/[TICKET-ID]/[TICKET-ID]_conversation.md`

### 3.2 Task 2: BDD Scenario Generation

#### Input
- Validated requirements from Task 1
- BDD generation patterns
- Domain-specific test data
- State/flow context documentation

#### Process
```pseudocode
TASK_2_GENERATION(analysis_result):
    // Load BDD context only
    bdd_patterns = LOAD_BDD_PATTERNS()
    state_flow_context = LOAD_STATE_FLOW_CONTEXT()
    domain_examples = LOAD_DOMAIN_EXAMPLES()
    
    // Generate scenarios by priority
    p0_scenarios = GENERATE_SCENARIOS(analysis_result.p0_requirements)
    p1_scenarios = GENERATE_SCENARIOS(analysis_result.p1_requirements)
    p2_scenarios = GENERATE_SCENARIOS(analysis_result.p2_requirements)
    
    // Apply domain configuration
    scenarios = APPLY_DOMAIN_CONFIG(all_scenarios, domain_examples)
```

#### Expected Outputs
- 📝 Human-readable BDD scenarios (P0-P4 priority classified)
- 🏷️ Universal patterns using domain-specific values
- 📊 Coverage analysis showing AC → Scenario mapping
- 📁 **Files Generated**: 
  - `aiGenerated/[TICKET-ID]/[TICKET-ID]_bdd_scenarios.feature`
  - `aiGenerated/[TICKET-ID]/[TICKET-ID]_conversation.md` (updated)

### 3.3 Task 3a: Behavioral Assessment

#### Input
- Generated BDD scenarios from Task 2
- Assessment criteria patterns

#### Process
```pseudocode
TASK_3A_ASSESSMENT(scenarios):
    // Load assessment context only
    assessment_criteria = LOAD_ASSESSMENT_CRITERIA()
    
    // Assess each scenario
    FOR scenario IN scenarios:
        assessment = ASSESS_SCENARIO(scenario, assessment_criteria)
        IF assessment.suitable_for_automation:
            approved_scenarios.append(scenario)
        ELSE:
            excluded_scenarios.append({scenario, assessment.reason})
```

#### Expected Outputs
- ✅ **Approved Scenarios**: Ready for automation
- ❌ **Excluded Scenarios**: With specific exclusion reasons
- 📋 **Assessment Report**: Automation feasibility analysis
- 📁 **Files Generated**: 
  - `aiGenerated/[TICKET-ID]/[TICKET-ID]_assessment_report.md`
  - `aiGenerated/[TICKET-ID]/[TICKET-ID]_conversation.md` (updated)

### 3.4 Task 3b: Automation Generation

#### Input
- Approved scenarios from Task 3a
- Technical automation patterns
- Component selector mappings

#### Process
```pseudocode
TASK_3B_GENERATION(approved_scenarios):
    // Load automation context only
    automation_patterns = LOAD_AUTOMATION_PATTERNS()
    component_selectors = LOAD_COMPONENT_SELECTORS()
    
    // Generate automation code
    FOR scenario IN approved_scenarios:
        test_code = GENERATE_TEST_CODE(scenario, automation_patterns)
        page_objects = IDENTIFY_PAGE_OBJECTS(scenario, component_selectors)
```

#### Expected Outputs
- 🧪 **React Testing Library code**: Component interaction tests
- 🎭 **Playwright code**: End-to-end test automation
- 📄 **Page Object patterns**: Reusable test components
- 📋 **Implementation notes**: Missing selectors and setup requirements
- 📁 **Files Generated**: 
  - `aiGenerated/[TICKET-ID]/[TICKET-ID]_automation_code.md`
  - `aiGenerated/[TICKET-ID]/[TICKET-ID]_conversation.md` (updated)

---

## Step 4: Integration Examples

### 4.1 Good Requirements Example (CARCONF-104)
**Validation Result**: ✅ PASS
- Clear, user-focused language
- Observable outcomes
- Single responsibility per AC
- Ready for BDD generation

### 4.2 Poor Requirements Example (CARCONF-103)
**Validation Result**: ❌ FAIL
- Implementation contamination
- Multiple behaviors per AC
- Technical focus vs user experience
- Requires rewrite before processing

### 4.3 Domain Integration Example
**Mercedes Domain** + **Universal Paint Selection Scenario**:
```gherkin
# Universal scenario
When I select the paint color "[DOMAIN_COLOR]"
Then the preview should update to show the "[DOMAIN_COLOR]" paint

# Mercedes implementation  
When I select the paint color "Polar White"
Then the preview should update to show the "Polar White" paint

# BMW implementation
When I select the paint color "Alpine White III" 
Then the preview should update to show the "Alpine White III" paint
```

**Same test logic, different domain values - perfect reusability.**

---

## Step 5: Validation and Testing

### 5.1 Running Validations

#### Validate Requirements
```bash
# Apply task-requirement-validation.md patterns to your ticket
INPUT: Your Jira ticket content
PROCESS: Run through validation gates
OUTPUT: PASS/FAIL with specific improvement recommendations
```

#### Test Domain Loading
```bash
# Test dynamic-context-loading.md patterns
INPUT: Ticket key (e.g., "MERCEDES-12345")
PROCESS: Extract prefix → Resolve domain path → Load configuration
OUTPUT: Domain context or graceful fallback to defaults
```

#### Verify Task Execution
```bash
# Apply task-execution.md Load → Validate → Execute → Document pattern
INPUT: Any requirement or scenario
PROCESS: Sequential task execution with focused context loading
OUTPUT: Structured results at each stage
```

### 5.2 Expected Results

#### High-Quality Requirements
- ✅ Pass validation gates
- ✅ Generate comprehensive scenarios
- ✅ Produce realistic automation code
- ✅ Integrate seamlessly with domain data

#### Poor-Quality Requirements  
- ❌ Fail validation with specific issues
- ⚠️ Generate suboptimal scenarios (if forced to continue)
- ❌ Produce brittle automation code
- ❌ Require manual cleanup and refinement

---

## Step 6: Troubleshooting

### 6.1 Common Issues

#### "Domain Not Found" 
- **Cause**: Missing domain directory or incorrect ticket prefix
- **Solution**: Verify domain directory exists at resolved path
- **Fallback**: System continues with core framework patterns

#### "Validation Always Fails"
- **Cause**: Validation rules too strict for current requirement quality
- **Solution**: Use "CONTINUE" option to see potential scenarios, then refine requirements

#### "Generated Code Missing Selectors"
- **Cause**: Component selectors not defined in domain configuration
- **Solution**: Add selector mappings to business-domain-config.md

#### "Scenarios Too Generic"
- **Cause**: Missing state/flow context for realistic complexity
- **Solution**: Add detailed state/flow documentation based on actual user journeys

### 6.2 Validation Checklist

Before using the base rules, ensure:
- [ ] Base rule files are clean (no Unicode parsing issues)
- [ ] Domain directories follow naming convention ([PREFIX]-domain)
- [ ] test_data.json contains realistic business relationships
- [ ] State/flow context matches actual user journeys
- [ ] Component selectors match actual application structure

---

## Step 7: Extending the Framework

### 7.1 Adding New Domains
1. Create `[PREFIX]-domain/` directory
2. Add `business-domain-config.md` with terminology and selectors  
3. Create `test_data.json` with realistic business data
4. Test domain loading with sample ticket key
5. Validate scenarios use correct domain values

### 7.2 Customizing Base Rules
The base rules are **patterns, not rigid implementations**:
- Adapt validation gates to your quality standards
- Modify task execution sequence for your workflow
- Extend dynamic loading for additional file types
- Customize logging templates for your documentation needs

### 7.3 Integration with CI/CD
```yaml
# Example GitHub Actions integration
- name: Validate Requirements
  run: |
    # Apply task-requirement-validation.md patterns
    # Generate validation report
    # Fail build if critical issues found

- name: Generate BDD Scenarios  
  run: |
    # Apply task-execution.md patterns
    # Generate scenarios using domain context
    # Update test suite with new scenarios
```

---

## Conclusion

The simplified base rules provide foundational patterns for reliable AI-driven test automation. They emphasize:

- **Quality gates** that prevent downstream issues
- **Universal patterns** that work across domains
- **Context smartness** over context comprehensiveness  
- **Human decision points** where AI recommends but humans decide

**Success Criteria**: When properly implemented, the base rules should produce 80-90% accurate test scenarios that require minimal human refinement, while maintaining consistency across team members and projects.

The patterns are deliberately simplified to serve as **building blocks** rather than comprehensive implementations, allowing teams to adapt them to their specific needs while maintaining the core principles that make AI-driven test automation reliable.