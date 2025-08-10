#!/usr/bin/env ts-node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutomatedRegistryBuilder = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const glob_1 = require("glob");
const ts = __importStar(require("typescript"));
class AutomatedRegistryBuilder {
    nodes = new Map();
    projectRoot;
    constructor(projectRoot = process.cwd()) {
        this.projectRoot = path.resolve(projectRoot);
    }
    /**
     * Main entry point - builds the complete registry
     */
    async buildRegistry() {
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
        }
        catch (error) {
            console.error('❌ Registry build failed:', error);
            throw error;
        }
    }
    /**
     * Phase 1: Discover all relevant files in the codebase
     */
    async discoverFiles() {
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
                const node = {
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
    async parseFiles() {
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
            }
            catch (error) {
                console.warn(`⚠️  Warning: Failed to parse ${node.filePath}:`, error instanceof Error ? error.message : String(error));
            }
        }
        console.log('✅ File parsing completed');
    }
    /**
     * Phase 3: Build relationships between nodes
     */
    async buildRelationships() {
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
    async parsePageObject(node) {
        const sourceCode = fs.readFileSync(node.filePath, 'utf8');
        const sourceFile = ts.createSourceFile(node.filePath, sourceCode, ts.ScriptTarget.Latest, true);
        const elements = [];
        const methods = [];
        let className = '';
        const visitNode = (tsNode) => {
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
                    const elementNode = {
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
    async parseTestDataFile(node) {
        const content = fs.readFileSync(node.filePath, 'utf8');
        const jsonData = JSON.parse(content);
        // Extract TAF selectors
        const tafSelectors = jsonData.taf_selectors || {};
        const testScenarios = jsonData.test_scenarios || {};
        for (const [selectorName, selectorValue] of Object.entries(tafSelectors)) {
            const selectorNodeId = `${node.id}_selector_${selectorName}`;
            const selectorNode = {
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
            const scenarioNode = {
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
    async parseStepDefinition(node) {
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
    async parseFeatureFile(node) {
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
    async parseReactComponent(node) {
        const sourceCode = fs.readFileSync(node.filePath, 'utf8');
        const sourceFile = ts.createSourceFile(node.filePath, sourceCode, ts.ScriptTarget.Latest, true);
        const analysis = this.analyzeReactComponent(sourceFile, node.name);
        const elements = analysis.elements;
        // Create semantic element nodes
        for (const element of elements) {
            const elementNodeId = `${node.id}_element_${element.tagName}_${Math.random().toString(36).substr(2, 9)}`;
            const elementNode = {
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
    async parseVueComponent(node) {
        const sourceCode = fs.readFileSync(node.filePath, 'utf8');
        const analysis = this.analyzeVueComponent(sourceCode, node.name);
        const elements = analysis.elements;
        // Create semantic element nodes
        for (const element of elements) {
            const elementNodeId = `${node.id}_element_${element.tagName}_${Math.random().toString(36).substr(2, 9)}`;
            const elementNode = {
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
    async buildSelectorMappings() {
        const mappings = [];
        const tafSelectors = Array.from(this.nodes.values()).filter(n => n.type === 'TafSelector');
        const pageElements = Array.from(this.nodes.values()).filter(n => n.type === 'PageElement');
        for (const tafNode of tafSelectors) {
            const tafSelector = tafNode.metadata['selector'];
            for (const elementNode of pageElements) {
                const pageSelector = elementNode.metadata['selector'];
                if (pageSelector) {
                    const mapping = this.calculateSelectorMapping(tafSelector, pageSelector, tafNode.name, elementNode.name);
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
    calculateSelectorMapping(tafSelector, pageSelector, tafName, elementName) {
        let confidence = 0;
        let matchType = 'semantic';
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
    async buildStepRelationships() {
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
    async buildFeatureRelationships() {
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
    async generateOutputs() {
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
        await fs.promises.writeFile(path.join(outputDir, 'complete-registry.json'), JSON.stringify(registryData, null, 2));
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
    extractPropBasedContent(jsxNode) {
        const propExpressions = [];
        let hasTextProps = false;
        let suggestedText = '';
        let translationKey;
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
    isPropBasedTextContent(expression) {
        // Common patterns for text props
        const textPropPatterns = [
            /\blabel\b/, // {label}
            /\btext\b/, // {text}
            /\btitle\b/, // {title}
            /\bcontent\b/, // {content}
            /\bchildren\b/, // {children}
            /\bmessage\b/, // {message}
            /\bname\b/, // {name}
            /\bt\(/, // {t('key')} - translation function
            /\btranslate\(/, // {translate('key')}
        ];
        return textPropPatterns.some(pattern => pattern.test(expression));
    }
    generateSuggestedTextFromProp(expression) {
        // Extract meaningful text from prop expressions
        if (expression.includes('label'))
            return 'PROP_LABEL';
        if (expression.includes('title'))
            return 'PROP_TITLE';
        if (expression.includes('text'))
            return 'PROP_TEXT';
        if (expression.includes('children'))
            return 'PROP_CHILDREN';
        if (expression.includes('name'))
            return 'PROP_NAME';
        if (expression.includes('message'))
            return 'PROP_MESSAGE';
        // Extract translation keys
        const translationMatch = expression.match(/["']([^"']+)["']/);
        if (translationMatch) {
            return `T_${translationMatch[1].toUpperCase()}`;
        }
        return 'PROP_CONTENT';
    }
    extractTranslationKey(expression) {
        // Extract translation keys from t('key') or translate('key') patterns
        const translationMatch = expression.match(/(?:t|translate)\(["']([^"']+)["']\)/);
        return translationMatch ? translationMatch[1] : undefined;
    }
    /**
     * Enhanced semantic selector recommendation algorithm
     */
    generateRecommendedSelector(element) {
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
    isInteractiveElement(tagName) {
        const interactiveElements = ['button', 'a', 'input', 'select', 'textarea'];
        return interactiveElements.includes(tagName.toLowerCase());
    }
    isInputElement(tagName) {
        return tagName.toLowerCase() === 'input';
    }
    isNonSemanticElement(tagName) {
        const nonSemanticElements = ['div', 'span', 'section', 'article'];
        return nonSemanticElements.includes(tagName.toLowerCase());
    }
    generateTestId(element) {
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
    getAutomationPriority(element) {
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
    analyzeAutomationAttributes(element) {
        const { attributes = {} } = element;
        const testAttributes = [];
        const accessibilityAttributes = [];
        const behaviorAttributes = [];
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
    isAutomationRelevantElement(element) {
        const priority = this.getAutomationPriority(element);
        return priority !== 'none';
    }
    /**
     * Analyze React component and extract semantic elements
     */
    analyzeReactComponent(sourceFile, componentName) {
        const elements = [];
        const childComponents = [];
        const accessibilityIssues = [];
        const visitNode = (tsNode) => {
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
    analyzeVueComponent(sourceCode, componentName) {
        const elements = [];
        const childComponents = [];
        const accessibilityIssues = [];
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
    extractSemanticElementFromJsx(jsxNode) {
        const tagName = this.getJsxTagName(jsxNode);
        if (!tagName || /^[A-Z]/.test(tagName))
            return null; // Skip components, only HTML elements
        const attributes = this.getJsxAttributes(jsxNode);
        const textContent = this.getJsxTextContent(jsxNode);
        const propBasedContent = this.extractPropBasedContent(jsxNode);
        const semanticSelectors = {};
        // Prioritize static text, then prop-based content
        if (textContent) {
            semanticSelectors.textContent = textContent;
        }
        else if (propBasedContent.hasTextProps) {
            semanticSelectors.textContent = propBasedContent.suggestedText;
        }
        if (attributes['aria-label'])
            semanticSelectors.ariaLabel = attributes['aria-label'];
        if (attributes['role'])
            semanticSelectors.ariaRole = attributes['role'];
        if (attributes['placeholder'])
            semanticSelectors.placeholder = attributes['placeholder'];
        if (attributes['type'])
            semanticSelectors.type = attributes['type'];
        if (attributes['name'])
            semanticSelectors.name = attributes['name'];
        if (attributes['title'])
            semanticSelectors.title = attributes['title'];
        const element = {
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
    extractSemanticElementsFromVueTemplate(templateContent) {
        const elements = [];
        // Simple regex-based extraction for Vue templates
        const elementRegex = /<(\w+)([^>]*?)(?:\/>|>([\s\S]*?)<\/\1>)/g;
        let match;
        while ((match = elementRegex.exec(templateContent)) !== null) {
            const tagName = match[1];
            const attributesStr = match[2];
            const textContent = match[3];
            if (/^[A-Z]/.test(tagName))
                continue; // Skip Vue components
            const attributes = this.parseVueAttributes(attributesStr);
            const cleanTextContent = textContent ? textContent.replace(/{{.*?}}/g, '').trim() : null;
            const semanticSelectors = {};
            if (cleanTextContent)
                semanticSelectors.textContent = cleanTextContent;
            if (attributes['aria-label'])
                semanticSelectors.ariaLabel = attributes['aria-label'];
            if (attributes['role'])
                semanticSelectors.ariaRole = attributes['role'];
            if (attributes['placeholder'])
                semanticSelectors.placeholder = attributes['placeholder'];
            if (attributes['type'])
                semanticSelectors.type = attributes['type'];
            if (attributes['name'])
                semanticSelectors.name = attributes['name'];
            if (attributes['title'])
                semanticSelectors.title = attributes['title'];
            const element = {
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
    getSelectorPriority(element) {
        if (element.semanticSelectors.textContent && this.isInteractiveElement(element.tagName))
            return 'always';
        if (element.semanticSelectors.ariaLabel)
            return 'always';
        if (element.semanticSelectors.type && this.isInputElement(element.tagName))
            return 'always';
        if (element.semanticSelectors.name || element.semanticSelectors.placeholder)
            return 'sparingly';
        if (this.isNonSemanticElement(element.tagName))
            return 'good';
        return 'never';
    }
    generateAccessibilityRecommendations(elements) {
        const recommendations = [];
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
    getJsxTagName(jsxNode) {
        if (ts.isJsxElement(jsxNode)) {
            if (ts.isIdentifier(jsxNode.openingElement.tagName)) {
                return jsxNode.openingElement.tagName.text;
            }
        }
        else if (ts.isJsxSelfClosingElement(jsxNode)) {
            if (ts.isIdentifier(jsxNode.tagName)) {
                return jsxNode.tagName.text;
            }
        }
        return null;
    }
    getJsxAttributes(jsxNode) {
        const attributes = {};
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
    getJsxAttributeValue(initializer) {
        if (ts.isStringLiteral(initializer)) {
            return initializer.text;
        }
        if (ts.isJsxExpression(initializer) && initializer.expression && ts.isStringLiteral(initializer.expression)) {
            return initializer.expression.text;
        }
        return '';
    }
    getJsxTextContent(jsxNode) {
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
    parseVueAttributes(attributesStr) {
        const attributes = {};
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
    async findFiles(patterns) {
        const files = [];
        for (const pattern of patterns) {
            const matches = await (0, glob_1.glob)(pattern, {
                cwd: this.projectRoot,
                ignore: ['**/node_modules/**', '**/dist/**', '**/*.d.ts']
            });
            files.push(...matches.map(f => path.resolve(this.projectRoot, f)));
        }
        return [...new Set(files)]; // Remove duplicates
    }
    generateNodeId(filePath) {
        return path.relative(this.projectRoot, filePath).replace(/[/\\]/g, '_').replace(/\.[^.]*$/, '');
    }
    getNodeType(filePath) {
        const ext = path.extname(filePath);
        const basename = path.basename(filePath);
        if (basename.includes('.steps.'))
            return 'StepDefinition';
        if (ext === '.feature')
            return 'FeatureFile';
        if (ext === '.json' && (basename.includes('test_data') || basename.includes('test-data')))
            return 'TafSelector';
        if (ext === '.tsx' || ext === '.jsx')
            return 'ReactComponent';
        if (ext === '.vue')
            return 'VueComponent';
        if (ext === '.ts' && (basename.includes('Page') || basename.includes('Module')))
            return 'PageObject';
        if (ext === '.json')
            return 'TafSelector'; // fallback for other JSON files
        return 'PageObject'; // default
    }
    extractSelectorFromGetter(tsNode) {
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
    inferElementType(selector) {
        if (!selector)
            return 'unknown';
        if (selector.includes('button') || selector.includes('btn'))
            return 'button';
        if (selector.includes('input'))
            return 'input';
        if (selector.includes('select'))
            return 'select';
        if (selector.includes('form'))
            return 'form';
        return 'element';
    }
    extractBaseClass(sourceFile) {
        // Extract base class from extends clause
        let baseClass = null;
        const visitNode = (tsNode) => {
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
    extractStepDefinitions(sourceCode) {
        // Extract step definitions from .steps.ts files
        const steps = [];
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
    extractGherkinScenarios(content) {
        // Basic Gherkin parsing - you might want to use a proper Gherkin parser
        const scenarios = [];
        const lines = content.split('\n');
        let currentScenario = null;
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('Scenario:')) {
                if (currentScenario)
                    scenarios.push(currentScenario);
                currentScenario = {
                    name: trimmed.replace('Scenario:', '').trim(),
                    steps: []
                };
            }
            else if (currentScenario && /^\s*(Given|When|Then|And)\s/.test(trimmed)) {
                currentScenario.steps.push(trimmed);
            }
        }
        if (currentScenario)
            scenarios.push(currentScenario);
        return scenarios;
    }
    calculateStringSimilarity(str1, str2) {
        // Simple Levenshtein distance-based similarity
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        if (longer.length === 0)
            return 1.0;
        const distance = this.levenshteinDistance(longer, shorter);
        return (longer.length - distance) / longer.length;
    }
    levenshteinDistance(str1, str2) {
        const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
        for (let i = 0; i <= str1.length; i++)
            matrix[0][i] = i;
        for (let j = 0; j <= str2.length; j++)
            matrix[j][0] = j;
        for (let j = 1; j <= str2.length; j++) {
            for (let i = 1; i <= str1.length; i++) {
                const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(matrix[j][i - 1] + 1, matrix[j - 1][i] + 1, matrix[j - 1][i - 1] + substitutionCost);
            }
        }
        return matrix[str2.length][str1.length];
    }
    stepReferencesPage(step, pageNode) {
        // Check if step implementation references the page object
        const pageClassName = pageNode.metadata['className'];
        return pageClassName && step.pattern && step.pattern.toLowerCase().includes(pageClassName.toLowerCase());
    }
    findMatchingStepDefinition(step, stepNodes) {
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
    stepMatches(gherkinStep, stepPattern) {
        // Simple pattern matching - you'd want more sophisticated matching
        const normalizedStep = gherkinStep.replace(/^(Given|When|Then|And)\s+/, '').trim();
        const normalizedPattern = stepPattern.replace(/\[.*?\]/g, '.*'); // Replace parameters with wildcards
        try {
            const regex = new RegExp(normalizedPattern, 'i');
            return regex.test(normalizedStep);
        }
        catch {
            return false;
        }
    }
    getTotalRelationshipCount() {
        return Array.from(this.nodes.values()).reduce((sum, node) => sum + node.relationships.length, 0);
    }
    generateSummary() {
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
                case 'PageObject':
                    summary.pageObjects++;
                    break;
                case 'ReactComponent':
                    summary.reactComponents++;
                    break;
                case 'VueComponent':
                    summary.vueComponents++;
                    break;
                case 'SemanticElement':
                    summary.semanticElements++;
                    break;
                case 'TafSelector':
                    summary.tafSelectors++;
                    if (node.relationships.some(r => r.type === 'MAPS_TO')) {
                        summary.mappedSelectors++;
                    }
                    else {
                        summary.unmappedSelectors++;
                    }
                    break;
                case 'TestScenario':
                    summary.testScenarios++;
                    break;
                case 'StepDefinition':
                    summary.stepDefinitions++;
                    break;
                case 'FeatureFile':
                    summary.featureFiles++;
                    break;
                case 'PageElement':
                    summary.pageElements++;
                    break;
            }
        }
        return summary;
    }
    async generateMappingReport(outputDir) {
        const mappedSelectors = [];
        const unmappedSelectors = [];
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
                }
                else {
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
        await fs.promises.writeFile(path.join(outputDir, 'mapping-report.json'), JSON.stringify(report, null, 2));
    }
    async generateMissingMappingsReport(outputDir) {
        const missingMappings = [];
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
        await fs.promises.writeFile(path.join(outputDir, 'missing-mappings.json'), JSON.stringify({ missingMappings }, null, 2));
    }
    generateRecommendations(tafNode) {
        const recommendations = [];
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
    async generateVisualizationData(outputDir) {
        // Generate data for D3.js or other visualization tools
        const nodes = Array.from(this.nodes.values()).map(node => ({
            id: node.id,
            name: node.name,
            type: node.type,
            group: this.getNodeGroup(node.type)
        }));
        const links = [];
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
        await fs.promises.writeFile(path.join(outputDir, 'visualization-data.json'), JSON.stringify(vizData, null, 2));
    }
    getNodeGroup(type) {
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
        return groupMap[type] || 0;
    }
    async generateSemanticAnalysisReport(outputDir) {
        const components = Array.from(this.nodes.values()).filter(n => n.type === 'ReactComponent' || n.type === 'VueComponent');
        const semanticElements = Array.from(this.nodes.values()).filter(n => n.type === 'SemanticElement');
        const recommendations = [];
        const accessibilityIssues = [];
        for (const component of components) {
            const componentElements = semanticElements.filter(e => e.metadata['parentComponent'] === component.name);
            for (const element of componentElements) {
                const elementData = element.metadata;
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
                }
                else if (isPropBased && elementData.selectorPriority === 'always') {
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
            always: semanticElements.filter(e => e.metadata.selectorPriority === 'always').length,
            sparingly: semanticElements.filter(e => e.metadata.selectorPriority === 'sparingly').length,
            good: semanticElements.filter(e => e.metadata.selectorPriority === 'good').length,
            never: semanticElements.filter(e => e.metadata.selectorPriority === 'never').length
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
        await fs.promises.writeFile(path.join(outputDir, 'semantic-analysis.json'), JSON.stringify(report, null, 2));
    }
    calculateAccessibilityScore(elements) {
        const interactiveElements = elements.filter(e => {
            const elementData = e.metadata;
            return this.isInteractiveElement(elementData.tagName);
        });
        const accessibleElements = interactiveElements.filter(e => {
            const elementData = e.metadata;
            return elementData.semanticSelectors.ariaLabel || elementData.semanticSelectors.textContent;
        });
        return interactiveElements.length > 0 ? accessibleElements.length / interactiveElements.length : 1;
    }
    generateOverallAccessibilityRecommendations(elements) {
        const recommendations = [];
        const interactiveElements = elements.filter(e => {
            const elementData = e.metadata;
            return this.isInteractiveElement(elementData.tagName);
        });
        const elementsWithoutLabels = interactiveElements.filter(e => {
            const elementData = e.metadata;
            return !elementData.semanticSelectors.ariaLabel && !elementData.semanticSelectors.textContent;
        });
        if (elementsWithoutLabels.length > 0) {
            recommendations.push(`Add accessible labels to ${elementsWithoutLabels.length} interactive elements`);
        }
        const inputElements = elements.filter(e => e.metadata.tagName === 'input');
        const inputsWithoutLabels = inputElements.filter(e => {
            const elementData = e.metadata;
            return !elementData.semanticSelectors.ariaLabel && !elementData.semanticSelectors.placeholder;
        });
        if (inputsWithoutLabels.length > 0) {
            recommendations.push(`Add placeholder or aria-label to ${inputsWithoutLabels.length} input elements`);
        }
        return recommendations;
    }
}
exports.AutomatedRegistryBuilder = AutomatedRegistryBuilder;
// CLI interface
async function main() {
    const projectRoot = process.argv[2] || process.cwd();
    console.log('🤖 TAF Automated Registry Builder');
    console.log('=====================================');
    try {
        const builder = new AutomatedRegistryBuilder(projectRoot);
        await builder.buildRegistry();
        console.log('\n🎉 Success! Check the registry-output directory for results.');
    }
    catch (error) {
        console.error('\n💥 Build failed:', error);
        process.exit(1);
    }
}
// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}
//# sourceMappingURL=registry-builder.js.map