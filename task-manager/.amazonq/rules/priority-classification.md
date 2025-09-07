# Amazon Q Priority Classification Rules

## Overview
Consistent priority classification system for both Claude Code and Amazon Q. Ensures AI systems never downgrade ticket requirements and maintain proper P0-P4 classification.

## Core Classification Rules

### P0 (Core Requirements) - NEVER DOWNGRADE
```
DEFINITION: Requirements DIRECTLY from ticket acceptance criteria
SOURCE: Explicit acceptance criteria sections in ticket markdown
CONFIDENCE: 100% - These are contractual requirements

EXAMPLES:
- "User can select paint color from available options"
- "System displays price update when grade is changed"  
- "Configuration saves when user clicks Save button"

AI MUST:
✅ Preserve ALL P0 requirements exactly as written
✅ Flag quality issues but maintain P0 classification  
✅ Generate test scenarios for every P0 requirement
❌ NEVER downgrade P0 to lower priority
❌ NEVER remove P0 requirements
```

### P1 (Quality Gates) - Error Scenarios
```
DEFINITION: Error scenarios affecting core P0 behavior
PURPOSE: Ensure P0 requirements work reliably under error conditions

EXAMPLES:
- "System shows error when selecting unavailable color"
- "Price calculation handles missing data gracefully"
- "Save operation provides feedback on failure"

CHARACTERISTICS:
- Directly protects P0 functionality
- Prevents system failures that break core user flows
- Enables graceful degradation vs system crashes
```

### P2 (Regression Protection)
```
DEFINITION: Existing functionality that must not break
PURPOSE: Maintain current system behavior during changes

EXAMPLES:
- "Existing color selections remain functional"
- "Previous configuration data loads correctly"  
- "Current user preferences are preserved"

CHARACTERISTICS:
- Validates unchanged system components
- Ensures modifications don't break working features
- Supports safe deployment of new functionality
```

### P3-P4 (Additional Coverage)
```
DEFINITION: Comprehensive testing scenarios beyond ticket scope
PURPOSE: Maximize test coverage and cross-platform validation

P3 EXAMPLES (Cross-platform):
- "Color selection works on mobile devices"
- "Configuration loads correctly in Safari browser"
- "Keyboard navigation functions properly"

P4 EXAMPLES (Edge cases):
- "System handles 100+ concurrent users"
- "Configuration works with slow network connections"
- "Data persists through browser crashes"
```

## AI Classification Algorithm

### Step 1: Source Analysis
```
FOR each requirement:
  IF requirement appears in ticket acceptance criteria:
    priority = P0
    rationale = "Direct from ticket AC"
    LOCK classification (cannot be changed)
  
  ELSE IF requirement protects P0 functionality:
    priority = P1  
    rationale = "Error scenario for core behavior"
    
  ELSE IF requirement validates existing functionality:
    priority = P2
    rationale = "Regression protection"
    
  ELSE:
    priority = P3 or P4
    rationale = "Additional coverage"
```

### Step 2: Quality Assessment (Independent of Priority)
```
FOR each requirement (regardless of P0-P4):
  ASSESS clarity, testability, completeness
  FLAG issues for human attention
  SUGGEST improvements
  
  BUT NEVER:
    - Change P0 to lower priority due to quality issues
    - Remove requirements due to vagueness  
    - Downgrade based on implementation difficulty
```

### Step 3: User Choice Presentation
```
WHEN presenting analysis:
  GROUP by priority level
  SHOW rationale for each classification
  HIGHLIGHT any P0 quality issues requiring attention
  PRESENT user choices:
    - Proceed: Accept current requirements with noted issues
    - Apply SRP: Break down complex requirements  
    - Preview: Show potential BDD scenarios
    - Stop: Address quality issues first
    - Details: Get more specific analysis
```

## Domain-Specific Priority Considerations

### Car Configurator Domain (CARCONF prefix)
```
P0 PATTERNS:
- Color/paint selection functionality
- Grade/trim level selection  
- Price calculation and display
- Configuration saving/loading

P1 PATTERNS:
- Invalid selection error handling
- Price calculation edge cases
- Save operation failure scenarios
- Data validation errors

P2 PATTERNS:
- Existing configurator flow preservation
- Current UI component behavior
- Legacy data compatibility

P3-P4 PATTERNS:  
- Multi-browser compatibility
- Mobile responsive behavior
- Performance under load
- Accessibility compliance
```

## Consistency Rules Between Systems

### Both Claude Code and Amazon Q MUST:
```
1. Use identical P0-P4 definitions
2. Apply same classification algorithm  
3. Never downgrade P0 requirements
4. Present same priority rationale format
5. Generate consistent validation reports
6. Support same user choice options
```

### Cross-System Validation
```
IF Claude analysis differs from Amazon Q analysis:
  FLAG discrepancy for human review
  SHOW both classifications with rationale
  ALLOW human override with documentation
  LOG decision for system improvement
```

## Validation Report Format

### Standard Priority Section
```markdown
## Priority Classification

### P0 (Core Requirements) - From Ticket ACs
- [AC-001] User can select paint color from available options
- [AC-002] System displays price update when grade is changed
- [AC-003] Configuration saves when user clicks Save button

### P1 (Quality Gates) - Error Scenarios  
- System shows error when selecting unavailable color
- Price calculation handles missing data gracefully
- Save operation provides feedback on failure

### P2 (Regression Protection)
- Existing color selections remain functional  
- Previous configuration data loads correctly
- Current user preferences are preserved

### P3-P4 (Additional Coverage)
- Color selection works on mobile devices (P3)
- System handles 100+ concurrent users (P4)
- Data persists through browser crashes (P4)

## Classification Confidence
- P0: 100% (direct from ticket)
- P1: 90% (clear error scenarios)
- P2: 85% (existing functionality protection)  
- P3-P4: 75% (additional coverage judgment)
```

## Quality vs Priority Separation

### Key Principle: INDEPENDENT ASSESSMENT
```
PRIORITY = Where does this requirement come from?
QUALITY = How well is this requirement written?

EXAMPLES:
✅ CORRECT: "P0 requirement has clarity issues - flagged for review"
❌ WRONG: "Requirement downgraded to P2 due to vagueness"

✅ CORRECT: "P1 error scenario well-defined and testable"  
❌ WRONG: "Well-written requirement promoted to P0"
```

This ensures both AI systems maintain consistent, reliable priority classification while preserving all ticket requirements and providing quality feedback to humans.