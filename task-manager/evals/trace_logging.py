"""
Trace Logging System

Captures inputs and outputs for each task in the 4-task workflow.
Following Teresa's approach: simple data collection before complex analysis.

This creates the "traces" that evals will run against.
"""

import json
import csv
import os
from datetime import datetime
from typing import Dict, Any, Optional
from dataclasses import dataclass, asdict

@dataclass
class TaskTrace:
    """
    A trace captures one execution of a task.
    
    Similar to Teresa's interview transcripts - the raw data we'll evaluate.
    """
    trace_id: str
    task_name: str  # "task1_validation", "task2_bdd", "task3a_assessment", "task3b_automation"
    ticket_id: str
    timestamp: datetime
    inputs: Dict[str, Any]
    outputs: Dict[str, Any]
    metadata: Optional[Dict[str, Any]] = None
    
    def to_dict(self) -> Dict[str, Any]:
        result = asdict(self)
        result['timestamp'] = self.timestamp.isoformat()
        return result
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'TaskTrace':
        data['timestamp'] = datetime.fromisoformat(data['timestamp'])
        return cls(**data)

class TraceLogger:
    """
    Simple trace logging system.
    
    Stores traces in CSV format (Teresa's approach) for easy analysis.
    Can export to different formats as needed.
    """
    
    def __init__(self, log_dir: str = None):
        if log_dir is None:
            log_dir = os.path.join(os.path.dirname(__file__), '..', 'traces')
        
        self.log_dir = log_dir
        os.makedirs(log_dir, exist_ok=True)
        
        # Separate files for different tasks (easier analysis)
        self.trace_files = {
            'task1_validation': os.path.join(log_dir, 'task1_validation_traces.csv'),
            'task2_bdd': os.path.join(log_dir, 'task2_bdd_traces.csv'),
            'task3a_assessment': os.path.join(log_dir, 'task3a_assessment_traces.csv'),
            'task3b_automation': os.path.join(log_dir, 'task3b_automation_traces.csv'),
            'all_traces': os.path.join(log_dir, 'all_traces.csv')
        }
    
    def log_trace(self, trace: TaskTrace) -> None:
        """Log a single trace to appropriate files."""
        
        # Write to task-specific file
        task_file = self.trace_files.get(trace.task_name, self.trace_files['all_traces'])
        self._write_trace_to_csv(trace, task_file)
        
        # Also write to all_traces file
        if task_file != self.trace_files['all_traces']:
            self._write_trace_to_csv(trace, self.trace_files['all_traces'])
    
    def _write_trace_to_csv(self, trace: TaskTrace, filename: str) -> None:
        """Write a trace to CSV file."""
        file_exists = os.path.exists(filename)
        
        # Flatten the trace for CSV storage
        flattened = self._flatten_trace(trace)
        
        with open(filename, 'a', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=flattened.keys())
            
            if not file_exists:
                writer.writeheader()
            
            writer.writerow(flattened)
    
    def _flatten_trace(self, trace: TaskTrace) -> Dict[str, Any]:
        """Flatten trace data for CSV storage."""
        flattened = {
            'trace_id': trace.trace_id,
            'task_name': trace.task_name,
            'ticket_id': trace.ticket_id,
            'timestamp': trace.timestamp.isoformat(),
        }
        
        # Store complex data as JSON strings
        flattened['inputs_json'] = json.dumps(trace.inputs)
        flattened['outputs_json'] = json.dumps(trace.outputs)
        
        if trace.metadata:
            flattened['metadata_json'] = json.dumps(trace.metadata)
        
        # Extract key fields for easy CSV analysis
        if 'ticket_content' in trace.inputs:
            flattened['ticket_content'] = trace.inputs['ticket_content']
        
        if 'validation_result' in trace.outputs:
            flattened['validation_result'] = trace.outputs.get('validation_result', '')
        
        if 'bdd_scenarios' in trace.outputs:
            flattened['bdd_scenarios'] = trace.outputs.get('bdd_scenarios', '')
        
        return flattened
    
    def load_traces(self, task_name: str = None) -> list[TaskTrace]:
        """Load traces from CSV files."""
        if task_name:
            filename = self.trace_files.get(task_name, self.trace_files['all_traces'])
        else:
            filename = self.trace_files['all_traces']
        
        if not os.path.exists(filename):
            return []
        
        traces = []
        with open(filename, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            for row in reader:
                trace = self._unflatten_trace(row)
                traces.append(trace)
        
        return traces
    
    def _unflatten_trace(self, row: Dict[str, Any]) -> TaskTrace:
        """Reconstruct trace from CSV row."""
        inputs = json.loads(row['inputs_json'])
        outputs = json.loads(row['outputs_json'])
        metadata = json.loads(row['metadata_json']) if row.get('metadata_json') else None
        
        return TaskTrace(
            trace_id=row['trace_id'],
            task_name=row['task_name'],
            ticket_id=row['ticket_id'], 
            timestamp=datetime.fromisoformat(row['timestamp']),
            inputs=inputs,
            outputs=outputs,
            metadata=metadata
        )

# Context managers for easy trace logging

class task_tracer:
    """
    Context manager for easy trace logging.
    
    Usage:
    with task_tracer("task2_bdd", "CARCONF-104") as tracer:
        tracer.log_input("ticket", ticket_content)
        tracer.log_input("domain_config", domain_config)
        
        # Do your task work
        bdd_scenarios = generate_bdd(ticket_content, domain_config)
        
        tracer.log_output("bdd_scenarios", bdd_scenarios)
        # Trace is automatically saved on exit
    """
    
    def __init__(self, task_name: str, ticket_id: str, logger: TraceLogger = None):
        self.task_name = task_name
        self.ticket_id = ticket_id
        self.logger = logger or TraceLogger()
        
        # Generate unique trace ID
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")[:-3]
        self.trace_id = f"{task_name}_{ticket_id}_{timestamp}"
        
        self.inputs = {}
        self.outputs = {}
        self.metadata = {}
        self.start_time = None
    
    def __enter__(self):
        self.start_time = datetime.now()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        # Calculate execution time
        if self.start_time:
            execution_time = (datetime.now() - self.start_time).total_seconds()
            self.metadata['execution_time_seconds'] = execution_time
        
        # Log any exceptions
        if exc_type:
            self.metadata['error'] = str(exc_val)
            self.metadata['error_type'] = exc_type.__name__
        
        # Create and log trace
        trace = TaskTrace(
            trace_id=self.trace_id,
            task_name=self.task_name,
            ticket_id=self.ticket_id,
            timestamp=self.start_time or datetime.now(),
            inputs=self.inputs,
            outputs=self.outputs,
            metadata=self.metadata
        )
        
        self.logger.log_trace(trace)
    
    def log_input(self, key: str, value: Any) -> None:
        """Log an input to this trace."""
        self.inputs[key] = value
    
    def log_output(self, key: str, value: Any) -> None:
        """Log an output from this trace."""
        self.outputs[key] = value
    
    def log_metadata(self, key: str, value: Any) -> None:
        """Log metadata about this trace."""
        self.metadata[key] = value

# Convenience functions

def create_task1_trace(ticket_id: str, ticket_content: str, validation_result: str) -> TaskTrace:
    """Create a Task 1 validation trace."""
    return TaskTrace(
        trace_id=f"task1_{ticket_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
        task_name="task1_validation",
        ticket_id=ticket_id,
        timestamp=datetime.now(),
        inputs={"ticket_content": ticket_content},
        outputs={"validation_result": validation_result}
    )

def create_task2_trace(ticket_id: str, validation_output: str, bdd_scenarios: str, domain: str = None) -> TaskTrace:
    """Create a Task 2 BDD generation trace."""
    inputs = {"validation_output": validation_output}
    if domain:
        inputs["domain"] = domain
    
    return TaskTrace(
        trace_id=f"task2_{ticket_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
        task_name="task2_bdd",
        ticket_id=ticket_id,
        timestamp=datetime.now(), 
        inputs=inputs,
        outputs={"bdd_scenarios": bdd_scenarios}
    )