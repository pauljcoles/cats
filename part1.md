## TL;DR My AI Training Hurdles

I spent months training an AI to create BDD tests (and more). I discovered that LLMs are like keen cats - they forget instructions when given too many commands. This is Part 1 of my journey from chaos to **Context Smartness**. Parts 2-4 cover the solutions, framework, and market implications.

## For Testers, Leads, and AI Engineers

**Primary Audience**: Test automation engineers building AI workflows who need consistent, reliable output from unpredictable AI systems.

**Also valuable for**: Test leads justifying AI investment, AI workflow engineers in any domain, and anyone discovering that "smart" AI agents have the attention span of caffeinated kittens.

Different readers will benefit differently:
- **Practitioners**: Learn specific patterns for AI training
- **Leads**: Understand why AI initiatives fail and what works
- **Engineers**: See systematic approaches to AI reliability

## Hopes vs. The Reality: When Smart Cats Act Dumb

I started this journey with a simple dream: get AI to read specs for me. I hadn't worked with multi-page specs for years. How hard could it be? The agent would understand context, follow rules, and produce perfect scenarios every time.

Reality check: AI agents are like cats. They're very clever, but they have their own views on which rules count. They will ignore you when it suits them.

## From First Attempts to Hard-Earned Lessons

### It's AI right? It's clever!

I began treating the LLM like an equal - a brilliant colleague who needed proper instruction. I worked with them. I made clear rules, shared important context, and expected steady results.

The conversations went like this:
- **Me**: "Here are 47 detailed rules for writing BDD scenarios"
- **Agent**: "Got it! I understand perfectly"
- **Agent**: *Proceeds to lowercase postcodes for mysterious reasons*
- **Me**: "Why did you do that? There's nothing in the domain file about lowercase postcodes"
- **Agent**: "There are too many rules. I can't follow everything."

It was like chatting with a polite cat. It nods along, but then it still knocks your coffee mug off the table.

**The Cat Rule Discovered**: AI agents, like cats, can't follow more than 10 competing instructions effectively. Beyond that threshold, performance degrades measurably. You know, sometimes they just do stuff when you're not looking.

### The More You Say, the Less It Hears

As I refined the rules over time, they grew and grew. I was using 25% of Amazon Q's available context window after some time. The agent was drowning in information:

```markdown
Rules included:
✓ Generic BDD patterns         ✓ Domain-specific mappings
✓ Assessment criteria          ✓ Implementation details
✓ Quality gates               ✓ Error handling
✓ Naming conventions          ✓ Edge case handling
✓ Reporting structures        ✓ ... and 38 more categories
```

The problem became clear: **The agent forgets things when the context is too large.**

LLMs have extensive knowledge, but their application lacks consistency when overwhelmed. If I'm asking the LLM about task 4, it still has to sort through the stuff for tasks 1 to 3 and all the other conventions. It's like asking a cat to follow 47 commands at once. They ignore most, and the noise makes them mess up the few they do hear.

Context rot identified: Adding more input tokens can hurt LLM performance. I noticed this months before I found out it had a name. For more details, visit https://research.trychroma.com/context-rot.

In my case, if you were to ask the LLM why it did something, it could find the rule it should have applied. It's like the needle in a haystack test. But what it couldn't do was apply this rule at the right time with all the other stuff it needed to do.

### Why Your AI Starts Making Stuff Up

The breaking point came when I attempted to ensure the agent used domain context consistently. It kept making odd choices:
- Lowercase postcodes (nowhere in the rules)
- Technical error messages in human-readable scenarios
- Treating mandatory rules as optional guidelines

But the real problem wasn't just using the wrong things at the wrong time. I had unknowingly created a perfect storm of conflicting information and massive context load that was literally making the AI dumber.

Training the LLM via conversations about 'why' things happened had contaminated what should be "generic" BDD patterns with car configurator specifics, package bundle terminology, and React SPA assumptions. But worse, the huge amount of context was hurting performance in ways I didn't understand then.

**The tool was becoming domain-specific instead of universally applicable, AND performing worse as context expanded.**

## The Lightbulb Moment: It's More of a Guideline!

Then it struck me - the lightbulb turned on. **I was treating the LLM as an equal, but it isn't.** It's not as smart as I thought in the way I thought (my internal monologue about it was less charitable).

The agent needed different training than a human colleague would. Even with focused context loading, the AI perceived key requirements as optional unless the language was clearly commanding. Or not applying mandatory rules - they were more guidelines.

**Pattern-Led Prompting Principle**: AI agents respond better to examples than explanations, tables and pseudocode better than natural language for complex logic.

This discovery would lead to what I now call **Context Smartness** - providing exactly the right information, at the right time, in the right amount.

## Key Discoveries from Part 1

Through months of frustrating talks with my AI agent, I found several basic principles:

### The Cat Rule
Never give AI more than 10 competing instructions. Beyond this point, performance drops as the agent struggles to work out what matters most.

### Context Rot
Adding more input context actually makes LLMs perform worse - not better. I was using 25% of Amazon Q's context window and wondering why my "smart" agent was getting dumber. https://research.trychroma.com/context-rot

### Domain Contamination
Generic rules slowly pick up domain-specific details through repeated conversations. This makes tools less reusable and adds to context bloat. You have to watch how the rules are formed and make sure they're generic.

### The Guidelines vs Rules Problem
AI agents treat everything as flexible unless you use very clear commanding language. "Please assess carefully" becomes optional; "MANDATORY: ASSESS(scenario, gates=[0,1,2,3])" gets followed.

## What's Coming Next

In the remaining parts of this series, I'll show you exactly how I solved these problems:

- **Part 2**: "Show, Don’t Tell: Teaching AI by Example" - The breakthrough solutions that actually worked
- **Part 3**: "How I Turned Chaos Into a Repeatable Test Process" - Real examples with BMW vs Mercedes
- **Part 4**: "Context Rot and the Billion Dollar Opportunity" - Why these solutions matter for the AI industry

Each problem in Part 1 has a matching solution. The cat can be herded, but not the way you think.

## The Foundation for What's Next

The problems I discovered - Context Rot, domain contamination, the guidelines vs rules confusion - aren't just BDD testing issues. They're fundamental AI reliability challenges that affect any system trying to get consistent behaviour from large language models.

In Part 2, I'll show you the **Context Smartness** approach that solved all of these problems: focused examples instead of comprehensive rules, task-based lazy loading, and the magic of "show, don't tell."

The cats stayed in formation, but it took understanding their psychology first.

---

*Paul Coles is a software tester who accidentally discovered several AI reliability patterns while trying to automate BDD scenario generation. In this 4-part series, he shares the systematic approach that transformed unpredictable AI behaviour into reliable, consistent output. His actual cat still ignores most commands.*
      
