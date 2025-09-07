"""
Story Generation Evaluations

These evaluations check the quality of user stories generated from specifications.
Focus areas:
1. INVEST compliance threshold validation (leveraging existing invest_score)
2. Story traceability to personas and business goals
3. Acceptance criteria quality assessment

Following Teresa Torres' approach: leverage existing quality metrics, focus on critical failure modes.
"""

from typing import Dict, List, Any
from src.generation.story_generator import UserStory, AcceptanceCriterion
from src.parsing.specification_parser import SpecificationData
from .core import EvalResult

def eval_invest_compliance_threshold(stories: List[UserStory]) -> EvalResult:
    """
    Teresa's biggest fear for story quality: Do stories meet INVEST criteria threshold?
    
    Leverages existing invest_score calculation from StoryGenerator rather than reimplementing.
    Stories below 0.8 threshold indicate fundamental quality issues that will cause
    development problems and stakeholder confusion.
    """
    if not stories:
        return EvalResult(
            eval_name="eval_invest_compliance_threshold",
            status="FAIL",
            message="No stories provided for evaluation",
            details={"error": "empty_story_list"}
        )
    
    # Use existing invest_score calculation from StoryGenerator
    failing_stories = [s for s in stories if s.invest_score < 0.8]
    
    if failing_stories:
        # Provide detailed breakdown for failing stories
        details = {
            "failing_stories": {story.story_id: {
                "invest_score": story.invest_score,
                "title": story.title,
                "quality_issues": story.quality_notes
            } for story in failing_stories},
            "threshold": 0.8,
            "total_stories": len(stories),
            "failing_count": len(failing_stories)
        }
        
        return EvalResult(
            eval_name="eval_invest_compliance_threshold",
            status="FAIL",
            message=f"{len(failing_stories)}/{len(stories)} stories below 0.8 INVEST threshold",
            details=details
        )
    
    # Calculate quality distribution for successful result
    high_quality = len([s for s in stories if s.invest_score >= 0.9])
    average_score = sum(s.invest_score for s in stories) / len(stories)
    
    return EvalResult(
        eval_name="eval_invest_compliance_threshold",
        status="PASS",
        message=f"All {len(stories)} stories meet 0.8+ INVEST threshold (avg: {average_score:.2f})",
        details={
            "total_stories": len(stories),
            "high_quality_count": high_quality,
            "average_score": average_score
        }
    )

def eval_story_traceability(stories: List[UserStory], spec_data: SpecificationData) -> EvalResult:
    """
    Critical BA failure mode: Are stories properly traced to specification personas?
    
    Stories without clear persona mapping indicate requirements disconnect and
    will lead to development that doesn't serve actual users.
    """
    if not stories:
        return EvalResult(
            eval_name="eval_story_traceability",
            status="FAIL", 
            message="No stories provided for traceability check"
        )
    
    if not spec_data.personas:
        return EvalResult(
            eval_name="eval_story_traceability",
            status="FAIL",
            message="No personas in specification for traceability mapping"
        )
    
    # Extract persona names (case-insensitive matching)
    persona_names = [p.name.lower().strip() for p in spec_data.personas]
    
    # Check story persona mapping
    untraced_stories = []
    traced_stories = []
    
    for story in stories:
        story_persona = story.persona.lower().strip()
        
        # Try exact match first
        if story_persona in persona_names:
            traced_stories.append(story.story_id)
        else:
            # Try partial matching for common variations
            found_match = False
            for persona_name in persona_names:
                # Check if story persona contains or is contained by spec persona
                if story_persona in persona_name or persona_name in story_persona:
                    traced_stories.append(story.story_id) 
                    found_match = True
                    break
            
            if not found_match:
                untraced_stories.append({
                    "story_id": story.story_id,
                    "story_persona": story.persona,
                    "title": story.title
                })
    
    if untraced_stories:
        return EvalResult(
            eval_name="eval_story_traceability",
            status="FAIL",
            message=f"{len(untraced_stories)}/{len(stories)} stories not mapped to specification personas",
            details={
                "untraced_stories": untraced_stories,
                "available_personas": [p.name for p in spec_data.personas],
                "traced_count": len(traced_stories),
                "total_stories": len(stories)
            }
        )
    
    return EvalResult(
        eval_name="eval_story_traceability",
        status="PASS",
        message=f"All {len(stories)} stories properly traced to specification personas",
        details={
            "traced_stories": len(stories),
            "available_personas": [p.name for p in spec_data.personas]
        }
    )

def eval_acceptance_criteria_quality(stories: List[UserStory]) -> EvalResult:
    """
    Quality gate for acceptance criteria: Are they properly structured and testable?
    
    Poor acceptance criteria lead to ambiguous requirements and untestable stories.
    Focuses on Given-When-Then structure and testable outcomes.
    """
    if not stories:
        return EvalResult(
            eval_name="eval_acceptance_criteria_quality",
            status="FAIL",
            message="No stories provided for acceptance criteria evaluation"
        )
    
    quality_issues = []
    total_criteria = 0
    
    for story in stories:
        if not story.acceptance_criteria or len(story.acceptance_criteria) == 0:
            quality_issues.append({
                "story_id": story.story_id,
                "issue": "no_acceptance_criteria",
                "title": story.title
            })
            continue
        
        # Evaluate each acceptance criterion
        for i, criterion in enumerate(story.acceptance_criteria):
            total_criteria += 1
            
            # Check for proper Given-When-Then structure
            if not criterion.given or not criterion.given.strip():
                quality_issues.append({
                    "story_id": story.story_id,
                    "criterion_index": i,
                    "issue": "missing_given_clause",
                    "criterion": f"Given: '{criterion.given}'"
                })
            
            if not criterion.when or not criterion.when.strip():
                quality_issues.append({
                    "story_id": story.story_id,
                    "criterion_index": i, 
                    "issue": "missing_when_clause",
                    "criterion": f"When: '{criterion.when}'"
                })
                
            if not criterion.then or not criterion.then.strip():
                quality_issues.append({
                    "story_id": story.story_id,
                    "criterion_index": i,
                    "issue": "missing_then_clause", 
                    "criterion": f"Then: '{criterion.then}'"
                })
            
            # Check for vague or untestable outcomes
            if criterion.then:
                vague_indicators = ["better", "improved", "enhanced", "good", "bad", "nice", "properly"]
                if any(vague in criterion.then.lower() for vague in vague_indicators):
                    quality_issues.append({
                        "story_id": story.story_id,
                        "criterion_index": i,
                        "issue": "vague_then_clause",
                        "criterion": criterion.then
                    })
    
    if quality_issues:
        # Categorize issues by severity
        critical_issues = [issue for issue in quality_issues 
                          if issue["issue"] in ["no_acceptance_criteria", "missing_then_clause"]]
        
        return EvalResult(
            eval_name="eval_acceptance_criteria_quality",
            status="FAIL",
            message=f"{len(quality_issues)} acceptance criteria quality issues found",
            details={
                "total_issues": len(quality_issues),
                "critical_issues": len(critical_issues),
                "issues": quality_issues,
                "total_criteria": total_criteria,
                "total_stories": len(stories)
            }
        )
    
    return EvalResult(
        eval_name="eval_acceptance_criteria_quality",
        status="PASS",
        message=f"All {total_criteria} acceptance criteria across {len(stories)} stories meet quality standards",
        details={
            "total_criteria": total_criteria,
            "total_stories": len(stories)
        }
    )