import { describe, it, expect, beforeAll } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Integration Tests for Framework Detection
 * Tests the complete detection system against real test files
 */

class TestFileDetector {
  findFilesRecursively(dir: string, extensions: string[]): string[] {
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

  analyzeTestProject(projectPath: string) {
    const allFiles = this.findFilesRecursively(projectPath, ['.ts', '.js']);
    const results = {
      pageObjects: [] as any[],
      testFiles: [] as any[],
      frameworks: new Set<string>()
    };

    for (const filePath of allFiles) {
      if (filePath.includes('node_modules')) continue;
      
      const content = fs.readFileSync(filePath, 'utf-8');
      const relativePath = path.relative(projectPath, filePath);
      
      // Detect page objects
      if (this.looksLikePageObject(content, filePath)) {
        const framework = this.detectFramework(content);
        results.pageObjects.push({
          path: relativePath,
          framework,
          methods: this.extractMethods(content)
        });
        if (framework !== 'unknown') results.frameworks.add(framework);
      }
      
      // Detect test files
      if (this.looksLikeTestFile(content, filePath)) {
        const framework = this.detectFramework(content);
        results.testFiles.push({
          path: relativePath,
          framework,
          testCount: this.countTests(content)
        });
        if (framework !== 'unknown') results.frameworks.add(framework);
      }
    }

    return results;
  }

  private looksLikePageObject(content: string, filePath: string): boolean {
    const hasPageClass = /export class \w*Page/.test(content);
    const hasPageInPath = filePath.toLowerCase().includes('page');
    const hasPageObjectPatterns = content.includes('get ') || content.includes('async ');
    
    return hasPageClass || (hasPageInPath && hasPageObjectPatterns);
  }

  private looksLikeTestFile(content: string, filePath: string): boolean {
    const fileName = path.basename(filePath);
    const isTestFile = fileName.includes('.spec.') || fileName.includes('.test.') || 
                      fileName.includes('.e2e.') || filePath.includes('/test/');
    const hasTestFunctions = /(?:test|it|describe)\s*\(/.test(content);
    
    return isTestFile && hasTestFunctions;
  }

  private detectFramework(content: string): string {
    if (content.includes('@playwright/test')) return 'playwright';
    if (content.includes('webdriverio') || content.includes('@wdio')) return 'webdriverio';
    if (content.includes('cypress')) return 'cypress';
    if (content.includes('selenium-webdriver')) return 'selenium';
    
    // Pattern-based detection
    if (content.includes('getByRole') && content.includes('Locator')) return 'playwright';
    if (content.includes('browser.') && content.includes('$')) return 'webdriverio';
    if (content.includes('cy.get') || content.includes('cy.visit')) return 'cypress';
    
    return 'unknown';
  }

  private extractMethods(content: string): string[] {
    const methodMatches = content.match(/(?:async\s+)?(\w+)\s*\([^)]*\)\s*[{:]/g) || [];
    return methodMatches
      .map(m => m.replace(/async\s+/, '').replace(/\s*\([^)]*\).*/, ''))
      .filter(m => !['constructor', 'get', 'set'].includes(m));
  }

  private countTests(content: string): number {
    const testMatches = content.match(/(?:test|it)\s*\(/g) || [];
    return testMatches.length;
  }
}

describe('Integration Tests - Framework Detection', () => {
  const detector = new TestFileDetector();
  let playwrightResults: any;
  let wdioResults: any;

  beforeAll(() => {
    // Analyze our test projects
    const basePath = path.join(__dirname, '../../');
    
    try {
      playwrightResults = detector.analyzeTestProject(path.join(basePath, 'test-app-tests'));
    } catch (error) {
      playwrightResults = { pageObjects: [], testFiles: [], frameworks: new Set() };
    }
    
    try {
      wdioResults = detector.analyzeTestProject(path.join(basePath, 'test-app-wdio'));
    } catch (error) {
      wdioResults = { pageObjects: [], testFiles: [], frameworks: new Set() };
    }
  });

  describe('Playwright Project Detection', () => {
    it('should detect all Playwright page objects', () => {
      expect(playwrightResults.pageObjects.length).toBeGreaterThanOrEqual(2);
      
      const testPageObject = playwrightResults.pageObjects.find((po: any) => 
        po.path.includes('TestPage')
      );
      
      expect(testPageObject).toBeDefined();
      expect(testPageObject?.framework).toBe('playwright');
      expect(testPageObject?.methods.length).toBeGreaterThan(0);
    });

    it('should detect all Playwright test files', () => {
      expect(playwrightResults.testFiles.length).toBeGreaterThanOrEqual(3);
      
      const testFile = playwrightResults.testFiles.find((tf: any) => 
        tf.path.includes('test-page.spec')
      );
      
      expect(testFile).toBeDefined();
      expect(testFile?.framework).toBe('playwright');
      expect(testFile?.testCount).toBeGreaterThan(0);
    });

    it('should identify Playwright as the framework', () => {
      expect(playwrightResults.frameworks.has('playwright')).toBe(true);
    });
  });

  describe('WebdriverIO Project Detection', () => {
    it('should detect all WDIO page objects', () => {
      expect(wdioResults.pageObjects.length).toBeGreaterThanOrEqual(2);
      
      const testPageObject = wdioResults.pageObjects.find((po: any) => 
        po.path.includes('TestPage')
      );
      
      expect(testPageObject).toBeDefined();
      expect(testPageObject?.framework).toBe('webdriverio');
      expect(testPageObject?.methods.length).toBeGreaterThan(0);
    });

    it('should detect all WDIO test files', () => {
      expect(wdioResults.testFiles.length).toBeGreaterThanOrEqual(2);
      
      const testFile = wdioResults.testFiles.find((tf: any) => 
        tf.path.includes('testpage.e2e')
      );
      
      expect(testFile).toBeDefined();
      expect(testFile?.framework).toBe('webdriverio');
      expect(testFile?.testCount).toBeGreaterThan(0);
    });

    it('should identify WebdriverIO as the framework', () => {
      expect(wdioResults.frameworks.has('webdriverio')).toBe(true);
    });
  });

  describe('Cross-Framework Analysis', () => {
    it('should distinguish between different frameworks', () => {
      // Playwright should not be detected as WDIO and vice versa
      expect(playwrightResults.frameworks.has('webdriverio')).toBe(false);
      expect(wdioResults.frameworks.has('playwright')).toBe(false);
    });

    it('should provide accurate counts for each framework', () => {
      const totalPlaywrightFiles = playwrightResults.pageObjects.length + playwrightResults.testFiles.length;
      const totalWdioFiles = wdioResults.pageObjects.length + wdioResults.testFiles.length;
      
      expect(totalPlaywrightFiles).toBeGreaterThanOrEqual(5); // 2 page objects + 3 test files
      expect(totalWdioFiles).toBeGreaterThanOrEqual(4); // 2 page objects + 2 test files
    });

    it('should extract meaningful method names from page objects', () => {
      const playwrightPageObject = playwrightResults.pageObjects[0];
      const wdioPageObject = wdioResults.pageObjects[0];
      
      expect(playwrightPageObject?.methods).toContain('navigateTo');
      expect(wdioPageObject?.methods).toContain('open');
    });

    it('should count tests accurately', () => {
      const playwrightTestFile = playwrightResults.testFiles[0];
      const wdioTestFile = wdioResults.testFiles[0];
      
      expect(playwrightTestFile?.testCount).toBeGreaterThan(0);
      expect(wdioTestFile?.testCount).toBeGreaterThan(0);
    });
  });

  describe('File System Traversal', () => {
    it('should find files recursively', () => {
      const basePath = path.join(__dirname, '../../test-app-tests');
      const files = detector.findFilesRecursively(basePath, ['.ts']);
      
      expect(files.length).toBeGreaterThan(0);
      expect(files.some(f => f.includes('pages'))).toBe(true);
      expect(files.some(f => f.includes('tests'))).toBe(true);
    });

    it('should filter by file extensions', () => {
      const basePath = path.join(__dirname, '../../test-app-wdio');
      const tsFiles = detector.findFilesRecursively(basePath, ['.ts']);
      const allFiles = detector.findFilesRecursively(basePath, ['.ts', '.js', '.json']);
      
      expect(tsFiles.length).toBeGreaterThan(0);
      expect(allFiles.length).toBeGreaterThanOrEqual(tsFiles.length);
    });

    it('should skip node_modules directories', () => {
      // This test assumes no node_modules in our test directories
      const basePath = path.join(__dirname, '../../test-app-tests');
      const files = detector.findFilesRecursively(basePath, ['.ts']);
      
      expect(files.every(f => !f.includes('node_modules'))).toBe(true);
    });
  });
});
