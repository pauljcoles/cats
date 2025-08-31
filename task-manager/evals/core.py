"""
Core evaluation infrastructure for the task manager system.

Following Teresa Torres' approach: keep it simple, focus on specific failure modes,
use domain knowledge over complex frameworks.
"""

from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Callable
from datetime import datetime

@dataclass
class EvalResult:
    """
    Simple evaluation result structure.
    
    Following Teresa's pattern: PASS/FAIL with clear reasoning.
    """
    eval_name: str
    status: str  # "PASS" or "FAIL"
    message: str
    details: Optional[Dict[str, Any]] = None
    timestamp: Optional[datetime] = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now()
    
    @property
    def passed(self) -> bool:
        return self.status == "PASS"
    
    @property
    def failed(self) -> bool:
        return self.status == "FAIL"

def run_eval(eval_func: Callable, *args, **kwargs) -> EvalResult:
    """
    Run an evaluation function and ensure it returns a proper EvalResult.
    
    Args:
        eval_func: The evaluation function to run
        *args, **kwargs: Arguments to pass to the eval function
        
    Returns:
        EvalResult object
    """
    try:
        result = eval_func(*args, **kwargs)
        
        # If function returns a string, convert to EvalResult
        if isinstance(result, str):
            if result.startswith("FAIL"):
                return EvalResult(
                    eval_name=eval_func.__name__,
                    status="FAIL", 
                    message=result[5:].strip() if len(result) > 5 else "Evaluation failed"
                )
            else:
                return EvalResult(
                    eval_name=eval_func.__name__,
                    status="PASS",
                    message=result
                )
        
        # If function already returns EvalResult, use it
        elif isinstance(result, EvalResult):
            return result
            
        else:
            return EvalResult(
                eval_name=eval_func.__name__,
                status="FAIL",
                message=f"Invalid eval result type: {type(result)}"
            )
            
    except Exception as e:
        return EvalResult(
            eval_name=eval_func.__name__,
            status="FAIL", 
            message=f"Eval function crashed: {str(e)}"
        )

def extract_features_from_text(text: str) -> set:
    """
    Simple feature extraction for checking requirement invention.
    
    This is a basic implementation - can be enhanced based on domain needs.
    """
    # Basic approach: extract action words and UI elements
    import re
    
    # Look for action patterns
    actions = set()
    
    # UI interaction patterns
    ui_patterns = [
        r'click (?:on )?(?:the )?([a-zA-Z]+(?:\s+[a-zA-Z]+)*)',
        r'select (?:the )?([a-zA-Z]+(?:\s+[a-zA-Z]+)*)',
        r'enter (?:.*) in(?:to)? (?:the )?([a-zA-Z]+(?:\s+[a-zA-Z]+)*)',
        r'see (?:the )?([a-zA-Z]+(?:\s+[a-zA-Z]+)*)',
        r'navigate to (?:the )?([a-zA-Z]+(?:\s+[a-zA-Z]+)*)'
    ]
    
    for pattern in ui_patterns:
        matches = re.findall(pattern, text.lower())
        actions.update(matches)
    
    return actions

def extract_ticket_requirements(ticket_text: str) -> set:
    """
    Extract requirements/features from a ticket.
    
    This focuses on acceptance criteria and explicit requirements.
    """
    # Basic implementation - look for explicit requirements
    import re
    
    requirements = set()
    
    # Look for acceptance criteria patterns
    ac_patterns = [
        r'given.*when.*then (.*)',
        r'user (?:can|should|must) (.*)',
        r'system (?:should|must|will) (.*)',
        r'(?:requirement|feature):\s*(.*)'
    ]
    
    for pattern in ac_patterns:
        matches = re.findall(pattern, ticket_text.lower())
        requirements.update(matches)
    
    return requirements