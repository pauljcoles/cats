#!/usr/bin/env python3
"""
Test script for SPECBROADBAND-001 story generation
"""

import sys
import os
sys.path.append('/home/pauljcoles/code/cats/task-manager')

from src.parsing.specification_parser import SpecificationParser
from src.generation.story_generator import StoryGenerator

def test_broadband_story_generation():
    """Test story generation from broadband specification"""
    
    print("🧪 Testing SPECBROADBAND-001 Story Generation")
    print("=" * 60)
    
    # Initialize components
    parser = SpecificationParser()
    generator = StoryGenerator()
    
    # Load and parse the broadband specification
    spec_file = "/home/pauljcoles/code/cats/task-manager/specifications/SPECBROADBAND-003.md"
    
    try:
        with open(spec_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        print(f"📋 Loaded broadband specification")
        
        # Parse specification  
        spec_data = parser.parse_specification(content, "SPECBROADBAND-003")
        print(f"✅ Parsed specification: {spec_data.title}")
        print(f"   - Personas: {len(spec_data.personas)}")
        print(f"   - Business Goals: {len(spec_data.business_goals)}")
        print(f"   - User Journeys: {len(spec_data.user_journeys)}")
        print(f"   - Constraints: {len(spec_data.constraints)}")
        
        # Show a few sample personas for debugging
        print(f"\n👥 Sample Personas:")
        for i, persona in enumerate(spec_data.personas[:3]):
            print(f"   {i+1}. {persona.name} - {persona.role}")
            if persona.motivations:
                print(f"      Motivations: {persona.motivations[:2]}")
        
        # Show sample goals
        print(f"\n🎯 Sample Business Goals:")
        for i, goal in enumerate(spec_data.business_goals[:3]):
            print(f"   {i+1}. {goal.goal} (Priority: {goal.priority})")
        
        # Generate stories using "broadband" domain (generic)
        print(f"\n🎯 Generating user stories...")
        stories = generator.generate_stories_from_spec(spec_data, "broadband")
        
        if stories:
            print(f"\n✅ Generated {len(stories)} user stories!")
            
            # Show story details
            for i, story in enumerate(stories[:5], 1):  # Show first 5
                print(f"\n📖 Story {i}: {story.title}")
                print(f"   ID: {story.story_id}")
                print(f"   Description: {story.description[:150]}...")
                print(f"   INVEST Score: {story.invest_score:.2f}")
                print(f"   Priority: {story.priority}")
                print(f"   Story Points: {story.story_points}")
                print(f"   Labels: {', '.join(story.labels)}")
                
                # Show acceptance criteria
                if story.acceptance_criteria:
                    print(f"   Acceptance Criteria:")
                    for j, ac in enumerate(story.acceptance_criteria[:2], 1):
                        print(f"     {j}. ({ac.priority}) Given: {ac.given}")
                        print(f"        When: {ac.when}")  
                        print(f"        Then: {ac.then}")
                
                # Show quality notes
                if story.quality_notes:
                    print(f"   Quality Issues: {len(story.quality_notes)}")
                    for note in story.quality_notes[:2]:
                        print(f"     • {note}")
            
            # Show summary
            avg_invest_score = sum(s.invest_score for s in stories) / len(stories)
            high_quality = sum(1 for s in stories if s.invest_score >= 0.8)
            needs_improvement = sum(1 for s in stories if s.invest_score < 0.6)
            
            print(f"\n📊 Story Quality Summary:")
            print(f"   Average INVEST Score: {avg_invest_score:.2f}")
            print(f"   High Quality Stories (≥0.8): {high_quality}")
            print(f"   Stories Needing Improvement (<0.6): {needs_improvement}")
            
            # Check for API vs Frontend coverage
            api_stories = sum(1 for s in stories if any(keyword in s.description.lower() for keyword in ['api', 'service', 'backend', 'data']))
            frontend_stories = sum(1 for s in stories if any(keyword in s.description.lower() for keyword in ['interface', 'display', 'user', 'frontend', 'page']))
            
            print(f"\n🏗️  Technical Coverage:")
            print(f"   Stories with API/Backend focus: {api_stories}")
            print(f"   Stories with Frontend/UX focus: {frontend_stories}")
            print(f"   General/Business stories: {len(stories) - api_stories - frontend_stories}")
            
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
    success = test_broadband_story_generation()
    sys.exit(0 if success else 1)