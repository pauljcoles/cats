# Amazon Q Task Execution Rules

## Task 1: Hybrid Requirement Validation

### Command Pattern
When user requests: "execute task 1 for [TICKET]"

### Implementation Strategy
Use hybrid evaluation approach combining:
- **Deterministic code patterns** (high confidence detection)
- **Contextual LLM analysis** (nuanced judgment)
- **Domain-specific context loading**

### Core Evaluation Framework

#### Code-Based Detection (Confidence: 1.0)
```
IF requirement contains:
  - Vague terms: "user-friendly", "intuitive", "seamless", "robust"
  - External references: "as per existing", "similar to current"
  - Implementation details: "using React", "via API", "in database"
THEN flag as HIGH severity issue
```

#### LLM-Based Analysis (Confidence: 0.75-0.85)
```
ANALYZE requirement for:
  - Multiple distinct behaviors in single acceptance criteria
  - Contextual vagueness requiring domain knowledge
  - Complex conditional logic with unclear outcomes
  - Business process clarity vs technical implementation mix
```

#### Validation Gates Sequence
1. **Quality Assessment**: Completeness, clarity, testability, stability
2. **Architecture Detection**: Frontend/backend classification
3. **Priority Classification**: P0 (ticket ACs) → P1 (errors) → P2 (regression) → P3-P4 (additional)

### Dynamic Context Loading

#### Domain Configuration Pattern
```
ticket_prefix = extract_prefix(ticket_id)  // CARCONF-104 → CARCONF
domain_path = `/context-rules/${ticket_prefix.toLowerCase()}-domain/`

IF domain_config_exists(domain_path):
  LOAD business-domain-config.md
  LOAD test_data.json  
  USE domain_context in LLM prompts
ELSE:
  FALLBACK to core validation patterns
```

#### Context Smartness Principle
- Each task gets ONLY the context it needs
- No competing instructions or cross-contamination
- Focused context prevents Context Rot

### Output Generation

#### File Structure
```
/aiGenerated/[TICKET]/
├── [TICKET]_validation_report.md
└── [TICKET]_conversation.md
```

#### Validation Report Format
```markdown
# Validation Report: [TICKET]

## Overall Assessment
- **Status**: PASS/FAIL
- **Quality Score**: X.X/5.0
- **Method Breakdown**: X code-detected, Y LLM-identified issues

## Code-Detected Issues (Confidence: 1.0)
[List deterministic pattern matches]

## LLM-Identified Issues (Confidence: 0.75-0.85)
[List contextual analysis results with reasoning]

## Per-AC Breakdown
[Detailed analysis by acceptance criteria]

## User Choice Options
- **Proceed**: Continue with current requirements
- **Apply SRP**: Apply Single Responsibility Principle
- **Preview**: Show potential BDD scenarios
- **Stop**: Stop and fix requirements first
- **Details**: Get more specific analysis
```

### Key Principles

#### Transparency
- Show which issues were detected by code vs LLM
- Include confidence levels for all findings
- Expose LLM reasoning process for user evaluation

#### Reliability
- Use code for patterns with clear rules
- Use LLM for contextual judgment requiring intelligence
- Never downgrade P0 requirements (ticket ACs always remain P0)

#### Human Decision Points
- AI identifies issues and generates options
- Human makes final decisions on quality gates
- AI preserves all requirements (P0-P4) with proper classification