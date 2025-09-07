"""
Specification Parser for Business Analyst Workflow
Extends proven task1_integration._parse_ticket_markdown pattern
Extracts personas, business goals, user journeys, and constraints from specifications
"""

import re
import json
from pathlib import Path
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field

@dataclass
class PersonaData:
    name: str
    role: str
    motivations: List[str]
    context: str
    pain_points: List[str] = field(default_factory=list)

@dataclass
class BusinessGoal:
    goal: str
    success_criteria: List[str]
    metrics: List[str] = field(default_factory=list)
    priority: str = "medium"

@dataclass
class UserJourney:
    name: str
    steps: List[str]
    touchpoints: List[str]
    pain_points: List[str] = field(default_factory=list)

@dataclass
class SpecificationData:
    spec_id: str
    title: str
    description: str
    personas: List[PersonaData]
    business_goals: List[BusinessGoal]
    user_journeys: List[UserJourney]
    constraints: List[str]
    assumptions: List[str]
    success_criteria: List[str]
    raw_content: str

class SpecificationParser:
    """
    Extends proven task1_integration._parse_ticket_markdown pattern
    Adds support for extracting business analysis elements from specifications
    """
    
    def __init__(self):
        self.base_path = Path("/home/pauljcoles/code/cats/task-manager")
        self._load_impact_mapping_patterns()
    
    def _load_impact_mapping_patterns(self):
        """Load Impact Mapping patterns from Gojko Adzic patterns file"""
        patterns_file = self.base_path / "knowledge" / "gojko-adzic-patterns.json"
        with open(patterns_file, 'r') as f:
            patterns = json.load(f)
        self.impact_patterns = patterns.get("impact_mapping_analysis", {})
    
    def parse_specification(self, content: str, spec_id: str) -> SpecificationData:
        """
        Parse specification content into structured data
        Follows task1_integration._parse_ticket_markdown pattern
        """
        
        lines = content.split('\n')
        
        # Initialize structure similar to ticket_data pattern
        spec_data = SpecificationData(
            spec_id=spec_id,
            title="",
            description="",
            personas=[],
            business_goals=[],
            user_journeys=[],
            constraints=[],
            assumptions=[],
            success_criteria=[],
            raw_content=content
        )
        
        current_section = None
        content_buffer = []
        
        # Parse using established line-by-line pattern
        for line in lines:
            line = line.strip()
            
            # Extract title (follows existing pattern)
            if line.startswith("Title:") or line.startswith("# "):
                spec_data.title = line.replace("Title:", "").replace("#", "").strip()
            
            # Section detection (extends existing pattern)
            elif self._is_section_header(line):
                # Process any buffered content before switching sections
                if content_buffer and current_section:
                    self._process_section_content(spec_data, current_section, content_buffer)
                    content_buffer = []
                
                current_section = self._detect_section_type(line)
                continue
            
            # Collect content for current section
            elif line and current_section:
                content_buffer.append(line)
        
        # Process final buffered content
        if content_buffer and current_section:
            self._process_section_content(spec_data, current_section, content_buffer)
        
        # Apply Impact Mapping goal validation
        self._validate_business_goals(spec_data)
        
        return spec_data
    
    def _is_section_header(self, line: str) -> bool:
        """Detect section headers in specification"""
        section_patterns = [
            r"^#{1,3}\s*(Business Goals?|Objectives?)",
            r"^#{1,3}\s*(User Personas?|Personas?|Users?)",
            r"^#{1,3}\s*(User Journey|Journey|Flow)",
            r"^#{1,3}\s*(Constraints?|Limitations?)",
            r"^#{1,3}\s*(Assumptions?)",
            r"^#{1,3}\s*(Success Criteria|Acceptance Criteria)",
            r"^#{1,3}\s*(Description|Overview|Summary)",
            r"^(Business Goals?|Objectives?):",
            r"^(User Personas?|Personas?):",
            r"^(User Journey|Journey):",
            r"^(Constraints?|Limitations?):",
            r"^(Assumptions?):",
            r"^(Success Criteria):"
        ]
        
        return any(re.match(pattern, line, re.IGNORECASE) for pattern in section_patterns)
    
    def _detect_section_type(self, line: str) -> str:
        """Determine section type from header"""
        line_lower = line.lower()
        
        if any(keyword in line_lower for keyword in ["business goal", "objective"]):
            return "business_goals"
        elif any(keyword in line_lower for keyword in ["persona", "user"]):
            return "personas"
        elif any(keyword in line_lower for keyword in ["journey", "flow"]):
            return "user_journeys"
        elif any(keyword in line_lower for keyword in ["constraint", "limitation"]):
            return "constraints"
        elif "assumption" in line_lower:
            return "assumptions"
        elif any(keyword in line_lower for keyword in ["success", "criteria", "acceptance"]):
            return "success_criteria"
        elif any(keyword in line_lower for keyword in ["description", "overview", "summary"]):
            return "description"
        
        return "unknown"
    
    def _process_section_content(self, spec_data: SpecificationData, section: str, content: List[str]):
        """Process content for specific section"""
        content_text = " ".join(content)
        
        if section == "description":
            spec_data.description = content_text
        elif section == "business_goals":
            spec_data.business_goals.extend(self._extract_business_goals(content))
        elif section == "personas":
            spec_data.personas.extend(self._extract_personas(content))
        elif section == "user_journeys":
            spec_data.user_journeys.extend(self._extract_user_journeys(content))
        elif section == "constraints":
            spec_data.constraints.extend(self._extract_list_items(content))
        elif section == "assumptions":
            spec_data.assumptions.extend(self._extract_list_items(content))
        elif section == "success_criteria":
            spec_data.success_criteria.extend(self._extract_list_items(content))
    
    def _extract_personas(self, content: List[str]) -> List[PersonaData]:
        """Extract user personas from content"""
        personas = []
        content_text = " ".join(content)
        
        # Look for "As a [persona]" patterns
        as_a_patterns = re.findall(r"As\s+a\s+([^,\n]+)", content_text, re.IGNORECASE)
        
        # Look for persona definitions
        persona_blocks = self._split_persona_blocks(content)
        
        for block in persona_blocks:
            persona = self._parse_persona_block(block)
            if persona:
                personas.append(persona)
        
        # If no structured personas found, create from "As a" patterns
        if not personas and as_a_patterns:
            for persona_text in as_a_patterns:
                personas.append(PersonaData(
                    name=persona_text.strip(),
                    role=persona_text.strip(),
                    motivations=[],
                    context="",
                    pain_points=[]
                ))
        
        return personas
    
    def _extract_business_goals(self, content: List[str]) -> List[BusinessGoal]:
        """Extract business goals and success criteria"""
        goals = []
        content_text = " ".join(content)
        
        # Look for goal indicators using Impact Mapping patterns
        goal_patterns = [
            r"increase\s+([^.]+)",
            r"improve\s+([^.]+)",
            r"reduce\s+([^.]+)",
            r"achieve\s+([^.]+)",
            r"reach\s+([^.]+)"
        ]
        
        for pattern in goal_patterns:
            matches = re.findall(pattern, content_text, re.IGNORECASE)
            for match in matches:
                goals.append(BusinessGoal(
                    goal=match.strip(),
                    success_criteria=[],
                    metrics=[],
                    priority="medium"
                ))
        
        # Extract structured goal blocks
        goal_blocks = self._extract_list_items(content)
        for goal_text in goal_blocks:
            if not any(goal.goal.lower() in goal_text.lower() for goal in goals):
                goals.append(BusinessGoal(
                    goal=goal_text,
                    success_criteria=[],
                    metrics=[],
                    priority="medium"
                ))
        
        return goals
    
    def _extract_user_journeys(self, content: List[str]) -> List[UserJourney]:
        """Extract user journey information"""
        journeys = []
        content_text = " ".join(content)
        
        # Look for step patterns
        steps = []
        for line in content:
            if re.match(r"^\d+\.", line.strip()) or line.strip().startswith("- "):
                step = re.sub(r"^\d+\.\s*|-\s*", "", line.strip())
                steps.append(step)
        
        if steps:
            journeys.append(UserJourney(
                name="User Journey",
                steps=steps,
                touchpoints=[],
                pain_points=[]
            ))
        
        return journeys
    
    def _extract_list_items(self, content: List[str]) -> List[str]:
        """Extract list items from content"""
        items = []
        
        for line in content:
            line = line.strip()
            if line.startswith("- ") or line.startswith("* ") or re.match(r"^\d+\.", line):
                item = re.sub(r"^[-*]\s*|\d+\.\s*", "", line)
                if item:
                    items.append(item)
            elif line and not any(line.startswith(marker) for marker in ["#", "##", "###"]):
                items.append(line)
        
        return items
    
    def _split_persona_blocks(self, content: List[str]) -> List[List[str]]:
        """Split content into persona blocks"""
        blocks = []
        current_block = []
        
        for line in content:
            if line.strip().startswith("##") or (line.strip().startswith("**") and ":" in line):
                if current_block:
                    blocks.append(current_block)
                current_block = [line]
            elif current_block:
                current_block.append(line)
        
        if current_block:
            blocks.append(current_block)
        
        return blocks
    
    def _parse_persona_block(self, block: List[str]) -> Optional[PersonaData]:
        """Parse a persona block into PersonaData"""
        if not block:
            return None
        
        content = " ".join(block)
        
        # Extract persona name from header
        name_match = re.search(r"##\s*(.+)|^\*\*(.+)\*\*", block[0])
        name = name_match.group(1) or name_match.group(2) if name_match else "Unknown Persona"
        
        # Extract motivations, pain points, etc.
        motivations = []
        pain_points = []
        context = ""
        
        # Look for motivation indicators
        motivation_patterns = [
            r"wants?\s+to\s+([^.]+)",
            r"needs?\s+to\s+([^.]+)",
            r"motivated\s+by\s+([^.]+)"
        ]
        
        for pattern in motivation_patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            motivations.extend([match.strip() for match in matches])
        
        # Extract context from description
        context = content[:200] + "..." if len(content) > 200 else content
        
        return PersonaData(
            name=name.strip(),
            role=name.strip(),
            motivations=motivations,
            context=context,
            pain_points=pain_points
        )
    
    def _validate_business_goals(self, spec_data: SpecificationData):
        """Apply Impact Mapping validation to business goals"""
        if not self.impact_patterns:
            return
        
        goal_patterns = self.impact_patterns.get("goal_alignment_analysis", {}).get("violation_indicators", {})
        
        for goal in spec_data.business_goals:
            goal_text = goal.goal.lower()
            
            # Check for vague business value
            vague_patterns = goal_patterns.get("vague_business_value", {}).get("patterns", [])
            if any(pattern in goal_text for pattern in vague_patterns):
                goal.priority = "low"
            
            # Check for missing goal connection  
            missing_patterns = goal_patterns.get("missing_goal_connection", {}).get("patterns", [])
            if any(pattern in goal_text for pattern in missing_patterns):
                goal.priority = "review"