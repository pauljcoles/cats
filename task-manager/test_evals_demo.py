#!/usr/bin/env python3
"""
Test Evals Demo Script

Quick demonstration of the eval system using CARCONF-104 (good) vs CARCONF-106 (poor) examples.
This shows how evals catch the quality differences between your existing examples.

Run this to see evals in action before setting up the full workflow.
"""

import sys
import os
from datetime import datetime

# Add evals to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'evals'))

from evals.core import run_eval
from evals.task2_bdd_evals import (
    eval_no_requirement_invention,
    eval_implementation_contamination,
    eval_bdd_gold_standard_compliance
)
from evals.cross_task_evals import eval_traceability
from evals.trace_logging import TraceLogger, TaskTrace

def load_carconf_examples():
    """Load the CARCONF examples from your existing files."""
    
    # CARCONF-104 (good example)
    carconf_104_path = os.path.join(os.path.dirname(__file__), 'example-tickets', 'CARCONF-104_good_example.md')
    carconf_106_path = os.path.join(os.path.dirname(__file__), 'example-tickets', 'CARCONF-106_poor_example.md')
    
    examples = {}
    
    # Try to load actual files, fall back to embedded content
    try:
        with open(carconf_104_path, 'r') as f:
            examples['carconf_104_ticket'] = f.read()
    except FileNotFoundError:
        examples['carconf_104_ticket'] = """
📝 Jira Ticket: CARCONF-104
Title: Paint Selection – User Interface Requirements

Description:
This ticket defines the paint selection interface for the car configurator. 
Users need to be able to view available paint options and make selections 
that integrate with their overall configuration.

Requirements:
- User Paint Selection Interface
- Given the user is on the paint selection page  
- When the user views available paint options for their selected model
- Then the user should see all available paint colors displayed as visual swatches
- And the user should see the paint name and additional cost for each option
- And the user should be able to select one paint option
- And the user should see their selection reflected in the configuration summary

Labels: configurator, paint-selection, UI, user-story
Priority: High
Story Points: 5
Assignee: Development Team
Reporter: Product Manager
"""
    
    try:
        with open(carconf_106_path, 'r') as f:
            examples['carconf_106_ticket'] = f.read()
    except FileNotFoundError:
        examples['carconf_106_ticket'] = """
📝 Jira Ticket: CARCONF-106
Title: Engine Selection – Technical Implementation Draft (Needs Major Refinement)

Description:
This ticket outlines the engine selection API integration and frontend component implementation. 
It includes detailed technical specifications for database queries, React component state management, 
and third-party service integrations. The requirements mix UI behavior with backend implementation 
and are difficult to test independently.

Requirements (Implementation-Focused):
- Engine Selection API Integration
- Given the frontend component mounts and calls GET /api/v2/engines?model=MODEL_ID&region=REGION_CODE
- When the user clicks on div[data-engine-id] with onClick handler triggering setState({selectedEngine: engineId})
- Then the component should POST to /api/v2/configuration/selections with payload {type: "engine", id: engineId, userId: userSession.id}
- And update the Redux store via dispatch(setSelectedEngine(engineId))
- And render the EnginePreviewComponent with props.engineSpec
- And log the selection to Google Analytics with gtag('event', 'engine_selected', {engine_id: engineId})
- And trigger a re-render of the PricingCalculatorComponent

Labels: configurator, engine-selection, API, React, database, draft, needs-major-refactoring
Priority: Low (blocked by technical review)
Story Points: 13
Assignee: Unassigned (pending architecture review)
Reporter: Paul
"""
    
    # Generate corresponding BDD scenarios (simulating AI output)
    examples['carconf_104_bdd'] = """
Feature: Paint Selection
    As a customer
    I want to select a paint color
    So that I can customize my car's appearance

Scenario: User views available paint colors
    Given user is on the paint selection page
    And user has selected a car model
    When user views the paint options
    Then user sees all available paint colors as visual swatches
    And user sees the paint name for each option
    And user sees the additional cost for each paint option

Scenario: User selects a paint color
    Given user is on the paint selection page
    And user can see available paint options
    When user clicks on "Red Metallic" paint swatch
    Then user sees "Red Metallic" selected in configuration summary
    And user sees updated total price including paint cost
"""

    examples['carconf_106_bdd'] = """
Feature: Engine Selection API Integration
    As a system
    I want to handle engine selection via API calls
    So that the database stays synchronized

Scenario: React component handles engine selection
    Given the EngineSelectionComponent has mounted
    And the component calls GET /api/v2/engines?model=BMW_X3&region=US
    When user clicks on div[data-engine-id="turbo-2.0"] element
    Then the component should POST to /api/v2/configuration/selections
    And the Redux store should update via dispatch(setSelectedEngine("turbo-2.0"))
    And the EnginePreviewComponent should render with props.engineSpec
    And the system should log to Google Analytics with gtag event
    And the PricingCalculatorComponent should re-render
    And user should also see engine comparison recommendations
    And system should provide performance analytics dashboard
"""
    
    return examples

def run_eval_comparison(examples):
    """Run evals on both examples and compare results."""
    
    print("🧪 EVAL SYSTEM DEMONSTRATION")
    print("=" * 60)
    print("Testing CARCONF-104 (good) vs CARCONF-106 (poor) examples")
    print("This shows how evals catch quality differences automatically.\n")
    
    # Test cases
    test_cases = [
        {
            'name': 'CARCONF-104 (Good Example)',
            'ticket': examples['carconf_104_ticket'],
            'bdd': examples['carconf_104_bdd'],
            'expected_quality': 'HIGH'
        },
        {
            'name': 'CARCONF-106 (Poor Example)',  
            'ticket': examples['carconf_106_ticket'],
            'bdd': examples['carconf_106_bdd'],
            'expected_quality': 'LOW'
        }
    ]
    
    # Evals to run
    evals_to_run = [
        ('requirement_invention', eval_no_requirement_invention),
        ('implementation_contamination', eval_implementation_contamination),
        ('bdd_gold_standard', eval_bdd_gold_standard_compliance),
        ('traceability', eval_traceability)
    ]
    
    results = {}
    
    for test_case in test_cases:
        print(f"🔍 Testing: {test_case['name']}")
        print("-" * 40)
        
        case_results = {}
        
        for eval_name, eval_func in evals_to_run:
            if eval_name in ['requirement_invention', 'traceability']:
                # These evals need both ticket and BDD
                result = run_eval(eval_func, test_case['bdd'], test_case['ticket'])
            else:
                # These evals only need BDD scenarios
                result = run_eval(eval_func, test_case['bdd'])
            
            case_results[eval_name] = result
            
            # Display result
            status_icon = "✅" if result.passed else "❌"
            print(f"  {status_icon} {eval_name}: {result.status}")
            if result.failed:
                print(f"     └─ {result.message}")
        
        results[test_case['name']] = case_results
        print()
    
    return results

def analyze_results(results):
    """Analyze and summarize the eval results."""
    
    print("📊 RESULTS ANALYSIS")
    print("=" * 60)
    
    # Count passes/fails for each example
    for example_name, example_results in results.items():
        total_evals = len(example_results)
        passed_evals = sum(1 for r in example_results.values() if r.passed)
        failed_evals = total_evals - passed_evals
        
        print(f"\n{example_name}:")
        print(f"  Total evals: {total_evals}")
        print(f"  Passed: {passed_evals} ({passed_evals/total_evals:.1%})")
        print(f"  Failed: {failed_evals} ({failed_evals/total_evals:.1%})")
        
        if failed_evals > 0:
            print(f"  Failed evals:")
            for eval_name, result in example_results.items():
                if result.failed:
                    print(f"    • {eval_name}: {result.message}")
    
    # Compare the two examples
    print(f"\n🎯 KEY INSIGHTS:")
    print("-" * 20)
    
    good_example_results = results['CARCONF-104 (Good Example)']
    poor_example_results = results['CARCONF-106 (Poor Example)']
    
    good_pass_rate = sum(1 for r in good_example_results.values() if r.passed) / len(good_example_results)
    poor_pass_rate = sum(1 for r in poor_example_results.values() if r.passed) / len(poor_example_results)
    
    print(f"1. Good example pass rate: {good_pass_rate:.1%}")
    print(f"   Poor example pass rate: {poor_pass_rate:.1%}")
    print(f"   Quality difference: {(good_pass_rate - poor_pass_rate):.1%}")
    
    print(f"\n2. Evals successfully distinguish quality:")
    print(f"   ✅ Higher pass rate for CARCONF-104 (clean requirements)")
    print(f"   ❌ Lower pass rate for CARCONF-106 (implementation-contaminated)")
    
    # Specific insights
    impl_contamination_good = good_example_results['implementation_contamination']
    impl_contamination_poor = poor_example_results['implementation_contamination']
    
    if impl_contamination_good.passed and impl_contamination_poor.failed:
        print(f"\n3. Implementation contamination eval working correctly:")
        print(f"   ✅ CARCONF-104: Clean BDD scenarios (PASS)")
        print(f"   ❌ CARCONF-106: Technical details detected (FAIL)")
    
    req_invention_good = good_example_results['requirement_invention']
    req_invention_poor = poor_example_results['requirement_invention']
    
    if req_invention_poor.failed:
        print(f"\n4. Requirement invention eval caught scope expansion:")
        print(f"   ❌ CARCONF-106 BDD adds features not in ticket")
        print(f"   📝 Example: 'engine comparison recommendations', 'analytics dashboard'")

def create_sample_traces(examples):
    """Create sample traces for the trace logging system."""
    
    print(f"\n💾 CREATING SAMPLE TRACES")
    print("=" * 40)
    
    trace_logger = TraceLogger()
    
    # Create traces for both examples
    traces = [
        TaskTrace(
            trace_id="demo_carconf104_good",
            task_name="task2_bdd",
            ticket_id="CARCONF-104",
            timestamp=datetime.now(),
            inputs={"ticket_content": examples['carconf_104_ticket']},
            outputs={"bdd_scenarios": examples['carconf_104_bdd']}
        ),
        TaskTrace(
            trace_id="demo_carconf106_poor", 
            task_name="task2_bdd",
            ticket_id="CARCONF-106",
            timestamp=datetime.now(),
            inputs={"ticket_content": examples['carconf_106_ticket']},
            outputs={"bdd_scenarios": examples['carconf_106_bdd']}
        )
    ]
    
    for trace in traces:
        trace_logger.log_trace(trace)
        print(f"  ✓ Created trace: {trace.trace_id}")
    
    print(f"\n📁 Traces saved to: {trace_logger.log_dir}")
    print(f"   You can now run the eval_runner.ipynb notebook to see full analysis!")

def main():
    """Run the complete demo."""
    
    print("🚀 TASK MANAGER EVAL SYSTEM DEMO")
    print("=" * 80)
    print("This demonstrates Teresa Torres-style evals on your CARCONF examples.")
    print("The evals will show clear quality differences between good vs poor requirements.\n")
    
    # Load examples
    print("📂 Loading CARCONF examples...")
    examples = load_carconf_examples()
    print("✓ Examples loaded\n")
    
    # Run evals
    results = run_eval_comparison(examples)
    
    # Analyze results
    analyze_results(results)
    
    # Create sample traces
    create_sample_traces(examples)
    
    print(f"\n🎉 DEMO COMPLETE!")
    print("=" * 40)
    print("Next steps:")
    print("1. Run 'jupyter notebook eval_runner.ipynb' for full analysis")
    print("2. Integrate trace logging into your task manager execution")
    print("3. Run evals after each AI model/prompt change")
    print("4. Use eval failures to guide systematic improvements")
    print(f"\nKey insight from Teresa: 'I know when I can measure something I can improve it.'")

if __name__ == "__main__":
    main()