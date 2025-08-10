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
  accessibility: {
    issues: string[];
    recommendations: string[];
  };
}

class AutomatedRegistryBuilder {
  private nodes: Map<string, RegistryNode> = new Map();
  private projectRoot: string;
  
  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = path.resolve(projectRoot);
  }

  /**
   * Main entry point - builds the complete registry
   */
  async buildRegistry(): Promise<void> {
    console.log('🚀 Starting automated registry build...');
    console.log(`📁 Project root: ${this.projectRoot}`);

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
    
    const patterns = {
      pageObjects: ['**/*Page.ts', '**/*Module.ts', '**/page-objects/**/*.ts'],
      testData: ['**/*test_data*.json', '**/*test-data*.json', '**/data/**/*.json'],
      stepDefinitions: ['**/*.steps.ts', '**/step-definitions/**/*.ts'],
      featureFiles: ['**/*.feature', '**/features/**/*.feature'],
      reactComponents: ['**/*.tsx', '**/*.jsx'],
      vueComponents: ['**/*.vue'],
      testSelectors: ['**/*selectors.d.ts', '**/*selectors.ts', '**/*test-ids.ts'],
      translationFiles: ['**/*i18n*.json', '**/locales/**/*.json', '**/translations/**/*.json']
    };

    for (const [type, globPatterns] of Object.entries(patterns)) {
      const files = await this.findFiles(globPatterns);
      console.log(`  ${type}: ${files.length} files found`);
      
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
    
    console.log(`📊 Total nodes discovered: ${this.nodes.size}`);
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

    const analysis = this.analyzeReactComponent(sourceFile, node.name);
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
      childComponents: analysis.childComponents
    };
  }

  /**
   * Parse Vue SFC components
   */
  private async parseVueComponent(node: RegistryNode): Promise<void> {
    const sourceCode = fs.readFileSync(node.filePath, 'utf8');
    const analysis = this.analyzeVueComponent(sourceCode, node.name);
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
      childComponents: analysis.childComponents
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
    
    const outputDir = path.join(this.projectRoot, 'registry-output');
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
  private analyzeReactComponent(sourceFile: ts.SourceFile, componentName: string): ComponentAnalysis {
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

    return {
      componentName,
      framework: 'react',
      elements,
      childComponents: [...new Set(childComponents)], // Remove duplicates
      accessibility: {
        issues: accessibilityIssues,
        recommendations: this.generateAccessibilityRecommendations(elements)
      }
    };
  }

  /**
   * Analyze Vue component and extract semantic elements
   */
  private analyzeVueComponent(sourceCode: string, componentName: string): ComponentAnalysis {
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

    return {
      componentName,
      framework: 'vue',
      elements,
      childComponents: [...new Set(childComponents)],
      accessibility: {
        issues: accessibilityIssues,
        recommendations: this.generateAccessibilityRecommendations(elements)
      }
    };
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
        const value = prop.initializer ? this.getJsxAttributeValue(prop.initializer) : '';
        attributes[name] = value;
      }
    });
    
    return attributes;
  }

  private getJsxAttributeValue(initializer: ts.Expression): string {
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
        cwd: this.projectRoot,
        ignore: ['**/node_modules/**', '**/dist/**', '**/*.d.ts']
      });
      files.push(...matches.map(f => path.resolve(this.projectRoot, f)));
    }
    return [...new Set(files)]; // Remove duplicates
  }

  private generateNodeId(filePath: string): string {
    return path.relative(this.projectRoot, filePath).replace(/[/\\]/g, '_').replace(/\.[^.]*$/, '');
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
}

// CLI interface
async function main() {
  const projectRoot = process.argv[2] || process.cwd();
  
  console.log('🤖 TAF Automated Registry Builder');
  console.log('=====================================');
  
  try {
    const builder = new AutomatedRegistryBuilder(projectRoot);
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

export { AutomatedRegistryBuilder };