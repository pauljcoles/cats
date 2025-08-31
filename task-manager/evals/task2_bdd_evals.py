"""
Task 2 BDD Generation Evaluations

These evals check the quality of BDD scenarios generated from tickets.
Focus areas:
1. Requirement invention (AI adding features not in ticket)  
2. Implementation contamination (technical details in scenarios)
3. Domain consistency (BMW vs Mercedes equivalent structures)

Following Teresa's insight: domain expertise is crucial for good evals.
"""

from typing import Dict, List, Any
from .core import EvalResult, extract_features_from_text, extract_ticket_requirements

def eval_no_requirement_invention(generated_scenarios: str, original_ticket: str) -> EvalResult:
    """
    Teresa's biggest fear applied to BDD: Does the AI invent requirements not in the ticket?
    
    This is like Teresa's "leading questions" eval - catches a critical failure mode
    that could mislead users (in this case, testing things that weren't requested).
    """
    try:
        # Extract features mentioned in generated scenarios
        scenario_features = extract_features_from_text(generated_scenarios)
        
        # Extract requirements from original ticket
        ticket_requirements = extract_ticket_requirements(original_ticket)
        
        # Simple approach first: look for expansion signals
        # These phrases often indicate the AI is adding scope
        expansion_signals = [
            "should also", "additionally", "furthermore", "moreover",
            "in addition to", "as well as", "could also", "might also",
            "and should", "and must", "and will"
        ]
        
        for signal in expansion_signals:
            if signal.lower() in generated_scenarios.lower():
                return EvalResult(
                    eval_name="eval_no_requirement_invention",
                    status="FAIL",
                    message=f"Possible scope expansion detected: '{signal}'",
                    details={"expansion_signal": signal}
                )
        
        # Check for common invented features in configurator domain
        # Based on your domain knowledge from the examples
        invented_features = [
            "payment", "checkout", "cart", "wishlist", "comparison",
            "recommendations", "reviews", "ratings", "social sharing",
            "export", "save configuration", "print", "email"
        ]
        
        for feature in invented_features:
            if feature.lower() in generated_scenarios.lower():
                # Check if this feature is mentioned in the ticket
                if feature.lower() not in original_ticket.lower():
                    return EvalResult(
                        eval_name="eval_no_requirement_invention",
                        status="FAIL",
                        message=f"Invented feature not in ticket: '{feature}'",
                        details={"invented_feature": feature}
                    )
        
        return EvalResult(
            eval_name="eval_no_requirement_invention",
            status="PASS",
            message="No requirement invention detected"
        )
        
    except Exception as e:
        return EvalResult(
            eval_name="eval_no_requirement_invention",
            status="FAIL",
            message=f"Eval crashed: {str(e)}"
        )

def eval_implementation_contamination(generated_scenarios: str) -> EvalResult:
    """
    Based on your existing unit tests - catches implementation details in BDD scenarios.
    
    This is like Teresa's simple keyword check - very effective and no false positives.
    """
    # Implementation contamination keywords from your domain knowledge
    implementation_flags = [
        # Backend/API terms
        "api", "endpoint", "post", "get", "put", "delete", "rest", "graphql",
        "database", "sql", "query", "table", "schema", "migration",
        "service", "microservice", "lambda", "function", "method",
        
        # Frontend/Technical terms  
        "component", "react", "vue", "angular", "javascript", "typescript",
        "dom", "element", "selector", "css", "html", "render",
        "state", "props", "hook", "reducer", "redux",
        
        # Infrastructure terms
        "docker", "kubernetes", "aws", "cloud", "server", "deployment",
        "configuration", "environment", "variable", "secret",
        
        # Testing implementation terms
        "mock", "stub", "spy", "assertion", "expect", "should", "verify"
    ]
    
    contamination_found = []
    
    for flag in implementation_flags:
        if flag.lower() in generated_scenarios.lower():
            contamination_found.append(flag)
    
    if contamination_found:
        return EvalResult(
            eval_name="eval_implementation_contamination", 
            status="FAIL",
            message=f"Implementation details detected: {contamination_found}",
            details={"contamination_terms": contamination_found}
        )
    
    return EvalResult(
        eval_name="eval_implementation_contamination",
        status="PASS", 
        message="No implementation contamination detected"
    )

def eval_domain_consistency(bmw_scenarios: str, mercedes_scenarios: str) -> EvalResult:
    """
    Check that BMW vs Mercedes generate equivalent scenario structures.
    
    Based on your "universal patterns with domain configuration" principle.
    The business logic should be the same, only data values should differ.
    """
    try:
        # Extract scenario structures (ignoring domain-specific values)
        bmw_structure = extract_scenario_structure(bmw_scenarios)
        mercedes_structure = extract_scenario_structure(mercedes_scenarios)
        
        # Compare structures
        if bmw_structure != mercedes_structure:
            return EvalResult(
                eval_name="eval_domain_consistency",
                status="FAIL", 
                message="BMW and Mercedes scenarios have different structures",
                details={
                    "bmw_structure": bmw_structure,
                    "mercedes_structure": mercedes_structure
                }
            )
        
        return EvalResult(
            eval_name="eval_domain_consistency",
            status="PASS",
            message="Domain scenarios have consistent structure"
        )
        
    except Exception as e:
        return EvalResult(
            eval_name="eval_domain_consistency",
            status="FAIL",
            message=f"Eval crashed: {str(e)}"
        )

def extract_scenario_structure(scenarios: str) -> List[str]:
    """
    Extract the structural pattern of scenarios, ignoring domain-specific values.
    
    This looks for Given-When-Then patterns and action types, not specific values.
    """
    import re
    
    # Find all Given-When-Then blocks
    gwt_pattern = r'(Given|When|Then)\s+([^\n]+)'
    matches = re.findall(gwt_pattern, scenarios)
    
    structure = []
    for step_type, step_text in matches:
        # Normalize step text to remove domain-specific values
        normalized = normalize_step_text(step_text)
        structure.append(f"{step_type}: {normalized}")
    
    return structure

def normalize_step_text(step_text: str) -> str:
    """
    Replace domain-specific values with placeholders to focus on structure.
    
    Example: "user selects Polar White color" -> "user selects [COLOR]"
    """
    import re
    
    # Domain value patterns from your configs
    patterns = [
        (r'"[^"]*"', '[QUOTED_VALUE]'),
        (r'\b(?:red|blue|white|black|silver|gray|grey)\b', '[COLOR]'),
        (r'\b(?:bmw|mercedes|renault|audi)\b', '[BRAND]'),
        (r'\b(?:sedan|suv|coupe|hatchback)\b', '[BODY_TYPE]'),
        (r'\b\d+(?:\.\d+)?\s*(?:l|liter|hp|horsepower)\b', '[ENGINE_SPEC]'),
        (r'\b\d+(?:,\d{3})*(?:\.\d{2})?\s*(?:€|$|£)\b', '[PRICE]')
    ]
    
    normalized = step_text.lower()
    for pattern, replacement in patterns:
        normalized = re.sub(pattern, replacement, normalized, flags=re.IGNORECASE)
    
    return normalized

def eval_bdd_gold_standard_compliance(generated_scenarios: str) -> EvalResult:
    """
    Check compliance with your BDD-GOLD-STANDARD.md patterns.
    
    Based on your existing gold standard examples.
    """
    # Check for proper Given-When-Then structure
    import re
    
    if not re.search(r'Given\s+.*When\s+.*Then\s+', generated_scenarios, re.IGNORECASE | re.DOTALL):
        return EvalResult(
            eval_name="eval_bdd_gold_standard_compliance",
            status="FAIL",
            message="Missing proper Given-When-Then structure"
        )
    
    # Check for user-observable outcomes (not implementation details)
    user_observable_patterns = [
        r'user sees', r'user is shown', r'user can view',
        r'displays?', r'shows?', r'visible', r'appears?'
    ]
    
    has_observable = any(re.search(pattern, generated_scenarios, re.IGNORECASE) 
                        for pattern in user_observable_patterns)
    
    if not has_observable:
        return EvalResult(
            eval_name="eval_bdd_gold_standard_compliance", 
            status="FAIL",
            message="Scenarios lack user-observable outcomes"
        )
    
    return EvalResult(
        eval_name="eval_bdd_gold_standard_compliance",
        status="PASS",
        message="Scenarios comply with BDD gold standard"
    )