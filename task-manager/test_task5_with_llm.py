#!/usr/bin/env python3
"""
Test Task 5 with real LLM integration
"""

import sys
sys.path.append('/home/pauljcoles/code/cats/task-manager')

from src.generation.task5_integration import execute_task_5_for_spec

def test_task5_with_llm():
    """Test Task 5 with real LLM calls instead of fake regex"""
    
    print("🧪 Testing Task 5 with Real LLM Integration")
    print("=" * 60)
    
    # Test with SPECBROADBAND-003
    spec_id = "SPECBROADBAND-003"
    
    print(f"📋 Testing Task 5 story generation with real LLM: {spec_id}")
    
    try:
        context = execute_task_5_for_spec(spec_id)
        
        if context:
            print(f"\n✅ Task 5 completed successfully with REAL LLM!")
            print(f"   Generated Stories: {len(context.get('generated_stories', []))}")
            print(f"   Requirements Extracted: {len(context.get('requirements', []))}")
            print(f"   Status: SUCCESS")
            
            # Show sample generated stories
            stories = context.get('generated_stories', [])
            if stories:
                print(f"\n🤖 Real LLM-Generated Stories:")
                for i, story in enumerate(stories[:3], 1):
                    print(f"   {i}. {story.title}")
                    print(f"      Persona: {story.persona}")
                    print(f"      Value: {story.value[:60]}...")
            
            print(f"\n📄 Generated outputs in: aiGenerated/{spec_id}/")
            return True
            
        else:
            print(f"\n❌ Task 5 generation failed")
            return False
        
    except Exception as e:
        print(f"❌ Error during Task 5 generation: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_task5_with_llm()
    if success:
        print("\n🎉 Task 5 with real LLM integration: SUCCESS!")
    else:
        print("\n💥 Task 5 with real LLM integration: FAILED!")
    
    sys.exit(0 if success else 1)