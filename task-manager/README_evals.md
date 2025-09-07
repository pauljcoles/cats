# Task Manager Eval System

**Teresa Torres-inspired evaluation system** for systematic AI quality measurement and improvement.

## Quick Start

```bash
# Test the original eval system with existing examples
python3 test_evals_demo.py

# NEW: Test complete BA evaluation system
python3 -m pytest test_ba_evals.py -v

# Test just the BA workflow with real Mercedes data
python3 -m pytest test_ba_evals.py::TestBAWorkflow::test_end_to_end_ba_workflow_with_real_data -v

# Open the full analysis notebook
jupyter notebook eval_runner.ipynb
```

## What This Gives You

✅ **Catch AI Hallucinations**: Detect when AI invents requirements not in tickets  
✅ **Prevent Implementation Contamination**: Flag technical details in BDD scenarios  
✅ **Maintain Quality Standards**: Ensure BDD scenarios follow your gold standard  
✅ **Validate BA Workflows**: Complete specification analysis and story generation quality  
✅ **INVEST Compliance**: Ensure user stories meet >0.8 INVEST criteria threshold  
✅ **Track Improvements**: Measure AI quality changes over time  
✅ **Fast Feedback Loops**: Run evals after every AI prompt/model change  

## Demo Results

The system successfully distinguishes quality across both traditional and BA workflows:

### Original BDD Evaluation Results
- **CARCONF-104 (good)**: 75% pass rate
- **CARCONF-106 (poor)**: 25% pass rate  

Key catches:
- ❌ Requirement invention: "should also see engine comparison recommendations"
- ❌ Implementation contamination: React, Redux, API details in scenarios
- ❌ Missing user-observable outcomes in technical scenarios

### NEW: BA Workflow Evaluation Results
- **SPECMERCEDES-001**: Complete BA pipeline evaluation
  - Generated 63 user stories with 0.98 average INVEST score
  - All stories properly traced to specification personas
  - 189 quality acceptance criteria validated
  - Domain consistency maintained (Mercedes terminology)
  - Quality feedback loops scoring 0.96/1.0

Key BA quality validations:
- ✅ INVEST compliance >0.8 threshold met for all stories
- ✅ End-to-end specification-to-story traceability confirmed  
- ✅ Given-When-Then acceptance criteria structure validated
- ⚠️ Specification structure issues identified for improvement

## Architecture

```
evals/
├── core.py                    # Basic eval infrastructure
├── spec_analysis_evals.py     # NEW: Specification analysis quality checks
├── story_generation_evals.py  # NEW: INVEST compliance and story quality
├── ba_workflow_evals.py       # NEW: End-to-end BA workflow validation
├── task2_bdd_evals.py        # BDD generation quality checks
├── task3a_assessment_evals.py # Assessment decision validation  
├── cross_task_evals.py       # P0 preservation, traceability
├── trace_logging.py          # Capture task inputs/outputs
└── annotation_tools.py       # Human labeling for eval validation

traces/                        # CSV files with execution data
annotations/                   # Human labels for eval accuracy
eval_runner.ipynb             # Teresa's notebook approach
test_evals_demo.py            # Quick demonstration
test_ba_evals.py              # NEW: Comprehensive BA evaluation tests
```

## Core Evals

### NEW: Business Analyst Workflow Evaluation

#### Specification Analysis
- **`eval_persona_extraction_completeness`** - Validates complete persona data (role, motivations, context)
- **`eval_business_goal_clarity`** - Ensures goals have measurable success criteria and metrics
- **`eval_specification_structure`** - Checks structural integrity of specification components

#### Story Generation Quality  
- **`eval_invest_compliance_threshold`** - Validates stories meet >0.8 INVEST criteria (leverages existing invest_score)
- **`eval_story_traceability`** - Ensures stories properly map to specification personas
- **`eval_acceptance_criteria_quality`** - Validates Given-When-Then BDD structure and testability

#### End-to-End BA Workflow
- **`eval_specification_to_story_flow`** - Complete pipeline validation with quality scoring
- **`eval_domain_context_consistency`** - Validates domain-specific terminology (Mercedes/BMW/etc.)
- **`eval_quality_feedback_loops`** - Meta-evaluation of actionable improvement recommendations

### Task 2 BDD Generation
- **`eval_no_requirement_invention`** - Catches AI adding features not in ticket
- **`eval_implementation_contamination`** - Flags technical details in scenarios  
- **`eval_domain_consistency`** - BMW vs Mercedes equivalent structures
- **`eval_bdd_gold_standard_compliance`** - Follows your BDD patterns

### Task 3a Assessment  
- **`eval_automation_decisions`** - Correct include/exclude choices
- **`eval_assessment_criteria_adherence`** - Uses documented criteria
- **`eval_rationale_quality`** - Clear reasoning for decisions

### Cross-Task
- **`eval_p0_preservation`** - Never lose core requirements
- **`eval_traceability`** - Everything maps back to original ticket
- **`eval_priority_consistency`** - Classifications stay consistent

## Integration with Your Workflow

### NEW: BA Workflow Integration

#### Run Complete BA Pipeline Evaluation

```python
# Test complete specification-to-story workflow
from src.parsing.specification_parser import SpecificationParser
from src.generation.story_generator import StoryGenerator
from evals.ba_workflow_evals import eval_specification_to_story_flow

parser = SpecificationParser()
generator = StoryGenerator()

# Parse specification and generate stories
spec_data = parser.parse_specification(spec_content, 'SPEC-001')
stories = generator.generate_stories_from_spec(spec_data, 'mercedes')

# Comprehensive workflow evaluation
result = eval_specification_to_story_flow(spec_data, stories)
if result.status == "PASS":
    print(f"✅ BA workflow validated: {result.message}")
else:
    print(f"⚠️ BA workflow issues: {result.message}")
    # Check details for specific evaluation breakdowns
```

#### Run pytest BA Evaluation Suite

```bash
# Run complete BA evaluation test suite
python3 -m pytest test_ba_evals.py -v

# Run specific evaluation category
python3 -m pytest test_ba_evals.py::TestSpecificationAnalysis -v

# Run with real specification data
python3 -m pytest test_ba_evals.py::TestBAWorkflow::test_end_to_end_ba_workflow_with_real_data -v
```

### 1. Add Trace Logging

```python
from evals.trace_logging import task_tracer

# In your task execution
with task_tracer("task2_bdd", "CARCONF-104") as tracer:
    tracer.log_input("ticket", ticket_content)
    tracer.log_input("domain_config", domain_config)
    
    # Your AI execution
    bdd_scenarios = generate_bdd(ticket_content, domain_config)
    
    tracer.log_output("bdd_scenarios", bdd_scenarios)
    # Trace automatically saved with execution metrics
```

### 2. Run Evals After Changes

```python
from evals.core import run_eval
from evals.task2_bdd_evals import eval_no_requirement_invention

# Test your latest AI output
result = run_eval(eval_no_requirement_invention, bdd_scenarios, ticket_content)

if result.failed:
    print(f"⚠️ Quality issue: {result.message}")
    # Fix prompts/model before releasing
```

### 3. Validate Eval Accuracy

```python
from evals.annotation_tools import quick_annotate

# Label traces for eval validation
quick_annotate("trace_123", "task2_bdd", "FAIL", 
              notes="AI invented payment feature",
              failure_modes=["requirement_invention"])
```

## Teresa's Key Insights Applied

**"I know when I can measure something I can improve it"**
- Systematic measurement instead of "vibe checking"  
- Clear pass/fail criteria for AI quality
- Data-driven improvement decisions

**Start Simple, Add Complexity**
- CSV storage instead of complex frameworks
- Basic Python functions before sophisticated tools
- Domain knowledge over generic solutions

**Fast Feedback Loops**
- Run evals after every change
- Immediate quality signals
- Prevent quality regressions

**Human Judgment on Final Decisions**
- AI identifies issues, humans decide priorities
- Eval validation through human annotation
- Context-smart eval design needs domain expertise

## Next Steps

1. **Integration**: Add trace logging to your task execution
2. **Baseline**: Run evals on existing good/poor examples  
3. **Iteration**: Use eval failures to guide AI improvements
4. **Validation**: Annotate failures to check eval accuracy
5. **Expansion**: Add more evals as you find new failure modes

## Files Generated

- `traces/` - Execution data for analysis
- `annotations/` - Human quality labels  
- `eval_exports/` - Results for further analysis
- Sample traces created from your CARCONF examples

**Result**: Transform your task manager from "hoping AI works" to "knowing AI quality" with systematic measurement and improvement.