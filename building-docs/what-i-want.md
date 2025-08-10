# Combined task manager and registry tool.

## Problem statement

### The automation frame work is complicated

- People don't know where to find existing page objects
- They don't understand how the pages are stored
- They don't understand the page and module pattern
- They don't know what page objects already exist
    - Some of this is because they have stupid fucking names
    - Nothing explains what it is

### People make it worse

- they make custom steps when they don't need to, because they don't understand it
- they don't name feature files logically, they're just JIRA IDs
- They don't explain what they are, they have no scenario titles

## What I'm doing to fix it

### Task Manager

I've made a task management system explained in 4 blogs -  cats/blogs

### The rest of it

- The task manager when it makes automation it doesn't know what the existing page objects are
- It doesn't clearly know which 'code' page it is on
- It doesn't know what features already exist

### A solition

- I though about making a registry of the codebase
- It would work if it were a mono repo
    - Codebase - react app or whatever
    - Front end automation
        - pages
        - page objects
        - feature files
        - modules
    - Task manager
    - Registry builder
- The task management system would know if the registry has been made
- If not it will run it
- If it hasn't been run in a while it will run and update
    - This will then state if anything is new
    - and if any page objects in use need to change
- The registry will know that
    - X page in the codebase is Y in the pages and modules
    - Then the reverse is also true
- When the task management system runs in task 2 it knows that feature exists
- When the task management system runs in task 3a and 3b it will know what page objects already exist and use those
- When the registry builder is ran it will create the mapping of page objects
    - Then it will make the code objects for them so they can be imported and used

## What could be done

I don't know if because our automation framework is very well documented with the patterns, if we actually need the LLM to understand how to write the code. I think perhaps it can all be in code.