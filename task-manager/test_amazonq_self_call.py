#!/usr/bin/env python3
"""
Simple test to verify Amazon Q can call itself
"""

import sys
import os
sys.path.append('.')

from src.services.amazonq_llm_client import make_amazonq_call

def test_simple_call():
    """Test basic Amazon Q self-referential call"""
    print("🧪 Testing Amazon Q self-referential call...")
    
    prompt = "What is 2 + 2? Respond with just the number."
    
    result = make_amazonq_call(prompt, expect_json=False)
    
    if result:
        print(f"✅ Amazon Q responded: {result[:100]}...")
        return True
    else:
        print("❌ Amazon Q call failed")
        return False

def test_analysis_call():
    """Test Amazon Q analyzing a requirement"""
    print("\n🔍 Testing requirement analysis...")
    
    prompt = """
    Analyze this acceptance criteria for vague language:
    "The system should provide appropriate feedback to users"
    
    Is this vague? Answer YES or NO and explain briefly.
    """
    
    result = make_amazonq_call(prompt, expect_json=False)
    
    if result:
        print(f"✅ Analysis result: {result[:200]}...")
        return True
    else:
        print("❌ Analysis call failed")
        return False

if __name__ == "__main__":
    print("Testing Amazon Q self-referential calling capability")
    print("=" * 50)
    
    success1 = test_simple_call()
    success2 = test_analysis_call()
    
    if success1 and success2:
        print("\n🎉 Amazon Q self-referential calling works!")
        print("Ready to integrate with task1_integration.py")
    else:
        print("\n❌ Issues detected with self-referential calling")
