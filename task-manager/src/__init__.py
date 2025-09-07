"""
Task Manager Code - Context-organized business analyst workflow system

Organized by concern/context:
- parsing: Specification and input processing
- validation: Quality gates and requirement analysis  
- generation: Story creation and user story generation
- output: Formatting, export, and report generation
- orchestration: Workflow coordination
- tests: All test utilities and test files
"""

from .parsing import SpecificationParser, SpecificationData, PersonaData, BusinessGoal, UserJourney
from .generation import StoryGenerator, UserStory, AcceptanceCriterion
# from .validation import EnhancedCodePatterns  # TODO: Fix validation imports

__all__ = [
    'SpecificationParser', 'SpecificationData', 'PersonaData', 'BusinessGoal', 'UserJourney',
    'StoryGenerator', 'UserStory', 'AcceptanceCriterion'
]