The Subtle Art of Herding Cats: My Journey Training an AI Agent for BDD Test Generation

TL;DR for Busy Cat Herders

In 30 seconds: I spent months training an AI to create BDD tests. I found that LLMs are like keen cats; they forget instructions with too many commands. Finally, I solved the problem using lazy loading and gold standards. The cats now mostly stay in formation.

Who This Is For

Test automation engineers who've tried to train AI and watched it ignore half the rules

Anyone who has found out that "smart" AI agents focus like caffeinated kittens.

Teams drowning in inconsistent BDD scenarios across multiple humans

People who enjoy the masochistic pleasure of teaching machines to be predictably consistent

The Dream vs. Reality: When Smart Cats Act Dumb

I started this journey with a simple dream: get AI to read specs for me, I hadn't worked with multi-page specs for years. How hard could it be? The agent would understand context, follow rules, and produce perfect scenarios every time.

Reality check: AI agents are like cats. They're very clever, but they have their own views on which rules count. They will ignore you when it suits them.

The Training Chronicles: From Optimism to Enlightenment

Phase 1: It's AI right, it's clever!

I began treating the LLM like an equal - a brilliant colleague who needed proper instruction. I worked with them. I made clear rules, shared important context, and expected steady results.

The conversations went like this:

Me: "Here are 47 detailed rules for writing BDD scenarios"

Agent: "Got it! I understand perfectly"

Agent: Proceeds to lowercase postcodes for mysterious reasons

Me: "Why did you do that? There's nothing in the domain file about lowercase postcodes"

Agent: "There are too many rules. I can't follow everything."

It was like chatting with a polite cat. It nods along, but then it still knocks your coffee mug off the table.

Phase 2: The Context Explosion Problem

As I refined the rules over time, they grew and grew. I was using 25% of Amazon Q's available context window after some time. The agent was drowning in information:

Rules included: ✓ Generic BDD patterns ✓ Domain-specific mappings ✓ Assessment criteria ✓ Implementation details ✓ Quality gates ✓ Error handling ✓ Naming conventions ✓ Edge case handling ✓ Reporting structures ✓ ... and 38 more categories

The problem became clear: The agent forgets things when the context is too large.

LLMs have extensive knowledge, but their application lacks consistency when overwhelmed. It’s like asking a cat to follow 47 commands at once. They ignore most, and the noise makes them mess up the few they do hear.

The Domain Contamination Crisis

The breaking point came when I attempted to ensure the agent used domain context with precision. It kept making odd choices. For example, it used lowercase for postcodes, even though the rules didn’t say to do that. Putting technical error messages in the human readable scenarios. Or not applying mandatory rules - they were more guidelines.

But the real problem wasn't just domain contamination. I had unknowingly created a perfect storm. I had important knowledge and a lot of context, which made the AI dumber.

The talks with the AI about 'why' things happened have changed the "generic" BDD patterns. Now, they have details like car configurator info, package bundle terms, and React SPA ideas. But worse, the huge amount of context was hurting performance in ways I didn't understand then.

The tool was becoming specific to a domain, not useful for everyone, and it was performing worse as the context expanded.

The Lightbulb Moment: It's More of a Guideline

Then it struck me - the lightbulb turned on. I was treating the LLM as an equal, but it isn't. It's not as smart as I thought in the way I thought (my internal monologue was less charitable).

The agent needed different training than a human colleague would. Even with focused context loading, the AI perceived key requirements as optional unless the language was clearly commanding. Or not applying mandatory rules - they were more guidelines. 

It needed:

Guidelines for style and approach (flexible suggestions)

Hard rules for mandatory processes (non-negotiable requirements)

Clear examples instead of detailed explanations

Structured tasks instead of flexible workflows

Tables over lists

I found that task rules worked best in pseudocode. The AI grasped logical flow and conditional statements better than it did with natural language instructions. Instead of "Please assess each scenario carefully," I'd write:

FOR EACH scenario IN bdd_scenarios: IF scenario.type == "accessibility": EXCLUDE(scenario, reason="specialized_tools_required") ELIF scenario.complexity == "single_component": EXCLUDE(scenario, reason="unit_test_territory") ELSE: ASSESS(scenario, gates=[0,1,2,3])

The AI adhered to this strictly, while natural language allowed for creative interpretation.

The Solution: Gold Standards and Lazy Loading

Step 1: Create Gold Standards

Instead of writing more rules, I created perfect examples of what I wanted:

Gold Standard BDD Scenario:

Feature: Product Configuration [SPEC-123] Scenario: Premium package selection shows correct pricing Given I am on the product configuration page When I select the premium package Then I should see the premium pricing displayed And the package should be marked as selected

This seems simple, but the main point is that some elements should come from domain configuration. They shouldn’t be hardcoded in the pattern. In practice, this became:

Feature: Vehicle Package Configuration [SPEC-123] Scenario: Premium package selection shows correct pricing Given I am on the [DOMAIN: configuration_page_url] When I select the [DOMAIN: premium_package_name] Then I should see the [DOMAIN: pricing_display_format] updated And the package should show [DOMAIN: selection_indicator_state]

For a car configurator, the domain JSON would populate:

configuration_page_url: "vehicle configuration page"

premium_package_name: "M Sport Package"

pricing_display_format: "total pricing"

selection_indicator_state: "as selected"

For an online sock store, it might be product categories ("athletic socks"), size options ("Size 8-10"), error messages ("Sorry, out of stock in your size"), or specific UI elements ("add to basket button"). The pattern stays universal, but the domain makes it real.

Then I asked the agent: "Look at this gold standard. What rules do you need to reproduce this quality?"

The magic happened. Instead of 300 lines of rules, I got 10 essential lines:

Use clear, business-focused language

Follow Given-When-Then structure

Include specification references

Focus on user-observable outcomes

The LLM already knows BDD - I didn't need to teach it "Given," "When," and "Then." I just needed to steer it toward my preferred style.

This discovery matched a rule I included in my framework: "Show, don't tell." I didn't explain good BDD. Instead, I showed the agent examples and let it find the patterns.

But I learned the hard way that there's a crucial difference between guidelines (flexible suggestions) and rules (mandatory requirements). For things that absolutely had to happen - like completing all assessment gates before automation - I had to use very explicit language: 'MANDATORY', 'ZERO TOLERANCE', 'AUTOMATIC EXCLUSIONS'.

Step 2: Lazy Loading Context

I realised the agent needed focused context per task, not everything at once.

Task-Based Architecture

Initial Load (Always Available):

Task execution framework

Conversation logging patterns

State management rules

Task 1: Context Extraction

Load: Analysis rules + Domain context

Goal: Extract requirements from Jira

Output: Structured conversation log

Task 2: BDD Generation

Load: BDD patterns + Task 1 output

Goal: Create human-readable scenarios

Output: Feature files for manual testing

Task 3a: Behavioural Assessment

Load: Assessment criteria + Task 2 output

Goal: Determine automation suitability

Output: Automation assessment report

Task 3b: TAF Generation

Load: Technical patterns + approved scenarios

Goal: Create executable automation code

Output: TAF-compatible feature files

Each task gets only the context it needs. No competing priorities. No overwhelming rule sets.

Getting Started: Your First Training Session

Ready to train your own AI agent? Here's the quick start:

1. Identify Your Best Scenario

Find your most well-written BDD scenario. This becomes your gold standard.

2. Extract the Pattern

What makes it good? Write down 3-5 key characteristics.

3. Create Minimal Rules

Turn those characteristics into simple guidance:

Use simple language and skip jargon.  

Highlight what users do and the results they get.  

Stick to a clear Given-When-Then format.  

Mention specifications in the feature descriptions.

4. Test the Approach

Give the agent a requirement and ask it to match your gold standard style. Compare results.

If this improves consistency and saves time, you're ready to scale up. If not, refine your gold standard and try again.

The Framework That Actually Works

The Conversation State Pattern

The key breakthrough was having the agent create a structured conversation log in Task 1:

## Requirements Analysis - REQ-001: User can select premium packages - REQ-002: Pricing updates when packages change - REQ-003: Conflicts prevent invalid combinations ## Positive Test Scenarios - Premium package selection - Price calculation accuracy - Package combination validation ## Negative Test Scenarios - Invalid package combinations - Error handling for unavailable options ## Inferred Requirements (Agent Additions) - Loading states during price calculation - Confirmation dialogs for expensive options

The "Made Up" Requirements Solution

Here's something unexpected: the agent kept adding requirements that weren't in the original spec. I mean, it isn't that unexpected - LLMs invent stuff all the time. Instead of telling it not to invent things, I asked it to share them in a separate section.

Sometimes these "made up" requirements were really useful:

"What happens during price calculation loading?"

"Should there be confirmation for expensive options?"

"How do we handle network errors?"

The agent was thinking like a tester, finding gaps in the specifications. I learned to embrace this rather than suppress it.

The Behavioural Testing Filter

For Task 3a, I implemented strict behavioural assessment criteria:

Include for Automation:

Multi-step user workflows

Cross-component integration tests

Business process validation

State persistence across actions

Exclude from Automation:

Single component behaviour (unit test territory)

Subjective UX validation

Accessibility testing (specialised tools needed)

Performance without specific metrics

Only test what you control. You don't control prices or product names, then don't put them in your automation. Yes, make sure it isn't null and it has a $ or pound symbol and is a number.

The agent creates a clear report that shows which scenarios work for automation and which do not.

Real Results: The Universal BDD Vision

The Core Philosophy: BMW vs. Mercedes Principle

My main belief about good BDD is clear: If two companies, like BMW and Mercedes-Benz, offer similar products, you can use a requirement from either one. Then, create the same BDD scenario for users.

The scenario shouldn't contain:

Implementation details (REST APIs, microservices, specific databases)

System names (ConfiguratorService v2.1, PricingEngine, ValidationAPI)

Technical artefacts (JSON responses, event handlers, component states)

Instead, it should focus on:

User intent: What does the person want to do?

User actions: What do they actually do?

Observable results: What do they see happen?

The code behind is different, but the human need is identical.

Before: Implementation-Contaminated Scenarios

# BMW's contaminated approach Feature: BMW iDrive ConfiguratorService Integration [SPEC-BMW-123] Background: Given the BMW ConnectedDrive API is initialized And the user authenticates via BMW ID OAuth And the PricingEngine microservice is available Scenario: M Sport Package selection triggers pricing recalculation Given I have loaded the 3-series configurator via iDrive interface When I POST to /api/bmw/packages/m-sport with authentication headers Then the PricingCalculatorService should return updated totals And the frontend should display BMW-specific pricing components And the ConfiguratorState should persist to BMW backend systems # Mercedes contaminated approach Feature: Mercedes MBUX Configurator Integration [SPEC-MB-456] Background: Given the Mercedes me connect platform is active And MBUX infotainment system is responsive And the pricing validation service confirms availability Scenario: AMG package selection updates Mercedes pricing display Given I access the C-Class configurator through MBUX interface When the system processes AMG package selection via Mercedes API Then the integrated pricing module recalculates total cost And Mercedes-specific UI components reflect package changes And the selection persists in Mercedes customer profile system

The Problem: These scenarios are testing implementation details, not user behaviour. A tester would need completely different knowledge to understand BMW vs. Mercedes scenarios, even though users do exactly the same thing.

After: Universal, Human-Focused Scenarios

# Works for BMW, Mercedes, Audi, or any car configurator Feature: Vehicle Package Configuration [SPEC-123] Scenario: Premium package selection updates pricing Given I am on the vehicle configuration page When I select the premium package Then I should see the updated total price And the premium package should be marked as selected Scenario: Package conflict prevention Given I have selected a premium package When I attempt to select a conflicting economy package Then I should see a conflict warning message And the economy package should remain unselected And my original premium selection should be preserved Scenario: Package removal affects pricing Given I have selected multiple packages When I remove the premium package Then the total price should decrease And the premium package should no longer appear selected And any dependent options should be automatically removed

The Breakthrough: These scenarios describe universal human behaviour. Whether you're configuring a BMW 3-series or a Mercedes C-Class, users want to select packages, see pricing updates, and understand conflicts. The implementation varies wildly, but the user experience is fundamentally identical.

The Domain Configuration Separation

Behind the scenes, each company uses their domain configuration:

BMW Domain Config:

{ "navigation_url": "https://bmw.com/configurator", "premium_package": "M Sport Package", "economy_package": "Efficiency Package", "api_endpoint": "BMW ConnectedDrive API", "pricing_currency": "EUR" }

Mercedes Domain Config:

{ "navigation_url": "https://mercedes-benz.com/configurator", "premium_package": "AMG Line Package", "economy_package": "Eco Package", "api_endpoint": "Mercedes me connect API", "pricing_currency": "EUR" }

The same universal scenarios get different domain implementations, but testers can understand both instantly because they focus on universal human behaviour, not technical complexity.

The Technical Implementation Reality

Task 3b: From BDD to Automation

The agent now generates both the test logic and the infrastructure requirements:

Generated TAF Code:

Scenario: Premium package selection updates pricing Given I navigate to the package configuration page When I select the premium package option Then the pricing display should show updated costs And the premium package should appear selected

Generated Infrastructure Report:

## Required Page Objects - PackageConfigurationPage - premiumPackageOption (data-testid="premium-package") - pricingDisplay (data-testid="pricing-total") - packageSelectionIndicator (data-testid="selected-indicator") ## Missing Step Definitions - "I select the premium package option" - "the premium package should appear selected"

The agent gets you 80-90% of the way there, then humans add the final details.

The State Diagram Breakthrough

The LLM only knows what it knows. If you asked it to write some API requests and responses from a snippet in a spec, it will give this a go. What it produces may look somewhat acceptable, but is likely not. It doesn't know the states of your application.

I will explain the application states and how the process flows in simple English. Usually, designers describe these in Figma.

I began asking the agent to make Mermaid state diagrams from the scenarios:

graph TD A[Configuration Page] --> B[Premium Selected] B --> C[Pricing Updated] B --> D[Try Economy] D --> E[Conflict Warning] E --> B

These diagrams showed missing state transitions. They weren't clear in the Jira stories, but they appeared in the Figma designs.

Lessons from the Cat Herding Trenches

1. Less Is More (Considerably More)

300 lines of rules became 10 lines of guidance. The agent performed better with focused examples than comprehensive instructions.

2. Context Windows Have Real Limits

Using 25% of the available context meant the agent faced performance issues I didn’t grasp at the time. Lazy loading fixed this issue entirely. Later, I found out it was tackling a known phenomenon.

3. Domain Contamination Has Hidden Costs

Generic rules slowly become domain-specific through iterative conversations. This also makes the context size bigger and hurts performance in ways you might not see right away.

 Separate your domain config from your pattern rules.

4. AI Agents Are Creative (Whether You Want Them to Be or Not)

The agent will infer requirements, add edge cases, and suggest improvements. Embrace this creativity instead of suppressing it. But, make sure it's not doing it in the requirements.

5. Gold Standards Beat Rule Books

Perfect examples teach better than detailed explanations. Show, don't tell.

6. Task Focus Beats Comprehensive Context

An agent that masters one task does better than one that knows a bit about many tasks.

The Honest Assessment: What Actually Works

The Wins

✅ Consistency: Generated scenarios follow the same patterns

✅ Speed: Minutes instead of hours for complex features

✅ Creativity: Agent finds edge cases humans miss

✅ Documentation: Creates the specifications that were missing

✅ Onboarding: New team members understand features faster

The Ongoing Challenges

⚠️ Domain drift: Rules accumulate domain specifics over time

⚠️ Edge Case Handling: Still needs human review for unusual scenarios

⚠️ Context Maintenance: Domain configs need regular updates

What It Doesn't Fix

❌ Bad Requirements: Garbage in, garbage out still applies

❌ Process Problems: Technical solutions don't fix workflow issues

❌ Human Communication: Still need clear specs and acceptance criteria

❌ Domain Expertise: Agent can't replace understanding your business

The Practical Implementation Guide

Create Your Gold Standards

Pick your best existing BDD scenarios

Clean them up to perfection

Document why they're good

Use these as training examples

Build Task-Based Rules

Extract minimal rules from gold standards

Create focused rule sets per task

Test with lazy loading approach

Measure consistency improvements

Put in place the Full Workflow

Task 1: Context extraction and analysis

Task 2: Human-readable BDD generation

Task 3a: Behavioural assessment

Task 3b: Automation code generation

Measure and Refine

Compare generated vs. manual scenarios

Track consistency metrics

Identify remaining edge cases

Refine rules based on actual usage

The Honest Assessment: What Actually Works

The Wins

✅ Consistency: Generated scenarios follow the same patterns

✅ Speed: Minutes instead of hours for complex features

✅ Creativity: Agent finds edge cases humans miss

✅ Documentation: Creates the specifications that were missing

✅ Onboarding: New team members understand features faster

The Ongoing Challenges

⚠️ Domain drift: Rules accumulate domain specifics over time. You have to catch it and tell the LLM exactly what you want

⚠️ Edge Case Handling: Still needs human review for unusual scenarios

⚠️ Context Maintenance: Domain configs need regular updates

What It Doesn't Fix

❌ Bad Requirements: Garbage in, garbage out still applies. I added a rule for this after wondering what would happen. It wasn't great. I made it worse by giving it state diagrams for more context.

❌ Process Problems: Technical solutions don't fix workflow issues

❌ Human Communication: Still need clear specs and acceptance criteria

❌ Domain Expertise: Agent can't replace understanding your business

The Future: Advanced Cat Herding Techniques

What's Coming Next

Test priority: make only the required important tests

Testing pyramid understanding: examine unit, component, and end-to-end tests. Then, choose your focus, and suggest where the test should go and how much you overlap

Multi-Domain Configuration: Same rules, different domain contexts. It's rolling out to other teams

Personal opinion disclaimer: I wrote it and worked on all the rules, with some based on my opinion of what's right. Other people may disagree :)

The Ultimate Goal

Requirements go in, and consistent test scenarios come out. Then, humans focus on exploratory testing and business validation. The cats herd themselves, but humans still decide where the herd should go.

Getting Started: Your First Training Session

Ready to train your own AI agent? Here's the quick start:

1. Identify Your Best Scenario

Find your most well-written BDD scenario. This becomes your gold standard.

2. Extract the Pattern

What makes it good? Write down 3-5 key characteristics.

3. Create Minimal Rules

Turn those characteristics into simple guidance:

Use simple language and skip jargon.  

Highlight what users do and the results they get.  

Follow this format: Given, When, Then.  

Mention specifications in feature descriptions.

4. Test the Approach

Give the agent a requirement and ask it to match your gold standard style. Compare results.

If this improves consistency and saves time, you're ready to scale up. If not, refine your gold standard and try again.

The Accidental Innovation: Where's My Billion Dollars?

Here's what troubles me at night*: I got fed up with the waterfall team and their huge specs, so I created a solution. Along the way, I accidentally invented:

Context Engineering: The art of providing exactly the right information at the right time

Context Rot Detection: Identifying that LLMs work better with less context - something I discovered months before learning it was a documented phenomenon

Task-Based LLM Architecture: Breaking complex AI workflows into focused, sequential tasks

Repeatable, Reliable AI Output: Consistent results from inherently inconsistent systems

In the meantime, companies are earning billions by forking VS Code, adding an LLM, and branding it as revolutionary AI-powered development.

*It doesn't.

The Billion-Dollar Question

I'm not bitter (okay, maybe a little bitter), but it's fascinating how the market works:

What Gets Funded:

"We put AI in your code editor!" 💰💰💰

"Chat with your codebase!" 💰💰💰

"AI pair programming!" 💰💰💰

What I Actually Solved:

Performance degradation from excessive context (later learned this was called "Context Rot")

Inconsistent LLM outputs

Domain contamination in rule sets

Task-focused AI workflow design that prevents context overload

The irony is that my solutions could improve every single one of those billion-dollar AI coding tools. They're all struggling with the same fundamental problems:

How much context is too much before performance degrades?

How do you maintain consistency without overwhelming the LLM?

How do you prevent context bloat in long conversations?

Only recently did I discover that what I'd been calling "context overload" has a name: Context Rot - a documented phenomenon where increasing input tokens actually makes LLMs perform worse.

The Real Innovation

What I created wasn't only a BDD generator; it became a framework for dependable AI behaviour. It also solved issues I didn’t even know were there.

Context Engineering: Discovered that focused context beats comprehensive context every time

Lazy Loading Architecture: Only load what you need, when you need it - prevents context bloat

Gold Standard Training: Examples teach better than rules - dramatic context reduction

Performance Optimization: Preventing issues caused by too much context overload (later known as "Context Rot").

Task-Based Workflow: Sequential, focused AI operations with minimal overhead

These principles apply to any AI-powered development tool. The difference is, I solved them because I was annoyed at waterfall processes, not because I was trying to build the next unicorn.

The Lesson in Market Timing

The best innovations often come from fixing your own problems instead of just seeking market chances. I needed consistent test generation, so I built it. The broader applications became obvious later.

The companies doing well now are tackling clear problems with simple solutions. The subtle innovations—like preventing context degradation, optimizing AI performance, and systematic approaches to consistency—come from people who just want the thing to work reliably.

The Subtle Art Conclusion

Training an AI agent for BDD generation is indeed a subtle art. It's not about giving the agent too many rules. It's about offering clear guidance when needed, with good examples.

The cats can be herded, but they need:

Clear direction (gold standards)

Focused attention (lazy loading)

Reasonable expectations (80-90% accuracy)

Human oversight (review and refinement)

After months of training, I've found that the best AI agents are like trained cats. They follow patterns well, sometimes surprise you with creativity, and still need humans to decide what matters.

The key isn't the technology. It's about seeing AI as a creative partner, not trying to make it think like a human.

And if some venture capitalist is reading this and wants to discuss how these accidentally discovered AI optimisation techniques could revolutionise development tools... well, you know where to find me.

In the end, you can't make a cat follow 47 rules, but you can teach it the most important path—to the litter tray and not to poop in the bath.

Paul Coles is a software tester who accidentally invented several AI reliability patterns while being annoyed at waterfall processes. He has spent an unreasonable amount of time training AI agents and thinking about the behavioural patterns of both software systems and actual cats. He writes about testing, automation, and the intersection of technology and mild chaos. Paul is fully aware that you can't train a cat to do much of anything, mine still poops in the bath.