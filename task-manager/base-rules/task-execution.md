# Essential Task Execution Pattern

## Core Workflow Architecture

### The Pattern: Load → Validate → Execute → Document

Every AI task follows this fundamental sequence:

```pseudocode
EXECUTE_TASK(task_type, input_data):
    // Step 1: Load required context
    context = LOAD_TASK_CONTEXT(task_type)
    
    // Step 2: Validate prerequisites  
    validation = VALIDATE_PREREQUISITES(input_data, context)
    IF validation.status == "FAIL":
        RETURN validation.issues
    
    // Step 3: Execute task logic
    result = EXECUTE_TASK_LOGIC(input_data, context)
    
    // Step 4: Document results
    DOCUMENT_RESULTS(task_type, result)
    
    RETURN result
```

## Dynamic Context Loading

### Environment-Aware Configuration

```pseudocode
LOAD_TASK_CONTEXT(task_type):
    // Load base environment config
    env_config = LOAD_ENV_CONFIG()
    base_path = RESOLVE_BASE_PATH(env_config)
    
    // Load task-specific rules
    task_rules = LOAD_TASK_RULES(base_path, task_type)
    
    // Load domain context if available
    domain_context = LOAD_DOMAIN_CONTEXT(base_path, input_data.ticket_prefix)
    
    // Combine contexts
    context = COMBINE_CONTEXTS(task_rules, domain_context)
    
    RETURN context
```

### Domain Resolution Pattern

```pseudocode
LOAD_DOMAIN_CONTEXT(base_path, ticket_prefix):
    domain_path = f"{base_path}/{ticket_prefix}-domain/"
    
    IF DIRECTORY_EXISTS(domain_path):
        business_config = LOAD_FILE(f"{domain_path}/business-config.md")
        test_data = LOAD_FILE(f"{domain_path}/test_data.json")
        LOG("OK Domain context loaded for {ticket_prefix}")
        RETURN {business_config, test_data}
    ELSE:
        LOG("WARNING Domain {ticket_prefix} not found - using defaults")
        RETURN null
```

## Task-Specific Implementations

### Task 1: Requirement Analysis

```pseudocode
TASK_1_ANALYSIS(ticket_key):
    // Load analysis context only
    analysis_rules = LOAD_ANALYSIS_RULES()
    domain_context = LOAD_DOMAIN_CONTEXT(ticket_key.prefix)
    
    // Validate ticket quality
    validation = VALIDATE_TICKET_QUALITY(ticket_data)
    IF validation.status == "FAIL":
        PRESENT_OPTIONS(validation.issues)
        user_choice = GET_USER_DECISION()
        IF user_choice == "stop":
            RETURN "STOPPED"
    
    // Extract requirements
    requirements = EXTRACT_REQUIREMENTS(ticket_data, domain_context)
    scenarios = IDENTIFY_SCENARIOS(requirements)
    
    // Document analysis
    CREATE_CONVERSATION_LOG(ticket_key, requirements, scenarios)
    
    RETURN analysis_result
```

### Task 2: Scenario Generation  

```pseudocode
TASK_2_GENERATION(analysis_result):
    // Load generation context only (NOT analysis rules)
    bdd_patterns = LOAD_BDD_PATTERNS()
    domain_examples = LOAD_DOMAIN_EXAMPLES()
    
    // Generate scenarios by priority
    p0_scenarios = GENERATE_SCENARIOS(analysis_result.p0_requirements, bdd_patterns)
    p1_scenarios = GENERATE_SCENARIOS(analysis_result.p1_requirements, bdd_patterns)
    p2_scenarios = GENERATE_SCENARIOS(analysis_result.p2_requirements, bdd_patterns)
    
    // Apply domain-specific naming
    scenarios = APPLY_DOMAIN_CONFIG(all_scenarios, domain_examples)
    
    // Save scenario files
    SAVE_SCENARIO_FILES(scenarios)
    UPDATE_CONVERSATION_LOG("Task 2 Complete")
    
    RETURN scenarios
```

### Task 3: Assessment & Automation

```pseudocode
TASK_3_ASSESSMENT(scenarios):
    // Load assessment context only
    assessment_criteria = LOAD_ASSESSMENT_CRITERIA()
    
    // Assess each scenario
    approved_scenarios = []
    excluded_scenarios = []
    
    FOR scenario IN scenarios:
        assessment = ASSESS_SCENARIO(scenario, assessment_criteria)
        IF assessment.suitable_for_automation:
            approved_scenarios.append(scenario)
        ELSE:
            excluded_scenarios.append({scenario, assessment.reason})
    
    // Generate automation code for approved scenarios
    automation_code = GENERATE_AUTOMATION(approved_scenarios)
    
    // Document assessment
    CREATE_ASSESSMENT_REPORT(approved_scenarios, excluded_scenarios)
    UPDATE_CONVERSATION_LOG("Task 3 Complete")
    
    RETURN {automation_code, assessment_report}
```

## Error Handling Pattern

### Validation Gates

```pseudocode
VALIDATE_PREREQUISITES(input_data, context):
    issues = []
    
    // Check input quality
    IF NOT VALIDATE_INPUT_COMPLETENESS(input_data):
        issues.append("Incomplete input data")
    
    // Check context availability  
    IF NOT VALIDATE_CONTEXT_LOADED(context):
        issues.append("Required context not available")
    
    // Check previous task completion
    IF REQUIRES_PREVIOUS_TASK(current_task):
        IF NOT VERIFY_PREVIOUS_TASK_COMPLETE():
            issues.append("Previous task not completed")
    
    IF len(issues) > 0:
        RETURN {status: "FAIL", issues: issues}
    ELSE:
        RETURN {status: "PASS"}
```

## Core Principles

### Context Smartness
- **Right information, right time**: Each task gets only what it needs
- **No competing instructions**: Avoid loading conflicting rule sets
- **Lazy loading**: Load context just before it's needed

### Task Isolation
- **Sequential execution**: Complete one task before starting the next
- **Clear boundaries**: Each task has distinct inputs and outputs  
- **Focused context**: No cross-contamination between task contexts

### Human Decision Points
- **AI recommends, humans decide**: Present options at critical points
- **Quality gates**: Stop execution when prerequisites aren't met
- **Flexible workflow**: Allow human intervention at any stage

This pattern provides the foundation for reliable, repeatable AI task execution that can be adapted to any domain or use case.