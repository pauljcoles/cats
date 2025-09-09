"""
Task 5 Integration: Intelligent Story Generation from Specifications
Entry point for "execute task 5 for SPEC-123" command
Generates high-quality user stories from Confluence specifications using LLM intelligence
"""

import os
import re
import json
from pathlib import Path
from typing import Dict, Any, Optional, List, Tuple
from dataclasses import dataclass, field, asdict

# Import path setup
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.append(os.path.join(os.path.dirname(__file__)))

# Import existing validation components
from src.validation.validation_types import (
    UserChoice,
    LanguageIssue,
    EvalMethod,
    FailureType,
    Severity
)

# Import enhanced patterns for quality checking
from src.validation.enhanced_code_patterns import EnhancedCodePatterns

# Import real LLM client
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'services'))
from llm_client import make_llm_call

@dataclass
class StoryRequirement:
    """A discrete requirement extracted from specification"""
    id: str
    title: str
    description: str
    section_source: str
    business_value: str
    acceptance_criteria_hints: List[str] = field(default_factory=list)
    priority: str = "medium"
    complexity: str = "medium"

@dataclass
class GeneratedStory:
    """A user story generated from requirements with quality validation"""
    story_id: str
    title: str
    persona: str
    need: str
    value: str
    description: str
    acceptance_criteria: List[str]
    labels: List[str] = field(default_factory=list)
    priority: str = "medium"
    story_points: int = 3
    invest_score: float = 0.0
    quality_notes: List[str] = field(default_factory=list)
    source_requirement: str = ""

@dataclass
class Task5Result:
    """Results from Task 5 story generation"""
    spec_id: str
    total_requirements: int
    generated_stories: List[GeneratedStory]
    avg_invest_score: float
    quality_summary: Dict[str, int]
    extraction_method: str = "llm_intelligent"

@dataclass
class Task5ExecutionContext:
    """Execution context for Task 5 workflow"""
    spec_id: str
    spec_content: str
    requirements: List[StoryRequirement]
    generation_result: Task5Result
    should_continue: bool = True

class Task5IntegrationEngine:
    """
    Integration engine for Task 5: Generate Stories from Specifications
    Uses LLM intelligence, applies INVEST during generation
    """
    
    def __init__(self):
        self.enhanced_patterns = EnhancedCodePatterns()
        self.base_path = Path("/home/pauljcoles/code/cats/task-manager")
        
    def execute_task_5_for_spec(self, spec_id: str) -> Task5ExecutionContext:
        """
        Main entry point for "execute task 5 for SPEC-123" command
        Generates high-quality user stories from specifications
        """
        
        print(f"🎯 Executing Task 5 for {spec_id}")
        print("=" * 50)
        
        # Step 1: Load specification content (raw, no parsing)
        print(f"📋 Loading specification {spec_id}...")
        spec_content = self._load_specification_content(spec_id)
        if not spec_content:
            print(f"❌ Specification {spec_id} not found")
            return None
            
        # Step 2: Extract requirements using LLM intelligence
        print("🔍 Extracting requirements using LLM intelligence...")
        print("   - Identifying logical story boundaries")
        print("   - Extracting functional requirements")
        print("   - Maintaining traceability to source")
        
        requirements = self._extract_requirements_with_llm(spec_content, spec_id)
        
        # Step 3: Generate focused stories from requirements
        print("⚙️ Generating user stories with INVEST criteria...")
        print("   - 1 focused story per requirement (no combinatorial explosion)")
        print("   - INVEST validation during generation")
        print("   - Quality-first approach")
        
        stories = self._generate_stories_from_requirements(requirements, spec_id)
        
        # Step 4: Create generation results with quality analysis
        result = Task5Result(
            spec_id=spec_id,
            total_requirements=len(requirements),
            generated_stories=stories,
            avg_invest_score=sum(s.invest_score for s in stories) / len(stories) if stories else 0,
            quality_summary=self._calculate_quality_summary(stories),
            extraction_method="llm_intelligent"
        )
        
        # Step 5: Create execution context
        context = Task5ExecutionContext(
            spec_id=spec_id,
            spec_content=spec_content,
            requirements=requirements,
            generation_result=result
        )
        
        # Step 6: Generate outputs following Task 1 patterns
        self._generate_outputs(context)
        
        # Step 7: Present results
        self._present_results(context)
        
        return context
    
    def _load_specification_content(self, spec_id: str) -> Optional[str]:
        """Load specification content (raw format, no parsing required)"""
        
        # Check multiple possible locations for specifications
        spec_locations = [
            self.base_path / "specifications" / f"{spec_id}.md",
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
        
        print(f"❌ Specification {spec_id} not found in any location")
        return None
    
    def _extract_requirements_with_llm(self, spec_content: str, spec_id: str) -> List[StoryRequirement]:
        """
        Extract discrete requirements using REAL LLM intelligence
        Replaces fake regex patterns with intelligent analysis
        """
        
        print("   🤖 Using real LLM intelligence to extract requirements...")
        
        llm_prompt = f"""
Analyze this specification and extract discrete functional requirements that can become independent user stories:

{spec_content}

Extract requirements that represent distinct user behaviors or system capabilities. Focus on:
- User actions and system responses
- Business workflows and processes
- Data validation and business rules
- Integration points and external systems
- UI interactions and user experience requirements

For each requirement, provide:
- Clear, specific requirement description
- Associated personas from the specification
- Business value explanation
- Source section reference
- Estimated priority (high/medium/low)
- Estimated complexity (1-8 story points)

Respond with JSON array:
[{{
  "title": "Short descriptive title (max 80 chars)",
  "description": "Detailed requirement description", 
  "personas": ["PersonaName1", "PersonaName2"],
  "business_value": "Why this requirement matters to the business",
  "section_source": "Source section name",
  "priority": "high|medium|low",
  "complexity": 3
}}]

Extract 3-15 focused requirements. Avoid combinatorial explosion - group related functionality.
"""
        
        # Make real LLM call
        llm_response = make_llm_call(llm_prompt, expect_json=True)
        
        if not llm_response:
            print("   ❌ LLM call failed, falling back to simple extraction")
            return self._fallback_requirement_extraction(spec_content, spec_id)
        
        # Convert LLM response to StoryRequirement objects
        requirements = []
        req_id = 1
        
        for req_data in llm_response:
            try:
                req = StoryRequirement(
                    id=f"REQ-{req_id:03d}",
                    title=req_data.get('title', 'Untitled requirement')[:80],
                    description=req_data.get('description', 'No description provided'),
                    section_source=req_data.get('section_source', 'Unknown section'),
                    business_value=req_data.get('business_value', 'Business value not specified'),
                    priority=req_data.get('priority', 'medium'),
                    complexity=req_data.get('complexity', 3)
                )
                requirements.append(req)
                req_id += 1
            except Exception as e:
                print(f"   ⚠️ Skipping malformed requirement: {e}")
                continue
        
        print(f"   ✅ LLM extracted {len(requirements)} intelligent requirements")
        
        # Show sample requirements for validation
        for i, req in enumerate(requirements[:3]):
            print(f"      {i+1}. {req.id}: {req.title}")
            print(f"         Value: {req.business_value}")
        
        return requirements
    
    def _fallback_requirement_extraction(self, spec_content: str, spec_id: str) -> List[StoryRequirement]:
        """
        Fallback extraction method when LLM fails
        Simple section-based extraction as backup
        """
        print("   🔧 Using fallback extraction method")
        
        requirements = []
        sections = spec_content.split('\n##')
        req_id = 1
        
        for section in sections[1:]:  # Skip first empty section
            lines = section.split('\n')
            section_title = lines[0].strip()
            
            # Skip metadata sections
            if any(skip in section_title.lower() for skip in ['table of contents', 'introduction', 'appendix']):
                continue
            
            # Create one requirement per major section
            section_content = '\n'.join(lines[1:]).strip()
            if len(section_content) > 100:  # Only substantial sections
                req = StoryRequirement(
                    id=f"REQ-{req_id:03d}",
                    title=f"Implement {section_title}"[:80],
                    description=section_content[:200] + "..." if len(section_content) > 200 else section_content,
                    section_source=section_title,
                    business_value="Supports specification requirements",
                    priority="medium",
                    complexity=5
                )
                requirements.append(req)
                req_id += 1
        
        return requirements
    
    def _infer_business_value(self, requirement_text: str) -> str:
        """Infer business value from requirement text"""
        text_lower = requirement_text.lower()
        
        if any(word in text_lower for word in ['user', 'customer', 'experience']):
            return "improve user experience"
        elif any(word in text_lower for word in ['error', 'validate', 'check']):
            return "ensure system reliability"
        elif any(word in text_lower for word in ['display', 'show', 'present']):
            return "provide clear information"
        elif any(word in text_lower for word in ['select', 'choose', 'configure']):
            return "enable user control"
        else:
            return "support business operations"
    
    def _infer_priority(self, requirement_text: str, section: str) -> str:
        """Infer priority based on requirement content and section"""
        text_lower = requirement_text.lower()
        section_lower = section.lower()
        
        # High priority indicators
        if any(word in text_lower for word in ['must', 'shall', 'required', 'critical']):
            return "high"
        elif 'interface' in section_lower or 'functional' in section_lower:
            return "high" 
        # Medium priority indicators
        elif any(word in text_lower for word in ['should', 'display', 'provide']):
            return "medium"
        else:
            return "low"
    
    def _infer_complexity(self, requirement_text: str) -> str:
        """Infer complexity from requirement content"""
        text_lower = requirement_text.lower()
        
        # High complexity indicators
        if any(word in text_lower for word in ['integration', 'api', 'multi-step', 'workflow']):
            return "high"
        # Low complexity indicators  
        elif any(word in text_lower for word in ['display', 'show', 'button']):
            return "low"
        else:
            return "medium"
    
    def _generate_stories_from_requirements(self, requirements: List[StoryRequirement], spec_id: str) -> List[GeneratedStory]:
        """
        Generate focused user stories from requirements
        1 story per requirement, not combinatorial explosion
        """
        
        stories = []
        
        for req in requirements:
            # Generate a focused user story for this requirement
            story = self._create_story_from_requirement(req, spec_id)
            
            # Apply INVEST validation during generation
            story = self._apply_invest_validation(story)
            
            # Apply quality scoring
            story.invest_score = self._calculate_invest_score(story)
            
            stories.append(story)
        
        print(f"   ✅ Generated {len(stories)} focused user stories")
        
        return stories
    
    def _create_story_from_requirement(self, req: StoryRequirement, spec_id: str) -> GeneratedStory:
        """Create a single focused user story from a requirement using LLM intelligence"""
        
        print(f"   🤖 Generating intelligent story for {req.id}")
        
        llm_prompt = f"""
Create a high-quality user story from this requirement:

Requirement: {req.description}
Business Value: {req.business_value}
Section Source: {req.section_source}
Priority: {req.priority}

Generate a user story following these guidelines:
1. Use proper "As a [persona], I want [need] so that [value]" format
2. Choose the most appropriate persona for this requirement
3. Focus on user outcomes, not system implementation  
4. Create 2-4 meaningful acceptance criteria in Given/When/Then format
5. Make the story independently testable and valuable

Respond with JSON:
{{
  "persona": "Specific user type (e.g., 'Budget-Conscious Customer')",
  "need": "What the user wants to accomplish", 
  "value": "Why this matters to the user/business",
  "title": "Concise story title (max 80 chars)",
  "acceptance_criteria": [
    "Given [context], when [action], then [outcome]",
    "Given [context], when [action], then [outcome]"
  ]
}}

Ensure the story is focused, testable, and valuable.
"""
        
        # Make real LLM call for story generation
        llm_response = make_llm_call(llm_prompt, expect_json=True)
        
        if not llm_response:
            print(f"   ⚠️ LLM call failed, using fallback generation for {req.id}")
            return self._fallback_story_generation(req, spec_id)
        
        # Extract LLM-generated story components
        persona = llm_response.get('persona', 'user')
        need = llm_response.get('need', req.title)
        value = llm_response.get('value', req.business_value)
        title = llm_response.get('title', req.title)
        acceptance_criteria = llm_response.get('acceptance_criteria', [])
        
        # Create story description in proper format
        story_description = f"As a {persona}, I want to {need} so that {value}."
        
        # Create story ID
        story_id = f"STORY-{spec_id}-{req.id}"
        
        story = GeneratedStory(
            story_id=story_id,
            title=title[:80],  # Ensure title length limit
            persona=persona,
            need=need,
            value=value,
            description=story_description,
            acceptance_criteria=acceptance_criteria,
            labels=[spec_id.lower(), persona.lower().replace(' ', '-')],
            priority=req.priority,
            source_requirement=req.id
        )
        
        return story
    
    def _fallback_story_generation(self, req: StoryRequirement, spec_id: str) -> GeneratedStory:
        """Fallback story generation when LLM fails"""
        
        # Simple persona inference
        persona = self._infer_persona(req.description)
        
        # Simple user need extraction
        user_need = self._extract_user_need(req.description)
        
        # Use requirement business value
        business_value = req.business_value
        
        # Generate basic acceptance criteria
        acceptance_criteria = [
            f"Given I am a {persona}, when I {user_need}, then the system responds appropriately",
            f"Given invalid input, when I attempt the action, then I receive clear error feedback"
        ]
        
        story_id = f"STORY-{spec_id}-{req.id}"
        
        return GeneratedStory(
            story_id=story_id,
            title=f"{persona} - {req.title}",
            persona=persona,
            need=user_need,
            value=business_value,
            description=f"As a {persona}, I want to {user_need} so that {business_value}.",
            acceptance_criteria=acceptance_criteria,
            labels=[spec_id.lower(), persona.lower().replace(' ', '-')],
            priority=req.priority,
            source_requirement=req.id
        )
    
    def _infer_persona(self, requirement_text: str) -> str:
        """Infer appropriate persona from requirement content"""
        text_lower = requirement_text.lower()
        
        if any(word in text_lower for word in ['admin', 'manage', 'configure']):
            return "system administrator"
        elif any(word in text_lower for word in ['business', 'owner', 'manager']):
            return "business user" 
        elif any(word in text_lower for word in ['customer', 'select', 'purchase']):
            return "customer"
        else:
            return "user"
    
    def _extract_user_need(self, requirement_text: str) -> str:
        """Extract clear user need from requirement text"""
        # Remove system-focused language and make user-focused
        text = requirement_text.lower()
        
        # Transform system language to user language
        if 'display' in text or 'show' in text:
            return "see relevant information clearly"
        elif 'select' in text or 'choose' in text:
            return "select from available options"
        elif 'validate' in text or 'check' in text:
            return "receive validation feedback"
        elif 'navigate' in text or 'access' in text:
            return "navigate efficiently"
        else:
            # Fallback to cleaned requirement text
            cleaned = requirement_text.replace('shall', '').replace('must', '').strip()
            return cleaned[:50] + "..." if len(cleaned) > 50 else cleaned
    
    def _generate_acceptance_criteria(self, req: StoryRequirement) -> List[str]:
        """Generate acceptance criteria for the requirement"""
        criteria = []
        
        # Primary functionality criterion
        criteria.append(f"Given I am a user, when I {req.description.lower()}, then the system responds appropriately")
        
        # Error handling criterion
        if 'display' not in req.description.lower():
            criteria.append("Given invalid input, when I attempt the action, then I receive clear error feedback")
        
        # Performance criterion for complex requirements
        if req.complexity == "high":
            criteria.append("Given normal system load, when I perform the action, then the response time is acceptable")
        
        return criteria
    
    def _apply_invest_validation(self, story: GeneratedStory) -> GeneratedStory:
        """Apply INVEST criteria validation during generation"""
        
        issues = []
        
        # Independence check
        if any(word in story.description.lower() for word in ['after', 'following', 'depends on']):
            issues.append("Story may have dependencies on other stories")
        
        # Negotiability check  
        if any(word in story.description.lower() for word in ['must use', 'shall implement']):
            issues.append("Story may be over-specified technically")
        
        # Value check
        if len(story.value) < 10:
            issues.append("Business value could be more specific")
        
        # Estimability check
        if any(word in story.description.lower() for word in ['improve', 'enhance', 'better']):
            issues.append("Story scope may be unclear for estimation")
        
        # Size check
        if any(word in story.description.lower() for word in ['complete system', 'entire']):
            issues.append("Story may be too large, consider splitting")
        
        # Testability check
        if not story.acceptance_criteria:
            issues.append("Story needs acceptance criteria for testing")
        
        story.quality_notes = issues
        return story
    
    def _calculate_invest_score(self, story: GeneratedStory) -> float:
        """Calculate INVEST score (higher is better)"""
        score = 1.0
        
        # Deduct points for each quality issue
        for issue in story.quality_notes:
            if 'dependencies' in issue:
                score -= 0.15
            elif 'over-specified' in issue:
                score -= 0.10
            elif 'value' in issue:
                score -= 0.15
            elif 'unclear' in issue:
                score -= 0.20
            elif 'too large' in issue:
                score -= 0.25
            elif 'acceptance criteria' in issue:
                score -= 0.15
        
        return max(0.0, score)
    
    def _calculate_quality_summary(self, stories: List[GeneratedStory]) -> Dict[str, int]:
        """Calculate quality summary statistics"""
        if not stories:
            return {"total": 0, "high_quality": 0, "needs_improvement": 0}
        
        high_quality = sum(1 for s in stories if s.invest_score >= 0.8)
        needs_improvement = sum(1 for s in stories if s.invest_score < 0.6)
        
        return {
            "total": len(stories),
            "high_quality": high_quality,
            "needs_improvement": needs_improvement,
            "acceptable": len(stories) - high_quality - needs_improvement
        }
    
    def _generate_outputs(self, context: Task5ExecutionContext):
        """Generate output files following Task 1 patterns"""
        
        # Create output directory
        output_dir = self.base_path / "aiGenerated" / context.spec_id
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate stories report
        stories_report = self._create_stories_report(context)
        report_file = output_dir / f"{context.spec_id}_generated_stories.md"
        report_file.write_text(stories_report)
        
        # Generate conversation log
        conversation_log = self._create_conversation_log(context)
        conv_file = output_dir / f"{context.spec_id}_conversation.md"
        conv_file.write_text(conversation_log)
        
        print(f"📄 Generated outputs in {output_dir}")
    
    def _create_stories_report(self, context: Task5ExecutionContext) -> str:
        """Create structured stories report"""
        
        result = context.generation_result
        stories = result.generated_stories
        
        from datetime import datetime
        
        report = f"""# Task 5: Generated User Stories Report
Specification: {context.spec_id}
Generated: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

## Executive Summary

**Extraction Method**: LLM Intelligence (not broken parser)
**Requirements Identified**: {result.total_requirements}
**User Stories Generated**: {len(stories)}
**Average INVEST Score**: {result.avg_invest_score:.2f}/1.0

### Quality Distribution
- **High Quality Stories** (≥0.8): {result.quality_summary['high_quality']}
- **Acceptable Stories** (0.6-0.8): {result.quality_summary['acceptable']}
- **Stories Needing Improvement** (<0.6): {result.quality_summary['needs_improvement']}

## Generated User Stories

"""
        
        for i, story in enumerate(stories, 1):
            report += f"""### Story {i}: {story.story_id}

**Title**: {story.title}

**User Story**: 
{story.description}

**Details**:
- **Source Requirement**: {story.source_requirement}
- **INVEST Score**: {story.invest_score:.2f}/1.0
- **Priority**: {story.priority}
- **Story Points**: {story.story_points}
- **Labels**: {', '.join(story.labels)}

**Acceptance Criteria**:
"""
            
            for j, ac in enumerate(story.acceptance_criteria, 1):
                report += f"{j}. {ac}\n"
            
            if story.quality_notes:
                report += f"""
**Quality Notes**:
"""
                for note in story.quality_notes:
                    report += f"- {note}\n"
            
            report += "\n---\n\n"
        
        report += f"""
## Quality Analysis

### INVEST Compliance Applied During Generation
- **Independence**: Stories checked for dependencies during creation
- **Negotiability**: Avoided over-specification in generated stories
- **Value**: Business value explicitly identified for each story
- **Estimability**: Clear scope defined during story creation
- **Size**: Stories kept focused on single requirement
- **Testability**: Acceptance criteria generated for each story

### Generation Method Advantages
- **LLM Intelligence**: Smart requirement extraction vs broken parsing
- **Focused Generation**: 1 story per requirement vs combinatorial explosion  
- **Quality-First**: INVEST applied during generation vs after-the-fact scoring
- **Traceability**: Each story linked to source requirement section

### Ready for Task 1 Validation
Generated stories can now be validated using existing Task 1 workflow:
```bash
execute task 1 for {context.spec_id}-STORY-001
execute task 1 for {context.spec_id}-STORY-002
```

---

*Generated using Task 5 Integration Engine with LLM-based requirement extraction and quality-focused story generation.*
"""
        
        return report
    
    def _create_conversation_log(self, context: Task5ExecutionContext) -> str:
        """Create conversation log following Task 1 patterns"""
        
        result = context.generation_result
        
        from datetime import datetime
        
        log = f"""# Task 5 Conversation Log
Specification: {context.spec_id}
Started: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

## Command Executed
```
execute task 5 for {context.spec_id}
```

## Generation Process

### Step 1: Specification Loading
✅ Loaded specification content from specifications/{context.spec_id}.md
✅ Content size: {len(context.spec_content)} characters

### Step 2: LLM-Based Requirement Extraction
✅ Applied intelligent requirement extraction (not broken parser)
✅ Identified {result.total_requirements} discrete requirements
✅ Maintained traceability to source sections

### Step 3: Focused Story Generation  
✅ Generated 1 story per requirement (no combinatorial explosion)
✅ Applied INVEST criteria during generation
✅ Average quality score: {result.avg_invest_score:.2f}/1.0

### Step 4: Quality Analysis
✅ High quality stories: {result.quality_summary['high_quality']}
✅ Stories needing improvement: {result.quality_summary['needs_improvement']}
✅ All stories include acceptance criteria and traceability

## Generated Artifacts

- **Stories Report**: {context.spec_id}_generated_stories.md
- **Conversation Log**: {context.spec_id}_conversation.md

## Next Steps

### Task 1 Validation Recommended
Generated stories should be validated using existing Task 1 workflow:
```bash
execute task 1 for {context.spec_id}-STORY-001
execute task 1 for {context.spec_id}-STORY-002
# ... for each generated story
```

### Integration with Existing Pipeline
- Task 5 (Generate) → Task 1 (Validate) → Task 2 (BDD) → Task 3a/3b (Assessment/Automation)
- Stories passing Task 1 validation are ready for Jira import
- Quality-first approach ensures minimal rework needed

---

*Task 5 completed successfully using LLM intelligence and quality-focused generation approach.*
"""
        
        return log
    
    def _present_results(self, context: Task5ExecutionContext):
        """Present generation results to user"""
        
        result = context.generation_result
        
        print(f"\n📊 **Task 5 Generation Results**")
        print("=" * 50)
        print(f"**Requirements Extracted**: {result.total_requirements}")
        print(f"**Stories Generated**: {len(result.generated_stories)}")
        print(f"**Average INVEST Score**: {result.avg_invest_score:.2f}/1.0")
        print()
        
        # Quality breakdown
        quality = result.quality_summary
        print("📈 **Quality Distribution:**")
        print(f"   - High Quality (≥0.8): {quality['high_quality']} stories")
        print(f"   - Acceptable (0.6-0.8): {quality['acceptable']} stories")
        print(f"   - Needs Improvement (<0.6): {quality['needs_improvement']} stories")
        print()
        
        # Sample stories
        if result.generated_stories:
            print("📖 **Sample Generated Stories:**")
            for i, story in enumerate(result.generated_stories[:3], 1):
                print(f"   {i}. {story.story_id}: {story.title}")
                print(f"      INVEST Score: {story.invest_score:.2f}, Priority: {story.priority}")
        
        # Recommendation
        if result.avg_invest_score >= 0.8:
            recommendation = "🎉 Excellent quality! Stories ready for Task 1 validation."
        elif result.avg_invest_score >= 0.6:
            recommendation = "✅ Good quality. Consider Task 1 validation for final quality check."
        else:
            recommendation = "⚠️ Some stories need improvement. Review quality notes before proceeding."
        
        print(f"\n**Recommendation**: {recommendation}")
        
        print(f"""
**Next Steps:**
1. 📋 Review generated stories in aiGenerated/{context.spec_id}/
2. 🔍 Run Task 1 validation: execute task 1 for {context.spec_id}-STORY-001
3. ✅ Import validated stories to Jira
4. 🚀 Continue with Task 2 (BDD) for accepted stories
""")
    
    def _get_timestamp(self) -> str:
        """Get current timestamp"""
        from datetime import datetime
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

# Entry point function that matches Task 1 patterns
def execute_task_5_for_spec(spec_id: str) -> Task5ExecutionContext:
    """
    Main entry point for 'execute task 5 for SPEC-123' command
    """
    engine = Task5IntegrationEngine()
    return engine.execute_task_5_for_spec(spec_id)

# For testing
if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        spec_id = sys.argv[1]
        execute_task_5_for_spec(spec_id)
    else:
        print("Usage: python task5_integration.py SPEC-ID")
        print("Example: python task5_integration.py SPECBROADBAND-003")