#!/usr/bin/env python3
"""
Test script for specification parser only (avoiding circular imports)
"""

import sys
sys.path.append('/home/pauljcoles/code/cats/task-manager/base-rules/code-rules')

from specification_parser import SpecificationParser

def test_parser_only():
    """Test the specification parser directly"""
    
    print("🧪 Testing SpecificationParser Directly")
    print("=" * 60)
    
    # Initialize the parser
    parser = SpecificationParser()
    
    # Load the test specification content
    spec_file = "/home/pauljcoles/code/cats/task-manager/specifications/SPECMERCEDES-001.md"
    
    try:
        with open(spec_file, 'r') as f:
            content = f.read()
        
        print(f"📋 Loaded specification content ({len(content)} characters)")
        
        # Parse the specification
        spec_data = parser.parse_specification(content, "SPECMERCEDES-001")
        
        print("\n✅ Parsing successful!")
        print(f"📋 Title: {spec_data.title}")
        print(f"👥 Personas: {len(spec_data.personas)}")
        print(f"🎯 Business Goals: {len(spec_data.business_goals)}")
        print(f"🚶 User Journeys: {len(spec_data.user_journeys)}")
        print(f"⚠️  Constraints: {len(spec_data.constraints)}")
        print(f"💭 Assumptions: {len(spec_data.assumptions)}")
        print(f"🎯 Success Criteria: {len(spec_data.success_criteria)}")
        
        # Show persona details
        if spec_data.personas:
            print(f"\n👥 Persona Details:")
            for persona in spec_data.personas:
                print(f"  - {persona.name}")
                print(f"    Role: {persona.role}")
                print(f"    Motivations: {len(persona.motivations)} identified")
                if persona.motivations:
                    for motivation in persona.motivations[:2]:  # Show first 2
                        print(f"      • {motivation}")
        
        # Show business goals
        if spec_data.business_goals:
            print(f"\n🎯 Business Goals:")
            for goal in spec_data.business_goals[:3]:  # Show first 3
                print(f"  - {goal.goal} (Priority: {goal.priority})")
        
        # Show user journey
        if spec_data.user_journeys:
            print(f"\n🚶 User Journey Steps:")
            for journey in spec_data.user_journeys:
                print(f"  Journey: {journey.name}")
                for step in journey.steps[:3]:  # Show first 3 steps
                    print(f"    {step}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    success = test_parser_only()
    sys.exit(0 if success else 1)