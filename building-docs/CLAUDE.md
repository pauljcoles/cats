# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build and Run
- `npm run build` - Compile TypeScript to JavaScript in dist/
- `npm run start` - Build and run the registry builder
- `npm run dev` - Run directly with ts-node (development mode)
- `npm run watch` - Run TypeScript compiler in watch mode
- `npm run clean` - Remove compiled output in dist/

### Analysis Commands
- `npm run analyze [path]` - Build and run registry analysis on specified path
- `npm run analyze <app-path> <test-path>` - Build and run analysis on separate app and test codebases
- `npm run analyze-watch` - Watch files and re-run analysis on changes

### Multi-Path Support
The registry builder now supports scanning separate codebases:
- **Single codebase**: `npm run analyze ./my-monorepo` (traditional usage)
- **Separate codebases**: `npm run analyze ./frontend-app ./e2e-automation`

This is useful for corporate environments where:
- Frontend application code lives in one repository
- Test automation (page objects, features, steps) lives in another repository

### Quality Assurance
- `npm run test` - Run Jest tests
- `npm run lint` - Run ESLint on TypeScript files
- `npm run setup` - Install dependencies and build

## Project Architecture

This is a **TAF (Test Automation Framework) Registry Builder** that creates knowledge graphs by analyzing test automation codebases. The main application is a single-file TypeScript tool that performs automated discovery and mapping.

### Core Components

**AutomatedRegistryBuilder Class** (`src/registry-builder.ts:43-822`)
- Main orchestrator that runs 4-phase analysis pipeline
- Manages node registry and relationship mapping
- Handles file discovery, parsing, relationship building, and output generation

**Registry Data Model**
- **RegistryNode**: Represents entities (PageObjects, TafSelectors, StepDefinitions, etc.)
- **RegistryRelationship**: Defines connections between nodes (MAPS_TO, USES, CONTAINS, etc.)
- **SelectorMapping**: Maps TAF selectors to page elements with confidence scoring

### Analysis Pipeline (4 Phases)

1. **Discovery Phase** (`discoverFiles:82-112`)
   - Scans for PageObjects, test data JSON files, step definitions, and feature files
   - Uses configurable glob patterns for different file types

2. **Parsing Phase** (`parseFiles:117-142`)
   - Extracts TypeScript AST information from page objects
   - Parses JSON test data for TAF selectors and scenarios
   - Processes Gherkin feature files and step definitions

3. **Relationship Building** (`buildRelationships:147-161`)
   - Smart mapping between TAF selectors and page elements using similarity algorithms
   - Creates cross-references between features, steps, and page objects
   - Uses confidence scoring (0.7+ threshold) for mapping quality

4. **Output Generation** (`generateOutputs:443-475`)
   - Generates complete registry JSON with metadata
   - Creates mapping reports and missing mappings analysis
   - Produces visualization data for graph rendering

### Key File Patterns

The tool discovers files using these patterns:
- Page Objects: `**/*Page.ts`, `**/*Module.ts`, `**/page-objects/**/*.ts`
- Test Data: `**/*test_data*.json`, `**/*test-data*.json`, `**/data/**/*.json`
- Step Definitions: `**/*.steps.ts`, `**/step-definitions/**/*.ts`
- Feature Files: `**/*.feature`, `**/features/**/*.feature`

### Output Structure

All generated files are placed in `registry-output/`:
- `complete-registry.json` - Full knowledge graph with nodes and relationships
- `mapping-report.json` - TAF selector to page element mappings with confidence scores
- `missing-mappings.json` - Unmapped selectors with recommendations
- `visualization-data.json` - Graph data for D3.js visualization

## Usage Patterns

### Basic Analysis
```bash
npm run analyze /path/to/taf/project
```

### Development Mode
```bash
npm run dev /path/to/project
```

### Continuous Analysis
```bash
npm run analyze-watch
```

## Dependencies

- **typescript**: Core language support and AST parsing
- **glob**: File pattern matching for discovery
- **chokidar**: File watching for continuous analysis
- **commander**: CLI argument parsing
- **chalk/ora**: Terminal output formatting and progress indicators

The tool requires Node.js 18+ and generates comprehensive reports for test automation knowledge graph analysis.