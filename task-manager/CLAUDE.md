# CLAUDE.md

This file provides guidance to Claude Code when working with the Task Manager base rules and examples.

## Repository Overview

This repository demonstrates simplified base rules for AI-driven test automation. The base rules provide essential patterns for requirement validation, task execution, dynamic context loading, and conversation logging. All rules use clean pseudocode syntax and focus on buildable examples rather than comprehensive implementations.

## Task Execution Commands

### Task 1: Hybrid Requirement Validation + BA Specification Analysis
When user says "execute task 1 for [TICKET]":

**Implementation**: Uses enhanced Task1IntegrationEngine from `/home/pauljcoles/code/cats/task-manager/src/validation/task1_integration.py`

**Hybrid Analysis Approach**:
- **Code-based validation** (100% confidence): Detects vague terms, external references, clear patterns
- **LLM-based validation** (75-85% confidence): Analyzes multiple behaviors, contextual vagueness, complex conditionals
- **NEW: BA Specification Analysis**: Teresa Torres-inspired quality evaluations for business analyst workflows
- **Combined intelligence**: Reliable pattern detection + contextual judgment + business analysis quality

**Execution Flow**:
1. **Load validation context**:
   - Execute Python integration: `python /home/pauljcoles/code/cats/task-manager/base-rules/code-rules/task1_integration.py [TICKET]`
   - Load ticket from `/home/pauljcoles/code/cats/task-manager/example-tickets/[TICKET].md`
   - Apply hybrid evaluation patterns from `HybridGate1Evaluator` class

2. **Apply dynamic context loading**:
   - Extract ticket prefix (e.g., CARCONF-104 → CARCONF) 
   - Check for domain directory at `/home/pauljcoles/code/cats/task-manager/context-rules/[prefix]-domain/`
   - Load `business-domain-config.md` and `test_data.json` if available
   - Use domain context to enhance LLM analysis accuracy

3. **Run hybrid validation gates**:
   - **Code Detection**: Vague terms, external references, implementation contamination (confidence: 1.0)
   - **LLM Analysis**: Multiple behaviors, contextual clarity, complex conditionals (confidence: 0.75-0.85)  
   - **Priority Classification**: P0=ticket ACs, P1=error scenarios, P2=regression, P3-P4=additional
   - **Method Transparency**: Show which issues were detected by code vs LLM reasoning

3b. **Run BA specification analysis** (NEW):
   - **Specification Structure**: Document organization and completeness validation
   - **Persona Extraction Completeness**: Role, motivations, context validation for all personas
   - **Business Goal Clarity**: Measurable success criteria and metrics assessment
   - **Overall BA Quality Score**: Combined evaluation with 0-100 scoring (60+ threshold for pass)
   - **Graceful handling**: Skip analysis for simple tickets without specification elements

4. **Generate enhanced analysis outputs**:
   - Create directory: `/home/pauljcoles/code/cats/task-manager/aiGenerated/[TICKET]/`
   - Save validation report: `/home/pauljcoles/code/cats/task-manager/aiGenerated/[TICKET]/[TICKET]_validation_report.md`
   - **Enhanced**: Include comprehensive "BA Specification Quality Analysis" section with individual evaluation results
   - Create conversation log: `/home/pauljcoles/code/cats/task-manager/aiGenerated/[TICKET]/[TICKET]_conversation.md`
   - Include hybrid analysis breakdown with confidence levels
   - **NEW**: Show extracted specification elements summary (personas, goals, journeys, constraints)
   - Present user choices: Proceed, Apply SRP, Preview, Stop, Details

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

### Task 5: Generate Stories from Specifications
When user says "execute task 5 for [SPECIFICATION]":

**Implementation**: Uses Task5IntegrationEngine from `/home/pauljcoles/code/cats/task-manager/src/generation/task5_integration.py`

**Intelligent Story Generation Approach**:
- **LLM-based requirement extraction** (replaces broken markdown parser): Smart identification of logical story boundaries
- **Quality-first generation** (applies INVEST during creation): No combinatorial explosion, focused stories only
- **Traceability maintained**: Each story linked to source requirement section
- **INVEST compliance**: Independence, Negotiability, Value, Estimability, Size, Testability applied during generation

**Execution Flow**:
1. **Load specification content**:
   - Load from `/home/pauljcoles/code/cats/task-manager/specifications/[SPECIFICATION].md`
   - Raw content processing (no fragile parsing)
   - Maintain full specification context

2. **Apply LLM-based requirement extraction**:
   - Identify discrete functional requirements using intelligent patterns
   - Extract logical story boundaries from specification sections  
   - Maintain traceability to source sections
   - Filter requirements suitable for user story generation

3. **Generate focused user stories**:
   - 1 story per requirement (no persona×goal combinatorial explosion)
   - Apply INVEST criteria during generation (not after)
   - Generate meaningful acceptance criteria per story
   - Apply business value analysis to each story
   - Cap output at 8-15 focused, high-quality stories

4. **Generate Task 5 outputs**:
   - Create directory: `/home/pauljcoles/code/cats/task-manager/aiGenerated/[SPECIFICATION]/`
   - Save stories report: `/home/pauljcoles/code/cats/task-manager/aiGenerated/[SPECIFICATION]/[SPECIFICATION]_generated_stories.md`
   - Create conversation log: `/home/pauljcoles/code/cats/task-manager/aiGenerated/[SPECIFICATION]/[SPECIFICATION]_conversation.md`
   - Include requirement extraction breakdown with source traceability
   - Present user with quality analysis and next steps

5. **Integration with Task 1**:
   - Generated stories ready for Task 1 validation: `execute task 1 for [SPECIFICATION-STORY-001]`
   - Stories passing Task 1 are ready for Jira import
   - Complete pipeline: Specification → Task 5 → Task 1 → BDD (Task 2) → Assessment (Task 3a/3b)

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

### NEW: BA Integration Principles

**Teresa Torres Evaluation Framework**:
- **Simple, focused evaluations** targeting biggest failure modes
- **Systematic measurement** replaces "vibe checking"
- **Fast feedback loops** during conversational task execution
- **Human-AI collaboration**: AI identifies issues, humans make final decisions

**Quality Thresholds**:
- **BA Quality Score ≥60**: Pass threshold for business analysis quality
- **BA Quality Score ≥80**: Excellence threshold for optimal quality
- **INVEST Compliance >0.8**: Story quality threshold using existing proven algorithm
- **Specification Elements**: All critical sections (personas, goals) must be present

**Integration Approach**:
- **Non-disruptive**: BA analysis runs alongside existing hybrid validation
- **Graceful degradation**: Skips BA analysis for simple tickets without specification elements
- **Enhanced reporting**: Comprehensive quality assessment in existing validation reports
- **Context-smart**: BA evaluations get focused patterns, not full context files

## File Paths and Structure
All file paths should use absolute paths starting with `/home/pauljcoles/code/cats/task-manager/` to ensure consistent access to base rules, examples, and domain configurations.

When referencing files, always use the complete path structure shown in this guide to maintain consistency across different execution contexts.