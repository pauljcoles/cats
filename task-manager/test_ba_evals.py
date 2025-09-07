#!/usr/bin/env python3
"""
BA Evaluation Tests

Comprehensive pytest test suite for validating the Business Analyst evaluation system.
Tests specification analysis, story generation quality, and end-to-end workflow validation.

Following existing test_evals_demo.py patterns with pytest integration.
"""

import pytest
import sys
import os
from datetime import datetime
from pathlib import Path

# Add paths for imports
sys.path.append(os.path.join(os.path.dirname(__file__), 'evals'))
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

# Import BA evaluation modules
from evals.spec_analysis_evals import (
    eval_persona_extraction_completeness,
    eval_business_goal_clarity,
    eval_specification_structure
)
from evals.story_generation_evals import (
    eval_invest_compliance_threshold,
    eval_story_traceability,
    eval_acceptance_criteria_quality
)
from evals.ba_workflow_evals import (
    eval_specification_to_story_flow,
    eval_domain_context_consistency,
    eval_quality_feedback_loops
)

# Import core infrastructure
from src.parsing.specification_parser import SpecificationParser, SpecificationData, PersonaData, BusinessGoal
from src.generation.story_generator import StoryGenerator, UserStory, AcceptanceCriterion
from evals.core import EvalResult

class TestSpecificationAnalysis:
    """Test specification analysis evaluation functions."""
    
    def setup_method(self):
        """Set up test fixtures before each test method."""
        self.parser = SpecificationParser()
        self.test_spec_path = Path(__file__).parent / "specifications" / "SPECMERCEDES-001.md"
        
    def test_persona_extraction_completeness_pass(self):
        """Test persona extraction with complete persona data."""
        # Create complete persona for testing
        complete_persona = PersonaData(
            name="Premium Car Buyer",
            role="Affluent Professional", 
            motivations=["Status symbol", "Luxury experience"],
            context="Researches extensively before purchase"
        )
        
        spec_data = SpecificationData(
            spec_id="TEST-001",
            title="Test Specification",
            description="Test description",
            personas=[complete_persona],
            business_goals=[],
            user_journeys=[],
            constraints=[],
            assumptions=[],
            success_criteria=[],
            raw_content="test"
        )
        
        result = eval_persona_extraction_completeness(spec_data)
        assert result.status == "PASS", f"Expected PASS but got: {result.message}"
        assert "complete with required fields" in result.message
    
    def test_persona_extraction_completeness_fail(self):
        """Test persona extraction with incomplete persona data."""
        # Create incomplete persona (missing role and motivations)
        incomplete_persona = PersonaData(
            name="Test User",
            role="",  # Missing
            motivations=[],  # Missing
            context="Test context"
        )
        
        spec_data = SpecificationData(
            spec_id="TEST-002", 
            title="Test Specification",
            description="Test description", 
            personas=[incomplete_persona],
            business_goals=[],
            user_journeys=[],
            constraints=[],
            assumptions=[],
            success_criteria=[],
            raw_content="test"
        )
        
        result = eval_persona_extraction_completeness(spec_data)
        assert result.status == "FAIL", f"Expected FAIL but got: {result.message}"
        assert "Incomplete persona data found" in result.message
    
    def test_business_goal_clarity_pass(self):
        """Test business goal evaluation with clear goals."""
        clear_goal = BusinessGoal(
            goal="Increase premium sales by 15%",
            success_criteria=["15% increase in premium package sales within 6 months"],
            metrics=["Sales conversion rate", "Average order value"]
        )
        
        spec_data = SpecificationData(
            spec_id="TEST-003",
            title="Test Specification", 
            description="Test description",
            personas=[],
            business_goals=[clear_goal],
            user_journeys=[],
            constraints=[],
            assumptions=[],
            success_criteria=[],
            raw_content="test"
        )
        
        result = eval_business_goal_clarity(spec_data)
        assert result.status == "PASS", f"Expected PASS but got: {result.message}"
        assert "clear success criteria and metrics" in result.message
    
    def test_business_goal_clarity_fail(self):
        """Test business goal evaluation with vague goals."""
        vague_goal = BusinessGoal(
            goal="Make things better",
            success_criteria=[],  # Missing
            metrics=[]  # Missing
        )
        
        spec_data = SpecificationData(
            spec_id="TEST-004",
            title="Test Specification",
            description="Test description", 
            personas=[],
            business_goals=[vague_goal],
            user_journeys=[],
            constraints=[],
            assumptions=[],
            success_criteria=[],
            raw_content="test"
        )
        
        result = eval_business_goal_clarity(spec_data)
        assert result.status == "FAIL", f"Expected FAIL but got: {result.message}"
        assert "lack clarity or measurability" in result.message

class TestStoryGeneration:
    """Test story generation evaluation functions."""
    
    def setup_method(self):
        """Set up test fixtures before each test method."""
        self.generator = StoryGenerator()
        self.parser = SpecificationParser()
    
    def test_invest_threshold_compliance_pass(self):
        """Test INVEST compliance with high-quality stories."""
        high_quality_story = UserStory(
            story_id="STORY-001",
            title="Premium Feature Access",
            persona="Premium Car Buyer",
            need="access exclusive premium features",
            value="experience luxury customization options",
            description="As a Premium Car Buyer, I want to access exclusive premium features so that I can experience luxury customization options.",
            acceptance_criteria=[
                AcceptanceCriterion(
                    given="I am a Premium Car Buyer on the configuration page",
                    when="I navigate to premium features section", 
                    then="I can see all available premium customization options"
                )
            ],
            invest_score=0.95  # High INVEST score
        )
        
        result = eval_invest_compliance_threshold([high_quality_story])
        assert result.status == "PASS", f"Expected PASS but got: {result.message}"
        assert "meet 0.8+ INVEST threshold" in result.message
    
    def test_invest_threshold_compliance_fail(self):
        """Test INVEST compliance with low-quality stories."""
        low_quality_story = UserStory(
            story_id="STORY-002",
            title="Bad Story",
            persona="Vague User",
            need="do stuff",
            value="get things", 
            description="Vague and poorly defined story",
            acceptance_criteria=[],
            invest_score=0.5  # Below threshold
        )
        
        result = eval_invest_compliance_threshold([low_quality_story])
        assert result.status == "FAIL", f"Expected FAIL but got: {result.message}"
        assert "below 0.8 INVEST threshold" in result.message
    
    def test_story_traceability_pass(self):
        """Test story traceability with properly mapped personas."""
        persona = PersonaData(
            name="Premium Car Buyer",
            role="Affluent Professional",
            motivations=["Status", "Quality"],
            context="Luxury market"
        )
        
        spec_data = SpecificationData(
            spec_id="TEST-005",
            title="Test Specification",
            description="Test description",
            personas=[persona],
            business_goals=[],
            user_journeys=[],
            constraints=[],
            assumptions=[],
            success_criteria=[],
            raw_content="test"
        )
        
        traced_story = UserStory(
            story_id="STORY-003", 
            title="Premium Features",
            persona="Premium Car Buyer",  # Matches spec persona
            need="access premium options",
            value="luxury experience",
            description="Traced story",
            acceptance_criteria=[],
            invest_score=0.8
        )
        
        result = eval_story_traceability([traced_story], spec_data)
        assert result.status == "PASS", f"Expected PASS but got: {result.message}"
        assert "properly traced to specification personas" in result.message

class TestBAWorkflow:
    """Test end-to-end BA workflow evaluation functions."""
    
    def setup_method(self):
        """Set up test fixtures before each test method."""
        self.parser = SpecificationParser()
        self.generator = StoryGenerator()
    
    def test_end_to_end_ba_workflow_with_real_data(self):
        """Test complete BA workflow with real Mercedes specification."""
        if not self.parser or not self.generator:
            pytest.skip("Parser or generator not available")
            
        # Load real specification
        spec_path = Path(__file__).parent / "specifications" / "SPECMERCEDES-001.md"
        if not spec_path.exists():
            pytest.skip(f"Test specification not found at {spec_path}")
        
        with open(spec_path, 'r') as f:
            content = f.read()
        
        # Parse specification and generate stories
        spec_data = self.parser.parse_specification(content, 'PYTEST-001')
        stories = self.generator.generate_stories_from_spec(spec_data, 'mercedes')
        
        # Test workflow evaluation
        workflow_result = eval_specification_to_story_flow(spec_data, stories)
        
        # Workflow should provide meaningful evaluation even if some components fail
        assert workflow_result.eval_name == "eval_specification_to_story_flow"
        assert workflow_result.message is not None
        assert "workflow" in workflow_result.message.lower()
        
        # Details should include evaluation breakdown
        assert "evaluation_results" in workflow_result.details
        assert "quality_score" in workflow_result.details
        assert len(stories) > 0, "Should have generated stories for testing"
    
    def test_domain_context_consistency_mercedes(self):
        """Test domain consistency validation for Mercedes domain."""
        persona = PersonaData(
            name="Premium Car Buyer",
            role="Mercedes Customer",
            motivations=["Luxury", "Status"],
            context="Premium market"
        )
        
        spec_data = SpecificationData(
            spec_id="TEST-006",
            title="Mercedes Premium Features",
            description="Mercedes-specific features",
            personas=[persona],
            business_goals=[],
            user_journeys=[],
            constraints=[],
            assumptions=[], 
            success_criteria=[],
            raw_content="Mercedes premium configuration"
        )
        
        mercedes_story = UserStory(
            story_id="STORY-004",
            title="AMG Performance Package",
            persona="Premium Car Buyer", 
            need="select AMG performance options",
            value="experience Mercedes performance luxury",
            description="Mercedes-specific story with appropriate terminology",
            acceptance_criteria=[],
            invest_score=0.9
        )
        
        result = eval_domain_context_consistency(spec_data, [mercedes_story], 'mercedes')
        assert result.status == "PASS", f"Expected PASS but got: {result.message}"
        assert "consistent across" in result.message
    
    def test_quality_feedback_loops(self):
        """Test quality feedback loop assessment."""
        persona = PersonaData(
            name="Test Buyer",
            role="Test Role", 
            motivations=["Test motivation"],
            context="Test context"
        )
        
        goal = BusinessGoal(
            goal="Test goal",
            success_criteria=["Measurable criteria"],
            metrics=["Test metric"]
        )
        
        spec_data = SpecificationData(
            spec_id="TEST-007",
            title="Test Specification",
            description="Test description",
            personas=[persona],
            business_goals=[goal],
            user_journeys=[],
            constraints=["Test constraint"],
            assumptions=["Test assumption"],
            success_criteria=["Test success"],
            raw_content="test"
        )
        
        story_with_feedback = UserStory(
            story_id="STORY-005",
            title="Test Story",
            persona="Test Buyer",
            need="test functionality", 
            value="validate system",
            description="Story with quality feedback",
            acceptance_criteria=[
                AcceptanceCriterion(
                    given="Given proper test setup",
                    when="When I execute test action",
                    then="Then I should see expected result"
                )
            ],
            invest_score=0.85,
            quality_notes=["Consider adding more specific acceptance criteria", "Discuss edge case handling"]
        )
        
        result = eval_quality_feedback_loops(spec_data, [story_with_feedback])
        assert result.status == "PASS", f"Expected PASS but got: {result.message}"
        assert "feedback loops functional" in result.message

class TestIntegration:
    """Integration tests for the complete BA evaluation system."""
    
    def test_all_ba_evaluations_importable(self):
        """Test that all BA evaluation functions can be imported."""
        # This test verifies the module integration works correctly
        from evals import (
            eval_persona_extraction_completeness,
            eval_business_goal_clarity, 
            eval_specification_structure,
            eval_invest_compliance_threshold,
            eval_story_traceability,
            eval_acceptance_criteria_quality,
            eval_specification_to_story_flow,
            eval_domain_context_consistency, 
            eval_quality_feedback_loops
        )
        
        # Verify all functions are callable
        assert callable(eval_persona_extraction_completeness)
        assert callable(eval_business_goal_clarity)
        assert callable(eval_specification_structure)
        assert callable(eval_invest_compliance_threshold)
        assert callable(eval_story_traceability)
        assert callable(eval_acceptance_criteria_quality)
        assert callable(eval_specification_to_story_flow)
        assert callable(eval_domain_context_consistency)
        assert callable(eval_quality_feedback_loops)
    
    def test_eval_result_consistency(self):
        """Test that all evaluations return consistent EvalResult objects."""
        # Create minimal test data
        persona = PersonaData(name="Test", role="Test", motivations=["Test"], context="Test")
        goal = BusinessGoal(goal="Test", success_criteria=["Test"], metrics=["Test"])
        spec_data = SpecificationData(
            spec_id="CONSISTENCY-TEST", title="Test", description="Test",
            personas=[persona], business_goals=[goal], user_journeys=[],
            constraints=[], assumptions=[], success_criteria=[], raw_content="test"
        )
        
        story = UserStory(
            story_id="STORY-CONSISTENCY", title="Test", persona="Test", 
            need="test", value="test", description="Test",
            acceptance_criteria=[], invest_score=0.85
        )
        
        # Test all evaluation functions return EvalResult objects
        evaluations = [
            eval_persona_extraction_completeness(spec_data),
            eval_business_goal_clarity(spec_data),
            eval_specification_structure(spec_data),
            eval_invest_compliance_threshold([story]),
            eval_story_traceability([story], spec_data),
            eval_acceptance_criteria_quality([story]),
            eval_specification_to_story_flow(spec_data, [story]),
            eval_domain_context_consistency(spec_data, [story]),
            eval_quality_feedback_loops(spec_data, [story])
        ]
        
        for eval_result in evaluations:
            assert isinstance(eval_result, EvalResult), f"Expected EvalResult, got {type(eval_result)}"
            assert eval_result.eval_name is not None, "eval_name should not be None"
            assert eval_result.status in ["PASS", "FAIL"], f"Invalid status: {eval_result.status}"
            assert eval_result.message is not None, "message should not be None"
            assert eval_result.timestamp is not None, "timestamp should not be None"

if __name__ == "__main__":
    # Run tests when executed directly
    pytest.main([__file__, "-v"])