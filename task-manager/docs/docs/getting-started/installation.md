# Installation

Complete installation guide for the Business Analyst Workflow System.

## System Requirements

- **Python**: 3.8 or higher
- **Operating System**: Linux, macOS, or Windows (WSL recommended)
- **Memory**: Minimum 2GB RAM
- **Storage**: 500MB free space

## Installation Methods

=== "Quick Install"
    ```bash
    # Clone the repository
    cd /your/workspace/
    git clone <repository-url> business-analyst-workflow
    cd business-analyst-workflow
    
    # Set up virtual environment
    python3 -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    
    # Install dependencies
    pip install -r requirements.txt
    
    # Test installation
    python3 test_new_structure.py
    ```

=== "Development Install"
    ```bash
    # Clone with development tools
    git clone <repository-url> business-analyst-workflow
    cd business-analyst-workflow
    
    # Create development environment
    python3 -m venv venv
    source venv/bin/activate
    
    # Install core dependencies
    pip install dataclasses typing pathlib
    
    # Install documentation tools
    pip install mkdocs-material mkdocs-minify-plugin
    
    # Install development tools (optional)
    pip install pytest black flake8 mypy
    
    # Verify installation
    python3 test_new_structure.py
    mkdocs serve  # Test documentation
    ```

## Manual Dependency Installation

If you don't have a requirements.txt file, install dependencies manually:

### Core Dependencies
```bash
pip install dataclasses  # Python < 3.7 only
pip install typing       # Usually built-in
pip install pathlib      # Usually built-in
```

### Documentation Dependencies
```bash
pip install mkdocs-material
pip install mkdocs-minify-plugin
```

### Optional Development Tools
```bash
pip install pytest      # Testing framework
pip install black       # Code formatting  
pip install flake8      # Linting
pip install mypy        # Type checking
```

## Directory Structure Setup

After installation, verify the directory structure:

```
business-analyst-workflow/
├── src/                          # Source code
│   ├── parsing/                  # Specification parsing
│   ├── generation/               # Story generation  
│   ├── validation/               # Quality validation
│   ├── output/                   # Output formatting
│   └── orchestration/            # Workflow coordination
├── Rules/                        # Business rules & patterns
│   ├── base-rules/              # Core workflow rules
│   └── context-rules/           # Domain configurations  
├── knowledge/                    # Pattern libraries
├── specifications/              # Input specifications
├── aiGenerated/                 # Generated outputs
├── docs/                        # Documentation
└── tests/                       # Test files
```

## Configuration

### 1. Python Path Setup
```bash
# Add to your ~/.bashrc or ~/.zshrc
export PYTHONPATH="${PYTHONPATH}:/path/to/business-analyst-workflow"
```

### 2. Domain Configuration
Verify domain configurations are available:
```bash
ls Rules/context-rules/
# Should show: mercedes-domain/ bmw-domain/ renault-domain/ bob-domain/
```

### 3. Knowledge Base Setup
Verify pattern libraries:
```bash
ls knowledge/
# Should show: gojko-adzic-patterns.json llm-contextual-patterns.json
```

## Verification Tests

### 1. Basic System Test
```bash
python3 test_new_structure.py
```

Expected output:
```
🧪 Testing new context-based structure
==================================================
✅ SpecificationParser imported successfully
✅ StoryGenerator imported successfully
✅ Parsed specification: Mercedes-Benz Premium Configuration Enhancement
   - Personas: 9
   - Business Goals: 7
✅ Generated test story: Premium Car Buyer - premium package sales
🎉 New context-based structure is working!
```

### 2. Documentation Test
```bash
cd docs/
mkdocs serve
```

Navigate to `http://127.0.0.1:8000` to verify documentation loads correctly.

### 3. Story Generation Test
```python
from src.parsing import SpecificationParser
from src.generation import StoryGenerator

# Test parsing
parser = SpecificationParser()
with open('specifications/SPECMERCEDES-001.md', 'r') as f:
    content = f.read()

spec_data = parser.parse_specification(content, "TEST-001")
print(f"✅ Parsed: {spec_data.title}")

# Test story generation  
generator = StoryGenerator()
stories = generator.generate_stories_from_spec(spec_data, "mercedes")
print(f"✅ Generated {len(stories)} stories")
```

## Common Issues

### Import Errors
**Problem**: `ModuleNotFoundError: No module named 'src'`

**Solution**:
```bash
# Ensure you're in the correct directory
cd /path/to/business-analyst-workflow

# Set Python path
export PYTHONPATH="${PYTHONPATH}:$(pwd)"

# Or run with module syntax
python3 -m src.tests.test_story_gen
```

### Missing Pattern Files
**Problem**: `Could not load Gojko patterns`

**Solution**:
```bash
# Verify knowledge files exist
ls -la knowledge/
# If missing, check if they're in a different location or contact support
```

### Virtual Environment Issues
**Problem**: Dependencies not found even after installation

**Solution**:
```bash
# Ensure virtual environment is activated
source venv/bin/activate
which python  # Should show venv path

# Reinstall dependencies
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

### Permission Issues (Linux/macOS)
**Problem**: Permission denied when running scripts

**Solution**:
```bash
chmod +x test_new_structure.py
chmod +x scripts/*.py  # if any scripts exist
```

## Environment-Specific Setup

=== "Linux/macOS"
    ```bash
    # Standard setup
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    ```

=== "Windows (PowerShell)"
    ```powershell
    # Create virtual environment
    python -m venv venv
    venv\Scripts\Activate.ps1
    pip install -r requirements.txt
    ```

=== "Windows (WSL)"
    ```bash
    # Use Linux instructions in WSL
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    ```

## Next Steps

After successful installation:

1. **[Quick Start Guide](quickstart.md)** - Basic usage examples
2. **[Architecture Overview](../architecture/overview.md)** - Understand the system design
3. **[Component Documentation](../components/parser.md)** - Deep dive into each module

---

!!! success "Installation Complete"
    If all verification tests pass, you're ready to start using the Business Analyst Workflow System!