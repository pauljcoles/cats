"""
Enhanced Code Pattern Detection
Extracted from JSON patterns for deterministic, high-confidence detection
"""

import re
from typing import List, Dict
from .task1 import LanguageIssue, FailureType, Severity, EvalMethod

class EnhancedCodePatterns:
    """
    Deterministic pattern detection for user story quality issues
    Moved from JSON to Python for high-confidence, code-based detection
    """
    
    def __init__(self):
        # INVEST - Independence Violations (Code-detectable)
        self.independence_patterns = {
            "explicit_dependencies": {
                "regex_patterns": [
                    r"depends?\s+on\s+\w+",
                    r"requires?\s+(story|ticket)\s+[\w-]+",
                    r"after\s+(completion|finishing)\s+of\s+\w+",
                    r"building\s+on\s+\w+",
                    r"blocked\s+by\s+[\w-]+"
                ],
                "keywords": ["depends on", "requires story", "after completion of", "building on"],
                "confidence": 0.88,
                "reasoning": "Explicit dependency statements violate INVEST Independence"
            },
            "sequential_assumptions": {
                "regex_patterns": [
                    r"following\s+the\s+previous",
                    r"continuing\s+from\s+\w+",
                    r"next\s+step\s+after\s+\w+"
                ],
                "keywords": ["following the previous", "continuing from", "next step after"],
                "confidence": 0.85,
                "reasoning": "Sequential language suggests dependency on other stories"
            }
        }
        
        # INVEST - Negotiability Violations (Code-detectable)  
        self.negotiability_patterns = {
            "implementation_prescription": {
                "regex_patterns": [
                    r"must\s+use\s+\w+",
                    r"shall\s+implement\s+\w+",
                    r"required\s+to\s+use\s+\w+",
                    r"will\s+be\s+built\s+with\s+\w+"
                ],
                "keywords": ["must use", "shall implement", "required to use", "will be built with"],
                "confidence": 0.86,
                "reasoning": "Prescriptive language prevents negotiation of implementation approach"
            },
            "ui_micro_management": {
                "regex_patterns": [
                    r"button\s+must\s+be\s+\w+",
                    r"color\s+shall\s+be\s+\w+",
                    r"font\s+size\s+exactly\s+\d+",
                    r"pixel\s+perfect"
                ],
                "keywords": ["button must be", "color shall be", "font size exactly", "pixel perfect"],
                "confidence": 0.83,
                "reasoning": "UI micro-management leaves no room for design negotiation"
            },
            "technical_constraints": {
                "regex_patterns": [
                    r"using\s+(React|Angular|Vue)",
                    r"with\s+(Redux|MobX|Vuex)",
                    r"via\s+(REST|GraphQL)\s+API",
                    r"in\s+the\s+database"
                ],
                "keywords": ["using React", "with Redux", "via REST API", "in the database"],
                "confidence": 0.82,
                "reasoning": "Technical constraints limit implementation negotiation"
            }
        }
        
        # INVEST - Value Violations (Code-detectable)
        self.value_patterns = {
            "technical_tasks": {
                "regex_patterns": [
                    r"refactor\s+\w+",
                    r"upgrade\s+library",
                    r"optimize\s+performance",
                    r"fix\s+technical\s+debt"
                ],
                "keywords": ["refactor", "upgrade library", "optimize performance", "fix technical debt"],
                "confidence": 0.85,
                "reasoning": "Pure technical tasks may not deliver direct user value"
            },
            "process_stories": {
                "regex_patterns": [
                    r"update\s+documentation",
                    r"create\s+test\s+plan",
                    r"setup\s+environment"
                ],
                "keywords": ["update documentation", "create test plan", "setup environment"],
                "confidence": 0.80,
                "reasoning": "Process tasks don't deliver end-user value"
            }
        }
        
        # INVEST - Size Violations (Code-detectable)
        self.size_patterns = {
            "epic_indicators": {
                "regex_patterns": [
                    r"complete\s+system",
                    r"entire\s+workflow",
                    r"full\s+integration",
                    r"end-to-end\s+\w+"
                ],
                "keywords": ["complete system", "entire workflow", "full integration", "end-to-end"],
                "confidence": 0.87,
                "reasoning": "Epic-scale language suggests story is too large"
            },
            "multiple_personas": {
                "regex_patterns": [
                    r"admin\s+and\s+user",
                    r"customer\s+and\s+staff",
                    r"all\s+user\s+types"
                ],
                "keywords": ["admin and user", "customer and staff", "all user types"],
                "confidence": 0.84,
                "reasoning": "Multiple personas suggest story should be split"
            }
        }
        
        # 3 C's - Card Violations (Code-detectable)
        self.card_patterns = {
            "specification_creep": {
                "regex_patterns": [
                    r"detailed\s+workflow",
                    r"step-by-step\s+process",
                    r"complete\s+specification",
                    r"full\s+requirements"
                ],
                "keywords": ["detailed workflow", "step-by-step process", "complete specification"],
                "confidence": 0.84,
                "reasoning": "Card should be reminder, not detailed specification"
            },
            "technical_implementation": {
                "regex_patterns": [
                    r"database\s+schema",
                    r"API\s+endpoints",
                    r"technical\s+architecture",
                    r"code\s+structure"
                ],
                "keywords": ["database schema", "API endpoints", "technical architecture"],
                "confidence": 0.85,
                "reasoning": "Implementation details violate Card principle"
            }
        }
        
        # BDD Structure Violations (Code-detectable)
        self.bdd_structure_patterns = {
            "missing_given": {
                "regex_patterns": [
                    r"^when\s+user\s+(clicks|selects)",
                    r"^user\s+(selects|clicks)",
                    r"^after\s+clicking"
                ],
                "keywords": ["when user clicks", "user selects", "after clicking"],
                "confidence": 0.85,
                "reasoning": "Action without context violates Given-When-Then structure"
            },
            "implementation_then": {
                "regex_patterns": [
                    r"then\s+database\s+updates",
                    r"then\s+API\s+calls",
                    r"then\s+code\s+executes",
                    r"then\s+service\s+processes"
                ],
                "keywords": ["then database updates", "then API calls", "then code executes"],
                "confidence": 0.86,
                "reasoning": "Implementation outcomes aren't user-observable"
            }
        }

    def check_invest_independence(self, ac_id: str, ac_text: str) -> List[LanguageIssue]:
        """Check for INVEST Independence violations using deterministic patterns"""
        issues = []
        
        for category_name, category_data in self.independence_patterns.items():
            # Check regex patterns
            for pattern in category_data["regex_patterns"]:
                matches = re.finditer(pattern, ac_text, re.IGNORECASE)
                for match in matches:
                    issues.append(LanguageIssue(
                        failure_type=FailureType.EXTERNAL_REFERENCES,  # Reusing closest type
                        severity=Severity.HIGH,
                        ac_id=ac_id,
                        detected_pattern=f"INVEST Independence - {category_name}: {match.group()}",
                        context=self._extract_context(ac_text, match.start(), match.end()),
                        suggestion=f"Remove dependency: {category_data['reasoning']}",
                        location=f"Characters {match.start()}-{match.end()}",
                        eval_method=EvalMethod.CODE_BASED,
                        confidence=category_data["confidence"]
                    ))
            
            # Check keyword patterns
            text_lower = ac_text.lower()
            for keyword in category_data["keywords"]:
                if keyword in text_lower:
                    pos = text_lower.find(keyword)
                    issues.append(LanguageIssue(
                        failure_type=FailureType.EXTERNAL_REFERENCES,
                        severity=Severity.HIGH,
                        ac_id=ac_id,
                        detected_pattern=f"INVEST Independence - {category_name}: {keyword}",
                        context=self._extract_context_around_pos(ac_text, pos, len(keyword)),
                        suggestion=f"Remove dependency: {category_data['reasoning']}",
                        location=f"Keyword: {keyword}",
                        eval_method=EvalMethod.CODE_BASED,
                        confidence=category_data["confidence"]
                    ))
        
        return issues

    def check_invest_negotiability(self, ac_id: str, ac_text: str) -> List[LanguageIssue]:
        """Check for INVEST Negotiability violations using deterministic patterns"""
        issues = []
        
        for category_name, category_data in self.negotiability_patterns.items():
            # Check regex patterns
            for pattern in category_data["regex_patterns"]:
                matches = re.finditer(pattern, ac_text, re.IGNORECASE)
                for match in matches:
                    issues.append(LanguageIssue(
                        failure_type=FailureType.IMPLEMENTATION_CONTAMINATION,
                        severity=Severity.HIGH,
                        ac_id=ac_id,
                        detected_pattern=f"INVEST Negotiability - {category_name}: {match.group()}",
                        context=self._extract_context(ac_text, match.start(), match.end()),
                        suggestion=f"Allow negotiation: {category_data['reasoning']}",
                        location=f"Characters {match.start()}-{match.end()}",
                        eval_method=EvalMethod.CODE_BASED,
                        confidence=category_data["confidence"]
                    ))
        
        return issues

    def check_invest_value(self, ac_id: str, ac_text: str) -> List[LanguageIssue]:
        """Check for INVEST Value violations using deterministic patterns"""
        issues = []
        
        for category_name, category_data in self.value_patterns.items():
            text_lower = ac_text.lower()
            for keyword in category_data["keywords"]:
                if keyword in text_lower:
                    pos = text_lower.find(keyword)
                    issues.append(LanguageIssue(
                        failure_type=FailureType.IMPLEMENTATION_CONTAMINATION,
                        severity=Severity.MEDIUM,
                        ac_id=ac_id,
                        detected_pattern=f"INVEST Value - {category_name}: {keyword}",
                        context=self._extract_context_around_pos(ac_text, pos, len(keyword)),
                        suggestion=f"Clarify user value: {category_data['reasoning']}",
                        location=f"Keyword: {keyword}",
                        eval_method=EvalMethod.CODE_BASED,
                        confidence=category_data["confidence"]
                    ))
        
        return issues

    def check_invest_size(self, ac_id: str, ac_text: str) -> List[LanguageIssue]:
        """Check for INVEST Size violations using deterministic patterns"""
        issues = []
        
        for category_name, category_data in self.size_patterns.items():
            for pattern in category_data["regex_patterns"]:
                matches = re.finditer(pattern, ac_text, re.IGNORECASE)
                for match in matches:
                    issues.append(LanguageIssue(
                        failure_type=FailureType.MULTIPLE_BEHAVIORS,
                        severity=Severity.HIGH,
                        ac_id=ac_id,
                        detected_pattern=f"INVEST Size - {category_name}: {match.group()}",
                        context=self._extract_context(ac_text, match.start(), match.end()),
                        suggestion=f"Split story: {category_data['reasoning']}",
                        location=f"Characters {match.start()}-{match.end()}",
                        eval_method=EvalMethod.CODE_BASED,
                        confidence=category_data["confidence"]
                    ))
        
        return issues

    def check_three_cs_card(self, ac_id: str, ac_text: str) -> List[LanguageIssue]:
        """Check for 3 C's Card violations using deterministic patterns"""
        issues = []
        
        for category_name, category_data in self.card_patterns.items():
            text_lower = ac_text.lower()
            for keyword in category_data["keywords"]:
                if keyword in text_lower:
                    pos = text_lower.find(keyword)
                    issues.append(LanguageIssue(
                        failure_type=FailureType.IMPLEMENTATION_CONTAMINATION,
                        severity=Severity.HIGH,
                        ac_id=ac_id,
                        detected_pattern=f"3 C's Card - {category_name}: {keyword}",
                        context=self._extract_context_around_pos(ac_text, pos, len(keyword)),
                        suggestion=f"Simplify card: {category_data['reasoning']}",
                        location=f"Keyword: {keyword}",
                        eval_method=EvalMethod.CODE_BASED,
                        confidence=category_data["confidence"]
                    ))
        
        return issues

    def check_bdd_structure(self, ac_id: str, ac_text: str) -> List[LanguageIssue]:
        """Check for BDD structure violations using deterministic patterns"""
        issues = []
        
        for category_name, category_data in self.bdd_structure_patterns.items():
            for pattern in category_data["regex_patterns"]:
                matches = re.finditer(pattern, ac_text, re.IGNORECASE | re.MULTILINE)
                for match in matches:
                    issues.append(LanguageIssue(
                        failure_type=FailureType.UNCLEAR_CONDITIONALS,
                        severity=Severity.MEDIUM,
                        ac_id=ac_id,
                        detected_pattern=f"BDD Structure - {category_name}: {match.group()}",
                        context=self._extract_context(ac_text, match.start(), match.end()),
                        suggestion=f"Fix BDD structure: {category_data['reasoning']}",
                        location=f"Characters {match.start()}-{match.end()}",
                        eval_method=EvalMethod.CODE_BASED,
                        confidence=category_data["confidence"]
                    ))
        
        return issues

    def run_all_enhanced_checks(self, ac_id: str, ac_text: str) -> List[LanguageIssue]:
        """Run all enhanced code-based pattern checks"""
        all_issues = []
        
        # INVEST criteria checks
        all_issues.extend(self.check_invest_independence(ac_id, ac_text))
        all_issues.extend(self.check_invest_negotiability(ac_id, ac_text))
        all_issues.extend(self.check_invest_value(ac_id, ac_text))
        all_issues.extend(self.check_invest_size(ac_id, ac_text))
        
        # 3 C's framework checks
        all_issues.extend(self.check_three_cs_card(ac_id, ac_text))
        
        # BDD structure checks
        all_issues.extend(self.check_bdd_structure(ac_id, ac_text))
        
        return all_issues

    def _extract_context(self, text: str, start: int, end: int, window: int = 30) -> str:
        """Extract context around a pattern match"""
        context_start = max(0, start - window)
        context_end = min(len(text), end + window)
        context = text[context_start:context_end].strip()
        
        if context_start > 0:
            context = "..." + context
        if context_end < len(text):
            context = context + "..."
            
        return context

    def _extract_context_around_pos(self, text: str, pos: int, length: int, window: int = 30) -> str:
        """Extract context around a position"""
        return self._extract_context(text, pos, pos + length, window)