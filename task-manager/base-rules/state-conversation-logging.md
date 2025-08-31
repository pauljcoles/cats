# Essential Conversation Logging Pattern

## Basic Structure

### File Naming
```
[TICKET-ID]_[feature_name]_conversation.md
```

### Storage Pattern
```
[output_path]/[TICKET-ID]/
├── [TICKET-ID]_conversation.md
├── reports/
├── automation/
└── scenarios/
```

## Core Template

### Header Section (Required)
```markdown
# Conversation Log: [Feature Name]

**Ticket**: [TICKET-ID]
**Created**: [Use date command for timestamp]
**Last Updated**: [Use date command for timestamp]
**Current Task**: [Task 1/2/3/Complete]
**Status**: [Analysis/Generation/Assessment/Complete]
```

### Essential Content Structure

#### Analysis Section
```markdown
## Initial Analysis

### Requirements Summary
- REQ-001 (P0): [Core requirement] - Direct ticket requirement
- REQ-002 (P1): [Quality requirement] - Error scenarios
- REQ-003 (P2): [Regression requirement] - Existing functionality

### Identified Scenarios
#### Positive Scenarios
- [Main user journey descriptions]

#### Negative Scenarios  
- [Error case descriptions]

### Quality Assessment
- **Completeness**: [Assessment of requirement clarity]
- **Testability**: [Assessment of observable outcomes]
- **Gaps**: [Missing information noted]
```

#### Task Progress Section
```markdown
## Task Execution Progress

### Task 1: Analysis
- **Status**: Complete/In Progress/Pending
- **Output**: Analysis complete, [X] requirements identified
- **Next**: Proceed to scenario generation

### Task 2: Scenario Generation  
- **Status**: Complete/In Progress/Pending
- **Output**: [X] scenarios created in [location]
- **Next**: Proceed to assessment

### Task 3: Assessment & Automation
- **Status**: Complete/In Progress/Pending  
- **Output**: [X] scenarios approved for automation
- **Next**: Implementation ready
```

## Update Process

### When to Update
1. **After each task completion**
2. **When status changes** 
3. **When requirements change**
4. **At project milestones**

### Update Pattern
```pseudocode
UPDATE_CONVERSATION_LOG():
    current_timestamp = BASH("date")
    UPDATE_FIELD("Last Updated", current_timestamp)
    UPDATE_FIELD("Current Task", task_status)
    APPEND_SECTION(task_completion_summary)
    SAVE_FILE()
```

## Core Principles

### Documentation That Helps
- **Structure over chaos**: Consistent format aids understanding
- **Progress tracking**: Clear status of what's been done  
- **Decision capture**: Record why choices were made
- **Context preservation**: Keep the reasoning chain intact

### Practical Application
- Template-driven approach prevents missing information
- Timestamp tracking shows work progression
- Task status helps team understand current state
- Artifact links connect documentation to outputs

This pattern ensures AI work is documentable, trackable, and transferable to team members.