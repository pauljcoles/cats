"""
Simple Annotation Tools

Following Teresa's approach: start with simple tools, build custom ones as needed.
These help humans label traces as good/bad examples for eval validation.

Teresa started with Airtable, then built custom annotation interfaces.
We'll provide both simple CSV-based annotation and a basic web interface.
"""

import csv
import json
import os
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime

@dataclass
class Annotation:
    """
    An annotation is a human judgment about a trace.
    
    Similar to Teresa's failure mode labels - captures what humans think about AI outputs.
    """
    trace_id: str
    annotator: str
    task_name: str
    label: str  # "PASS", "FAIL", or specific failure modes
    confidence: int  # 1-5 scale
    notes: str
    failure_modes: List[str]  # e.g., ["requirement_invention", "implementation_contamination"]
    timestamp: datetime
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'trace_id': self.trace_id,
            'annotator': self.annotator,
            'task_name': self.task_name,
            'label': self.label,
            'confidence': self.confidence,
            'notes': self.notes,
            'failure_modes': json.dumps(self.failure_modes),
            'timestamp': self.timestamp.isoformat()
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Annotation':
        return cls(
            trace_id=data['trace_id'],
            annotator=data['annotator'],
            task_name=data['task_name'],
            label=data['label'],
            confidence=int(data['confidence']),
            notes=data['notes'],
            failure_modes=json.loads(data['failure_modes']),
            timestamp=datetime.fromisoformat(data['timestamp'])
        )

class AnnotationManager:
    """
    Simple annotation storage and management.
    
    Stores annotations in CSV (Teresa's approach) for easy analysis.
    """
    
    def __init__(self, annotation_dir: str = None):
        if annotation_dir is None:
            annotation_dir = os.path.join(os.path.dirname(__file__), '..', 'annotations')
        
        self.annotation_dir = annotation_dir
        os.makedirs(annotation_dir, exist_ok=True)
        
        self.annotation_file = os.path.join(annotation_dir, 'annotations.csv')
        self.failure_modes_file = os.path.join(annotation_dir, 'failure_modes.json')
        
        # Initialize failure modes if not exists
        if not os.path.exists(self.failure_modes_file):
            self._create_default_failure_modes()
    
    def _create_default_failure_modes(self):
        """Create default failure modes based on your domain knowledge."""
        failure_modes = {
            "task1_validation": [
                "incomplete_analysis",
                "wrong_priority_classification", 
                "missing_quality_gates",
                "incorrect_architecture_detection"
            ],
            "task2_bdd": [
                "requirement_invention",
                "implementation_contamination",
                "domain_inconsistency",
                "poor_scenario_structure",
                "missing_p0_coverage",
                "wrong_priority_focus"
            ],
            "task3a_assessment": [
                "wrong_automation_decisions",
                "poor_rationale",
                "missing_alternatives",
                "criteria_misapplication"
            ],
            "task3b_automation": [
                "technical_errors",
                "wrong_framework_choice",
                "missing_selectors",
                "poor_test_structure"
            ],
            "cross_task": [
                "p0_requirement_loss",
                "poor_traceability",
                "priority_inconsistency",
                "context_contamination"
            ]
        }
        
        with open(self.failure_modes_file, 'w') as f:
            json.dump(failure_modes, f, indent=2)
    
    def get_failure_modes(self, task_name: str) -> List[str]:
        """Get available failure modes for a task."""
        with open(self.failure_modes_file, 'r') as f:
            modes = json.load(f)
        
        return modes.get(task_name, modes.get("cross_task", []))
    
    def save_annotation(self, annotation: Annotation) -> None:
        """Save an annotation to CSV file."""
        file_exists = os.path.exists(self.annotation_file)
        
        with open(self.annotation_file, 'a', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=annotation.to_dict().keys())
            
            if not file_exists:
                writer.writeheader()
            
            writer.writerow(annotation.to_dict())
    
    def load_annotations(self, task_name: str = None) -> List[Annotation]:
        """Load annotations from CSV file."""
        if not os.path.exists(self.annotation_file):
            return []
        
        annotations = []
        with open(self.annotation_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            for row in reader:
                annotation = Annotation.from_dict(row)
                
                if task_name is None or annotation.task_name == task_name:
                    annotations.append(annotation)
        
        return annotations
    
    def get_annotation_summary(self) -> Dict[str, Any]:
        """Get summary statistics about annotations."""
        annotations = self.load_annotations()
        
        if not annotations:
            return {"total": 0, "by_task": {}, "by_label": {}}
        
        summary = {
            "total": len(annotations),
            "by_task": {},
            "by_label": {},
            "by_failure_mode": {}
        }
        
        for annotation in annotations:
            # By task
            if annotation.task_name not in summary["by_task"]:
                summary["by_task"][annotation.task_name] = 0
            summary["by_task"][annotation.task_name] += 1
            
            # By label
            if annotation.label not in summary["by_label"]:
                summary["by_label"][annotation.label] = 0
            summary["by_label"][annotation.label] += 1
            
            # By failure mode
            for mode in annotation.failure_modes:
                if mode not in summary["by_failure_mode"]:
                    summary["by_failure_mode"][mode] = 0
                summary["by_failure_mode"][mode] += 1
        
        return summary

class SimpleAnnotationInterface:
    """
    Simple command-line annotation interface.
    
    Teresa's approach: start simple, add complexity as needed.
    """
    
    def __init__(self, manager: AnnotationManager = None):
        self.manager = manager or AnnotationManager()
    
    def annotate_trace(self, trace_id: str, task_name: str, trace_content: str, annotator: str = "human"):
        """Interactive annotation of a single trace."""
        print(f"\n{'='*60}")
        print(f"ANNOTATING TRACE: {trace_id}")
        print(f"TASK: {task_name}")
        print(f"{'='*60}")
        print(f"\nTRACE CONTENT:\n{trace_content}")
        print(f"\n{'='*60}")
        
        # Get label
        while True:
            label = input("\nLabel (PASS/FAIL): ").strip().upper()
            if label in ["PASS", "FAIL"]:
                break
            print("Please enter PASS or FAIL")
        
        # Get confidence
        while True:
            try:
                confidence = int(input("Confidence (1-5): ").strip())
                if 1 <= confidence <= 5:
                    break
                print("Please enter a number between 1 and 5")
            except ValueError:
                print("Please enter a valid number")
        
        # Get failure modes if FAIL
        failure_modes = []
        if label == "FAIL":
            available_modes = self.manager.get_failure_modes(task_name)
            
            print(f"\nAvailable failure modes:")
            for i, mode in enumerate(available_modes):
                print(f"{i+1}. {mode}")
            
            modes_input = input("\nSelect failure modes (comma-separated numbers, or 0 for custom): ").strip()
            
            if modes_input == "0":
                custom_mode = input("Enter custom failure mode: ").strip()
                failure_modes = [custom_mode]
            else:
                try:
                    indices = [int(x.strip()) - 1 for x in modes_input.split(',')]
                    failure_modes = [available_modes[i] for i in indices if 0 <= i < len(available_modes)]
                except:
                    print("Invalid selection, using no failure modes")
        
        # Get notes
        notes = input("\nNotes (optional): ").strip()
        
        # Create and save annotation
        annotation = Annotation(
            trace_id=trace_id,
            annotator=annotator,
            task_name=task_name,
            label=label,
            confidence=confidence,
            notes=notes,
            failure_modes=failure_modes,
            timestamp=datetime.now()
        )
        
        self.manager.save_annotation(annotation)
        print(f"\nAnnotation saved! ✓")
        
        return annotation
    
    def batch_annotate_traces(self, traces: List[Dict[str, Any]], annotator: str = "human"):
        """Annotate multiple traces in sequence."""
        print(f"Starting batch annotation of {len(traces)} traces...")
        
        completed = 0
        for i, trace in enumerate(traces):
            print(f"\nProgress: {i+1}/{len(traces)}")
            
            # Check if already annotated
            existing = self.manager.load_annotations()
            if any(ann.trace_id == trace['trace_id'] for ann in existing):
                skip = input(f"Trace {trace['trace_id']} already annotated. Skip? (y/n): ")
                if skip.lower() == 'y':
                    continue
            
            try:
                self.annotate_trace(
                    trace['trace_id'],
                    trace['task_name'],
                    trace.get('content', str(trace)),
                    annotator
                )
                completed += 1
                
                # Ask to continue
                if i < len(traces) - 1:
                    cont = input(f"\nContinue to next trace? (y/n/q for quit): ")
                    if cont.lower() in ['n', 'q']:
                        break
                        
            except KeyboardInterrupt:
                print(f"\nAnnotation interrupted. Completed: {completed}/{len(traces)}")
                break
        
        print(f"\nBatch annotation complete! Annotated: {completed}/{len(traces)}")

def create_annotation_export(annotation_manager: AnnotationManager, output_file: str):
    """
    Export annotations in format suitable for eval validation.
    
    Teresa's approach: make it easy to compare human labels with eval results.
    """
    annotations = annotation_manager.load_annotations()
    
    # Create simple format for eval comparison
    export_data = []
    for ann in annotations:
        export_data.append({
            'trace_id': ann.trace_id,
            'task_name': ann.task_name,
            'human_label': ann.label,
            'human_confidence': ann.confidence,
            'failure_modes': ','.join(ann.failure_modes),
            'notes': ann.notes,
            'annotator': ann.annotator,
            'timestamp': ann.timestamp.isoformat()
        })
    
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        if export_data:
            writer = csv.DictWriter(f, fieldnames=export_data[0].keys())
            writer.writeheader()
            writer.writerows(export_data)
    
    print(f"Exported {len(export_data)} annotations to {output_file}")

# Convenience functions for quick annotation

def quick_annotate(trace_id: str, task_name: str, label: str, notes: str = "", 
                  failure_modes: List[str] = None, annotator: str = "human") -> Annotation:
    """Quick annotation without interactive interface."""
    manager = AnnotationManager()
    
    annotation = Annotation(
        trace_id=trace_id,
        annotator=annotator,
        task_name=task_name,
        label=label.upper(),
        confidence=5,  # Default high confidence for programmatic annotation
        notes=notes,
        failure_modes=failure_modes or [],
        timestamp=datetime.now()
    )
    
    manager.save_annotation(annotation)
    return annotation

def bulk_import_annotations(csv_file: str) -> None:
    """Import annotations from CSV file."""
    manager = AnnotationManager()
    
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        for row in reader:
            annotation = Annotation(
                trace_id=row['trace_id'],
                annotator=row.get('annotator', 'imported'),
                task_name=row['task_name'],
                label=row['label'].upper(),
                confidence=int(row.get('confidence', 5)),
                notes=row.get('notes', ''),
                failure_modes=row.get('failure_modes', '').split(',') if row.get('failure_modes') else [],
                timestamp=datetime.fromisoformat(row['timestamp']) if row.get('timestamp') else datetime.now()
            )
            
            manager.save_annotation(annotation)
    
    print(f"Imported annotations from {csv_file}")

if __name__ == "__main__":
    # Demo the annotation interface
    interface = SimpleAnnotationInterface()
    
    # Example trace for demonstration
    demo_trace = {
        'trace_id': 'demo_trace_001',
        'task_name': 'task2_bdd',
        'content': '''
        Generated BDD Scenario:
        Given user is on the paint selection page
        When user clicks on "Red Metallic" color option
        Then user sees the paint selection confirmed
        And user sees updated pricing with paint cost
        And user should also see a paint comparison tool
        '''
    }
    
    print("Demo annotation interface:")
    interface.annotate_trace(
        demo_trace['trace_id'],
        demo_trace['task_name'], 
        demo_trace['content']
    )