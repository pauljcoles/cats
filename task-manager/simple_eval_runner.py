#!/usr/bin/env python3
"""
Simple Eval Runner (No Dependencies)

A basic version of the eval runner that doesn't require pandas/matplotlib.
Uses only standard Python libraries for analysis.
"""

import sys
import os
import json
import csv
from datetime import datetime
from collections import defaultdict

# Add evals to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'evals'))

from evals.core import run_eval
from evals.trace_logging import TraceLogger
from evals.task2_bdd_evals import (
    eval_no_requirement_invention,
    eval_implementation_contamination,
    eval_bdd_gold_standard_compliance
)
from evals.cross_task_evals import eval_traceability

def load_traces():
    """Load traces from the trace logging system."""
    trace_logger = TraceLogger()
    traces = trace_logger.load_traces()
    print(f"📁 Loaded {len(traces)} traces")
    return traces

def run_evals_on_traces(traces):
    """Run all applicable evals on traces."""
    print("🧪 Running evals on all traces...")
    
    all_results = []
    
    for i, trace in enumerate(traces):
        print(f"  Processing trace {i+1}/{len(traces)}: {trace.trace_id}")
        
        if trace.task_name == "task2_bdd":
            ticket_content = trace.inputs.get("ticket_content", "")
            bdd_scenarios = trace.outputs.get("bdd_scenarios", "")
            
            # Run Task 2 BDD evals
            evals_to_run = [
                ("requirement_invention", eval_no_requirement_invention, [bdd_scenarios, ticket_content]),
                ("implementation_contamination", eval_implementation_contamination, [bdd_scenarios]),
                ("bdd_gold_standard", eval_bdd_gold_standard_compliance, [bdd_scenarios]),
                ("traceability", eval_traceability, [bdd_scenarios, ticket_content])
            ]
            
            for eval_name, eval_func, args in evals_to_run:
                result = run_eval(eval_func, *args)
                
                all_results.append({
                    "trace_id": trace.trace_id,
                    "task_name": trace.task_name,
                    "ticket_id": trace.ticket_id,
                    "eval_name": eval_name,
                    "status": result.status,
                    "message": result.message,
                    "timestamp": result.timestamp.isoformat()
                })
    
    print(f"✓ Completed {len(all_results)} evaluations")
    return all_results

def analyze_results(results):
    """Analyze eval results without pandas."""
    print("\n📊 EVAL RESULTS ANALYSIS")
    print("=" * 60)
    
    if not results:
        print("No results to analyze")
        return
    
    # Overall stats
    total_evals = len(results)
    passed_evals = sum(1 for r in results if r['status'] == 'PASS')
    failed_evals = total_evals - passed_evals
    
    print(f"Overall Results:")
    print(f"  Total evaluations: {total_evals}")
    print(f"  Passed: {passed_evals} ({passed_evals/total_evals:.1%})")
    print(f"  Failed: {failed_evals} ({failed_evals/total_evals:.1%})")
    
    # Results by eval type
    print(f"\nResults by Eval Type:")
    eval_stats = defaultdict(lambda: {"PASS": 0, "FAIL": 0})
    
    for result in results:
        eval_stats[result['eval_name']][result['status']] += 1
    
    for eval_name, stats in eval_stats.items():
        total = stats["PASS"] + stats["FAIL"]
        pass_rate = stats["PASS"] / total if total > 0 else 0
        print(f"  {eval_name}:")
        print(f"    PASS: {stats['PASS']} ({pass_rate:.1%})")
        print(f"    FAIL: {stats['FAIL']} ({(1-pass_rate):.1%})")
    
    # Results by ticket
    print(f"\nResults by Ticket:")
    ticket_stats = defaultdict(lambda: {"PASS": 0, "FAIL": 0, "evals": []})
    
    for result in results:
        ticket_stats[result['ticket_id']][result['status']] += 1
        ticket_stats[result['ticket_id']]['evals'].append(f"{result['eval_name']}:{result['status']}")
    
    for ticket_id, stats in ticket_stats.items():
        total = stats["PASS"] + stats["FAIL"]
        pass_rate = stats["PASS"] / total if total > 0 else 0
        print(f"  {ticket_id}: {stats['PASS']}/{total} passed ({pass_rate:.1%})")
        
        # Show failures for this ticket
        failures = [e for e in stats['evals'] if e.endswith(':FAIL')]
        if failures:
            print(f"    Failures: {', '.join([f.split(':')[0] for f in failures])}")

def investigate_failures(results, traces):
    """Investigate specific failures."""
    print(f"\n🔍 FAILURE INVESTIGATION")
    print("=" * 60)
    
    failures = [r for r in results if r['status'] == 'FAIL']
    
    if not failures:
        print("🎉 No failures found! All evals passing.")
        return
    
    print(f"Found {len(failures)} failures to investigate:")
    
    for failure in failures[:5]:  # Show first 5 failures
        print(f"\n❌ FAILURE: {failure['trace_id']}")
        print(f"   Eval: {failure['eval_name']}")
        print(f"   Message: {failure['message']}")
        
        # Find the original trace
        trace = next((t for t in traces if t.trace_id == failure['trace_id']), None)
        
        if trace and "bdd_scenarios" in trace.outputs:
            scenarios = trace.outputs["bdd_scenarios"]
            print(f"   Generated BDD (first 200 chars):")
            print(f"   └─ {scenarios[:200]}...")

def create_simple_table(results):
    """Create a simple text table of results."""
    print(f"\n📋 RESULTS TABLE")
    print("=" * 80)
    
    # Group by trace_id
    trace_results = defaultdict(dict)
    
    for result in results:
        trace_results[result['trace_id']][result['eval_name']] = result['status']
    
    # Get all eval names
    all_eval_names = set()
    for result in results:
        all_eval_names.add(result['eval_name'])
    
    eval_names = sorted(all_eval_names)
    
    # Print header
    header = f"{'Trace':<25} {'Ticket':<15}"
    for eval_name in eval_names:
        header += f" {eval_name[:12]:<12}"
    print(header)
    print("-" * len(header))
    
    # Print results
    for trace_id, evals in trace_results.items():
        # Get ticket ID
        ticket_id = next((r['ticket_id'] for r in results if r['trace_id'] == trace_id), "")
        
        row = f"{trace_id[:24]:<25} {ticket_id:<15}"
        for eval_name in eval_names:
            status = evals.get(eval_name, "N/A")
            symbol = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⚪"
            row += f" {symbol:<12}"
        print(row)

def export_results(results):
    """Export results to CSV."""
    if not results:
        print("No results to export")
        return
    
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"eval_results_{timestamp}.csv"
    
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        if results:
            writer = csv.DictWriter(f, fieldnames=results[0].keys())
            writer.writeheader()
            writer.writerows(results)
    
    print(f"✓ Exported results to: {filename}")

def main():
    """Run the complete eval analysis."""
    print("🚀 SIMPLE EVAL RUNNER")
    print("=" * 50)
    print("No pandas required - basic Python analysis")
    
    # Load traces
    traces = load_traces()
    
    if not traces:
        print("❌ No traces found. Run test_evals_demo.py first to create sample traces.")
        return
    
    # Run evals
    results = run_evals_on_traces(traces)
    
    # Analyze results
    analyze_results(results)
    
    # Investigate failures
    investigate_failures(results, traces)
    
    # Create table
    create_simple_table(results)
    
    # Export results
    export_results(results)
    
    print(f"\n🎯 SUMMARY")
    print("=" * 30)
    print("✅ Eval system working - quality differences detected")
    print("✅ Results exported for further analysis")
    print("✅ Ready to integrate with your task manager workflow")
    
    print(f"\nNext steps:")
    print("1. Add trace logging to your task execution")
    print("2. Run evals after each AI change")
    print("3. Use failures to guide improvements")

if __name__ == "__main__":
    main()