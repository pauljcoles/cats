"""
Task 3a Assessment Evaluations

These evals check the quality of behavioral assessments that decide what should/shouldn't be automated.
Focus areas:
1. Automation suitability decisions (include vs exclude reasoning)
2. Assessment criteria adherence (multi-step workflows vs single components)
3. Rationale quality (clear explanations for decisions)

Based on your assessment criteria from the task manager system.
"""

from typing import Dict, List, Any
from .core import EvalResult

def eval_automation_decisions(assessment_output: str, scenarios: str) -> EvalResult:
    """
    Check if assessment correctly identifies what should/shouldn't be automated.
    
    Based on your criteria:
    - INCLUDE: Multi-step workflows, integration tests, business process validation
    - EXCLUDE: Single component behavior, subjective UX validation, accessibility
    """
    try:
        # Parse assessment to extract include/exclude decisions
        include_decisions = extract_include_decisions(assessment_output)
        exclude_decisions = extract_exclude_decisions(assessment_output)
        
        # Check for red flags in INCLUDE decisions
        single_component_flags = [
            "button click", "field validation", "dropdown selection",
            "form validation", "input validation", "single field"
        ]
        
        for decision in include_decisions:
            for flag in single_component_flags:
                if flag.lower() in decision.lower():
                    return EvalResult(
                        eval_name="eval_automation_decisions",
                        status="FAIL",
                        message=f"Incorrectly included single component behavior: '{flag}'",
                        details={"problematic_decision": decision}
                    )
        
        # Check for red flags in EXCLUDE decisions  
        integration_flags = [
            "end-to-end", "full workflow", "complete process", 
            "integration", "cross-system", "multi-step"
        ]
        
        for decision in exclude_decisions:
            for flag in integration_flags:
                if flag.lower() in decision.lower():
                    return EvalResult(
                        eval_name="eval_automation_decisions",
                        status="FAIL", 
                        message=f"Incorrectly excluded integration test: '{flag}'",
                        details={"problematic_decision": decision}
                    )
        
        return EvalResult(
            eval_name="eval_automation_decisions",
            status="PASS",
            message="Assessment decisions align with automation criteria"
        )
        
    except Exception as e:
        return EvalResult(
            eval_name="eval_automation_decisions",
            status="FAIL",
            message=f"Eval crashed: {str(e)}"
        )

def eval_assessment_criteria_adherence(assessment_output: str) -> EvalResult:
    """
    Check that assessment uses the documented criteria consistently.
    
    Your criteria:
    - Multi-step workflows → Include
    - Single component behavior → Exclude  
    - Subjective UX validation → Exclude
    - Integration tests → Include
    - Business process validation → Include
    """
    criteria_keywords = {
        "include_signals": [
            "multi-step", "workflow", "integration", "end-to-end",
            "business process", "cross-system", "complete flow"
        ],
        "exclude_signals": [
            "single component", "subjective", "ux validation", 
            "accessibility", "visual design", "layout"
        ]
    }
    
    # Check that rationale mentions appropriate criteria
    has_valid_rationale = False
    
    for keyword in criteria_keywords["include_signals"] + criteria_keywords["exclude_signals"]:
        if keyword.lower() in assessment_output.lower():
            has_valid_rationale = True
            break
    
    if not has_valid_rationale:
        return EvalResult(
            eval_name="eval_assessment_criteria_adherence",
            status="FAIL",
            message="Assessment lacks clear rationale based on documented criteria"
        )
    
    return EvalResult(
        eval_name="eval_assessment_criteria_adherence", 
        status="PASS",
        message="Assessment adheres to documented criteria"
    )

def eval_rationale_quality(assessment_output: str) -> EvalResult:
    """
    Check that assessment provides clear rationale for include/exclude decisions.
    
    Good rationale should explain WHY something is suitable/unsuitable for automation.
    """
    # Look for rationale indicators
    rationale_patterns = [
        "because", "since", "due to", "as", "given that",
        "this ensures", "this allows", "this prevents",
        "rationale:", "reason:", "justification:"
    ]
    
    has_rationale = any(pattern.lower() in assessment_output.lower() 
                       for pattern in rationale_patterns)
    
    if not has_rationale:
        return EvalResult(
            eval_name="eval_rationale_quality",
            status="FAIL", 
            message="Assessment lacks clear rationale for decisions"
        )
    
    # Check for weak rationale 
    weak_rationale = [
        "it's good", "it's bad", "it's fine", "it works",
        "seems ok", "looks good", "appropriate", "suitable"
    ]
    
    for weak in weak_rationale:
        if weak.lower() in assessment_output.lower():
            return EvalResult(
                eval_name="eval_rationale_quality",
                status="FAIL",
                message=f"Weak rationale detected: '{weak}' - needs specific reasoning"
            )
    
    return EvalResult(
        eval_name="eval_rationale_quality",
        status="PASS", 
        message="Assessment provides clear, specific rationale"
    )

def eval_alternative_approaches(assessment_output: str) -> EvalResult:
    """
    Check that excluded items have alternative testing approaches suggested.
    
    From your system: excluded scenarios should get alternative approaches
    (manual testing, specialized tools, etc.)
    """
    exclude_indicators = ["exclude", "not automated", "manual", "skip automation"]
    alternative_indicators = ["alternative", "manual testing", "specialized tool", "different approach"]
    
    has_exclusions = any(indicator.lower() in assessment_output.lower() 
                        for indicator in exclude_indicators)
    
    if has_exclusions:
        has_alternatives = any(indicator.lower() in assessment_output.lower()
                              for indicator in alternative_indicators)
        
        if not has_alternatives:
            return EvalResult(
                eval_name="eval_alternative_approaches",
                status="FAIL",
                message="Excluded items lack alternative testing approaches"
            )
    
    return EvalResult(
        eval_name="eval_alternative_approaches", 
        status="PASS",
        message="Assessment provides alternatives for excluded items"
    )

# Helper functions

def extract_include_decisions(assessment_output: str) -> List[str]:
    """Extract scenarios marked for automation inclusion."""
    import re
    
    # Look for inclusion patterns
    patterns = [
        r'include[^\.]*\.([^\.]+)',
        r'automate[^\.]*\.([^\.]+)', 
        r'approved[^\.]*\.([^\.]+)'
    ]
    
    decisions = []
    for pattern in patterns:
        matches = re.findall(pattern, assessment_output, re.IGNORECASE | re.DOTALL)
        decisions.extend(matches)
    
    return decisions

def extract_exclude_decisions(assessment_output: str) -> List[str]:
    """Extract scenarios marked for exclusion from automation.""" 
    import re
    
    # Look for exclusion patterns
    patterns = [
        r'exclude[^\.]*\.([^\.]+)',
        r'manual[^\.]*\.([^\.]+)',
        r'not automat[^\.]*\.([^\.]+)'
    ]
    
    decisions = []
    for pattern in patterns:
        matches = re.findall(pattern, assessment_output, re.IGNORECASE | re.DOTALL)
        decisions.extend(matches)
    
    return decisions