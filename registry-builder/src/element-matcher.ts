/**
 * Element-Level Matching System
 * Matches individual interactive elements between scanned pages and existing tests
 */

import * as fs from 'fs';
import * as path from 'path';

export interface ScannedElement {
  name: string;
  tagName: string;
  locator: string;
  locatorType: 'testid' | 'text' | 'placeholder' | 'aria-label' | 'css' | 'xpath' | 'role';
  confidence: number;
  page: string;
  filePath: string;
}

export interface ExistingLocator {
  locator: string;
  locatorType: 'testid' | 'text' | 'placeholder' | 'aria-label' | 'css' | 'xpath' | 'role';
  method: string;
  className: string;
  filePath: string;
  framework: string;
  lineNumber?: number;
  pageName?: string; // Add page name for matching
}

export interface ElementMatch {
  scannedElement: ScannedElement;
  existingLocator?: ExistingLocator;
  matchType: 'exact' | 'similar' | 'none';
  confidence: number;
}

export class ElementMatcher {
  /**
   * Match scanned elements against existing test locators
   */
  async matchElements(
    scannedElements: ScannedElement[],
    testDirectories: string[]
  ): Promise<ElementMatch[]> {
    console.log(`🔍 Analyzing ${scannedElements.length} scanned elements...`);
    
    // Extract all existing locators from test files
    const existingLocators = await this.extractExistingLocators(testDirectories);
    console.log(`📄 Found ${existingLocators.length} existing locators in tests`);

    // Match each scanned element
    const matches: ElementMatch[] = [];
    
    for (const element of scannedElements) {
      const match = this.findBestMatch(element, existingLocators);
      matches.push(match);
    }

    return matches;
  }

  /**
   * Extract all locators from existing test files
   */
  private async extractExistingLocators(testDirectories: string[]): Promise<ExistingLocator[]> {
    const locators: ExistingLocator[] = [];

    for (const testDir of testDirectories) {
      const files = this.findFilesRecursively(testDir, ['.ts', '.js']);
      
      for (const filePath of files) {
        if (filePath.includes('node_modules')) continue;
        
        const content = fs.readFileSync(filePath, 'utf-8');
        const fileLocators = this.extractLocatorsFromFile(content, filePath, testDir);
        locators.push(...fileLocators);
      }
    }

    return locators;
  }

  /**
   * Extract locators from a single test file
   */
  private extractLocatorsFromFile(content: string, filePath: string, baseDir: string): ExistingLocator[] {
    const locators: ExistingLocator[] = [];
    const lines = content.split('\n');
    const framework = this.detectFramework(content);
    
    // Determine if this is a page object or test file
    const isPageObject = content.includes('export class') && 
                        (filePath.includes('page') || filePath.includes('Page'));
    const className = isPageObject ? 
      (content.match(/export class (\w+)/) || [])[1] || 'Unknown' : 
      'TestFile';

    let currentMethod = 'unknown';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;
      
      // Track current method context for WebdriverIO getters
      const getterMatch = line.match(/get\s+(\w+)/);
      if (getterMatch) {
        currentMethod = getterMatch[1];
        continue;
      }
      
      // Track current method context for Playwright properties
      const propertyMatch = line.match(/(?:readonly\s+)?(\w+):\s*Locator/);
      if (propertyMatch) {
        currentMethod = propertyMatch[1];
        continue;
      }
      
      // Reset method context on closing brace or new method
      if (line.trim() === '}' || line.includes('constructor') || line.includes('async ')) {
        currentMethod = 'unknown';
      }
      
      // Extract different types of locators
      const extractedLocators = this.extractLocatorsFromLine(line, framework);
      
      for (const loc of extractedLocators) {
        // Extract page name from class name (e.g., "LoginPage" -> "Login")
        const pageName = this.extractPageNameFromClassName(className);
        
        locators.push({
          ...loc,
          method: currentMethod !== 'unknown' ? currentMethod : loc.method,
          className,
          filePath: path.relative(baseDir, filePath),
          framework,
          lineNumber,
          pageName
        });
      }
    }

    return locators;
  }

  /**
   * Extract locators from a single line of code
   */
  private extractLocatorsFromLine(line: string, framework: string): Omit<ExistingLocator, 'className' | 'filePath' | 'framework' | 'lineNumber'>[] {
    const locators: Omit<ExistingLocator, 'className' | 'filePath' | 'framework' | 'lineNumber'>[] = [];

    // Playwright patterns
    if (framework === 'playwright') {
      // getByTestId
      const testIdMatch = line.match(/getByTestId\(['"`]([^'"`]+)['"`]\)/);
      if (testIdMatch) {
        locators.push({
          locator: `[data-testid="${testIdMatch[1]}"]`,
          locatorType: 'testid',
          method: this.extractMethodName(line)
        });
      }

      // getByRole with name
      const roleWithNameMatch = line.match(/getByRole\(['"`]([^'"`]+)['"`],\s*\{\s*name:\s*['"`]([^'"`]+)['"`]\s*\}/);
      if (roleWithNameMatch) {
        const role = roleWithNameMatch[1];
        const name = roleWithNameMatch[2];
        locators.push({
          locator: `${role}=${name}`,
          locatorType: 'role',
          method: this.extractMethodName(line)
        });
      } else {
        // getByRole without name
        const roleMatch = line.match(/getByRole\(['"`]([^'"`]+)['"`]\)/);
        if (roleMatch) {
          locators.push({
            locator: `role=${roleMatch[1]}`,
            locatorType: 'role',
            method: this.extractMethodName(line)
          });
        }
      }

      // getByText
      const textMatch = line.match(/getByText\(['"`]([^'"`]+)['"`]\)/);
      if (textMatch) {
        locators.push({
          locator: `text=${textMatch[1]}`,
          locatorType: 'text',
          method: this.extractMethodName(line)
        });
      }

      // getByPlaceholder
      const placeholderMatch = line.match(/getByPlaceholder\(['"`]([^'"`]+)['"`]\)/);
      if (placeholderMatch) {
        locators.push({
          locator: `[placeholder="${placeholderMatch[1]}"]`,
          locatorType: 'placeholder',
          method: this.extractMethodName(line)
        });
      }

      // getByLabel
      const labelMatch = line.match(/getByLabel\(['"`]([^'"`]+)['"`]\)/);
      if (labelMatch) {
        locators.push({
          locator: `[aria-label="${labelMatch[1]}"]`,
          locatorType: 'aria-label',
          method: this.extractMethodName(line)
        });
      }
    }

    // WebdriverIO patterns
    if (framework === 'webdriverio') {
      // $('[data-testid="..."]')
      const testIdMatch = line.match(/\$\(['"`]\[data-testid=['"`]([^'"`]+)['"`]\]['"`]\)/);
      if (testIdMatch) {
        locators.push({
          locator: `[data-testid="${testIdMatch[1]}"]`,
          locatorType: 'testid',
          method: this.extractMethodName(line)
        });
      }

      // $('button*=Text')
      const textMatch = line.match(/\$\(['"`]([^'"`]*)\*=([^'"`]+)['"`]\)/);
      if (textMatch) {
        const element = textMatch[1] || 'button';
        const text = textMatch[2];
        locators.push({
          locator: `${element}=${text}`,
          locatorType: 'text',
          method: this.extractMethodName(line)
        });
      }

      // $('[placeholder="..."]')
      const placeholderMatch = line.match(/\$\(['"`]\[placeholder=['"`]([^'"`]+)['"`]\]['"`]\)/);
      if (placeholderMatch) {
        locators.push({
          locator: `[placeholder="${placeholderMatch[1]}"]`,
          locatorType: 'placeholder',
          method: this.extractMethodName(line)
        });
      }

      // $('[aria-label="..."]')
      const ariaMatch = line.match(/\$\(['"`]\[aria-label=['"`]([^'"`]+)['"`]\]['"`]\)/);
      if (ariaMatch) {
        locators.push({
          locator: `[aria-label="${ariaMatch[1]}"]`,
          locatorType: 'aria-label',
          method: this.extractMethodName(line)
        });
      }
    }

    // Cypress patterns
    if (framework === 'cypress') {
      // cy.get('[data-testid="..."]')
      const testIdMatch = line.match(/cy\.get\(['"`]\[data-testid=['"`]([^'"`]+)['"`]\]['"`]\)/);
      if (testIdMatch) {
        locators.push({
          locator: `[data-testid="${testIdMatch[1]}"]`,
          locatorType: 'testid',
          method: 'cy.get'
        });
      }

      // cy.contains('text')
      const containsMatch = line.match(/cy\.contains\(['"`]([^'"`]+)['"`]\)/);
      if (containsMatch) {
        locators.push({
          locator: `text=${containsMatch[1]}`,
          locatorType: 'text',
          method: 'cy.contains'
        });
      }
    }

    return locators;
  }

  /**
   * Extract method name from a line of code
   */
  private extractMethodName(line: string): string {
    // Try to find getter method (WebdriverIO style)
    const getterMatch = line.match(/get\s+(\w+)/);
    if (getterMatch) return getterMatch[1];
    
    // Try to find method name before the locator (Playwright style)
    const methodMatch = line.match(/(?:this\.)?(\w+)\s*[=:]/);
    if (methodMatch) return methodMatch[1];
    
    // Default
    return 'unknown';
  }

  /**
   * Find the best match for a scanned element
   */
  private findBestMatch(element: ScannedElement, existingLocators: ExistingLocator[]): ElementMatch {
    let bestMatch: ExistingLocator | undefined;
    let bestScore = 0;
    let matchType: 'exact' | 'similar' | 'none' = 'none';

    for (const existing of existingLocators) {
      const score = this.calculateMatchScore(element, existing);
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = existing;
      }
    }

    // Determine match type based on score
    if (bestScore >= 1.0) {
      matchType = 'exact';
    } else if (bestScore >= 0.8) {  // Much higher threshold for similar matches
      matchType = 'similar';
    } else {
      matchType = 'none'; // Everything else is no match
      bestMatch = undefined;
    }

    const result: ElementMatch = {
      scannedElement: element,
      matchType,
      confidence: bestScore
    };

    if (bestMatch && matchType !== 'none') {
      result.existingLocator = bestMatch;
    }

    return result;
  }

  /**
   * Calculate match score between scanned element and existing locator
   */
  private calculateMatchScore(element: ScannedElement, existing: ExistingLocator): number {
    let score = 0;

    // First check: Page must match (or be unknown)
    const scannedPageName = this.normalizeScannedPageName(element.page);
    const existingPageName = existing.pageName || 'unknown';
    
    if (existingPageName !== 'unknown' && scannedPageName !== existingPageName) {
      // Different pages - no match possible
      return 0;
    }

    // Exact locator match (highest priority)
    if (this.normalizeLocator(element.locator) === this.normalizeLocator(existing.locator)) {
      return 1.0;
    }

    // For non-exact matches, be much more strict
    const elementText = this.extractTextFromLocator(element.locator);
    const existingText = this.extractTextFromLocator(existing.locator);
    
    // Only consider it a match if:
    // 1. Same locator type AND same text content, OR
    // 2. Exact text content match with high confidence
    
    if (element.locatorType === existing.locatorType) {
      // Same locator type - check text content
      if (elementText && existingText && elementText.toLowerCase() === existingText.toLowerCase()) {
        score = 0.9; // High confidence for same type + same text
      }
    } else if (elementText && existingText && elementText.toLowerCase() === existingText.toLowerCase()) {
      // Different locator types but exact same text content
      score = 0.7; // Medium confidence for different types but same text
    }

    return score;
  }

  /**
   * Normalize locator for comparison
   */
  private normalizeLocator(locator: string): string {
    return locator
      .toLowerCase()
      .replace(/['"]/g, '')
      .replace(/\s*=\s*/g, '=')  // Normalize spaces around equals
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Extract text content from locator
   */
  private extractTextFromLocator(locator: string): string | null {
    // Extract from data-testid
    const testIdMatch = locator.match(/data-testid=['"]([^'"]+)['"]/);
    if (testIdMatch) return testIdMatch[1];
    
    // Extract from placeholder
    const placeholderMatch = locator.match(/placeholder=['"]([^'"]+)['"]/);
    if (placeholderMatch) return placeholderMatch[1];
    
    // Extract from aria-label
    const ariaMatch = locator.match(/aria-label=['"]([^'"]+)['"]/);
    if (ariaMatch) return ariaMatch[1];
    
    // Extract from button text
    const buttonMatch = locator.match(/button=(.+)/);
    if (buttonMatch) return buttonMatch[1];
    
    // Extract from text locator
    const textMatch = locator.match(/text=(.+)/);
    if (textMatch) return textMatch[1];
    
    return null;
  }

  /**
   * Detect framework from file content
   */
  private detectFramework(content: string): string {
    // Import-based detection (most reliable)
    if (content.includes('@playwright/test') || content.includes('playwright')) return 'playwright';
    if (content.includes('webdriverio') || content.includes('@wdio')) return 'webdriverio';
    if (content.includes('cypress')) return 'cypress';
    if (content.includes('selenium-webdriver')) return 'selenium';
    
    // Pattern-based detection
    if (content.includes('getByRole') || content.includes('getByTestId') || content.includes('getByText')) return 'playwright';
    if (content.includes('get ') && content.includes('$')) return 'webdriverio';
    if (content.includes('browser.') && content.includes('$')) return 'webdriverio';
    if (content.includes('cy.get') || content.includes('cy.visit')) return 'cypress';
    
    // Default to playwright for test files with common patterns
    if (content.includes('Page') && content.includes('Locator')) return 'playwright';
    if (content.includes('test(') || content.includes('describe(')) return 'playwright';
    
    return 'playwright'; // Default fallback
  }

  /**
   * Extract page name from class name
   */
  private extractPageNameFromClassName(className: string): string {
    // Remove "Page" suffix and normalize
    const pageName = className.replace(/Page$/, '').toLowerCase();
    
    // Handle common variations
    const pageNameMap: { [key: string]: string } = {
      'test': 'test',
      'login': 'login', 
      'home': 'home',
      'product': 'product',
      'checkout': 'checkout',
      'testfile': 'unknown' // For test files without specific page
    };
    
    return pageNameMap[pageName] || pageName;
  }

  /**
   * Extract page name from scanned element page name
   */
  private normalizeScannedPageName(pageName: string): string {
    return pageName.toLowerCase();
  }

  /**
   * Find files recursively
   */
  private findFilesRecursively(dir: string, extensions: string[]): string[] {
    const files: string[] = [];
    
    if (!fs.existsSync(dir)) return files;

    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...this.findFilesRecursively(fullPath, extensions));
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  /**
   * Generate match summary
   */
  generateMatchSummary(matches: ElementMatch[]): {
    total: number;
    exact: number;
    similar: number;
    none: number;
    coverage: number;
  } {
    const total = matches.length;
    const exact = matches.filter(m => m.matchType === 'exact').length;
    const similar = matches.filter(m => m.matchType === 'similar').length;
    const none = matches.filter(m => m.matchType === 'none').length;
    const coverage = total > 0 ? ((exact + similar) / total) * 100 : 0;

    return { total, exact, similar, none, coverage };
  }
}
