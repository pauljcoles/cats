"""
Shared types for validation system
Extracted to avoid circular imports
"""

from dataclasses import dataclass
from typing import List, Dict, Any, Tuple, Optional
from enum import Enum

# ===== EVALUATION CLASSES =====

class FailureType(Enum):
    VAGUE_TERMS = "vague_terms"
    MULTIPLE_BEHAVIORS = "multiple_behaviors" 
    EXTERNAL_REFERENCES = "external_references"
    UNCLEAR_CONDITIONALS = "unclear_conditionals"
    IMPLEMENTATION_CONTAMINATION = "implementation_contamination"

class Severity(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class EvalMethod(Enum):
    CODE_BASED = "code"
    LLM_BASED = "llm"
    HYBRID = "hybrid"

class UserChoice(Enum):
    PROCEED_ANYWAY = "proceed"
    APPLY_SRP = "apply_srp"
    SHOW_PREVIEW = "preview"
    STOP_AND_FIX = "stop"
    GET_MORE_DETAILS = "details"

@dataclass
class LanguageIssue:
    failure_type: FailureType
    severity: Severity
    ac_id: str
    detected_pattern: str
    context: str
    suggestion: str
    location: str
    eval_method: EvalMethod  # How was this detected?
    confidence: float = 1.0  # 0-1, lower for LLM judgments