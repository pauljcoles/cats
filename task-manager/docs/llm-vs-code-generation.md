# LLM vs Code-Based Story Generation Analysis

## Current Implementation (Code-Based)

**Location**: `src/generation/story_generator.py`

**Approach**:
- Pure Python string manipulation and templates
- Deterministic pattern matching for validation
- Hard-coded story format: `f"As a {persona}, I want to {motivation} so that {goal}"`
- Loads 933-line gojko-adzic-patterns.json but uses minimal fragments
- Domain substitution via simple `.replace()` operations

**Limitations**:
- Formulaic, repetitive stories
- Limited creativity and natural variation
- Hard to handle nuanced requirements
- Context Rot: Loads massive pattern files for minimal usage
- Pattern matching misses contextual subtleties

**Example Output**:
```
"As a Premium Car Buyer, I want to easily explore luxury options so that I can make informed decisions about premium package sales by 15% within 6 months"
```

## Proposed LLM-Driven Approach

**Location**: `src/output/` (to be implemented)

**Approach**:
1. **Parse & Portion**: Read spec → break into story candidates
2. **Context Smart Prompting**: For each story candidate, load only relevant rules
3. **Focused LLM Calls**: `"Story candidate + specific rules → improve this story"`
4. **Natural Generation**: LLM crafts contextually appropriate stories
5. **Minimal Context**: Avoid Context Rot by sending only needed rules per story

**Advantages**:
- Natural, varied language generation
- Contextual understanding of requirements
- Handles edge cases and nuanced scenarios
- Better story quality and readability
- Context Smart: Each LLM call gets only needed rules (vs 933-line dump)

**Architecture**:
```python
def generate_story_via_llm(story_candidate, focused_rules):
    prompt = f"Story candidate: {story_candidate}\nApply these specific rules: {focused_rules}"
    # Send to LLM with minimal context
    return polished_story
```

## Context Smartness Comparison

**Current (Context Rot)**:
- Loads entire 933-line gojko-adzic-patterns.json
- Uses maybe 5-10 lines per story
- Violates "Context Smartness" principle from articles

**Proposed (Context Smart)**:
- Load only relevant rules per story (e.g., 50 lines max)
- Each story gets focused context
- Follows task-based architecture: focused context loading
- Aligns with "Context Extraction → Generation" workflow

## Implementation Plan

1. **Story Candidating**: Parse spec into story opportunities
2. **Rule Selection**: Choose relevant patterns per story type
3. **LLM Prompting**: Send minimal, focused prompts
4. **Quality Gates**: Apply validation to LLM outputs
5. **Output Formatting**: Generate Jira-ready tickets

## Decision Points

- **Cost vs Quality**: LLM calls vs deterministic code
- **Speed vs Flexibility**: Multiple API calls vs instant generation
- **Context Management**: Smart loading vs comprehensive patterns
- **Consistency**: Natural variation vs template uniformity

---

*Documented during context-based codebase reorganization session*
*Next: User requested to work on something else before implementing*