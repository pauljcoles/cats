import { ElementMatcher, ScannedElement, ExistingLocator, ElementMatch } from '../../src/old/element-matcher';
import * as fs from 'fs';
import * as path from 'path';

describe('ElementMatcher', () => {
  let matcher: ElementMatcher;
  let tempDir: string;

  beforeEach(() => {
    matcher = new ElementMatcher();
    tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('extractExistingLocators', () => {
    it('should extract Playwright getByTestId locators', async () => {
      const testFile = path.join(tempDir, 'TestPage.ts');
      fs.writeFileSync(testFile, `
        import { Page, Locator } from '@playwright/test';
        
        export class TestPage {
          readonly submitButton: Locator;
          
          constructor(page: Page) {
            this.submitButton = page.getByTestId('submit-btn');
            this.emailInput = page.getByTestId('email-input');
          }
        }
      `);

      const locators = await matcher['extractExistingLocators']([tempDir]);
      
      expect(locators).toHaveLength(2);
      expect(locators[0]).toMatchObject({
        locator: '[data-testid="submit-btn"]',
        locatorType: 'testid',
        method: 'submitButton',
        className: 'TestPage',
        framework: 'playwright'
      });
      expect(locators[1]).toMatchObject({
        locator: '[data-testid="email-input"]',
        locatorType: 'testid',
        method: 'emailInput',
        className: 'TestPage',
        framework: 'playwright'
      });
    });

    it('should extract Playwright getByRole locators', async () => {
      const testFile = path.join(tempDir, 'LoginPage.ts');
      fs.writeFileSync(testFile, `
        export class LoginPage {
          constructor(page: Page) {
            this.loginButton = page.getByRole('button', { name: 'Login' });
            this.submitButton = page.getByRole('button');
          }
        }
      `);

      const locators = await matcher['extractExistingLocators']([tempDir]);
      
      expect(locators).toHaveLength(2);
      expect(locators[0]).toMatchObject({
        locator: 'button=Login',
        locatorType: 'role',
        method: 'loginButton'
      });
      expect(locators[1]).toMatchObject({
        locator: 'role=button',
        locatorType: 'role',
        method: 'submitButton'
      });
    });

    it('should extract Playwright getByText locators', async () => {
      const testFile = path.join(tempDir, 'test.spec.ts');
      fs.writeFileSync(testFile, `
        test('should find text', async ({ page }) => {
          await page.getByText('Click me').click();
          await expect(page.getByText('Success')).toBeVisible();
        });
      `);

      const locators = await matcher['extractExistingLocators']([tempDir]);
      
      expect(locators).toHaveLength(2);
      expect(locators[0]).toMatchObject({
        locator: 'text=Click me',
        locatorType: 'text',
        method: 'unknown'
      });
      expect(locators[1]).toMatchObject({
        locator: 'text=Success',
        locatorType: 'text',
        method: 'unknown'
      });
    });

    it('should extract WebdriverIO locators', async () => {
      const testFile = path.join(tempDir, 'WdioPage.ts');
      fs.writeFileSync(testFile, `
        export class WdioPage {
          get submitButton() {
            return $('[data-testid="submit-btn"]');
          }
          
          get searchInput() {
            return $('[placeholder="Search..."]');
          }
        }
      `);

      const locators = await matcher['extractExistingLocators']([tempDir]);
      
      expect(locators).toHaveLength(2);
      expect(locators[0]).toMatchObject({
        locator: '[data-testid="submit-btn"]',
        locatorType: 'testid',
        method: 'submitButton'
      });
      expect(locators[1]).toMatchObject({
        locator: '[placeholder="Search..."]',
        locatorType: 'placeholder',
        method: 'searchInput'
      });
    });

    it('should detect framework correctly', async () => {
      const playwrightFile = path.join(tempDir, 'playwright.ts');
      fs.writeFileSync(playwrightFile, `
        import { test, expect } from '@playwright/test';
        test('test', async ({ page }) => {
          await page.getByTestId('test').click();
        });
      `);

      const wdioFile = path.join(tempDir, 'wdio.ts');
      fs.writeFileSync(wdioFile, `
        describe('test', () => {
          it('should work', () => {
            browser.url('/');
            $('[data-testid="test"]').click();
          });
        });
      `);

      const locators = await matcher['extractExistingLocators']([tempDir]);
      
      const playwrightLocator = locators.find(l => l.filePath.includes('playwright'));
      const wdioLocator = locators.find(l => l.filePath.includes('wdio'));
      
      expect(playwrightLocator?.framework).toBe('playwright');
      expect(wdioLocator?.framework).toBe('webdriverio');
    });
  });

  describe('calculateMatchScore', () => {
    it('should give perfect score for exact locator match', () => {
      const scannedElement: ScannedElement = {
        name: 'submit_button',
        tagName: 'button',
        locator: '[data-testid="submit-btn"]',
        locatorType: 'testid',
        confidence: 10,
        page: 'TestPage',
        filePath: 'TestPage.tsx'
      };

      const existingLocator: ExistingLocator = {
        locator: '[data-testid="submit-btn"]',
        locatorType: 'testid',
        method: 'submitButton',
        className: 'TestPage',
        filePath: 'TestPage.ts',
        framework: 'playwright'
      };

      const score = matcher['calculateMatchScore'](scannedElement, existingLocator);
      expect(score).toBe(1.0);
    });

    it('should give high score for same testid with different formatting', () => {
      const scannedElement: ScannedElement = {
        name: 'submit_button',
        tagName: 'button',
        locator: '[data-testid="submit-btn"]',
        locatorType: 'testid',
        confidence: 10,
        page: 'TestPage',
        filePath: 'TestPage.tsx'
      };

      const existingLocator: ExistingLocator = {
        locator: '[data-testid=\'submit-btn\']',
        locatorType: 'testid',
        method: 'submitButton',
        className: 'TestPage',
        filePath: 'TestPage.ts',
        framework: 'playwright'
      };

      const score = matcher['calculateMatchScore'](scannedElement, existingLocator);
      expect(score).toBe(1.0);
    });

    it('should give high score for same text content with different locator types', () => {
      const scannedElement: ScannedElement = {
        name: 'login_button',
        tagName: 'button',
        locator: '[data-testid="login-btn"]',
        locatorType: 'testid',
        confidence: 8,
        page: 'Login',
        filePath: 'LoginPage.tsx'
      };

      const existingLocator: ExistingLocator = {
        locator: 'button=Login', // Different locator but similar text content
        locatorType: 'role',
        method: 'loginButton',
        className: 'LoginPage',
        filePath: 'LoginPage.ts',
        framework: 'playwright',
        pageName: 'login'
      };

      const score = matcher['calculateMatchScore'](scannedElement, existingLocator);
      expect(score).toBe(0); // Different locators, no text match
    });

    it('should give low score for different elements', () => {
      const scannedElement: ScannedElement = {
        name: 'submit_button',
        tagName: 'button',
        locator: '[data-testid="submit-btn"]',
        locatorType: 'testid',
        confidence: 10,
        page: 'TestPage',
        filePath: 'TestPage.tsx'
      };

      const existingLocator: ExistingLocator = {
        locator: '[data-testid="email-input"]',
        locatorType: 'testid',
        method: 'emailInput',
        className: 'TestPage',
        filePath: 'TestPage.ts',
        framework: 'playwright'
      };

      const score = matcher['calculateMatchScore'](scannedElement, existingLocator);
      expect(score).toBeLessThan(0.5);
    });
  });

  describe('findBestMatch', () => {
    it('should find exact match', () => {
      const scannedElement: ScannedElement = {
        name: 'submit_button',
        tagName: 'button',
        locator: '[data-testid="submit-btn"]',
        locatorType: 'testid',
        confidence: 10,
        page: 'TestPage',
        filePath: 'TestPage.tsx'
      };

      const existingLocators: ExistingLocator[] = [
        {
          locator: '[data-testid="email-input"]',
          locatorType: 'testid',
          method: 'emailInput',
          className: 'TestPage',
          filePath: 'TestPage.ts',
          framework: 'playwright'
        },
        {
          locator: '[data-testid="submit-btn"]',
          locatorType: 'testid',
          method: 'submitButton',
          className: 'TestPage',
          filePath: 'TestPage.ts',
          framework: 'playwright'
        }
      ];

      const match = matcher['findBestMatch'](scannedElement, existingLocators);
      
      expect(match.matchType).toBe('exact');
      expect(match.confidence).toBeGreaterThan(0.9);
      expect(match.existingLocator?.method).toBe('submitButton');
    });

    it('should find no match for different locators', () => {
      const scannedElement: ScannedElement = {
        name: 'login_button',
        tagName: 'button',
        locator: '[data-testid="login-btn"]',
        locatorType: 'testid',
        confidence: 8,
        page: 'Login',
        filePath: 'LoginPage.tsx'
      };

      const existingLocators: ExistingLocator[] = [
        {
          locator: 'button=Submit', // Different text
          locatorType: 'role',
          method: 'submitButton',
          className: 'LoginPage',
          filePath: 'LoginPage.ts',
          framework: 'playwright',
          pageName: 'login'
        }
      ];

      const match = matcher['findBestMatch'](scannedElement, existingLocators);
      
      expect(match.matchType).toBe('none');
      expect(match.confidence).toBe(0);
    });

    it('should find similar match for same locator type and text', () => {
      const scannedElement: ScannedElement = {
        name: 'login_button',
        tagName: 'button',
        locator: '[data-testid="login-btn"]',
        locatorType: 'testid',
        confidence: 8,
        page: 'Login',
        filePath: 'LoginPage.tsx'
      };

      const existingLocators: ExistingLocator[] = [
        {
          locator: '[data-testid="login-btn"]', // Same locator
          locatorType: 'testid',
          method: 'loginButton',
          className: 'LoginPage',
          filePath: 'LoginPage.ts',
          framework: 'playwright',
          pageName: 'login'
        }
      ];

      const match = matcher['findBestMatch'](scannedElement, existingLocators);
      
      expect(match.matchType).toBe('exact'); // Exact match
      expect(match.confidence).toBe(1.0);
    });

    it('should return no match when no similar locators found', () => {
      const scannedElement: ScannedElement = {
        name: 'new_button',
        tagName: 'button',
        locator: '[data-testid="new-btn"]',
        locatorType: 'testid',
        confidence: 10,
        page: 'TestPage',
        filePath: 'TestPage.tsx'
      };

      const existingLocators: ExistingLocator[] = [
        {
          locator: '[data-testid="old-btn"]',
          locatorType: 'testid',
          method: 'oldButton',
          className: 'TestPage',
          filePath: 'TestPage.ts',
          framework: 'playwright'
        }
      ];

      const match = matcher['findBestMatch'](scannedElement, existingLocators);
      
      expect(match.matchType).toBe('none');
      expect(match.existingLocator).toBeUndefined();
    });
  });

  describe('matchElements', () => {
    it('should match elements against existing locators', async () => {
      // Create test files
      const testFile = path.join(tempDir, 'TestPage.ts');
      fs.writeFileSync(testFile, `
        export class TestPage {
          constructor(page: Page) {
            this.submitButton = page.getByTestId('submit-btn');
            this.emailInput = page.getByTestId('email-input');
          }
        }
      `);

      const scannedElements: ScannedElement[] = [
        {
          name: 'submit_button',
          tagName: 'button',
          locator: '[data-testid="submit-btn"]',
          locatorType: 'testid',
          confidence: 10,
          page: 'Test',
          filePath: 'TestPage.tsx'
        },
        {
          name: 'password_input',
          tagName: 'input',
          locator: '[data-testid="password-input"]',
          locatorType: 'testid',
          confidence: 10,
          page: 'Test',
          filePath: 'TestPage.tsx'
        }
      ];

      const matches = await matcher.matchElements(scannedElements, [tempDir]);
      
      expect(matches).toHaveLength(2);
      expect(matches[0].matchType).toBe('exact');
      expect(matches[1].matchType).toBe('none');
    });
  });

  describe('generateMatchSummary', () => {
    it('should generate correct summary statistics', () => {
      const matches: ElementMatch[] = [
        {
          scannedElement: {} as ScannedElement,
          matchType: 'exact',
          confidence: 1.0
        },
        {
          scannedElement: {} as ScannedElement,
          matchType: 'exact',
          confidence: 0.95
        },
        {
          scannedElement: {} as ScannedElement,
          matchType: 'similar',
          confidence: 0.7
        },
        {
          scannedElement: {} as ScannedElement,
          matchType: 'none',
          confidence: 0.1
        }
      ];

      const summary = matcher.generateMatchSummary(matches);
      
      expect(summary.total).toBe(4);
      expect(summary.exact).toBe(2);
      expect(summary.similar).toBe(1);
      expect(summary.none).toBe(1);
      expect(summary.coverage).toBe(75); // (2 + 1) / 4 * 100
    });
  });

  describe('normalizeLocator', () => {
    it('should normalize locators for comparison', () => {
      expect(matcher['normalizeLocator']('[data-testid="submit-btn"]'))
        .toBe(matcher['normalizeLocator']('[data-testid=\'submit-btn\']'));
      
      expect(matcher['normalizeLocator']('button = "Login"'))
        .toBe(matcher['normalizeLocator']('button="Login"'));
      
      expect(matcher['normalizeLocator']('  [aria-label="Close"]  '))
        .toBe('[aria-label=close]');
    });
  });

  describe('page-aware matching', () => {
    it('should match elements on the same page', () => {
      const scannedElement: ScannedElement = {
        name: 'login_button',
        tagName: 'button',
        locator: '[data-testid="login-btn"]',
        locatorType: 'testid',
        confidence: 10,
        page: 'Login',
        filePath: 'LoginPage.tsx'
      };

      const existingLocator: ExistingLocator = {
        locator: '[data-testid="login-btn"]',
        locatorType: 'testid',
        method: 'loginButton',
        className: 'LoginPage',
        filePath: 'LoginPage.ts',
        framework: 'playwright',
        pageName: 'login'
      };

      const score = matcher['calculateMatchScore'](scannedElement, existingLocator);
      expect(score).toBe(1.0);
    });

    it('should reject matches from different pages', () => {
      const scannedElement: ScannedElement = {
        name: 'login_button',
        tagName: 'button',
        locator: '[data-testid="login-btn"]',
        locatorType: 'testid',
        confidence: 10,
        page: 'Login',
        filePath: 'LoginPage.tsx'
      };

      const existingLocator: ExistingLocator = {
        locator: '[data-testid="login-btn"]',
        locatorType: 'testid',
        method: 'loginButton',
        className: 'HomePage',
        filePath: 'HomePage.ts',
        framework: 'playwright',
        pageName: 'home'
      };

      const score = matcher['calculateMatchScore'](scannedElement, existingLocator);
      expect(score).toBe(0);
    });

    it('should allow matches with unknown page names', () => {
      const scannedElement: ScannedElement = {
        name: 'login_button',
        tagName: 'button',
        locator: '[data-testid="login-btn"]',
        locatorType: 'testid',
        confidence: 10,
        page: 'Login',
        filePath: 'LoginPage.tsx'
      };

      const existingLocator: ExistingLocator = {
        locator: '[data-testid="login-btn"]',
        locatorType: 'testid',
        method: 'loginButton',
        className: 'TestFile',
        filePath: 'test.spec.ts',
        framework: 'playwright',
        pageName: 'unknown'
      };

      const score = matcher['calculateMatchScore'](scannedElement, existingLocator);
      expect(score).toBe(1.0);
    });
  });

  describe('extractPageNameFromClassName', () => {
    it('should extract page names from class names', () => {
      expect(matcher['extractPageNameFromClassName']('LoginPage')).toBe('login');
      expect(matcher['extractPageNameFromClassName']('HomePage')).toBe('home');
      expect(matcher['extractPageNameFromClassName']('TestPage')).toBe('test');
      expect(matcher['extractPageNameFromClassName']('CheckoutPage')).toBe('checkout');
      expect(matcher['extractPageNameFromClassName']('ProductPage')).toBe('product');
    });

    it('should handle TestFile class name', () => {
      expect(matcher['extractPageNameFromClassName']('TestFile')).toBe('unknown');
    });

    it('should handle unknown class names', () => {
      expect(matcher['extractPageNameFromClassName']('CustomPage')).toBe('custom');
    });
  });

  describe('extractTextFromLocator', () => {
    it('should extract text from different locator types', () => {
      expect(matcher['extractTextFromLocator']('[data-testid="submit-btn"]'))
        .toBe('submit-btn');
      
      expect(matcher['extractTextFromLocator']('[placeholder="Enter email"]'))
        .toBe('Enter email');
      
      expect(matcher['extractTextFromLocator']('button=Login'))
        .toBe('Login');
      
      expect(matcher['extractTextFromLocator']('text=Click me'))
        .toBe('Click me');
      
      expect(matcher['extractTextFromLocator']('[aria-label="Close dialog"]'))
        .toBe('Close dialog');
    });
  });
});
