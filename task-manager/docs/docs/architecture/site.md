# States and flow for modular presentation

## Entry points

This is built on top of Combined PDP which renders plans and bundles on the same page.

## In simple terms

## Plans
- Modular presentation off is 'Combined PDP = it shows Plans with combined speeds and plans
- Modular presentation on is still combined PDP but, it shows plans and speeds separately
- Plans are usually always available unless there is no service at all - there is a postcode for this src/mcp-atlassian/context-aware-loading/DIGILBB-domain/test_data.json

## Bundles

- Bundles are the same on combined PDP off and on.
- Bundles are the same on modular presentation off and on
- Bundles may be unavailable, it depends on the postcode src/mcp-atlassian/context-aware-loading/DIGILBB-domain/test_data.json


### Generic to all journeys

- Customer enters the /packages page
  - They may have a parameter for bundles - /packages/packageType=Bundles
  - Or - /packages/packageType=BBPlans
  - Or - /packages
- The default will be whichever parameter is loaded
- They enter their postcode
- They select their address
- They click continue
- Whilst the API returns the skeleton loader is displayed
- The page is rendered

### Combined PDP

- Customer enters the /packages page
- They enter their postcode
- They select their address
- They click continue
- Whilst the API returns the skeleton loader is displayed
- The page is rendered
  - They see a heading Choose Product
  - It shows a Plans button
  - It shows a Bundles button
    - If they came via anything other than /packages?packageType=Bundles then Plans will be selected with a green tick
- Any selected item has a green border and a green tick
- When plans are selected there are contract buttons displayed
  - 12 months and 24 months
  - Clicking these changes the display of plans to the respective terms
- When plans are selected then the sections available are:
  - 1. Choose product, 2. Choose speed & plan (combined), 3. Choose extras, 4. Choose a TV package, 5. Choose a SIM plan, 6. Choose home phone service, 7. Pricing summary

### Plan Filters (Combined PDP Only)
- Above the plans section are filters displayed for the plans: "Essentials", "Gaming", "Busiest Home"
- These filters affect which plans are displayed to the user
- Filters are NOT available in Modular presentation
- Users can click filters to narrow down plan options
- The flow of the page is a previous section has to be completed before the next can start
  - When a section is disabled because the previous section hasn't been completed it is disabled
    - Disabled means only the header is shown
    - The header is greyed out
  - When a section is enabled it displays a skeleton loader for every section apart from Choose a SIM plan
  - By default plans is selected as described above
    - 2. Choose speed & plan will be enabled (speeds and plans are shown together)
    - Any other steps will be disabled until something is selected in the previous step
    - When all steps are complete the Continue button becomes available
      - This starts the checkout process

### Modular presentation

- This is almost the same as Combined PDP
  - Speeds and Plans are separated
  - So there is an extra step - 1. Choose product, 2. Choose speed, 3. Choose plan, 4. Choose extras, 5. Choose a TV package, 6. Choose a SIM plan, 7. Choose home phone service, 8. Pricing summary
  - There are no plan filters available (unlike Combined PDP)
- The rest of the sequence is the same
- When all steps are complete the Continue button becomes available
      - This starts the checkout process

### Bundles

- The display of bundles is the same on Combined PDP and Modular Presentation
- The user clicks the Bundles button
- The page loads bundles with a skeleton
- Then bundles are displayed

### Bundle TV Package Variations
- The steps vary depending on whether the bundle includes a TV plan:
  - **Bundle WITH TV plan**: 1. Choose product, 2. Choose bundle, 3. Choose extras, 4. Customise my TV package, 5. Choose a SIM plan, 6. Choose home phone service, 7. Pricing summary
  - **Bundle WITHOUT TV plan**: 1. Choose product, 2. Choose bundle, 3. Choose extras, 4. Choose a TV package, 5. Choose a SIM plan, 6. Choose home phone service, 7. Pricing summary
- "Customise my TV package" appears when bundle already includes TV content
- "Choose a TV package" appears when bundle has no TV content and user can add TV
- When all steps are complete the Continue button becomes available
  - This starts the checkout process

## State changes

### Auto-Scroll Behavior (DIGILBB-127324)
- **System Preselection**: When coming from Hub with PreselectAction parameter, no auto-scroll occurs to next section
  - User maintains their current view position on the page
  - Next section opens without page movement
  - Applies to both plan and bundle preselections
- **Manual Selection**: When user manually selects plan/bundle/speed, auto-scroll occurs to next section
  - Page automatically scrolls to guide user to next step
  - Maintains existing user experience for manual interactions
- **Mixed Interaction**: System preselection followed by manual change triggers auto-scroll for the manual selection
  - If user changes a preselected item, auto-scroll resumes for that manual action
- **Scope**: Applies to all flows - Modular presentation, Combined PDP, and Bundles
- **Implementation**: Required on bundles, plans (legacy & non-modular), with consideration for modular presentation default positioning

### Changing Product

- A popup will be shown if you change your Product and:
- You've selected anything from a subsequent section e.g. Plan or bundle
- The message is Changing your product
- With 2 CTAs
  - Change product
  - Keep plan and continue
- Change will change to the new product selected
- Keep will cancel the change and the previous product is selected

### pre-selection positive

- This means coming from 'the hub' we skip this step and just us the URL parameter
  - Parameter - PreselectAction=
  - This makes the URL ?packageType=Bundles&PreselectAction={some package or bundle}
- This will select the relevant package or bundle

### pre-selection negative
- If the URL comes through with an unknown product ?packageType=Bundles&PreselectAction={nonsense}
- Then we show an inline error message stating that the product isn't available
  - The plan you've chosen is no longer available
  - The bundle you've chose is no longer available
- Then whatever products are available are shown


### contract terms
- contracts are only on plans, the selector isn't there on bundles.
- default is always 24 months

### Changing Plan Combined PDP and Modular Presentation
- A popup will be shown if you change your plan and:
  - You've selected anything from a subsequent section
  - The message is Changing your broadband plan
  - With 2 CTAs
    - Change broadband plan
    - Keep plan and continue
  - Change will change to the new plan selected
  - Keep will cancel the change and the previous plan is selected

### Changing Speed
- A popup will be shown if you change your Speed and:
  - You've selected anything from a subsequent section e.g. Plan
  - The message is Changing your broadband speed
  - With 2 CTAs
    - Change broadband speed
    - Keep speed and continue
  - Change will change to the new plan selected
  - Keep will cancel the change and the previous plan is selected


# Changing contract length
- A popup will be shown if you change your Contract length from 24m to 12m and visa versa and:
  - You've selected anything from a subsequent section e.g. Plan
  - The message is Changing your contract length
  - With 2 CTAs
    - Change contract length
    - Keep plan and continue
  - Change will change to the new plan selected
  - Keep will cancel the change and the previous plan is selected

# Modular presentation

## Changing speed 
- changing your speed - popup
- cta 1 - change speed - equivalent of OK, yes I want to change. Resets all selections and clears basket
- cta 2 - keep speed and continue - equivalent of no, cancel the change

## Changing plan 
- changing your plan - popup
- cta 1 - change plan - equivalent of OK, yes I want to change. Resets all selections and clears basket
- cta 2 - keep plan and continue - equivalent of no, cancel the change