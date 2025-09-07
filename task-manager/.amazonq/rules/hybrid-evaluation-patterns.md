# Amazon Q Hybrid Evaluation Patterns

## Overview
Patterns for combining deterministic code analysis with contextual LLM judgment. Mirrors the approach implemented in `/base-rules/code-rules/task1.py` for consistent evaluation across AI systems.

## Evaluation Method Classification

### Code-Based Detection (Confidence: 1.0)
Use deterministic pattern matching for:

#### Vague Terms Detection
```
VAGUE_TERMS = [
  "user-friendly", "intuitive", "seamless", "smooth", "robust",
  "flexible", "scalable", "maintainable", "efficient", "optimal",
  "appropriate", "suitable", "reasonable", "proper", "adequate",
  "clean", "simple", "easy", "quick", "fast", "responsive"
]

ALGORITHM:
FOR each acceptance_criteria:
  vague_count = count_occurrences(acceptance_criteria, VAGUE_TERMS)
  IF vague_count > 0:
    CREATE LanguageIssue(
      failure_type = VAGUE_TERMS,
      severity = HIGH,
      confidence = 1.0,
      eval_method = CODE_BASED,
      detected_pattern = matched_terms,
      suggestion = "Replace with specific, measurable criteria"
    )
```

#### External Reference Detection
```
EXTERNAL_PATTERNS = [
  r"as per existing\s+\w+",
  r"similar to\s+\w+",
  r"like the current\s+\w+",
  r"based on\s+\w+\s+implementation",
  r"following\s+\w+\s+approach"
]

ALGORITHM:  
FOR each acceptance_criteria:
  FOR each pattern in EXTERNAL_PATTERNS:
    IF regex_match(acceptance_criteria, pattern):
      CREATE LanguageIssue(
        failure_type = EXTERNAL_REFERENCES,
        severity = CRITICAL,
        confidence = 1.0,
        eval_method = CODE_BASED,
        detected_pattern = matched_text,
        suggestion = "Define requirements independently without external references"
      )
```

#### Implementation Contamination Detection
```
IMPLEMENTATION_TERMS = [
  "using React", "via API", "in the database", "with GraphQL",
  "through microservices", "using Redux", "in the frontend",
  "backend service", "REST endpoint", "database table",
  "component state", "event handler", "HTTP request"
]

ALGORITHM:
FOR each acceptance_criteria:
  impl_count = count_occurrences(acceptance_criteria, IMPLEMENTATION_TERMS)  
  IF impl_count > 0:
    CREATE LanguageIssue(
      failure_type = IMPLEMENTATION_CONTAMINATION,
      severity = HIGH,
      confidence = 1.0,
      eval_method = CODE_BASED,
      detected_pattern = matched_terms,
      suggestion = "Focus on user-observable behavior, not implementation details"
    )
```

### LLM-Based Analysis (Confidence: 0.75-0.85)
Use contextual judgment for:

#### Multiple Behaviors Detection
```
LLM_PROMPT = """
Analyze this acceptance criteria for multiple distinct behaviors:

CRITERIA: {acceptance_criteria}

Count distinct user actions or system responses. Each "and" that connects different behaviors counts as multiple behaviors.

EXAMPLES:
- "User selects color" = 1 behavior  
- "User selects color and sees price update" = 2 behaviors
- "User selects color, sees preview, and price updates" = 3 behaviors

Return: behavior_count, confidence_level, explanation
"""

IF behavior_count > 1:
  CREATE LanguageIssue(
    failure_type = MULTIPLE_BEHAVIORS,
    severity = MEDIUM,
    confidence = llm_confidence,
    eval_method = LLM_BASED,
    detected_pattern = "Multiple behaviors in single AC",
    suggestion = "Split into separate acceptance criteria following SRP"
  )
```

#### Contextual Vagueness Assessment  
```
LLM_PROMPT = """
Assess this requirement for contextual clarity:

REQUIREMENT: {acceptance_criteria}
DOMAIN_CONTEXT: {domain_context if available}

Consider:
- Would a developer new to this domain understand the requirement?
- Are business terms defined or contextually clear?
- Can this be tested without additional clarification?

Return: clarity_score (0-1), issues_found, specific_suggestions
"""

IF clarity_score < 0.7:
  CREATE LanguageIssue(
    failure_type = UNCLEAR_CONDITIONALS,
    severity = MEDIUM,
    confidence = clarity_score,
    eval_method = LLM_BASED,
    detected_pattern = "Contextual vagueness",
    suggestion = llm_suggestions
  )
```

## Hybrid Analysis Workflow

### Step 1: Code-Based Pre-Processing
```
code_issues = []

# Run all deterministic checks
code_issues.extend(detect_vague_terms(acceptance_criteria))
code_issues.extend(detect_external_references(acceptance_criteria)) 
code_issues.extend(detect_implementation_contamination(acceptance_criteria))

# Quick quality gates
IF any(issue.severity == CRITICAL for issue in code_issues):
  overall_status = "FAIL - Critical issues found"
  RECOMMEND immediate_attention = true
```

### Step 2: LLM-Based Analysis (When Needed)
```
needs_llm_analysis = check_complexity_indicators(acceptance_criteria):
  - Contains conditional logic ("if", "when", "unless")
  - Multiple sentences with different contexts  
  - Domain-specific business terminology
  - Complex user interaction flows

IF needs_llm_analysis:
  llm_issues = []
  llm_issues.extend(analyze_multiple_behaviors(acceptance_criteria))
  llm_issues.extend(assess_contextual_clarity(acceptance_criteria, domain_context))
  llm_issues.extend(evaluate_conditional_logic(acceptance_criteria))
```

### Step 3: Hybrid Results Integration
```
combined_analysis = {
  "code_issues": code_issues,           # High confidence
  "llm_issues": llm_issues,            # Contextual judgment  
  "method_breakdown": {
    "code_detected": len(code_issues),
    "llm_identified": len(llm_issues),  
    "total_issues": len(code_issues) + len(llm_issues)
  },
  "confidence_weighting": {
    "high_confidence": code_issues,      # 1.0 confidence
    "medium_confidence": [i for i in llm_issues if i.confidence >= 0.8],
    "lower_confidence": [i for i in llm_issues if i.confidence < 0.8]
  }
}
```

## Domain-Enhanced LLM Analysis

### With Domain Context Available
```
enhanced_prompt = f"""
Analyze this requirement within the {domain_name} domain:

REQUIREMENT: {acceptance_criteria}
DOMAIN_TERMINOLOGY: {domain_config.terminology}
BUSINESS_PROCESSES: {domain_config.processes}

Context-specific analysis:
- Are domain terms used correctly?
- Does the requirement align with known business processes?
- Are there domain-specific validation rules to consider?
"""
```

### Without Domain Context  
```
generic_prompt = f"""
Analyze this requirement for general clarity:

REQUIREMENT: {acceptance_criteria}

Focus on:
- Universal clarity principles
- Generic business logic patterns  
- Standard user interaction flows
"""
```

## User Choice Generation

### Choice Option Logic
```
def generate_user_choices(analysis_result):
  choices = []
  
  IF analysis_result.overall_status == "PASS":
    choices.append("PROCEED - Continue with current requirements")
    
  IF any_multiple_behaviors(analysis_result.llm_issues):
    choices.append("APPLY_SRP - Split complex requirements using Single Responsibility Principle")
    
  IF analysis_result.overall_quality_score > 6.0:
    choices.append("PREVIEW - Show potential BDD scenarios")
    
  IF any_critical_issues(analysis_result.code_issues):
    choices.append("STOP - Address critical issues before proceeding")
    
  choices.append("DETAILS - Get more specific analysis and recommendations")
  
  return choices
```

## Transparency Reporting

### Method Breakdown Display
```
## Analysis Method Breakdown

### Code-Based Detection (Confidence: 1.0)
✅ Scanned for vague terms: 3 found
✅ Checked external references: 0 found  
✅ Detected implementation details: 1 found

### LLM-Based Analysis (Confidence: 0.75-0.85)
🔍 Multiple behavior assessment: 2 behaviors detected (confidence: 0.82)
🔍 Contextual clarity review: Minor issues found (confidence: 0.78)
🔍 Conditional logic evaluation: Clear structure (confidence: 0.85)

### Combined Intelligence Results
- **Total Issues**: 6 (4 code-detected, 2 LLM-identified)
- **Reliability**: High - Critical patterns caught by deterministic code
- **Contextual**: Good - Nuanced issues identified by LLM analysis
```

This hybrid approach ensures Amazon Q provides the same reliable, transparent evaluation as Claude Code while maintaining consistent confidence levels and method transparency.