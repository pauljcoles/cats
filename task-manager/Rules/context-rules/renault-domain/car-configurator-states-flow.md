# Car Configurator States and Flow Context

## Purpose
This document provides state/flow context for AI-driven BDD scenario generation and test automation creation. It describes the real-world complexity of car configuration systems based on actual production configurator behavior.

---

## Entry Points and Initial State

### Navigation Entry
- **URL Pattern**: `/electric-vehicles/[model-name].html`
- **Initial State**: Model information page with configuration entry point
- **Trigger Action**: "Configure" button or equivalent CTA
- **State Transition**: Model Info → Configuration Start

### Configuration Entry State
```
INITIAL_STATE:
  - Page: Configuration interface loaded
  - Viewport: Standard desktop (1163x1276 typical)
  - Components: Engine selection visible as first step
  - User Journey: Ready to begin configuration process
```

---

## Core Configuration Flow

### 1. Engine/Power Selection
```
STATE: engine_selection
COMPONENT: RadioGroupButton (#engines)
USER_ACTION: Select power option (e.g., "150 hp")
SELECTOR_PATTERNS: 
  - #engines > div.RadioGroupButton > div:nth-of-type(N) span
  - text/150 hp
  - aria-label patterns for power options
BUSINESS_LOGIC:
  - Single selection (radio button behavior)
  - Available options depend on model
  - Selection affects subsequent availability
NEXT_STATE: grade_selection_enabled
```

### 2. Grade/Trim Selection  
```
STATE: grade_selection
COMPONENT: RadioGroupButton (#grades)  
USER_ACTION: Select grade level (e.g., "iconic five" → "Roland Garros")
SELECTOR_PATTERNS:
  - #grades > div.RadioGroupButton > div:nth-of-type(N) span
  - text/iconic five, text/Roland Garros
  - Progressive upgrade selections
BUSINESS_LOGIC:
  - Single selection with upgrade paths
  - Users can change between grades
  - Higher grades include lower grade features
  - Affects pricing and available accessories
NEXT_STATE: color_selection_enabled
```

### 3. Color Selection
```
STATE: color_selection
COMPONENT: OneConfig__mainContainer (CATCOLORS1)
USER_ACTION: Select exterior color from visual swatches
SELECTOR_PATTERNS:
  - div.OneConfig__mainContainer li:nth-of-type(N) div
  - #CATCOLORS1/div[2]/div[2]/ul/li[N]/span/button/div
  - Visual swatch elements (no text selectors)
BUSINESS_LOGIC:
  - Single selection from color palette
  - Visual representation (color swatches)
  - May affect pricing (premium colors)
  - Color preview updates vehicle visualization
NEXT_STATE: interior_selection_enabled
```

### 4. Interior/Wheels Selection
```
STATE: interior_selection
COMPONENT: Configuration section (PC01)
USER_ACTION: Select interior style/wheel combination
SELECTOR_PATTERNS:
  - #PC01 li:nth-of-type(N) div
  - Interior/wheel combination selectors
BUSINESS_LOGIC:
  - Combined interior/wheel selection
  - Package-dependent options
  - Affects comfort and performance characteristics
NEXT_STATE: accessories_selection_enabled
```

### 5. Accessories Configuration
```
STATE: accessories_selection
COMPONENT: Accessories section (#accessories)
BUSINESS_LOGIC:
  - Multiple categories: Interior, Exterior, Transport, Design & Styling
  - Multiple selection types: checkboxes and item cards
  - Category-based organization with progressive disclosure
  - Individual item pricing (e.g., £34 for storage lid)
```

#### 5a. Interior Accessories
```
SUBSTATE: interior_accessories
USER_ACTION: Select interior add-ons via checkboxes
SELECTOR_PATTERNS:
  - #accessories > div:nth-of-type(2) div.Checkbox
  - Checkbox selection patterns
  - Label-based selections
SELECTION_TYPE: Multiple (checkbox behavior)
```

#### 5b. Premium Interior Items
```
SUBSTATE: premium_interior_items
USER_ACTION: Select premium items via equipment cards
SELECTOR_PATTERNS:
  - div:nth-of-type(N) > button.OneConfigEquipmentCard__trigger
  - aria/[Product description with price]
  - Complex equipment card selections
EXAMPLE: "blue numbeR5 lid for large central storage compartment £34"
SELECTION_TYPE: Single item selection with detailed descriptions
```

#### 5c. Category Navigation
```
SUBSTATE: accessory_categories  
USER_ACTION: Navigate between accessory categories
CATEGORIES:
  - INTERIOR (default/first)
  - EXTERIOR
  - TRANSPORT AND PROTECTION  
  - DESIGN & STYLING
SELECTOR_PATTERNS:
  - aria/CATEGORY_NAME > aria/[role="generic"]
  - div:nth-of-type(N) > button > span
  - Category-specific button selectors
BUSINESS_LOGIC:
  - Tab-based navigation between categories
  - Each category has distinct inventory
  - Category selection changes available accessories
```

#### 5d. Category-Specific Selections
```
SUBSTATE: category_specific_accessories
USER_ACTION: Select items within active category
SELECTOR_PATTERNS:
  - #accessories > div:nth-of-type(5) div.Checkbox__boxContainer
  - Category-specific checkbox and card patterns
BUSINESS_LOGIC:
  - Category determines available options
  - Multiple selections within categories
  - Individual item pricing and descriptions
```

---

## Checkout and Completion Flow

### 6. Configuration Summary
```
STATE: configuration_complete
COMPONENT: OneConfigReceiptCta
USER_ACTION: Review configuration and proceed to purchase
SELECTOR_PATTERNS:
  - div.OneConfigReceiptCta > button
  - Final CTA button for checkout
BUSINESS_LOGIC:
  - Configuration summary displayed
  - Total pricing calculated
  - All selections preserved
NEXT_STATE: checkout_initiation
```

### 7. Account/Login Flow
```
STATE: checkout_initiation  
COMPONENT: Dialog system
USER_ACTION: Login or account creation required
SELECTOR_PATTERNS:
  - aria/login to My Renault
  - div.Dialog button.is-cta-primary
  - Modal dialog interactions
BUSINESS_LOGIC:
  - Authentication required for purchase
  - Account integration for saved configurations
  - Transition to external login system
FINAL_STATE: external_checkout_process
```

---

## State Transitions and Dependencies

### Progressive Enablement
```
DEPENDENCY_CHAIN:
Engine Selected → Grade Enabled
Grade Selected → Color Enabled  
Color Selected → Interior Enabled
Interior Selected → Accessories Enabled
Accessories Configured → Checkout Enabled
```

### Change Propagation
```
CHANGE_EFFECTS:
Engine Change → May affect grade availability
Grade Change → Affects accessory options and pricing
Color Change → Updates visual preview
Interior Change → Affects available accessories
Accessory Changes → Updates total pricing
```

### Validation States
```
VALIDATION_POINTS:
- Engine selection: Required before progression
- Grade selection: Required, affects downstream options
- Color selection: Required for visual completion
- Interior selection: Required for functional completion
- Accessory selection: Optional but affects pricing
```

---

## Component Patterns and Selectors

### RadioGroupButton Pattern
```
STRUCTURE: #section > div.RadioGroupButton > div:nth-of-type(N)
BEHAVIOR: Single selection, visual highlighting of selected state
TEXT_SELECTORS: Available for most options (text/150 hp)
USAGE: Engine selection, grade selection
```

### OneConfig Component Pattern  
```
STRUCTURE: div.OneConfig__mainContainer li:nth-of-type(N) div
BEHAVIOR: Visual selection (color swatches), single selection
TEXT_SELECTORS: Not available (visual selection only)
USAGE: Color selection, visual configuration elements
```

### Checkbox Pattern
```
STRUCTURE: div.Checkbox, div.Checkbox__boxContainer
BEHAVIOR: Multiple selection, independent selections
LABEL_SELECTORS: Associated label elements available
USAGE: Accessory selection, add-on options
```

### Equipment Card Pattern
```
STRUCTURE: button.OneConfigEquipmentCard__trigger
BEHAVIOR: Item selection with detailed descriptions
ARIA_SELECTORS: Complex aria-label patterns with pricing
USAGE: Premium accessories, detailed item selection
```

### Dialog/Modal Pattern
```
STRUCTURE: div.Dialog button.is-cta-primary
BEHAVIOR: Modal interactions, form submissions
NAVIGATION: Can trigger page transitions
USAGE: Account flow, checkout initiation
```

---

## Business Logic Complexity

### Pricing Integration
- **Dynamic Pricing**: Selections affect total cost in real-time
- **Premium Options**: Some colors, accessories carry additional cost  
- **Package Pricing**: Grade selections include bundled features
- **Individual Pricing**: Accessories priced individually (£34 example)

### Inventory Management
- **Option Availability**: Based on model, region, stock
- **Compatibility Rules**: Some combinations not available
- **Progressive Disclosure**: Options revealed as prerequisites met

### User Experience Patterns
- **Visual Feedback**: Immediate preview updates
- **Selection Persistence**: Choices maintained throughout flow
- **Error Prevention**: Invalid combinations prevented vs. error messages
- **Progress Indication**: Clear flow progression cues

---

## Testing Implications

### State-Based Testing Scenarios
```
SCENARIO_TYPES:
- Sequential Flow: Complete configuration from start to finish
- State Transition: Test each transition point
- Change Propagation: Verify updates cascade correctly
- Validation Gates: Confirm requirements enforced
- Error Conditions: Invalid selections handled gracefully
```

### Component Interaction Testing
```
TEST_PATTERNS:
- RadioButton Selection: Single selection enforcement
- Checkbox Behavior: Multiple independent selections  
- Visual Swatch Selection: Color preview updates
- Modal Dialog Flow: Account integration handling
- Category Navigation: Accessory category switching
```

### Business Logic Validation
```
VALIDATION_TESTS:
- Pricing Calculations: Cost updates accurately
- Option Compatibility: Invalid combinations prevented
- Configuration Persistence: Selections maintained
- Inventory Constraints: Availability properly handled
```

This state/flow context provides the realistic complexity needed for AI systems to generate comprehensive, production-ready test scenarios that reflect actual user journeys and business logic complexity.