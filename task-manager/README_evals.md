# Task Manager Eval System

**Teresa Torres-inspired evaluation system** for systematic AI quality measurement and improvement.

## Quick Start

```bash
# Test the eval system with your existing examples
python3 test_evals_demo.py

# Open the full analysis notebook
jupyter notebook eval_runner.ipynb
```

## What This Gives You

✅ **Catch AI Hallucinations**: Detect when AI invents requirements not in tickets  
✅ **Prevent Implementation Contamination**: Flag technical details in BDD scenarios  
✅ **Maintain Quality Standards**: Ensure BDD scenarios follow your gold standard  
✅ **Track Improvements**: Measure AI quality changes over time  
✅ **Fast Feedback Loops**: Run evals after every AI prompt/model change  

## Demo Results

The system successfully distinguishes quality:
- **CARCONF-104 (good)**: 75% pass rate
- **CARCONF-106 (poor)**: 25% pass rate  

Key catches:
- ❌ Requirement invention: "should also see engine comparison recommendations"
- ❌ Implementation contamination: React, Redux, API details in scenarios
- ❌ Missing user-observable outcomes in technical scenarios

## Architecture

```
evals/
├── core.py                    # Basic eval infrastructure
├── task2_bdd_evals.py        # BDD generation quality checks
├── task3a_assessment_evals.py # Assessment decision validation  
├── cross_task_evals.py       # P0 preservation, traceability
├── trace_logging.py          # Capture task inputs/outputs
└── annotation_tools.py       # Human labeling for eval validation

traces/                        # CSV files with execution data
annotations/                   # Human labels for eval accuracy
eval_runner.ipynb             # Teresa's notebook approach
test_evals_demo.py            # Quick demonstration
```

## Core Evals

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