"""
Business Analyst Workflow Evaluations

These evaluations validate the complete specification-to-story pipeline.
Focus areas:
1. End-to-end workflow validation (specification analysis + story generation)
2. Domain context consistency across the pipeline
3. Quality feedback loop assessment and recommendations

Following Teresa Torres' approach: orchestrate component evaluations into meaningful workflow assessment.
"""

from typing import Dict, List, Any, Optional
from src.parsing.specification_parser import SpecificationData
from src.generation.story_generator import UserStory
from .spec_analysis_evals import eval_persona_extraction_completeness, eval_business_goal_clarity, eval_specification_structure
from .story_generation_evals import eval_invest_compliance_threshold, eval_story_traceability, eval_acceptance_criteria_quality
from .core import EvalResult

def eval_specification_to_story_flow(spec_data: SpecificationData, stories: List[UserStory]) -> EvalResult:
    """
    Complete BA workflow validation: Does the specification-to-story pipeline produce quality output?
    
    This is Teresa's "integration test" - individual components might pass but the
    end-to-end flow could still fail. Critical for BA workflow validation.
    """
    if not spec_data or not stories:
        return EvalResult(
            eval_name="eval_specification_to_story_flow",
            status="FAIL",
            message="Missing required inputs for workflow evaluation",
            details={
                "has_spec_data": spec_data is not None,
                "has_stories": stories is not None,
                "story_count": len(stories) if stories else 0
            }
        )
    
    # Run all component evaluations
    evaluation_results = {}
    
    # Specification analysis evaluations
    persona_result = eval_persona_extraction_completeness(spec_data)
    goal_result = eval_business_goal_clarity(spec_data)
    structure_result = eval_specification_structure(spec_data)
    
    # Story generation evaluations
    invest_result = eval_invest_compliance_threshold(stories)
    trace_result = eval_story_traceability(stories, spec_data)
    criteria_result = eval_acceptance_criteria_quality(stories)
    
    # Collect results
    evaluation_results = {
        "persona_extraction": persona_result,
        "goal_clarity": goal_result,
        "specification_structure": structure_result,
        "invest_compliance": invest_result,
        "story_traceability": trace_result,
        "acceptance_criteria": criteria_result
    }
    
    # Identify failed checks
    failed_checks = []
    critical_failures = []
    
    for eval_name, result in evaluation_results.items():
        if result.failed:
            failed_checks.append(eval_name)
            
            # Classify critical vs non-critical failures
            if eval_name in ["persona_extraction", "invest_compliance", "story_traceability"]:
                critical_failures.append(eval_name)
    
    # Calculate workflow quality score
    total_evaluations = len(evaluation_results)
    passed_evaluations = total_evaluations - len(failed_checks)
    quality_score = passed_evaluations / total_evaluations
    
    # Determine overall status
    if critical_failures:
        status = "FAIL"
        message = f"Critical BA workflow failures: {critical_failures} ({len(failed_checks)}/{total_evaluations} checks failed)"
    elif failed_checks:
        status = "FAIL" 
        message = f"BA workflow quality issues: {failed_checks} ({len(failed_checks)}/{total_evaluations} checks failed)"
    else:
        status = "PASS"
        message = f"Complete BA workflow validated successfully ({total_evaluations}/{total_evaluations} checks passed)"
    
    return EvalResult(
        eval_name="eval_specification_to_story_flow",
        status=status,
        message=message,
        details={
            "evaluation_results": {name: {"status": result.status, "message": result.message} 
                                 for name, result in evaluation_results.items()},
            "failed_checks": failed_checks,
            "critical_failures": critical_failures,
            "quality_score": quality_score,
            "total_evaluations": total_evaluations,
            "spec_id": spec_data.spec_id,
            "story_count": len(stories)
        }
    )

def eval_domain_context_consistency(spec_data: SpecificationData, stories: List[UserStory], domain: Optional[str] = None) -> EvalResult:
    """
    Domain consistency validation: Are domain-specific terms and contexts maintained throughout?
    
    Critical for multi-domain BA work - ensures Mercedes stories don't contain BMW terminology
    and vice versa. Prevents context contamination across domains.
    """
    if not spec_data or not stories:
        return EvalResult(
            eval_name="eval_domain_context_consistency",
            status="FAIL",
            message="Missing required inputs for domain consistency evaluation"
        )
    
    consistency_issues = []
    domain_terminology = {}
    
    # Define domain-specific terminology patterns
    if domain:
        domain_patterns = {
            "mercedes": {
                "expected_terms": ["amg", "maybach", "mercedes", "s-class", "e-class", "c-class"],
                "forbidden_terms": ["bmw", "m sport", "x-drive", "ultimate driving"],
                "brand_context": "luxury and comfort"
            },
            "bmw": {
                "expected_terms": ["bmw", "m sport", "x-drive", "ultimate driving", "series"],
                "forbidden_terms": ["mercedes", "amg", "maybach"],
                "brand_context": "performance and driving dynamics"
            },
            "renault": {
                "expected_terms": ["renault", "electric", "ev", "alpine", "rs"],
                "forbidden_terms": ["bmw", "mercedes", "amg"],
                "brand_context": "electric and innovation"
            }
        }
        
        if domain.lower() in domain_patterns:
            domain_terminology = domain_patterns[domain.lower()]
    
    if domain_terminology:
        # Check for forbidden terms in stories
        forbidden_terms = domain_terminology.get("forbidden_terms", [])
        
        for story in stories:
            story_text = f"{story.title} {story.description} {story.persona}".lower()
            
            for forbidden_term in forbidden_terms:
                if forbidden_term in story_text:
                    consistency_issues.append({
                        "story_id": story.story_id,
                        "issue_type": "forbidden_terminology", 
                        "forbidden_term": forbidden_term,
                        "context": f"Found in story: {story.title}"
                    })
    
    # Check persona consistency between spec and stories
    spec_personas = set(p.name.lower() for p in spec_data.personas)
    story_personas = set(s.persona.lower() for s in stories)
    
    # Allow for reasonable variations but flag major inconsistencies
    unmatched_personas = []
    for story_persona in story_personas:
        found_match = False
        for spec_persona in spec_personas:
            # Flexible matching for reasonable variations
            if (story_persona in spec_persona or spec_persona in story_persona or
                any(word in spec_persona for word in story_persona.split())):
                found_match = True
                break
        
        if not found_match:
            unmatched_personas.append(story_persona)
    
    if unmatched_personas:
        consistency_issues.append({
            "issue_type": "persona_inconsistency",
            "unmatched_personas": unmatched_personas,
            "spec_personas": list(spec_personas)
        })
    
    # Evaluate results
    if consistency_issues:
        critical_issues = [issue for issue in consistency_issues 
                          if issue["issue_type"] in ["forbidden_terminology", "persona_inconsistency"]]
        
        return EvalResult(
            eval_name="eval_domain_context_consistency",
            status="FAIL",
            message=f"{len(consistency_issues)} domain consistency issues found",
            details={
                "consistency_issues": consistency_issues,
                "critical_issues": len(critical_issues),
                "domain": domain,
                "story_count": len(stories)
            }
        )
    
    return EvalResult(
        eval_name="eval_domain_context_consistency",
        status="PASS",
        message=f"Domain context consistent across {len(stories)} stories" + (f" for {domain} domain" if domain else ""),
        details={
            "domain": domain,
            "story_count": len(stories),
            "spec_personas": len(spec_data.personas)
        }
    )

def eval_quality_feedback_loops(spec_data: SpecificationData, stories: List[UserStory]) -> EvalResult:
    """
    Quality feedback assessment: Does the system provide actionable improvement recommendations?
    
    Meta-evaluation that assesses whether the BA workflow generates useful quality feedback
    that can drive continuous improvement. Critical for iterative BA processes.
    """
    if not spec_data or not stories:
        return EvalResult(
            eval_name="eval_quality_feedback_loops",
            status="FAIL",
            message="Missing required inputs for quality feedback assessment"
        )
    
    feedback_quality = {
        "actionable_recommendations": [],
        "quality_metrics": {},
        "improvement_areas": []
    }
    
    # Analyze story quality notes for actionable feedback
    total_quality_notes = 0
    actionable_notes = 0
    
    for story in stories:
        if story.quality_notes:
            total_quality_notes += len(story.quality_notes)
            
            for note in story.quality_notes:
                # Check if note provides actionable guidance
                actionable_indicators = [
                    "consider", "discuss", "clarify", "define", "specify", 
                    "add", "remove", "update", "improve", "validate"
                ]
                
                if any(indicator in note.lower() for indicator in actionable_indicators):
                    actionable_notes += 1
                    feedback_quality["actionable_recommendations"].append({
                        "story_id": story.story_id,
                        "recommendation": note,
                        "invest_score": story.invest_score
                    })
    
    # Calculate quality metrics distribution
    invest_scores = [s.invest_score for s in stories]
    if invest_scores:
        feedback_quality["quality_metrics"] = {
            "average_invest_score": sum(invest_scores) / len(invest_scores),
            "min_invest_score": min(invest_scores),
            "max_invest_score": max(invest_scores),
            "stories_below_08": len([s for s in invest_scores if s < 0.8]),
            "stories_above_09": len([s for s in invest_scores if s > 0.9])
        }
    
    # Identify improvement areas based on specification analysis
    spec_issues = []
    
    if not spec_data.personas or len(spec_data.personas) < 2:
        spec_issues.append("Consider adding more diverse personas for broader story coverage")
    
    if not spec_data.business_goals or any(not goal.success_criteria for goal in spec_data.business_goals):
        spec_issues.append("Business goals need measurable success criteria for better story prioritization")
        
    if not spec_data.constraints:
        spec_issues.append("Add constraints to help scope story development appropriately")
    
    feedback_quality["improvement_areas"] = spec_issues
    
    # Evaluate feedback loop quality
    feedback_score = 0
    total_possible_score = 3
    
    # Score actionable recommendations (0-1)
    if total_quality_notes > 0:
        actionable_ratio = actionable_notes / total_quality_notes
        feedback_score += min(actionable_ratio, 1.0)
    
    # Score quality metrics availability (0-1)
    if feedback_quality["quality_metrics"]:
        feedback_score += 1.0
        
    # Score improvement area identification (0-1)
    if feedback_quality["improvement_areas"]:
        feedback_score += 1.0
    
    final_score = feedback_score / total_possible_score
    
    if final_score < 0.6:
        status = "FAIL"
        message = f"Quality feedback loops insufficient (score: {final_score:.2f})"
    else:
        status = "PASS"  
        message = f"Quality feedback loops functional (score: {final_score:.2f})"
    
    return EvalResult(
        eval_name="eval_quality_feedback_loops",
        status=status,
        message=message,
        details={
            "feedback_quality": feedback_quality,
            "feedback_score": final_score,
            "total_quality_notes": total_quality_notes,
            "actionable_notes": actionable_notes,
            "story_count": len(stories)
        }
    )