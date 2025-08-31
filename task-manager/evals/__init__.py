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

__all__ = [
    'EvalResult',
    'run_eval', 
    'eval_no_requirement_invention',
    'eval_implementation_contamination',
    'eval_automation_decisions',
    'eval_p0_preservation',
    'eval_traceability'
]