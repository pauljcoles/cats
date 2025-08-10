#!/usr/bin/env ts-node

/**
 * Element-Level Matching CLI
 * Matches individual interactive elements between scanned pages and existing tests
 */

import * as fs from 'fs';
import * as path from 'path';
import { PageScanner } from './page-scanner';
import { PageObjectGenerator, Framework, Language } from './page-object-generator';
import { ElementMatcher, ScannedElement, ElementMatch } from './element-matcher';

interface CLIOptions {
  scan?: string;
  framework?: Framework;
  language?: Language;
  output?: string;
  tests?: string;
  registry?: boolean;
  help?: boolean;
}

class ElementMatchingCLI {
  async run(): Promise<void> {
    const args = process.argv.slice(2);
    const options = this.parseArgs(args);

    if (options.help || !options.scan || !options.framework) {
      this.showHelp();
      return;
    }

    console.log(`🎯 ${options.framework.toUpperCase()} Element Analysis\n`);

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

      // Element-level analysis if tests directory provided
      if (options.tests && options.registry) {
        console.log(`\n🔍 Analyzing ${options.framework} test coverage...`);
        await this.performElementMatching(result, options.tests, options.framework, outputDir);
      }
    }
  }

  private async performElementMatching(
    scanResult: any, 
    testsDir: string, 
    framework: Framework, 
    outputDir: string
  ): Promise<void> {
    const registryDir = path.join(path.dirname(outputDir), 'registry');
    fs.mkdirSync(registryDir, { recursive: true });

    // Convert scan result to ScannedElement format
    const scannedElements: ScannedElement[] = [];
    for (const page of scanResult.pages) {
      for (const element of page.elements) {
        scannedElements.push({
          name: element.name,
          tagName: element.tagName,
          locator: element.locator,
          locatorType: element.locatorType || 'css',
          confidence: element.confidence,
          page: page.name,
          filePath: page.filePath || `${page.name}.tsx`
        });
      }
    }

    // Perform element-level matching
    const matcher = new ElementMatcher();
    const elementMatches = await matcher.matchElements(scannedElements, [testsDir]);
    const matchSummary = matcher.generateMatchSummary(elementMatches);

    console.log(`   📊 ${framework} test coverage analysis:`);
    console.log(`      📊 ${matchSummary.total} total elements scanned`);
    console.log(`      ✅ ${matchSummary.exact} elements already covered`);
    console.log(`      🔗 ${matchSummary.similar} elements partially covered`);
    console.log(`      🆕 ${matchSummary.none} elements need page object methods`);
    console.log(`      📈 ${matchSummary.coverage.toFixed(1)}% test coverage`);

    // Generate element-level HTML viewer
    await this.generateElementMatchHtmlViewer(registryDir, {
      elementMatches,
      matchSummary,
      framework,
      generatedAt: new Date().toISOString()
    });

    // Generate registry JSON file
    await this.generateRegistryJson(registryDir, {
      elementMatches,
      matchSummary,
      framework,
      generatedAt: new Date().toISOString()
    });

    console.log(`   🌐 Coverage analysis: ${path.join(registryDir, 'element-matches.html')}`);
    console.log(`   📄 Registry JSON: ${path.join(registryDir, 'registry.json')}`);
  }

  private async generateElementMatchHtmlViewer(outputDir: string, data: any): Promise<void> {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Element Coverage Analysis - ${data.framework}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f7fa;
            color: #2d3748;
            line-height: 1.6;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
        }
        
        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        .controls {
            background: white;
            padding: 1.5rem;
            margin: 2rem;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            display: flex;
            gap: 1rem;
            align-items: center;
            flex-wrap: wrap;
        }
        
        .page-selector {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .page-selector label {
            font-weight: 600;
            color: #4a5568;
        }
        
        .page-selector select {
            padding: 0.5rem 1rem;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            font-size: 1rem;
            background: white;
            cursor: pointer;
            min-width: 200px;
        }
        
        .page-selector select:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .filter-buttons {
            display: flex;
            gap: 0.5rem;
        }
        
        .filter-btn {
            padding: 0.5rem 1rem;
            border: 2px solid #e2e8f0;
            background: white;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.2s;
        }
        
        .filter-btn.active {
            background: #667eea;
            color: white;
            border-color: #667eea;
        }
        
        .filter-btn:hover {
            border-color: #667eea;
        }
        
        .summary-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin: 2rem;
        }
        
        .summary-card {
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
        }
        
        .summary-card h3 {
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }
        
        .summary-card.total h3 { color: #4299e1; }
        .summary-card.covered h3 { color: #48bb78; }
        .summary-card.new h3 { color: #ed8936; }
        .summary-card.coverage h3 { color: #9f7aea; }
        
        .page-info {
            background: white;
            margin: 2rem;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .page-info-header {
            background: #f7fafc;
            padding: 1.5rem;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .page-info-header h2 {
            color: #2d3748;
            margin-bottom: 0.5rem;
        }
        
        .filter-status {
            background: #e2e8f0;
            color: #4a5568;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            font-size: 0.9rem;
            margin-bottom: 1rem;
            font-style: italic;
        }
        
        .filter-status.active {
            background: #667eea;
            color: white;
        }
        
        .page-stats {
            display: flex;
            gap: 2rem;
            margin-top: 1rem;
        }
        
        .page-stat {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .page-stat-icon {
            width: 12px;
            height: 12px;
            border-radius: 50%;
        }
        
        .page-stat-icon.covered { background: #48bb78; }
        .page-stat-icon.new { background: #ed8936; }
        
        .elements-container {
            padding: 1.5rem;
        }
        
        .element-card {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
            transition: all 0.2s;
        }
        
        .element-card:hover {
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            transform: translateY(-2px);
        }
        
        .element-card.covered {
            border-left: 4px solid #48bb78;
            background: #f0fff4;
        }
        
        .element-card.new {
            border-left: 4px solid #ed8936;
            background: #fffaf0;
        }
        
        .element-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
        }
        
        .element-name {
            font-weight: 600;
            color: #2d3748;
            font-size: 1.1rem;
        }
        
        .element-tag {
            background: #e2e8f0;
            color: #4a5568;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 500;
        }
        
        .element-locator {
            font-family: 'Monaco', 'Menlo', monospace;
            background: #2d3748;
            color: #e2e8f0;
            padding: 0.5rem;
            border-radius: 4px;
            font-size: 0.9rem;
            margin: 0.5rem 0;
        }
        
        .match-info {
            background: #e6fffa;
            border-left: 4px solid #38b2ac;
            padding: 1rem;
            margin-top: 0.5rem;
            border-radius: 4px;
        }
        
        .match-info.new {
            background: #fff3cd;
            border-left-color: #ffc107;
        }
        
        .implementation-info {
            margin-top: 1rem;
        }
        
        .source-info {
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 6px;
            margin-bottom: 1rem;
            border-left: 3px solid #6c757d;
        }
        
        .implementation-guide h4 {
            color: #495057;
            margin-bottom: 1rem;
            font-size: 1.1rem;
        }
        
        .code-section {
            margin-bottom: 1.5rem;
        }
        
        .code-section strong {
            display: block;
            margin-bottom: 0.5rem;
            color: #495057;
            font-size: 0.95rem;
        }
        
        .code-block {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 6px;
            padding: 1rem;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 0.85rem;
        }
        
        .code-block.suggested-name {
            background: #e7f3ff;
            border-color: #0066cc;
            color: #0066cc;
            font-weight: 600;
            font-size: 1rem;
        }
        
        .code-block.playwright-code {
            background: #f0f8f0;
            border-color: #28a745;
        }
        
        .code-block.webdriverio-code {
            background: #fff3e0;
            border-color: #ff9800;
        }
        
        .code-block.cypress-code {
            background: #f0f8ff;
            border-color: #17a2b8;
        }
        
        .code-block.selenium-code {
            background: #fff8f0;
            border-color: #6f42c1;
        }
        
        .code-block.usage-example {
            background: #e8f4fd;
            border-color: #17a2b8;
        }
        
        .code-header {
            font-weight: 600;
            color: #495057;
            margin-bottom: 0.5rem;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .code-block pre {
            margin: 0;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        
        .code-block code {
            background: none;
            padding: 0;
            font-size: inherit;
            color: inherit;
        }
        
        .copy-buttons {
            display: flex;
            gap: 0.5rem;
            margin-top: 1rem;
        }
        
        .copy-btn {
            background: #007bff;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.85rem;
            transition: background-color 0.2s;
        }
        
        .copy-btn:hover {
            background: #0056b3;
        }
        
        .copy-btn:active {
            background: #004085;
        }
        
        .copy-btn.copied {
            background: #28a745;
        }
        
        .match-details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-top: 0.5rem;
        }
        
        .match-detail {
            display: flex;
            flex-direction: column;
        }
        
        .match-detail strong {
            color: #2d3748;
            font-size: 0.9rem;
            margin-bottom: 0.25rem;
        }
        
        .match-detail span {
            color: #4a5568;
            font-size: 0.85rem;
        }
        
        .confidence-bar {
            width: 100%;
            height: 6px;
            background: #e2e8f0;
            border-radius: 3px;
            overflow: hidden;
            margin-top: 0.5rem;
        }
        
        .confidence-fill {
            height: 100%;
            background: linear-gradient(90deg, #48bb78, #38a169);
            transition: width 0.3s ease;
        }
        
        .hidden {
            display: none !important;
        }
        
        .no-results {
            text-align: center;
            padding: 3rem;
            color: #718096;
        }
        
        .no-results h3 {
            margin-bottom: 1rem;
            color: #4a5568;
        }
        
        @media (max-width: 768px) {
            .controls {
                flex-direction: column;
                align-items: stretch;
            }
            
            .page-stats {
                flex-direction: column;
                gap: 1rem;
            }
            
            .match-details {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎯 Element Coverage Analysis</h1>
        <p>Framework: ${data.framework.toUpperCase()} | Generated: ${this.formatDate(data.generatedAt)}</p>
    </div>
    
    <div class="controls">
        <div class="page-selector">
            <label for="pageSelect">📄 Select Page:</label>
            <select id="pageSelect">
                <option value="all">All Pages</option>
                ${this.generatePageOptions(data.elementMatches)}
            </select>
        </div>
        
        <div class="filter-buttons">
            <button class="filter-btn active" data-filter="all">All Elements</button>
            <button class="filter-btn" data-filter="covered">✅ Covered</button>
            <button class="filter-btn" data-filter="new">🆕 New</button>
        </div>
    </div>
    
    <div class="summary-cards" id="summaryCards">
        ${this.generateSummaryCards(data.matchSummary)}
    </div>
    
    <div class="page-info" id="pageInfo">
        <div class="page-info-header">
            <h2 id="pageTitle">All Pages</h2>
            <div class="filter-status" id="filterStatus">
                Showing all elements
            </div>
            <div class="page-stats" id="pageStats">
                <div class="page-stat">
                    <div class="page-stat-icon covered"></div>
                    <span id="coveredCount">${data.matchSummary.exact + data.matchSummary.similar} covered elements</span>
                </div>
                <div class="page-stat">
                    <div class="page-stat-icon new"></div>
                    <span id="newCount">${data.matchSummary.none} new elements</span>
                </div>
            </div>
        </div>
        
        <div class="elements-container" id="elementsContainer">
            ${this.generateElementCards(data.elementMatches, data.framework)}
        </div>
    </div>
    
    <script>
        ${this.generateJavaScript(data)}
    </script>
</body>
</html>`;

    const htmlFile = path.join(outputDir, 'element-matches.html');
    fs.writeFileSync(htmlFile, htmlContent);
  }

  private generatePageOptions(elementMatches: ElementMatch[]): string {
    const pages = new Set<string>();
    elementMatches.forEach(match => pages.add(match.scannedElement.page));
    
    return Array.from(pages).sort().map(page => 
      `<option value="${page}">${page} Page</option>`
    ).join('\n                ');
  }

  private generateSummaryCards(matchSummary: any): string {
    return `
        <div class="summary-card total">
            <h3>${matchSummary.total}</h3>
            <p>Total Elements</p>
        </div>
        <div class="summary-card covered">
            <h3>${matchSummary.exact + matchSummary.similar}</h3>
            <p>Covered Elements</p>
        </div>
        <div class="summary-card new">
            <h3>${matchSummary.none}</h3>
            <p>New Elements</p>
        </div>
        <div class="summary-card coverage">
            <h3>${matchSummary.coverage.toFixed(1)}%</h3>
            <p>Coverage</p>
        </div>
    `;
  }

  private generateElementCards(elementMatches: ElementMatch[], framework: string): string {
    return elementMatches.map(match => {
      const element = match.scannedElement;
      const existing = match.existingLocator;
      const isCovered = match.matchType === 'exact' || match.matchType === 'similar';
      
      return `
        <div class="element-card ${isCovered ? 'covered' : 'new'}" 
             data-page="${element.page}" 
             data-match-type="${match.matchType}">
          <div class="element-header">
            <div class="element-name">${element.name}</div>
            <div class="element-tag">${element.tagName}</div>
          </div>
          
          <div class="element-locator">${element.locator}</div>
          
          ${existing ? `
            <div class="match-info">
              <strong>📍 Found in:</strong> ${existing.className} (${existing.framework})<br>
              <strong>📄 Page Match:</strong> ${existing.pageName} ${existing.pageName === element.page.toLowerCase() ? '✅' : '❌'}<br>
              <strong>📁 File:</strong> ${existing.filePath}<br>
              <strong>🔧 Method:</strong> ${existing.method}<br>
              <strong>🎯 Existing Locator:</strong> ${existing.locator}
              
              <div class="match-details">
                <div class="match-detail">
                  <strong>Match Type:</strong>
                  <span>${match.matchType.toUpperCase()}</span>
                </div>
                <div class="match-detail">
                  <strong>Confidence:</strong>
                  <span>${(match.confidence * 100).toFixed(1)}%</span>
                </div>
                <div class="match-detail">
                  <strong>Framework:</strong>
                  <span>${existing.framework}</span>
                </div>
                <div class="match-detail">
                  <strong>Line:</strong>
                  <span>${existing.lineNumber || 'N/A'}</span>
                </div>
              </div>
              
              <div class="confidence-bar">
                <div class="confidence-fill" style="width: ${match.confidence * 100}%"></div>
              </div>
            </div>
          ` : `
            <div class="match-info new">
              <strong>🆕 New Element - Ready to Implement</strong><br>
              <em>This element needs to be added to your page objects</em>
              
              <div class="implementation-info">
                <div class="source-info">
                  <strong>📄 Found on Page:</strong> ${element.page}<br>
                  <strong>📁 Source File:</strong> ${element.filePath}<br>
                  <strong>🏷️ Element Type:</strong> ${element.tagName}<br>
                  <strong>🎯 Locator Type:</strong> ${element.locatorType}<br>
                  <strong>⭐ Confidence:</strong> ${element.confidence}/10
                </div>
                
                <div class="implementation-guide">
                  <h4>📋 Implementation Guide:</h4>
                  
                  <div class="code-section">
                    <strong>1️⃣ Target Page Object:</strong>
                    <div class="code-block">
                      <strong>File:</strong> pages/${element.page}Page.ts<br>
                      <strong>Class:</strong> ${element.page}Page
                    </div>
                  </div>
                  
                  <div class="code-section">
                    <strong>2️⃣ Property Name:</strong>
                    <div class="code-block suggested-name">
                      ${this.generatePropertyName(element.name, element.tagName)}
                    </div>
                  </div>
                  
                  <div class="code-section">
                    <strong>3️⃣ ${this.getFrameworkDisplayName(framework)} Implementation:</strong>
                    <div class="code-block ${framework}-code">
                      <div class="code-header">Add to ${element.page}Page class:</div>
                      <pre><code id="${framework}-${element.name}">${this.generateFrameworkCode(element, framework)}</code></pre>
                    </div>
                  </div>
                  
                  <div class="code-section">
                    <strong>4️⃣ Usage Example:</strong>
                    <div class="code-block usage-example">
                      <pre><code id="usage-${element.name}">${this.generateUsageExample(element, framework)}</code></pre>
                    </div>
                  </div>
                  
                  <div class="copy-buttons">
                    <button class="copy-btn" onclick="copyCodeToClipboard('${framework}-${element.name}', this)">
                      📋 Copy ${this.getFrameworkDisplayName(framework)} Code
                    </button>
                    <button class="copy-btn" onclick="copyCodeToClipboard('usage-${element.name}', this)">
                      📋 Copy Usage Example
                    </button>
                  </div>
                </div>
              </div>
            </div>
          `}
        </div>
      `;
    }).join('\n            ');
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }

  private getFrameworkDisplayName(framework: string): string {
    const displayNames: { [key: string]: string } = {
      'playwright': 'Playwright',
      'webdriverio': 'WebdriverIO',
      'cypress': 'Cypress',
      'selenium': 'Selenium'
    };
    return displayNames[framework] || framework.toUpperCase();
  }

  private generateFrameworkCode(element: ScannedElement, framework: string): string {
    const propertyName = this.generatePropertyName(element.name, element.tagName);
    
    switch (framework) {
      case 'playwright':
        return `readonly ${propertyName}: Locator;

constructor(page: Page) {
  this.${propertyName} = page.locator('${element.locator}');
}`;

      case 'webdriverio':
        return `get ${propertyName}() {
  return $('${element.locator}');
}`;

      case 'cypress':
        return `get ${propertyName}() {
  return cy.get('${element.locator}');
}`;

      case 'selenium':
        return `get ${propertyName}() {
  return this.driver.findElement(By.css('${element.locator}'));
}`;

      default:
        return `// ${framework} implementation
${propertyName}: '${element.locator}'`;
    }
  }

  private generateUsageExample(element: ScannedElement, framework: string): string {
    const propertyName = this.generatePropertyName(element.name, element.tagName);
    const pageName = element.page.toLowerCase();
    
    switch (framework) {
      case 'playwright':
        return `// In your test file
const ${pageName}Page = new ${element.page}Page(page);
await ${pageName}Page.${propertyName}.click();`;

      case 'webdriverio':
        return `// In your test file
const ${pageName}Page = new ${element.page}Page();
await ${pageName}Page.${propertyName}.click();`;

      case 'cypress':
        return `// In your test file
const ${pageName}Page = new ${element.page}Page();
${pageName}Page.${propertyName}.click();`;

      case 'selenium':
        return `// In your test file
const ${pageName}Page = new ${element.page}Page(driver);
await ${pageName}Page.${propertyName}.click();`;

      default:
        return `// In your test file
const ${pageName}Page = new ${element.page}Page();
${pageName}Page.${propertyName}.click();`;
    }
  }

  private generatePropertyName(elementName: string, tagName: string): string {
    // Convert element name to camelCase property name
    const baseName = elementName
      .replace(/^(button_|input_|select_|form_|a_|div_|span_)/, '') // Remove common prefixes
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .replace(/\s/g, '')
      .replace(/^./, l => l.toLowerCase());
    
    // Add appropriate suffix based on element type
    const suffixes: { [key: string]: string } = {
      'button': 'Button',
      'input': 'Input',
      'select': 'Select',
      'form': 'Form',
      'a': 'Link',
      'textarea': 'TextArea'
    };
    
    const suffix = suffixes[tagName.toLowerCase()] || '';
    return baseName + suffix;
  }

  private generateJavaScript(data: any): string {
    return `
        const allElements = ${JSON.stringify(data.elementMatches)};
        const allSummary = ${JSON.stringify(data.matchSummary)};
        
        // Current filter state
        let currentPageFilter = 'all';
        let currentTypeFilter = 'all';
        
        // Page selector functionality
        document.getElementById('pageSelect').addEventListener('change', function(e) {
            currentPageFilter = e.target.value;
            applyFilters();
        });
        
        // Filter button functionality
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                currentTypeFilter = e.target.dataset.filter;
                
                // Update active button
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                // Apply combined filters
                applyFilters();
            });
        });
        
        function applyFilters() {
            const elements = document.querySelectorAll('.element-card');
            const pageTitle = document.getElementById('pageTitle');
            const coveredCount = document.getElementById('coveredCount');
            const newCount = document.getElementById('newCount');
            
            let visibleElements = [];
            let covered = 0;
            let newElements = 0;
            
            elements.forEach(element => {
                const elementPage = element.dataset.page;
                const matchType = element.dataset.matchType;
                
                // Check page filter
                const pageMatch = currentPageFilter === 'all' || elementPage === currentPageFilter;
                
                // Check type filter
                let typeMatch = false;
                if (currentTypeFilter === 'all') {
                    typeMatch = true;
                } else if (currentTypeFilter === 'covered') {
                    typeMatch = matchType === 'exact' || matchType === 'similar';
                } else if (currentTypeFilter === 'new') {
                    typeMatch = matchType === 'none';
                }
                
                // Show element only if both filters match
                if (pageMatch && typeMatch) {
                    element.style.display = 'block';
                    visibleElements.push(element);
                    
                    if (matchType === 'exact' || matchType === 'similar') {
                        covered++;
                    } else {
                        newElements++;
                    }
                } else {
                    element.style.display = 'none';
                }
            });
            
            // Update page title and stats
            updatePageTitle(currentPageFilter);
            updateFilterStatus(); // Show what's currently filtered
            updatePageStats(covered, newElements);
            keepSummaryCardsStatic(); // Always show overall totals
            checkForResults(visibleElements);
        }
        
        function updatePageTitle(page) {
            const pageTitle = document.getElementById('pageTitle');
            if (page === 'all') {
                pageTitle.textContent = 'All Pages';
            } else {
                pageTitle.textContent = \`\${page} Page\`;
            }
        }
        
        function updateFilterStatus() {
            const filterStatus = document.getElementById('filterStatus');
            let statusText = '';
            let isActive = false;
            
            if (currentPageFilter !== 'all' || currentTypeFilter !== 'all') {
                isActive = true;
                const pageText = currentPageFilter === 'all' ? 'all pages' : \`\${currentPageFilter} page\`;
                const typeText = currentTypeFilter === 'all' ? 'all elements' : 
                                currentTypeFilter === 'covered' ? 'covered elements' : 'new elements';
                statusText = \`Showing \${typeText} from \${pageText}\`;
            } else {
                statusText = 'Showing all elements';
            }
            
            filterStatus.textContent = statusText;
            if (isActive) {
                filterStatus.classList.add('active');
            } else {
                filterStatus.classList.remove('active');
            }
        }
        
        function updatePageStats(covered, newElements) {
            const coveredCount = document.getElementById('coveredCount');
            const newCount = document.getElementById('newCount');
            
            coveredCount.textContent = \`\${covered} covered elements\`;
            newCount.textContent = \`\${newElements} new elements\`;
        }
        
        // Keep summary cards static - they should always show overall totals
        function keepSummaryCardsStatic() {
            const summaryCards = document.getElementById('summaryCards');
            summaryCards.innerHTML = \`
                <div class="summary-card total">
                    <h3>\${allSummary.total}</h3>
                    <p>Total Elements</p>
                </div>
                <div class="summary-card covered">
                    <h3>\${allSummary.exact + allSummary.similar}</h3>
                    <p>Covered Elements</p>
                </div>
                <div class="summary-card new">
                    <h3>\${allSummary.none}</h3>
                    <p>New Elements</p>
                </div>
                <div class="summary-card coverage">
                    <h3>\${allSummary.coverage.toFixed(1)}%</h3>
                    <p>Coverage</p>
                </div>
            \`;
        }
        
        function checkForResults(visibleElements) {
            const container = document.getElementById('elementsContainer');
            
            if (visibleElements.length === 0) {
                // Find existing element cards and hide them
                const existingCards = container.querySelectorAll('.element-card');
                existingCards.forEach(card => card.style.display = 'none');
                
                // Show no results message
                let noResultsDiv = container.querySelector('.no-results');
                if (!noResultsDiv) {
                    noResultsDiv = document.createElement('div');
                    noResultsDiv.className = 'no-results';
                    container.appendChild(noResultsDiv);
                }
                
                noResultsDiv.innerHTML = \`
                    <h3>No elements found</h3>
                    <p>Try adjusting your filters or selecting a different page.</p>
                    <p><strong>Current filters:</strong> Page: \${currentPageFilter === 'all' ? 'All Pages' : currentPageFilter + ' Page'}, Type: \${currentTypeFilter === 'all' ? 'All Elements' : currentTypeFilter === 'covered' ? 'Covered Elements' : 'New Elements'}</p>
                \`;
                noResultsDiv.style.display = 'block';
            } else {
                // Hide no results message if it exists
                const noResultsDiv = container.querySelector('.no-results');
                if (noResultsDiv) {
                    noResultsDiv.style.display = 'none';
                }
            }
        }
        
        // Initialize on page load
        document.addEventListener('DOMContentLoaded', function() {
            // Set initial state
            currentPageFilter = 'all';
            currentTypeFilter = 'all';
            applyFilters();
        });
        
        // Copy to clipboard functionality
        function copyCodeToClipboard(elementId, buttonElement) {
            const codeElement = document.getElementById(elementId);
            if (!codeElement) return;
            
            const textToCopy = codeElement.textContent;
            
            navigator.clipboard.writeText(textToCopy).then(() => {
                showCopySuccess(buttonElement);
            }).catch(err => {
                console.error('Failed to copy text: ', err);
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = textToCopy;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showCopySuccess(buttonElement);
            });
        }
        
        function showCopySuccess(buttonElement) {
            const originalText = buttonElement.textContent;
            buttonElement.textContent = '✅ Copied!';
            buttonElement.classList.add('copied');
            
            setTimeout(() => {
                buttonElement.textContent = originalText;
                buttonElement.classList.remove('copied');
            }, 2000);
        }
        
        // Make functions available globally
        window.copyCodeToClipboard = copyCodeToClipboard;
    `;
  }

  private async generateRegistryJson(outputDir: string, data: any): Promise<void> {
    const registry = {
      metadata: {
        framework: data.framework,
        generatedAt: this.formatDate(data.generatedAt),
        version: "1.0.0"
      },
      summary: data.matchSummary,
      elements: data.elementMatches.map((match: ElementMatch) => ({
        scanned: {
          name: match.scannedElement.name,
          page: match.scannedElement.page,
          tagName: match.scannedElement.tagName,
          locator: match.scannedElement.locator,
          locatorType: match.scannedElement.locatorType,
          confidence: match.scannedElement.confidence,
          filePath: match.scannedElement.filePath
        },
        existing: match.existingLocator ? {
          locator: match.existingLocator.locator,
          locatorType: match.existingLocator.locatorType,
          method: match.existingLocator.method,
          className: match.existingLocator.className,
          pageName: match.existingLocator.pageName,
          filePath: match.existingLocator.filePath,
          framework: match.existingLocator.framework,
          lineNumber: match.existingLocator.lineNumber
        } : null,
        match: {
          type: match.matchType,
          confidence: match.confidence,
          pageMatch: match.existingLocator ? 
            (match.scannedElement.page.toLowerCase() === match.existingLocator.pageName) : false
        }
      })),
      pages: this.groupElementsByPage(data.elementMatches)
    };

    const jsonFile = path.join(outputDir, 'registry.json');
    fs.writeFileSync(jsonFile, JSON.stringify(registry, null, 2));
  }

  private groupElementsByPage(elementMatches: ElementMatch[]): any {
    const pages: { [key: string]: any } = {};
    
    for (const match of elementMatches) {
      const pageName = match.scannedElement.page;
      if (!pages[pageName]) {
        pages[pageName] = {
          name: pageName,
          totalElements: 0,
          coveredElements: 0,
          newElements: 0,
          elements: []
        };
      }
      
      pages[pageName].totalElements++;
      if (match.matchType === 'exact' || match.matchType === 'similar') {
        pages[pageName].coveredElements++;
      } else {
        pages[pageName].newElements++;
      }
      
      pages[pageName].elements.push({
        name: match.scannedElement.name,
        locator: match.scannedElement.locator,
        matchType: match.matchType,
        covered: match.matchType !== 'none'
      });
    }
    
    return pages;
  }

  private generateElementMatchCards(elementMatches: ElementMatch[]): string {
    return elementMatches.map((match: ElementMatch) => {
      const element = match.scannedElement;
      const existing = match.existingLocator;
      const matchTypeClass = match.matchType === 'exact' ? 'exact-match' : 
                            match.matchType === 'similar' ? 'similar-match' : 'no-match';
      const matchTypeIcon = match.matchType === 'exact' ? '✅' : 
                           match.matchType === 'similar' ? '🔗' : '🆕';
      const matchTypeText = match.matchType === 'exact' ? 'Exact Match' : 
                           match.matchType === 'similar' ? 'Similar Match' : 'New Element';
      
      const confidencePercent = Math.round(match.confidence * 100);
      const confidenceColor = match.confidence >= 0.9 ? '#28a745' : 
                             match.confidence >= 0.6 ? '#ffc107' : '#dc3545';

      return `
        <div class="element-card" data-match-type="${match.matchType}">
          <div class="match-type ${matchTypeClass}">${matchTypeIcon} ${matchTypeText}</div>
          <div class="element-name">${element.name}</div>
          <div class="element-details">
            <strong>Page:</strong> ${element.page} | 
            <strong>Tag:</strong> ${element.tagName} | 
            <strong>Type:</strong> ${element.locatorType}
          </div>
          
          <div class="locator-code">
            <strong>Scanned Locator:</strong><br>
            ${element.locator}
          </div>
          
          ${existing ? `
            <div class="match-info">
              <strong>📍 Found in:</strong> ${existing.className} (${existing.framework})<br>
              <strong>📄 Page Match:</strong> ${existing.pageName} ${existing.pageName === element.page.toLowerCase() ? '✅' : '❌'}<br>
              <strong>📁 File:</strong> ${existing.filePath}<br>
              <strong>🔧 Method:</strong> ${existing.method}<br>
              <strong>🎯 Existing Locator:</strong> ${existing.locator}
            </div>
          ` : `
            <div class="match-info" style="background: #fff3cd; border-left-color: #ffc107;">
              <strong>🆕 New Element:</strong> Not found in existing tests<br>
              <em>This element could be added to your page objects</em>
            </div>
          `}
          
          <div class="confidence-bar">
            <div class="confidence-fill" style="width: ${confidencePercent}%; background-color: ${confidenceColor};"></div>
          </div>
          <div style="font-size: 0.8em; color: #666; text-align: center;">
            Confidence: ${confidencePercent}%
          </div>
        </div>
      `;
    }).join('');
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
🎯 Element-Level Matching CLI

Usage: npx ts-node src/element-cli.ts --scan <directory> --framework <framework> --tests <tests> --registry

Required Options:
  --scan <directory>     Directory to scan for pages
  --framework <name>     Target framework (playwright, webdriverio, cypress, selenium)
  --tests <directory>    Tests directory for element matching
  --registry             Generate element-level match analysis

Optional:
  --language <lang>      Output language (default: typescript)
  --output <directory>   Output directory (default: <scan>/scan-results/page-objects)
  --help                 Show this help message

What it does:
  1. Scans your pages for interactive elements
  2. Generates page objects for your chosen framework
  3. Matches elements against your existing tests
  4. Shows which elements are covered vs need to be added

Example:
  npx ts-node src/element-cli.ts --scan ./src/pages --framework playwright --tests ./tests --registry

Results:
  ✅ Exact Match    - Element already covered in your tests
  🔗 Similar Match  - Element partially covered  
  🆕 New Element    - Element needs to be added to page objects
`);
  }
}

// Run the element-level matching CLI
const cli = new ElementMatchingCLI();
cli.run().catch(console.error);
