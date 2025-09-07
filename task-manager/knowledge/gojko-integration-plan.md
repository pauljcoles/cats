# Implementation Plan: Gojko Adzic Patterns → LLM Analysis Integration

## Overview
Integrate insights from "50 Quick Ideas to Improve User Stories" into the hybrid requirement validation system, specifically enhancing the LLM analysis components with proven user story quality patterns.

## Phase 1: Enhanced LLM Trigger Logic

### Current State
```python
def _needs_llm_judgment(self, ac_text: str) -> bool:
    # Basic triggers for LLM analysis
    has_context_dependent = any(term in ac_text.lower() for term in self.context_dependent_terms)
    has_table_structure = "||" in ac_text or ac_text.count("|") > 2
    has_complex_conditionals = any(word in ac_text.lower() for word in ["if", "when", "unless"])
    return has_context_dependent or has_table_structure or has_complex_conditionals
```

### Enhanced Implementation
```python
def _needs_llm_judgment(self, ac_text: str, gojko_patterns: dict) -> bool:
    """Enhanced trigger logic using Gojko Adzic's user story principles"""
    
    # Load Gojko patterns
    triggers = gojko_patterns["llm_trigger_patterns"]
    
    # 1. Context-dependent terms (enhanced with Gojko insights)
    context_terms = triggers["context_dependent_terms"]["patterns"]
    has_context_dependent = any(term in ac_text.lower() for term in context_terms)
    
    # 2. Behavior change violations (new Gojko-based trigger)
    compound_behaviors = any(pattern in ac_text.lower() for pattern in 
                           ["and also", "and then", "as well as", "in addition to"])
    
    # 3. Subjective quality indicators (Gojko principle: measurable outcomes)
    subjective_quality = any(term in ac_text.lower() for term in 
                           ["good", "clear", "intuitive", "user-friendly", "easy"])
    
    # 4. Complex conditionals (existing + Gojko enhancements)
    conditional_words = triggers["complex_conditionals"]["patterns"]
    has_complex_conditionals = any(word in ac_text.lower() for word in conditional_words)
    
    # 5. Technical story indicators (Gojko: avoid technical stories)
    technical_indicators = ["database", "API", "service", "component", "system"]
    has_technical_focus = any(term in ac_text.lower() for term in technical_indicators)
    
    return (has_context_dependent or compound_behaviors or subjective_quality or 
            has_complex_conditionals or has_technical_focus)
```

## Phase 2: Enhanced Multiple Behaviors Analysis

### Current LLM Prompt Enhancement
```python
def llm_check_multiple_behaviors(self, ac_id: str, ac_text: str, gojko_patterns: dict) -> Optional[LanguageIssue]:
    """Enhanced multiple behaviors check using Gojko's principles"""
    
    principles = gojko_patterns["multiple_behaviors_analysis"]["gojko_principles"]
    detection = gojko_patterns["multiple_behaviors_analysis"]["detection_patterns"]
    
    enhanced_prompt = f"""
Analyze this acceptance criterion using Gojko Adzic's user story principles:

ACCEPTANCE CRITERION: "{ac_text}"

GOJKO'S PRINCIPLES TO APPLY:
1. {principles["behavior_change_focus"]}
2. {principles["independent_value"]}
3. {principles["avoid_technical_stories"]}

SPECIFIC ANALYSIS:
1. Does this describe ONE specific behavior change or multiple?
2. Are there compound conjunctions indicating multiple behaviors?
   - Look for: {', '.join(detection["compound_conjunctions"]["indicators"])}
3. Are there multiple Then outcomes that should be tested separately?
4. Would splitting this improve independent testability?

DETECTION PATTERNS TO CHECK:
- Compound conjunctions (confidence: {detection["compound_conjunctions"]["confidence"]})
- Sequential then clauses (confidence: {detection["sequential_then_clauses"]["confidence"]})
- Different validation types (confidence: {detection["different_validation_types"]["confidence"]})

Respond with JSON including:
- Gojko principle applied
- Specific pattern detected
- Confidence level based on pattern strength
- Suggested split following "behavior change" principle
"""
```

## Phase 3: Enhanced Contextual Vagueness Analysis

### Implementation
```python
def llm_check_contextual_vagueness(self, ac_id: str, ac_text: str, gojko_patterns: dict) -> List[LanguageIssue]:
    """Enhanced vagueness check using Gojko's measurable outcomes principle"""
    
    vagueness = gojko_patterns["contextual_vagueness_analysis"]
    categories = vagueness["vagueness_categories"]
    
    enhanced_prompt = f"""
Analyze vague terms using Gojko Adzic's "measurable outcomes" principle:

TEXT: "{ac_text}"

GOJKO'S PRINCIPLE: {vagueness["gojko_principles"]["measurable_outcomes"]}

VAGUENESS CATEGORIES TO CHECK:
1. Subjective Quality: {categories["subjective_quality"]["terms"]}
   - Analysis: {categories["subjective_quality"]["analysis"]}
   
2. Implementation Assumptions: {categories["implementation_assumptions"]["terms"]}
   - Analysis: {categories["implementation_assumptions"]["analysis"]}
   
3. Performance Vagueness: {categories["performance_vagueness"]["terms"]}
   - Analysis: {categories["performance_vagueness"]["analysis"]}
   
4. UX Vagueness: {categories["user_experience_vagueness"]["terms"]}
   - Analysis: {categories["user_experience_vagueness"]["analysis"]}

For each vague term found:
1. Apply Gojko's "testable experiment" principle
2. Assess if term has objective measurement criteria
3. Consider domain-specific context
4. Suggest specific, measurable alternatives

Return confidence levels based on vagueness category strength.
"""
```

## Phase 4: Enhanced Complex Conditionals Analysis

### Implementation
```python
def llm_check_complex_conditionals(self, ac_id: str, ac_text: str, gojko_patterns: dict) -> Optional[LanguageIssue]:
    """Enhanced conditional analysis using Gojko's 'survivable experiments' principle"""
    
    conditionals = gojko_patterns["complex_conditionals_analysis"]
    principles = conditionals["gojko_principles"]
    
    enhanced_prompt = f"""
Analyze conditional logic using Gojko Adzic's "survivable experiments" principle:

TEXT: "{ac_text}"

GOJKO'S PRINCIPLES:
1. {principles["survivable_experiments"]}
2. {principles["clear_outcomes"]}
3. {principles["avoid_generic_conditions"]}

COMPLEXITY INDICATORS TO CHECK:
1. Nested Conditions: Can each condition be tested independently?
2. Vague Triggers: Are conditional triggers objectively determinable?
3. Multiple Outcomes: Are all outcome paths clearly defined?
4. Business Rule References: Are referenced rules explicitly defined?

TESTABILITY ASSESSMENT:
- Can QA determine when each condition is met?
- Can expected behaviors be objectively verified?
- Are boundary conditions clearly defined?

Apply confidence levels based on complexity indicator strength.
Return specific suggestions for making conditions "survivable experiments."
"""
```

## Phase 5: Integration Points

### 1. Load Gojko Patterns
```python
def load_gojko_patterns(self) -> dict:
    """Load Gojko Adzic patterns from JSON"""
    pattern_file = "/home/pauljcoles/code/cats/task-manager/knowledge/gojko-adzic-patterns.json"
    with open(pattern_file, 'r') as f:
        return json.load(f)
```

### 2. Enhanced Confidence Weighting
```python
def calculate_llm_confidence(self, issue_type: str, pattern_strength: str, gojko_patterns: dict) -> float:
    """Calculate confidence using Gojko-based weighting"""
    
    weighting = gojko_patterns["confidence_weighting"]
    
    if pattern_strength in ["clear_violation", "obvious_compound", "subjective_without_criteria"]:
        return random.uniform(0.82, 0.87)  # High confidence
    elif pattern_strength in ["context_dependent", "complex_but_defined", "sequential_workflow"]:
        return random.uniform(0.75, 0.82)  # Medium confidence
    else:
        return 0.75  # Default LLM confidence
```

### 3. Transparency Reporting Enhancement
```python
def generate_gojko_transparency_report(self, issues: List[LanguageIssue], gojko_patterns: dict) -> str:
    """Generate transparency report showing Gojko principles applied"""
    
    report = "## Gojko Adzic Principle Analysis\n\n"
    
    for issue in issues:
        if issue.eval_method == EvalMethod.LLM_BASED:
            report += f"### {issue.ac_id}: {issue.failure_type.value}\n"
            report += f"**Gojko Principle Applied**: {get_applied_principle(issue)}\n"
            report += f"**Pattern Detected**: {issue.detected_pattern}\n"
            report += f"**Confidence**: {issue.confidence} (based on pattern strength)\n"
            report += f"**Improvement Strategy**: {get_gojko_strategy(issue)}\n\n"
    
    return report
```

## Phase 6: Testing and Validation

### Test Cases
1. **Multiple Behaviors**: "User selects color and system validates selection and updates price"
2. **Contextual Vagueness**: "System provides appropriate feedback to user"
3. **Complex Conditionals**: "When user selects premium package, if budget allows, then upgrade features"

### Expected Outcomes
- Higher confidence levels for clear Gojko principle violations
- More specific improvement suggestions based on user story best practices
- Better splitting recommendations following "behavior change" principle
- Enhanced transparency showing which principles were applied

## Implementation Timeline
1. **Week 1**: Implement enhanced trigger logic and load Gojko patterns
2. **Week 2**: Enhance LLM prompt construction with Gojko principles
3. **Week 3**: Implement confidence weighting and transparency reporting
4. **Week 4**: Testing, validation, and integration with existing system

This plan transforms the LLM analysis from generic pattern matching to principled user story evaluation based on proven industry practices.
