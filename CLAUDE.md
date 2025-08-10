# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This repository contains a 4-part article series titled "The Subtle Art of Herding Cats" about training AI systems effectively. The content focuses on AI workflow optimization, Context Rot mitigation, and systematic approaches to reliable AI behavior, specifically applied to BDD test automation.

## Content Structure

### Core Articles
- `part1.md` - "Why AI Starts Making Stuff Up" - Introduces the Cat Rule and Context Rot problems
- `part2.md` - "Show, Don't Tell: Teaching AI by Example" - Solutions using gold standards and lazy loading
- `part3.md` - "How I Turned Chaos Into a Repeatable Test Process" - Real-world implementation with BMW/Mercedes examples
- `part4.md` - "Context Rot and the Billion Dollar Opportunity" - Market implications and broader applications

### Supporting Content
- `subtle-art.md` and `subtle-art-cleaned.md` - Earlier drafts and consolidated versions
- `hem-subtle-art.md` - Hemingway-style edited version
- `dont-verbatim.md` and `dont-verbatim2.md` - Content guidelines
- `graph TD.mmd` - Mermaid diagram for task-based architecture

### Task Manager Resources
Located in `task-manager/` directory:
- `base-rules/` - Contains conversation logging and task management guidelines (currently empty)
- `context-rules/` - Domain-specific rule examples and test data
- `examples/` - Configuration examples for different domains

## Key Concepts Covered

### The Cat Rule
Maximum 10 competing instructions for AI systems to maintain performance and consistency.

### Context Rot
Documented phenomenon where excessive input tokens degrade AI performance. The articles describe discovering and solving this months before academic research.

### Context Smartness Architecture
Task-based workflow design with focused context loading:
1. Context Extraction (Analysis rules + Domain context only)
2. BDD Generation (BDD patterns + Task 1 output only)  
3. Behavioral Assessment (Assessment criteria + Task 2 output only)
4. Automation Generation (Technical patterns + approved scenarios only)

### Pattern-Led Prompting
Teaching AI through perfect examples rather than comprehensive documentation.

## Development Context

This is a documentation repository with no build system, tests, or code compilation. Content is primarily markdown-based with some structured data files.

The repository serves as both source material and reference implementation for AI workflow optimization principles discovered through practical BDD automation work.

## Working with This Content

When editing or extending this content:
- Maintain the narrative structure and practical focus
- Preserve the BMW vs Mercedes universal pattern examples
- Keep the balance between technical depth and accessibility
- Reference the core principles: Cat Rule, Context Smartness, Pattern-Led Prompting