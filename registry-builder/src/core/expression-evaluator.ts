import { Node, SourceFile, SyntaxKind, VariableDeclaration, FunctionDeclaration } from 'ts-morph';
import { ResolvedExpression } from '../types';

export interface SymbolContext {
  variables: Map<string, any>;
  functions: Map<string, FunctionDeclaration>;
  imports: Map<string, string>;
  currentFile: string;
}

/**
 * Evaluates dynamic expressions in JSX attributes
 * Handles template literals, variable references, and function calls
 */
export class ExpressionEvaluator {
  private symbolTables = new Map<string, SymbolContext>();

  /**
   * Build symbol table for a source file
   */
  buildSymbolTable(sourceFile: SourceFile): SymbolContext {
    const filePath = sourceFile.getFilePath();
    
    if (this.symbolTables.has(filePath)) {
      return this.symbolTables.get(filePath)!;
    }

    const context: SymbolContext = {
      variables: new Map(),
      functions: new Map(), 
      imports: new Map(),
      currentFile: filePath
    };

    // Extract imports
    sourceFile.getImportDeclarations().forEach(importDecl => {
      const moduleSpecifier = importDecl.getModuleSpecifierValue();
      
      importDecl.getNamedImports().forEach(namedImport => {
        const name = namedImport.getName();
        context.imports.set(name, moduleSpecifier);
      });

      // Handle default imports
      const defaultImport = importDecl.getDefaultImport();
      if (defaultImport) {
        context.imports.set(defaultImport.getText(), moduleSpecifier);
      }
    });

    // Extract variable declarations
    sourceFile.getVariableDeclarations().forEach(varDecl => {
      const name = varDecl.getName();
      const initializer = varDecl.getInitializer();
      
      if (initializer) {
        const value = this.evaluateNode(initializer, context);
        context.variables.set(name, value);
      }
    });

    // Extract function declarations
    sourceFile.getFunctions().forEach(funcDecl => {
      const name = funcDecl.getName();
      if (name) {
        context.functions.set(name, funcDecl);
      }
    });

    // Extract const declarations from arrow functions
    sourceFile.getVariableStatements().forEach(varStatement => {
      varStatement.getDeclarations().forEach(decl => {
        const name = decl.getName();
        const initializer = decl.getInitializer();
        
        if (initializer && initializer.getKind() === SyntaxKind.ArrowFunction) {
          context.variables.set(name, initializer);
        }
      });
    });

    this.symbolTables.set(filePath, context);
    return context;
  }

  /**
   * Find and resolve dynamic expressions in JSX attributes
   */
  findDynamicExpressions(jsxElement: Node, context: SymbolContext): ResolvedExpression[] {
    const expressions: ResolvedExpression[] = [];
    const elementText = jsxElement.getText();

    // Find template literals in JSX attributes
    const templateLiterals = this.findTemplateLiterals(elementText);
    templateLiterals.forEach(template => {
      const resolved = this.resolveTemplateString(template, context);
      if (resolved) {
        expressions.push(resolved);
      }
    });

    // Find JSX expression containers {someVariable}
    const jsxExpressions = this.findJSXExpressions(elementText);
    jsxExpressions.forEach(expr => {
      const resolved = this.resolveJSXExpression(expr, context);
      if (resolved) {
        expressions.push(resolved);
      }
    });

    // Find function calls in JSX attributes
    const functionCalls = this.findFunctionCalls(elementText);
    functionCalls.forEach(call => {
      const resolved = this.resolveFunctionCall(call, context);
      if (resolved) {
        expressions.push(resolved);
      }
    });

    return expressions;
  }

  /**
   * Find template literals in element text
   */
  private findTemplateLiterals(text: string): string[] {
    const templates: string[] = [];
    const templateRegex = /`([^`]+)`/g;
    let match;

    while ((match = templateRegex.exec(text)) !== null) {
      templates.push(match[1]);
    }

    return templates;
  }

  /**
   * Find JSX expressions {variable}
   */
  private findJSXExpressions(text: string): string[] {
    const expressions: string[] = [];
    const jsxRegex = /\{([^}]+)\}/g;
    let match;

    while ((match = jsxRegex.exec(text)) !== null) {
      const expr = match[1].trim();
      // Skip complex expressions for now, focus on simple variables
      if (/^[a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)*$/.test(expr)) {
        expressions.push(expr);
      }
    }

    return expressions;
  }

  /**
   * Find function calls in JSX attributes
   */
  private findFunctionCalls(text: string): string[] {
    const calls: string[] = [];
    const callRegex = /([a-zA-Z_][a-zA-Z0-9_]*)\s*\([^)]*\)/g;
    let match;

    while ((match = callRegex.exec(text)) !== null) {
      calls.push(match[0]);
    }

    return calls;
  }

  /**
   * Resolve template string with variable substitution
   */
  private resolveTemplateString(template: string, context: SymbolContext): ResolvedExpression | null {
    const variableRegex = /\$\{([^}]+)\}/g;
    const variables = new Set<string>();
    let match;

    // Find all variables in template
    while ((match = variableRegex.exec(template)) !== null) {
      variables.add(match[1].trim());
    }

    if (variables.size === 0) {
      return null;
    }

    // Try to resolve variables
    const resolvedVariables = new Map<string, string[]>();
    let hasUnresolvedVars = false;

    for (const varName of variables) {
      const resolved = this.resolveVariable(varName, context);
      if (resolved.length > 0) {
        resolvedVariables.set(varName, resolved);
      } else {
        hasUnresolvedVars = true;
      }
    }

    // Generate possible combinations
    const possibleValues: string[] = [];
    
    if (hasUnresolvedVars) {
      // Some variables couldn't be resolved - provide pattern
      possibleValues.push(template);
    } else {
      // Generate combinations
      const combinations = this.generateCombinations(template, resolvedVariables);
      possibleValues.push(...combinations);
    }

    return {
      type: 'template-literal',
      original: `\`${template}\``,
      resolved: possibleValues.length === 1 ? possibleValues[0] : possibleValues,
      confidence: hasUnresolvedVars ? 'low' : 'high'
    };
  }

  /**
   * Resolve JSX expression
   */
  private resolveJSXExpression(expression: string, context: SymbolContext): ResolvedExpression | null {
    const resolved = this.resolveVariable(expression, context);
    
    if (resolved.length === 0) {
      return null;
    }

    return {
      type: 'variable-reference',
      original: `{${expression}}`,
      resolved: resolved.length === 1 ? resolved[0] : resolved,
      confidence: 'medium'
    };
  }

  /**
   * Resolve function call
   */
  private resolveFunctionCall(callText: string, context: SymbolContext): ResolvedExpression | null {
    const callMatch = callText.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)$/);
    if (!callMatch) {
      return null;
    }

    const funcName = callMatch[1];
    const argsText = callMatch[2];

    // Check if it's a known utility function
    const resolved = this.evaluateKnownFunction(funcName, argsText, context);
    
    if (resolved.length === 0) {
      return null;
    }

    return {
      type: 'function-call',
      original: callText,
      resolved: resolved.length === 1 ? resolved[0] : resolved,
      confidence: 'medium'
    };
  }

  /**
   * Resolve variable from context
   */
  private resolveVariable(varName: string, context: SymbolContext): string[] {
    // Handle property access like props.variant
    if (varName.includes('.')) {
      return this.resolvePropertyAccess(varName, context);
    }

    // Check local variables
    if (context.variables.has(varName)) {
      const value = context.variables.get(varName);
      if (typeof value === 'string') {
        return [value];
      }
    }

    // For props and other unknowns, provide common values
    return this.getCommonValues(varName);
  }

  /**
   * Resolve property access like props.variant
   */
  private resolvePropertyAccess(expression: string, context: SymbolContext): string[] {
    const parts = expression.split('.');
    const baseName = parts[0];
    const propertyName = parts[1];

    // Common prop patterns
    if (baseName === 'props') {
      return this.getCommonPropValues(propertyName);
    }

    return [];
  }

  /**
   * Get common values for unknown variables
   */
  private getCommonValues(varName: string): string[] {
    const commonPatterns: Record<string, string[]> = {
      'variant': ['primary', 'secondary', 'danger', 'success'],
      'size': ['sm', 'md', 'lg', 'xl'],
      'type': ['button', 'submit', 'reset'],
      'status': ['active', 'inactive', 'pending'],
      'theme': ['light', 'dark'],
      'color': ['blue', 'green', 'red', 'gray']
    };

    return commonPatterns[varName] || [];
  }

  /**
   * Get common prop values
   */
  private getCommonPropValues(propName: string): string[] {
    return this.getCommonValues(propName);
  }

  /**
   * Evaluate known utility functions
   */
  private evaluateKnownFunction(funcName: string, argsText: string, context: SymbolContext): string[] {
    const args = this.parseArguments(argsText);

    switch (funcName) {
      case 'generateTestId':
      case 'createPageTestId':
      case 'getModalTestId':
        return this.evaluateTestIdFunction(funcName, args, context);
      default:
        return [];
    }
  }

  /**
   * Parse function arguments
   */
  private parseArguments(argsText: string): string[] {
    if (!argsText || !argsText.trim()) {
      return [];
    }

    const args: string[] = [];
    const argRegex = /'([^']*)'|"([^"]*)"|([^,]+)/g;
    let match;

    while ((match = argRegex.exec(argsText)) !== null) {
      const arg = match[1] || match[2] || match[3];
      if (arg !== undefined) {
        args.push(arg.trim());
      }
    }

    return args;
  }

  /**
   * Evaluate test ID generation functions
   */
  private evaluateTestIdFunction(funcName: string, args: string[], context: SymbolContext): string[] {
    if (args.length === 0) {
      return [];
    }

    const resolvedArgs = args.map(arg => {
      if (arg.startsWith("'") || arg.startsWith('"')) {
        // String literal
        return [arg.slice(1, -1)];
      } else {
        // Variable reference
        return this.resolveVariable(arg, context);
      }
    });

    // Generate combinations
    const combinations: string[] = [];
    
    const generateCombos = (index: number, current: string[]): void => {
      if (index >= resolvedArgs.length) {
        combinations.push(current.join('-'));
        return;
      }

      const values = resolvedArgs[index];
      if (values.length === 0) {
        generateCombos(index + 1, [...current, `{${args[index]}}`]);
      } else {
        values.forEach(value => {
          generateCombos(index + 1, [...current, value]);
        });
      }
    };

    generateCombos(0, []);
    return combinations.slice(0, 10); // Limit combinations
  }

  /**
   * Generate combinations for template literals
   */
  private generateCombinations(template: string, variables: Map<string, string[]>): string[] {
    const combinations: string[] = [];
    const variableNames = Array.from(variables.keys());
    
    const generate = (index: number, current: string): void => {
      if (index >= variableNames.length) {
        combinations.push(current);
        return;
      }

      const varName = variableNames[index];
      const values = variables.get(varName)!;
      
      values.forEach(value => {
        const updated = current.replace(new RegExp(`\\$\\{${varName}\\}`, 'g'), value);
        generate(index + 1, updated);
      });
    };

    generate(0, template);
    return combinations.slice(0, 20); // Limit combinations
  }

  /**
   * Evaluate a node to extract its value
   */
  private evaluateNode(node: Node, context: SymbolContext): any {
    const kind = node.getKind();
    
    switch (kind) {
      case SyntaxKind.StringLiteral:
        return node.getText().slice(1, -1); // Remove quotes
      case SyntaxKind.NumericLiteral:
        return parseFloat(node.getText());
      case SyntaxKind.TrueKeyword:
        return true;
      case SyntaxKind.FalseKeyword:
        return false;
      case SyntaxKind.TemplateExpression:
        return node.getText(); // Return as template string
      default:
        return node.getText(); // Fallback to text representation
    }
  }
}