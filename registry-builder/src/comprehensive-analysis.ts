#!/usr/bin/env ts-node

/**
 * Comprehensive Analysis - Shows ALL page objects and tests across frameworks
 */

import * as fs from 'fs';
import * as path from 'path';

class ComprehensiveAnalyzer {
  async run(): Promise<void> {
    console.log('🔍 Comprehensive Framework Analysis\n');

    // Analyze Playwright tests
    console.log('=== PLAYWRIGHT TESTS ===');
    const playwrightResults = await this.analyzeDirectory('./test-app-tests');
    this.displayResults('Playwright', playwrightResults);

    console.log('\n=== WEBDRIVERIO TESTS ===');
    const wdioResults = await this.analyzeDirectory('./test-app-wdio');
    this.displayResults('WebdriverIO', wdioResults);

    console.log('\n=== SUMMARY ===');
    const totalPageObjects = playwrightResults.pageObjects.length + wdioResults.pageObjects.length;
    const totalTestFiles = playwrightResults.testFiles.length + wdioResults.testFiles.length;
    
    console.log(`📄 Total Page Objects: ${totalPageObjects}`);
    console.log(`🧪 Total Test Files: ${totalTestFiles}`);
    console.log(`🎯 Total Files Analyzed: ${totalPageObjects + totalTestFiles}`);
  }

  private async analyzeDirectory(dir: string) {
    const results = {
      pageObjects: [] as any[],
      testFiles: [] as any[]
    };

    const allFiles = this.findFilesRecursively(dir, ['.ts', '.js']);
    
    for (const filePath of allFiles) {
      if (filePath.includes('node_modules')) continue;
      
      const content = fs.readFileSync(filePath, 'utf-8');
      const fileName = path.basename(filePath);
      
      // Check for page objects
      const classMatch = content.match(/export class (\w+)/);
      if (classMatch && (classMatch[1].includes('Page') || filePath.toLowerCase().includes('page'))) {
        const framework = this.detectFramework(content);
        const methods = this.extractMethods(content);
        
        results.pageObjects.push({
          name: classMatch[1],
          fileName,
          filePath: path.relative(dir, filePath),
          framework,
          methods: methods.length,
          methodNames: methods.slice(0, 3)
        });
      }
      
      // Check for test files
      const isTestFile = (fileName.includes('.spec.') || fileName.includes('.test.') || 
                         fileName.includes('.e2e.')) &&
                         !filePath.includes('/pageobjects/') && !filePath.includes('/pages/');
      
      if (isTestFile) {
        const framework = this.detectFramework(content);
        const testCount = (content.match(/(?:test|it)\s*\(/g) || []).length;
        
        if (testCount > 0) {
          results.testFiles.push({
            name: fileName.replace(/\.(ts|js)$/, ''),
            fileName,
            filePath: path.relative(dir, filePath),
            framework,
            testCount
          });
        }
      }
    }

    return results;
  }

  private displayResults(frameworkName: string, results: any): void {
    console.log(`\n📄 ${frameworkName} Page Objects (${results.pageObjects.length}):`);
    results.pageObjects.forEach((po: any) => {
      console.log(`   📄 ${po.name} (${po.framework})`);
      console.log(`      📁 ${po.filePath}`);
      console.log(`      🔧 ${po.methods} methods: ${po.methodNames.join(', ')}${po.methods > 3 ? '...' : ''}`);
    });

    console.log(`\n🧪 ${frameworkName} Test Files (${results.testFiles.length}):`);
    results.testFiles.forEach((tf: any) => {
      console.log(`   🧪 ${tf.name} (${tf.framework})`);
      console.log(`      📁 ${tf.filePath}`);
      console.log(`      ✅ ${tf.testCount} tests`);
    });
  }

  private detectFramework(content: string): string {
    if (content.includes('@playwright/test')) return 'playwright';
    if (content.includes('webdriverio') || content.includes('@wdio')) return 'webdriverio';
    if (content.includes('cypress')) return 'cypress';
    if (content.includes('selenium-webdriver')) return 'selenium';
    
    // Pattern-based detection
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
}

// Run the analyzer
const analyzer = new ComprehensiveAnalyzer();
analyzer.run().catch(console.error);
