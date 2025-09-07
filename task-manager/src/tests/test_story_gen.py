#!/usr/bin/env python3
"""
Test script for StoryGenerator (local directory)
"""

from ..generation.story_generator import StoryGenerator
from ..parsing.specification_parser import SpecificationParser

def test_story_generator():
    """Test the story generation functionality"""
    
    print("🧪 Testing StoryGenerator with Gojko Patterns")
    print("=" * 60)
    
    # Initialize components
    parser = SpecificationParser()
    generator = StoryGenerator()
    
    # Load and parse the test specification
    spec_file = "/home/pauljcoles/code/cats/task-manager/specifications/SPECMERCEDES-001.md"
    
    try:
        with open(spec_file, 'r') as f:
            content = f.read()
        
        print(f"📋 Loaded specification content")
        
        # Parse specification  
        spec_data = parser.parse_specification(content, "SPECMERCEDES-001")
        print(f"✅ Parsed specification: {spec_data.title}")
        print(f"   - Personas: {len(spec_data.personas)}")
        print(f"   - Business Goals: {len(spec_data.business_goals)}")
        
        # Generate stories
        print(f"\n🎯 Generating user stories...")
        stories = generator.generate_stories_from_spec(spec_data, "mercedes")
        
        if stories:
            print(f"\n✅ Generated {len(stories)} user stories!")
            
            # Show story details
            for i, story in enumerate(stories[:2], 1):  # Show first 2
                print(f"\n📖 Story {i}: {story.title}")
                print(f"   Description: {story.description}")
                print(f"   INVEST Score: {story.invest_score:.2f}")
                print(f"   Priority: {story.priority}")
                print(f"   Labels: {', '.join(story.labels)}")
                
                # Show acceptance criteria
                if story.acceptance_criteria:
                    print(f"   Acceptance Criteria ({len(story.acceptance_criteria)}):")
                    for j, ac in enumerate(story.acceptance_criteria[:2], 1):  # Show first 2
                        print(f"     {j}. Given: {ac.given}")
                        print(f"        When: {ac.when}")  
                        print(f"        Then: {ac.then}")
            
            return True
        else:
            print("❌ No stories generated!")
            return False
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_story_generator()