# Page Scanner CLI - Framework Best Practices 🚀

**Scan React/Vue codebases and generate framework-specific page objects with bidirectional mapping**

## 🎯 What It Does

- **Scans codebases** → Finds interactive elements with `data-testid` attributes
- **Generates page objects** → Following each framework's official best practices
- **Bidirectional mapping** → Maps relationships between scanned elements, generated page objects, existing page objects, and test files
- **Multiple frameworks** → Playwright, WebdriverIO, Cypress, Selenium
- **Multiple languages** → TypeScript, JavaScript, Python

## ⚡ Quick Start

```bash
# Install dependencies  
npm install

# Basic scan - app and tests in same directory

# Separate app and test directories with bidirectional mapping
npx ts-node src/cli.ts --scan ./frontend-app --tests ./e2e-tests --framework playwright --registry
```

## 🏗️ Framework Best Practices

Each framework follows its official best practices and conventions:

### **Playwright** - Semantic Selectors
- Uses `getByRole`, `getByText`, `getByLabel`, etc.
- Readonly `Locator` properties
- Follows [Playwright Best Practices](https://playwright.dev/docs/best-practices)

```bash
npx ts-node src/cli.ts --scan ./src --framework playwright --registry
```

### **WebdriverIO** - Getter Methods
- Getter methods with `$` selectors
- Accessibility-first selector strategy
- Follows [WebdriverIO Best Practices](https://webdriver.io/docs/bestpractices/)

```bash
npx ts-node src/cli.ts --scan ./src --tests ./test --framework webdriverio --registry
```

### **Cypress** - Data Attributes
- Prefers `data-cy` attributes
- Method chaining pattern
- Follows Cypress best practices

```bash
npx ts-node src/cli.ts --scan ./src --tests ./cypress --framework cypress --registry
```

### **Selenium** - ID/Name Locators
- ID/name locators preferred
- Proper WebDriverWait usage
- By.* locator strategies

```bash
npx ts-node src/cli.ts --scan ./app --tests ./tests --framework selenium --language python --registry
```

## 📊 CLI Options

```bash
npx ts-node src/cli.ts [options]

Options:
  --scan <directory>     Directory to scan for pages (required)
  --tests <directory>    Directory containing tests and page objects (optional)
  --framework <name>     Target framework (required)
                         Options: playwright, webdriverio, cypress, selenium
  --language <lang>      Output language (default: typescript)
                         Options: typescript, javascript, python
  --output <directory>   Output directory (default: <scan>/scan-results/page-objects)
  --registry             Generate registry data with bidirectional mapping
  --help                 Show help message
```

## 🔗 Bidirectional Mapping

The `--registry` flag creates comprehensive mapping between:

### **What Gets Mapped**
- **Scanned Elements** → Interactive elements with `data-testid` attributes
- **Generated Page Objects** → New page objects created from scanned elements
- **Existing Page Objects** → Found in `tests/pages/` directory
- **Test Files** → Found as `.spec.ts` files in tests directory

### **Relationship Types**
- **GENERATES**: Scanned elements → Generated page objects
- **COULD_BE_USED_BY**: Generated page objects → Existing tests (by name similarity)
- **USES**: Existing tests → Existing page objects (by imports/usage patterns)
- **DUPLICATES**: Generated page objects → Existing page objects (coverage analysis)

### **Output Files**
```
<scan-dir>/scan-results/registry-output/
├── bidirectional-registry.json    # Complete mapping with nodes and relationships
└── page-scan-results.json         # Raw scan results
```

## 📈 Example Output

### **Scan Results**
```
🚀 Page Scanner - PLAYWRIGHT Best Practices

📂 Scanning: ./frontend-app
✅ Found 9 pages with 22 interactive elements

📄 LoginPage (no route)
   button    loginButton          ★★★★★ [data-testid="login-btn"]
   input     emailInput           ★★★★★ [data-testid="email-input"]
   input     passwordInput        ★★★★★ [data-testid="password-input"]

📄 ProductPage (/products/:id)
   button    addToCartButton      ★★★★★ [data-testid="add-to-cart"]
   button    buyNowButton         ★★★★★ [data-testid="buy-now"]

🏗️  Generating playwright page objects following best practices...

✅ playwright page objects generated in ./frontend-app/scan-results/page-objects

📊 Generating Registry Data...
  📊 Bidirectional registry: ./scan-results/registry-output/bidirectional-registry.json
  📄 Scan results: ./scan-results/registry-output/page-scan-results.json
  🔗 45 relationships mapped
  📈 22 elements → page objects
  🧪 8 page objects → potential tests
  📋 12 tests → existing page objects
```

### **Generated Playwright Page Object**
```typescript
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly loginButton: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.loginButton = page.getByTestId('login-btn');
    this.emailInput = page.getByTestId('email-input');
    this.passwordInput = page.getByTestId('password-input');
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
```

### **Generated WebdriverIO Page Object**
```typescript
export class LoginPage {
  /**
   * Get loginButton element
   * button - testid (confidence: 10/10)
   */
  get loginButton() {
    return $('[data-testid="login-btn"]');
  }

  /**
   * Get emailInput element
   * input - testid (confidence: 10/10)
   */
  get emailInput() {
    return $('[data-testid="email-input"]');
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.setValue(email);
    await this.passwordInput.setValue(password);
    await this.loginButton.click();
  }
}
```

## 🎯 Key Features

### **Enhanced Element Detection**
- Detects elements with `data-testid` attributes regardless of HTML tag type
- Handles custom components (divs, spans) with test attributes
- Highest confidence score (10/10) for `testid` locator type
- Skips traditional noise elements without test attributes

### **Smart Class Name Generation**
- Handles invalid JavaScript identifiers
- Transforms `404` → `Page404Page`
- Transforms `media.tests` → `MediaTestsPage`
- Prefixes number-starting identifiers with "element"

### **Framework-Specific Best Practices**
- **Playwright**: Semantic selectors with readonly Locator properties
- **WebdriverIO**: Getter methods with accessibility-first selectors
- **Cypress**: data-cy attributes with method chaining
- **Selenium**: ID/name locators with proper waits

### **Duplicate-Safe Generation**
- Generated property and method names use counters for uniqueness
- Handles multiple elements with similar names gracefully

## 🔧 Advanced Usage

### **Separate Codebases**
Perfect for microservices or separate frontend/test repositories:

```bash
# React frontend + separate E2E test repository
npx ts-node src/cli.ts --scan ./frontend-app --tests ./e2e-tests --framework playwright --registry

# Vue app + separate Cypress tests
npx ts-node src/cli.ts --scan ./vue-app --tests ./cypress-tests --framework cypress --registry

# Multiple test frameworks from same codebase
npx ts-node src/cli.ts --scan ./app --tests ./tests/playwright --framework playwright --registry
npx ts-node src/cli.ts --scan ./app --tests ./tests/webdriverio --framework webdriverio --registry
```

### **Registry Analysis**
The bidirectional registry provides insights for:

- **Coverage gaps**: Generated page objects without existing duplicates
- **Test integration**: Which generated page objects could be used by existing tests
- **Refactoring opportunities**: Existing page objects that duplicate generated ones
- **Usage tracking**: Which tests use which page objects

### **Selector Priority Order**
Each framework follows its recommended selector priority:

- **Playwright**: `getByRole > getByText > getByLabel > getByPlaceholder > getByTestId > CSS`
- **WebdriverIO**: `aria-label > role > data-testid > placeholder > CSS`
- **Cypress**: `data-cy > data-testid > aria-label > CSS`
- **Selenium**: `ID > name > data-testid > CSS`

## 📁 Project Structure

```
registry-builder/
├── src/
│   ├── cli.ts                      # Main CLI with bidirectional mapping
│   ├── page-scanner.ts             # Enhanced element detection
│   ├── best-practices-generator.ts # Framework-specific generators
│   └── registry-builder.ts         # Legacy complex registry builder
├── README.md                       # This file
├── README-old.md                   # Previous README backup
└── scan-results/                   # Generated outputs
    ├── page-objects/               # Framework-specific page objects
    └── registry-output/            # Bidirectional mapping data
```

## 🚀 Integration Examples

### **Playwright Test**
```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from './scan-results/page-objects/LoginPage';

test('user login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  
  await page.goto('/login');
  await loginPage.login('user@example.com', 'password123');
  
  await expect(page).toHaveURL('/dashboard');
});
```

### **WebdriverIO Test**
```javascript
import { LoginPage } from './scan-results/page-objects/LoginPage';

describe('Login Flow', () => {
  const loginPage = new LoginPage();

  it('should login successfully', async () => {
    await browser.url('/login');
    await loginPage.login('user@example.com', 'password123');
    await expect(browser).toHaveUrl(expect.stringContaining('/dashboard'));
  });
});
```

## 🔍 What Makes This Different

### **From Previous Registry Builder**
- **Simplified CLI**: Two parameters instead of complex configuration
- **Framework focus**: Generates ready-to-use page objects, not raw JSON
- **Best practices**: Each framework follows its official conventions
- **Bidirectional mapping**: Shows relationships between all components

### **From Generic Scrapers**
- **Test-focused**: Only elements with `data-testid` attributes
- **High confidence**: 10/10 confidence for test attributes
- **Framework-specific**: Tailored output for each automation framework
- **Clean naming**: Meaningful names like `loginButton` not `button_element`

## 🤝 Contributing

1. **Core scanning logic**: `page-scanner.ts`
2. **Framework generators**: `best-practices-generator.ts`
3. **CLI interface**: `cli.ts`
4. **Add new frameworks**: Extend the generator with framework-specific patterns

## 📄 Requirements

- **Node.js** 16+ with TypeScript support
- **npm** for dependencies
- **Source code** with `data-testid` attributes on interactive elements

## 📄 License

Open source - build amazing automation tools! 🎉

---

**Page Scanner CLI** - From codebase to framework-specific page objects with bidirectional mapping ⚡
