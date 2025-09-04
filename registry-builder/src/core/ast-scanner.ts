import { Project, SourceFile, Node, SyntaxKind } from 'ts-morph';
import * as path from 'path';
import { PageElement, AccessibleSelectors, ResolvedExpression, SourceLocation } from '../types';
import { AccessibleSelectorExtractor } from './accessible-selector-extractor';
import { ExpressionEvaluator, SymbolContext } from './expression-evaluator';

export class ASTScanner {
  private project: Project;
  private selectorExtractor: AccessibleSelectorExtractor;
  private expressionEvaluator: ExpressionEvaluator;
  private interactiveTagNames = new Set([
    'button', 'input', 'select', 'textarea', 'form', 'a', 'label', 
    'nav', 'main', 'header', 'footer', 'aside', 'section', 'article'
  ]);

  private interactiveRoles = new Set([
    'button', 'link', 'tab', 'menuitem', 'option', 'checkbox', 'radio',
    'slider', 'spinbutton', 'switch', 'textbox', 'combobox', 'listbox',
    'tabpanel', 'dialog', 'alertdialog', 'menu', 'menubar', 'tree',
    'grid', 'treegrid', 'application'
  ]);

  private eventHandlerPatterns = [
    /onClick/, /onSubmit/, /onChange/, /onFocus/, /onBlur/, /onKeyDown/,
    /onKeyUp/, /onMouseEnter/, /onMouseLeave/, /onHover/, /onPress/
  ];

  private loaderPatterns = [
    /data-testid=['""][^'"]*loader[^'"]*['""]/, 
    /data-testid=['""][^'"]*loading[^'"]*['""]/, 
    /data-testid=['""][^'"]*spinner[^'"]*['""]/, 
    /className=['""][^'"]*loading[^'"]*['""]/, 
    /className=['""][^'"]*spinner[^'"]*['""]/, 
    /role=['""]status['""]/, 
    /aria-live=['""]polite['""]/, 
    /aria-live=['""]assertive['""]/, 
    /aria-busy=['""]true['""]/, 
  ];

  private skeletonPatterns = [
    /data-testid=['""][^'"]*skeleton[^'"]*['""]/, 
    /data-testid=['""][^'"]*placeholder[^'"]*['""]/, 
    /className=['""][^'"]*skeleton[^'"]*['""]/, 
    /className=['""][^'"]*placeholder[^'"]*['""]/, 
    /className=['""][^'"]*pulse[^'"]*['""]/, 
    /aria-hidden=['""]true['""].*placeholder/,
  ];

  constructor() {
    this.project = new Project({
      useInMemoryFileSystem: false,
      skipAddingFilesFromTsConfig: true
    });
    this.selectorExtractor = new AccessibleSelectorExtractor();
    this.expressionEvaluator = new ExpressionEvaluator();
  }

  /**
   * Scan all files and extract page elements
   */
  async scanFiles(filePaths: string[]): Promise<PageElement[]> {
    console.log('⚡ Scanning JSX elements...');
    
    const allElements: PageElement[] = [];
    let processedCount = 0;

    for (const filePath of filePaths) {
      try {
        const elements = await this.scanFile(filePath);
        allElements.push(...elements);
        processedCount++;

        if (processedCount % 10 === 0) {
          console.log(`⚡ Processed ${processedCount}/${filePaths.length} files`);
        }
      } catch (error) {
        console.warn(`⚠️  Error scanning ${filePath}:`, error);
      }
    }

    console.log(`⚡ Scan complete: ${allElements.length} elements found`);
    return allElements;
  }

  /**
   * Scan a single file for page elements
   */
  private async scanFile(filePath: string): Promise<PageElement[]> {
    // Add source file to project
    let sourceFile: SourceFile;
    try {
      sourceFile = this.project.addSourceFileAtPath(filePath);
    } catch (error) {
      console.warn(`⚠️  Could not parse ${filePath}:`, error);
      return [];
    }

    const elements: PageElement[] = [];

    // Build symbol table for this file
    const symbolContext = this.expressionEvaluator.buildSymbolTable(sourceFile);

    // Find all JSX elements
    this.findJSXElements(sourceFile, (jsxElement, tagName) => {
      const element = this.analyzeJSXElement(jsxElement, tagName, filePath, symbolContext);
      if (element) {
        elements.push(element);
      }
    });

    // Remove source file to free memory
    sourceFile.forget();

    return elements;
  }

  /**
   * Find all JSX elements in source file
   */
  private findJSXElements(sourceFile: SourceFile, callback: (node: Node, tagName: string) => void): void {
    sourceFile.forEachDescendant(node => {
      // Look for JSX opening elements
      if (node.getKind() === SyntaxKind.JsxOpeningElement || 
          node.getKind() === SyntaxKind.JsxSelfClosingElement) {
        
        const tagNameNode = node.getFirstChild();
        if (tagNameNode) {
          const tagName = tagNameNode.getText().toLowerCase();
          
          // Only process interactive elements
          if (this.interactiveTagNames.has(tagName) || this.hasInteractiveAttributes(node)) {
            callback(node, tagName);
          }
        }
      }
    });
  }

  /**
   * Check if element has interactive attributes, loader patterns, or skeleton patterns
   */
  private hasInteractiveAttributes(node: Node): boolean {
    const text = node.getText();
    
    // Check for event handlers
    const hasEventHandler = this.eventHandlerPatterns.some(pattern => pattern.test(text));
    
    // Check for interactive roles
    const hasInteractiveRole = Array.from(this.interactiveRoles).some(role => 
      new RegExp(`role=['"][^'"]*${role}[^'"]*['"]`).test(text)
    );
    
    // Check for test IDs (always include for test automation)
    const hasTestId = /data-testid/.test(text);
    
    // Check for loader or skeleton patterns (also important for testing)
    const hasLoaderPattern = this.loaderPatterns.some(pattern => pattern.test(text));
    const hasSkeletonPattern = this.skeletonPatterns.some(pattern => pattern.test(text));
    
    return hasEventHandler || hasInteractiveRole || hasTestId || hasLoaderPattern || hasSkeletonPattern;
  }

  /**
   * Analyze a JSX element and create PageElement
   */
  private analyzeJSXElement(jsxElement: Node, tagName: string, filePath: string, symbolContext: SymbolContext): PageElement | null {
    try {
      // Extract accessible selectors using Testing Library priority
      const selectors = this.selectorExtractor.extract(jsxElement, tagName);
      
      // Evaluate dynamic expressions
      const dynamicExpressions = this.expressionEvaluator.findDynamicExpressions(jsxElement, symbolContext);
      
      // Determine element type
      const elementType = this.categorizeElement(tagName, selectors, jsxElement);
      
      // Get source location
      const location = this.getSourceLocation(jsxElement, filePath);
      
      // Create component name from tag or file
      const component = this.generateComponentName(tagName, filePath);

      return {
        type: elementType,
        component,
        selectors,
        dynamicExpressions,
        location
      };
    } catch (error) {
      console.warn(`⚠️  Error analyzing JSX element in ${filePath}:`, error);
      return null;
    }
  }


  /**
   * Categorize element type based on comprehensive analysis
   */
  private categorizeElement(tagName: string, selectors: AccessibleSelectors, jsxElement: Node): 'interactive' | 'skeleton' | 'whirligig' {
    const text = jsxElement.getText();
    
    // Check for loader patterns first (highest priority for your use case)
    const isLoader = this.loaderPatterns.some(pattern => pattern.test(text));
    if (isLoader) {
      return 'whirligig'; // Loaders go to whirligig category
    }
    
    // Check for interactive elements
    const isInteractiveTag = this.interactiveTagNames.has(tagName.toLowerCase());
    const hasEventHandler = this.eventHandlerPatterns.some(pattern => pattern.test(text));
    const hasInteractiveRole = selectors.byRole && 
      this.interactiveRoles.has(selectors.byRole.toLowerCase());
    const isClickable = /onClick|onPress|onSubmit/.test(text);
    
    if (isInteractiveTag || hasEventHandler || hasInteractiveRole || isClickable) {
      return 'interactive';
    }
    
    // Check for skeleton patterns
    const isSkeleton = this.skeletonPatterns.some(pattern => pattern.test(text));
    if (isSkeleton) {
      return 'skeleton';
    }
    
    // Additional skeleton indicators
    const isPlaceholder = /placeholder|loading-placeholder|content-loader/i.test(text);
    const isStatusElement = selectors.byRole === 'status' && !isLoader;
    
    if (isPlaceholder || isStatusElement) {
      return 'skeleton';
    }
    
    // Default to skeleton for non-interactive content elements
    return 'skeleton';
  }

  /**
   * Generate component name
   */
  private generateComponentName(tagName: string, filePath: string): string {
    const filename = path.basename(filePath, path.extname(filePath));
    const normalizedTag = tagName.charAt(0).toUpperCase() + tagName.slice(1);
    
    return `${filename}_${normalizedTag}`;
  }

  /**
   * Get source location information
   */
  private getSourceLocation(node: Node, filePath: string): SourceLocation {
    const start = node.getStart();
    const sourceFile = node.getSourceFile();
    const lineAndColumn = sourceFile.getLineAndColumnAtPos(start);
    
    return {
      filePath: path.resolve(filePath),
      line: lineAndColumn.line,
      column: lineAndColumn.column,
      length: node.getWidth()
    };
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    // ts-morph handles cleanup automatically
  }
}