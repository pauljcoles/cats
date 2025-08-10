# Page Scanner - Interactive Element Finder for Test Automation 🚀

**Scan React/Vue codebases and generate ready-to-use page objects for multiple test frameworks**

## 🎯 What It Does

- **Scans codebases** → Finds React/Vue page components
- **Extracts interactive elements** → Buttons, inputs, forms (skips noise)  
- **Generates smart locators** → Semantic-first with confidence scoring
- **Creates page objects** → For Playwright, Cypress, Selenium, Puppeteer, WebDriverIO
- **Multiple languages** → TypeScript, JavaScript, Python

## ⚡ Quick Start

```bash
# Clone or copy the project
cd page-scanner

# Install dependencies  
npm install

# Scan your React/Vue app
npx ts-node src/cli.ts --scan ./src/pages

# Generate page objects
npx ts-node src/cli.ts --scan ./src \
  --framework playwright \
  --language typescript \
  --output ./page-objects
```

## 🏗️ Supported Frameworks

### **Playwright + TypeScript**
```bash
npx ts-node src/cli.ts --scan ./src \
  --framework playwright --language typescript --output ./page-objects
```

### **WebDriverIO + TypeScript (with getters!)**
```bash
npx ts-node src/cli.ts --scan ./src \
  --framework webdriverio --language typescript --output ./wdio-pages
```

### **Cypress + JavaScript**
```bash
npx ts-node src/cli.ts --scan ./src \
  --framework cypress --language javascript --output ./cypress/pages
```

### **Selenium + Python**
```bash
npx ts-node src/cli.ts --scan ./src \
  --framework selenium --language python --output ./pages
```

### **All Supported Options**
- **Frameworks**: `playwright`, `cypress`, `selenium`, `puppeteer`, `webdriverio`
- **Languages**: `typescript`, `javascript`, `python`

## 📊 Example Output

### **Scan Results**
```
📄 INTERACTIVE PAGES FOUND:

🔥 SingleProduct
   📁 .../src/pages/SingleProduct.tsx
   🌐 /singleproduct  
   🎯 3 interactive elements:

      🔘 button (3)
         • button_add_to_cart → button=ADD TO CART ★★★★★
         • button_buy_now → button=BUY NOW ★★★★★
         • button_add_to_wishlist → button=ADD TO WISHLIST ★★★★★

📊 SUMMARY:
   📄 Pages: 2
   🎯 Interactive Elements: 4
   🏆 Top Elements: button(3), select(1)
```

### **Generated WebDriverIO Page Object (with getters!)**
```typescript
export class SingleProductPage {
  /**
   * Get button_add_to_cart element  
   * button - semantic (confidence: 9/10)
   */
  get button_add_to_cart() {
    return $('button=ADD TO CART');
  }

  /**
   * Click button_add_to_cart
   */
  async clickButton_add_to_cart() {
    await this.button_add_to_cart.click();
  }

  async open() {
    await browser.url('/singleproduct');
    await this.waitForLoad();
  }
}
```

### **Generated Playwright Page Object**
```typescript  
export class SingleProductPage {
  constructor(private page: Page) {}

  selectors = {
    button_add_to_cart: 'button=ADD TO CART', // confidence: 9/10
    button_buy_now: 'button=BUY NOW',
    button_add_to_wishlist: 'button=ADD TO WISHLIST',
  };

  async navigateTo(): Promise<void> {
    await this.page.goto('/singleproduct');
    await this.waitForLoad();
  }

  async clickButton_add_to_cart(): Promise<void> {
    await this.page.locator('button=ADD TO CART').click();
  }
}
```

## 🎯 Key Features

### **Smart Locator Generation**
- **Semantic-first**: `button=Submit` (confidence: 9/10)
- **Test ID fallbacks**: `[data-testid="submit-btn"]` (confidence: 10/10)
- **Attribute-based**: `input[name="email"]` (confidence: 8/10)
- **Meaningful names**: `button_add_to_cart` not `button_element`

### **Clean, Focused Results**  
- ✅ **Only interactive elements**: buttons, inputs, selects, forms, links
- ❌ **Skips noise**: divs, spans, tables, headers (unless interactive)
- 📄 **Page-organized**: Clean separation by component
- ⭐ **Priority scoring**: Focus on high-confidence elements first

### **Framework-Specific Patterns**

**WebDriverIO (Getters)**
```typescript
get submitButton() { return $('button=Submit'); }
await this.submitButton.click();
```

**Playwright (Locators)**  
```typescript
await this.page.locator('button=Submit').click();
```

**Cypress (Selectors)**
```javascript  
cy.get('button=Submit').click();
```

## 📁 Project Structure

```
page-scanner/
├── src/
│   ├── cli.ts                    # Command-line interface
│   ├── page-scanner.ts           # Core scanning logic
│   └── page-object-generator.ts  # Multi-framework generators
├── tools/                        # Analysis tools (from old registry)
└── page-objects/                 # Generated page objects
```

## 🔧 Advanced Usage

### **Analyze Only (No Generation)**
```bash
npx ts-node src/cli.ts --scan ./src/pages
```

### **Multiple Page Object Formats**
```bash
# Generate for multiple frameworks
npx ts-node src/cli.ts --scan ./src --framework playwright --output ./playwright-pages
npx ts-node src/cli.ts --scan ./src --framework webdriverio --output ./wdio-pages  
npx ts-node src/cli.ts --scan ./src --framework cypress --output ./cypress-pages
```

### **Page Component Discovery**
The scanner automatically finds page components in:
- `**/pages/**/*.{tsx,ts,vue}`
- `**/views/**/*.{tsx,ts,vue}`  
- `**/*Page.{tsx,ts,vue}`
- `**/*View.{tsx,ts,vue}`

## 🎨 Web Interface (Legacy)

For visual analysis, use the web interface from the `tools/` directory:

```bash
cd tools  
cp /path/to/registry-output/complete-registry.json ./
python3 -m http.server 8000
# Visit http://localhost:8000/registry-viewer.html
```

## 🚀 Integration Examples

### **Playwright Test**
```typescript
import { test, expect } from '@playwright/test';
import { SingleProductPage } from './page-objects/SingleProductPage';

test('add to cart', async ({ page }) => {
  const singleProduct = new SingleProductPage(page);
  
  await singleProduct.navigateTo();
  await singleProduct.clickButton_add_to_cart();
  
  // Assertions...
});
```

### **WebDriverIO Test**  
```javascript
import { SingleProductPage } from './wdio-pages/SingleProductPage';

describe('Product Page', () => {
  const singleProductPage = new SingleProductPage();

  it('should add to cart', async () => {
    await singleProductPage.open();
    await expect(singleProductPage.button_add_to_cart).toBeDisplayed();
    await singleProductPage.clickButton_add_to_cart();
  });
});
```

### **Cypress Test**
```javascript  
const SingleProductPage = require('../pages/SingleProductPage');

describe('Product Page', () => {
  const singleProductPage = new SingleProductPage();

  it('should add to cart', () => {
    singleProductPage.navigateTo();
    singleProductPage.clickButton_add_to_cart();
  });
});
```

## 🔍 What Makes This Different

### **Before (Raw DOM Scraping)**
- 242 elements including divs, spans, p tags
- Generic names like `button_element`, `div_element`  
- Mixed components and elements in same output
- No framework-specific patterns

### **After (Page Scanner)**  
- 4 actionable interactive elements
- Smart names like `button_add_to_cart`, `input_search`
- Clean page-by-page organization  
- Framework-specific page objects ready to use

## 📈 Migration from Registry Builder

If you're using the old TAF Registry Builder:

1. **Same core technology** - builds on the registry builder foundation
2. **Focused scope** - pure automation element extraction
3. **Better output** - ready-to-use page objects vs raw JSON
4. **Multiple frameworks** - not just TAF-specific

```bash
# Old way (registry builder)  
npm run build && node dist/registry-builder.js /path/to/project

# New way (page scanner)
npx ts-node src/cli.ts --scan /path/to/project --framework playwright --output ./pages
```

## 🤝 Contributing

1. The core scanning logic is in `page-scanner.ts`
2. Framework generators are in `page-object-generator.ts`  
3. CLI interface is in `cli.ts`
4. Add new frameworks by extending the generator

## 📄 License

Open source - build amazing automation tools! 🎉

---

**Page Scanner** - From codebase to page objects in seconds ⚡