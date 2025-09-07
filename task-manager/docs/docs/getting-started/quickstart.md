# Quick Start

Get the Business Analyst Workflow System running in 5 minutes.

## Prerequisites

- Python 3.8+ 
- Git

## Installation

1. **Clone and setup**:
   ```bash
   cd /home/pauljcoles/code/cats/task-manager
   source venv/bin/activate  # or create: python3 -m venv venv && source venv/bin/activate
   pip install -r requirements.txt  # if exists, or install manually
   ```

2. **Test the system**:
   ```bash
   python3 test_new_structure.py
   ```

   Expected output:
   ```
   🧪 Testing new context-based structure
   ✅ SpecificationParser imported successfully
   ✅ StoryGenerator imported successfully  
   ✅ Generated test story: Premium Car Buyer - premium package sales
   🎉 New context-based structure is working!
   ```

## Basic Usage

### 1. Parse a Specification

```python
from src.parsing import SpecificationParser

# Load your specification content
with open('specifications/your-spec.md', 'r') as f:
    content = f.read()

# Parse it
parser = SpecificationParser()
spec_data = parser.parse_specification(content, "YOUR-SPEC-001")

print(f"Parsed: {spec_data.title}")
print(f"Found {len(spec_data.personas)} personas")
print(f"Found {len(spec_data.business_goals)} business goals")
```

### 2. Generate Stories

```python
from src.generation import StoryGenerator

# Create generator  
generator = StoryGenerator()

# Generate stories (with domain context)
stories = generator.generate_stories_from_spec(spec_data, "mercedes")

print(f"Generated {len(stories)} stories")
print(f"Average INVEST score: {sum(s.invest_score for s in stories) / len(stories):.2f}")
```

### 3. View Results

Stories are automatically saved to:
```
aiGenerated/YOUR-SPEC-001/
├── YOUR-SPEC-001_generated_stories.md    # Full story report
└── YOUR-SPEC-001_conversation.md         # Process log
```

## Example Workflow

### Input: Specification File
```markdown
# Mercedes Premium Enhancement

## Personas
### Premium Car Buyer
- Seeks luxury and customization
- Values premium experience
- Willing to pay for quality

## Business Goals  
- Increase premium package sales by 15% within 6 months
- Improve customer satisfaction with luxury options
```

### Command:
```python
from src.parsing import SpecificationParser
from src.generation import StoryGenerator

# Parse
parser = SpecificationParser()  
spec_data = parser.parse_specification(content, "MERC-001")

# Generate
generator = StoryGenerator()
stories = generator.generate_stories_from_spec(spec_data, "mercedes")
```

### Output:
```
🎯 Generating user stories from specification: MERC-001
📋 Applying story generation frameworks:
   - INVEST criteria analysis
   - 3 C's framework for appropriate detail
   - BDD Given-When-Then structure  
   - Domain-specific terminology

✅ Generated 14 user stories with quality validation
📄 Saved 14 user stories to aiGenerated/MERC-001/
```

## Available Domains

The system supports multiple domain configurations:

| Domain | Focus | Example Usage |
|--------|-------|---------------|
| `mercedes` | Premium luxury, AMG grades | `generate_stories_from_spec(spec_data, "mercedes")` |
| `bmw` | Performance focus, M Sport | `generate_stories_from_spec(spec_data, "bmw")` |  
| `renault` | Electric vehicles, French terms | `generate_stories_from_spec(spec_data, "renault")` |
| `bob` | Generic car configurator | `generate_stories_from_spec(spec_data, "bob")` |
| `None` | No domain-specific terms | `generate_stories_from_spec(spec_data)` |

## Troubleshooting

### Import Errors
```bash
# Ensure you're in the correct directory
cd /home/pauljcoles/code/cats/task-manager

# Ensure Python path is set
export PYTHONPATH="${PYTHONPATH}:/home/pauljcoles/code/cats/task-manager"
```

### Missing Dependencies  
```bash
# Install missing packages
source venv/bin/activate
pip install dataclasses typing pathlib
```

### No Stories Generated
- Check that your specification has **personas** and **business goals** sections
- Ensure personas have motivations listed
- Verify business goals are not empty

## What's Next?

- **[Installation Guide](installation.md)** - Detailed setup instructions
- **[Architecture Overview](../architecture/overview.md)** - Understand the Context-Smart design
- **[Component Guide](../components/parser.md)** - Deep dive into each module

---

!!! tip "Pro Tip"
    Start with the provided `SPECMERCEDES-001.md` example to see the system in action before using your own specifications.