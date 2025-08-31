# Essential Requirement Validation Pattern

## Core Principle: Stop Early, Fix Less Later

**The fundamental rule**: Better to stop early than fix wrong scenarios later.

```
Prevent starting test scenario creation with insufficient or changing requirements.
```

## CRITICAL Validation Rule

**The AI must NEVER remove, eliminate, or skip requirements or scenarios. ALL identified requirements (P0-P4) must be preserved and classified. Only humans decide what to test.**

## Essential Pre-Flight Checks

### Step 1: Quality Assessment

```pseudocode
VALIDATE_REQUIREMENTS(ticket_data):
    issues = []
    
    // Check completeness
    IF NOT HAS_CLEAR_SCOPE(ticket_data):
        issues.append("Scope definition unclear")
    
    // Check clarity  
    IF HAS_AMBIGUOUS_LANGUAGE(ticket_data):
        issues.append("Contains undefined terms")
    
    // Check testability
    IF NOT HAS_OBSERVABLE_OUTCOMES(ticket_data):
        issues.append("Outcomes not observable")
    
    // Check stability
    IF RECENTLY_CHANGED(ticket_data):
        issues.append("Requirements recently modified")
    
    RETURN ASSESSMENT_RESULT(issues)
```

### Step 2: Architecture Detection

```pseudocode
DETECT_ARCHITECTURE(ticket_data):
    // Check title patterns
    IF ticket_data.title.starts_with("[BACKEND"):
        RETURN "backend_api"
    ELIF ticket_data.title.starts_with("[FRONTEND"):
        RETURN "frontend_ui"
    
    // Check components
    FOR component IN ticket_data.components:
        IF component.contains("Digital_Backend"):
            RETURN "backend_api"  
        ELIF component.contains("Digital_Frontend"):
            RETURN "frontend_ui"
    
    // Request clarification if unclear
    RETURN "architecture_unknown"
```

### Step 3: Priority Classification

```pseudocode
CLASSIFY_REQUIREMENTS(requirements_list):
    classified = []
    
    FOR requirement IN requirements_list:
        priority = DETERMINE_PRIORITY(requirement)
        classified.append({
            requirement: requirement,
            priority: priority,
            rationale: GET_PRIORITY_RATIONALE(priority)
        })
    
    RETURN classified

DETERMINE_PRIORITY(requirement):
    // P0: Direct from ticket acceptance criteria
    IF requirement.source == "ticket_ac":
        RETURN "P0"
    
    // P1: Error scenarios affecting core behavior  
    ELIF requirement.type == "error_scenario" AND requirement.impact == "core":
        RETURN "P1"
    
    // P2: Regression testing of existing functionality
    ELIF requirement.type == "regression_test":
        RETURN "P2"
    
    // P3: Cross-platform validation
    ELIF requirement.type == "cross_platform":
        RETURN "P3"
        
    // P4: Edge cases and future scenarios
    ELSE:
        RETURN "P4"
```

## Validation Gates

### Gate 1: Completeness Check
```
- Clear scope definition (what's in/out)
- Complete user flows (trigger to outcome)  
- Specific conditions (clear triggers)
- Success criteria (pass/fail defined)
```

### Gate 2: Clarity Check
```
- No undefined terms ("appropriate", "proper")
- Single behavior per acceptance criterion
- No missing referenced materials
- Clear conditional logic
```

### Gate 3: Testability Check  
```
- Observable behaviors (can see/verify outcomes)
- Specific conditions (clear triggers for behavior)
- Demonstrable results (provable pass/fail)
- Realistic test scenarios (actually executable)
```

## Human Decision Framework

### When Validation Fails

```pseudocode
HANDLE_VALIDATION_FAILURE(issues):
    DISPLAY_ISSUES(issues)
    
    options = [
        "STOP - Fix requirements first",
        "CONTINUE - Accept lower quality scenarios", 
        "REWRITE - Apply best structural fixes for identified issues",
        "PREVIEW - See what scenarios would look like"
    ]
    
    user_choice = PRESENT_OPTIONS(options)
    
    IF user_choice == "REWRITE":
        RETURN REWRITE_REQUIREMENTS(issues, ticket_data)
    ELSE:
        RETURN EXECUTE_CHOICE(user_choice)
```

### Decision Options

**STOP**: Halt processing until requirements improve
- Best for: Critical projects, unclear scope, major ambiguities
- Impact: Delays start but prevents rework

**CONTINUE**: Proceed with current requirements  
- Best for: Time pressure, minor issues, exploratory work
- Impact: May need scenario refinement later

**REWRITE**: Apply best structural fixes for identified issues
- Compound requirements → Single responsibility breakdown
- Mixed architectural concerns → Split into focused tickets  
- Implementation contamination → User-behavior focus
- Unclear outcomes → Observable behavior definition
- Best for: Requirements with multiple structural issues
- Impact: Comprehensive quality improvement with human review

**PREVIEW**: Generate sample scenarios to assess feasibility
- Best for: Uncertain about requirement quality
- Impact: Shows potential issues before commitment

## Quality Standards

### What Makes Good Requirements

```
✓ ONE behavior per acceptance criterion
✓ User-observable outcomes  
✓ Clear preconditions
✓ Specific success criteria
✓ No implementation details
✓ Testable within reasonable effort
```

### Common Problems to Catch

```
✗ Multiple behaviors in single AC
✗ Technical implementation details  
✗ Undefined business terms
✗ References to unavailable materials
✗ Conditional logic without clear conditions
✗ Subjective success criteria
```

## Core Principles

### Early Stopping Saves Time
- **Investment protection**: Small validation effort prevents large rework
- **Quality gates**: Systematic checks catch issues before they compound
- **Human judgment**: AI identifies issues, humans make decisions

### Classification Preserves All Requirements
- **Nothing gets lost**: All requirements captured and classified
- **Priority-driven**: P0-P4 system enables priority-based execution
- **Human control**: AI suggests, humans decide what to implement

### Adaptable Framework
- **Domain-agnostic**: Works for any type of requirements
- **Configurable gates**: Adjust validation strictness per project
- **Flexible responses**: Multiple options for handling validation failures

## Rewrite Strategies

### Comprehensive Issue Resolution

```pseudocode
REWRITE_REQUIREMENTS(issues, ticket_data):
    fixes_applied = []
    rewritten_tickets = []
    
    // Fix compound requirements
    IF HAS_COMPOUND_REQUIREMENTS(ticket_data):
        ticket_data = APPLY_SINGLE_RESPONSIBILITY(ticket_data)
        fixes_applied.append("single_responsibility")
    
    // Fix mixed concerns  
    IF HAS_MIXED_ARCHITECTURAL_CONCERNS(ticket_data):
        ticket_splits = SPLIT_BY_ARCHITECTURE(ticket_data)
        rewritten_tickets = ticket_splits
        fixes_applied.append("ticket_splitting")
    
    // Fix implementation contamination
    IF HAS_IMPLEMENTATION_DETAILS(ticket_data):
        ticket_data = EXTRACT_USER_BEHAVIORS(ticket_data)
        fixes_applied.append("behavior_focus")
        
    // Fix unclear outcomes
    IF HAS_UNCLEAR_OUTCOMES(ticket_data):
        ticket_data = DEFINE_OBSERVABLE_BEHAVIORS(ticket_data)
        fixes_applied.append("observable_outcomes")
    
    RETURN REWRITE_RESULT(rewritten_tickets, fixes_applied)
```

### Fix Strategy Patterns

#### 1. Single Responsibility Breakdown
```
Original (Compound): "When user selects engine, update store, show preview, log analytics"
Rewritten (Single):
- "When user selects engine, selection is visually confirmed"
- "When user selects engine, selection persists in configuration" 
- "When user selects engine, engine preview displays"
- "When user selects engine, selection is tracked for analytics"
```

#### 2. Architectural Concern Separation
```
Original (Mixed): Single ticket with UI + API + Database behaviors
Rewritten (Split):
- TICKET-A: User Interface Behaviors (what user sees/does)
- TICKET-B: API Service Behaviors (data validation/processing)
- TICKET-C: Data Layer Behaviors (persistence/retrieval)
```

#### 3. Implementation Detail Extraction
```
Original (Technical): "POST to /api/v2/config with Redux dispatch(setEngine)"
Rewritten (Behavioral): "User sees confirmation that engine selection was saved"
```

#### 4. Observable Outcome Definition
```
Original (Vague): "System handles engine selection appropriately"
Rewritten (Observable): "User sees selected engine highlighted in configuration summary"
```

### Rewrite Quality Gates

After applying fixes, validate:
```
✓ Each AC has single, testable behavior
✓ Each ticket focuses on one architectural layer
✓ All requirements describe user-observable outcomes
✓ Success criteria are demonstrable and specific
✓ No implementation details contaminate requirements
✓ All original functionality preserved across rewritten tickets
```

## Core Principles

### Do The Best Fix For What's Wrong
- **Issue identification**: Systematic detection of requirement quality problems
- **Appropriate response**: Apply the right fix strategy for each issue type  
- **Comprehensive improvement**: Address all structural problems, not just obvious ones
- **Preserve functionality**: Maintain all original requirements through rewrite process

This pattern ensures AI systems work with quality requirements and provides clear options when they don't.