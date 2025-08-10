# The Subtle Art of Herding Cats: Show, Don’t Tell: Teaching AI by Example (Part 2 of 4)

## Quick Recap: The Problems We Discovered

In Part 1, I learned the hard way that giving AI 47 rules is like trying to get a cat to do well, much of anything. In Part 2, I'll show you the approach that finally made it behave: gold standards and lazy loading.

## Show, Don't Tell

### The Failed Approach: Death by Documentation

My first idea was to write complete rules. 300 lines of detailed instructions covering every possible scenario, edge case, and formatting requirement. The AI nodded politely and ignored most of it.

The talks were exhausting:
- **Me**: "Why didn't you follow the naming rules?"
- **Agent**: "Which ones? There were several different patterns mentioned."
- **Me**: "The ones in section 4.2.1 about specification references!"
- **Agent**: "I focused on the examples in section 6.3 instead."

Sound familiar? I was trying to teach by explanation rather than showing examples.

### The Breakthrough Moment

Instead of writing more rules, I tried something different. I created one perfect example of what I wanted:

It didn't look exactly like this, this is just a tribute.

**Gold Standard BDD Scenario:**
```gherkin
Feature: Product Configuration [SPEC-123]

Scenario: Premium package selection shows correct pricing
  Given I am on the product configuration page
  When I select the premium package
  Then I should see the premium pricing displayed
  And the package should be marked as selected
```

Then I asked the agent: **"Look at this gold standard. What rules do you need to reproduce this quality?"**

The agent looked through the rules and Instead of 300 lines of rules, the AI found 10 key principles:
- Use clear, business-focused language
- Follow Given-When-Then structure  
- Include specification references
- Focus on user-observable outcomes

> 📌 **Pattern-Led Prompting Discovery**: AI agents learn better from perfect examples than from detailed explanations. Show the destination, let them find the path.

### The Domain Separation Breakthrough  

The gold standard looked simple, but there was hidden cleverness. Some elements needed to come from domain configuration, not be hardcoded in the pattern:

**Universal Pattern:**
```gherkin
Feature: Vehicle Package Configuration [SPEC-123]

Scenario: Premium package selection shows correct pricing
  Given I am on the [DOMAIN: configuration_page_url]
  When I select the [DOMAIN: premium_package_name]  
  Then I should see the [DOMAIN: pricing_display_format] updated
  And the package should show [DOMAIN: selection_indicator_state]
```

**Domain Configuration:**
```json
{
  "configuration_page_url": "vehicle configuration page",
  "premium_package_name": "M Sport Package",
  "pricing_display_format": "total pricing", 
  "selection_indicator_state": "as selected"
}
```

For an online sock store, the same pattern works with different domain values:
- Product categories: "athletic socks"
- Size options: "Size 8-10"  
- Error messages: "Sorry, out of stock in your size"
- UI elements: "add to basket button"

**The pattern stays universal, but the domain makes it real.**

These domain mappings improve the BDD's accuracy and relevance to your specific context, making scenarios immediately useful rather than generic templates. Other domains will have completely different maps, allowing the AI to recognize universal patterns while adapting to your specific terminology.

Previously, this context was scattered throughout the rules - a BMW configurator conversation would gradually contaminate generic BDD patterns with "M Sport Package" references. In the new approach, domain specifics live in dedicated files.

### "Show, Don't Tell" in Practice

This discovery matched a principle I'd written in my framework: **"Show, don't tell."** Instead of explaining what makes good BDD, I showed the agent perfect examples and let it find the patterns.

But I learned there's a big difference between **guidelines** (flexible suggestions) and **rules** (mandatory requirements). For things that absolutely had to happen, I needed very clear language.

## Lazy Loading Context: The Architecture That Changed Everything

### The Problem: Context Explosion

Using 25% of Amazon Q's context window was like trying to have a conversation at a concert. Too many distractions, too much noise, too many competing priorities.

The AI was drowning in:
```markdown
✓ Generic BDD patterns         ✓ Domain-specific mappings
✓ Assessment criteria          ✓ Implementation details  
✓ Quality gates               ✓ Error handling
✓ Naming conventions          ✓ Edge case handling
✓ Reporting structures        ✓ 38 more categories...
```

### The Solution: Task-Based Context Loading

I realised the agent needed **focused context per task**, not everything at once. Here's the architecture that worked:

#### Base Context (Always Available)
- Task execution framework
- Conversation logging patterns
- State management rules

#### Dynamic Context (Loaded Per Task)

**Task 1: Context Extraction**
- **Load**: Analysis rules + Relevant Domain context only
- **Goal**: Extract requirements from Jira  
- **Output**: Structured conversation log
- **Blocked**: BDD patterns, automation rules, technical details

**Task 2: BDD Generation**
- **Load**: BDD patterns + Task 1 output only
- **Goal**: Create human-readable scenarios
- **Output**: Feature files for manual testing
- **Blocked**: Automation assessment, technical implementation

**Task 3a: Behavioural Assessment** 
- **Load**: Assessment criteria + Task 2 output only
- **Goal**: Determine automation suitability
- **Output**: Automation assessment report
- **Blocked**: Code generation patterns, implementation details

**Task 3b: Test Automation Generation**
- **Load**: Technical patterns + approved scenarios only
- **Goal**: Create executable automation code  
- **Output**: Test Automation-compatible feature files
- **Blocked**: Analysis rules, BDD guidelines

> 📌 **Context Smartness Principle**: Each task gets exactly the context it needs - no more, no less. No competing priorities, no overwhelming rule sets.

### The Performance Impact

The difference was dramatic:
- **Before**: 25% context usage, inconsistent results, mysterious failures
- **After**: <5% context per task, reliable patterns, predictable behavior

The AI went from confused and unreliable to focused and consistent. Each task could concentrate on its specific job without distraction.

## Pseudocode Rules: When You Absolutely Must Be Obeyed

If there is one thing you take from this, it's if you *really* need the AI to follow rules use pseudo code and not just words.

### The Guidelines vs Rules Problem

Even with focused context, the AI would still treat critical requirements as optional suggestions. Natural language left too much room for creative interpretation.

**Before (Ignored):**
"Please assess each scenario carefully, considering automation suitability and technical feasibility."

**After (Followed Religiously):**
```pseudocode
FOR EACH scenario IN bdd_scenarios:
    IF scenario.type == "accessibility":
        EXCLUDE(scenario, reason="specialized_tools_required")
    ELIF scenario.complexity == "single_component": 
        EXCLUDE(scenario, reason="unit_test_territory")
    ELSE:
        ASSESS(scenario, gates=[0,1,2,3])
```

### Mandatory Language That Works

For absolutely critical processes, I learned to use clear commanding language:
- **'MANDATORY'** - not "should" or "please"
- **'ZERO TOLERANCE'** - not "try to avoid" 
- **'AUTOMATIC EXCLUSIONS'** - not "generally not recommended"

The AI follows pseudocode and explicit commands while treating natural language as flexible guidance. But, each instance of commanding language is backed up with pseudo code.

### The Conversation State Pattern

The breakthrough was having the agent create a structured conversation log in Task 1:

```markdown
## Requirements Analysis
- REQ-001: User can select premium packages
- REQ-002: Pricing updates when packages change  
- REQ-003: Conflicts prevent invalid combinations

## Positive Test Scenarios
- Premium package selection
- Price calculation accuracy
- Package combination validation

## Negative Test Scenarios  
- Invalid package combinations
- Error handling for unavailable options

## Inferred Requirements (Agent Additions)
- Loading states during price calculation
- Confirmation dialogs for expensive options
- Network error handling
```

## The "Made Up" Requirements Solution: Embracing AI Creativity

### The Unexpected Discovery

Here's something that surprised me: the agent kept adding requirements that weren't in the original spec. My first idea was to stop this behavior.

Instead, I asked it to **share invented requirements in a separate section.**

### The Value of AI Inference

Sometimes these "made up" requirements were brilliant:
- "What happens during price calculation loading?"
- "Should there be confirmation for expensive options?"  
- "How do we handle network errors?"

The agent was thinking like a tester, finding gaps in specifications. I learned to embrace this creativity rather than suppress it - but keep it clearly labeled so humans could check the suggestions.

## Don't Limit the AI (But Do Limit Its Authority)

Something I decided early on: even though the AI can update Jira, I don't want it to. That's taking away too much control and will make people lazy. I need humans to decide whether other humans should do a test or not.

Put it this way: if you make the AI limit tests to only those that are "important," and something goes wrong, it won't be the AI that gets told off.

**The AI's role**: Prioritise and recommend  
**Your role**: Make the final calls

Yes, the AI puts a priority on its creations. They're in an order, but *you* decide what actually gets done. The AI can be creative with requirements, suggest test scenarios, and even rate automation suitability, but humans retain control over the decisions that matter.

**The AI won't be the one getting told off**

## Quick Wins You Can Implement Today

### 1. Create Your Gold Standard
Find your best existing BDD scenario and clean it to perfection. This becomes your teaching example.

### 2. Extract Minimal Rules
Ask your AI: "What rules do you need to reproduce this quality?" You'll get 5-10 essential principles instead of 300 lines of documentation.

### 3. Separate Domain from Pattern
Identify what's universal (user actions, observable results) vs domain-specific (product names, URLs, error messages). Put domain details in separate configuration.

### 4. Use Pseudocode for Critical Logic
Replace "Please assess carefully" with explicit IF/THEN logic for anything that must happen without exception. You don't have to write the code, just write bullet points and ask it to make the code

## What's Coming in Part 3

These solutions sound good in theory, but do they actually work in practice? In Part 3, I'll show you:

- **Real before/after examples**: Contaminated scenarios transformed into universal patterns
- **The framework in action**: Complete workflow from Jira ticket to executable tests  
- **Honest assessment**: What actually works, ongoing challenges, and what it doesn't fix
- **What Not to Automate: Smarter Test Filtering**: How to decide what should be automated vs tested manually

The cats are starting to line up, but the real test is whether they stay in formation when facing real-world complexity.

---

*Paul Coles is a software tester who discovered that AI agents respond better to examples than explanations. In Part 2, he reveals the specific techniques that transformed chaotic AI behavior into reliable, consistent output. His actual cat learned to use the litter tray but still ignores most other commands.*
 
## 🐾 Series Navigation

- **Part 1: Why AI Starts Making Stuff Up**  
  *The cat has opinions — and your postcode formatting rules aren't one of them.*  
  [Read it →](link-to-part-1)

- **Part 2: Show, Don’t Tell: Teaching AI with Better Examples**  
  *Bribing the cat with gold standards and smaller piles of paper.*  
  **← You are here**

- **Part 3: How I Made My AI Stop Guessing**  
  *Teaching the cat one trick at a time with task-focused training.*  
  *(Coming soon)*

- **Part 4: The More You Say, the Less It Learns**  
  *When you talk too much, the cat stops listening — and invents new requirements instead.*  
  *(Coming soon)*
