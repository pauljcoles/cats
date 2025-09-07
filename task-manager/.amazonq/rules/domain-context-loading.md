# Amazon Q Domain Context Loading Rules

## Overview
Dynamic context loading system that provides domain-specific configuration while maintaining universal patterns. Prevents Context Rot through focused, task-specific context injection.

## Domain Detection Pattern

### Ticket Prefix Extraction
```
INPUT: "CARCONF-104" → OUTPUT: "CARCONF"
INPUT: "BMWUX-205" → OUTPUT: "BMWUX"  
INPUT: "MERCEDESAPI-301" → OUTPUT: "MERCEDESAPI"

ALGORITHM:
1. Split ticket ID on first hyphen: ticket.split('-')[0]
2. Convert to lowercase for directory matching
3. Construct domain path: `/context-rules/${prefix}-domain/`
```

## Available Domain Configurations

### Standard Domains
- **carconf-domain** (bob-domain): Generic car configurator patterns
- **mercedes-domain**: Premium luxury focus with AMG grades, European terminology
- **bmw-domain**: Performance focus with M Sport grades, global variations  
- **renault-domain**: Electric vehicle focus with French terminology, limited editions

### Domain Structure
```
/context-rules/[prefix]-domain/
├── business-domain-config.md    # Terminology, selectors, business processes
├── test_data.json              # Colors, grades, engines, packages, constraints
└── domain-specific-patterns.md # Custom validation rules (optional)
```

## Context Loading Algorithm

### Step 1: Domain Detection
```
ticket_prefix = extract_prefix(ticket_id)
domain_directory = `/home/pauljcoles/code/cats/task-manager/context-rules/${ticket_prefix.toLowerCase()}-domain/`

IF directory_exists(domain_directory):
  domain_found = true
  SET context_source = "domain-specific"
ELSE:
  domain_found = false  
  SET context_source = "core-patterns"
```

### Step 2: Context Loading
```
IF domain_found:
  LOAD business_config FROM domain_directory/business-domain-config.md
  LOAD test_data FROM domain_directory/test_data.json
  IF exists(domain_directory/domain-specific-patterns.md):
    LOAD custom_patterns FROM domain-specific-patterns.md
  
  context_payload = {
    "business_terminology": business_config.terminology,
    "component_selectors": business_config.selectors,
    "test_values": test_data,
    "business_processes": business_config.processes,
    "custom_validation": custom_patterns || null
  }
ELSE:
  context_payload = {
    "source": "core-patterns",
    "fallback_mode": true
  }
```

### Step 3: Context Application

#### For Task 1 (Requirement Validation)
```
IF domain_context_available:
  ENHANCE LLM prompts with:
    - Domain-specific terminology (e.g., "AMG Line" vs "M Sport")
    - Business process context (e.g., "configurator flow", "grade selection")
    - Component naming patterns (e.g., "ColorSelector" vs "PaintChooser")
    - Domain constraints (e.g., "EV charging options", "luxury packages")

ELSE:
  USE generic validation patterns
  FLAG requirement for potential domain configuration creation
```

#### For Task 2 (BDD Generation)
```
IF domain_context_available:
  SUBSTITUTE domain values into universal BDD patterns:
    - Colors: "Red Metallic" → "Polar White" (Mercedes) or "Alpine White" (BMW)
    - Grades: "Base" → "AMG Line" (Mercedes) or "M Sport" (BMW)  
    - Options: "Premium Package" → "Drivers Package" (BMW)

ELSE:
  USE generic placeholder values
  MAINTAIN universal BDD structure
```

## Domain Configuration Examples

### Mercedes Domain Context
```json
{
  "terminology": {
    "grades": ["AMG Line", "Exclusive", "Premium"],
    "colors": ["Polar White", "Obsidian Black", "Iridium Silver"],
    "packages": ["AMG Package", "Premium Package", "Night Package"]
  },
  "business_processes": {
    "selection_flow": "grade → color → interior → packages",
    "pricing_model": "base_price + grade_delta + option_costs"
  },
  "component_selectors": {
    "grade_selector": "[data-testid='mercedes-grade-selector']",
    "color_picker": "[data-testid='mercedes-color-wheel']"
  }
}
```

### BMW Domain Context  
```json
{
  "terminology": {
    "grades": ["M Sport", "Luxury Line", "Sport Line"],
    "colors": ["Alpine White", "Jet Black", "Storm Bay"],
    "packages": ["Driving Package", "Technology Package", "Premium Package"]
  },
  "business_processes": {
    "selection_flow": "model → grade → color → packages → summary",
    "pricing_model": "msrp + grade_premium + package_bundles"
  }
}
```

## Context Smartness Principles

### Focused Loading
- **Task 1**: Load only validation patterns + domain terminology
- **Task 2**: Load only BDD patterns + domain test data
- **Task 3a**: Load only assessment criteria + domain business processes  
- **Task 3b**: Load only automation patterns + domain selectors

### Prevent Context Rot
- Never load all domain configurations simultaneously
- Inject only task-relevant context portions
- Maintain clear separation between domain data types

### Universal Pattern Preservation
```
CORE PATTERN: User selects [ITEM] from [CONTAINER]
DOMAIN SUBSTITUTION:
  - Mercedes: User selects "AMG Line" from "grade selector"
  - BMW: User selects "M Sport" from "grade selector"  
  - Renault: User selects "Iconic" from "grade selector"

BDD STRUCTURE REMAINS IDENTICAL:
Given I am on the configuration page
When I select the "[[GRADE]]" grade
Then I should see the grade reflected in my selection
And the price should update accordingly
```

## Fallback Strategy

### When Domain Not Found
```
LOG: "Domain configuration not found for prefix: ${ticket_prefix}"
LOG: "Falling back to core validation patterns"

IF task_requires_domain_specificity:
  SUGGEST: "Consider creating domain configuration at: ${domain_path}"
  PROVIDE: Template for domain configuration structure

CONTINUE: Using generic patterns and placeholder values
MAINTAIN: All core functionality without domain enhancement
```

### Domain Configuration Creation Guidance
```
WHEN suggesting domain creation:
1. Show ticket prefix that triggered fallback
2. Provide template directory structure
3. Include example configuration files
4. Explain benefits of domain-specific context
5. Maintain backward compatibility with core patterns
```

This system ensures both AI systems (Claude Code and Amazon Q) use identical domain loading logic while maintaining the flexibility to work with or without domain-specific configurations.