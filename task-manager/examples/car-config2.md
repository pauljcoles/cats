📝 Jira Ticket: CARCONF-103

Title: Paint Selection – Initial Technical Draft (Needs Refinement)

Description:
This ticket outlines the initial draft of the paint selection feature for the car configurator. It includes technical implementation notes and API interactions, but the requirements are overly detailed and not easily testable. This version is intended for internal review and refinement before development begins.
The goal is to allow users to select a paint color for their configured vehicle and reflect that choice visually and functionally. However, the current requirements mix UI behavior, backend calls, and analytics logging in a way that makes them hard to validate independently.

Design Reference:
Figma – Paint Selection Mockups

Requirements :
- Paint Selection via API
- Given the user is on /configurator?step=paint and the frontend has fetched GET /api/paint-options
- When the user clicks a paint swatch with data-id="PAINT_RED_METALLIC"
- Then the system should call POST /api/selection with { type: "paint", id: "PAINT_RED_METALLIC" }, update the DOM with the new paint image, log the event to Mixpanel and Google Analytics, and trigger a re-render of the summary component
- Paint Selection with Local Storage
- Given the user has selected a car model and the paintOptions array is loaded into localStorage
- When they select a paint option from the dropdown with ID #paint-select
- Then the system should update the preview canvas, recalculate the price, store the selection in localStorage under userConfig.paint, and trigger a re-render of the summary component
- Unavailable Paint Handling
- Given the user selects a paint color
- When the selected paint is unavailable
- Then the system should show a modal with ID #paint-error-modal, disable the “Next” button, and log the error to the backend

Labels:
configurator, frontend, UX, draft, refinement-needed
Priority:
Low (requires grooming)
Story Points:
2
Assignee:
Unassigned
Reporter:
Paul
