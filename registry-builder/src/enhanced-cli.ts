#!/usr/bin/env ts-node

/**
 * Enhanced CLI with Match-Based Analysis
 * Shows existing page objects as "matches" not "duplicates"
 */

import * as fs from 'fs';
import * as path from 'path';
import { PageScanner } from './page-scanner';
import { PageObjectGenerator, Framework, Language } from './page-object-generator';

interface CLIOptions {
  scan?: string;
  framework?: Framework;
  language?: Language;
  output?: string;
  tests?: string;
  registry?: boolean;
  help?: boolean;
}

class MatchBasedCLI {
  async run(): Promise<void> {
    const args = process.argv.slice(2);
    const options = this.parseArgs(args);

    if (options.help || !options.scan) {
      this.showHelp();
      return;
    }

    console.log('🚀 Enhanced Page Scanner - Match-Based Analysis\n');

    // Scan for interactive elements
    const scanner = new PageScanner();
    const result = await scanner.scanDirectory(options.scan);

    if (result.pages.length === 0) {
      console.log('❌ No interactive elements found');
      return;
    }

    console.log(`📂 Scanning: ${options.scan}`);
    console.log(`✅ Found ${result.pages.length} pages with ${result.pages.reduce((sum, p) => sum + p.elements.length, 0)} interactive elements\n`);

    // Show found elements
    for (const page of result.pages) {
      console.log(`📄 ${page.name} (${page.route || 'no route'})`);
      for (const element of page.elements.slice(0, 5)) {
        console.log(`   ${element.tagName}   ${element.name}   ${'★'.repeat(Math.floor(element.confidence / 2))} ${element.locator}`);
      }
      if (page.elements.length > 5) {
        console.log(`   ... and ${page.elements.length - 5} more`);
      }
    }

    // Generate page objects if framework specified
    if (options.framework) {
      const outputDir = options.output || path.join(options.scan, 'scan-results', 'page-objects');
      const generator = new PageObjectGenerator();
      
      await generator.generatePageObjects(result.pages, {
        framework: options.framework,
        language: options.language || 'typescript',
        outputDir
      });

      console.log(`\n✅ ${options.framework} page objects generated in ${outputDir}`);

      // Enhanced analysis if tests directory provided
      if (options.tests && options.registry) {
        console.log('\n📊 Analyzing matches between generated and existing...');
        await this.generateMatchBasedRegistry(options.scan, result, options.tests, options.framework, outputDir);
      }
    }
  }

  private async generateMatchBasedRegistry(scanDir: string, scanResult: any, testsDir: string, framework: Framework, outputDir: string): Promise<void> {
    const registryDir = path.join(path.dirname(outputDir), 'registry-output');
    fs.mkdirSync(registryDir, { recursive: true });

    // Detect existing page objects and tests
    const existingPageObjects = await this.detectExistingPageObjects(testsDir);
    const testFiles = await this.detectTestFiles(testsDir);

    console.log(`   📄 Found ${existingPageObjects.length} existing page objects`);
    console.log(`   🧪 Found ${testFiles.length} test files`);

    // Analyze matches
    const matches = this.analyzeMatches(scanResult, existingPageObjects, testFiles);
    
    console.log(`   🎯 Found ${matches.exactMatches} exact matches`);
    console.log(`   🔗 Found ${matches.potentialMatches} potential matches`);

    // Generate match-based HTML viewer
    await this.generateMatchBasedHtmlViewer(registryDir, {
      scanResult,
      existingPageObjects,
      testFiles,
      matches,
      framework,
      generatedAt: new Date().toISOString()
    });

    console.log(`   🌐 Match analysis: ${path.join(registryDir, 'match-analysis.html')}`);
  }

  private analyzeMatches(scanResult: any, existingPageObjects: any[], testFiles: any[]) {
    let exactMatches = 0;
    let potentialMatches = 0;

    // Check for exact name matches between generated and existing page objects
    for (const page of scanResult.pages) {
      const pageName = page.name.toLowerCase();
      
      // Exact match: same page name
      const exactMatch = existingPageObjects.find(po => 
        po.name.toLowerCase().includes(pageName) || pageName.includes(po.name.toLowerCase())
      );
      
      if (exactMatch) {
        exactMatches++;
      } else {
        // Potential match: similar elements or test usage
        const potentialMatch = testFiles.find(tf => 
          tf.name.toLowerCase().includes(pageName) || 
          tf.pageObjectImports?.some((imp: string) => imp.toLowerCase().includes(pageName))
        );
        
        if (potentialMatch) {
          potentialMatches++;
        }
      }
    }

    return { exactMatches, potentialMatches };
  }

  private async generateMatchBasedHtmlViewer(outputDir: string, data: any): Promise<void> {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Match Analysis - ${data.framework}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1400px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 2.5em; font-weight: 300; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; font-size: 1.1em; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; padding: 30px; background: #f8f9fa; }
        .stat-card { background: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .stat-number { font-size: 2.5em; font-weight: bold; color: #28a745; margin-bottom: 5px; }
        .stat-label { color: #666; font-size: 0.9em; text-transform: uppercase; letter-spacing: 1px; }
        .content { padding: 30px; }
        .section { margin-bottom: 40px; }
        .section h2 { color: #333; border-bottom: 2px solid #28a745; padding-bottom: 10px; margin-bottom: 20px; }
        .match-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 20px; }
        .match-card { border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; background: white; transition: transform 0.2s, box-shadow 0.2s; }
        .match-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .match-type { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 0.8em; font-weight: bold; text-transform: uppercase; margin-bottom: 10px; }
        .exact-match { background: #d4edda; color: #155724; }
        .potential-match { background: #fff3cd; color: #856404; }
        .no-match { background: #f8d7da; color: #721c24; }
        .generated-only { background: #cce5ff; color: #004085; }
        .match-title { font-size: 1.2em; font-weight: bold; color: #333; margin-bottom: 8px; }
        .match-details { font-size: 0.9em; color: #555; margin-bottom: 10px; }
        .element-count { background: #e9ecef; padding: 4px 8px; border-radius: 4px; font-size: 0.8em; margin: 2px; display: inline-block; }
        .framework-badge { background: #6f42c1; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.8em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Match Analysis</h1>
            <p>Framework: ${data.framework} | Generated: ${new Date(data.generatedAt).toLocaleString()}</p>
        </div>

        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">${data.scanResult.pages.reduce((sum: number, p: any) => sum + p.elements.length, 0)}</div>
                <div class="stat-label">Scanned Elements</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${data.scanResult.pages.length}</div>
                <div class="stat-label">Generated Objects</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${data.existingPageObjects.length}</div>
                <div class="stat-label">Existing Objects</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${data.matches.exactMatches}</div>
                <div class="stat-label">Exact Matches</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${data.matches.potentialMatches}</div>
                <div class="stat-label">Potential Matches</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${data.testFiles.length}</div>
                <div class="stat-label">Test Files</div>
            </div>
        </div>

        <div class="content">
            <div class="section">
                <h2>📊 Match Analysis Results</h2>
                <div class="match-grid" id="matchGrid">
                    ${this.generateMatchCards(data)}
                </div>
            </div>

            <div class="section">
                <h2>📄 All Existing Page Objects</h2>
                <div class="match-grid">
                    ${data.existingPageObjects.map((po: any) => `
                        <div class="match-card">
                            <div class="match-type exact-match">📄 Page Object</div>
                            <div class="match-title">${po.className}</div>
                            <div class="match-details">
                                <span class="framework-badge">${po.framework}</span>
                                <span class="element-count">${po.methods.length} methods</span>
                            </div>
                            <div style="font-size: 0.8em; color: #666; margin-top: 8px;">
                                📁 ${po.filePath}<br>
                                🔧 Methods: ${po.methods.slice(0, 3).join(', ')}${po.methods.length > 3 ? ` +${po.methods.length - 3} more` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="section">
                <h2>🧪 All Test Files</h2>
                <div class="match-grid">
                    ${data.testFiles.map((tf: any) => `
                        <div class="match-card">
                            <div class="match-type potential-match">🧪 Test File</div>
                            <div class="match-title">${tf.name}</div>
                            <div class="match-details">
                                <span class="framework-badge">${tf.framework}</span>
                                <span class="element-count">${tf.testCount} tests</span>
                            </div>
                            <div style="font-size: 0.8em; color: #666; margin-top: 8px;">
                                📁 ${tf.filePath}<br>
                                ${tf.pageObjectImports && tf.pageObjectImports.length > 0 ? 
                                  `📦 Imports: ${tf.pageObjectImports.join(', ')}` : 
                                  '📦 No page object imports detected'}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;

    const htmlFile = path.join(outputDir, 'match-analysis.html');
    fs.writeFileSync(htmlFile, htmlContent);
  }

  private generateMatchCards(data: any): string {
    return data.scanResult.pages.map((page: any) => {
      const pageName = page.name.toLowerCase();
      
      // Check for exact match
      const exactMatch = data.existingPageObjects.find((po: any) => 
        po.name.toLowerCase().includes(pageName) || pageName.includes(po.name.toLowerCase())
      );
      
      if (exactMatch) {
        return `
          <div class="match-card">
            <div class="match-type exact-match">✅ Exact Match</div>
            <div class="match-title">${page.name}</div>
            <div class="match-details">
              Generated: <span class="element-count">${page.elements.length} elements</span><br>
              Existing: <strong>${exactMatch.name}</strong> <span class="framework-badge">${exactMatch.framework}</span>
            </div>
            <div style="font-size: 0.8em; color: #28a745;">
              ✅ Perfect match! Existing page object covers this page.
            </div>
          </div>
        `;
      }
      
      // Check for potential match
      const potentialMatch = data.testFiles.find((tf: any) => 
        tf.name.toLowerCase().includes(pageName) || 
        tf.pageObjectImports?.some((imp: string) => imp.toLowerCase().includes(pageName))
      );
      
      if (potentialMatch) {
        return `
          <div class="match-card">
            <div class="match-type potential-match">🔗 Potential Match</div>
            <div class="match-title">${page.name}</div>
            <div class="match-details">
              Generated: <span class="element-count">${page.elements.length} elements</span><br>
              Test: <strong>${potentialMatch.name}</strong> <span class="framework-badge">${potentialMatch.framework}</span>
            </div>
            <div style="font-size: 0.8em; color: #856404;">
              🔗 Test file exists - could use generated page object.
            </div>
          </div>
        `;
      }
      
      // No match found
      return `
        <div class="match-card">
          <div class="match-type generated-only">🆕 New Generation</div>
          <div class="match-title">${page.name}</div>
          <div class="match-details">
            Generated: <span class="element-count">${page.elements.length} elements</span>
          </div>
          <div style="font-size: 0.8em; color: #004085;">
            🆕 New page object generated - no existing match found.
          </div>
        </div>
      `;
    }).join('');
  }

  // Framework detection methods (simplified versions)
  private async detectExistingPageObjects(testsDir: string): Promise<any[]> {
    const pageObjects: any[] = [];
    const allFiles = this.findFilesRecursively(testsDir, ['.ts', '.js']);
    
    console.log(`   🔍 Scanning ${allFiles.length} files in ${testsDir}`);
    
    for (const filePath of allFiles) {
      if (filePath.includes('node_modules')) continue;
      
      const content = fs.readFileSync(filePath, 'utf-8');
      const classMatch = content.match(/export class (\w+)/);
      
      if (classMatch && (classMatch[1].includes('Page') || filePath.toLowerCase().includes('page'))) {
        const framework = this.detectFramework(content);
        const methods = this.extractMethods(content);
        
        console.log(`   📄 Found page object: ${classMatch[1]} (${framework}) in ${filePath}`);
        
        pageObjects.push({
          name: path.basename(filePath, path.extname(filePath)),
          className: classMatch[1],
          filePath: path.relative(testsDir, filePath),
          framework,
          methods
        });
      }
    }
    
    return pageObjects;
  }

  private async detectTestFiles(testsDir: string): Promise<any[]> {
    const testFiles: any[] = [];
    const allFiles = this.findFilesRecursively(testsDir, ['.ts', '.js']);
    
    console.log(`   🧪 Scanning ${allFiles.length} files for tests in ${testsDir}`);
    
    for (const filePath of allFiles) {
      if (filePath.includes('node_modules')) continue;
      
      const fileName = path.basename(filePath);
      const isTestFile = (fileName.includes('.spec.') || fileName.includes('.test.') || 
                         fileName.includes('.e2e.') || filePath.includes('/test/')) &&
                         !filePath.includes('/pageobjects/') && !filePath.includes('/pages/');
      
      if (isTestFile) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const framework = this.detectFramework(content);
        const testCount = (content.match(/(?:test|it)\s*\(/g) || []).length;
        
        console.log(`   🧪 Found test file: ${fileName} (${framework}) with ${testCount} tests in ${filePath}`);
        
        if (testCount > 0) {
          testFiles.push({
            name: path.basename(filePath, path.extname(filePath)),
            filePath: path.relative(testsDir, filePath),
            framework,
            testCount,
            pageObjectImports: this.extractPageObjectImports(content)
          });
        }
      }
    }
    
    return testFiles;
  }

  private detectFramework(content: string): string {
    if (content.includes('@playwright/test')) return 'playwright';
    if (content.includes('webdriverio') || content.includes('@wdio')) return 'webdriverio';
    if (content.includes('cypress')) return 'cypress';
    if (content.includes('selenium-webdriver')) return 'selenium';
    
    // Pattern-based detection for WDIO
    if (content.includes('browser.') && content.includes('$')) return 'webdriverio';
    if (content.includes('getByRole') && content.includes('Locator')) return 'playwright';
    if (content.includes('cy.get') || content.includes('cy.visit')) return 'cypress';
    
    return 'unknown';
  }

  private extractMethods(content: string): string[] {
    const methodMatches = content.match(/(?:async\s+)?(\w+)\s*\([^)]*\)/g) || [];
    return methodMatches
      .map(m => m.replace(/async\s+/, '').replace(/\s*\([^)]*\).*/, ''))
      .filter(m => !['constructor', 'get', 'set'].includes(m));
  }

  private extractPageObjectImports(content: string): string[] {
    const importMatches = content.match(/import.*\{([^}]+)\}.*from.*['"]([^'"]*)['"]/gi) || [];
    return importMatches
      .filter(match => match.toLowerCase().includes('page'))
      .map(match => {
        const parts = match.match(/import.*\{([^}]+)\}/);
        return parts ? parts[1].split(',').map(s => s.trim()) : [];
      }).flat();
  }

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
        case '--tests':
          options.tests = args[++i];
          break;
        case '--registry':
          options.registry = true;
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
🎯 Enhanced Page Scanner - Match-Based Analysis

Usage: npx ts-node src/enhanced-cli.ts [options]

Options:
  --scan <directory>     Directory to scan for pages (required)
  --framework <name>     Target framework (required)
                         Options: playwright, webdriverio, cypress, selenium
  --language <lang>      Output language (default: typescript)
                         Options: typescript, javascript, python
  --output <directory>   Output directory (default: <scan>/scan-results/page-objects)
  --tests <directory>    Tests directory for match analysis (required for --registry)
  --registry             Generate match-based analysis HTML
  --help                 Show this help message

Match Analysis:
  Shows existing page objects as MATCHES, not duplicates:
  
  ✅ Exact Match    - Generated page object matches existing one
  🔗 Potential Match - Test exists that could use generated page object  
  🆕 New Generation - No existing match, truly new page object

Examples:
  # Generate with match analysis
  npx ts-node src/enhanced-cli.ts --scan ./test-app --framework playwright --tests ./test-app-tests --registry

  # WebdriverIO with match analysis
  npx ts-node src/enhanced-cli.ts --scan ./test-app --framework webdriverio --tests ./test-app-wdio --registry
`);
  }
}

// Run the enhanced CLI
const cli = new MatchBasedCLI();
cli.run().catch(console.error);
