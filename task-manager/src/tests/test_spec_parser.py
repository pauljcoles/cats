#!/usr/bin/env python3
"""
Test script for specification parser
Tests the extended Task1IntegrationEngine with specification parsing
"""

import sys
sys.path.append('/home/pauljcoles/code/cats/task-manager/base-rules/code-rules')

from task1_integration import Task1IntegrationEngine

def test_specification_parser():
    """Test the specification parsing functionality"""
    
    print("🧪 Testing Specification Parser Extension")
    print("=" * 60)
    
    # Initialize the extended integration engine
    engine = Task1IntegrationEngine()
    
    # Test parsing the Mercedes specification
    spec_data = engine.parse_specification_for_analysis("SPECMERCEDES-001")
    
    if spec_data:
        print("\n✅ Parsing successful!")
        print(f"📋 Title: {spec_data.title}")
        print(f"👥 Personas: {len(spec_data.personas)}")
        print(f"🎯 Business Goals: {len(spec_data.business_goals)}")
        print(f"🚶 User Journeys: {len(spec_data.user_journeys)}")
        print(f"⚠️  Constraints: {len(spec_data.constraints)}")
        print(f"💭 Assumptions: {len(spec_data.assumptions)}")
        
        # Show persona details
        if spec_data.personas:
            print(f"\n👥 Persona Details:")
            for persona in spec_data.personas:
                print(f"  - {persona.name}: {persona.role}")
                print(f"    Motivations: {len(persona.motivations)} identified")
        
        # Show business goals
        if spec_data.business_goals:
            print(f"\n🎯 Business Goals:")
            for goal in spec_data.business_goals:
                print(f"  - {goal.goal} (Priority: {goal.priority})")
        
        return True
    else:
        print("\n❌ Parsing failed!")
        return False

if __name__ == "__main__":
    success = test_specification_parser()
    sys.exit(0 if success else 1)