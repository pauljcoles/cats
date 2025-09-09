"""
Hybrid Gate 1 Language Clarity Evaluation System
Uses code for reliable patterns + LLM for contextual judgment
Enhanced with industry-standard framework patterns
"""

import re
from dataclasses import dataclass
from typing import List, Dict, Any, Tuple, Optional
from .validation_types import LanguageIssue, FailureType, Severity, EvalMethod, UserChoice
from .enhanced_code_patterns import EnhancedCodePatterns

# Import real LLM client
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'services'))
from llm_client import make_llm_call

# ===== EVALUATION CLASSES =====

@dataclass
class Gate1EvalResult:
    passed: bool
    score: float
    total_issues: int
    issues_by_severity: Dict[str, int]
    detailed_issues: List[LanguageIssue]
    ac_scores: Dict[str, float]
    recommendations: List[str]
    eval_breakdown: Dict[str, int]  # code vs llm issue counts

@dataclass
class TaskExecutionContext:
    ticket_id: str
    ticket_data: Dict[str, Any]
    eval_result: Gate1EvalResult
    user_choice: UserChoice = None
    should_continue: bool = False

# ===== HYBRID EVALUATION ENGINE =====

class HybridGate1Evaluator:
    """
    Hybrid evaluator: Code for reliable patterns, LLM for contextual judgment
    """
    
    def __init__(self):
        # Initialize enhanced code pattern detection
        self.enhanced_patterns = EnhancedCodePatterns()
        
        # Patterns that code can reliably detect
        self.reliable_vague_terms = {
            "appropriate": ("medium", "Use specific criteria instead"),
            "proper": ("medium", "Define what 'proper' means"),
            "suitable": ("medium", "Specify suitability requirements"), 
            "adequate": ("medium", "Define adequacy metrics"),
            "reasonable": ("medium", "Provide specific thresholds"),
            "intuitive": ("critical", "Cannot be objectively measured"),
            "user-friendly": ("high", "Define specific usability requirements"),
            "easy": ("medium", "Define ease criteria")
        }
        
        # Clear external reference patterns
        self.external_reference_patterns = [
            r"see\s+figma", r"figma\s+link", r"figma\s+design",
            r"see\s+ticket\s+\w+-\d+", r"refer\s+to\s+\w+-\d+", 
            r"attachment\s+\d+", r"confluence\s+page",
            r"documented\s+elsewhere", r"see\s+separate\s+doc"
        ]
        
        # Simple conditional patterns that are clearly problematic
        self.clearly_unclear_conditionals = [
            r"if\s+applicable", r"where\s+appropriate", 
            r"when\s+needed", r"as\s+necessary"
        ]
        
        # Implementation contamination patterns (technical details in requirements)
        self.implementation_contamination_patterns = [
            # API patterns (HTTP methods with paths)
            r"POST\s+/\w+", r"GET\s+/\w+", r"PUT\s+/\w+", r"DELETE\s+/\w+",
            r"/api/\w+", r"\.json\b", r"\.xml\b",
            # DOM/CSS selectors (specific technical identifiers)
            r"data-id=", r"#\w+-\w+", r"\.class-\w+", r"getElementById",
            r"querySelector", r"\bDOM\b", r"with\s+ID\s+#",
            # JavaScript/Code patterns (function calls and objects)
            r"localStorage\.", r"sessionStorage\.", r"Redux\b", r"dispatch\(",
            r"setState\(", r"useState\(", r"useEffect\(",
            # Database SQL patterns (SQL keywords)
            r"SELECT\s+\w+\s+FROM", r"INSERT\s+INTO", r"UPDATE\s+\w+\s+SET", r"DELETE\s+FROM",
            # Specific technologies and analytics
            r"Mixpanel", r"Google\s+Analytics", r"Firebase", r"MongoDB",
            # Technical formats (JSON object patterns)
            r"\{\s*[\"\']type[\"\']:\s*[\"\'][^\"\']+[\"\']",
            r"\{\s*[\"\']?\w+[\"\']?\s*:\s*[\"\']?\w+[\"\']?\s*,",  # JSON with commas
            # React/HTML attributes
            r"className=", r"onClick=", r"onChange="
        ]
        
        # Ambiguous terms that need LLM judgment (context-dependent)
        self.context_dependent_terms = [
            "clear", "good", "well", "valid", "correct", "accurate", 
            "complete", "successful", "effective", "efficient"
        ]
    
    def evaluate_acceptance_criteria(self, acceptance_criteria: List[Dict]) -> Gate1EvalResult:
        """Main hybrid evaluation method"""
        all_issues = []
        ac_scores = {}
        eval_breakdown = {"code": 0, "llm": 0}
        
        for ac in acceptance_criteria:
            ac_id = ac.get('id', 'UNKNOWN')
            ac_text = ac.get('text', '')
            
            # Step 1: Run code-based checks (fast, reliable)
            code_issues = self._run_code_checks(ac_id, ac_text)
            all_issues.extend(code_issues)
            eval_breakdown["code"] += len(code_issues)
            
            # Step 1.5: Run enhanced framework-based code checks
            enhanced_issues = self.enhanced_patterns.run_all_enhanced_checks(ac_id, ac_text)
            all_issues.extend(enhanced_issues)
            eval_breakdown["code"] += len(enhanced_issues)
            
            # Step 2: Determine if LLM judgment needed
            if self._needs_llm_judgment(ac_text):
                llm_issues = self._run_llm_checks(ac_id, ac_text)
                all_issues.extend(llm_issues)
                eval_breakdown["llm"] += len(llm_issues)
            
            # Calculate score for this AC
            ac_issues = [i for i in all_issues if i.ac_id == ac_id]
            ac_scores[ac_id] = self._calculate_ac_score(ac_issues)
        
        # Calculate overall results
        overall_score = sum(ac_scores.values()) / len(ac_scores) if ac_scores else 0
        recommendations = self._generate_recommendations(all_issues)
        
        # Pass/fail logic
        critical_issues = [i for i in all_issues if i.severity == Severity.CRITICAL]
        passed = overall_score >= 70 and len(critical_issues) == 0
        
        # Count by severity
        issues_by_severity = {
            "critical": len([i for i in all_issues if i.severity == Severity.CRITICAL]),
            "high": len([i for i in all_issues if i.severity == Severity.HIGH]),
            "medium": len([i for i in all_issues if i.severity == Severity.MEDIUM]),
            "low": len([i for i in all_issues if i.severity == Severity.LOW])
        }
        
        return Gate1EvalResult(
            passed=passed,
            score=overall_score,
            total_issues=len(all_issues),
            issues_by_severity=issues_by_severity,
            detailed_issues=all_issues,
            ac_scores=ac_scores,
            recommendations=recommendations,
            eval_breakdown=eval_breakdown
        )
    
    def _run_code_checks(self, ac_id: str, ac_text: str) -> List[LanguageIssue]:
        """Run reliable code-based pattern matching"""
        issues = []
        
        # Check 1: Reliable vague terms
        issues.extend(self._check_reliable_vague_terms(ac_id, ac_text))
        
        # Check 2: Clear external references
        issues.extend(self._check_external_references(ac_id, ac_text))
        
        # Check 3: Obviously unclear conditionals
        issues.extend(self._check_clear_conditional_problems(ac_id, ac_text))
        
        # Check 4: Implementation contamination
        issues.extend(self._check_implementation_contamination(ac_id, ac_text))
        
        return issues
    
    def _check_reliable_vague_terms(self, ac_id: str, ac_text: str) -> List[LanguageIssue]:
        """Check for terms that are always vague regardless of context"""
        issues = []
        text_lower = ac_text.lower()
        
        for term, (severity_str, suggestion) in self.reliable_vague_terms.items():
            if term in text_lower:
                context = self._extract_context_around_term(ac_text, term)
                
                issues.append(LanguageIssue(
                    failure_type=FailureType.VAGUE_TERMS,
                    severity=Severity(severity_str),
                    ac_id=ac_id,
                    detected_pattern=term,
                    context=context,
                    suggestion=suggestion,
                    location=f"Character {text_lower.find(term)}",
                    eval_method=EvalMethod.CODE_BASED,
                    confidence=1.0
                ))
        
        return issues
    
    def _check_external_references(self, ac_id: str, ac_text: str) -> List[LanguageIssue]:
        """Check for clear external reference patterns"""
        issues = []
        
        for pattern in self.external_reference_patterns:
            matches = re.finditer(pattern, ac_text, re.IGNORECASE)
            for match in matches:
                context = self._extract_context(ac_text, match.start(), match.end())
                
                issues.append(LanguageIssue(
                    failure_type=FailureType.EXTERNAL_REFERENCES,
                    severity=Severity.HIGH,
                    ac_id=ac_id,
                    detected_pattern=match.group(),
                    context=context,
                    suggestion="Provide referenced materials inline",
                    location=f"Characters {match.start()}-{match.end()}",
                    eval_method=EvalMethod.CODE_BASED,
                    confidence=1.0
                ))
        
        return issues
    
    def _check_clear_conditional_problems(self, ac_id: str, ac_text: str) -> List[LanguageIssue]:
        """Check for obviously problematic conditionals"""
        issues = []
        
        for pattern in self.clearly_unclear_conditionals:
            matches = re.finditer(pattern, ac_text, re.IGNORECASE)
            for match in matches:
                context = self._extract_context(ac_text, match.start(), match.end())
                
                issues.append(LanguageIssue(
                    failure_type=FailureType.UNCLEAR_CONDITIONALS,
                    severity=Severity.HIGH,
                    ac_id=ac_id,
                    detected_pattern=match.group(),
                    context=context,
                    suggestion="Define specific conditions",
                    location=f"Characters {match.start()}-{match.end()}",
                    eval_method=EvalMethod.CODE_BASED,
                    confidence=1.0
                ))
        
        return issues
    
    def _check_implementation_contamination(self, ac_id: str, ac_text: str) -> List[LanguageIssue]:
        """Check for technical implementation details in requirements"""
        issues = []
        
        for pattern in self.implementation_contamination_patterns:
            matches = re.finditer(pattern, ac_text, re.IGNORECASE)
            for match in matches:
                context = self._extract_context(ac_text, match.start(), match.end())
                
                issues.append(LanguageIssue(
                    failure_type=FailureType.IMPLEMENTATION_CONTAMINATION,
                    severity=Severity.HIGH,
                    ac_id=ac_id,
                    detected_pattern=match.group(),
                    context=context,
                    suggestion="Replace with user-observable behavior instead of implementation details",
                    location=f"Characters {match.start()}-{match.end()}",
                    eval_method=EvalMethod.CODE_BASED,
                    confidence=1.0
                ))
        
        return issues
    
    def _needs_llm_judgment(self, ac_text: str) -> bool:
        """Determine if this AC needs LLM analysis"""
        text_lower = ac_text.lower()
        
        # Check for context-dependent terms
        has_context_dependent = any(term in text_lower for term in self.context_dependent_terms)
        
        # Check for table structures (wiki markup with pipes)
        has_table_structure = '||' in ac_text or (ac_text.count('|') >= 4)
        
        # Check for complex conditional logic
        has_complex_conditionals = any(phrase in text_lower for phrase in [
            "if", "when", "unless", "depending on", "based on", "in case of"
        ]) and not any(re.search(pattern, ac_text, re.IGNORECASE) 
                      for pattern in self.clearly_unclear_conditionals)
        
        return has_context_dependent or has_table_structure or has_complex_conditionals
    
    def _run_llm_checks(self, ac_id: str, ac_text: str) -> List[LanguageIssue]:
        """Run LLM-based analysis for contextual issues"""
        issues = []
        
        # Check for multiple behaviors (needs context understanding)
        multiple_behavior_result = self._llm_check_multiple_behaviors(ac_id, ac_text)
        if multiple_behavior_result:
            issues.append(multiple_behavior_result)
        
        # Check for context-dependent vagueness
        context_vague_issues = self._llm_check_contextual_vagueness(ac_id, ac_text)
        issues.extend(context_vague_issues)
        
        # Check complex conditional logic
        complex_conditional_result = self._llm_check_complex_conditionals(ac_id, ac_text)
        if complex_conditional_result:
            issues.append(complex_conditional_result)
        
        return issues
    
    def _llm_check_multiple_behaviors(self, ac_id: str, ac_text: str) -> Optional[LanguageIssue]:
        """Use LLM to determine if AC tests multiple behaviors"""
        
        # This would be an actual LLM call in implementation
        llm_prompt = f"""
Analyze this acceptance criterion for multiple behaviors:

"{ac_text}"

Question: Does this acceptance criterion test multiple distinct user behaviors or just one?

Consider:
- Multiple outcomes in Then clause = likely multiple behaviors
- Sequential steps in same workflow = might be one behavior
- Different types of validation = likely multiple behaviors

Respond with JSON:
{{
  "multiple_behaviors": true/false,
  "explanation": "brief explanation",
  "suggested_split": ["behavior 1", "behavior 2"] // if multiple
}}
"""
        
        # Make real LLM call using the prompt above
        llm_response = make_llm_call(llm_prompt, expect_json=True)
        
        # Handle LLM response failure gracefully
        if not llm_response:
            print(f"   ⚠️ LLM call failed for multiple behaviors check on {ac_id}")
            return None
        
        if llm_response.get("multiple_behaviors"):
            return LanguageIssue(
                failure_type=FailureType.MULTIPLE_BEHAVIORS,
                severity=Severity.HIGH,
                ac_id=ac_id,
                detected_pattern="Multiple behaviors detected",
                context=ac_text[:100] + "...",
                suggestion=f"Split into: {', '.join(llm_response.get('suggested_split', []))}",
                location="Full AC",
                eval_method=EvalMethod.LLM_BASED,
                confidence=0.85  # LLM confidence
            )
        
        return None
    
    def _llm_check_contextual_vagueness(self, ac_id: str, ac_text: str) -> List[LanguageIssue]:
        """Use LLM to check for context-dependent vague terms"""
        issues = []
        
        # Find context-dependent terms in the text
        found_terms = [term for term in self.context_dependent_terms 
                      if term in ac_text.lower()]
        
        if not found_terms:
            return issues
        
        # LLM prompt for context analysis
        llm_prompt = f"""
Analyze these terms in context:

Text: "{ac_text}"
Terms to check: {found_terms}

For each term, determine:
1. Is it vague in this context?
2. Can it be objectively measured/verified?
3. What specific alternative would be better?

Respond with JSON array:
[{{"term": "valid", "vague": true, "reason": "no validation criteria specified", "suggestion": "specify validation rules"}}]
"""
        
        # Make real LLM call using the prompt above
        llm_response = make_llm_call(llm_prompt, expect_json=True)
        
        # Handle LLM response failure gracefully
        if not llm_response:
            print(f"   ⚠️ LLM call failed for vagueness check on {ac_id}")
            return issues
        
        # Ensure response is a list
        if not isinstance(llm_response, list):
            llm_response = [llm_response] if llm_response else []
        
        for result in llm_response:
            if result.get("vague"):
                issues.append(LanguageIssue(
                    failure_type=FailureType.VAGUE_TERMS,
                    severity=Severity.MEDIUM,
                    ac_id=ac_id,
                    detected_pattern=result["term"],
                    context=self._extract_context_around_term(ac_text, result["term"]),
                    suggestion=result.get("suggestion", "Define specific criteria"),
                    location=f"Term: {result['term']}",
                    eval_method=EvalMethod.LLM_BASED,
                    confidence=0.75
                ))
        
        return issues
    
    def _llm_check_complex_conditionals(self, ac_id: str, ac_text: str) -> Optional[LanguageIssue]:
        """Use LLM to analyze complex conditional logic"""
        
        # Only check if there are conditionals present
        if not any(word in ac_text.lower() for word in ["if", "when", "unless", "depending", "based on"]):
            return None
        
        llm_prompt = f"""
Analyze the conditional logic in this acceptance criterion:

"{ac_text}"

Questions:
1. Are the conditions clearly defined?
2. Are the expected behaviors for each condition clear?
3. Would a tester know exactly what to verify?

Respond with JSON:
{{
  "clear_logic": true/false,
  "issues": ["issue 1", "issue 2"],
  "suggestion": "specific improvement"
}}
"""
        
        # Make real LLM call using the prompt above
        llm_response = make_llm_call(llm_prompt, expect_json=True)
        
        # Handle LLM response failure gracefully
        if not llm_response:
            print(f"   ⚠️ LLM call failed for conditional check on {ac_id}")
            return None
        
        if not llm_response.get("clear_logic"):
            return LanguageIssue(
                failure_type=FailureType.UNCLEAR_CONDITIONALS,
                severity=Severity.MEDIUM,
                ac_id=ac_id,
                detected_pattern="Complex conditional logic",
                context=ac_text[:100] + "...",
                suggestion=llm_response.get("suggestion", "Clarify conditional logic"),
                location="Conditional statements",
                eval_method=EvalMethod.LLM_BASED,
                confidence=0.80
            )
        
        return None
    
    # ===== LLM SIMULATION METHODS (Replace with real LLM calls) =====
    
    # ===== REMOVED FAKE LLM SIMULATION METHODS =====
    # All _simulate_llm_* methods have been replaced with real LLM calls above
    
    # ===== UTILITY METHODS =====
    
    def _extract_context(self, text: str, start: int, end: int, window: int = 30) -> str:
        """Extract context around a match"""
        context_start = max(0, start - window)
        context_end = min(len(text), end + window)
        return f"...{text[context_start:context_end].strip()}..."
    
    def _extract_context_around_term(self, text: str, term: str) -> str:
        """Extract context around a specific term"""
        text_lower = text.lower()
        term_index = text_lower.find(term)
        if term_index == -1:
            return text[:50] + "..."
        
        start = max(0, term_index - 20)
        end = min(len(text), term_index + len(term) + 20)
        return f"...{text[start:end].strip()}..."
    
    def _calculate_ac_score(self, issues: List[LanguageIssue]) -> float:
        """Calculate score with confidence weighting"""
        if not issues:
            return 100.0
        
        penalty = 0
        for issue in issues:
            # Weight penalty by confidence (LLM issues get slightly less penalty)
            base_penalty = {
                Severity.CRITICAL: 40,
                Severity.HIGH: 25,
                Severity.MEDIUM: 15,
                Severity.LOW: 5
            }[issue.severity]
            
            weighted_penalty = base_penalty * issue.confidence
            penalty += weighted_penalty
        
        return max(0, 100 - penalty)
    
    def _generate_recommendations(self, issues: List[LanguageIssue]) -> List[str]:
        """Generate recommendations with method breakdown"""
        recommendations = []
        
        code_issues = [i for i in issues if i.eval_method == EvalMethod.CODE_BASED]
        llm_issues = [i for i in issues if i.eval_method == EvalMethod.LLM_BASED]
        
        if code_issues:
            recommendations.append(f"🎯 Fix {len(code_issues)} clear pattern issues (high confidence)")
        
        if llm_issues:
            recommendations.append(f"🤖 Review {len(llm_issues)} contextual issues (AI-identified)")
        
        # Specific recommendations by type
        issue_counts = {}
        for issue in issues:
            issue_counts[issue.failure_type] = issue_counts.get(issue.failure_type, 0) + 1
        
        if FailureType.VAGUE_TERMS in issue_counts:
            count = issue_counts[FailureType.VAGUE_TERMS]
            recommendations.append(f"✏️ Replace {count} vague terms with specific criteria")
        
        if FailureType.MULTIPLE_BEHAVIORS in issue_counts:
            count = issue_counts[FailureType.MULTIPLE_BEHAVIORS]
            recommendations.append(f"✂️ Split {count} ACs to focus on single behaviors")
            
        if FailureType.IMPLEMENTATION_CONTAMINATION in issue_counts:
            count = issue_counts[FailureType.IMPLEMENTATION_CONTAMINATION]
            recommendations.append(f"🔧 Remove {count} implementation details and focus on user behaviors")
        
        return recommendations

# ===== TASK 1 INTEGRATION (Same as before) =====

class Task1ExecutionEngine:
    """Task 1 integration with hybrid evaluation"""
    
    def __init__(self):
        self.evaluator = HybridGate1Evaluator()
    
    def execute_task1(self, ticket_id: str) -> TaskExecutionContext:
        """Main Task 1 execution with hybrid eval"""
        
        print(f"📋 Loading ticket {ticket_id}...")
        ticket_data = self._load_ticket_data(ticket_id)
        
        print("🔍 Running hybrid Gate 1 evaluation...")
        print("   - Code patterns: vague terms, external refs...")
        print("   - LLM analysis: multiple behaviors, context...")
        
        eval_result = self._run_hybrid_evaluation(ticket_data)
        
        context = TaskExecutionContext(
            ticket_id=ticket_id,
            ticket_data=ticket_data,
            eval_result=eval_result
        )
        
        self._present_hybrid_results(context)
        
        return context
    
    def _run_hybrid_evaluation(self, ticket_data: Dict) -> Gate1EvalResult:
        """Run the hybrid evaluation"""
        acceptance_criteria = []
        for i, ac in enumerate(ticket_data.get('acceptance_criteria', [])):
            acceptance_criteria.append({
                'id': ac.get('id', f"AC-{i+1}"),
                'text': ac.get('description', ac.get('summary', ''))
            })
        
        return self.evaluator.evaluate_acceptance_criteria(acceptance_criteria)
    
    def _present_hybrid_results(self, context: TaskExecutionContext):
        """Present hybrid evaluation results"""
        
        eval_result = context.eval_result
        
        print(f"\n📊 **Hybrid Gate 1 Results:**")
        print(f"**Overall Score**: {eval_result.score:.1f}/100 {'✅ PASSED' if eval_result.passed else '❌ FAILED'}")
        print(f"**Analysis Method**: {eval_result.eval_breakdown['code']} code + {eval_result.eval_breakdown['llm']} LLM issues")
        print()
        
        # Show breakdown by detection method
        code_issues = [i for i in eval_result.detailed_issues if i.eval_method == EvalMethod.CODE_BASED]
        llm_issues = [i for i in eval_result.detailed_issues if i.eval_method == EvalMethod.LLM_BASED]
        
        if code_issues:
            print("🎯 **Code-Detected Issues** (High Confidence):")
            for issue in code_issues:
                print(f"   - {issue.ac_id}: '{issue.detected_pattern}' → {issue.suggestion}")
        
        if llm_issues:
            print("🤖 **LLM-Identified Issues** (Contextual Analysis):")
            for issue in llm_issues:
                confidence_str = f" ({issue.confidence:.0%} confidence)" if issue.confidence < 1.0 else ""
                print(f"   - {issue.ac_id}: {issue.detected_pattern} → {issue.suggestion}{confidence_str}")
        
        # Present user choices
        print(f"""
**Recommendations**: 
{chr(10).join(f'   {rec}' for rec in eval_result.recommendations)}

**Available Actions:**
1. 🟢 **Proceed Anyway** - Continue with current requirements
2. 🔧 **Apply SRP Fixes** - Auto-fix compound ACs  
3. 👀 **Show Preview** - See sample scenarios
4. 🛑 **Stop and Fix** - Address issues first
5. 📋 **More Details** - Full hybrid analysis breakdown

What would you like to do?
""")
        
        # Simulate user choice and processing
        user_choice = UserChoice.PROCEED_ANYWAY if eval_result.score >= 70 else UserChoice.APPLY_SRP
        context.user_choice = user_choice
        context.should_continue = True
        
        print(f"User chose: {user_choice.value}")
    
    def _load_ticket_data(self, ticket_id: str) -> Dict[str, Any]:
        """Mock ticket loading with table format"""
        return {
            "key": ticket_id,
            "acceptance_criteria": [
                {
                    "id": "AC-001",
                    "description": "|| Given || When || Then ||\n| User on package page | User selects appropriate package | Package is highlighted\nPrice updates\nConfirmation appears |"
                },
                {
                    "id": "AC-002", 
                    "description": "Given user has valid postcode, when they submit form, then confirmation appears"
                }
            ]
        }

# ===== DEMO =====

def run_hybrid_demo():
    """Demonstrate the hybrid evaluation approach"""
    print("🎯 Hybrid Gate 1 Evaluation Demo")
    print("=" * 50)
    print("Code handles: vague terms, external refs, obvious conditionals")
    print("LLM handles: multiple behaviors, contextual vagueness, complex logic")
    print()
    
    engine = Task1ExecutionEngine()
    context = engine.execute_task1("DIGILBB-12345")
    
    print(f"\n📊 **Final Result:**")
    print(f"   Quality Score: {context.eval_result.score:.1f}/100")
    print(f"   Detection Methods: {context.eval_result.eval_breakdown}")
    print(f"   Should Continue: {context.should_continue}")

if __name__ == "__main__":
    run_hybrid_demo()