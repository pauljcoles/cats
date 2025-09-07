"""
Specification Analysis Evaluations

These evaluations check the quality of specification parsing and analysis.
Focus areas:
1. Persona extraction completeness (all required fields present)
2. Business goal clarity (measurable success criteria)
3. Specification structure integrity (required sections present)

Following Teresa Torres' approach: simple, focused on biggest failure modes.
"""

from typing import Dict, List, Any
from src.parsing.specification_parser import SpecificationData, PersonaData, BusinessGoal
from .core import EvalResult

def eval_persona_extraction_completeness(spec_data: SpecificationData) -> EvalResult:
    """
    Teresa's biggest fear applied to persona extraction: Are we missing critical persona data?
    
    This catches incomplete persona extraction that could lead to poor story generation.
    A persona without role or motivations is essentially useless for story creation.
    """
    missing_fields = []
    
    if not spec_data.personas:
        return EvalResult(
            eval_name="eval_persona_extraction_completeness",
            status="FAIL",
            message="No personas found in specification",
            details={"missing": "all_personas"}
        )
    
    for persona in spec_data.personas:
        persona_issues = []
        
        if not persona.role or persona.role.strip() == "":
            persona_issues.append("missing role")
        
        if not persona.motivations or len(persona.motivations) == 0:
            persona_issues.append("missing motivations")
            
        if not persona.context or persona.context.strip() == "":
            persona_issues.append("missing context")
            
        if persona_issues:
            missing_fields.append(f"{persona.name}: {', '.join(persona_issues)}")
    
    if missing_fields:
        return EvalResult(
            eval_name="eval_persona_extraction_completeness",
            status="FAIL", 
            message=f"Incomplete persona data found",
            details={"missing_fields": missing_fields}
        )
    
    return EvalResult(
        eval_name="eval_persona_extraction_completeness",
        status="PASS",
        message=f"All {len(spec_data.personas)} personas complete with required fields"
    )

def eval_business_goal_clarity(spec_data: SpecificationData) -> EvalResult:
    """
    Critical evaluation: Do business goals have measurable success criteria?
    
    Vague goals without success criteria lead to unmeasurable outcomes and
    poor story prioritization. This is a fundamental BA failure mode.
    """
    if not spec_data.business_goals:
        return EvalResult(
            eval_name="eval_business_goal_clarity",
            status="FAIL",
            message="No business goals found in specification",
            details={"missing": "all_business_goals"}
        )
    
    unclear_goals = []
    vague_goals = []
    
    for goal in spec_data.business_goals:
        goal_issues = []
        
        # Check for missing or empty success criteria
        if not goal.success_criteria or len(goal.success_criteria) == 0:
            goal_issues.append("no success criteria")
        else:
            # Check for vague success criteria (common failure mode)
            vague_criteria = []
            for criteria in goal.success_criteria:
                if any(vague_word in criteria.lower() for vague_word in 
                       ["better", "improved", "enhanced", "optimized", "good", "great"]):
                    vague_criteria.append(criteria)
            
            if vague_criteria:
                goal_issues.append(f"vague criteria: {vague_criteria}")
        
        # Check for measurable metrics
        if not goal.metrics or len(goal.metrics) == 0:
            goal_issues.append("no measurable metrics")
        
        if goal_issues:
            unclear_goals.append({
                "goal": goal.goal,
                "issues": goal_issues
            })
    
    if unclear_goals:
        return EvalResult(
            eval_name="eval_business_goal_clarity", 
            status="FAIL",
            message=f"{len(unclear_goals)} goals lack clarity or measurability",
            details={"unclear_goals": unclear_goals}
        )
    
    return EvalResult(
        eval_name="eval_business_goal_clarity",
        status="PASS", 
        message=f"All {len(spec_data.business_goals)} goals have clear success criteria and metrics"
    )

def eval_specification_structure(spec_data: SpecificationData) -> EvalResult:
    """
    Structural integrity check: Does the specification have all required components?
    
    Missing structural elements indicate parsing failures or incomplete specifications
    that will cause downstream problems in story generation.
    """
    structural_issues = []
    
    # Check required top-level fields
    if not spec_data.title or spec_data.title.strip() == "":
        structural_issues.append("missing title")
        
    if not spec_data.description or spec_data.description.strip() == "":
        structural_issues.append("missing description")
    
    # Check for critical sections
    if not spec_data.personas or len(spec_data.personas) == 0:
        structural_issues.append("missing personas")
        
    if not spec_data.business_goals or len(spec_data.business_goals) == 0:
        structural_issues.append("missing business goals")
    
    # User journeys are optional but recommended
    if not spec_data.user_journeys or len(spec_data.user_journeys) == 0:
        structural_issues.append("missing user journeys (recommended)")
        
    # Check for constraints and assumptions (important for story generation)
    if not spec_data.constraints or len(spec_data.constraints) == 0:
        structural_issues.append("missing constraints (may affect story scope)")
        
    if not spec_data.assumptions or len(spec_data.assumptions) == 0:
        structural_issues.append("missing assumptions (may affect story validity)")
    
    # Classify issues by severity
    critical_issues = [issue for issue in structural_issues 
                      if not issue.endswith("(recommended)") and not issue.endswith("(may affect story scope)") 
                      and not issue.endswith("(may affect story validity)")]
    
    if critical_issues:
        return EvalResult(
            eval_name="eval_specification_structure",
            status="FAIL",
            message=f"Critical structural elements missing: {critical_issues}",
            details={
                "critical_issues": critical_issues,
                "all_issues": structural_issues
            }
        )
    
    if structural_issues:
        return EvalResult(
            eval_name="eval_specification_structure", 
            status="PASS",
            message=f"Core structure valid, {len(structural_issues)} recommendations noted",
            details={"recommendations": structural_issues}
        )
    
    return EvalResult(
        eval_name="eval_specification_structure",
        status="PASS",
        message="Specification structure complete with all recommended elements"
    )