#!/usr/bin/env python3
"""
Test the new context-based code structure
"""

import sys
import os
sys.path.append('/home/pauljcoles/code/cats/task-manager')

# Change to the correct directory
os.chdir('/home/pauljcoles/code/cats/task-manager')

from src.parsing.specification_parser import SpecificationParser
from src.generation.story_generator import StoryGenerator

def test_new_structure():
    """Test that the new structure works"""
    
    print("🧪 Testing new context-based structure")
    print("=" * 50)
    
    try:
        # Test parsing module
        parser = SpecificationParser()
        print("✅ SpecificationParser imported successfully")
        
        # Test generation module  
        generator = StoryGenerator()
        print("✅ StoryGenerator imported successfully")
        
        # Test the workflow
        spec_file = "/home/pauljcoles/code/cats/task-manager/specifications/SPECMERCEDES-001.md"
        
        with open(spec_file, 'r') as f:
            content = f.read()
        
        # Parse specification
        spec_data = parser.parse_specification(content, "SPECMERCEDES-001")
        print(f"✅ Parsed specification: {spec_data.title}")
        print(f"   - Personas: {len(spec_data.personas)}")
        print(f"   - Business Goals: {len(spec_data.business_goals)}")
        
        # Generate first story to test
        if spec_data.personas and spec_data.business_goals:
            story = generator._generate_story_for_persona_goal(
                spec_data, 
                spec_data.personas[0], 
                spec_data.business_goals[0]
            )
            
            if story:
                print(f"✅ Generated test story: {story.title}")
                print(f"   Description: {story.description[:100]}...")
            
        print("\n🎉 New context-based structure is working!")
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_new_structure()
    sys.exit(0 if success else 1)