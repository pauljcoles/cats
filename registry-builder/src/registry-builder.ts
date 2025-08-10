#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import * as ts from 'typescript';

/**
 * Automated Registry Builder for TAF Knowledge Graph
 * 
 * This tool automatically discovers and maps relationships between:
 * - JSON test data files (taf_selectors, test_scenarios)
 * - Page Object classes (.ts files)
 * - Step definition files (.steps.ts)
 * - Feature files (.feature)
 * 
 * Usage: npx ts-node registry-builder.ts [project-root]
 */

interface RegistryNode {
  id: string;
  type: 'PageObject' | 'TafSelector' | 'TestScenario' | 'StepDefinition' | 'FeatureFile' | 'PageElement' | 'ReactComponent' | 'VueComponent' | 'SemanticElement';
  name: string;
  filePath: string;
  metadata: Record<string, any>;
  relationships: RegistryRelationship[];
}

interface RegistryRelationship {
  targetId: string;
  type: 'MAPS_TO' | 'DEFINES' | 'USES' | 'CONTAINS' | 'INHERITS_FROM' | 'SEMANTIC_MATCH' | 'NEEDS_ACCESSIBILITY' | 'REQUIRES_TEST_ID';
  confidence: number;
  metadata?: Record<string, any>;
}

interface SelectorMapping {
  jsonSelector: string;
  pageElement: string;
  confidence: number;
  matchType: 'exact' | 'partial' | 'semantic';
}

interface SemanticElement {
  tagName: string;
  attributes?: Record<string, any>;
  semanticSelectors: {
    textContent?: string;
    ariaLabel?: string;
    ariaRole?: string;
    placeholder?: string;
    type?: string;
    name?: string;
    title?: string;
  };
  recommendedSelector: string;
  selectorPriority: 'always' | 'sparingly' | 'good' | 'never';
  requiresTestId: boolean;
  accessibilityIssues: string[];
  translationKey?: string | undefined;
  propPatterns?: string[];
  hasPropsContent?: boolean;
  automationPriority?: 'high' | 'medium' | 'low' | 'none';
  automationAnalysis?: {
    testAttributes: string[];
    accessibilityAttributes: string[];
    behaviorAttributes: string[];
    identifierScore: number;
  };
}

interface ComponentAnalysis {
  componentName: string;
  framework: 'react' | 'vue';
  elements: SemanticElement[];
  childComponents: string[];
  routes: RouteInfo[];
  accessibility: {
    issues: string[];
    recommendations: string[];
  };
}

interface RouteInfo {
  path: string;
  method: 'exact' | 'pattern' | 'inferred';
  source: 'router' | 'filename' | 'directory';
  confidence: number;
}

interface ScanPaths {
  appCodePath: string;      // Where the React/Vue app code lives
  testCodePath?: string;    // Where the TAF code lives (optional, defaults to appCodePath)
}

class AutomatedRegistryBuilder {
  private nodes: Map<string, RegistryNode> = new Map();
  private scanPaths: ScanPaths;
  
  constructor(config: string | ScanPaths = process.cwd()) {
    if (typeof config === 'string') {
      // Single path - traditional usage
      this.scanPaths = {
        appCodePath: path.resolve(config),
        testCodePath: path.resolve(config)
      };
    } else {
      // Multi-path configuration
      this.scanPaths = {
        appCodePath: path.resolve(config.appCodePath),
        testCodePath: path.resolve(config.testCodePath || config.appCodePath)
      };
    }
  }

  /**
   * Main entry point - builds the complete registry
   */
  async buildRegistry(): Promise<void> {
    console.log('🚀 Starting automated registry build...');
    console.log(`📁 App code path: ${this.scanPaths.appCodePath}`);
    console.log(`📁 Test code path: ${this.scanPaths.testCodePath}`);

    try {
      // Phase 1: Discovery
      await this.discoverFiles();
      
      // Phase 2: Parse and extract information
      await this.parseFiles();
      
      // Phase 3: Build relationships
      await this.buildRelationships();
      
      // Phase 4: Generate outputs
      await this.generateOutputs();
      
      console.log('✅ Registry build completed successfully!');
      
    } catch (error) {
      console.error('❌ Registry build failed:', error);
      throw error;
    }
  }

  /**
   * Phase 1: Discover all relevant files in the codebase
   */
  private async discoverFiles(): Promise<void> {
    console.log('\n📂 Phase 1: File Discovery');
    
    // TAF patterns - scan test code path
    const tafPatterns = {
      pageObjects: [
        '**/*Page.ts', '**/*Module.ts', '**/page-objects/**/*.ts',
        '**/pages/**/*.ts', '**/tests/pages/**/*.ts', // Playwright patterns
        '**/*page.ts', '**/*Page.js', '**/pages/**/*.js'
      ],
      testData: [
        '**/*test_data*.json', '**/*test-data*.json', '**/data/**/*.json',
        '**/fixtures/**/*.json', '**/test-data/**/*.json'
      ],
      stepDefinitions: [
        '**/*.steps.ts', '**/step-definitions/**/*.ts',
        '**/steps/**/*.ts', '**/*steps.ts'
      ],
      featureFiles: [
        '**/*.feature', '**/features/**/*.feature',
        '**/e2e/**/*.feature'
      ],
      testSelectors: [
        '**/*selectors.d.ts', '**/*selectors.ts', '**/test-ids.ts',
        '**/fixtures/**/*.ts', '**/support/**/*.ts'
      ]
    };
    
    // App patterns - scan app code path
    const appPatterns = {
      reactComponents: ['**/*.tsx', '**/*.jsx'],
      vueComponents: ['**/*.vue'],
      translationFiles: ['**/*i18n*.json', '**/locales/**/*.json', '**/translations/**/*.json']
    };

    // Scan TAF files
    console.log('  🧪 Scanning TAF files...');
    for (const [type, globPatterns] of Object.entries(tafPatterns)) {
      const files = await this.findFilesInPath(globPatterns, this.scanPaths.testCodePath!);
      console.log(`    ${type}: ${files.length} files found`);
      this.createNodesFromFiles(files, type);
    }

    // Scan app files  
    console.log('  ⚛️ Scanning app component files...');
    for (const [type, globPatterns] of Object.entries(appPatterns)) {
      const files = await this.findFilesInPath(globPatterns, this.scanPaths.appCodePath);
      console.log(`    ${type}: ${files.length} files found`);
      this.createNodesFromFiles(files, type);
    }
    
    console.log(`📊 Total nodes discovered: ${this.nodes.size}`);
  }
  
  /**
   * Find files matching patterns in a specific path
   */
  private async findFilesInPath(patterns: string[], basePath: string): Promise<string[]> {
    const files = new Set<string>();
    
    for (const pattern of patterns) {
      const found = await glob(pattern, {
        cwd: basePath,
        absolute: true,
        ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.git/**']
      });
      found.forEach(file => files.add(file));
    }
    
    return Array.from(files);
  }
  
  /**
   * Create registry nodes from discovered files
   */
  private createNodesFromFiles(files: string[], type: string): void {
    for (const file of files) {
      const nodeId = this.generateNodeId(file);
      const node: RegistryNode = {
        id: nodeId,
        type: this.getNodeType(file),
        name: path.basename(file, path.extname(file)),
        filePath: file,
        metadata: { fileType: type },
        relationships: []
      };
      
      this.nodes.set(nodeId, node);
    }
  }

  /**
   * Phase 2: Parse files and extract detailed information
   */
  private async parseFiles(): Promise<void> {
    console.log('\n🔍 Phase 2: File Parsing');
    
    for (const [nodeId, node] of this.nodes.entries()) {
      try {
        switch (node.type) {
          case 'PageObject':
            await this.parsePageObject(node);
            break;
          case 'TafSelector':
            await this.parseTestDataFile(node);
            break;
          case 'StepDefinition':
            await this.parseStepDefinition(node);
            break;
          case 'FeatureFile':
            await this.parseFeatureFile(node);
            break;
          case 'ReactComponent':
            await this.parseReactComponent(node);
            break;
          case 'VueComponent':
            await this.parseVueComponent(node);
            break;
        }
      } catch (error) {
        console.warn(`⚠️  Warning: Failed to parse ${node.filePath}:`, error instanceof Error ? error.message : String(error));
      }
    }
    
    console.log('✅ File parsing completed');
  }

  /**
   * Phase 3: Build relationships between nodes
   */
  private async buildRelationships(): Promise<void> {
    console.log('\n🔗 Phase 3: Building Relationships');
    
    // Build selector mappings
    const mappings = await this.buildSelectorMappings();
    console.log(`  📌 Found ${mappings.length} selector mappings`);
    
    // Build step definition relationships
    await this.buildStepRelationships();
    
    // Build feature file relationships
    await this.buildFeatureRelationships();
    
    console.log('✅ Relationship building completed');
  }

  /**
   * Parse TypeScript page object files
   */
  private async parsePageObject(node: RegistryNode): Promise<void> {
    const sourceCode = fs.readFileSync(node.filePath, 'utf8');
    const sourceFile = ts.createSourceFile(
      node.filePath,
      sourceCode,
      ts.ScriptTarget.Latest,
      true
    );

    const elements: any[] = [];
    const methods: any[] = [];
    let className = '';

    const visitNode = (tsNode: ts.Node): void => {
      if (ts.isClassDeclaration(tsNode) && tsNode.name) {
        className = tsNode.name.text;
      }
      
      if (ts.isGetAccessorDeclaration(tsNode) && tsNode.name) {
        const elementName = ts.isIdentifier(tsNode.name) ? tsNode.name.text : '';
        const selector = this.extractSelectorFromGetter(tsNode);
        
        if (selector) {
          elements.push({
            name: elementName,
            selector,
            type: this.inferElementType(selector)
          });
        }
        
        // Create child node for page element
        if (selector) {
          const elementNodeId = `${node.id}_element_${elementName}`;
          const elementNode: RegistryNode = {
            id: elementNodeId,
            type: 'PageElement',
            name: elementName,
            filePath: node.filePath,
            metadata: { 
              selector,
              parentClass: className,
              elementType: this.inferElementType(selector)
            },
            relationships: []
          };
          
          this.nodes.set(elementNodeId, elementNode);
        }
      }
      
      if (ts.isMethodDeclaration(tsNode) && tsNode.name) {
        const methodName = ts.isIdentifier(tsNode.name) ? tsNode.name.text : '';
        methods.push({ name: methodName });
      }

      ts.forEachChild(tsNode, visitNode);
    };

    visitNode(sourceFile);

    // Update node metadata
    node.metadata = {
      ...node.metadata,
      className,
      elements,
      methods,
      baseClass: this.extractBaseClass(sourceFile)
    };
  }

  /**
   * Parse JSON test data files to extract TAF selectors
   */
  private async parseTestDataFile(node: RegistryNode): Promise<void> {
    const content = fs.readFileSync(node.filePath, 'utf8');
    const jsonData = JSON.parse(content);

    // Extract TAF selectors
    const tafSelectors = jsonData.taf_selectors || {};
    const testScenarios = jsonData.test_scenarios || {};

    for (const [selectorName, selectorValue] of Object.entries(tafSelectors)) {
      const selectorNodeId = `${node.id}_selector_${selectorName}`;
      const selectorNode: RegistryNode = {
        id: selectorNodeId,
        type: 'TafSelector',
        name: selectorName,
        filePath: node.filePath,
        metadata: {
          selector: selectorValue,
          sourceFile: node.name
        },
        relationships: []
      };
      
      this.nodes.set(selectorNodeId, selectorNode);
    }

    // Extract test scenarios
    for (const [scenarioName, scenarioData] of Object.entries(testScenarios)) {
      const scenarioNodeId = `${node.id}_scenario_${scenarioName}`;
      const scenarioNode: RegistryNode = {
        id: scenarioNodeId,
        type: 'TestScenario',
        name: scenarioName,
        filePath: node.filePath,
        metadata: {
          scenario: scenarioData,
          sourceFile: node.name
        },
        relationships: []
      };
      
      this.nodes.set(scenarioNodeId, scenarioNode);
    }

    node.metadata = {
      ...node.metadata,
      selectorsCount: Object.keys(tafSelectors).length,
      scenariosCount: Object.keys(testScenarios).length
    };
  }

  /**
   * Parse step definition files
   */
  private async parseStepDefinition(node: RegistryNode): Promise<void> {
    const sourceCode = fs.readFileSync(node.filePath, 'utf8');
    const steps = this.extractStepDefinitions(sourceCode);
    
    node.metadata = {
      ...node.metadata,
      steps,
      stepsCount: steps.length
    };
  }

  /**
   * Parse feature files
   */
  private async parseFeatureFile(node: RegistryNode): Promise<void> {
    const content = fs.readFileSync(node.filePath, 'utf8');
    const scenarios = this.extractGherkinScenarios(content);
    
    node.metadata = {
      ...node.metadata,
      scenarios,
      scenariosCount: scenarios.length
    };
  }

  /**
   * Parse React TSX/JSX components
   */
  private async parseReactComponent(node: RegistryNode): Promise<void> {
    const sourceCode = fs.readFileSync(node.filePath, 'utf8');
    const sourceFile = ts.createSourceFile(
      node.filePath,
      sourceCode,
      ts.ScriptTarget.Latest,
      true
    );

    const analysis = this.analyzeReactComponent(sourceFile, node.name, node.filePath);
    const elements = analysis.elements;
    
    // Create semantic element nodes
    for (const element of elements) {
      const elementNodeId = `${node.id}_element_${element.tagName}_${Math.random().toString(36).substr(2, 9)}`;
      const elementNode: RegistryNode = {
        id: elementNodeId,
        type: 'SemanticElement',
        name: element.recommendedSelector,
        filePath: node.filePath,
        metadata: {
          ...element,
          parentComponent: node.name
        },
        relationships: []
      };
      
      this.nodes.set(elementNodeId, elementNode);
      
      // Add relationship from component to element
      node.relationships.push({
        targetId: elementNodeId,
        type: 'CONTAINS',
        confidence: 1.0,
        metadata: { elementType: element.tagName }
      });
    }

    node.metadata = {
      ...node.metadata,
      framework: 'react',
      elementsCount: elements.length,
      semanticElements: elements.filter(e => e.selectorPriority === 'always').length,
      accessibilityIssues: analysis.accessibility.issues,
      childComponents: analysis.childComponents,
      routes: analysis.routes
    };
  }

  /**
   * Parse Vue SFC components
   */
  private async parseVueComponent(node: RegistryNode): Promise<void> {
    const sourceCode = fs.readFileSync(node.filePath, 'utf8');
    const analysis = this.analyzeVueComponent(sourceCode, node.name, node.filePath);
    const elements = analysis.elements;
    
    // Create semantic element nodes
    for (const element of elements) {
      const elementNodeId = `${node.id}_element_${element.tagName}_${Math.random().toString(36).substr(2, 9)}`;
      const elementNode: RegistryNode = {
        id: elementNodeId,
        type: 'SemanticElement',
        name: element.recommendedSelector,
        filePath: node.filePath,
        metadata: {
          ...element,
          parentComponent: node.name
        },
        relationships: []
      };
      
      this.nodes.set(elementNodeId, elementNode);
      
      // Add relationship from component to element
      node.relationships.push({
        targetId: elementNodeId,
        type: 'CONTAINS',
        confidence: 1.0,
        metadata: { elementType: element.tagName }
      });
    }

    node.metadata = {
      ...node.metadata,
      framework: 'vue',
      elementsCount: elements.length,
      semanticElements: elements.filter(e => e.selectorPriority === 'always').length,
      accessibilityIssues: analysis.accessibility.issues,
      childComponents: analysis.childComponents,
      routes: analysis.routes
    };
  }

  /**
   * Build smart mappings between TAF selectors and page elements
   */
  private async buildSelectorMappings(): Promise<SelectorMapping[]> {
    const mappings: SelectorMapping[] = [];
    
    const tafSelectors = Array.from(this.nodes.values()).filter(n => n.type === 'TafSelector');
    const pageElements = Array.from(this.nodes.values()).filter(n => n.type === 'PageElement');
    
    for (const tafNode of tafSelectors) {
      const tafSelector = tafNode.metadata['selector'];
      
      for (const elementNode of pageElements) {
        const pageSelector = elementNode.metadata['selector'];
        
        if (pageSelector) {
          const mapping = this.calculateSelectorMapping(
            tafSelector,
            pageSelector,
            tafNode.name,
            elementNode.name
          );
          
          if (mapping.confidence > 0.7) {
            mappings.push(mapping);
            
            // Create relationship
            tafNode.relationships.push({
              targetId: elementNode.id,
              type: 'MAPS_TO',
              confidence: mapping.confidence,
              metadata: { matchType: mapping.matchType }
            });
          }
        }
      }
    }
    
    return mappings;
  }

  /**
   * Calculate similarity between TAF selector and page element selector
   */
  private calculateSelectorMapping(
    tafSelector: string,
    pageSelector: string,
    tafName: string,
    elementName: string
  ): SelectorMapping {
    let confidence = 0;
    let matchType: 'exact' | 'partial' | 'semantic' = 'semantic';

    // Exact match
    if (tafSelector === pageSelector) {
      confidence = 1.0;
      matchType = 'exact';
    }
    // Partial selector match
    else if (pageSelector.includes(tafSelector) || tafSelector.includes(pageSelector)) {
      confidence = 0.8;
      matchType = 'partial';
    }
    // Name similarity
    else {
      const nameSimilarity = this.calculateStringSimilarity(tafName, elementName);
      if (nameSimilarity > 0.7) {
        confidence = nameSimilarity * 0.9;
        matchType = 'semantic';
      }
    }

    return {
      jsonSelector: tafSelector,
      pageElement: pageSelector,
      confidence,
      matchType
    };
  }

  /**
   * Build relationships for step definitions
   */
  private async buildStepRelationships(): Promise<void> {
    const stepNodes = Array.from(this.nodes.values()).filter(n => n.type === 'StepDefinition');
    const pageNodes = Array.from(this.nodes.values()).filter(n => n.type === 'PageObject');
    
    for (const stepNode of stepNodes) {
      for (const step of stepNode.metadata['steps'] || []) {
        // Look for page object references in step implementations
        for (const pageNode of pageNodes) {
          if (this.stepReferencesPage(step, pageNode)) {
            stepNode.relationships.push({
              targetId: pageNode.id,
              type: 'USES',
              confidence: 0.9
            });
          }
        }
      }
    }
  }

  /**
   * Build relationships for feature files
   */
  private async buildFeatureRelationships(): Promise<void> {
    const featureNodes = Array.from(this.nodes.values()).filter(n => n.type === 'FeatureFile');
    const stepNodes = Array.from(this.nodes.values()).filter(n => n.type === 'StepDefinition');
    
    for (const featureNode of featureNodes) {
      for (const scenario of featureNode.metadata['scenarios'] || []) {
        for (const step of scenario.steps || []) {
          // Find matching step definition
          const matchingStepNode = this.findMatchingStepDefinition(step, stepNodes);
          if (matchingStepNode) {
            featureNode.relationships.push({
              targetId: matchingStepNode.id,
              type: 'USES',
              confidence: 0.95
            });
          }
        }
      }
    }
  }

  /**
   * Generate all outputs (JSON, visualization, reports)
   */
  private async generateOutputs(): Promise<void> {
    console.log('\n📄 Phase 4: Generating Outputs');
    
    const outputDir = path.join(this.scanPaths.appCodePath, 'scan-results', 'registry-output');
    await fs.promises.mkdir(outputDir, { recursive: true });

    // 1. Generate complete registry JSON
    const registryData = {
      metadata: {
        generatedAt: new Date().toISOString(),
        nodeCount: this.nodes.size,
        relationshipCount: this.getTotalRelationshipCount()
      },
      nodes: Array.from(this.nodes.values()),
      summary: this.generateSummary()
    };

    await fs.promises.writeFile(
      path.join(outputDir, 'complete-registry.json'),
      JSON.stringify(registryData, null, 2)
    );

    // 2. Generate mapping report
    await this.generateMappingReport(outputDir);

    // 3. Generate missing mappings report
    await this.generateMissingMappingsReport(outputDir);

    // 4. Generate graph visualization data
    await this.generateVisualizationData(outputDir);

    // 5. Generate semantic analysis report
    await this.generateSemanticAnalysisReport(outputDir);

    // 6. Generate automation summary
    await this.generateAutomationSummary(outputDir);

    // 7. Generate HTML dashboard
    await this.generateHtmlDashboard(outputDir);

    // 8. Generate bidirectional mapping JSON
    await this.generateBidirectionalMapping(outputDir);

    // 9. Generate enhanced missing mappings report
    await this.generateEnhancedMissingMappingsReport(outputDir);

    console.log(`📁 Outputs generated in: ${outputDir}`);
  }

  /**
   * Extract prop-based content from JSX elements
   */
  private extractPropBasedContent(jsxNode: ts.JsxElement | ts.JsxSelfClosingElement): {
    hasTextProps: boolean;
    suggestedText: string;
    translationKey?: string | undefined;
    propExpressions: string[];
  } {
    const propExpressions: string[] = [];
    let hasTextProps = false;
    let suggestedText = '';
    let translationKey: string | undefined;

    if (ts.isJsxElement(jsxNode)) {
      // Look for JSX expressions that might contain text
      for (const child of jsxNode.children) {
        if (ts.isJsxExpression(child) && child.expression) {
          const expressionText = child.expression.getText();
          propExpressions.push(expressionText);
          
          // Check for common prop patterns
          if (this.isPropBasedTextContent(expressionText)) {
            hasTextProps = true;
            suggestedText = this.generateSuggestedTextFromProp(expressionText);
            translationKey = this.extractTranslationKey(expressionText);
          }
        }
      }
    }

    return {
      hasTextProps,
      suggestedText,
      translationKey: translationKey || undefined,
      propExpressions
    };
  }

  private isPropBasedTextContent(expression: string): boolean {
    // Common patterns for text props
    const textPropPatterns = [
      /\blabel\b/,           // {label}
      /\btext\b/,            // {text}
      /\btitle\b/,           // {title}
      /\bcontent\b/,         // {content}
      /\bchildren\b/,        // {children}
      /\bmessage\b/,         // {message}
      /\bname\b/,            // {name}
      /\bt\(/,               // {t('key')} - translation function
      /\btranslate\(/,       // {translate('key')}
    ];
    
    return textPropPatterns.some(pattern => pattern.test(expression));
  }

  private generateSuggestedTextFromProp(expression: string): string {
    // Extract meaningful text from prop expressions
    if (expression.includes('label')) return 'PROP_LABEL';
    if (expression.includes('title')) return 'PROP_TITLE';
    if (expression.includes('text')) return 'PROP_TEXT';
    if (expression.includes('children')) return 'PROP_CHILDREN';
    if (expression.includes('name')) return 'PROP_NAME';
    if (expression.includes('message')) return 'PROP_MESSAGE';
    
    // Extract translation keys
    const translationMatch = expression.match(/["']([^"']+)["']/);
    if (translationMatch) {
      return `T_${translationMatch[1].toUpperCase()}`;
    }
    
    return 'PROP_CONTENT';
  }

  private extractTranslationKey(expression: string): string | undefined {
    // Extract translation keys from t('key') or translate('key') patterns
    const translationMatch = expression.match(/(?:t|translate)\(["']([^"']+)["']\)/);
    return translationMatch ? translationMatch[1] : undefined;
  }

  /**
   * Enhanced semantic selector recommendation algorithm
   */
  private generateRecommendedSelector(element: SemanticElement): string {
    // Priority 1: Text content (Always ✅) - including prop-based content
    if (element.semanticSelectors.textContent && this.isInteractiveElement(element.tagName)) {
      // Show what we extracted, even if it's prop-based
      if (element.hasPropsContent && element.semanticSelectors.textContent.startsWith('PROP_')) {
        return `${element.tagName}={${element.propPatterns?.[0] || 'props.text'}}`;
      }
      return `${element.tagName}=${element.semanticSelectors.textContent}`;
    }
    
    // Priority 2: ARIA attributes (Always ✅)  
    if (element.semanticSelectors.ariaLabel) {
      return `aria/${element.semanticSelectors.ariaLabel}`;
    }
    
    // Priority 3: Semantic HTML attributes (Always ✅)
    if (element.semanticSelectors.type && this.isInputElement(element.tagName)) {
      return `${element.tagName}[type="${element.semanticSelectors.type}"]`;
    }
    
    // Priority 4: Semantic attributes (Sparingly ⚠️)
    if (element.semanticSelectors.name) {
      return `${element.tagName}[name="${element.semanticSelectors.name}"]`;
    }
    
    if (element.semanticSelectors.placeholder) {
      return `${element.tagName}[placeholder="${element.semanticSelectors.placeholder}"]`;
    }
    
    // Priority 5: Test ID only for non-semantic elements (Good ✅)
    if (this.isNonSemanticElement(element.tagName)) {
      const testId = this.generateTestId(element);
      return `[data-testid="${testId}"]`;
    }
    
    // Flag as needing improvement
    return `⚠️ NEEDS_SEMANTIC_SELECTOR: ${element.tagName}`;
  }

  private isInteractiveElement(tagName: string): boolean {
    const interactiveElements = ['button', 'a', 'input', 'select', 'textarea'];
    return interactiveElements.includes(tagName.toLowerCase());
  }

  private isInputElement(tagName: string): boolean {
    return tagName.toLowerCase() === 'input';
  }

  private isNonSemanticElement(tagName: string): boolean {
    const nonSemanticElements = ['div', 'span', 'section', 'article'];
    return nonSemanticElements.includes(tagName.toLowerCase());
  }

  private generateTestId(element: SemanticElement): string {
    // Generate meaningful test IDs for non-semantic elements
    const baseId = element.tagName.toLowerCase();
    if (element.semanticSelectors.textContent) {
      return `${baseId}-${element.semanticSelectors.textContent.toLowerCase().replace(/\s+/g, '-')}`;
    }
    return `${baseId}-element`;
  }

  /**
   * Determines the automation priority category for an element
   */
  private getAutomationPriority(element: SemanticElement): 'high' | 'medium' | 'low' | 'none' {
    const { tagName, attributes = {} } = element;
    
    // HIGH PRIORITY: Primary interaction elements
    if (['button', 'select', 'textarea', 'a'].includes(tagName)) {
      return 'high';
    }
    
    // HIGH PRIORITY: Input elements with type-specific handling
    if (tagName === 'input') {
      const inputType = attributes['type'] || 'text';
      const highPriorityInputs = [
        'text', 'email', 'password', 'search', 'tel', 'url', 
        'number', 'button', 'submit', 'reset', 'checkbox', 'radio'
      ];
      
      if (highPriorityInputs.includes(inputType)) {
        return 'high';
      }
      
      // Medium priority input types
      const mediumPriorityInputs = [
        'date', 'datetime-local', 'month', 'time', 'week',
        'color', 'file', 'range'
      ];
      
      if (mediumPriorityInputs.includes(inputType)) {
        return 'medium';
      }
      
      // Low priority or hidden inputs
      const lowPriorityInputs = ['hidden', 'image'];
      if (lowPriorityInputs.includes(inputType)) {
        return inputType === 'hidden' ? 'none' : 'low';
      }
      
      // Default for unknown input types
      return 'medium';
    }
    
    // HIGH PRIORITY: Form containers
    if (tagName === 'form') {
      return 'high';
    }
    
    // HIGH PRIORITY: Elements with explicit test attributes
    if (attributes['data-testid'] || attributes['data-cy'] || attributes['data-test']) {
      return 'high';
    }
    
    // HIGH PRIORITY: Interactive ARIA roles
    const highPriorityRoles = ['button', 'link', 'textbox', 'combobox', 'checkbox', 'radio'];
    if (attributes['role'] && highPriorityRoles.includes(attributes['role'])) {
      return 'high';
    }
    
    // MEDIUM PRIORITY: Navigation and context elements
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
      return 'medium';
    }
    
    // MEDIUM PRIORITY: Table elements for data verification
    if (['table', 'thead', 'tbody', 'tr', 'th', 'td'].includes(tagName)) {
      return 'medium';
    }
    
    // MEDIUM PRIORITY: List elements with interactivity
    if (['ul', 'ol', 'li'].includes(tagName)) {
      if (attributes['onClick'] || attributes['role'] === 'menuitem' || attributes['role'] === 'tab') {
        return 'medium';
      }
    }
    
    // MEDIUM PRIORITY: Interactive media
    if (['video', 'audio'].includes(tagName) && attributes['controls'] !== undefined) {
      return 'medium';
    }
    
    // MEDIUM PRIORITY: Advanced ARIA roles
    const mediumPriorityRoles = ['menuitem', 'tab', 'slider', 'spinbutton', 'switch', 
                                'listbox', 'option', 'tree', 'treeitem', 'grid', 'gridcell'];
    if (attributes['role'] && mediumPriorityRoles.includes(attributes['role'])) {
      return 'medium';
    }
    
    // LOW PRIORITY: Elements with interaction handlers but not semantic
    if (attributes['onClick'] || attributes['onSubmit'] || attributes['onChange'] || attributes['onSelect']) {
      return 'low';
    }
    
    // LOW PRIORITY: Focusable elements
    if (attributes['tabIndex'] !== undefined) {
      return 'low';
    }
    
    return 'none';
  }

  /**
   * Detects automation-friendly attributes and their quality
   */
  private analyzeAutomationAttributes(element: SemanticElement): {
    testAttributes: string[];
    accessibilityAttributes: string[];
    behaviorAttributes: string[];
    identifierScore: number;
  } {
    const { attributes = {} } = element;
    const testAttributes: string[] = [];
    const accessibilityAttributes: string[] = [];
    const behaviorAttributes: string[] = [];
    let identifierScore = 0;
    
    // Test-specific attributes (highest value)
    const testAttrs = ['data-testid', 'data-cy', 'data-test', 'data-qa', 'test-id', 'testid'];
    testAttrs.forEach(attr => {
      if (attributes[attr]) {
        testAttributes.push(attr);
        identifierScore += 10; // Highest score for explicit test attributes
      }
    });
    
    // Accessibility attributes (high value for automation)
    const a11yAttrs = {
      'aria-label': 8,
      'aria-labelledby': 6,
      'aria-describedby': 4,
      'role': 6,
      'title': 4,
      'alt': 4
    };
    
    Object.entries(a11yAttrs).forEach(([attr, score]) => {
      if (attributes[attr]) {
        accessibilityAttributes.push(attr);
        identifierScore += score;
      }
    });
    
    // Behavior and interaction attributes
    const behaviorAttrs = [
      'onClick', 'onSubmit', 'onChange', 'onSelect', 'onFocus', 'onBlur',
      'onKeyDown', 'onKeyUp', 'onMouseEnter', 'onMouseLeave'
    ];
    
    behaviorAttrs.forEach(attr => {
      if (attributes[attr]) {
        behaviorAttributes.push(attr);
        identifierScore += 2; // Lower score but still relevant
      }
    });
    
    // Standard HTML attributes that aid automation
    const standardAttrs = {
      'id': 7,
      'name': 6,
      'class': 2,
      'placeholder': 3,
      'value': 2,
      'type': 3
    };
    
    Object.entries(standardAttrs).forEach(([attr, score]) => {
      if (attributes[attr]) {
        identifierScore += score;
      }
    });
    
    return {
      testAttributes,
      accessibilityAttributes,
      behaviorAttributes,
      identifierScore
    };
  }

  /**
   * Determines if an HTML element is relevant for test automation
   * Only captures interactive elements that users typically automate
   */
  private isAutomationRelevantElement(element: SemanticElement): boolean {
    const priority = this.getAutomationPriority(element);
    return priority !== 'none';
  }

  /**
   * Analyze React component and extract semantic elements
   */
  private analyzeReactComponent(sourceFile: ts.SourceFile, componentName: string, filePath: string = ''): ComponentAnalysis {
    const elements: SemanticElement[] = [];
    const childComponents: string[] = [];
    const accessibilityIssues: string[] = [];

    const visitNode = (tsNode: ts.Node): void => {
      if (ts.isJsxElement(tsNode) || ts.isJsxSelfClosingElement(tsNode)) {
        const element = this.extractSemanticElementFromJsx(tsNode);
        if (element && this.isAutomationRelevantElement(element)) {
          elements.push(element);
          
          // Check for accessibility issues
          if (this.isInteractiveElement(element.tagName) && !element.semanticSelectors.ariaLabel && !element.semanticSelectors.textContent) {
            accessibilityIssues.push(`${element.tagName} element missing accessible label`);
          }
        }
      }
      
      // Extract child component usage
      if (ts.isJsxElement(tsNode) || ts.isJsxSelfClosingElement(tsNode)) {
        const tagName = this.getJsxTagName(tsNode);
        if (tagName && /^[A-Z]/.test(tagName)) { // Component names start with capital
          childComponents.push(tagName);
        }
      }
      
      ts.forEachChild(tsNode, visitNode);
    };

    visitNode(sourceFile);

    // Detect routes for this component
    const routes = this.detectComponentRoutes(sourceFile, componentName, filePath);

    return {
      componentName,
      framework: 'react',
      elements,
      childComponents: [...new Set(childComponents)], // Remove duplicates
      routes,
      accessibility: {
        issues: accessibilityIssues,
        recommendations: this.generateAccessibilityRecommendations(elements)
      }
    };
  }

  /**
   * Detect routes associated with a React component
   */
  private detectComponentRoutes(sourceFile: ts.SourceFile, componentName: string, filePath: string): RouteInfo[] {
    const routes: RouteInfo[] = [];
    
    // 1. Look for React Router Route definitions
    const visitNode = (node: ts.Node): void => {
      if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
        const tagName = this.getJsxTagName(node);
        if (tagName === 'Route') {
          const pathAttr = this.getJsxAttributeValue(node, 'path');
          if (pathAttr) {
            routes.push({
              path: pathAttr,
              method: 'exact',
              source: 'router',
              confidence: 10
            });
          }
        }
      }
      ts.forEachChild(node, visitNode);
    };
    visitNode(sourceFile);
    
    // 2. Look for string literals that look like routes
    const sourceText = sourceFile.text;
    const routePatterns = [
      /['"`](\/[a-zA-Z0-9\-_\/\:]+)['"`]/g,  // '/path/to/route'
      /path\s*[:=]\s*['"`](\/[^'"`]+)['"`]/g, // path: '/route'
    ];
    
    routePatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(sourceText)) !== null) {
        const potentialRoute = match[1];
        if (this.looksLikeRoute(potentialRoute)) {
          routes.push({
            path: potentialRoute,
            method: 'pattern',
            source: 'router',
            confidence: 7
          });
        }
      }
    });
    
    // 3. Infer from file path
    const inferredRoute = this.inferRouteFromFilePath(filePath, componentName);
    if (inferredRoute) {
      routes.push(inferredRoute);
    }
    
    // Remove duplicates and sort by confidence
    const uniqueRoutes = routes.filter((route, index) => 
      routes.findIndex(r => r.path === route.path) === index
    );
    
    return uniqueRoutes.sort((a, b) => b.confidence - a.confidence);
  }
  
  /**
   * Check if a string looks like a route path
   */
  private looksLikeRoute(str: string): boolean {
    return str.startsWith('/') && 
           str.length > 1 && 
           !str.includes(' ') &&
           /^\/[a-zA-Z0-9\-_\/\:]*$/.test(str);
  }
  
  /**
   * Infer route from file path and component name
   */
  private inferRouteFromFilePath(filePath: string, componentName: string): RouteInfo | null {
    // Handle pages directory structure
    if (filePath.includes('/pages/')) {
      const pathPart = filePath.split('/pages/')[1];
      const route = '/' + pathPart
        .replace(/\.(tsx?|vue)$/, '')
        .replace(/\/index$/, '')
        .replace(/([A-Z])/g, (match, letter, index) => 
          index > 0 ? '-' + letter.toLowerCase() : letter.toLowerCase()
        );
      
      return {
        path: route === '/' ? '/' : route,
        method: 'inferred',
        source: 'directory',
        confidence: 5
      };
    }
    
    // Handle component names that suggest routes
    const lowerName = componentName.toLowerCase();
    if (lowerName.includes('page') || lowerName.includes('view')) {
      const routeName = lowerName
        .replace(/page$|view$/, '')
        .replace(/([A-Z])/g, (match, letter, index) => 
          index > 0 ? '-' + letter.toLowerCase() : letter.toLowerCase()
        );
      
      if (routeName) {
        return {
          path: '/' + routeName,
          method: 'inferred',
          source: 'filename',
          confidence: 3
        };
      }
    }
    
    return null;
  }

  /**
   * Analyze Vue component and extract semantic elements
   */
  private analyzeVueComponent(sourceCode: string, componentName: string, filePath: string = ''): ComponentAnalysis {
    const elements: SemanticElement[] = [];
    const childComponents: string[] = [];
    const accessibilityIssues: string[] = [];

    // Extract template section
    const templateMatch = sourceCode.match(/<template[^>]*>([\s\S]*?)<\/template>/);
    if (templateMatch) {
      const templateContent = templateMatch[1];
      const extractedElements = this.extractSemanticElementsFromVueTemplate(templateContent);
      elements.push(...extractedElements);
      
      // Extract child components from template
      const componentMatches = templateContent.match(/<([A-Z][a-zA-Z0-9]*)/g);
      if (componentMatches) {
        childComponents.push(...componentMatches.map(match => match.substring(1)));
      }
    }

    // Check accessibility for each element
    for (const element of elements) {
      if (this.isInteractiveElement(element.tagName) && !element.semanticSelectors.ariaLabel && !element.semanticSelectors.textContent) {
        accessibilityIssues.push(`${element.tagName} element missing accessible label`);
      }
    }

    // Detect routes for Vue component
    const routes = this.detectVueComponentRoutes(sourceCode, componentName, filePath);

    return {
      componentName,
      framework: 'vue',
      elements,
      childComponents: [...new Set(childComponents)],
      routes,
      accessibility: {
        issues: accessibilityIssues,
        recommendations: this.generateAccessibilityRecommendations(elements)
      }
    };
  }
  
  /**
   * Detect routes associated with a Vue component
   */
  private detectVueComponentRoutes(sourceCode: string, componentName: string, filePath: string): RouteInfo[] {
    const routes: RouteInfo[] = [];
    
    // Look for Vue Router route definitions in template and script
    const routePatterns = [
      /to=['"`](\/[^'"`]+)['"`]/g,  // router-link to="/path"
      /path\s*:\s*['"`](\/[^'"`]+)['"`]/g, // path: '/route'
      /['"`](\/[a-zA-Z0-9\-_\/\:]+)['"`]/g,  // any route-like string
    ];
    
    routePatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(sourceCode)) !== null) {
        const potentialRoute = match[1];
        if (this.looksLikeRoute(potentialRoute)) {
          routes.push({
            path: potentialRoute,
            method: 'pattern',
            source: 'router',
            confidence: 7
          });
        }
      }
    });
    
    // Infer from file path
    const inferredRoute = this.inferRouteFromFilePath(filePath, componentName);
    if (inferredRoute) {
      routes.push(inferredRoute);
    }
    
    // Remove duplicates and sort by confidence
    const uniqueRoutes = routes.filter((route, index) => 
      routes.findIndex(r => r.path === route.path) === index
    );
    
    return uniqueRoutes.sort((a, b) => b.confidence - a.confidence);
  }
  
  /**
   * Get JSX attribute value
   */
  private getJsxAttributeValue(node: ts.JsxElement | ts.JsxSelfClosingElement, attributeName: string): string | null {
    const attributesArray = ts.isJsxElement(node) 
      ? node.openingElement.attributes.properties 
      : node.attributes.properties;
    
    for (const attr of attributesArray) {
      if (ts.isJsxAttribute(attr) && ts.isIdentifier(attr.name) && attr.name.text === attributeName) {
        if (attr.initializer && ts.isStringLiteral(attr.initializer)) {
          return attr.initializer.text;
        }
      }
    }
    return null;
  }

  private extractSemanticElementFromJsx(jsxNode: ts.JsxElement | ts.JsxSelfClosingElement): SemanticElement | null {
    const tagName = this.getJsxTagName(jsxNode);
    if (!tagName || /^[A-Z]/.test(tagName)) return null; // Skip components, only HTML elements

    const attributes = this.getJsxAttributes(jsxNode);
    const textContent = this.getJsxTextContent(jsxNode);
    const propBasedContent = this.extractPropBasedContent(jsxNode);
    
    const semanticSelectors: {
      textContent?: string;
      ariaLabel?: string;
      ariaRole?: string;
      placeholder?: string;
      type?: string;
      name?: string;
      title?: string;
    } = {};
    
    // Prioritize static text, then prop-based content
    if (textContent) {
      semanticSelectors.textContent = textContent;
    } else if (propBasedContent.hasTextProps) {
      semanticSelectors.textContent = propBasedContent.suggestedText;
    }
    
    if (attributes['aria-label']) semanticSelectors.ariaLabel = attributes['aria-label'];
    if (attributes['role']) semanticSelectors.ariaRole = attributes['role'];
    if (attributes['placeholder']) semanticSelectors.placeholder = attributes['placeholder'];
    if (attributes['type']) semanticSelectors.type = attributes['type'];
    if (attributes['name']) semanticSelectors.name = attributes['name'];
    if (attributes['title']) semanticSelectors.title = attributes['title'];

    const element: SemanticElement = {
      tagName,
      attributes,
      semanticSelectors,
      recommendedSelector: '',
      selectorPriority: 'never',
      requiresTestId: false,
      accessibilityIssues: [],
      translationKey: propBasedContent.translationKey || undefined,
      propPatterns: propBasedContent.propExpressions,
      hasPropsContent: propBasedContent.hasTextProps
    };

    // Generate automation analysis
    element.automationPriority = this.getAutomationPriority(element);
    element.automationAnalysis = this.analyzeAutomationAttributes(element);
    
    // Generate recommended selector and priority  
    element.recommendedSelector = this.generateRecommendedSelector(element);
    element.selectorPriority = this.getSelectorPriority(element);
    element.requiresTestId = element.selectorPriority === 'good';

    return element;
  }

  private extractSemanticElementsFromVueTemplate(templateContent: string): SemanticElement[] {
    const elements: SemanticElement[] = [];
    
    // Simple regex-based extraction for Vue templates
    const elementRegex = /<(\w+)([^>]*?)(?:\/>|>([\s\S]*?)<\/\1>)/g;
    let match;
    
    while ((match = elementRegex.exec(templateContent)) !== null) {
      const tagName = match[1];
      const attributesStr = match[2];
      const textContent = match[3];
      
      if (/^[A-Z]/.test(tagName)) continue; // Skip Vue components
      
      const attributes = this.parseVueAttributes(attributesStr);
      const cleanTextContent = textContent ? textContent.replace(/{{.*?}}/g, '').trim() : null;
      
      const semanticSelectors: {
        textContent?: string;
        ariaLabel?: string;
        ariaRole?: string;
        placeholder?: string;
        type?: string;
        name?: string;
        title?: string;
      } = {};
      
      if (cleanTextContent) semanticSelectors.textContent = cleanTextContent;
      if (attributes['aria-label']) semanticSelectors.ariaLabel = attributes['aria-label'];
      if (attributes['role']) semanticSelectors.ariaRole = attributes['role'];
      if (attributes['placeholder']) semanticSelectors.placeholder = attributes['placeholder'];
      if (attributes['type']) semanticSelectors.type = attributes['type'];
      if (attributes['name']) semanticSelectors.name = attributes['name'];
      if (attributes['title']) semanticSelectors.title = attributes['title'];

      const element: SemanticElement = {
        tagName,
        semanticSelectors,
        recommendedSelector: '',
        selectorPriority: 'never',
        requiresTestId: false,
        accessibilityIssues: []
      };

      element.recommendedSelector = this.generateRecommendedSelector(element);
      element.selectorPriority = this.getSelectorPriority(element);
      element.requiresTestId = element.selectorPriority === 'good';
      
      elements.push(element);
    }
    
    return elements;
  }

  private getSelectorPriority(element: SemanticElement): 'always' | 'sparingly' | 'good' | 'never' {
    if (element.semanticSelectors.textContent && this.isInteractiveElement(element.tagName)) return 'always';
    if (element.semanticSelectors.ariaLabel) return 'always';
    if (element.semanticSelectors.type && this.isInputElement(element.tagName)) return 'always';
    if (element.semanticSelectors.name || element.semanticSelectors.placeholder) return 'sparingly';
    if (this.isNonSemanticElement(element.tagName)) return 'good';
    return 'never';
  }

  private generateAccessibilityRecommendations(elements: SemanticElement[]): string[] {
    const recommendations: string[] = [];
    
    for (const element of elements) {
      if (this.isInteractiveElement(element.tagName) && !element.semanticSelectors.ariaLabel && !element.semanticSelectors.textContent) {
        recommendations.push(`Add aria-label to ${element.tagName} element for better accessibility`);
      }
      if (element.tagName === 'input' && !element.semanticSelectors.ariaLabel && !element.semanticSelectors.placeholder) {
        recommendations.push(`Add placeholder or aria-label to input element`);
      }
    }
    
    return recommendations;
  }

  // JSX/TSX helper methods
  private getJsxTagName(jsxNode: ts.JsxElement | ts.JsxSelfClosingElement): string | null {
    if (ts.isJsxElement(jsxNode)) {
      if (ts.isIdentifier(jsxNode.openingElement.tagName)) {
        return jsxNode.openingElement.tagName.text;
      }
    } else if (ts.isJsxSelfClosingElement(jsxNode)) {
      if (ts.isIdentifier(jsxNode.tagName)) {
        return jsxNode.tagName.text;
      }
    }
    return null;
  }

  private getJsxAttributes(jsxNode: ts.JsxElement | ts.JsxSelfClosingElement): Record<string, string> {
    const attributes: Record<string, string> = {};
    const jsxAttributes = ts.isJsxElement(jsxNode) ? jsxNode.openingElement.attributes : jsxNode.attributes;
    
    jsxAttributes.properties.forEach(prop => {
      if (ts.isJsxAttribute(prop) && ts.isIdentifier(prop.name)) {
        const name = prop.name.text;
        const value = prop.initializer ? this.getJsxExpressionValue(prop.initializer) : '';
        attributes[name] = value;
      }
    });
    
    return attributes;
  }

  private getJsxExpressionValue(initializer: ts.Expression): string {
    if (ts.isStringLiteral(initializer)) {
      return initializer.text;
    }
    if (ts.isJsxExpression(initializer) && initializer.expression && ts.isStringLiteral(initializer.expression)) {
      return initializer.expression.text;
    }
    return '';
  }

  private getJsxTextContent(jsxNode: ts.JsxElement | ts.JsxSelfClosingElement): string | null {
    if (ts.isJsxElement(jsxNode)) {
      for (const child of jsxNode.children) {
        if (ts.isJsxText(child)) {
          return child.text.trim();
        }
      }
    }
    return null;
  }

  // Vue template helper methods
  private parseVueAttributes(attributesStr: string): Record<string, string> {
    const attributes: Record<string, string> = {};
    const attrRegex = /(\w+(?:-\w+)*)=["']([^"']*?)["']/g;
    let match;
    
    while ((match = attrRegex.exec(attributesStr)) !== null) {
      attributes[match[1]] = match[2];
    }
    
    return attributes;
  }

  /**
   * Helper methods for parsing and analysis
   */
  private async findFiles(patterns: string[]): Promise<string[]> {
    const files: string[] = [];
    for (const pattern of patterns) {
      const matches = await glob(pattern, { 
        cwd: this.scanPaths.appCodePath,
        ignore: ['**/node_modules/**', '**/dist/**', '**/*.d.ts']
      });
      files.push(...matches.map(f => path.resolve(this.scanPaths.appCodePath, f)));
    }
    return [...new Set(files)]; // Remove duplicates
  }

  private generateNodeId(filePath: string): string {
    // Use the appropriate base path depending on which codebase the file is in
    const basePath = filePath.startsWith(this.scanPaths.testCodePath!) 
      ? this.scanPaths.testCodePath! 
      : this.scanPaths.appCodePath;
    return path.relative(basePath, filePath).replace(/[/\\]/g, '_').replace(/\.[^.]*$/, '');
  }

  private getNodeType(filePath: string): RegistryNode['type'] {
    const ext = path.extname(filePath);
    const basename = path.basename(filePath);
    
    if (basename.includes('.steps.')) return 'StepDefinition';
    if (ext === '.feature') return 'FeatureFile';
    if (ext === '.json' && (basename.includes('test_data') || basename.includes('test-data'))) return 'TafSelector';
    if (ext === '.tsx' || ext === '.jsx') return 'ReactComponent';
    if (ext === '.vue') return 'VueComponent';
    if (ext === '.ts' && (basename.includes('Page') || basename.includes('Module'))) return 'PageObject';
    if (ext === '.json') return 'TafSelector'; // fallback for other JSON files
    
    return 'PageObject'; // default
  }

  private extractSelectorFromGetter(tsNode: ts.GetAccessorDeclaration): string | null {
    // Extract selector from return statement like: return this.element('[data-testid=...]');
    if (tsNode.body?.statements && tsNode.body.statements.length > 0) {
      const returnStatement = tsNode.body.statements[0];
      if (ts.isReturnStatement(returnStatement) && returnStatement.expression) {
        // This is a simplified extraction - you'd want more robust parsing
        const text = returnStatement.expression.getText();
        const match = text.match(/['"`]([^'"`]+)['"`]/);
        return match ? match[1] : null;
      }
    }
    return null;
  }

  private inferElementType(selector: string): string {
    if (!selector) return 'unknown';
    if (selector.includes('button') || selector.includes('btn')) return 'button';
    if (selector.includes('input')) return 'input';
    if (selector.includes('select')) return 'select';
    if (selector.includes('form')) return 'form';
    return 'element';
  }

  private extractBaseClass(sourceFile: ts.SourceFile): string | null {
    // Extract base class from extends clause
    let baseClass = null;
    
    const visitNode = (tsNode: ts.Node): void => {
      if (ts.isClassDeclaration(tsNode) && tsNode.heritageClauses) {
        for (const clause of tsNode.heritageClauses) {
          if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
            const type = clause.types[0];
            if (type && ts.isIdentifier(type.expression)) {
              baseClass = type.expression.text;
            }
          }
        }
      }
      ts.forEachChild(tsNode, visitNode);
    };

    visitNode(sourceFile);
    return baseClass;
  }

  private extractStepDefinitions(sourceCode: string): any[] {
    // Extract step definitions from .steps.ts files
    const steps: any[] = [];
    const stepRegex = /(Given|When|Then|And)\s*\(\s*['"`]([^'"`]+)['"`]/g;
    
    let match;
    while ((match = stepRegex.exec(sourceCode)) !== null) {
      steps.push({
        type: match[1],
        pattern: match[2],
        line: sourceCode.substring(0, match.index).split('\n').length
      });
    }
    
    return steps;
  }

  private extractGherkinScenarios(content: string): any[] {
    // Basic Gherkin parsing - you might want to use a proper Gherkin parser
    const scenarios: any[] = [];
    const lines = content.split('\n');
    
    let currentScenario: any = null;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('Scenario:')) {
        if (currentScenario) scenarios.push(currentScenario);
        currentScenario = {
          name: trimmed.replace('Scenario:', '').trim(),
          steps: []
        };
      } else if (currentScenario && /^\s*(Given|When|Then|And)\s/.test(trimmed)) {
        currentScenario.steps.push(trimmed);
      }
    }
    
    if (currentScenario) scenarios.push(currentScenario);
    return scenarios;
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    // Simple Levenshtein distance-based similarity
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + substitutionCost
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  private stepReferencesPage(step: any, pageNode: RegistryNode): boolean {
    // Check if step implementation references the page object
    const pageClassName = pageNode.metadata['className'];
    return pageClassName && step.pattern && step.pattern.toLowerCase().includes(pageClassName.toLowerCase());
  }

  private findMatchingStepDefinition(step: string, stepNodes: RegistryNode[]): RegistryNode | null {
    // Find step definition that matches the Gherkin step
    for (const stepNode of stepNodes) {
      for (const stepDef of stepNode.metadata['steps'] || []) {
        if (this.stepMatches(step, stepDef.pattern)) {
          return stepNode;
        }
      }
    }
    return null;
  }

  private stepMatches(gherkinStep: string, stepPattern: string): boolean {
    // Simple pattern matching - you'd want more sophisticated matching
    const normalizedStep = gherkinStep.replace(/^(Given|When|Then|And)\s+/, '').trim();
    const normalizedPattern = stepPattern.replace(/\[.*?\]/g, '.*'); // Replace parameters with wildcards
    
    try {
      const regex = new RegExp(normalizedPattern, 'i');
      return regex.test(normalizedStep);
    } catch {
      return false;
    }
  }

  private getTotalRelationshipCount(): number {
    return Array.from(this.nodes.values()).reduce((sum, node) => sum + node.relationships.length, 0);
  }

  private generateSummary() {
    const summary = {
      pageObjects: 0,
      tafSelectors: 0,
      testScenarios: 0,
      stepDefinitions: 0,
      featureFiles: 0,
      pageElements: 0,
      reactComponents: 0,
      vueComponents: 0,
      semanticElements: 0,
      mappedSelectors: 0,
      unmappedSelectors: 0
    };

    for (const node of this.nodes.values()) {
      switch (node.type) {
        case 'PageObject': summary.pageObjects++; break;
        case 'ReactComponent': summary.reactComponents++; break;
        case 'VueComponent': summary.vueComponents++; break;
        case 'SemanticElement': summary.semanticElements++; break;
        case 'TafSelector': 
          summary.tafSelectors++;
          if (node.relationships.some(r => r.type === 'MAPS_TO')) {
            summary.mappedSelectors++;
          } else {
            summary.unmappedSelectors++;
          }
          break;
        case 'TestScenario': summary.testScenarios++; break;
        case 'StepDefinition': summary.stepDefinitions++; break;
        case 'FeatureFile': summary.featureFiles++; break;
        case 'PageElement': summary.pageElements++; break;
      }
    }

    return summary;
  }

  private async generateMappingReport(outputDir: string): Promise<void> {
    const mappedSelectors: any[] = [];
    const unmappedSelectors: any[] = [];

    for (const node of this.nodes.values()) {
      if (node.type === 'TafSelector') {
        const mapping = node.relationships.find(r => r.type === 'MAPS_TO');
        if (mapping) {
          const targetNode = this.nodes.get(mapping.targetId);
          mappedSelectors.push({
            tafSelector: node.name,
            pageElement: targetNode?.name,
            confidence: mapping.confidence,
            matchType: mapping.metadata?.['matchType']
          });
        } else {
          unmappedSelectors.push({
            tafSelector: node.name,
            selector: node.metadata['selector'],
            sourceFile: node.metadata['sourceFile']
          });
        }
      }
    }

    const report = {
      summary: {
        totalSelectors: mappedSelectors.length + unmappedSelectors.length,
        mappedCount: mappedSelectors.length,
        unmappedCount: unmappedSelectors.length,
        mappingRate: `${((mappedSelectors.length / (mappedSelectors.length + unmappedSelectors.length)) * 100).toFixed(1)}%`
      },
      mappedSelectors,
      unmappedSelectors
    };

    await fs.promises.writeFile(
      path.join(outputDir, 'mapping-report.json'),
      JSON.stringify(report, null, 2)
    );
  }

  private async generateMissingMappingsReport(outputDir: string): Promise<void> {
    const missingMappings: any[] = [];

    // Find TAF selectors that don't have corresponding page elements
    for (const node of this.nodes.values()) {
      if (node.type === 'TafSelector') {
        const hasMapping = node.relationships.some(r => r.type === 'MAPS_TO');
        if (!hasMapping) {
          missingMappings.push({
            selector: node.name,
            selectorValue: node.metadata['selector'],
            sourceFile: node.metadata['sourceFile'],
            recommendations: this.generateRecommendations(node)
          });
        }
      }
    }

    await fs.promises.writeFile(
      path.join(outputDir, 'missing-mappings.json'),
      JSON.stringify({ missingMappings }, null, 2)
    );
  }

  private generateRecommendations(tafNode: RegistryNode): string[] {
    const recommendations: string[] = [];
    
    recommendations.push(`Create page element '${tafNode.name}' in appropriate page object`);
    
    if (tafNode.metadata['selector']) {
      recommendations.push(`Use selector: ${tafNode.metadata['selector']}`);
    }
    
    // Find similar named elements
    const similarElements = Array.from(this.nodes.values())
      .filter(n => n.type === 'PageElement')
      .filter(n => this.calculateStringSimilarity(tafNode.name, n.name) > 0.6)
      .slice(0, 3);
      
    if (similarElements.length > 0) {
      recommendations.push(`Similar elements found: ${similarElements.map(e => e.name).join(', ')}`);
    }
    
    return recommendations;
  }

  private async generateVisualizationData(outputDir: string): Promise<void> {
    // Generate data for D3.js or other visualization tools
    const nodes = Array.from(this.nodes.values()).map(node => ({
      id: node.id,
      name: node.name,
      type: node.type,
      group: this.getNodeGroup(node.type)
    }));

    const links: any[] = [];
    for (const node of this.nodes.values()) {
      for (const rel of node.relationships) {
        links.push({
          source: node.id,
          target: rel.targetId,
          type: rel.type,
          confidence: rel.confidence
        });
      }
    }

    const vizData = { nodes, links };
    
    await fs.promises.writeFile(
      path.join(outputDir, 'visualization-data.json'),
      JSON.stringify(vizData, null, 2)
    );
  }

  private getNodeGroup(type: string): number {
    const groupMap = {
      'PageObject': 1,
      'PageElement': 2,
      'TafSelector': 3,
      'TestScenario': 4,
      'StepDefinition': 5,
      'FeatureFile': 6,
      'ReactComponent': 7,
      'VueComponent': 8,
      'SemanticElement': 9
    };
    return groupMap[type as keyof typeof groupMap] || 0;
  }

  private async generateSemanticAnalysisReport(outputDir: string): Promise<void> {
    const components = Array.from(this.nodes.values()).filter(n => n.type === 'ReactComponent' || n.type === 'VueComponent');
    const semanticElements = Array.from(this.nodes.values()).filter(n => n.type === 'SemanticElement');
    
    const recommendations: any[] = [];
    const accessibilityIssues: any[] = [];
    
    for (const component of components) {
      const componentElements = semanticElements.filter(e => e.metadata['parentComponent'] === component.name);
      
      for (const element of componentElements) {
        const elementData = element.metadata as SemanticElement;
        
        const isPropBased = elementData.recommendedSelector.includes('${');
        const hasTranslationKey = elementData.translationKey !== undefined;
        
        if (elementData.selectorPriority === 'never' && elementData.tagName !== 'div' && elementData.tagName !== 'span') {
          recommendations.push({
            component: component.name,
            element: elementData.tagName,
            currentUsage: 'No semantic selector available',
            recommendedSelector: elementData.recommendedSelector,
            priority: elementData.selectorPriority,
            improvement: 'Add semantic attributes for better testability',
            isPropBased,
            hasTranslation: hasTranslationKey,
            translationKey: elementData.translationKey
          });
        } else if (isPropBased && elementData.selectorPriority === 'always') {
          // Show prop-based improvements even for good elements
          recommendations.push({
            component: component.name,
            element: elementData.tagName,
            currentUsage: 'Prop-based content detected',
            recommendedSelector: elementData.recommendedSelector,
            priority: 'always',
            improvement: 'Use dynamic selector with prop interpolation',
            isPropBased: true,
            hasTranslation: hasTranslationKey,
            translationKey: elementData.translationKey
          });
        }
        
        if (elementData.accessibilityIssues && elementData.accessibilityIssues.length > 0) {
          accessibilityIssues.push({
            component: component.name,
            element: elementData.tagName,
            issues: elementData.accessibilityIssues,
            suggestions: component.metadata['accessibility']?.recommendations || []
          });
        }
      }
    }
    
    const priorityStats = {
      always: semanticElements.filter(e => (e.metadata as SemanticElement).selectorPriority === 'always').length,
      sparingly: semanticElements.filter(e => (e.metadata as SemanticElement).selectorPriority === 'sparingly').length,
      good: semanticElements.filter(e => (e.metadata as SemanticElement).selectorPriority === 'good').length,
      never: semanticElements.filter(e => (e.metadata as SemanticElement).selectorPriority === 'never').length
    };
    
    const report = {
      summary: {
        totalComponents: components.length,
        totalElements: semanticElements.length,
        reactComponents: components.filter(c => c.type === 'ReactComponent').length,
        vueComponents: components.filter(c => c.type === 'VueComponent').length,
        semanticElementsByPriority: priorityStats,
        accessibilityIssuesCount: accessibilityIssues.length
      },
      selectorRecommendations: recommendations,
      accessibilityAnalysis: {
        issues: accessibilityIssues,
        overallScore: this.calculateAccessibilityScore(semanticElements),
        recommendations: this.generateOverallAccessibilityRecommendations(semanticElements)
      },
      bestPractices: {
        semanticFirst: {
          score: (priorityStats.always + priorityStats.sparingly) / semanticElements.length,
          recommendation: 'Prioritize semantic selectors (text content, ARIA labels) over test IDs'
        },
        testability: {
          elementsWithSelectors: priorityStats.always + priorityStats.sparingly + priorityStats.good,
          elementsNeedingImprovement: priorityStats.never,
          recommendation: priorityStats.never > 0 ? 'Add semantic attributes to improve testability' : 'Great semantic coverage!'
        }
      }
    };

    await fs.promises.writeFile(
      path.join(outputDir, 'semantic-analysis.json'),
      JSON.stringify(report, null, 2)
    );
  }

  private calculateAccessibilityScore(elements: RegistryNode[]): number {
    const interactiveElements = elements.filter(e => {
      const elementData = e.metadata as SemanticElement;
      return this.isInteractiveElement(elementData.tagName);
    });
    
    const accessibleElements = interactiveElements.filter(e => {
      const elementData = e.metadata as SemanticElement;
      return elementData.semanticSelectors.ariaLabel || elementData.semanticSelectors.textContent;
    });
    
    return interactiveElements.length > 0 ? accessibleElements.length / interactiveElements.length : 1;
  }

  private generateOverallAccessibilityRecommendations(elements: RegistryNode[]): string[] {
    const recommendations: string[] = [];
    const interactiveElements = elements.filter(e => {
      const elementData = e.metadata as SemanticElement;
      return this.isInteractiveElement(elementData.tagName);
    });
    
    const elementsWithoutLabels = interactiveElements.filter(e => {
      const elementData = e.metadata as SemanticElement;
      return !elementData.semanticSelectors.ariaLabel && !elementData.semanticSelectors.textContent;
    });
    
    if (elementsWithoutLabels.length > 0) {
      recommendations.push(`Add accessible labels to ${elementsWithoutLabels.length} interactive elements`);
    }
    
    const inputElements = elements.filter(e => (e.metadata as SemanticElement).tagName === 'input');
    const inputsWithoutLabels = inputElements.filter(e => {
      const elementData = e.metadata as SemanticElement;
      return !elementData.semanticSelectors.ariaLabel && !elementData.semanticSelectors.placeholder;
    });
    
    if (inputsWithoutLabels.length > 0) {
      recommendations.push(`Add placeholder or aria-label to ${inputsWithoutLabels.length} input elements`);
    }
    
    return recommendations;
  }

  /**
   * Generate automation-focused summary for test engineers
   */
  private async generateAutomationSummary(outputDir: string): Promise<void> {
    const components = Array.from(this.nodes.values()).filter(n => n.type === 'ReactComponent' || n.type === 'VueComponent');
    const semanticElements = Array.from(this.nodes.values()).filter(n => n.type === 'SemanticElement');
    
    // Filter to only automation-relevant elements
    const automationElements = semanticElements.filter(e => {
      const elementData = e.metadata as SemanticElement;
      return elementData.automationPriority && elementData.automationPriority !== 'none';
    });
    
    // Calculate statistics
    const totalInteractiveElements = automationElements.length;
    const highPriorityElements = automationElements.filter(e => 
      (e.metadata as SemanticElement).automationPriority === 'high'
    ).length;
    
    const elementsWithTestIds = automationElements.filter(e => {
      const elementData = e.metadata as SemanticElement;
      return elementData.automationAnalysis?.testAttributes && elementData.automationAnalysis.testAttributes.length > 0;
    }).length;
    
    const automationCoverage = totalInteractiveElements > 0 
      ? Math.round((elementsWithTestIds / totalInteractiveElements) * 100) 
      : 0;
    
    // Analyze by page/component
    const pageAnalysis = components.map(component => {
      const componentElements = automationElements.filter(e => 
        e.metadata['parentComponent'] === component.name
      );
      
      const interactiveCount = componentElements.length;
      const highPriorityCount = componentElements.filter(e => 
        (e.metadata as SemanticElement).automationPriority === 'high'
      ).length;
      const missingTestIds = componentElements.filter(e => {
        const elementData = e.metadata as SemanticElement;
        return !elementData.automationAnalysis?.testAttributes || elementData.automationAnalysis.testAttributes.length === 0;
      }).length;
      
      // Get route information
      const routes = component.metadata['routes'] || [];
      
      return {
        component: component.name,
        routes: routes.map((r: RouteInfo) => r.path),
        filePath: component.filePath,
        interactiveElements: interactiveCount,
        highPriority: highPriorityCount,
        missingTestIds,
        automationReadiness: interactiveCount > 0 
          ? Math.round(((interactiveCount - missingTestIds) / interactiveCount) * 100)
          : 100,
        elements: componentElements.map(e => {
          const elementData = e.metadata as SemanticElement;
          return {
            name: `${elementData.tagName}_${elementData.recommendedSelector.replace(/[^a-zA-Z0-9]/g, '_')}`,
            tagName: elementData.tagName,
            locator: elementData.recommendedSelector,
            priority: elementData.automationPriority,
            hasTestId: elementData.automationAnalysis?.testAttributes && elementData.automationAnalysis.testAttributes.length > 0,
            confidence: elementData.automationAnalysis?.identifierScore || 0
          };
        })
      };
    }).filter(page => page.interactiveElements > 0) // Only include pages with interactive elements
      .sort((a, b) => b.interactiveElements - a.interactiveElements); // Sort by most interactive first
    
    // Generate actionable recommendations
    const recommendations: string[] = [];
    const missingTestIdCount = totalInteractiveElements - elementsWithTestIds;
    if (missingTestIdCount > 0) {
      recommendations.push(`Add data-testid to ${missingTestIdCount} high-priority interactive elements`);
    }
    
    const lowAccessibilityElements = automationElements.filter(e => {
      const elementData = e.metadata as SemanticElement;
      return elementData.accessibilityIssues?.length > 0;
    }).length;
    
    if (lowAccessibilityElements > 0) {
      recommendations.push(`Improve accessibility labels on ${lowAccessibilityElements} elements`);
    }
    
    const summary = {
      summary: {
        totalInteractiveElements,
        highPriorityElements,
        elementsWithTestIds,
        automationCoverage: `${automationCoverage}%`,
        automationReadiness: automationCoverage >= 70 ? 'Good' : automationCoverage >= 50 ? 'Moderate' : 'Needs Improvement'
      },
      pageAnalysis,
      recommendations,
      routeToComponentMapping: this.generateRouteMapping(components),
      generatedAt: new Date().toISOString()
    };

    await fs.promises.writeFile(
      path.join(outputDir, 'automation-summary.json'),
      JSON.stringify(summary, null, 2)
    );
  }
  
  /**
   * Generate route to component mapping for easy lookup
   */
  private generateRouteMapping(components: RegistryNode[]): Record<string, string[]> {
    const routeMapping: Record<string, string[]> = {};
    
    components.forEach(component => {
      const routes = component.metadata['routes'] || [];
      routes.forEach((routeInfo: RouteInfo) => {
        if (!routeMapping[routeInfo.path]) {
          routeMapping[routeInfo.path] = [];
        }
        routeMapping[routeInfo.path].push(component.name);
      });
    });
    
    return routeMapping;
  }

  /**
   * Generate simple HTML dashboard for easy visualization
   */
  private async generateHtmlDashboard(outputDir: string): Promise<void> {
    const components = Array.from(this.nodes.values()).filter(n => n.type === 'ReactComponent' || n.type === 'VueComponent');
    const routeMapping = this.generateRouteMapping(components);
    
    // Get page objects (TAF data)
    const pageObjects = Array.from(this.nodes.values()).filter(n => n.type === 'PageObject');
    
    // Prepare data for the dashboard
    const dashboardData = {
      routes: Object.keys(routeMapping).sort(),
      components: components.map(c => ({
        name: c.name,
        routes: (c.metadata['routes'] || []).map((r: RouteInfo) => r.path),
        filePath: c.filePath,
        framework: c.metadata['framework'] || 'unknown',
        elementCount: c.metadata['elementsCount'] || 0
      })).sort((a, b) => a.name.localeCompare(b.name)),
      pageObjects: pageObjects.map(p => ({
        name: p.name,
        filePath: p.filePath,
        methods: p.metadata['methods'] || [],
        selectors: p.metadata['selectors'] || []
      })).sort((a, b) => a.name.localeCompare(b.name)),
      routeToComponentMapping: routeMapping
    };

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TAF Registry Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            background: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .header h1 {
            color: #2c3e50;
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .header p {
            color: #666;
            font-size: 1.1em;
        }
        
        .dashboard-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
        }
        
        .card {
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .card h2 {
            color: #2c3e50;
            margin-bottom: 20px;
            font-size: 1.5em;
        }
        
        .dropdown {
            width: 100%;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-size: 16px;
            margin-bottom: 20px;
        }
        
        .dropdown:focus {
            border-color: #3498db;
            outline: none;
        }
        
        .results {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-top: 10px;
            min-height: 100px;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 14px;
            white-space: pre-wrap;
        }
        
        .route-info {
            background: #e3f2fd;
            padding: 10px;
            border-radius: 5px;
            margin: 5px 0;
        }
        
        .component-info {
            background: #f3e5f5;
            padding: 10px;
            border-radius: 5px;
            margin: 5px 0;
        }
        
        .page-object-info {
            background: #e8f5e8;
            padding: 10px;
            border-radius: 5px;
            margin: 5px 0;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
        }
        
        .stat-number {
            font-size: 2em;
            font-weight: bold;
            color: #3498db;
        }
        
        .stat-label {
            color: #666;
            margin-top: 5px;
        }
        
        .full-width {
            grid-column: 1 / -1;
        }
        
        .mapping-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        
        .mapping-table th,
        .mapping-table td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        
        .mapping-table th {
            background: #f8f9fa;
            font-weight: bold;
        }
        
        .no-results {
            color: #999;
            font-style: italic;
            text-align: center;
            padding: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 TAF Registry Dashboard</h1>
            <p>Interactive exploration of your Test Automation Framework registry</p>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number" id="totalRoutes">${dashboardData.routes.length}</div>
                <div class="stat-label">Routes Detected</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="totalComponents">${dashboardData.components.length}</div>
                <div class="stat-label">Components</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="totalPageObjects">${dashboardData.pageObjects.length}</div>
                <div class="stat-label">Page Objects</div>
            </div>
        </div>
        
        <div class="dashboard-grid">
            <div class="card">
                <h2>🛣️ Route Lookup</h2>
                <p>Select a route to see which components handle it:</p>
                <select class="dropdown" id="routeSelect" onchange="showRouteInfo()">
                    <option value="">Choose a route...</option>
                    ${dashboardData.routes.map(route => `<option value="${route}">${route}</option>`).join('')}
                </select>
                <div class="results" id="routeResults">
                    <div class="no-results">Select a route to see details</div>
                </div>
            </div>
            
            <div class="card">
                <h2>⚛️ Component Lookup</h2>
                <p>Select a component to see its routes and details:</p>
                <select class="dropdown" id="componentSelect" onchange="showComponentInfo()">
                    <option value="">Choose a component...</option>
                    ${dashboardData.components.map(comp => `<option value="${comp.name}">${comp.name} (${comp.framework})</option>`).join('')}
                </select>
                <div class="results" id="componentResults">
                    <div class="no-results">Select a component to see details</div>
                </div>
            </div>
        </div>
        
        <div class="card full-width">
            <h2>📄 Page Objects</h2>
            <p>Select a page object to see its methods and selectors:</p>
            <select class="dropdown" id="pageObjectSelect" onchange="showPageObjectInfo()">
                <option value="">Choose a page object...</option>
                ${dashboardData.pageObjects.map(po => `<option value="${po.name}">${po.name}</option>`).join('')}
            </select>
            <div class="results" id="pageObjectResults">
                <div class="no-results">Select a page object to see details</div>
            </div>
        </div>
        
        <div class="card full-width">
            <h2>🗺️ Complete Route Mapping</h2>
            <table class="mapping-table">
                <thead>
                    <tr>
                        <th>Route</th>
                        <th>Components</th>
                        <th>Page Objects Available</th>
                    </tr>
                </thead>
                <tbody>
                    ${dashboardData.routes.map(route => `
                        <tr>
                            <td><strong>${route}</strong></td>
                            <td>${(dashboardData.routeToComponentMapping[route] || []).join(', ') || 'None detected'}</td>
                            <td>${dashboardData.pageObjects.length > 0 ? dashboardData.pageObjects.map(po => po.name).join(', ') : 'None found'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    </div>

    <script>
        const data = ${JSON.stringify(dashboardData, null, 2)};
        
        function showRouteInfo() {
            const select = document.getElementById('routeSelect');
            const results = document.getElementById('routeResults');
            const route = select.value;
            
            if (!route) {
                results.innerHTML = '<div class="no-results">Select a route to see details</div>';
                return;
            }
            
            const components = data.routeToComponentMapping[route] || [];
            
            if (components.length === 0) {
                results.innerHTML = '<div class="no-results">No components found for this route</div>';
                return;
            }
            
            let html = \`<div class="route-info">
                <strong>Route:</strong> \${route}
                <br><strong>Components:</strong>
            </div>\`;
            
            components.forEach(compName => {
                const comp = data.components.find(c => c.name === compName);
                if (comp) {
                    html += \`<div class="component-info">
                        <strong>\${comp.name}</strong> (\${comp.framework})
                        <br>📁 \${comp.filePath}
                        <br>🎯 \${comp.elementCount} interactive elements
                    </div>\`;
                }
            });
            
            results.innerHTML = html;
        }
        
        function showComponentInfo() {
            const select = document.getElementById('componentSelect');
            const results = document.getElementById('componentResults');
            const componentName = select.value;
            
            if (!componentName) {
                results.innerHTML = '<div class="no-results">Select a component to see details</div>';
                return;
            }
            
            const comp = data.components.find(c => c.name === componentName);
            if (!comp) {
                results.innerHTML = '<div class="no-results">Component not found</div>';
                return;
            }
            
            let html = \`<div class="component-info">
                <strong>\${comp.name}</strong> (\${comp.framework})
                <br>📁 \${comp.filePath}
                <br>🎯 \${comp.elementCount} interactive elements
                <br><strong>Routes:</strong> \${comp.routes.length > 0 ? comp.routes.join(', ') : 'None detected'}
            </div>\`;
            
            results.innerHTML = html;
        }
        
        function showPageObjectInfo() {
            const select = document.getElementById('pageObjectSelect');
            const results = document.getElementById('pageObjectResults');
            const pageObjectName = select.value;
            
            if (!pageObjectName) {
                results.innerHTML = '<div class="no-results">Select a page object to see details</div>';
                return;
            }
            
            const po = data.pageObjects.find(p => p.name === pageObjectName);
            if (!po) {
                results.innerHTML = '<div class="no-results">Page object not found</div>';
                return;
            }
            
            let html = \`<div class="page-object-info">
                <strong>\${po.name}</strong>
                <br>📁 \${po.filePath}
                <br><strong>Methods:</strong> \${po.methods.length > 0 ? po.methods.join(', ') : 'None detected'}
                <br><strong>Selectors:</strong> \${po.selectors.length > 0 ? po.selectors.join(', ') : 'None detected'}
            </div>\`;
            
            results.innerHTML = html;
        }
        
        // Initialize
        console.log('TAF Registry Dashboard loaded with data:', data);
    </script>
</body>
</html>`;

    await fs.promises.writeFile(
      path.join(outputDir, 'dashboard.html'),
      htmlContent
    );
  }

  /**
   * Generate bidirectional mapping for easy task manager integration
   */
  private async generateBidirectionalMapping(outputDir: string): Promise<void> {
    const components = Array.from(this.nodes.values()).filter(n => n.type === 'ReactComponent' || n.type === 'VueComponent');
    const pageObjects = Array.from(this.nodes.values()).filter(n => n.type === 'PageObject');
    
    // Route → Components mapping
    const routeToComponents: Record<string, Array<{name: string, filePath: string, framework: string}>> = {};
    
    // Component → Routes mapping
    const componentToRoutes: Record<string, Array<{path: string, confidence: number, source: string}>> = {};
    
    // Page Object → Components potential mapping (based on naming similarity)
    const pageObjectToComponents: Record<string, string[]> = {};
    const componentToPageObjects: Record<string, string[]> = {};
    
    // Build route mappings
    components.forEach(component => {
      const routes = component.metadata['routes'] || [];
      componentToRoutes[component.name] = routes;
      
      routes.forEach((routeInfo: RouteInfo) => {
        if (!routeToComponents[routeInfo.path]) {
          routeToComponents[routeInfo.path] = [];
        }
        routeToComponents[routeInfo.path].push({
          name: component.name,
          filePath: component.filePath,
          framework: component.metadata['framework'] || 'unknown'
        });
      });
    });
    
    // Build page object to component mappings based on naming similarity
    pageObjects.forEach(pageObject => {
      const poName = pageObject.name.toLowerCase().replace(/page|object/gi, '');
      const matchingComponents: string[] = [];
      
      components.forEach(component => {
        const compName = component.name.toLowerCase();
        
        // Check for naming similarity
        if (compName.includes(poName) || poName.includes(compName.replace(/page|component/gi, ''))) {
          matchingComponents.push(component.name);
          
          // Reverse mapping
          if (!componentToPageObjects[component.name]) {
            componentToPageObjects[component.name] = [];
          }
          componentToPageObjects[component.name].push(pageObject.name);
        }
      });
      
      if (matchingComponents.length > 0) {
        pageObjectToComponents[pageObject.name] = matchingComponents;
      }
    });
    
    const mappingData = {
      metadata: {
        generatedAt: new Date().toISOString(),
        totalRoutes: Object.keys(routeToComponents).length,
        totalComponents: components.length,
        totalPageObjects: pageObjects.length,
        mappingConfidence: {
          routes: 'High - based on code analysis',
          pageObjects: 'Medium - based on naming similarity'
        }
      },
      routeToComponents,
      componentToRoutes,
      pageObjectToComponents,
      componentToPageObjects,
      
      // Quick lookup functions for task manager
      lookupHelpers: {
        getComponentsByRoute: 'routeToComponents[route]',
        getRoutesByComponent: 'componentToRoutes[component]',
        getPageObjectsByComponent: 'componentToPageObjects[component]',
        getComponentsByPageObject: 'pageObjectToComponents[pageObject]'
      },
      
      // Summary stats for task manager decision making
      coverage: {
        routesWithComponents: Object.keys(routeToComponents).length,
        componentsWithRoutes: Object.keys(componentToRoutes).length,
        pageObjectsWithComponents: Object.keys(pageObjectToComponents).length,
        componentsWithPageObjects: Object.keys(componentToPageObjects).length
      }
    };

    await fs.promises.writeFile(
      path.join(outputDir, 'bidirectional-mapping.json'),
      JSON.stringify(mappingData, null, 2)
    );
  }

  /**
   * Generate enhanced missing mappings report with actionable recommendations
   */
  private async generateEnhancedMissingMappingsReport(outputDir: string): Promise<void> {
    const components = Array.from(this.nodes.values()).filter(n => n.type === 'ReactComponent' || n.type === 'VueComponent');
    const pageObjects = Array.from(this.nodes.values()).filter(n => n.type === 'PageObject');
    const semanticElements = Array.from(this.nodes.values()).filter(n => n.type === 'SemanticElement');
    
    // Find components without routes
    const componentsWithoutRoutes = components.filter(c => {
      const routes = c.metadata['routes'] || [];
      return routes.length === 0;
    });
    
    // Find routes with low confidence
    const lowConfidenceRoutes: Array<{component: string, route: string, confidence: number}> = [];
    components.forEach(component => {
      const routes = component.metadata['routes'] || [];
      routes.forEach((routeInfo: RouteInfo) => {
        if (routeInfo.confidence <= 5) {
          lowConfidenceRoutes.push({
            component: component.name,
            route: routeInfo.path,
            confidence: routeInfo.confidence
          });
        }
      });
    });
    
    // Find components without corresponding page objects
    const componentsWithoutPageObjects = components.filter(component => {
      const compName = component.name.toLowerCase();
      const hasMatchingPageObject = pageObjects.some(po => {
        const poName = po.name.toLowerCase().replace(/page|object/gi, '');
        return compName.includes(poName) || poName.includes(compName.replace(/page|component/gi, ''));
      });
      return !hasMatchingPageObject;
    });
    
    // Find page objects without corresponding components
    const pageObjectsWithoutComponents = pageObjects.filter(pageObject => {
      const poName = pageObject.name.toLowerCase().replace(/page|object/gi, '');
      const hasMatchingComponent = components.some(component => {
        const compName = component.name.toLowerCase();
        return compName.includes(poName) || poName.includes(compName.replace(/page|component/gi, ''));
      });
      return !hasMatchingComponent;
    });
    
    // Find interactive elements without test IDs
    const elementsWithoutTestIds = semanticElements.filter(e => {
      const elementData = e.metadata as SemanticElement;
      return elementData.automationPriority === 'high' && 
             (!elementData.automationAnalysis?.testAttributes || 
              elementData.automationAnalysis.testAttributes.length === 0);
    });
    
    // Generate actionable recommendations
    const recommendations: Array<{
      category: string;
      priority: 'High' | 'Medium' | 'Low';
      issue: string;
      solution: string;
      impact: string;
      items?: any[];
    }> = [];
    
    if (componentsWithoutRoutes.length > 0) {
      recommendations.push({
        category: 'Route Detection',
        priority: 'Medium',
        issue: `${componentsWithoutRoutes.length} components have no detected routes`,
        solution: 'Add route definitions in component files or improve route detection patterns',
        impact: 'Task manager cannot map these components to application pages',
        items: componentsWithoutRoutes.map(c => ({
          component: c.name,
          filePath: c.filePath,
          suggestion: 'Add route prop or path comment in component'
        }))
      });
    }
    
    if (lowConfidenceRoutes.length > 0) {
      recommendations.push({
        category: 'Route Confidence',
        priority: 'Low',
        issue: `${lowConfidenceRoutes.length} routes have low confidence mapping`,
        solution: 'Use explicit route definitions instead of inferred paths',
        impact: 'Potential incorrect route-to-component associations',
        items: lowConfidenceRoutes
      });
    }
    
    if (componentsWithoutPageObjects.length > 0) {
      recommendations.push({
        category: 'Page Object Coverage',
        priority: 'High',
        issue: `${componentsWithoutPageObjects.length} components lack corresponding page objects`,
        solution: 'Create page objects with similar naming or improve naming conventions',
        impact: 'Automation tests cannot easily target these components',
        items: componentsWithoutPageObjects.map(c => ({
          component: c.name,
          filePath: c.filePath,
          suggestedPageObjectName: c.name.replace(/Component$/, 'Page'),
          automationElements: c.metadata['elementsCount'] || 0
        }))
      });
    }
    
    if (pageObjectsWithoutComponents.length > 0) {
      recommendations.push({
        category: 'Unused Page Objects',
        priority: 'Medium',
        issue: `${pageObjectsWithoutComponents.length} page objects have no matching components`,
        solution: 'Review page object naming or remove obsolete page objects',
        impact: 'Maintenance overhead from unused automation code',
        items: pageObjectsWithoutComponents.map(po => ({
          pageObject: po.name,
          filePath: po.filePath,
          suggestion: 'Check if component was renamed or removed'
        }))
      });
    }
    
    if (elementsWithoutTestIds.length > 0) {
      const elementsGroupedByComponent: Record<string, any[]> = {};
      elementsWithoutTestIds.forEach(e => {
        const parentComponent = e.metadata['parentComponent'];
        if (!elementsGroupedByComponent[parentComponent]) {
          elementsGroupedByComponent[parentComponent] = [];
        }
        elementsGroupedByComponent[parentComponent].push({
          element: (e.metadata as SemanticElement).tagName,
          selector: (e.metadata as SemanticElement).recommendedSelector,
          priority: (e.metadata as SemanticElement).automationPriority
        });
      });
      
      recommendations.push({
        category: 'Test Automation',
        priority: 'High',
        issue: `${elementsWithoutTestIds.length} high-priority elements lack test IDs`,
        solution: 'Add data-testid attributes to improve automation reliability',
        impact: 'Fragile automation tests that may break with UI changes',
        items: Object.entries(elementsGroupedByComponent).map(([component, elements]) => ({
          component,
          missingTestIds: elements.length,
          elements
        }))
      });
    }
    
    const report = {
      metadata: {
        generatedAt: new Date().toISOString(),
        totalRecommendations: recommendations.length,
        highPriorityIssues: recommendations.filter(r => r.priority === 'High').length,
        coverageAnalysis: {
          componentRouteMapping: `${components.length - componentsWithoutRoutes.length}/${components.length}`,
          componentPageObjectMapping: `${components.length - componentsWithoutPageObjects.length}/${components.length}`,
          automationReadiness: `${semanticElements.length - elementsWithoutTestIds.length}/${semanticElements.length}`
        }
      },
      summary: {
        criticalGaps: recommendations.filter(r => r.priority === 'High').length,
        totalGaps: recommendations.length,
        overallHealth: recommendations.filter(r => r.priority === 'High').length === 0 ? 'Good' : 
                      recommendations.filter(r => r.priority === 'High').length <= 2 ? 'Fair' : 'Needs Attention'
      },
      recommendations: recommendations.sort((a, b) => {
        const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }),
      actionPlan: [
        'Focus on High priority issues first for maximum impact',
        'Create missing page objects for components with interactive elements',
        'Add data-testid attributes to high-priority automation elements',
        'Review route detection patterns for better component mapping',
        'Establish naming conventions for page objects and components'
      ]
    };

    await fs.promises.writeFile(
      path.join(outputDir, 'enhanced-missing-mappings.json'),
      JSON.stringify(report, null, 2)
    );
  }
}

// CLI interface
async function main() {
  console.log('🤖 TAF Automated Registry Builder');
  console.log('=====================================');
  
  const args = process.argv.slice(2);
  let config: string | ScanPaths;
  
  if (args.length === 0) {
    // No arguments - scan current directory
    config = process.cwd();
    console.log('📁 Single-path mode: scanning current directory');
  } else if (args.length === 1) {
    // Single argument - traditional single path
    config = args[0];
    console.log('📁 Single-path mode: scanning specified directory');
  } else if (args.length === 2) {
    // Two arguments - app code and test code paths
    config = {
      appCodePath: args[0],
      testCodePath: args[1]
    };
    console.log('📁 Multi-path mode: separate app and test codebases');
  } else {
    console.error('❌ Usage:');
    console.error('  Single codebase:  npm run analyze [path]');
    console.error('  Separate codebases: npm run analyze <app-code-path> <test-code-path>');
    console.error('');
    console.error('Examples:');
    console.error('  npm run analyze ./my-app');
    console.error('  npm run analyze ./frontend-app ./e2e-tests');
    process.exit(1);
  }
  
  try {
    const builder = new AutomatedRegistryBuilder(config);
    await builder.buildRegistry();
    
    console.log('\n🎉 Success! Check the registry-output directory for results.');
    
  } catch (error) {
    console.error('\n💥 Build failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { AutomatedRegistryBuilder, ScanPaths };