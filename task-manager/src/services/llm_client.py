"""
LLM Client Service
Provides real LLM integration for Task 1 validation and Task 5 story generation
Replaces all fake simulation methods with actual LLM calls
"""

import json
import subprocess
import time
from typing import Dict, List, Any, Optional, Union
from dataclasses import dataclass
import re

@dataclass
class LLMResponse:
    """Structured LLM response with metadata"""
    content: str
    success: bool
    error_message: Optional[str] = None
    tokens_used: Optional[int] = None
    response_time: Optional[float] = None

class LLMClient:
    """
    Supports Claude CLI subprocess and future API integrations
    """
    
    def __init__(self, provider: str = "claude_cli", model: str = "claude-3-5-sonnet-20241022"):
        self.provider = provider
        self.model = model
        self.max_retries = 3
        self.retry_delay = 1.0
    
    def complete(self, prompt: str, max_tokens: int = 2000, temperature: float = 0.1) -> LLMResponse:
        """
        Make real LLM completion call
        """
        start_time = time.time()
        
        for attempt in range(self.max_retries):
            try:
                if self.provider == "claude_cli":
                    response = self._call_claude_cli(prompt, max_tokens, temperature)
                else:
                    raise ValueError(f"Unsupported provider: {self.provider}")
                
                response_time = time.time() - start_time
                
                return LLMResponse(
                    content=response,
                    success=True,
                    response_time=response_time
                )
                
            except Exception as e:
                if attempt == self.max_retries - 1:
                    return LLMResponse(
                        content="",
                        success=False,
                        error_message=str(e),
                        response_time=time.time() - start_time
                    )
                
                # Wait before retry
                time.sleep(self.retry_delay * (attempt + 1))
        
        return LLMResponse(content="", success=False, error_message="Max retries exceeded")
    
    def _call_claude_cli(self, prompt: str, max_tokens: int, temperature: float) -> str:
        """
        Call Claude using the claude-code-sdk
        This makes REAL LLM calls back to the Claude session we're running in
        """
        try:
            import asyncio
            from claude_code_sdk import query
            
            # Make a real LLM call using the Claude Code SDK
            async def make_query():
                messages = []
                async for message in query(prompt=prompt):
                    messages.append(message)
                return messages
            
            # Run the async query
            try:
                loop = asyncio.get_event_loop()
            except RuntimeError:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
            
            messages = loop.run_until_complete(make_query())
            
            # Extract the response content from the last assistant message
            for message in reversed(messages):
                if hasattr(message, 'content') and message.content:
                    if isinstance(message.content, list) and len(message.content) > 0:
                        # Handle TextBlock content
                        return message.content[0].text if hasattr(message.content[0], 'text') else str(message.content[0])
                    else:
                        return str(message.content)
            
            return "No response content found"
            
        except ImportError:
            raise Exception("claude-code-sdk package not available - cannot make real LLM calls")
        except Exception as e:
            raise Exception(f"Failed to call Claude via claude-code-sdk.query(): {e}")
    
    def _format_prompt_for_cli(self, prompt: str) -> str:
        """
        Format prompt appropriately for CLI input
        """
        # Clean up the prompt for CLI consumption
        cleaned_prompt = prompt.strip()
        
        # Add instruction for structured output when JSON is expected
        if "JSON" in prompt or "json" in prompt:
            cleaned_prompt += "\n\nPlease provide your response in valid JSON format only, with no additional text or markdown formatting."
        
        return cleaned_prompt
    
    def parse_json_response(self, response: LLMResponse) -> Optional[Dict]:
        """
        Parse JSON from LLM response, handling common formatting issues
        """
        if not response.success:
            return None
        
        content = response.content.strip()
        
        # Remove markdown code blocks if present
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        
        content = content.strip()
        
        try:
            return json.loads(content)
        except json.JSONDecodeError as e:
            # Try to extract JSON from response if wrapped in text
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                try:
                    return json.loads(json_match.group())
                except json.JSONDecodeError:
                    pass
            
            print(f"⚠️ Failed to parse JSON response: {e}")
            print(f"Raw response: {content[:200]}...")
            return None
    
    def parse_json_array_response(self, response: LLMResponse) -> Optional[List[Dict]]:
        """
        Parse JSON array from LLM response
        """
        if not response.success:
            return None
        
        content = response.content.strip()
        
        # Remove markdown code blocks
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        
        content = content.strip()
        
        try:
            result = json.loads(content)
            if isinstance(result, list):
                return result
            elif isinstance(result, dict) and 'items' in result:
                return result['items']
            else:
                return [result]  # Wrap single object in array
        except json.JSONDecodeError as e:
            # Try to extract JSON array from response
            json_match = re.search(r'\[.*\]', content, re.DOTALL)
            if json_match:
                try:
                    return json.loads(json_match.group())
                except json.JSONDecodeError:
                    pass
            
            print(f"⚠️ Failed to parse JSON array response: {e}")
            print(f"Raw response: {content[:200]}...")
            return None

# Global LLM client instance
_llm_client = None

def get_llm_client() -> LLMClient:
    """Get shared LLM client instance"""
    global _llm_client
    if _llm_client is None:
        _llm_client = LLMClient()
    return _llm_client

def make_llm_call(prompt: str, expect_json: bool = False) -> Union[str, Dict, List, None]:
    """
    Convenience function for making LLM calls
    
    Args:
        prompt: The prompt to send to the LLM
        expect_json: Whether to parse response as JSON
        
    Returns:
        String response, parsed JSON, or None on error
    """
    client = get_llm_client()
    response = client.complete(prompt)
    
    if not response.success:
        print(f"❌ LLM call failed: {response.error_message}")
        return None
    
    if expect_json:
        # Check if prompt expects array or single object
        if 'JSON array' in prompt or prompt.lower().count('array') > 0:
            return client.parse_json_array_response(response)
        else:
            parsed = client.parse_json_response(response)
            # Handle case where LLM returns array instead of single object
            if isinstance(parsed, list) and len(parsed) > 0:
                return parsed[0]  # Return first item if array returned unexpectedly
            return parsed
    
    return response.content

# Test function for validation
def test_llm_integration():
    """Test the LLM client with a simple call"""
    print("🧪 Testing LLM integration...")
    
    test_prompt = """
    Analyze this text for clarity: "The system should provide appropriate feedback"
    
    Respond with JSON:
    {
        "is_vague": true/false,
        "explanation": "brief explanation",
        "suggestion": "specific improvement"
    }
    """
    
    result = make_llm_call(test_prompt, expect_json=True)
    
    if result:
        print(f"✅ LLM integration working! Response: {result}")
        return True
    else:
        print("❌ LLM integration failed")
        return False

if __name__ == "__main__":
    test_llm_integration()