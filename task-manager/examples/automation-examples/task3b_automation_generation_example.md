# Task 3b: Automation Generation Example

## Input Context for Task 3b

### Approved Scenario from Task 3a
```gherkin
@P0 @paint-selection
Scenario: Paint selection updates vehicle preview
  Given I am on the car configuration page
  When I select the paint color "Red Metallic"  
  Then the car preview should update to show the "Red Metallic" paint
  And the selected paint should be visually highlighted
```

### Domain Context (Mercedes Domain)
```json
"colors": {
  "C001": "Polar White",
  "C002": "Obsidian Black Metallic", 
  "C003": "Brilliant Blue Metallic"
}
```

### State/Flow Context
```
STATE: color_selection
COMPONENT: OneConfig__mainContainer (CATCOLORS1)
SELECTOR_PATTERNS:
  - div.OneConfig__mainContainer li:nth-of-type(N) div
  - Visual swatch elements (no text selectors)
BUSINESS_LOGIC:
  - Single selection from color palette
  - Color preview updates vehicle visualization
```

---

## Generated React Testing Library Code

### Component Test Pattern
```typescript
// paint-selection.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CarConfigurator } from '../components/CarConfigurator';
import { ConfigurationProvider } from '../contexts/ConfigurationContext';

describe('Paint Selection - Car Configuration', () => {
  const user = userEvent.setup();

  const renderCarConfigurator = () => {
    return render(
      <ConfigurationProvider>
        <CarConfigurator />
      </ConfigurationProvider>
    );
  };

  it('should update vehicle preview when paint color is selected', async () => {
    // Given I am on the car configuration page
    renderCarConfigurator();
    
    // Wait for configuration page to load
    await waitFor(() => {
      expect(screen.getByRole('main', { name: /car configuration/i })).toBeInTheDocument();
    });

    // When I select the paint color "Red Metallic"
    const redMetallicOption = screen.getByRole('button', { 
      name: /red metallic/i,
      description: /paint color option/i 
    });
    await user.click(redMetallicOption);

    // Then the car preview should update to show the "Red Metallic" paint
    await waitFor(() => {
      const carPreview = screen.getByTestId('car-preview-image');
      expect(carPreview).toHaveAttribute('data-color', 'red-metallic');
      expect(carPreview).toHaveAttribute('alt', expect.stringContaining('Red Metallic'));
    });

    // And the selected paint should be visually highlighted
    expect(redMetallicOption).toHaveClass('selected');
    expect(redMetallicOption).toHaveAttribute('aria-selected', 'true');
  });

  it('should update pricing when premium paint is selected', async () => {
    renderCarConfigurator();

    await waitFor(() => {
      expect(screen.getByRole('main', { name: /car configuration/i })).toBeInTheDocument();
    });

    // Select premium paint option
    const premiumPaintOption = screen.getByRole('button', { 
      name: /obsidian black metallic/i 
    });
    await user.click(premiumPaintOption);

    // Verify pricing update
    await waitFor(() => {
      const pricingSection = screen.getByTestId('pricing-summary');
      expect(pricingSection).toHaveTextContent('Paint: £795');
      expect(pricingSection).toHaveTextContent(/total:.*£\d+,\d+/i);
    });
  });

  it('should handle unavailable paint colors gracefully', async () => {
    renderCarConfigurator();

    await waitFor(() => {
      expect(screen.getByRole('main', { name: /car configuration/i })).toBeInTheDocument();
    });

    // Attempt to select unavailable color
    const unavailableColor = screen.getByRole('button', { 
      name: /special edition color/i 
    });
    expect(unavailableColor).toBeDisabled();
    expect(unavailableColor).toHaveAttribute('aria-label', 
      expect.stringContaining('currently unavailable'));
  });
});
```

---

## Generated Playwright Code

### E2E Test Pattern
```typescript
// paint-selection.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Car Configurator - Paint Selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/configurator/mercedes/c-class');
    await expect(page.getByRole('main', { name: /car configuration/i })).toBeVisible();
  });

  test('should complete paint selection user journey', async ({ page }) => {
    // Given I am on the car configuration page
    await expect(page.locator('[data-testid="configuration-step"]')).toHaveText('Color Selection');

    // When I select the paint color "Red Metallic"
    const colorPalette = page.locator('.mb-color-palette');
    await expect(colorPalette).toBeVisible();
    
    const redMetallicSwatch = colorPalette.locator('[data-color="red-metallic"]');
    await redMetallicSwatch.click();

    // Then the car preview should update to show the "Red Metallic" paint
    const carPreview = page.locator('[data-testid="mb-vehicle-preview"]');
    await expect(carPreview).toHaveAttribute('data-current-color', 'red-metallic');
    
    // Verify visual preview update
    await expect(carPreview.locator('img')).toHaveAttribute('src', 
      expect.stringContaining('red-metallic'));

    // And the selected paint should be visually highlighted  
    await expect(redMetallicSwatch).toHaveClass(/selected/);
    await expect(redMetallicSwatch).toHaveCSS('border-color', 'rgb(0, 150, 0)'); // Green selection border
  });

  test('should navigate through complete configuration flow', async ({ page }) => {
    // Start with paint selection
    await page.locator('[data-color="polar-white"]').click();
    
    // Verify selection and continue
    await expect(page.locator('[data-testid="mb-color-preview"]')).toHaveText('Polar White');
    
    const continueButton = page.getByRole('button', { name: /continue to next step/i });
    await expect(continueButton).toBeEnabled();
    await continueButton.click();

    // Verify progression to next step
    await expect(page.locator('[data-testid="configuration-step"]')).toHaveText('Interior Selection');
  });

  test('should handle mobile viewport paint selection', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Mobile-specific color selection interaction
    const colorSection = page.locator('.mb-color-palette');
    await expect(colorSection).toBeVisible();
    
    // Scroll horizontally through color options on mobile
    const colorOptions = colorSection.locator('[data-testid="color-option"]');
    await expect(colorOptions).toHaveCount(5);
    
    // Select color with touch interaction
    await colorOptions.nth(2).tap();
    
    // Verify mobile-optimized preview
    const mobilePreview = page.locator('[data-testid="mobile-car-preview"]');
    await expect(mobilePreview).toBeVisible();
  });
});
```

---

## Generated Page Object Pattern

### Reusable Test Components
```typescript
// page-objects/CarConfiguratorPage.ts
import { Page, Locator, expect } from '@playwright/test';

export class CarConfiguratorPage {
  private readonly page: Page;
  private readonly colorPalette: Locator;
  private readonly carPreview: Locator;
  private readonly pricingSummary: Locator;

  constructor(page: Page) {
    this.page = page;
    this.colorPalette = page.locator('[data-testid="color-palette"]');
    this.carPreview = page.locator('[data-testid="car-preview"]');
    this.pricingSummary = page.locator('[data-testid="pricing-summary"]');
  }

  async goto() {
    await this.page.goto('/configurator');
    await expect(this.page.getByRole('main')).toBeVisible();
  }

  async selectPaintColor(colorName: string) {
    const colorSelector = this.colorPalette.locator(`[data-color-name="${colorName}"]`);
    await colorSelector.click();
    await expect(colorSelector).toHaveClass(/selected/);
  }

  async verifyPaintSelection(colorName: string) {
    await expect(this.carPreview).toHaveAttribute('data-current-color', 
      colorName.toLowerCase().replace(' ', '-'));
  }

  async verifyPricingUpdate(expectedPaintCost: string) {
    await expect(this.pricingSummary).toContainText(`Paint: ${expectedPaintCost}`);
  }

  async getPaintOptions(): Promise<string[]> {
    const options = await this.colorPalette.locator('[data-color-name]').all();
    return Promise.all(options.map(option => option.getAttribute('data-color-name')));
  }
}
```

---

## Generated Step Definitions (if using Cucumber)

### BDD Integration Pattern
```typescript
// step-definitions/paint-selection.steps.ts
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CarConfiguratorPage } from '../page-objects/CarConfiguratorPage';

Given('I am on the car configuration page', async function () {
  this.configuratorPage = new CarConfiguratorPage(this.page);
  await this.configuratorPage.goto();
});

When('I select the paint color {string}', async function (colorName: string) {
  await this.configuratorPage.selectPaintColor(colorName);
});

Then('the car preview should update to show the {string} paint', async function (colorName: string) {
  await this.configuratorPage.verifyPaintSelection(colorName);
});

Then('the selected paint should be visually highlighted', async function () {
  const selectedColor = this.page.locator('[data-testid="color-palette"] .selected');
  await expect(selectedColor).toBeVisible();
  await expect(selectedColor).toHaveCSS('border-width', '2px');
});
```

---

## Implementation Notes Report

### Required Page Objects
```typescript
interface CarConfiguratorComponents {
  // Main container
  configurationContainer: '[data-testid="car-configurator"]';
  
  // Color selection
  colorPalette: '[data-testid="color-palette"]';
  colorSwatch: '[data-color-name]';
  
  // Preview components  
  carPreview: '[data-testid="car-preview"]';
  colorPreview: '[data-testid="color-preview-text"]';
  
  // Pricing components
  pricingSummary: '[data-testid="pricing-summary"]';
  paintPricing: '[data-testid="paint-price"]';
  
  // Navigation
  continueButton: '[data-testid="continue-step"]';
  backButton: '[data-testid="previous-step"]';
}
```

### Missing Step Definitions
- "I am on the car configuration page" → Navigation and page load verification
- "I select the paint color [COLOR]" → Dynamic color selection using domain data  
- "the car preview should update" → Visual preview change validation
- "should be visually highlighted" → Selection state verification

### Domain Integration Points
```typescript
// Integration with domain test data
const domainColors = {
  mercedes: ["Polar White", "Obsidian Black Metallic", "Brilliant Blue Metallic"],
  bmw: ["Alpine White III", "Jet Black", "Storm Bay"],
  renault: ["Pearl White", "Diamond Black", "Flame Red"]
};

// Dynamic test generation based on domain
domainColors.mercedes.forEach(color => {
  test(`should select ${color} successfully`, async ({ page }) => {
    const configurator = new CarConfiguratorPage(page);
    await configurator.selectPaintColor(color);
    await configurator.verifyPaintSelection(color);
  });
});
```

### Accessibility Testing Integration
```typescript
// Accessibility validation for paint selection
test('paint selection should be accessible', async ({ page }) => {
  const colorOptions = page.locator('[role="button"][data-color-name]');
  
  // Verify ARIA attributes
  await expect(colorOptions.first()).toHaveAttribute('aria-label');
  await expect(colorOptions.first()).toHaveAttribute('role', 'button');
  
  // Verify keyboard navigation
  await colorOptions.first().focus();
  await page.keyboard.press('ArrowRight');
  await expect(colorOptions.nth(1)).toBeFocused();
  
  // Verify screen reader support
  await expect(colorOptions.first()).toHaveAttribute('aria-describedby');
});
```

This demonstrates how the simplified base rules generate production-ready automation code that integrates with domain data, follows modern testing patterns, and provides comprehensive coverage of user interactions.