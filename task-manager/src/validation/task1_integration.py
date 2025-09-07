"""
Task 1 Integration: Hybrid Gate 1 Evaluation with Claude CLI
Entry point for "execute task 1 for TICKET-123" command
Extended with Specification Parser for Business Analyst Workflow
"""

import os
import re
import json
from pathlib import Path
from typing import Dict, Any, Optional, List
from dataclasses import asdict

# Import the hybrid evaluator
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.append(os.path.join(os.path.dirname(__file__)))

from .task1 import (
    HybridGate1Evaluator, 
    TaskExecutionContext, 
    Gate1EvalResult,
    UserChoice,
    LanguageIssue,
    EvalMethod
)

# Import the specification parser extension
from src.parsing.specification_parser import SpecificationParser, SpecificationData

# Import BA evaluation functions
try:
    from evals.spec_analysis_evals import (
        eval_specification_structure,
        eval_persona_extraction_completeness, 
        eval_business_goal_clarity
    )
    BA_EVALS_AVAILABLE = True
except ImportError as e:
    print(f"⚠️ BA evaluations not available: {e}")
    BA_EVALS_AVAILABLE = False

class Task1IntegrationEngine:
    """
    Integration engine that connects hybrid evaluation with existing Task 1 workflow
    """
    
    def __init__(self):
        self.evaluator = HybridGate1Evaluator()
        self.spec_parser = SpecificationParser()
        self.base_path = Path("/home/pauljcoles/code/cats/task-manager")
        
    def execute_task_1_for_ticket(self, ticket_id: str) -> TaskExecutionContext:
        """
        Main entry point for "execute task 1 for TICKET-123" command
        Follows the CLAUDE.md specification for Task 1 execution
        """
        
        print(f"🎯 Executing Task 1 for {ticket_id}")
        print("=" * 50)
        
        # Step 1: Load validation context and ticket data
        print(f"📋 Loading ticket {ticket_id}...")
        ticket_data = self._load_ticket_data(ticket_id)
        if not ticket_data:
            print(f"❌ Ticket {ticket_id} not found")
            return None
            
        # Step 2: Apply dynamic context loading  
        print("🔍 Applying dynamic context loading...")
        domain_config = self._load_domain_context(ticket_id)
        
        # Step 3: Run hybrid validation gates
        print("⚙️ Running hybrid Gate 1 Language Clarity evaluation...")
        print("   - Code patterns: vague terms, external refs, conditionals")
        print("   - LLM analysis: multiple behaviors, contextual issues")
        
        eval_result = self._run_hybrid_evaluation(ticket_data, domain_config)
        
        # Step 3b: Run BA specification analysis
        ba_analysis = self._run_ba_specification_analysis(ticket_data)
        
        # Step 4: Create execution context with BA analysis
        context = TaskExecutionContext(
            ticket_id=ticket_id,
            ticket_data=ticket_data,
            eval_result=eval_result
        )
        # Add BA analysis to context
        context.ba_analysis = ba_analysis
        
        # Step 5: Generate analysis outputs
        self._generate_outputs(context, domain_config)
        
        # Step 6: Present results and get user choice
        self._present_results_and_choices(context)
        
        return context
    
    def _load_ticket_data(self, ticket_id: str) -> Optional[Dict[str, Any]]:
        """Load ticket from existing markdown format"""
        
        ticket_file = self.base_path / "example-tickets" / f"{ticket_id}.md"
        
        if not ticket_file.exists():
            return None
            
        try:
            content = ticket_file.read_text()
            return self._parse_ticket_markdown(content, ticket_id)
        except Exception as e:
            print(f"❌ Error loading ticket {ticket_id}: {e}")
            return None
    
    def _parse_ticket_markdown(self, content: str, ticket_id: str) -> Dict[str, Any]:
        """Parse ticket markdown into structured data"""
        
        lines = content.split('\n')
        ticket_data = {
            "key": ticket_id,
            "title": "",
            "description": "",
            "acceptance_criteria": [],
            "labels": [],
            "priority": "",
            "story_points": ""
        }
        
        current_section = None
        requirement_buffer = []
        in_requirements = False
        
        for line in lines:
            line = line.strip()
            
            # Extract title
            if line.startswith("Title:"):
                ticket_data["title"] = line.replace("Title:", "").strip()
            
            # Extract description section
            elif line == "Description:":
                current_section = "description"
                continue
            elif line.startswith("Requirements"):
                in_requirements = True
                current_section = "requirements"
                # Process any buffered description content
                if requirement_buffer:
                    ticket_data["description"] = " ".join(requirement_buffer)
                    requirement_buffer = []
                continue
            
            # Extract labels, priority, story points - this ends requirements section
            elif line.startswith("Labels:"):
                # Process any remaining requirement buffer before switching sections
                if requirement_buffer and in_requirements:
                    ac_text = " ".join(requirement_buffer)
                    ticket_data["acceptance_criteria"].append({
                        "id": f"AC-{len(ticket_data['acceptance_criteria']) + 1:03d}",
                        "description": ac_text
                    })
                    requirement_buffer = []
                in_requirements = False
                ticket_data["labels"] = [l.strip() for l in line.replace("Labels:", "").split(",")]
            elif line.startswith("Priority:"):
                ticket_data["priority"] = line.replace("Priority:", "").strip()
            elif line.startswith("Story Points:"):
                ticket_data["story_points"] = line.replace("Story Points:", "").strip()
            
            # Build content for current section
            elif current_section == "description" and line and not line.startswith(("Labels:", "Priority:", "Story Points:", "Requirements")):
                requirement_buffer.append(line)
            elif in_requirements and line:
                # Handle requirements section - combine all lines until next requirement title or section
                if line.startswith("- ") and not any(keyword in line for keyword in ["Given", "When", "Then"]):
                    # This is a new requirement title - save previous if exists
                    if requirement_buffer:
                        ac_text = " ".join(requirement_buffer)
                        ticket_data["acceptance_criteria"].append({
                            "id": f"AC-{len(ticket_data['acceptance_criteria']) + 1:03d}",
                            "description": ac_text
                        })
                    # Start new requirement
                    requirement_buffer = [line.lstrip("-").strip()]
                elif line.startswith("- "):
                    # Given/When/Then line - add to current requirement
                    requirement_buffer.append(line.lstrip("-").strip())
                elif line and requirement_buffer:
                    # Continuation line - add to current requirement
                    requirement_buffer.append(line)
        
        # Process any remaining requirement buffer
        if requirement_buffer:
            if current_section == "requirements" or in_requirements:
                ac_text = " ".join(requirement_buffer)
                ticket_data["acceptance_criteria"].append({
                    "id": f"AC-{len(ticket_data['acceptance_criteria']) + 1:03d}",
                    "description": ac_text
                })
            elif current_section == "description":
                ticket_data["description"] = " ".join(requirement_buffer)
        
        return ticket_data
    
    def _load_domain_context(self, ticket_id: str) -> Optional[Dict[str, Any]]:
        """Load domain configuration based on ticket prefix"""
        
        # Extract domain prefix (CARCONF-104 → carconf)
        prefix_match = re.match(r"([A-Z]+)", ticket_id)
        if not prefix_match:
            return None
            
        domain_prefix = prefix_match.group(1).lower()
        domain_dir = self.base_path / "context-rules" / f"{domain_prefix}-domain"
        
        if not domain_dir.exists():
            print(f"   ℹ️ No domain configuration found for '{domain_prefix}', using core patterns")
            return None
        
        print(f"   ✅ Found domain configuration: {domain_prefix}-domain")
        
        # Load domain configuration
        domain_config = {}
        
        # Load business domain config
        config_file = domain_dir / "business-domain-config.md"
        if config_file.exists():
            domain_config["business_config"] = config_file.read_text()
            
        # Load test data  
        test_data_file = domain_dir / "test_data.json"
        if test_data_file.exists():
            try:
                domain_config["test_data"] = json.loads(test_data_file.read_text())
            except json.JSONDecodeError:
                print(f"   ⚠️ Could not parse test_data.json in {domain_prefix}-domain")
        
        return domain_config
    
    def _run_hybrid_evaluation(self, ticket_data: Dict[str, Any], domain_config: Optional[Dict]) -> Gate1EvalResult:
        """Run the hybrid evaluation with domain context"""
        
        # Prepare acceptance criteria for evaluation
        acceptance_criteria = []
        for i, ac in enumerate(ticket_data.get('acceptance_criteria', [])):
            acceptance_criteria.append({
                'id': ac.get('id', f"AC-{i+1:03d}"),
                'text': ac.get('description', '')
            })
        
        if not acceptance_criteria:
            print("   ⚠️ No acceptance criteria found in ticket")
            # Create empty result
            return Gate1EvalResult(
                passed=False,
                score=0.0,
                total_issues=1,
                issues_by_severity={"critical": 1, "high": 0, "medium": 0, "low": 0},
                detailed_issues=[],
                ac_scores={},
                recommendations=["No acceptance criteria found in ticket"],
                eval_breakdown={"code": 0, "llm": 0}
            )
        
        print(f"   📝 Parsed {len(acceptance_criteria)} acceptance criteria")
        # Run the hybrid evaluation
        return self.evaluator.evaluate_acceptance_criteria(acceptance_criteria)
    
    def _run_ba_specification_analysis(self, ticket_data: Dict[str, Any]) -> Dict[str, Any]:
        """Run BA specification quality analysis on ticket content"""
        
        print("📊 Running BA Specification Quality Analysis...")
        
        # Check if BA evaluations are available
        if not BA_EVALS_AVAILABLE:
            print("   ℹ️ BA evaluations not available, skipping analysis")
            return {"status": "SKIP", "message": "BA evaluation modules not available"}
        
        # Try to parse ticket content as specification data
        try:
            # Create specification content from ticket
            spec_content = self._convert_ticket_to_spec_format(ticket_data)
            if not spec_content:
                return {"status": "SKIP", "message": "Ticket does not contain specification elements"}
            
            # Parse as specification
            spec_data = self.spec_parser.parse_specification(spec_content, ticket_data.get('id', 'TICKET-ANALYSIS'))
            
            # Run BA evaluations
            ba_results = {}
            
            # 1. Specification Structure Analysis
            print("   🔍 Analyzing specification structure...")
            ba_results['structure'] = eval_specification_structure(spec_data)
            
            # 2. Persona Extraction Completeness
            print("   👤 Evaluating persona extraction...")
            ba_results['persona_completeness'] = eval_persona_extraction_completeness(spec_data)
            
            # 3. Business Goal Clarity
            print("   🎯 Assessing business goal clarity...")
            ba_results['goal_clarity'] = eval_business_goal_clarity(spec_data)
            
            return {
                "status": "COMPLETED",
                "spec_data": spec_data,
                "evaluations": ba_results,
                "overall_ba_quality": self._calculate_ba_quality_score(ba_results)
            }
            
        except Exception as e:
            print(f"   ⚠️ Could not perform BA analysis: {e}")
            return {"status": "ERROR", "message": str(e)}
    
    def _convert_ticket_to_spec_format(self, ticket_data: Dict[str, Any]) -> Optional[str]:
        """Convert ticket data to specification format for BA analysis"""
        
        # Check if ticket contains specification-like elements
        description = ticket_data.get('description', '')
        
        # Look for specification indicators
        spec_indicators = ['persona', 'user journey', 'business goal', 'stakeholder', 'requirement']
        has_spec_content = any(indicator in description.lower() for indicator in spec_indicators)
        
        if not has_spec_content and len(description) < 200:
            return None  # Too simple for specification analysis
        
        # Create basic specification format
        spec_content = f"""# {ticket_data.get('title', 'Ticket Analysis')}

## Description
{description}

## Acceptance Criteria
"""
        
        for i, ac in enumerate(ticket_data.get('acceptance_criteria', []), 1):
            spec_content += f"\n{i}. {ac.get('description', '')}"
        
        return spec_content
    
    def _calculate_ba_quality_score(self, ba_results: Dict[str, Any]) -> float:
        """Calculate overall BA quality score from individual evaluations"""
        
        scores = []
        for eval_name, result in ba_results.items():
            if hasattr(result, 'status'):
                # Convert PASS/FAIL to score (PASS=100, FAIL=0)
                scores.append(100.0 if result.status == "PASS" else 0.0)
        
        return sum(scores) / len(scores) if scores else 0.0
    
    def _generate_outputs(self, context: TaskExecutionContext, domain_config: Optional[Dict]):
        """Generate validation report and conversation log"""
        
        # Create output directory
        output_dir = self.base_path / "aiGenerated" / context.ticket_id
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate validation report
        validation_report = self._create_validation_report(context, domain_config)
        report_file = output_dir / f"{context.ticket_id}_validation_report.md"
        report_file.write_text(validation_report)
        
        # Generate conversation log
        conversation_log = self._create_conversation_log(context)
        conv_file = output_dir / f"{context.ticket_id}_conversation.md"
        conv_file.write_text(conversation_log)
        
        print(f"📄 Generated outputs in {output_dir}")
    
    def _create_validation_report(self, context: TaskExecutionContext, domain_config: Optional[Dict]) -> str:
        """Create structured validation report"""
        
        eval_result = context.eval_result
        
        # Header
        report = f"""# Gate 1 Language Clarity Validation Report
Ticket: {context.ticket_id}
Generated: {self._get_timestamp()}

## Executive Summary

**Overall Score**: {eval_result.score:.1f}/100 {'✅ PASSED' if eval_result.passed else '❌ FAILED'}
**Analysis Method**: {eval_result.eval_breakdown['code']} code + {eval_result.eval_breakdown['llm']} LLM issues
**Total Issues**: {eval_result.total_issues}

### Issue Severity Breakdown
- 🔴 Critical: {eval_result.issues_by_severity['critical']}
- 🟡 High: {eval_result.issues_by_severity['high']}  
- 🟠 Medium: {eval_result.issues_by_severity['medium']}
- 🟢 Low: {eval_result.issues_by_severity['low']}

## Per-AC Analysis

"""
        
        # Per-AC scores
        for ac_id, score in eval_result.ac_scores.items():
            status = "✅ Good" if score >= 70 else "⚠️ Issues" if score >= 50 else "❌ Poor"
            report += f"- **{ac_id}**: {score:.1f}/100 {status}\n"
        
        # Detailed issues breakdown
        if eval_result.detailed_issues:
            report += "\n## Detailed Issue Analysis\n\n"
            
            # Group by detection method
            code_issues = [i for i in eval_result.detailed_issues if i.eval_method == EvalMethod.CODE_BASED]
            llm_issues = [i for i in eval_result.detailed_issues if i.eval_method == EvalMethod.LLM_BASED]
            
            if code_issues:
                report += "### 🎯 Code-Detected Issues (High Confidence)\n\n"
                for issue in code_issues:
                    report += f"**{issue.ac_id}**: {issue.failure_type.value.replace('_', ' ').title()}\n"
                    report += f"- Pattern: `{issue.detected_pattern}`\n"
                    report += f"- Context: {issue.context}\n"
                    report += f"- Suggestion: {issue.suggestion}\n"
                    report += f"- Location: {issue.location}\n\n"
            
            if llm_issues:
                report += "### 🤖 LLM-Identified Issues (Contextual Analysis)\n\n"
                for issue in llm_issues:
                    report += f"**{issue.ac_id}**: {issue.failure_type.value.replace('_', ' ').title()}\n"
                    report += f"- Pattern: {issue.detected_pattern}\n"
                    report += f"- Context: {issue.context}\n" 
                    report += f"- Suggestion: {issue.suggestion}\n"
                    report += f"- Confidence: {issue.confidence:.0%}\n\n"
        
        # BA Specification Quality Analysis
        if hasattr(context, 'ba_analysis') and context.ba_analysis.get('status') == 'COMPLETED':
            ba_analysis = context.ba_analysis
            ba_quality = ba_analysis.get('overall_ba_quality', 0)
            
            report += f"""## BA Specification Quality Analysis

**Overall BA Quality**: {ba_quality:.1f}/100 {'✅ PASSED' if ba_quality >= 60 else '❌ NEEDS IMPROVEMENT'}

### Business Analysis Evaluations

"""
            
            for eval_name, eval_result in ba_analysis.get('evaluations', {}).items():
                status_emoji = "✅" if eval_result.status == "PASS" else "❌"
                eval_display_name = eval_name.replace('_', ' ').title()
                report += f"**{eval_display_name}**: {status_emoji} {eval_result.status}\n"
                report += f"- {eval_result.message}\n"
                if hasattr(eval_result, 'details') and eval_result.details:
                    report += f"- Details: {eval_result.details}\n"
                report += "\n"
            
            # Spec data summary
            spec_data = ba_analysis.get('spec_data')
            if spec_data:
                report += f"""### Extracted Specification Elements

- **Personas**: {len(spec_data.personas)}
- **Business Goals**: {len(spec_data.business_goals)}  
- **User Journeys**: {len(spec_data.user_journeys)}
- **Constraints**: {len(spec_data.constraints)}
- **Assumptions**: {len(spec_data.assumptions)}

"""
        elif hasattr(context, 'ba_analysis') and context.ba_analysis.get('status') == 'SKIP':
            report += f"""## BA Specification Quality Analysis

**Status**: ℹ️ SKIPPED - {context.ba_analysis.get('message', 'Not applicable')}

"""
        elif hasattr(context, 'ba_analysis') and context.ba_analysis.get('status') == 'ERROR':
            report += f"""## BA Specification Quality Analysis

**Status**: ⚠️ ERROR - {context.ba_analysis.get('message', 'Analysis failed')}

"""
        
        # Recommendations
        if eval_result.recommendations:
            report += "## Recommendations\n\n"
            for rec in eval_result.recommendations:
                report += f"- {rec}\n"
        
        # Domain context info
        if domain_config:
            report += f"\n## Domain Configuration\n\nUsed domain-specific configuration for enhanced analysis.\n"
        
        return report
    
    def _create_conversation_log(self, context: TaskExecutionContext) -> str:
        """Create conversation log following CLAUDE.md format"""
        
        log = f"""# Task 1 Conversation Log
Ticket: {context.ticket_id}
Started: {self._get_timestamp()}

## Command Executed
```
execute task 1 for {context.ticket_id}
```

## Analysis Process

### Step 1: Ticket Loading
✅ Loaded ticket data from example-tickets/{context.ticket_id}.md
✅ Parsed {len(context.ticket_data.get('acceptance_criteria', []))} acceptance criteria

### Step 2: Dynamic Context Loading  
{'✅ Loaded domain configuration' if 'domain' in str(context.ticket_data) else '⚠️ Using core patterns (no domain config found)'}

### Step 3: Hybrid Gate 1 Evaluation
✅ Code-based pattern analysis completed
✅ LLM contextual analysis {'completed' if context.eval_result.eval_breakdown['llm'] > 0 else 'not needed'}

### Step 4: Results Generation
✅ Validation report generated
✅ Quality score: {context.eval_result.score:.1f}/100

## User Decision Required

Based on the analysis results, user needs to choose next action:
- 🟢 Proceed Anyway
- 🔧 Apply SRP Fixes  
- 👀 Show Preview
- 🛑 Stop and Fix
- 📋 More Details

User choice: {context.user_choice.value if context.user_choice else 'Pending'}
Should continue: {context.should_continue}
"""
        
        return log
    
    def _present_results_and_choices(self, context: TaskExecutionContext):
        """Present hybrid evaluation results and get user choice"""
        
        eval_result = context.eval_result
        
        print(f"\n📊 **Hybrid Gate 1 Results**")
        print("=" * 50)
        print(f"**Overall Score**: {eval_result.score:.1f}/100 {'✅ PASSED' if eval_result.passed else '❌ FAILED'}")
        print(f"**Analysis Method**: {eval_result.eval_breakdown['code']} code + {eval_result.eval_breakdown['llm']} LLM issues")
        print()
        
        # Show issues by detection method
        code_issues = [i for i in eval_result.detailed_issues if i.eval_method == EvalMethod.CODE_BASED]
        llm_issues = [i for i in eval_result.detailed_issues if i.eval_method == EvalMethod.LLM_BASED]
        
        if code_issues:
            print("🎯 **Code-Detected Issues** (High Confidence):")
            for issue in code_issues[:3]:  # Show top 3
                print(f"   - {issue.ac_id}: '{issue.detected_pattern}' → {issue.suggestion}")
        
        if llm_issues:
            print("🤖 **LLM-Identified Issues** (Contextual Analysis):")
            for issue in llm_issues[:3]:  # Show top 3
                confidence_str = f" ({issue.confidence:.0%} confidence)"
                print(f"   - {issue.ac_id}: {issue.detected_pattern} → {issue.suggestion}{confidence_str}")
        
        # Quality-based recommendation
        if eval_result.score >= 85:
            recommendation = "🎉 Excellent quality! Ready to proceed with scenario generation."
        elif eval_result.score >= 70:
            recommendation = "⚠️ Good quality with minor issues. Consider addressing for optimal results."
        elif eval_result.score >= 50:
            recommendation = "🟡 Issues detected. Strongly recommend addressing before proceeding."
        else:
            recommendation = "🔴 Significant quality issues. Address before generating scenarios."
        
        print(f"\n**Recommendation**: {recommendation}")
        
        # Present user choices
        print(f"""
**Available Actions:**
1. 🟢 **Proceed Anyway** - Continue with current requirements despite issues
2. 🔧 **Apply SRP Fixes** - Auto-fix compound ACs using Single Responsibility Principle  
3. 👀 **Show Preview** - See what scenarios would look like with current requirements
4. 🛑 **Stop and Fix** - Address quality issues before generating scenarios
5. 📋 **More Details** - Show complete issue breakdown with analysis methods

What would you like to do?
""")
        
        # For now, we'll let the user respond naturally in the Claude CLI
        # The choice processing will be handled by follow-up commands or responses
        
    def _get_timestamp(self) -> str:
        """Get current timestamp"""
        from datetime import datetime
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # ===== SPECIFICATION PARSER EXTENSION =====
    
    def parse_specification_for_analysis(self, spec_id: str) -> Optional[SpecificationData]:
        """
        Parse specification document for business analyst workflow
        Extends existing _parse_ticket_markdown pattern for specifications
        """
        
        print(f"🎯 Parsing specification {spec_id}")
        print("=" * 50)
        
        # Load specification content (similar to _load_ticket_data pattern)
        spec_content = self._load_specification_content(spec_id)
        if not spec_content:
            print(f"❌ Specification {spec_id} not found")
            return None
            
        print("📋 Extracting business analysis elements...")
        print("   - User personas and motivations")
        print("   - Business goals and success criteria")
        print("   - User journey context")
        print("   - Constraints and assumptions")
        
        # Parse using specification parser
        spec_data = self.spec_parser.parse_specification(spec_content, spec_id)
        
        # Generate output (following existing _generate_outputs pattern)
        self._generate_specification_analysis(spec_data)
        
        print(f"✅ Specification analysis complete for {spec_id}")
        return spec_data
    
    def _load_specification_content(self, spec_id: str) -> Optional[str]:
        """Load specification content from file (extends _load_ticket_data pattern)"""
        
        # Check multiple possible locations for specifications
        spec_locations = [
            self.base_path / "specifications" / f"{spec_id}.md",
            self.base_path / "example-specs" / f"{spec_id}.md", 
            self.base_path / "specs" / f"{spec_id}.md",
            self.base_path / f"{spec_id}.md"
        ]
        
        for spec_file in spec_locations:
            if spec_file.exists():
                try:
                    return spec_file.read_text(encoding='utf-8')
                except Exception as e:
                    print(f"❌ Error reading specification {spec_id}: {e}")
                    return None
        
        return None
    
    def _generate_specification_analysis(self, spec_data: SpecificationData):
        """Generate specification analysis output (follows _generate_outputs pattern)"""
        
        # Create output directory following established pattern
        output_dir = self.base_path / "aiGenerated" / spec_data.spec_id
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate analysis report
        analysis_report = self._create_specification_analysis_report(spec_data)
        report_file = output_dir / f"{spec_data.spec_id}_specification_analysis.md"
        report_file.write_text(analysis_report)
        
        # Generate conversation log (maintains existing pattern)
        conversation_log = self._create_specification_conversation_log(spec_data)
        conv_file = output_dir / f"{spec_data.spec_id}_conversation.md"
        conv_file.write_text(conversation_log)
        
        print(f"📄 Generated specification analysis in {output_dir}")
    
    def _create_specification_analysis_report(self, spec_data: SpecificationData) -> str:
        """Create structured specification analysis report"""
        
        report = f"""# Specification Analysis Report
Specification: {spec_data.spec_id}
Generated: {self._get_timestamp()}

## Executive Summary

**Title**: {spec_data.title}
**Personas Identified**: {len(spec_data.personas)}
**Business Goals**: {len(spec_data.business_goals)}
**User Journeys**: {len(spec_data.user_journeys)}
**Constraints**: {len(spec_data.constraints)}

## Business Analysis Elements

### User Personas
"""
        
        for persona in spec_data.personas:
            report += f"""
#### {persona.name}
- **Role**: {persona.role}
- **Motivations**: {', '.join(persona.motivations) if persona.motivations else 'Not specified'}
- **Context**: {persona.context[:100]}{'...' if len(persona.context) > 100 else ''}
"""
        
        report += "\n### Business Goals\n"
        for i, goal in enumerate(spec_data.business_goals, 1):
            report += f"""
{i}. **{goal.goal}**
   - Priority: {goal.priority}
   - Success Criteria: {', '.join(goal.success_criteria) if goal.success_criteria else 'Not defined'}
"""
        
        report += "\n### User Journeys\n"
        for journey in spec_data.user_journeys:
            report += f"""
#### {journey.name}
- **Steps**: {len(journey.steps)} identified
- **Key Steps**: {', '.join(journey.steps[:3])}{'...' if len(journey.steps) > 3 else ''}
"""
        
        if spec_data.constraints:
            report += "\n### Constraints\n"
            for i, constraint in enumerate(spec_data.constraints, 1):
                report += f"{i}. {constraint}\n"
        
        if spec_data.assumptions:
            report += "\n### Assumptions\n"
            for i, assumption in enumerate(spec_data.assumptions, 1):
                report += f"{i}. {assumption}\n"
        
        report += f"""

## Next Steps

This specification analysis provides structured input for story generation. The identified personas, goals, and journeys will be used to create well-structured user stories following INVEST criteria and Gojko Adzic patterns.

**Ready for Story Generation**: {'✅ Yes' if spec_data.personas and spec_data.business_goals else '❌ Missing key elements'}
"""
        
        return report
    
    def _create_specification_conversation_log(self, spec_data: SpecificationData) -> str:
        """Create conversation log for specification analysis (follows existing pattern)"""
        
        log = f"""# Conversation Log: {spec_data.spec_id}

## Specification Analysis Process

### Input Specification
- **ID**: {spec_data.spec_id}
- **Title**: {spec_data.title}
- **Analysis Date**: {self._get_timestamp()}

### Parsing Results
- **Personas Extracted**: {len(spec_data.personas)}
- **Business Goals Identified**: {len(spec_data.business_goals)} 
- **User Journeys Mapped**: {len(spec_data.user_journeys)}
- **Constraints Catalogued**: {len(spec_data.constraints)}
- **Assumptions Documented**: {len(spec_data.assumptions)}

### Analysis Method
- **Parser**: SpecificationParser (extends task1_integration._parse_ticket_markdown pattern)
- **Pattern Source**: Gojko Adzic Impact Mapping patterns
- **Validation**: Business goal alignment analysis applied

### Quality Assessment
- **Completeness**: {'Complete' if all([spec_data.personas, spec_data.business_goals, spec_data.description]) else 'Incomplete - missing key elements'}
- **Structure**: Structured data extracted successfully
- **Ready for Story Generation**: {'Yes' if spec_data.personas and spec_data.business_goals else 'No - requires additional clarification'}

---

*This analysis follows the proven Load→Validate→Execute→Document pattern from the existing task execution framework.*
"""
        
        return log


# Entry point function that Claude CLI will call
def execute_task_1_for_ticket(ticket_id: str) -> TaskExecutionContext:
    """
    Main entry point for 'execute task 1 for TICKET-123' command
    """
    engine = Task1IntegrationEngine()
    return engine.execute_task_1_for_ticket(ticket_id)

# For testing
if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        ticket_id = sys.argv[1]
        execute_task_1_for_ticket(ticket_id)
    else:
        print("Usage: python task1_integration.py TICKET-ID")
        print("Example: python task1_integration.py CARCONF-104")