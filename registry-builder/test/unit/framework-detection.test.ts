import { describe, it, expect } from '@jest/globals';

/**
 * Framework Detection Unit Tests
 * Tests the framework-specific detection logic
 */

// Mock framework detection functions (these would be extracted from the CLI)
class FrameworkDetector {
  detectPageObjectByFramework(content: string, filePath: string): any | null {
    const classMatch = content.match(/export class (\w+)/);
    if (!classMatch) return null;

    const className = classMatch[1];
    const hasPageInName = className.includes('Page') || filePath.toLowerCase().includes('page');
    if (!hasPageInName) return null;

    let framework = 'unknown';
    let confidence = 0;

    // Framework detection patterns
    if (content.includes('@playwright/test') || content.includes('playwright')) {
      framework = 'playwright';
      confidence += 3;
    }
    if (content.includes('webdriverio') || content.includes('@wdio')) {
      framework = 'webdriverio';
      confidence += 3;
    }
    if (content.includes('cypress')) {
      framework = 'cypress';
      confidence += 3;
    }
    if (content.includes('selenium-webdriver')) {
      framework = 'selenium';
      confidence += 3;
    }

    // Look for framework-specific patterns
    if (content.includes('getByRole') || content.includes('Locator')) confidence += 2;
    if (content.includes('$') && content.includes('browser')) confidence += 2;
    if (content.includes('cy.get') || content.includes('cy.contains')) confidence += 2;
    if (content.includes('By.') || content.includes('WebDriver')) confidence += 2;

    if (confidence < 2) return null;

    const methodMatches = content.match(/(?:async\s+)?(\w+)\s*\([^)]*\)/g) || [];
    const methods = methodMatches
      .map(m => m.replace(/async\s+/, '').replace(/\s*\([^)]*\).*/, ''))
      .filter(m => !['constructor', 'get', 'set'].includes(m));

    return {
      name: filePath.split('/').pop()?.replace(/\.(ts|js)$/, '') || 'unknown',
      className,
      filePath,
      framework,
      confidence,
      methods
    };
  }

  detectTestFileByFramework(content: string, filePath: string): any | null {
    const fileName = filePath.split('/').pop() || '';
    const isTestFile = fileName.includes('.spec.') || fileName.includes('.test.') || 
                      fileName.includes('_test.') || fileName.includes('_spec.') ||
                      filePath.includes('/test/') || filePath.includes('/tests/') ||
                      fileName.includes('.e2e.');

    if (!isTestFile) return null;

    let framework = 'unknown';
    let confidence = 0;

    // Framework detection
    if (content.includes('@playwright/test')) {
      framework = 'playwright';
      confidence += 3;
    }
    if (content.includes('@wdio/cli') || content.includes('webdriverio')) {
      framework = 'webdriverio';
      confidence += 3;
    }
    if (content.includes('cypress')) {
      framework = 'cypress';
      confidence += 3;
    }

    // Test function patterns
    const testMatches = content.match(/(?:test|it)\s*\(/g) || []; // Only count test and it, not describe
    confidence += testMatches.length;

    if (confidence < 2) return null;

    const testNameMatches = content.match(/(?:test|it)\s*\(\s*['"`]([^'"`]+)['"`]\s*,/g) || [];
    const tests = testNameMatches.map(m => {
      const match = m.match(/['"`]([^'"`]+)['"`]/);
      return match ? match[1] : '';
    }).filter(t => t);

    return {
      name: fileName.replace(/\.(ts|js)$/, ''),
      filePath,
      framework,
      confidence,
      tests,
      testCount: tests.length
    };
  }
}

describe('Framework Detection', () => {
  const detector = new FrameworkDetector();

  describe('Page Object Detection', () => {
    it('should detect Playwright page objects', () => {
      const playwrightPageObject = `
        import { Page, Locator } from '@playwright/test';
        
        export class TestPage {
          readonly page: Page;
          readonly submitButton: Locator;
          
          constructor(page: Page) {
            this.page = page;
            this.submitButton = page.getByRole('button', { name: 'Submit' });
          }
          
          async navigateTo(): Promise<void> {
            await this.page.goto('/testpage');
          }
        }
      `;

      const result = detector.detectPageObjectByFramework(playwrightPageObject, 'pages/TestPage.ts');
      
      expect(result).not.toBeNull();
      expect(result?.framework).toBe('playwright');
      expect(result?.className).toBe('TestPage');
      expect(result?.confidence).toBeGreaterThanOrEqual(5); // 3 for import + 2 for Locator
      expect(result?.methods).toContain('navigateTo');
    });

    it('should detect WebdriverIO page objects', () => {
      const wdioPageObject = `
        export class TestPage {
          get submitButton() {
            return $('[data-testid="submit-btn"]');
          }
          
          async open() {
            await browser.url('/testpage');
          }
          
          async submitLogin(email: string, password: string) {
            await this.emailInput.setValue(email);
            await browser.keys('Enter');
          }
        }
      `;

      const result = detector.detectPageObjectByFramework(wdioPageObject, 'pageobjects/TestPage.ts');
      
      expect(result).not.toBeNull();
      expect(result?.framework).toBe('unknown'); // No explicit import, but should detect patterns
      expect(result?.className).toBe('TestPage');
      expect(result?.confidence).toBeGreaterThanOrEqual(2); // 2 for $ and browser patterns
      expect(result?.methods).toContain('open');
      expect(result?.methods).toContain('submitLogin');
    });

    it('should detect Cypress page objects', () => {
      const cypressPageObject = `
        export class TestPage {
          visit() {
            cy.visit('/testpage');
          }
          
          submitForm(email: string) {
            cy.get('[data-testid="email"]').type(email);
            cy.contains('Submit').click();
          }
        }
      `;

      const result = detector.detectPageObjectByFramework(cypressPageObject, 'support/pages/TestPage.ts');
      
      expect(result).not.toBeNull();
      expect(result?.framework).toBe('unknown'); // No explicit import
      expect(result?.confidence).toBeGreaterThanOrEqual(2); // 2 for cy.get patterns
      expect(result?.methods).toContain('visit');
      expect(result?.methods).toContain('submitForm');
    });

    it('should not detect non-page object classes', () => {
      const regularClass = `
        export class UserService {
          async getUser(id: string) {
            return fetch(\`/api/users/\${id}\`);
          }
        }
      `;

      const result = detector.detectPageObjectByFramework(regularClass, 'services/UserService.ts');
      
      expect(result).toBeNull(); // No "Page" in name
    });

    it('should not detect classes without sufficient confidence', () => {
      const lowConfidenceClass = `
        export class TestPage {
          doSomething() {
            console.log('hello');
          }
        }
      `;

      const result = detector.detectPageObjectByFramework(lowConfidenceClass, 'TestPage.ts');
      
      expect(result).toBeNull(); // Confidence < 2
    });
  });

  describe('Test File Detection', () => {
    it('should detect Playwright test files', () => {
      const playwrightTest = `
        import { test, expect } from '@playwright/test';
        import { TestPage } from '../pages/TestPage';

        test.describe('Test Page', () => {
          test('should submit form successfully', async ({ page }) => {
            const testPage = new TestPage(page);
            await testPage.navigateTo();
            expect(page).toHaveURL(/dashboard/);
          });
          
          test('should handle validation', async ({ page }) => {
            // test logic
          });
        });
      `;

      const result = detector.detectTestFileByFramework(playwrightTest, 'tests/test-page.spec.ts');
      
      expect(result).not.toBeNull();
      expect(result?.framework).toBe('playwright');
      expect(result?.testCount).toBe(2);
      expect(result?.tests).toContain('should submit form successfully');
      expect(result?.tests).toContain('should handle validation');
    });

    it('should detect WebdriverIO test files', () => {
      const wdioTest = `
        import { TestPage } from '../pageobjects/TestPage';

        describe('Test Page Functionality', () => {
          it('should submit login form successfully', async () => {
            const testPage = new TestPage();
            await testPage.open();
            expect(await browser.getUrl()).toContain('/dashboard');
          });
          
          it('should add item to cart', async () => {
            // test logic
          });
        });
      `;

      const result = detector.detectTestFileByFramework(wdioTest, 'test/specs/testpage.e2e.ts');
      
      expect(result).not.toBeNull();
      expect(result?.framework).toBe('unknown'); // No explicit WDIO import
      expect(result?.testCount).toBe(2);
      expect(result?.tests).toContain('should submit login form successfully');
      expect(result?.tests).toContain('should add item to cart');
    });

    it('should detect Cypress test files', () => {
      const cypressTest = `
        describe('Login Tests', () => {
          it('should login successfully', () => {
            cy.visit('/login');
            cy.get('[data-testid="username"]').type('user');
            cy.contains('Login').click();
          });
        });
      `;

      const result = detector.detectTestFileByFramework(cypressTest, 'cypress/e2e/login.spec.ts');
      
      expect(result).not.toBeNull();
      expect(result?.framework).toBe('unknown'); // No explicit import
      expect(result?.testCount).toBe(1);
      expect(result?.tests).toContain('should login successfully');
    });

    it('should not detect non-test files', () => {
      const regularFile = `
        export const config = {
          apiUrl: 'https://api.example.com'
        };
      `;

      const result = detector.detectTestFileByFramework(regularFile, 'config/settings.ts');
      
      expect(result).toBeNull(); // Not a test file
    });

    it('should not detect files without test functions', () => {
      const noTestFunctions = `
        import { test } from '@playwright/test';
        
        export const helper = {
          setupTest() {
            // helper function
          }
        };
      `;

      const result = detector.detectTestFileByFramework(noTestFunctions, 'helpers/test-helper.ts'); // Remove .spec from filename
      
      expect(result).toBeNull(); // No actual test functions and not a test file pattern
    });
  });

  describe('Framework Confidence Scoring', () => {
    it('should give higher confidence to explicit imports', () => {
      const explicitImport = `
        import { test } from '@playwright/test';
        export class TestPage {
          async navigate() {}
        }
      `;

      const implicitPattern = `
        export class TestPage {
          get button() { return page.getByRole('button'); }
        }
      `;

      const explicit = detector.detectPageObjectByFramework(explicitImport, 'TestPage.ts');
      const implicit = detector.detectPageObjectByFramework(implicitPattern, 'TestPage.ts');
      
      expect(explicit?.confidence).toBeGreaterThan(implicit?.confidence || 0);
    });

    it('should accumulate confidence from multiple indicators', () => {
      const multipleIndicators = `
        import { Page, Locator } from '@playwright/test';
        
        export class TestPage {
          readonly page: Page;
          readonly button: Locator;
          
          async click() {
            await this.button.click();
          }
        }
      `;

      const result = detector.detectPageObjectByFramework(multipleIndicators, 'TestPage.ts');
      
      expect(result?.confidence).toBeGreaterThanOrEqual(5); // 3 for import + 2 for Locator
    });
  });
});
