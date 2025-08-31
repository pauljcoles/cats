"""
Cross-Task Evaluations

These evals check consistency and quality across the entire 4-task workflow.
Focus areas:
1. P0 requirement preservation (never lose core requirements)
2. Traceability (every output maps back to original ticket)
3. Priority classification consistency

These are the "system-level" evals that catch issues spanning multiple tasks.
"""

from typing import Dict, List, Any
from .core import EvalResult, extract_ticket_requirements

def eval_p0_preservation(original_ticket: str, final_output: str, task_name: str) -> EvalResult:
    """
    CRITICAL: Ensure P0 requirements (from ticket ACs) are never lost.
    
    This is your most important rule: "AI NEVER removes, eliminates, or skips requirements."
    P0 requirements must be preserved through all task transformations.
    """
    try:
        # Extract P0 requirements from ticket acceptance criteria
        p0_requirements = extract_p0_requirements(original_ticket)
        
        if not p0_requirements:
            return EvalResult(
                eval_name="eval_p0_preservation",
                status="PASS",
                message="No P0 requirements found in ticket (may need manual review)"
            )
        
        # Check that each P0 requirement is represented in final output
        missing_requirements = []
        
        for requirement in p0_requirements:
            # Look for semantic presence of requirement in output
            if not requirement_present_in_output(requirement, final_output):
                missing_requirements.append(requirement)
        
        if missing_requirements:
            return EvalResult(
                eval_name="eval_p0_preservation", 
                status="FAIL",
                message=f"P0 requirements missing from {task_name}: {missing_requirements}",
                details={"missing_p0_requirements": missing_requirements}
            )
        
        return EvalResult(
            eval_name="eval_p0_preservation",
            status="PASS",
            message="All P0 requirements preserved"
        )
        
    except Exception as e:
        return EvalResult(
            eval_name="eval_p0_preservation",
            status="FAIL",
            message=f"Eval crashed: {str(e)}"
        )

def eval_traceability(task_output: str, original_ticket: str) -> EvalResult:
    """
    Check that every significant element in task output maps back to the original ticket.
    
    This prevents the AI from adding creative elements not requested.
    """
    try:
        # Extract significant elements from task output
        output_elements = extract_significant_elements(task_output)
        
        # Check traceability to original ticket
        untraced_elements = []
        
        for element in output_elements:
            if not element_traces_to_ticket(element, original_ticket):
                untraced_elements.append(element)
        
        # Allow some reasonable inference but flag clear inventions
        if len(untraced_elements) > len(output_elements) * 0.3:  # More than 30% untraced
            return EvalResult(
                eval_name="eval_traceability",
                status="FAIL", 
                message=f"Too many elements lack traceability: {untraced_elements}",
                details={"untraced_elements": untraced_elements}
            )
        
        return EvalResult(
            eval_name="eval_traceability",
            status="PASS",
            message="Task output properly traceable to ticket"
        )
        
    except Exception as e:
        return EvalResult(
            eval_name="eval_traceability",
            status="FAIL",
            message=f"Eval crashed: {str(e)}"
        )

def eval_priority_consistency(validation_output: str, bdd_output: str) -> EvalResult:
    """
    Check that priority classifications remain consistent across tasks.
    
    Task 1 classifies requirements as P0-P4.
    Task 2 should respect these priorities in scenario generation.
    """
    try:
        # Extract priority classifications from validation
        validation_priorities = extract_priorities(validation_output)
        
        # Check that BDD scenarios respect these priorities
        bdd_scenarios = extract_scenario_priorities(bdd_output)
        
        # P0 requirements should always have scenarios
        p0_requirements = [req for req, priority in validation_priorities.items() if priority == "P0"]
        missing_p0_scenarios = []
        
        for p0_req in p0_requirements:
            if not has_corresponding_scenario(p0_req, bdd_scenarios):
                missing_p0_scenarios.append(p0_req)
        
        if missing_p0_scenarios:
            return EvalResult(
                eval_name="eval_priority_consistency",
                status="FAIL",
                message=f"P0 requirements missing scenarios: {missing_p0_scenarios}",
                details={"missing_p0_scenarios": missing_p0_scenarios}
            )
        
        return EvalResult(
            eval_name="eval_priority_consistency", 
            status="PASS",
            message="Priority classifications consistent across tasks"
        )
        
    except Exception as e:
        return EvalResult(
            eval_name="eval_priority_consistency",
            status="FAIL", 
            message=f"Eval crashed: {str(e)}"
        )

def eval_context_smartness(task_inputs: Dict[str, str]) -> EvalResult:
    """
    Check that each task gets only the context it needs.
    
    Based on your Context Smartness principle:
    - Task 1: Analysis rules + Domain context only
    - Task 2: BDD patterns + Task 1 output only
    - Task 3a: Assessment criteria + Task 2 output only
    - Task 3b: Technical patterns + approved scenarios only
    """
    context_violations = []
    
    # Check for context contamination (tasks getting inappropriate context)
    if "task2" in task_inputs:
        task2_input = task_inputs["task2"]
        
        # Task 2 shouldn't see technical implementation details
        technical_contamination = [
            "react", "testing", "automation", "playwright", "selenium"
        ]
        
        for contamination in technical_contamination:
            if contamination.lower() in task2_input.lower():
                context_violations.append(f"Task 2 contaminated with technical context: {contamination}")
    
    if context_violations:
        return EvalResult(
            eval_name="eval_context_smartness",
            status="FAIL",
            message=f"Context contamination detected: {context_violations}"
        )
    
    return EvalResult(
        eval_name="eval_context_smartness",
        status="PASS", 
        message="Tasks have appropriate context boundaries"
    )

# Helper functions

def extract_p0_requirements(ticket: str) -> List[str]:
    """Extract P0 (core) requirements from ticket acceptance criteria."""
    import re
    
    # Look for acceptance criteria patterns
    ac_patterns = [
        r'acceptance criteria?[:\s]*(.+?)(?=\n\n|\n[A-Z]|\Z)',
        r'given[^\.]+when[^\.]+then[^\.]+',
        r'user (?:must|should|can)[^\.]+',
        r'system (?:must|should|will)[^\.]+' 
    ]
    
    p0_requirements = []
    
    for pattern in ac_patterns:
        matches = re.findall(pattern, ticket, re.IGNORECASE | re.DOTALL)
        p0_requirements.extend(matches)
    
    return [req.strip() for req in p0_requirements if req.strip()]

def requirement_present_in_output(requirement: str, output: str) -> bool:
    """Check if a requirement is semantically present in the output."""
    # Simple keyword overlap approach (can be enhanced with semantic similarity)
    import re
    
    # Extract key terms from requirement
    requirement_terms = re.findall(r'\b[a-zA-Z]{3,}\b', requirement.lower())
    
    # Check for presence of key terms in output
    overlap_count = 0
    for term in requirement_terms:
        if term in output.lower():
            overlap_count += 1
    
    # Consider present if significant overlap
    return overlap_count >= len(requirement_terms) * 0.5

def extract_significant_elements(output: str) -> List[str]:
    """Extract significant elements from task output for traceability checking."""
    import re
    
    elements = []
    
    # Extract scenario titles, steps, assertions
    scenario_titles = re.findall(r'scenario:?\s*([^\n]+)', output, re.IGNORECASE)
    elements.extend(scenario_titles)
    
    # Extract action verbs and objects
    actions = re.findall(r'(?:user|system|customer)\s+(\w+\s+\w+)', output, re.IGNORECASE)
    elements.extend(actions)
    
    return [elem.strip() for elem in elements if elem.strip()]

def element_traces_to_ticket(element: str, ticket: str) -> bool:
    """Check if an element can be traced back to the ticket."""
    # Simple approach: look for semantic overlap
    element_words = set(element.lower().split())
    ticket_words = set(ticket.lower().split())
    
    # Consider traceable if significant word overlap
    overlap = element_words.intersection(ticket_words)
    return len(overlap) >= min(2, len(element_words) * 0.4)

def extract_priorities(validation_output: str) -> Dict[str, str]:
    """Extract requirement priorities from validation output.""" 
    import re
    
    priorities = {}
    
    # Look for priority assignments
    priority_patterns = [
        r'(\w+(?:\s+\w+)*)\s*:\s*(P[0-4])',
        r'(P[0-4])\s*:\s*(\w+(?:\s+\w+)*)'
    ]
    
    for pattern in priority_patterns:
        matches = re.findall(pattern, validation_output)
        for match in matches:
            if match[1].startswith('P'):
                priorities[match[0]] = match[1]  
            else:
                priorities[match[1]] = match[0]
    
    return priorities

def extract_scenario_priorities(bdd_output: str) -> List[str]:
    """Extract scenario names/descriptions from BDD output."""
    import re
    
    scenarios = re.findall(r'scenario:?\s*([^\n]+)', bdd_output, re.IGNORECASE)
    return [scenario.strip() for scenario in scenarios]

def has_corresponding_scenario(requirement: str, scenarios: List[str]) -> bool:
    """Check if a requirement has a corresponding BDD scenario."""
    req_words = set(requirement.lower().split())
    
    for scenario in scenarios:
        scenario_words = set(scenario.lower().split()) 
        overlap = req_words.intersection(scenario_words)
        
        if len(overlap) >= min(2, len(req_words) * 0.4):
            return True
    
    return False