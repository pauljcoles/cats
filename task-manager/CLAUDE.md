# CLAUDE.md

This file provides guidance to Claude Code when working with the Task Manager base rules and examples.

## Repository Overview

This repository demonstrates simplified base rules for AI-driven test automation. The base rules provide essential patterns for requirement validation, task execution, dynamic context loading, and conversation logging. All rules use clean pseudocode syntax and focus on buildable examples rather than comprehensive implementations.

## Task Execution Commands

### Task 1: Requirement Validation
When user says "execute task 1 for [TICKET]":

1. **Load validation context**:
   - Apply patterns from `/home/pauljcoles/code/cats/task-manager/base-rules/task-requirement-validation.md`
   - Load ticket from `/home/pauljcoles/code/cats/task-manager/example-tickets/[TICKET].md`

2. **Apply dynamic context loading**:
   - Extract ticket prefix (e.g., CARCONF-104 → CARCONF) 
   - Check for domain directory at `/home/pauljcoles/code/cats/task-manager/context-rules/[prefix]-domain/`
   - Load `business-domain-config.md` and `test_data.json` if available
   - Fall back to core patterns if domain not found

3. **Run validation gates**:
   - Step 1: Quality Assessment (completeness, clarity, testability, stability)
   - Step 2: Architecture Detection (frontend/backend)
   - Step 3: Priority Classification (P0=ticket ACs, P1=error scenarios, P2=regression, P3-P4=additional)

4. **Generate analysis outputs**:
   - Create directory: `/home/pauljcoles/code/cats/task-manager/aiGenerated/[TICKET]/`
   - Save validation report: `/home/pauljcoles/code/cats/task-manager/aiGenerated/[TICKET]/[TICKET]_validation_report.md`
   - Create conversation log: `/home/pauljcoles/code/cats/task-manager/aiGenerated/[TICKET]/[TICKET]_conversation.md`
   - Follow the format shown in existing validation reports
   - Include PASS/FAIL decision with specific recommendations

### Task 2: BDD Scenario Generation
When user says "execute task 2 for [ANALYSIS_RESULT]" or "execute task 2 for [TICKET]":

1. **Load BDD generation context**:
   - Apply Load→Validate→Execute→Document pattern from `/home/pauljcoles/code/cats/task-manager/base-rules/task-execution.md`
   - Use `/home/pauljcoles/code/cats/task-manager/example-tickets/BDD-GOLD-STANDARD.md` as BDD gold standard
   - Load state/flow context from `/home/pauljcoles/code/cats/task-manager/context-rules/car-configurator-states-flow.md`

2. **Apply domain configuration**:
   - Load domain-specific test data from appropriate domain directory
   - Use domain values in scenarios (e.g., "Red Metallic" from bob-domain becomes "Polar White" from mercedes-domain)
   - Maintain universal scenario structure while using domain-specific values

3. **Generate scenarios by priority**:
   - P0: Direct from ticket acceptance criteria
   - P1: Error scenarios affecting core behavior  
   - P2: Regression testing scenarios
   - P3-P4: Edge cases and comprehensive coverage

4. **Generate BDD outputs**:
   - Save BDD scenarios: `/home/pauljcoles/code/cats/task-manager/aiGenerated/[TICKET]/[TICKET]_bdd_scenarios.feature`
   - Update conversation log: `/home/pauljcoles/code/cats/task-manager/aiGenerated/[TICKET]/[TICKET]_conversation.md`
   - Use Given-When-Then format following BDD-GOLD-STANDARD.md pattern
   - Focus on user-observable outcomes, not implementation details
   - Apply BMW vs Mercedes principle (same scenario works for any domain)

### Task 3a: Behavioral Assessment
When user says "execute task 3a for [SCENARIOS]" or "execute task 3a for [TICKET]":

1. **Load assessment context**:
   - Apply assessment criteria patterns
   - Focus on automation suitability vs manual testing needs

2. **Assess scenarios**:
   - **Include for automation**: Multi-step workflows, integration tests, business process validation
   - **Exclude from automation**: Single component behavior, subjective UX validation, accessibility (specialized tools)

3. **Generate assessment outputs**:
   - Save assessment report: `/home/pauljcoles/code/cats/task-manager/aiGenerated/[TICKET]/[TICKET]_assessment_report.md`
   - Update conversation log: `/home/pauljcoles/code/cats/task-manager/aiGenerated/[TICKET]/[TICKET]_conversation.md`
   - List approved scenarios with rationale
   - List excluded scenarios with alternative approaches

### Task 3b: Automation Generation  
When user says "execute task 3b for [APPROVED_SCENARIOS]" or "execute task 3b for [TICKET]":

1. **Load automation context**:
   - Apply React Testing Library and Playwright patterns
   - Use component selectors from domain business-config files
   - Reference `/home/pauljcoles/code/cats/task-manager/examples/automation-examples/task3b_automation_generation_example.md` for patterns

2. **Generate test code**:
   - React Testing Library: Component interaction tests with proper async/await patterns
   - Playwright: End-to-end flows with page object patterns
   - Include accessibility testing where appropriate
   - Use domain test data for dynamic test generation

3. **Generate automation outputs**:
   - Save automation code: `/home/pauljcoles/code/cats/task-manager/aiGenerated/[TICKET]/[TICKET]_automation_code.md`
   - Update conversation log: `/home/pauljcoles/code/cats/task-manager/aiGenerated/[TICKET]/[TICKET]_conversation.md`
   - List required page objects and selectors
   - Identify missing step definitions
   - Document integration points with domain data

## Available Test Examples

### Good Requirements (should PASS validation)
- **CARCONF-104**: Clean paint selection requirements
- **CARCONF-105**: Clean engine selection requirements  
- **CARCONF-107**: Clean grade selection requirements

### Poor Requirements (should FAIL validation)
- **CARCONF-103**: Implementation-contaminated paint selection
- **CARCONF-106**: Technical implementation focus
- **CARCONF-108**: Microservices architecture focus

### BDD Gold Standard
- **standard.md**: Perfect BDD scenario example for paint selection

## Domain Configurations

### Available Domains
- **bob-domain**: Generic car configurator with comprehensive test data
- **mercedes-domain**: Premium luxury focus with AMG grades and European terminology
- **bmw-domain**: Performance focus with M Sport grades and global variations
- **renault-domain**: Electric vehicle focus with French terminology and limited editions

### Domain Structure
Each domain contains:
- `business-domain-config.md`: Terminology, selectors, business processes
- `test_data.json`: Colors, grades, engines, packages, constraints, pricing rules
- Domain-specific business logic and validation rules

## State/Flow Context
- **car-configurator-states-flow.md**: Comprehensive state documentation based on real Renault R5 configurator recording
- Provides realistic context for AI scenario generation
- Shows actual component patterns, business logic, selector strategies

## Core Principles

### Context Smartness Over Comprehensiveness
- Each task gets only the context it needs
- No competing instructions or cross-contamination
- Focused context loading prevents Context Rot

### Universal Patterns with Domain Configuration  
- Same BDD scenarios work across BMW, Mercedes, Renault
- Domain-specific values substituted into universal patterns
- Implementation-agnostic test logic

### Human Decision Points
- AI identifies issues and generates options
- Humans make final decisions on quality gates
- AI never removes or skips requirements (P0-P4 all preserved)

### Priority Classification Rules
- **P0 (Core)**: ONLY requirements directly from ticket acceptance criteria
- **P1 (Quality Gates)**: Error scenarios affecting core behavior
- **P2 (Regression)**: Existing functionality validation
- **P3-P4 (Additional)**: Cross-platform, edge cases, comprehensive coverage
- AI NEVER downgrades ticket requirements from P0 to lower priorities

## File Paths and Structure
All file paths should use absolute paths starting with `/home/pauljcoles/code/cats/task-manager/` to ensure consistent access to base rules, examples, and domain configurations.

When referencing files, always use the complete path structure shown in this guide to maintain consistency across different execution contexts.