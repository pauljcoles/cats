/**
 * Page Object Generators
 * 
 * Generates clean page object classes for different automation frameworks
 */

import { PageInfo, InteractiveElement } from './page-scanner';
import * as fs from 'fs';
import * as path from 'path';

export type Framework = 'playwright' | 'cypress' | 'selenium' | 'puppeteer' | 'webdriverio';
export type Language = 'javascript' | 'typescript' | 'python';

export interface GeneratorOptions {
  framework: Framework;
  language: Language;
  outputDir: string;
  baseClass?: string;
}

export class PageObjectGenerator {
  
  async generatePageObjects(pages: PageInfo[], options: GeneratorOptions): Promise<void> {
    console.log(`🏗️  Generating ${options.framework} page objects in ${options.language}...`);

    // Ensure output directory exists
    fs.mkdirSync(options.outputDir, { recursive: true });

    for (const page of pages) {
      const filename = this.getFileName(page.name, options.language);
      const filePath = path.join(options.outputDir, filename);
      const code = this.generatePageObjectCode(page, options);
      
      fs.writeFileSync(filePath, code);
      console.log(`   ✅ ${filename} (${page.elements.length} elements)`);
    }

    // Generate index file
    await this.generateIndexFile(pages, options);
    
    console.log(`\n🎉 Generated ${pages.length} page objects in ${options.outputDir}`);
  }

  private generatePageObjectCode(page: PageInfo, options: GeneratorOptions): string {
    switch (options.language) {
      case 'typescript':
        return this.generateTypeScriptPageObject(page, options);
      case 'javascript':
        return this.generateJavaScriptPageObject(page, options);
      case 'python':
        return this.generatePythonPageObject(page, options);
      default:
        throw new Error(`Unsupported language: ${options.language}`);
    }
  }

  private generateTypeScriptPageObject(page: PageInfo, options: GeneratorOptions): string {
    const className = `${page.name}Page`;
    const importStatement = this.getImportStatement(options.framework, 'typescript');
    const baseClassDeclaration = this.getBaseClassDeclaration(options.framework, 'typescript');
    
    if (options.framework === 'webdriverio') {
      return this.generateWdioTypeScriptPageObject(page);
    }
    
    const selectors = page.elements
      .map(el => `  ${el.name}: '${el.locator}', // ${el.tagName} - ${el.locatorType} (confidence: ${el.confidence}/10)`)
      .join('\n');

    const methods = this.generateHelperMethods(page, options);

    return `${importStatement}

/**
 * ${className} - Generated Page Object
 * File: ${page.filePath}
 * ${page.route ? `Route: ${page.route}` : ''}
 * Interactive Elements: ${page.elements.length}
 */
export class ${className}${baseClassDeclaration} {
  
  // Selectors for interactive elements
  selectors = {
${selectors}
  };

${methods}
}`;
  }

  private generateJavaScriptPageObject(page: PageInfo, options: GeneratorOptions): string {
    const className = `${page.name}Page`;
    const requireStatement = this.getRequireStatement(options.framework);
    
    if (options.framework === 'webdriverio') {
      return this.generateWdioJavaScriptPageObject(page);
    }
    
    const selectors = page.elements
      .map(el => `    ${el.name}: '${el.locator}', // ${el.tagName} - ${el.locatorType} (confidence: ${el.confidence}/10)`)
      .join('\n');

    const methods = this.generateHelperMethods(page, options);

    return `${requireStatement}

/**
 * ${className} - Generated Page Object
 * File: ${page.filePath}
 * ${page.route ? `Route: ${page.route}` : ''}
 * Interactive Elements: ${page.elements.length}
 */
class ${className} {
  constructor(page) {
    this.page = page;
  }

  // Selectors for interactive elements
  selectors = {
${selectors}
  };

${methods}
}

module.exports = ${className};`;
  }

  private generateWdioJavaScriptPageObject(page: PageInfo): string {
    const className = `${page.name}Page`;
    
    // Generate WDIO getters
    const getters = page.elements
      .map(el => `  /**
   * Get ${el.name} element
   * ${el.tagName} - ${el.locatorType} (confidence: ${el.confidence}/10)
   */
  get ${el.name}() {
    return $('${el.locator}');
  }`)
      .join('\n\n');

    // Generate action methods for high-confidence elements
    const actionMethods: string[] = [];
    const highConfidenceElements = page.elements.filter(el => el.confidence >= 8);
    
    highConfidenceElements.forEach(element => {
      if (element.tagName === 'button') {
        actionMethods.push(`  /**
   * Click ${element.name}
   */
  async click${this.capitalize(element.name)}() {
    await this.${element.name}.click();
  }`);
      } else if (element.tagName === 'input') {
        actionMethods.push(`  /**
   * Set value for ${element.name}
   */
  async set${this.capitalize(element.name)}(value) {
    await this.${element.name}.setValue(value);
  }`);
      } else if (element.tagName === 'select') {
        actionMethods.push(`  /**
   * Select option in ${element.name}
   */
  async select${this.capitalize(element.name)}(value) {
    await this.${element.name}.selectByAttribute('value', value);
  }`);
      }
    });

    const navigationMethod = page.route ? `  /**
   * Navigate to ${page.name} page
   */
  async open() {
    await browser.url('${page.route}');
    await this.waitForLoad();
  }

  /**
   * Wait for page to load
   */
  async waitForLoad() {
    // Add page-specific wait logic here
    await browser.waitUntil(
      async () => {
        // Example: wait for a key element to be displayed
        // return await this.someKeyElement.isDisplayed();
        return true;
      },
      {
        timeout: 10000,
        timeoutMsg: '${page.name} page did not load within 10 seconds'
      }
    );
  }` : `  /**
   * Wait for page to load
   */
  async waitForLoad() {
    // Add page-specific wait logic here
  }`;

    return `/**
 * ${className} - Generated WDIO Page Object
 * File: ${page.filePath}
 * ${page.route ? `Route: ${page.route}` : ''}
 * Interactive Elements: ${page.elements.length}
 */
class ${className} {

${getters}

${navigationMethod}

${actionMethods.join('\n\n')}
}

module.exports = ${className};`;
  }

  private generatePythonPageObject(page: PageInfo, options: GeneratorOptions): string {
    const className = `${page.name}Page`;
    const importStatement = this.getPythonImportStatement(options.framework);
    
    const selectors = page.elements
      .map(el => `        "${el.name}": "${el.locator}",  # ${el.tagName} - ${el.locatorType} (confidence: ${el.confidence}/10)`)
      .join('\n');

    const methods = this.generatePythonHelperMethods(page, options);

    return `${importStatement}

class ${className}:
    """
    ${className} - Generated Page Object
    File: ${page.filePath}
    ${page.route ? `Route: ${page.route}` : ''}
    Interactive Elements: ${page.elements.length}
    """
    
    def __init__(self, page):
        self.page = page
    
    # Selectors for interactive elements
    selectors = {
${selectors}
    }

${methods}`;
  }

  private generateHelperMethods(page: PageInfo, options: GeneratorOptions): string {
    const elements = page.elements;
    const methods: string[] = [];

    // Add framework-specific navigation method
    if (page.route) {
      methods.push(this.generateNavigationMethod(page.route, options));
    }

    // Generate methods for high-confidence elements
    const highConfidenceElements = elements.filter(el => el.confidence >= 8);
    
    highConfidenceElements.forEach(element => {
      if (element.tagName === 'button') {
        methods.push(this.generateClickMethod(element, options));
      } else if (element.tagName === 'input') {
        methods.push(this.generateInputMethod(element, options));
      } else if (element.tagName === 'select') {
        methods.push(this.generateSelectMethod(element, options));
      }
    });

    return methods.join('\n\n');
  }

  private generateWdioTypeScriptPageObject(page: PageInfo): string {
    const className = `${page.name}Page`;
    
    // Generate WDIO getters
    const getters = page.elements
      .map(el => `  /**
   * Get ${el.name} element
   * ${el.tagName} - ${el.locatorType} (confidence: ${el.confidence}/10)
   */
  get ${el.name}() {
    return $('${el.locator}');
  }`)
      .join('\n\n');

    // Generate action methods for high-confidence elements
    const actionMethods: string[] = [];
    const highConfidenceElements = page.elements.filter(el => el.confidence >= 8);
    
    highConfidenceElements.forEach(element => {
      if (element.tagName === 'button') {
        actionMethods.push(`  /**
   * Click ${element.name}
   */
  async click${this.capitalize(element.name)}() {
    await this.${element.name}.click();
  }`);
      } else if (element.tagName === 'input') {
        actionMethods.push(`  /**
   * Set value for ${element.name}
   */
  async set${this.capitalize(element.name)}(value: string) {
    await this.${element.name}.setValue(value);
  }`);
      } else if (element.tagName === 'select') {
        actionMethods.push(`  /**
   * Select option in ${element.name}
   */
  async select${this.capitalize(element.name)}(value: string) {
    await this.${element.name}.selectByAttribute('value', value);
  }`);
      }
    });

    const navigationMethod = page.route ? `  /**
   * Navigate to ${page.name} page
   */
  async open() {
    await browser.url('${page.route}');
    await this.waitForLoad();
  }

  /**
   * Wait for page to load
   */
  async waitForLoad() {
    // Add page-specific wait logic here
    await browser.waitUntil(
      async () => {
        // Example: wait for a key element to be displayed
        // return await this.someKeyElement.isDisplayed();
        return true;
      },
      {
        timeout: 10000,
        timeoutMsg: '${page.name} page did not load within 10 seconds'
      }
    );
  }` : `  /**
   * Wait for page to load
   */
  async waitForLoad() {
    // Add page-specific wait logic here
  }`;

    return `/**
 * ${className} - Generated WDIO Page Object
 * File: ${page.filePath}
 * ${page.route ? `Route: ${page.route}` : ''}
 * Interactive Elements: ${page.elements.length}
 */
export class ${className} {

${getters}

${navigationMethod}

${actionMethods.join('\n\n')}
}`;
  }

  private generateNavigationMethod(route: string, options: GeneratorOptions): string {
    switch (options.framework) {
      case 'playwright':
        return `  async navigateTo(): Promise<void> {
    await this.page.goto('${route}');
    await this.waitForLoad();
  }`;
      case 'cypress':
        return `  navigateTo() {
    cy.visit('${route}');
    this.waitForLoad();
  }`;
      case 'selenium':
        return `  async navigateTo(): Promise<void> {
    await this.page.get('${route}');
    await this.waitForLoad();
  }`;
      case 'puppeteer':
        return `  async navigateTo(): Promise<void> {
    await this.page.goto('${route}');
    await this.waitForLoad();
  }`;
      case 'webdriverio':
        return `  async open(): Promise<void> {
    await browser.url('${route}');
    await this.waitForLoad();
  }`;
      default:
        return `  // Navigation method not implemented for ${options.framework}`;
    }
  }

  private generateClickMethod(element: InteractiveElement, options: GeneratorOptions): string {
    const methodName = `click${this.capitalize(element.name)}`;
    const selector = element.locator;

    switch (options.framework) {
      case 'playwright':
        return `  async ${methodName}(): Promise<void> {
    await this.page.locator('${selector}').click();
  }`;
      case 'cypress':
        return `  ${methodName}() {
    cy.get('${selector}').click();
  }`;
      case 'selenium':
        return `  async ${methodName}(): Promise<void> {
    const element = await this.page.findElement(By.css('${selector}'));
    await element.click();
  }`;
      case 'puppeteer':
        return `  async ${methodName}(): Promise<void> {
    await this.page.click('${selector}');
  }`;
      default:
        return `  // Click method not implemented for ${options.framework}`;
    }
  }

  private generateInputMethod(element: InteractiveElement, options: GeneratorOptions): string {
    const methodName = `fill${this.capitalize(element.name)}`;
    const selector = element.locator;

    switch (options.framework) {
      case 'playwright':
        return `  async ${methodName}(text: string): Promise<void> {
    await this.page.locator('${selector}').fill(text);
  }`;
      case 'cypress':
        return `  ${methodName}(text) {
    cy.get('${selector}').type(text);
  }`;
      case 'selenium':
        return `  async ${methodName}(text: string): Promise<void> {
    const element = await this.page.findElement(By.css('${selector}'));
    await element.sendKeys(text);
  }`;
      case 'puppeteer':
        return `  async ${methodName}(text: string): Promise<void> {
    await this.page.type('${selector}', text);
  }`;
      default:
        return `  // Input method not implemented for ${options.framework}`;
    }
  }

  private generateSelectMethod(element: InteractiveElement, options: GeneratorOptions): string {
    const methodName = `select${this.capitalize(element.name)}`;
    const selector = element.locator;

    switch (options.framework) {
      case 'playwright':
        return `  async ${methodName}(value: string): Promise<void> {
    await this.page.locator('${selector}').selectOption(value);
  }`;
      case 'cypress':
        return `  ${methodName}(value) {
    cy.get('${selector}').select(value);
  }`;
      case 'selenium':
        return `  async ${methodName}(value: string): Promise<void> {
    const element = await this.page.findElement(By.css('${selector}'));
    const select = new Select(element);
    await select.selectByValue(value);
  }`;
      case 'puppeteer':
        return `  async ${methodName}(value: string): Promise<void> {
    await this.page.select('${selector}', value);
  }`;
      default:
        return `  // Select method not implemented for ${options.framework}`;
    }
  }

  private generatePythonHelperMethods(page: PageInfo, options: GeneratorOptions): string {
    const methods: string[] = [];

    if (page.route) {
      methods.push(`    def navigate_to(self):
        """Navigate to ${page.route}"""
        self.page.get("${page.route}")
        self.wait_for_load()`);
    }

    // Generate Python methods for elements
    const highConfidenceElements = page.elements.filter(el => el.confidence >= 8);
    
    highConfidenceElements.forEach(element => {
      if (element.tagName === 'button') {
        methods.push(`    def click_${element.name}(self):
        """Click ${element.name} button"""
        self.page.find_element(By.CSS_SELECTOR, "${element.locator}").click()`);
      } else if (element.tagName === 'input') {
        methods.push(`    def fill_${element.name}(self, text):
        """Fill ${element.name} input with text"""
        element = self.page.find_element(By.CSS_SELECTOR, "${element.locator}")
        element.clear()
        element.send_keys(text)`);
      }
    });

    methods.push(`    def wait_for_load(self):
        """Wait for page to load - customize as needed"""
        # Add your page-specific wait logic here
        pass`);

    return methods.join('\n\n');
  }

  private generateIndexFile(pages: PageInfo[], options: GeneratorOptions): void {
    const extension = options.language === 'python' ? '.py' : (options.language === 'typescript' ? '.ts' : '.js');
    const indexFileName = `index${extension}`;
    const indexPath = path.join(options.outputDir, indexFileName);

    let indexContent = '';

    if (options.language === 'python') {
      const imports = pages.map(page => `from .${page.name.toLowerCase()}_page import ${page.name}Page`).join('\n');
      const exports = pages.map(page => `    "${page.name}Page": ${page.name}Page,`).join('\n');
      
      indexContent = `"""Generated Page Objects Index"""
${imports}

__all__ = {
${exports}
}`;
    } else if (options.language === 'typescript') {
      const imports = pages.map(page => `export { ${page.name}Page } from './${page.name}Page';`).join('\n');
      indexContent = `// Generated Page Objects Index\n${imports}`;
    } else {
      const requires = pages.map(page => `  ${page.name}Page: require('./${page.name}Page'),`).join('\n');
      indexContent = `// Generated Page Objects Index
module.exports = {
${requires}
};`;
    }

    fs.writeFileSync(indexPath, indexContent);
    console.log(`   ✅ ${indexFileName} (index file)`);
  }

  // Helper methods
  private getFileName(pageName: string, language: Language): string {
    const extension = language === 'python' ? '.py' : (language === 'typescript' ? '.ts' : '.js');
    const fileName = language === 'python' ? `${pageName.toLowerCase()}_page` : `${pageName}Page`;
    return `${fileName}${extension}`;
  }

  private getImportStatement(framework: Framework, language: Language): string {
    switch (framework) {
      case 'playwright':
        return `import { Page } from '@playwright/test';`;
      case 'cypress':
        return `/// <reference types="cypress" />`;
      case 'selenium':
        return `import { WebDriver, By } from 'selenium-webdriver';`;
      case 'puppeteer':
        return `import { Page } from 'puppeteer';`;
      default:
        return '';
    }
  }

  private getRequireStatement(framework: Framework): string {
    switch (framework) {
      case 'selenium':
        return `const { By } = require('selenium-webdriver');`;
      default:
        return '';
    }
  }

  private getPythonImportStatement(framework: Framework): string {
    switch (framework) {
      case 'selenium':
        return `from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select`;
      default:
        return '';
    }
  }

  private getBaseClassDeclaration(framework: Framework, language: Language): string {
    switch (framework) {
      case 'playwright':
        return ' {\n  constructor(private page: Page) {}';
      case 'cypress':
        return ' {';
      case 'selenium':
        return ' {\n  constructor(private page: WebDriver) {}';
      case 'puppeteer':
        return ' {\n  constructor(private page: Page) {}';
      default:
        return ' {\n  constructor(page: any) {\n    this.page = page;\n  }';
    }
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}