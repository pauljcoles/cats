╭───────────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│ Ready to code?                                                                                                    │
│                                                                                                                   │
│ Here is Claude's plan:                                                                                            │
│ ╭───────────────────────────────────────────────────────────────────────────────────────────────────────────────╮ │
│ │ Integration Plan: Hybrid Gate 1 Evaluator with Task 1 Execution                                               │ │
│ │                                                                                                               │ │
│ │ Overview                                                                                                      │ │
│ │                                                                                                               │ │
│ │ Integrate the hybrid evaluation system from task1.py with the existing Task 1 execution framework so that     │ │
│ │ when users type "execute task 1 for TICKET-123", the system runs deterministic code analysis, calls LLM for   │ │
│ │ contextual judgment when needed, and presents structured results with user choices.                           │ │
│ │                                                                                                               │ │
│ │ Current State Analysis                                                                                        │ │
│ │                                                                                                               │ │
│ │ Existing Framework (CLAUDE.md)                                                                                │ │
│ │                                                                                                               │ │
│ │ - Command trigger: execute task 1 for [TICKET]                                                                │ │
│ │ - Expected workflow: Load ticket → Apply dynamic context → Run validation gates → Generate outputs            │ │
│ │ - File structure: Creates /aiGenerated/[TICKET]/ with validation report and conversation log                  │ │
│ │ - Domain system: Extracts ticket prefix, loads domain-specific configs from /context-rules/[prefix]-domain/   │ │
│ │                                                                                                               │ │
│ │ Hybrid Evaluator (task1.py)                                                                                   │ │
│ │                                                                                                               │ │
│ │ - Code-based checks: Reliable patterns for vague terms, external references, clear conditionals               │ │
│ │ - LLM-based checks: Multiple behaviors, contextual vagueness, complex conditional logic                       │ │
│ │ - Confidence scoring: Code issues (1.0), LLM issues (0.75-0.85)                                               │ │
│ │ - User choices: Proceed, Apply SRP, Preview, Stop, Details                                                    │ │
│ │                                                                                                               │ │
│ │ Integration Plan                                                                                              │ │
│ │                                                                                                               │ │
│ │ 1. Create Task 1 Entry Point                                                                                  │ │
│ │                                                                                                               │ │
│ │ File: /home/pauljcoles/code/cats/task-manager/base-rules/code-rules/task1_integration.py                      │ │
│ │ - Main function that responds to "execute task 1 for TICKET-123"                                              │ │
│ │ - Loads ticket from /example-tickets/[TICKET].md                                                              │ │
│ │ - Extracts domain prefix (CARCONF-104 → CARCONF)                                                              │ │
│ │ - Loads domain configuration if available                                                                     │ │
│ │ - Runs hybrid evaluation using existing HybridGate1Evaluator                                                  │ │
│ │                                                                                                               │ │
│ │ 2. Ticket Loading System                                                                                      │ │
│ │                                                                                                               │ │
│ │ Integration points:                                                                                           │ │
│ │ - Parse ticket markdown files in existing format                                                              │ │
│ │ - Extract acceptance criteria from Requirements sections                                                      │ │
│ │ - Handle both clean (CARCONF-104) and contaminated (CARCONF-103) examples                                     │ │
│ │ - Extract domain prefix for dynamic context loading                                                           │ │
│ │                                                                                                               │ │
│ │ 3. LLM Integration Strategy                                                                                   │ │
│ │                                                                                                               │ │
│ │ Seamless Claude CLI integration:                                                                              │ │
│ │ - When _needs_llm_judgment() returns True, present analysis prompt to current Claude session                  │ │
│ │ - Use structured prompts that show reasoning process                                                          │ │
│ │ - Parse LLM responses and create LanguageIssue objects with confidence scores                                 │ │
│ │ - Continue code execution after receiving LLM analysis                                                        │ │
│ │                                                                                                               │ │
│ │ 4. Output Generation System                                                                                   │ │
│ │                                                                                                               │ │
│ │ File structure (following CLAUDE.md spec):                                                                    │ │
│ │ /aiGenerated/[TICKET]/                                                                                        │ │
│ │ ├── [TICKET]_validation_report.md  # Hybrid evaluation results                                                │ │
│ │ └── [TICKET]_conversation.md       # Full conversation log                                                    │ │
│ │                                                                                                               │ │
│ │ Validation report format:                                                                                     │ │
│ │ - Overall quality score and pass/fail status                                                                  │ │
│ │ - Code-detected issues (high confidence)                                                                      │ │
│ │ - LLM-identified issues (with confidence levels)                                                              │ │
│ │ - Per-AC breakdown with specific recommendations                                                              │ │
│ │ - User choice options with rationale                                                                          │ │
│ │                                                                                                               │ │
│ │ 5. User Choice Processing                                                                                     │ │
│ │                                                                                                               │ │
│ │ Enhanced decision framework:                                                                                  │ │
│ │ - Present hybrid analysis results with method transparency                                                    │ │
│ │ - Show code vs LLM issue breakdown                                                                            │ │
│ │ - Confidence-weighted recommendations                                                                         │ │
│ │ - Standard choices: Proceed, Apply SRP, Preview, Stop, Details                                                │ │
│ │ - Process user selection and continue workflow accordingly                                                    │ │
│ │                                                                                                               │ │
│ │ 6. Domain Configuration Integration                                                                           │ │
│ │                                                                                                               │ │
│ │ Dynamic context loading:                                                                                      │ │
│ │ - Extract ticket prefix (CARCONF-104 → CARCONF)                                                               │ │
│ │ - Check for /context-rules/carconf-domain/business-domain-config.md                                           │ │
│ │ - Load domain-specific test data and terminology                                                              │ │
│ │ - Use domain context in LLM prompts for better analysis                                                       │ │
│ │                                                                                                               │ │
│ │ Implementation Steps                                                                                          │ │
│ │                                                                                                               │ │
│ │ Step 1: Create Integration Wrapper                                                                            │ │
│ │                                                                                                               │ │
│ │ - New file task1_integration.py that imports HybridGate1Evaluator                                             │ │
│ │ - Entry point function that handles "execute task 1 for TICKET-123" command                                   │ │
│ │ - Ticket loading logic that parses existing markdown format                                                   │ │
│ │                                                                                                               │ │
│ │ Step 2: Enhance LLM Integration                                                                               │ │
│ │                                                                                                               │ │
│ │ - Replace simulation methods in task1.py with Claude CLI integration                                          │ │
│ │ - Add structured prompts that expose reasoning process                                                        │ │
│ │ - Implement response parsing and confidence scoring                                                           │ │
│ │                                                                                                               │ │
│ │ Step 3: Add Output Generation                                                                                 │ │
│ │                                                                                                               │ │
│ │ - Create validation report generator following existing format                                                │ │
│ │ - Implement conversation logging system                                                                       │ │
│ │ - Ensure aiGenerated directory structure matches CLAUDE.md spec                                               │ │
│ │                                                                                                               │ │
│ │ Step 4: Integrate Domain System                                                                               │ │
│ │                                                                                                               │ │
│ │ - Add domain prefix extraction and context loading                                                            │ │
│ │ - Enhance LLM prompts with domain-specific information                                                        │ │
│ │ - Support fallback to core patterns when domain not found                                                     │ │
│ │                                                                                                               │ │
│ │ Step 5: Testing and Refinement                                                                                │ │
│ │                                                                                                               │ │
│ │ - Test with good examples (CARCONF-104, CARCONF-105, CARCONF-107)                                             │ │
│ │ - Test with poor examples (CARCONF-103, CARCONF-106, CARCONF-108)                                             │ │
│ │ - Verify LLM reasoning is exposed and helpful                                                                 │ │
│ │ - Ensure user choices work correctly                                                                          │ │
│ │                                                                                                               │ │
│ │ Key Benefits                                                                                                  │ │
│ │                                                                                                               │ │
│ │ Reliability + Contextual Intelligence                                                                         │ │
│ │                                                                                                               │ │
│ │ - Code catches obvious issues with 100% confidence                                                            │ │
│ │ - LLM handles nuanced contextual analysis                                                                     │ │
│ │ - Combined approach reduces false positives while maintaining coverage                                        │ │
│ │                                                                                                               │ │
│ │ Seamless Integration                                                                                          │ │
│ │                                                                                                               │ │
│ │ - Works with existing "execute task 1 for TICKET" command structure                                           │ │
│ │ - Uses current domain configuration system                                                                    │ │
│ │ - Maintains expected file output structure                                                                    │ │
│ │ - Integrates naturally with Claude CLI session                                                                │ │
│ │                                                                                                               │ │
│ │ Transparency                                                                                                  │ │
│ │                                                                                                               │ │
│ │ - Shows which issues were detected by code vs LLM                                                             │ │
│ │ - Exposes LLM reasoning process for user evaluation                                                           │ │
│ │ - Confidence levels help users assess recommendations                                                         │ │
│ │ - Method breakdown helps users understand analysis quality                                                    │ │
│ │                                                                                                               │ │
│ │ This plan preserves all existing functionality while adding the hybrid evaluation capability, making the      │ │
│ │ system more reliable and transparent.  