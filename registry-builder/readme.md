# 🎯 Test Automation Framework Registry Builder

A comprehensive tool for scanning web applications, generating page objects, and analyzing test automation coverage with bidirectional mapping between UI elements and existing tests.

## ✨ Features

### 🔍 **Intelligent Element Scanning**
- **Multi-framework support**: Playwright, WebdriverIO, Cypress, Selenium
- **User-first detection**: Prioritizes "what the user sees" - visible text, placeholders, ARIA labels
- **Page-aware analysis**: Organizes elements by page for better structure
- **Contextual confidence scoring**: Rates element reliability based on semantic meaning
- **Accessibility-focused**: ARIA attributes and semantic selectors get priority

### 🏗️ **Automated Page Object Generation**
- **Framework-specific syntax**: Generates correct code for your chosen framework
- **TypeScript support**: Strongly-typed page objects with proper imports
- **Smart naming**: Converts element names to proper camelCase properties
- **Class organization**: Creates separate page objects per page
- **Index file generation**: Provides convenient imports for all page objects

### 📊 **Advanced Coverage Analysis**
- **Bidirectional mapping**: Links scanned elements to existing test locators
- **Page-aware matching**: Ensures elements match on correct pages only
- **Confidence-based scoring**: Intelligent matching with similarity detection
- **Coverage metrics**: Detailed statistics on test automation coverage
- **Gap identification**: Highlights missing page object methods

### 🌐 **Interactive HTML Reports**
- **Page selector**: Filter elements by specific pages
- **Dynamic filtering**: Show all, covered, or new elements
- **Implementation guides**: Ready-to-copy code for missing elements
- **Framework-specific examples**: Shows only relevant framework code
- **Copy-to-clipboard**: One-click code copying for implementation
- **Visual indicators**: Clear status of matches and coverage

### 📄 **Registry JSON Output**
- **Machine-readable format**: Perfect for CI/CD integration
- **Complete element catalog**: All scanned elements with metadata
- **Match relationships**: Detailed mapping between elements and tests
- **Coverage statistics**: Quantified metrics for reporting
- **Bidirectional links**: Shows which tests use which elements

## 🎯 Philosophy: User-First Element Detection

### **Why "What the User Sees" Matters**

Traditional test automation tools often prioritize technical attributes like `data-testid` or CSS selectors. This tool takes a **user-centric approach**:

#### **🎯 User-Visible Elements Get Priority**
- `button=Login` is better than `[data-testid="login-btn"]` because users see "Login"
- `input[placeholder="Enter email"]` is better than `[data-testid="email"]` because users see the placeholder
- `link=View Products` is better than `[data-testid="products-link"]` because users see the link text

#### **♿ Accessibility-First Approach**
- ARIA labels and roles get high confidence because they improve accessibility
- Semantic HTML elements are prioritized over generic divs and spans
- Screen readers and assistive technologies benefit from semantic selectors

#### **🔧 Contextual data-testid Usage**
- `data-testid` gets **10/10 confidence** on non-semantic elements (forms, divs, containers)
- `data-testid` gets **8/10 confidence** on semantic elements (buttons, links) because better alternatives exist
- This encourages developers to use semantic HTML while still supporting test attributes

#### **🎨 Benefits of This Approach**
- **More maintainable tests**: User-visible text changes less frequently than internal IDs
- **Better accessibility**: Encourages semantic HTML and ARIA attributes
- **Easier debugging**: When tests fail, you can easily find elements by their visible text
- **Team alignment**: Developers, testers, and designers all understand user-visible elements

## 🚀 Quick Start

### Installation

```bash
npm install -g taf-registry-builder
```

### Basic Usage

```bash
# Scan a React app and generate Playwright page objects
npx ts-node src/element-cli.ts --scan ./src --framework playwright --output ./page-objects

# Analyze test coverage with existing tests
npx ts-node src/element-cli.ts --scan ./src --framework playwright --tests ./tests --registry

# Generate WebdriverIO page objects
npx ts-node src/element-cli.ts --scan ./src --framework webdriverio --output ./page-objects
```

## 📖 Detailed Usage

### Command Line Options

```bash
npx ts-node src/element-cli.ts [options]

Options:
  --scan <path>        Path to scan for React/HTML files
  --framework <name>   Testing framework (playwright|webdriverio|cypress|selenium)
  --output <path>      Output directory for page objects
  --tests <path>       Path to existing test files for coverage analysis
  --registry           Generate registry JSON and HTML reports
  --help              Show help information
```

### Framework Support

#### **Playwright**
```typescript
// Generated page object
export class LoginPage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(private page: Page) {
    this.usernameInput = page.locator('[data-testid="username"]');
    this.passwordInput = page.locator('[data-testid="password"]');
    this.loginButton = page.locator('[data-testid="login-btn"]');
  }
}

// Usage in tests
const loginPage = new LoginPage(page);
await loginPage.loginButton.click();
```

#### **WebdriverIO**
```typescript
// Generated page object
export class LoginPage {
  get usernameInput() {
    return $('[data-testid="username"]');
  }

  get passwordInput() {
    return $('[data-testid="password"]');
  }

  get loginButton() {
    return $('[data-testid="login-btn"]');
  }
}

// Usage in tests
const loginPage = new LoginPage();
await loginPage.loginButton.click();
```

#### **Cypress**
```typescript
// Generated page object
export class LoginPage {
  get usernameInput() {
    return cy.get('[data-testid="username"]');
  }

  get passwordInput() {
    return cy.get('[data-testid="password"]');
  }

  get loginButton() {
    return cy.get('[data-testid="login-btn"]');
  }
}

// Usage in tests
const loginPage = new LoginPage();
loginPage.loginButton.click();
```

## 📊 Coverage Analysis

### HTML Report Features

The interactive HTML report provides:

- **📄 Page Selector**: Filter elements by specific pages
- **🔍 Smart Filtering**: Show all, covered, or new elements
- **📊 Static Summary Cards**: Overall project statistics that don't change with filters
- **🎯 Implementation Guides**: Complete code examples for missing elements
- **📋 Copy-to-Clipboard**: One-click copying of implementation code
- **🌍 Filter Status**: Clear indication of current view
- **📅 Date Format**: dd/mm/yyyy format for international compatibility

### Registry JSON Structure

```json
{
  "metadata": {
    "framework": "playwright",
    "generatedAt": "10/08/2025 23:12:40",
    "version": "1.0.0"
  },
  "summary": {
    "total": 57,
    "exact": 27,
    "similar": 0,
    "none": 30,
    "coverage": 47.4
  },
  "elements": [
    {
      "name": "login_button",
      "page": "Login",
      "locator": "[data-testid=\"login-btn\"]",
      "locatorType": "testid",
      "confidence": 10,
      "matchType": "exact",
      "existingLocator": {
        "className": "LoginPage",
        "method": "loginButton",
        "filePath": "tests/pages/LoginPage.ts",
        "framework": "playwright"
      }
    }
  ]
}
```

## 🎯 Advanced Features

### Page-Aware Element Matching

The tool intelligently matches elements to existing page objects based on:

- **Page context**: Elements only match if they're on the correct page
- **Locator similarity**: Compares actual selectors used
- **Confidence scoring**: Rates match quality from 0-100%
- **Framework compatibility**: Ensures matches use the same testing framework

### Smart Element Detection

Elements are detected using a **"user-first"** strategy that prioritizes what users actually see and interact with:

#### **🎯 Highest Confidence (10/10 - ★★★★★)**: 
- **Semantic selectors with visible text**: `button=Login`, `link=View Products`
- **data-testid on non-semantic elements**: `div[data-testid="modal"]`, `form[data-testid="checkout"]`

#### **⭐ High Confidence (9/10 - ★★★★)**: 
- **User-visible placeholders**: `input[placeholder="Enter email"]`
- **ARIA labels**: `[aria-label="Close dialog"]`

#### **📍 Good Confidence (8/10 - ★★★★)**: 
- **data-testid on semantic elements**: `button[data-testid="submit"]` (lower because semantic alternative exists)
- **ARIA roles**: `[role="button"]`
- **Input names**: `input[name="username"]`

#### **🔍 Medium Confidence (7/10 - ★★★)**: 
- **Input types**: `input[type="email"]`
- **ID selectors**: `#login-form`

#### **⚠️ Low Confidence (3/10 - ★)**: 
- **CSS fallbacks**: `button`, `div`, `form`

### **Why This Approach?**

1. **🎯 User-Centric**: Tests should interact with elements the way users do
2. **🔍 Maintainable**: Visible text is less likely to change than internal IDs
3. **♿ Accessible**: Prioritizes ARIA attributes and semantic HTML
4. **🎨 Contextual**: `data-testid` gets full confidence only when semantic alternatives don't exist

### Bidirectional Registry

The registry provides complete bidirectional mapping:

- **Elements → Tests**: Which tests use each scanned element
- **Tests → Elements**: Which elements are used by each test file
- **Page Objects → Elements**: Which elements belong to each page object
- **Coverage Gaps**: Which elements need page object methods

### Interactive HTML Report

The HTML report includes:

- **Framework-specific implementation**: Shows only code for your chosen framework
- **Copy-to-clipboard functionality**: One-click copying of implementation code
- **Page filtering**: View elements by specific pages
- **Coverage filtering**: Show all, covered, or new elements only
- **Static summary cards**: Overall statistics that don't change with filters
- **Implementation guides**: Step-by-step code examples for new elements

## 🛠️ Development

### Building from Source

```bash
git clone <repository-url>
cd taf-registry-builder
npm install
npm run build
```

### Running Tests

```bash
npm test                    # Run all tests
npm test -- --watch        # Run tests in watch mode
npm run test:coverage       # Run tests with coverage
```

### Project Structure

```
src/
├── element-cli.ts          # Main CLI interface
├── element-scanner.ts      # Element detection logic
├── element-matcher.ts      # Coverage analysis engine
├── page-object-generator.ts # Code generation
└── types.ts               # TypeScript definitions

test/
├── unit/                  # Unit tests
└── fixtures/              # Test data
```

## 📈 Use Cases

### 🎯 **Test Automation Setup**
- Generate page objects for new projects
- Standardize element selectors across teams
- Create consistent page object patterns

### 📊 **Coverage Analysis**
- Identify gaps in test automation coverage
- Track progress of automation efforts
- Generate reports for stakeholders

### 🔄 **Maintenance & Refactoring**
- Find unused page object methods
- Identify duplicate element definitions
- Update selectors across multiple files

### 🚀 **CI/CD Integration**
- Automated coverage reporting
- Quality gates based on coverage metrics
- Continuous monitoring of test automation health

## 🎨 Example Outputs

### Console Output
```
🎯 PLAYWRIGHT Element Analysis

🔍 Scanning ./test for interactive elements...
✅ Found 5 pages with 57 interactive elements

📄 Test (/testpage)
   button   button_submit_form   ★★★★★ button=Submit Form
   input    input_enter_email    ★★★★ input[placeholder="Enter email"]
   button   button_add_to_cart   ★★★★★ button=Add to Cart
   ... and 12 more

📄 Checkout (/checkoutpage)
   form     form_checkout        ★★★★★ [data-testid="shipping-form"]
   input    input_first_name     ★★★★ input[placeholder="First Name"]
   input    input_address        ★★★★ input[placeholder="Address"]
   ... and 9 more

🏗️  Generating playwright page objects in typescript...
   ✅ TestPage.ts (17 elements)
   ✅ CheckoutPage.ts (14 elements)
   ✅ HomePage.ts (9 elements)

🔍 Analyzing playwright test coverage...
   📊 57 total elements scanned
   ✅ 27 elements already covered
   🆕 30 elements need page object methods
   📈 47.4% test coverage

🌐 Coverage analysis: test/scan-results/registry/element-matches.html
📄 Registry JSON: test/scan-results/registry/registry.json
```

### Generated Files Structure
```
scan-results/
├── page-objects/
│   ├── TestPage.ts
│   ├── CheckoutPage.ts
│   ├── HomePage.ts
│   ├── ProductPage.ts
│   ├── LoginPage.ts
│   └── index.ts
└── registry/
    ├── element-matches.html
    └── registry.json
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for modern test automation frameworks
- Inspired by the need for better test coverage visibility
- Designed to reduce manual page object maintenance

---

**🎯 Ready to supercharge your test automation? Get started with the Test Automation Framework Registry Builder today!**
