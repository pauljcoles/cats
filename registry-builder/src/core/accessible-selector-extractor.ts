import { Node, SyntaxKind } from 'ts-morph';
import { AccessibleSelectors } from '../types';

/**
 * Extracts accessible selectors following Testing Library priority order:
 * byRole > byLabelText > byPlaceholderText > byText > byDisplayValue > byAltText > byTitle > byTestId
 */
export class AccessibleSelectorExtractor {
  /**
   * Extract all accessible selectors from a JSX element
   */
  extract(jsxElement: Node, tagName: string): AccessibleSelectors {
    const selectors: AccessibleSelectors = {};
    const elementText = jsxElement.getText();

    // Priority 1: byRole (highest priority)
    const role = this.extractRole(jsxElement, tagName, elementText);
    if (role) {
      selectors.byRole = role;
    }

    // Priority 2: byLabelText  
    const labelText = this.extractLabelText(jsxElement, elementText);
    if (labelText) {
      selectors.byLabelText = labelText;
    }

    // Priority 3: byPlaceholderText
    const placeholderText = this.extractPlaceholderText(elementText);
    if (placeholderText) {
      selectors.byPlaceholderText = placeholderText;
    }

    // Priority 4: byText
    const text = this.extractText(jsxElement, elementText);
    if (text) {
      selectors.byText = text;
    }

    // Priority 5: byDisplayValue (for form elements)
    const displayValue = this.extractDisplayValue(elementText, tagName);
    if (displayValue) {
      selectors.byDisplayValue = displayValue;
    }

    // Priority 6: byAltText (for images)
    const altText = this.extractAltText(elementText);
    if (altText) {
      selectors.byAltText = altText;
    }

    // Priority 7: byTitle
    const title = this.extractTitle(elementText);
    if (title) {
      selectors.byTitle = title;
    }

    // Priority 8: byTestId (lowest priority - last resort)
    const testId = this.extractTestId(elementText);
    if (testId) {
      selectors.byTestId = testId;
    }

    return selectors;
  }

  /**
   * Extract role attribute or infer semantic role
   */
  private extractRole(jsxElement: Node, tagName: string, elementText: string): string | undefined {
    // Check for explicit role attribute
    const explicitRoleMatch = elementText.match(/role=['"`]([^'"`]+)['"`]/);
    if (explicitRoleMatch) {
      return explicitRoleMatch[1];
    }

    // Infer semantic roles from HTML elements
    const semanticRoles: Record<string, string> = {
      'button': 'button',
      'a': 'link',
      'input': this.getInputRole(elementText),
      'textarea': 'textbox',
      'select': 'combobox',
      'form': 'form',
      'nav': 'navigation',
      'main': 'main',
      'header': 'banner',
      'footer': 'contentinfo',
      'aside': 'complementary',
      'section': 'region',
      'article': 'article',
      'h1': 'heading',
      'h2': 'heading',
      'h3': 'heading',
      'h4': 'heading',
      'h5': 'heading',
      'h6': 'heading',
      'img': 'img',
      'table': 'table',
      'ul': 'list',
      'ol': 'list',
      'li': 'listitem'
    };

    const role = semanticRoles[tagName.toLowerCase()];
    return role || undefined;
  }

  /**
   * Get specific role for input elements based on type
   */
  private getInputRole(elementText: string): string {
    const typeMatch = elementText.match(/type=['"`]([^'"`]+)['"`]/);
    const inputType = typeMatch ? typeMatch[1].toLowerCase() : 'text';

    const inputRoles: Record<string, string> = {
      'button': 'button',
      'submit': 'button',
      'reset': 'button',
      'checkbox': 'checkbox',
      'radio': 'radio',
      'range': 'slider',
      'search': 'searchbox',
      'email': 'textbox',
      'password': 'textbox',
      'tel': 'textbox',
      'url': 'textbox',
      'number': 'spinbutton'
    };

    return inputRoles[inputType] || 'textbox';
  }

  /**
   * Extract label text from aria-label or associated label elements
   */
  private extractLabelText(jsxElement: Node, elementText: string): string | undefined {
    // Check for aria-label
    const ariaLabelMatch = elementText.match(/aria-label=['"`]([^'"`]+)['"`]/);
    if (ariaLabelMatch) {
      return ariaLabelMatch[1];
    }

    // Check for aria-labelledby (would need more complex resolution)
    const ariaLabelledByMatch = elementText.match(/aria-labelledby=['"`]([^'"`]+)['"`]/);
    if (ariaLabelledByMatch) {
      // In a full implementation, we'd resolve the referenced element
      // For now, return a placeholder indicating this needs resolution
      return `[aria-labelledby="${ariaLabelledByMatch[1]}"]`;
    }

    // TODO: Check for associated label elements via htmlFor/id relationship
    // This would require analyzing the broader DOM context

    return undefined;
  }

  /**
   * Extract placeholder text
   */
  private extractPlaceholderText(elementText: string): string | undefined {
    const placeholderMatch = elementText.match(/placeholder=['"`]([^'"`]+)['"`]/);
    return placeholderMatch ? placeholderMatch[1] : undefined;
  }

  /**
   * Extract visible text content
   */
  private extractText(jsxElement: Node, elementText: string): string | undefined {
    // Method 1: Simple regex for text between JSX tags
    const simpleTextMatch = elementText.match(/>([^<{]+)</);
    if (simpleTextMatch && simpleTextMatch[1].trim()) {
      return simpleTextMatch[1].trim();
    }

    // Method 2: Look for string literals in JSX expressions
    const jsxTextMatch = elementText.match(/>\s*\{['"`]([^'"`]+)['"`]\}/);
    if (jsxTextMatch) {
      return jsxTextMatch[1];
    }

    // Method 3: Check for common button/link text patterns
    const buttonTextMatch = elementText.match(/>\s*([A-Za-z\s]+)\s*</);
    if (buttonTextMatch && buttonTextMatch[1].trim().length > 0) {
      const text = buttonTextMatch[1].trim();
      // Filter out likely variable names or code
      if (!text.includes('{') && !text.includes('(') && text.length < 50) {
        return text;
      }
    }

    return undefined;
  }

  /**
   * Extract display value for form elements
   */
  private extractDisplayValue(elementText: string, tagName: string): string | undefined {
    // Only relevant for form elements
    if (!['input', 'textarea', 'select'].includes(tagName.toLowerCase())) {
      return undefined;
    }

    // Check for value attribute
    const valueMatch = elementText.match(/value=['"`]([^'"`]+)['"`]/);
    if (valueMatch) {
      return valueMatch[1];
    }

    // Check for defaultValue
    const defaultValueMatch = elementText.match(/defaultValue=['"`]([^'"`]+)['"`]/);
    if (defaultValueMatch) {
      return defaultValueMatch[1];
    }

    return undefined;
  }

  /**
   * Extract alt text for images
   */
  private extractAltText(elementText: string): string | undefined {
    const altMatch = elementText.match(/alt=['"`]([^'"`]+)['"`]/);
    return altMatch ? altMatch[1] : undefined;
  }

  /**
   * Extract title attribute
   */
  private extractTitle(elementText: string): string | undefined {
    const titleMatch = elementText.match(/title=['"`]([^'"`]+)['"`]/);
    return titleMatch ? titleMatch[1] : undefined;
  }

  /**
   * Extract test ID (lowest priority)
   */
  private extractTestId(elementText: string): string | undefined {
    // Common test ID attributes in order of preference
    const testIdAttributes = [
      'data-testid',
      'data-cy', 
      'data-test',
      'data-qa',
      'testid',
      'test-id'
    ];

    for (const attr of testIdAttributes) {
      const regex = new RegExp(`${attr}=['"\`]([^'"\`]+)['"\`]`);
      const match = elementText.match(regex);
      if (match) {
        return match[1];
      }
    }

    return undefined;
  }
}