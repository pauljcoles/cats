# Static Analysis Tool Implementation Plan

## Architecture Overview

```
JSON Config → Route Discovery → Import Resolution → AST Analysis → Expression Evaluation → Page Registry
```

## Phase 1: Project Setup & Core Infrastructure

### 1.1 Dependencies
```json
{
  "typescript": "^5.0.0",
  "ts-morph": "^20.0.0", 
  "glob": "^10.0.0",
  "path": "^0.12.7"
}
```

### 1.2 Core Types
```typescript
interface ScanConfig {
  routes: string[];           // ["src/pages/index.ts", "src/routes/app.ts"]
  includePatterns: string[];  // ["**/*.page.tsx", "**/components/**"]
  excludePatterns: string[];  // ["**/*.test.tsx", "**/node_modules/**"]
  aliases?: Record<string, string>; // {"@": "./src", "@components": "./src/components"}
}

interface PageElement {
  type: 'interactive' | 'skeleton' | 'whirligig';
  component: string;
  selectors: AccessibleSelectors;
  dynamicExpressions: ResolvedExpression[];
  location: SourceLocation;
}

interface ResolvedExpression {
  type: 'template-literal' | 'variable-reference' | 'function-call';
  original: string;
  resolved: string | string[]; // Multiple possibilities for dynamic values
  confidence: 'high' | 'medium' | 'low';
}
```

## Phase 2: Configuration & Route Discovery

### 2.1 Config Parser
```typescript
class ConfigLoader {
  static load(configPath: string): ScanConfig {
    // Load and validate JSON config
    // Resolve relative paths
    // Apply defaults
  }
}
```

### 2.2 Route File Discovery
```typescript
class RouteDiscovery {
  constructor(private config: ScanConfig) {}
  
  async discoverRoutes(): Promise<string[]> {
    // Start from config.routes (index.ts files)
    // Use glob to expand patterns
    // Apply include/exclude filters
    // Return flat list of files to analyze
  }
}
```

## Phase 3: Import Resolution Engine

### 3.1 Dependency Graph Builder
```typescript
class ImportResolver {
  private project: Project;
  private dependencyGraph: Map<string, string[]>;
  
  constructor(tsConfigPath?: string) {
    this.project = new Project({ tsConfigFilePath });
  }
  
  async resolveImports(entryFiles: string[]): Promise<string[]> {
    // Parse each entry file's imports
    // Recursively follow import chains
    // Handle relative/absolute imports
    // Apply alias resolution
    // Build complete file dependency graph
    // Return all files that need scanning
  }
  
  private resolveModulePath(importPath: string, fromFile: string): string {
    // Handle relative imports: ./component, ../utils
    // Handle absolute imports: @/components, @components
    // Apply tsconfig path mapping
    // Resolve to actual file paths
  }
}
```

### 3.2 Import Types to Track
- Component imports: `import { Button } from '@/components'`
- Type imports: `import type { PageProps } from './types'`
- Dynamic imports: `const Component = lazy(() => import('./Component'))`
- Re-exports: `export { Button } from './Button'`

## Phase 4: AST Analysis Engine

### 4.1 Core AST Scanner
```typescript
class ASTScanner {
  private project: Project;
  private symbolTable: Map<string, any>;
  
  scanFiles(filePaths: string[]): Promise<PageElement[]> {
    const elements: PageElement[] = [];
    
    for (const filePath of filePaths) {
      const sourceFile = this.project.getSourceFile(filePath);
      const fileElements = this.scanSourceFile(sourceFile);
      elements.push(...fileElements);
    }
    
    return elements;
  }
  
  private scanSourceFile(sourceFile: SourceFile): PageElement[] {
    // Visit all JSX elements
    // Identify component types (interactive/skeleton/whirligig)
    // Extract selectors and dynamic expressions
    // Build symbol table for variables
  }
}
```

### 4.2 JSX Element Analysis
```typescript
class JSXAnalyzer {
  analyzeElement(jsxElement: JsxElement): PageElement | null {
    const tagName = this.getTagName(jsxElement);
    const props = this.extractProps(jsxElement);
    
    // Categorize element type
    const type = this.categorizeElement(tagName, props);
    if (!type) return null;
    
    // Extract accessible selectors (Testing Library style)
    const selectors = this.extractAccessibleSelectors(jsxElement);
    
    // Find dynamic expressions in props/content
    const dynamicExpressions = this.findDynamicExpressions(jsxElement);
    
    return {
      type,
      component: tagName,
      selectors,
      dynamicExpressions,
      location: this.getLocation(jsxElement)
    };
  }
}
```

## Phase 5: Dynamic Expression Evaluator

### 5.1 Expression Types to Handle

#### Template Literals
```typescript
// Input: `data-testid={`button-${variant}-${size}`}`
// Need to resolve: variant and size variables
class TemplateLiteralResolver {
  resolve(templateLiteral: TemplateLiteral, context: SymbolContext): ResolvedExpression {
    // Parse template parts
    // Resolve each variable reference
    // Generate possible combinations
    // Return resolved patterns
  }
}
```

#### Variable References
```typescript
// Input: const testId = `form-${formType}`; ... data-testid={testId}
class VariableResolver {
  resolve(identifier: Identifier, context: SymbolContext): ResolvedExpression {
    // Trace variable declaration
    // Follow assignment chain
    // Resolve to literal value or pattern
  }
}
```

#### Function Calls
```typescript
// Input: data-testid={generateTestId('button', props.variant)}
class FunctionCallResolver {
  resolve(callExpression: CallExpression, context: SymbolContext): ResolvedExpression {
    // Analyze function definition
    // Evaluate arguments
    // Simulate function execution statically
    // Handle common utility patterns
  }
}
```

### 5.2 Symbol Context Builder
```typescript
class SymbolContext {
  private variables: Map<string, any> = new Map();
  private functions: Map<string, FunctionDeclaration> = new Map();
  private imports: Map<string, string> = new Map();
  
  resolveSymbol(name: string): any {
    // Check local variables
    // Check function parameters
    // Check imported symbols
    // Follow reference chain
  }
  
  evaluateExpression(expression: Expression): any {
    // Handle different expression types
    // Return resolved value or pattern
  }
}
```

## Phase 6: Testing Library Selector Extraction

### 6.1 Accessible Selector Priority
```typescript
class AccessibleSelectorExtractor {
  extract(jsxElement: JsxElement): AccessibleSelectors {
    return {
      // Priority order (Testing Library style)
      byRole: this.extractRole(jsxElement),
      byLabelText: this.extractLabelText(jsxElement),
      byPlaceholderText: this.extractAttribute(jsxElement, 'placeholder'),
      byText: this.extractTextContent(jsxElement),
      byDisplayValue: this.extractDisplayValue(jsxElement),
      byAltText: this.extractAttribute(jsxElement, 'alt'),
      byTitle: this.extractAttribute(jsxElement, 'title'),
      byTestId: this.extractTestId(jsxElement) // Last resort
    };
  }
}
```

## Phase 7: Output Generation

### 7.1 Page Registry Format
```typescript
interface PageRegistry {
  pages: {
    [pagePath: string]: {
      components: PageElement[];
      imports: string[];
      metadata: {
        scannedAt: string;
        confidence: number;
      };
    };
  };
  globalElements: PageElement[];
  statistics: ScanStatistics;
}
```

### 7.2 Page Object Generator
```typescript
class PageObjectGenerator {
  generate(registry: PageRegistry): string {
    // Generate TypeScript page object classes
    // Use accessible selectors as primary methods
    // Include dynamic expression variants
    // Add JSDoc comments with metadata
  }
}
```

## Phase 8: CLI & Integration

### 8.1 CLI Interface
```bash
# Basic usage
static-scanner --config scanner.json

# With options
static-scanner --config scanner.json --output page-registry.json --format typescript

# Watch mode
static-scanner --config scanner.json --watch
```

### 8.2 Sample Config File
```json
{
  "routes": [
    "src/pages/index.ts",
    "src/routes/app.ts"
  ],
  "includePatterns": [
    "**/*.page.tsx",
    "**/*.component.tsx",
    "**/components/**/*.tsx"
  ],
  "excludePatterns": [
    "**/*.test.tsx",
    "**/*.stories.tsx",
    "**/node_modules/**"
  ],
  "aliases": {
    "@": "./src",
    "@components": "./src/components",
    "@pages": "./src/pages"
  },
  "output": {
    "registry": "./test-automation/page-registry.json",
    "pageObjects": "./test-automation/page-objects/"
  },
  "evaluation": {
    "maxDepth": 5,
    "followDynamicImports": true,
    "resolveCallExpressions": true
  }
}
```

## Implementation Order

1. **Week 1**: Core infrastructure, config loading, route discovery
2. **Week 2**: Import resolution engine, dependency graph
3. **Week 3**: Basic AST scanning, JSX element identification
4. **Week 4**: Accessible selector extraction (Testing Library style)
5. **Week 5**: Dynamic expression evaluation (template literals)
6. **Week 6**: Variable and function call resolution
7. **Week 7**: Output generation, page object creation
8. **Week 8**: CLI, testing, refinement

## Key Challenges & Solutions

### Challenge 1: Complex Dynamic Expressions
**Solution**: Build expression evaluation with confidence levels. When unsure, generate multiple possibilities.

### Challenge 2: Import Resolution Complexity
**Solution**: Use TypeScript compiler's module resolution + custom alias handling.

### Challenge 3: Context-Dependent Variables
**Solution**: Build comprehensive symbol tables that track variable flow across files.

### Challenge 4: Performance on Large Codebases
**Solution**: Implement caching, incremental scanning, and parallel processing.

This plan provides a solid foundation for building your static analysis tool that can handle dynamic expressions while following Testing Library principles for accessible selector extraction.