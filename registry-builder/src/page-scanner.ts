#!/usr/bin/env ts-node

/**
 * Page-Focused Automation Scanner
 * 
 * Scans React/Vue codebases to find interactive elements and generate page objects
 * Focuses only on actionable automation elements, grouped by page
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import * as ts from 'typescript';

interface InteractiveElement {
  name: string;           // Smart name like 'addToCartButton' 
  tagName: string;        // button, input, select, etc
  locator: string;        // Best locator for automation
  locatorType: 'semantic' | 'testid' | 'attribute' | 'fallback';
  attributes: Record<string, string>;
  confidence: number;     // How reliable this locator is (1-10)
}

interface PageInfo {
  name: string;           // Component name like 'SingleProduct'
  filePath: string;       // Full file path
  route: string | undefined;         // If we can detect route
  elements: InteractiveElement[];
}

interface ScanResult {
  pages: PageInfo[];
  summary: {
    totalPages: number;
    totalElements: number;
    elementsByType: Record<string, number>;
  };
}

class PageScanner {
  private interactiveTagNames = new Set([
    'button', 'input', 'select', 'textarea', 'form', 'a'
  ]);

  private testAttributes = [
    'data-testid', 'data-cy', 'data-test', 'data-qa', 'testid', 'test-id'
  ];

  async scanDirectory(rootPath: string): Promise<ScanResult> {
    console.log(`🔍 Scanning ${rootPath} for interactive elements...`);

    const pageFiles = await this.findPageComponents(rootPath);
    const pages: PageInfo[] = [];

    for (const filePath of pageFiles) {
      try {
        const pageInfo = await this.analyzePage(filePath);
        if (pageInfo.elements.length > 0) {
          pages.push(pageInfo);
        }
      } catch (error) {
        console.warn(`⚠️  Skipped ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    // Sort pages by element count (most interactive first)
    pages.sort((a, b) => b.elements.length - a.elements.length);

    const summary = this.generateSummary(pages);
    
    console.log(`✅ Found ${pages.length} pages with ${summary.totalElements} interactive elements`);
    
    return { pages, summary };
  }

  private async findPageComponents(rootPath: string): Promise<string[]> {
    // Look for page components in common locations
    const patterns = [
      `${rootPath}/**/pages/**/*.{tsx,ts,vue}`,
      `${rootPath}/**/views/**/*.{tsx,ts,vue}`,
      `${rootPath}/**/components/pages/**/*.{tsx,ts,vue}`,
      `${rootPath}/**/*Page.{tsx,ts,vue}`,
      `${rootPath}/**/*View.{tsx,ts,vue}`
    ];

    const allFiles = new Set<string>();
    
    for (const pattern of patterns) {
      const files = await glob(pattern, { ignore: ['**/node_modules/**'] });
      files.forEach(file => allFiles.add(file));
    }

    return Array.from(allFiles).sort();
  }

  private async analyzePage(filePath: string): Promise<PageInfo> {
    const sourceCode = fs.readFileSync(filePath, 'utf-8');
    const componentName = this.extractComponentName(filePath);
    
    let elements: InteractiveElement[] = [];

    if (filePath.endsWith('.vue')) {
      elements = this.analyzeVueFile(sourceCode);
    } else {
      elements = this.analyzeReactFile(sourceCode);
    }

    // Filter and enhance elements
    elements = elements
      .filter(el => this.isReallyInteractive(el))
      .map(el => this.enhanceElement(el, componentName));

    return {
      name: componentName,
      filePath,
      route: this.detectRoute(sourceCode, filePath),
      elements
    };
  }

  private analyzeReactFile(sourceCode: string): InteractiveElement[] {
    const sourceFile = ts.createSourceFile(
      'temp.tsx',
      sourceCode,
      ts.ScriptTarget.Latest,
      true
    );

    const elements: InteractiveElement[] = [];

    const visitNode = (node: ts.Node): void => {
      if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
        const element = this.extractElementFromJsx(node);
        if (element) {
          elements.push(element);
        }
      }
      ts.forEachChild(node, visitNode);
    };

    visitNode(sourceFile);
    return elements;
  }

  private analyzeVueFile(sourceCode: string): InteractiveElement[] {
    // Simple Vue template extraction
    const templateMatch = sourceCode.match(/<template[^>]*>([\s\S]*?)<\/template>/);
    if (!templateMatch) return [];

    const template = templateMatch[1];
    const elements: InteractiveElement[] = [];

    // Basic regex-based parsing for Vue (could be enhanced with proper Vue parser)
    const elementRegex = /<(\w+)([^>]*)(?:\/>|>[\s\S]*?<\/\1>)/g;
    let match;

    while ((match = elementRegex.exec(template)) !== null) {
      const [, tagName, attributesStr] = match;
      
      if (this.interactiveTagNames.has(tagName)) {
        const attributes = this.parseAttributes(attributesStr);
        const element = this.createElementFromAttributes(tagName, attributes);
        if (element) {
          elements.push(element);
        }
      }
    }

    return elements;
  }

  private extractElementFromJsx(node: ts.JsxElement | ts.JsxSelfClosingElement): InteractiveElement | null {
    const tagName = this.getJsxTagName(node);
    if (!tagName || !this.interactiveTagNames.has(tagName)) {
      return null;
    }

    const attributes = this.getJsxAttributes(node);
    return this.createElementFromAttributes(tagName, attributes);
  }

  private createElementFromAttributes(tagName: string, attributes: Record<string, string>): InteractiveElement | null {
    // Find the best locator
    const locatorInfo = this.generateBestLocator(tagName, attributes);
    
    return {
      name: '', // Will be enhanced later
      tagName,
      locator: locatorInfo.locator,
      locatorType: locatorInfo.type,
      attributes,
      confidence: locatorInfo.confidence
    };
  }

  private generateBestLocator(tagName: string, attributes: Record<string, string>): {
    locator: string;
    type: 'semantic' | 'testid' | 'attribute' | 'fallback';
    confidence: number;
  } {
    // 1. Test ID attributes (highest confidence)
    for (const testAttr of this.testAttributes) {
      if (attributes[testAttr]) {
        return {
          locator: `[${testAttr}="${attributes[testAttr]}"]`,
          type: 'testid',
          confidence: 10
        };
      }
    }

    // 2. Semantic locators for buttons/links
    if (tagName === 'button') {
      const text = attributes['textContent'] || attributes['title'] || attributes['aria-label'];
      if (text) {
        return {
          locator: `button=${text}`,
          type: 'semantic',
          confidence: 9
        };
      }
    }

    if (tagName === 'a') {
      const text = attributes['textContent'] || attributes['aria-label'];
      if (text) {
        return {
          locator: `link=${text}`,
          type: 'semantic',
          confidence: 9
        };
      }
    }

    // 3. Input types with names
    if (tagName === 'input') {
      if (attributes['name']) {
        return {
          locator: `input[name="${attributes['name']}"]`,
          type: 'attribute',
          confidence: 8
        };
      }
      if (attributes['placeholder']) {
        return {
          locator: `input[placeholder="${attributes['placeholder']}"]`,
          type: 'attribute',
          confidence: 7
        };
      }
      if (attributes['type']) {
        return {
          locator: `input[type="${attributes['type']}"]`,
          type: 'attribute',
          confidence: 6
        };
      }
    }

    // 4. ARIA labels
    if (attributes['aria-label']) {
      return {
        locator: `[aria-label="${attributes['aria-label']}"]`,
        type: 'attribute',
        confidence: 8
      };
    }

    // 5. ID or unique attributes
    if (attributes['id']) {
      return {
        locator: `#${attributes['id']}`,
        type: 'attribute',
        confidence: 7
      };
    }

    // 6. Fallback to tag
    return {
      locator: tagName,
      type: 'fallback',
      confidence: 3
    };
  }

  private isReallyInteractive(element: InteractiveElement): boolean {
    const { tagName, attributes } = element;

    // Always include elements with test IDs
    if (this.testAttributes.some(attr => attributes[attr])) {
      return true;
    }

    // Skip hidden inputs
    if (tagName === 'input' && attributes['type'] === 'hidden') {
      return false;
    }

    // Only include interactive elements
    return this.interactiveTagNames.has(tagName);
  }

  private enhanceElement(element: InteractiveElement, componentName: string): InteractiveElement {
    const name = this.generateSmartElementName(element, componentName);
    return { ...element, name };
  }

  private generateSmartElementName(element: InteractiveElement, componentName: string): string {
    const { tagName, attributes } = element;
    const prefix = tagName;

    // Use semantic content for naming
    const text = attributes['textContent'] || attributes['title'] || attributes['aria-label'] || attributes['placeholder'];
    
    if (text) {
      const cleanText = text
        .toLowerCase()
        .replace(/[^\w\s]/g, '')  // Remove special chars
        .replace(/\s+/g, '_')     // Replace spaces with underscores
        .substring(0, 25);        // Limit length
      
      return `${prefix}_${cleanText}`;
    }

    // Use input type or name
    if (tagName === 'input') {
      if (attributes['name']) return `${prefix}_${attributes['name']}`;
      if (attributes['type']) return `${prefix}_${attributes['type']}`;
    }

    // Fallback with component context
    return `${prefix}_${componentName.toLowerCase()}`;
  }

  // Helper methods
  private extractComponentName(filePath: string): string {
    const filename = path.basename(filePath, path.extname(filePath));
    return filename.replace(/Page$|View$/, '') || filename;
  }

  private detectRoute(sourceCode: string, filePath: string): string | undefined {
    // Try to extract route from React Router or file path
    const routeMatch = sourceCode.match(/path=['"](\/[^'"]*)['"]/);
    if (routeMatch) return routeMatch[1];

    // Infer from file path
    if (filePath.includes('/pages/')) {
      const pathPart = filePath.split('/pages/')[1];
      return '/' + pathPart.replace(/\.(tsx?|vue)$/, '').toLowerCase();
    }

    return undefined;
  }

  private getJsxTagName(node: ts.JsxElement | ts.JsxSelfClosingElement): string | null {
    const tagNameNode = ts.isJsxElement(node) ? node.openingElement.tagName : node.tagName;
    
    if (ts.isIdentifier(tagNameNode)) {
      return tagNameNode.text.toLowerCase();
    }
    
    return null;
  }

  private getJsxAttributes(node: ts.JsxElement | ts.JsxSelfClosingElement): Record<string, string> {
    const attributes: Record<string, string> = {};
    const attributesArray = ts.isJsxElement(node) 
      ? node.openingElement.attributes.properties 
      : node.attributes.properties;

    attributesArray.forEach(attr => {
      if (ts.isJsxAttribute(attr) && ts.isIdentifier(attr.name)) {
        const name = attr.name.text;
        let value = '';

        if (attr.initializer) {
          if (ts.isStringLiteral(attr.initializer)) {
            value = attr.initializer.text;
          } else if (ts.isJsxExpression(attr.initializer)) {
            value = attr.initializer.getText();
          }
        }

        attributes[name] = value;
      }
    });

    return attributes;
  }

  private parseAttributes(attributesStr: string): Record<string, string> {
    const attributes: Record<string, string> = {};
    const attrRegex = /(\w+)=["']([^"']+)["']/g;
    let match;

    while ((match = attrRegex.exec(attributesStr)) !== null) {
      attributes[match[1]] = match[2];
    }

    return attributes;
  }

  private generateSummary(pages: PageInfo[]) {
    const totalElements = pages.reduce((sum, page) => sum + page.elements.length, 0);
    const elementsByType: Record<string, number> = {};

    pages.forEach(page => {
      page.elements.forEach(element => {
        elementsByType[element.tagName] = (elementsByType[element.tagName] || 0) + 1;
      });
    });

    return {
      totalPages: pages.length,
      totalElements,
      elementsByType
    };
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const rootPath = args[0] || '.';

  if (!fs.existsSync(rootPath)) {
    console.error(`❌ Path not found: ${rootPath}`);
    process.exit(1);
  }

  console.log('🚀 Page Scanner - Find Interactive Elements for Automation\n');

  const scanner = new PageScanner();
  const result = await scanner.scanDirectory(rootPath);

  // Output results
  console.log('\n📄 PAGES FOUND:\n');
  result.pages.forEach(page => {
    console.log(`📄 ${page.name} (${page.elements.length} elements)`);
    if (page.route) console.log(`   Route: ${page.route}`);
    console.log(`   File: ${page.filePath}`);
    
    page.elements.forEach(element => {
      const confidence = '★'.repeat(Math.ceil(element.confidence / 2));
      console.log(`   • ${element.name} → ${element.locator} ${confidence}`);
    });
    console.log('');
  });

  console.log('📊 SUMMARY:');
  console.log(`   Pages: ${result.summary.totalPages}`);
  console.log(`   Interactive Elements: ${result.summary.totalElements}`);
  console.log('   Elements by type:', result.summary.elementsByType);

  // Save detailed results
  const outputPath = path.join(rootPath, 'page-scan-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log(`\n💾 Detailed results saved to: ${outputPath}`);
}

if (require.main === module) {
  main().catch(console.error);
}

export { PageScanner, PageInfo, InteractiveElement, ScanResult };