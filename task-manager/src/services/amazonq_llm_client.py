"""
Amazon Q LLM Client Service
Provides real Amazon Q integration for Task 1 validation and Task 5 story generation
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
    response_time: Optional[float] = None

class AmazonQLLMClient:
    """
    Amazon Q CLI integration for self-referential calls
    """
    
    def __init__(self):
        self.max_retries = 3
        self.retry_delay = 1.0
    
    def complete(self, prompt: str, max_tokens: int = 2000, temperature: float = 0.1) -> LLMResponse:
        """
        Make Amazon Q completion call via CLI subprocess
        """
        start_time = time.time()
        
        for attempt in range(self.max_retries):
            try:
                response = self._call_amazonq_cli(prompt)
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
                
                time.sleep(self.retry_delay * (attempt + 1))
        
        return LLMResponse(content="", success=False, error_message="Max retries exceeded")
    
    def _call_amazonq_cli(self, prompt: str) -> str:
        """
        Call Amazon Q using CLI subprocess
        Creates new Q session - no shared context with current session
        """
        try:
            formatted_prompt = self._format_prompt_for_cli(prompt)
            
            # Use echo to pipe prompt to q chat
            process = subprocess.run(
                ['bash', '-c', f'echo "{formatted_prompt}" | q chat'],
                capture_output=True,
                text=True,
                timeout=60
            )
            
            if process.returncode != 0:
                raise Exception(f"Amazon Q CLI failed: {process.stderr}")
            
            return process.stdout.strip()
            
        except subprocess.TimeoutExpired:
            raise Exception("Amazon Q CLI call timed out")
        except Exception as e:
            raise Exception(f"Failed to call Amazon Q CLI: {e}")
    
    def _format_prompt_for_cli(self, prompt: str) -> str:
        """
        Format prompt for CLI input, escaping quotes
        """
        cleaned_prompt = prompt.strip().replace('"', '\\"')
        
        if "JSON" in prompt or "json" in prompt:
            cleaned_prompt += "\\n\\nPlease provide your response in valid JSON format only, with no additional text or markdown formatting."
        
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
                return [result]
        except json.JSONDecodeError as e:
            json_match = re.search(r'\[.*\]', content, re.DOTALL)
            if json_match:
                try:
                    return json.loads(json_match.group())
                except json.JSONDecodeError:
                    pass
            
            print(f"⚠️ Failed to parse JSON array response: {e}")
            print(f"Raw response: {content[:200]}...")
            return None

# Global Amazon Q client instance
_amazonq_client = None

def get_amazonq_client() -> AmazonQLLMClient:
    """Get shared Amazon Q client instance"""
    global _amazonq_client
    if _amazonq_client is None:
        _amazonq_client = AmazonQLLMClient()
    return _amazonq_client

def make_amazonq_call(prompt: str, expect_json: bool = False) -> Union[str, Dict, List, None]:
    """
    Convenience function for making Amazon Q calls
    
    Args:
        prompt: The prompt to send to Amazon Q
        expect_json: Whether to parse response as JSON
        
    Returns:
        String response, parsed JSON, or None on error
    """
    client = get_amazonq_client()
    response = client.complete(prompt)
    
    if not response.success:
        print(f"❌ Amazon Q call failed: {response.error_message}")
        return None
    
    if expect_json:
        if 'JSON array' in prompt or prompt.lower().count('array') > 0:
            return client.parse_json_array_response(response)
        else:
            parsed = client.parse_json_response(response)
            if isinstance(parsed, list) and len(parsed) > 0:
                return parsed[0]
            return parsed
    
    return response.content

def test_amazonq_integration():
    """Test the Amazon Q client with a simple call"""
    print("🧪 Testing Amazon Q integration...")
    
    test_prompt = """
    Analyze this text for clarity: "The system should provide appropriate feedback"
    
    Respond with JSON:
    {
        "is_vague": true/false,
        "explanation": "brief explanation",
        "suggestion": "specific improvement"
    }
    """
    
    result = make_amazonq_call(test_prompt, expect_json=True)
    
    if result:
        print(f"✅ Amazon Q integration working! Response: {result}")
        return True
    else:
        print("❌ Amazon Q integration failed")
        return False

if __name__ == "__main__":
    test_amazonq_integration()
