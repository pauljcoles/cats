#!/usr/bin/env python3
"""
Test Task 1 with real LLM integration
"""

import sys
sys.path.append('/home/pauljcoles/code/cats/task-manager')

from src.validation.task1_integration import execute_task_1_for_ticket

def test_task1_with_llm():
    """Test Task 1 with real LLM calls instead of fake simulation"""
    
    print("🧪 Testing Task 1 with Real LLM Integration")
    print("=" * 60)
    
    # Test with CARCONF-104 (known good ticket)
    ticket_id = "CARCONF-104"
    
    print(f"📋 Testing Task 1 validation with real LLM: {ticket_id}")
    
    try:
        context = execute_task_1_for_ticket(ticket_id)
        
        if context:
            print(f"\n✅ Task 1 completed successfully with REAL LLM!")
            print(f"   Score: {context.eval_result.score:.2f}/100")
            print(f"   Total Issues: {context.eval_result.total_issues}")
            print(f"   Status: {'PASSED' if context.eval_result.passed else 'FAILED'}")
            print(f"   Analysis Method: {context.eval_result.eval_breakdown}")
            
            # Show some real LLM-detected issues
            llm_issues = [issue for issue in context.eval_result.detailed_issues 
                         if issue.eval_method.name == 'LLM_BASED']
            
            if llm_issues:
                print(f"\n🤖 Real LLM-Detected Issues ({len(llm_issues)}):")
                for issue in llm_issues[:3]:
                    print(f"   - {issue.ac_id}: {issue.detected_pattern}")
                    print(f"     Confidence: {issue.confidence:.0%}")
                    print(f"     Suggestion: {issue.suggestion}")
            else:
                print(f"\n🤖 No LLM-specific issues detected (good ticket!)")
            
            print(f"\n📄 Generated outputs in: aiGenerated/{ticket_id}/")
            return True
            
        else:
            print(f"\n❌ Task 1 validation failed")
            return False
        
    except Exception as e:
        print(f"❌ Error during Task 1 validation: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_task1_with_llm()
    if success:
        print("\n🎉 Task 1 with real LLM integration: SUCCESS!")
    else:
        print("\n💥 Task 1 with real LLM integration: FAILED!")
    
    sys.exit(0 if success else 1)