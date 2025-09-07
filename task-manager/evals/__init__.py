# Task Manager Evals
# 
# This module provides evaluation functions for testing AI-generated outputs
# across the 4-task workflow: validation, BDD generation, assessment, automation
#
# Inspired by Teresa Torres' eval approach - start simple, focus on biggest fears

from .core import EvalResult, run_eval
from .task2_bdd_evals import eval_no_requirement_invention, eval_implementation_contamination
from .task3a_assessment_evals import eval_automation_decisions
from .cross_task_evals import eval_p0_preservation, eval_traceability
from .spec_analysis_evals import eval_persona_extraction_completeness, eval_business_goal_clarity, eval_specification_structure
from .story_generation_evals import eval_invest_compliance_threshold, eval_story_traceability, eval_acceptance_criteria_quality
from .ba_workflow_evals import eval_specification_to_story_flow, eval_domain_context_consistency, eval_quality_feedback_loops

__all__ = [
    'EvalResult',
    'run_eval', 
    'eval_no_requirement_invention',
    'eval_implementation_contamination',
    'eval_automation_decisions',
    'eval_p0_preservation',
    'eval_traceability',
    'eval_persona_extraction_completeness',
    'eval_business_goal_clarity',
    'eval_specification_structure',
    'eval_invest_compliance_threshold',
    'eval_story_traceability',
    'eval_acceptance_criteria_quality',
    'eval_specification_to_story_flow',
    'eval_domain_context_consistency',
    'eval_quality_feedback_loops'
]