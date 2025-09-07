📝 Jira Ticket: CARCONF-106
Title: Engine Selection – Technical Implementation Draft (Needs Major Refinement)

Description:
This ticket outlines the engine selection API integration and frontend component implementation. It includes detailed technical specifications for database queries, React component state management, and third-party service integrations. The requirements mix UI behavior with backend implementation and are difficult to test independently.

Design Reference:
Confluence – Engine Selection Technical Specification v0.3
GitHub – EngineSelectionComponent.tsx (in development)

Requirements (Implementation-Focused):
- Engine Selection API Integration
- Given the frontend component mounts and calls GET /api/v2/engines?model=MODEL_ID&region=REGION_CODE
- When the user clicks on div[data-engine-id] with onClick handler triggering setState({selectedEngine: engineId})
- Then the component should POST to /api/v2/configuration/selections with payload {type: "engine", id: engineId, userId: userSession.id}, update the Redux store via dispatch(setSelectedEngine(engineId)), render the EnginePreviewComponent with props.engineSpec, log the selection to Google Analytics with gtag('event', 'engine_selected', {engine_id: engineId}), and trigger a re-render of the PricingCalculatorComponent

- Database Engine Lookup with Caching
- Given the EngineService queries the engines table with SQL "SELECT * FROM engines WHERE model_id = ? AND availability_status = 'active' AND region_restrictions NOT LIKE '%EXCLUDED_REGION%'"
- When the user selects an engine option from the EngineDropdown component (ID: #engine-dropdown-selector)
- Then the system should cache the result in Redis with key pattern "engine:${modelId}:${regionCode}", update the user_configurations table with "UPDATE user_configurations SET selected_engine_id = ? WHERE session_id = ?", invalidate dependent cache entries for pricing and compatibility, and return JSON response with engine specifications

- React Component State Management
- Given the EngineSelectionContainer component initializes with useEffect(() => { fetchEngines(); }, [modelId])
- When the user interacts with the MUI Select component triggering handleEngineChange(event)
- Then the component should validate the selection with validateEngineCompatibility(selectedEngine, currentConfiguration), update local state via setSelectedEngine(event.target.value), trigger useCallback dependencies for pricing calculation, emit custom event 'engineSelected' to the parent ConfiguratorContainer, and conditionally render warning modals based on this.state.showCompatibilityWarning

Labels:
configurator, engine-selection, API, React, database, draft, needs-major-refactoring
Priority:
Low (blocked by technical review)
Story Points:
13
Assignee:
Unassigned (pending architecture review)  
Reporter:
Paul