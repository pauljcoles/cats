#!/usr/bin/env ts-node

/**
 * Page Scanner CLI
 * 
 * Simple command-line interface for scanning codebases and generating page objects
 */

import * as fs from 'fs';
import * as path from 'path';
import { PageScanner } from './page-scanner';
import { PageObjectGenerator, Framework, Language } from './page-object-generator';

interface CLIOptions {
  scan?: string;           // Directory to scan
  framework?: Framework;   // Target framework
  language?: Language;     // Output language
  output?: string;         // Output directory
  help?: boolean;         // Show help
}

class PageScannerCLI {
  
  async run(args: string[]): Promise<void> {
    const options = this.parseArgs(args);

    if (options.help || args.length === 0) {
      this.showHelp();
      return;
    }

    if (!options.scan) {
      console.error('❌ Please specify a directory to scan with --scan');
      process.exit(1);
    }

    try {
      await this.executeCommand(options);
    } catch (error) {
      console.error('❌ Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  }

  private async executeCommand(options: CLIOptions): Promise<void> {
    console.log('🚀 Page Scanner - Interactive Element Finder\n');

    // Scan for pages and elements
    console.log(`📂 Scanning: ${options.scan}`);
    const scanner = new PageScanner();
    const result = await scanner.scanDirectory(options.scan!);

    if (result.pages.length === 0) {
      console.log('ℹ️  No interactive elements found. Make sure you\'re scanning a React/Vue project with page components.');
      return;
    }

    // Display results
    this.displayResults(result);

    // Generate page objects if requested
    if (options.framework && options.output) {
      console.log('\n🏗️  Generating Page Objects...\n');
      
      const generator = new PageObjectGenerator();
      await generator.generatePageObjects(result.pages, {
        framework: options.framework,
        language: options.language || 'typescript',
        outputDir: options.output
      });

      console.log(`\n✅ Page objects generated in ${options.output}`);
      this.showNextSteps(options.framework, options.language || 'typescript');
    } else {
      this.showGenerationOptions();
    }
  }

  private displayResults(result: any): void {
    console.log('\n📄 INTERACTIVE PAGES FOUND:\n');
    
    result.pages.forEach((page: any, index: number) => {
      const priority = page.elements.length > 10 ? '🔥' : page.elements.length > 5 ? '⭐' : '📄';
      
      console.log(`${priority} ${page.name}`);
      console.log(`   📁 ${this.shortenPath(page.filePath)}`);
      if (page.route) {
        console.log(`   🌐 ${page.route}`);
      }
      console.log(`   🎯 ${page.elements.length} interactive elements:\n`);
      
      // Group elements by type for cleaner display
      const elementsByType: Record<string, any[]> = {};
      page.elements.forEach((el: any) => {
        if (!elementsByType[el.tagName]) elementsByType[el.tagName] = [];
        elementsByType[el.tagName].push(el);
      });

      Object.entries(elementsByType).forEach(([tagName, elements]) => {
        console.log(`      ${this.getElementIcon(tagName)} ${tagName} (${elements.length})`);
        elements.slice(0, 3).forEach((el: any) => {
          const confidence = '★'.repeat(Math.ceil(el.confidence / 2));
          console.log(`         • ${el.name} → ${this.shortenLocator(el.locator)} ${confidence}`);
        });
        if (elements.length > 3) {
          console.log(`         ... and ${elements.length - 3} more`);
        }
      });
      
      console.log('');
    });

    console.log('📊 SUMMARY:');
    console.log(`   📄 Pages: ${result.summary.totalPages}`);
    console.log(`   🎯 Interactive Elements: ${result.summary.totalElements}`);
    
    const topElements = Object.entries(result.summary.elementsByType)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3);
    
    console.log('   🏆 Top Elements:', topElements.map(([type, count]) => `${type}(${count})`).join(', '));
  }

  private showGenerationOptions(): void {
    console.log('\n🏗️  GENERATE PAGE OBJECTS:');
    console.log('\nTo generate page objects, run again with framework options:');
    console.log('');
    console.log('  # Playwright + TypeScript');
    console.log('  npx ts-node cli.ts --scan ./src --framework playwright --language typescript --output ./page-objects');
    console.log('');
    console.log('  # Cypress + JavaScript');
    console.log('  npx ts-node cli.ts --scan ./src --framework cypress --language javascript --output ./cypress/pages');
    console.log('');
    console.log('  # Selenium + Python');
    console.log('  npx ts-node cli.ts --scan ./src --framework selenium --language python --output ./pages');
    console.log('');
    console.log('  # WebDriverIO + TypeScript');
    console.log('  npx ts-node cli.ts --scan ./src --framework webdriverio --language typescript --output ./wdio-pages');
    console.log('');
    console.log('Supported frameworks: playwright, cypress, selenium, puppeteer, webdriverio');
    console.log('Supported languages: typescript, javascript, python');
  }

  private showNextSteps(framework: Framework, language: Language): void {
    console.log('\n🎯 NEXT STEPS:\n');
    
    switch (framework) {
      case 'playwright':
        console.log('1. Install Playwright: npm install @playwright/test');
        console.log('2. Import your page objects:');
        console.log(`   import { SingleProductPage } from './page-objects/SingleProductPage';`);
        console.log('3. Use in tests:');
        console.log(`   const singleProductPage = new SingleProductPage(page);`);
        console.log(`   await singleProductPage.navigateTo();`);
        break;
      
      case 'cypress':
        console.log('1. Install Cypress: npm install cypress --save-dev');
        console.log('2. Import your page objects in test files:');
        console.log(`   const SingleProductPage = require('../pages/SingleProductPage');`);
        console.log('3. Use in tests:');
        console.log(`   const singleProductPage = new SingleProductPage();`);
        console.log(`   singleProductPage.navigateTo();`);
        break;
      
      case 'selenium':
        if (language === 'python') {
          console.log('1. Install Selenium: pip install selenium');
          console.log('2. Import your page objects:');
          console.log(`   from pages.singleproduct_page import SingleProductPage`);
          console.log('3. Use in tests:');
          console.log(`   single_product_page = SingleProductPage(driver)`);
          console.log(`   single_product_page.navigate_to()`);
        } else {
          console.log('1. Install Selenium: npm install selenium-webdriver');
          console.log('2. Import your page objects:');
          console.log(`   const SingleProductPage = require('./pages/SingleProductPage');`);
          console.log('3. Use in tests:');
          console.log(`   const singleProductPage = new SingleProductPage(driver);`);
        }
        break;

      case 'webdriverio':
        console.log('1. Install WebDriverIO: npm install @wdio/cli --save-dev');
        console.log('2. Import your page objects:');
        if (language === 'typescript') {
          console.log(`   import { SingleProductPage } from './wdio-pages/SingleProductPage';`);
        } else {
          console.log(`   const SingleProductPage = require('./wdio-pages/SingleProductPage');`);
        }
        console.log('3. Use in tests:');
        console.log(`   const singleProductPage = new SingleProductPage();`);
        console.log(`   await singleProductPage.open();`);
        console.log(`   await singleProductPage.clickButton_add_to_cart();`);
        break;
    }
    
    console.log('\n💡 TIP: Review generated page objects and customize wait/verification methods for your specific needs.');
  }

  private parseArgs(args: string[]): CLIOptions {
    const options: CLIOptions = {};
    
    for (let i = 0; i < args.length; i++) {
      switch (args[i]) {
        case '--scan':
        case '-s':
          options.scan = args[++i];
          break;
        case '--framework':
        case '-f':
          options.framework = args[++i] as Framework;
          break;
        case '--language':
        case '-l':
          options.language = args[++i] as Language;
          break;
        case '--output':
        case '-o':
          options.output = args[++i];
          break;
        case '--help':
        case '-h':
          options.help = true;
          break;
      }
    }

    return options;
  }

  private showHelp(): void {
    console.log(`
🚀 Page Scanner - Interactive Element Finder for Test Automation

USAGE:
  npx ts-node cli.ts --scan <directory> [options]

OPTIONS:
  --scan, -s <dir>        Directory to scan for page components
  --framework, -f <name>  Target framework (playwright|cypress|selenium|puppeteer|webdriverio)
  --language, -l <lang>   Output language (typescript|javascript|python)
  --output, -o <dir>      Output directory for page objects
  --help, -h              Show this help

EXAMPLES:
  # Just scan and analyze
  npx ts-node cli.ts --scan ./src/pages

  # Scan and generate Playwright page objects
  npx ts-node cli.ts --scan ./src --framework playwright --language typescript --output ./page-objects

  # Generate Cypress page objects in JavaScript
  npx ts-node cli.ts --scan ./src --framework cypress --language javascript --output ./cypress/pages

  # Generate Selenium page objects in Python
  npx ts-node cli.ts --scan ./src --framework selenium --language python --output ./pages

FEATURES:
  ✅ Scans React/Vue codebases for page components
  ✅ Finds interactive elements (buttons, inputs, selects, forms)
  ✅ Generates smart locators with confidence scoring
  ✅ Creates page objects for multiple frameworks
  ✅ Supports TypeScript, JavaScript, and Python
  ✅ Clean, noise-free output focused on automation

For more examples: https://github.com/your-repo/page-scanner
`);
  }

  // Helper methods for display
  private shortenPath(filePath: string): string {
    const parts = filePath.split('/');
    if (parts.length <= 4) return filePath;
    return '.../' + parts.slice(-3).join('/');
  }

  private shortenLocator(locator: string): string {
    if (locator.length <= 40) return locator;
    return locator.substring(0, 37) + '...';
  }

  private getElementIcon(tagName: string): string {
    switch (tagName) {
      case 'button': return '🔘';
      case 'input': return '📝';
      case 'select': return '📋';
      case 'form': return '📄';
      case 'a': return '🔗';
      case 'textarea': return '📝';
      default: return '🎯';
    }
  }
}

// Run CLI if called directly
if (require.main === module) {
  const cli = new PageScannerCLI();
  cli.run(process.argv.slice(2));
}

export { PageScannerCLI };