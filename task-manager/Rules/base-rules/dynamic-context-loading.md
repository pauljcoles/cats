# Essential Dynamic Path Resolution Pattern

## Core Purpose

Enable flexible, environment-aware context loading with graceful fallback support.

**The pattern**: Environment config → Path resolution → Validation → Loading

## Basic Path Resolution

### Configuration-Driven Approach

```pseudocode
RESOLVE_CONTEXT_PATH():
    env_config_path = "/path/to/env.json"
    fallback_path = "./context-loading/"
    
    TRY:
        env_config = LOAD_JSON(env_config_path)
        IF env_config.contextAwareLoadingPath EXISTS:
            configured_path = env_config.contextAwareLoadingPath
            
            IF DIRECTORY_EXISTS(configured_path):
                LOG("OK Using configured path: {configured_path}")
                RETURN configured_path
            ELSE:
                LOG("WARNING Configured path missing, using fallback")
                RETURN fallback_path
        ELSE:
            LOG("WARNING No contextAwareLoadingPath configured, using fallback")
            RETURN fallback_path
    
    CATCH (file_error, json_error):
        LOG("WARNING Could not load config: {error}, using fallback")
        RETURN fallback_path
```

### Domain-Specific Path Construction

```pseudocode
GET_DOMAIN_PATH(ticket_prefix):
    base_path = RESOLVE_CONTEXT_PATH()
    domain_path = f"{base_path}/{ticket_prefix}-domain/"
    
    LOG("Resolved domain path: {domain_path}")
    RETURN domain_path

GET_FRAMEWORK_PATH(framework_type):
    base_path = RESOLVE_CONTEXT_PATH()
    framework_path = f"{base_path}/{framework_type}/"
    
    LOG("Resolved framework path: {framework_path}")
    RETURN framework_path
```

## Integration Pattern

### Dynamic Loading in Task Execution

```pseudocode
LOAD_TASK_CONTEXT_WITH_DYNAMIC_PATHS(ticket_key):
    // Step 1: Resolve base path
    context_base = RESOLVE_CONTEXT_PATH()
    
    // Step 2: Get domain-specific path
    ticket_prefix = EXTRACT_PREFIX(ticket_key)
    domain_path = GET_DOMAIN_PATH(ticket_prefix)
    
    // Step 3: Check domain availability
    IF DIRECTORY_EXISTS(domain_path):
        // Load domain-specific context
        business_config = LOAD_FILE(f"{domain_path}/business-config.md")
        test_data = LOAD_FILE(f"{domain_path}/test_data.json")
        LOG("OK Domain context loaded from: {domain_path}")
        domain_available = true
    ELSE:
        business_config = null
        test_data = null
        LOG("WARNING Domain not found, using core framework only")
        domain_available = false
    
    // Step 4: Load framework context
    framework_path = GET_FRAMEWORK_PATH("core")
    framework_rules = LOAD_FRAMEWORK_RULES(framework_path)
    
    RETURN {
        domain_config: business_config,
        test_data: test_data,
        framework_rules: framework_rules,
        domain_available: domain_available
    }
```

## Configuration Examples

### Development Environment
```json
{
    "contextAwareLoadingPath": "/local/dev/context-loading"
}
```

### Team Environment  
```json
{
    "contextAwareLoadingPath": "/shared/team/context-loading"
}
```

### CI/CD Environment
```json
{
    "contextAwareLoadingPath": "/opt/build/context-loading"
}
```

### Relative Path Example
```json
{
    "contextAwareLoadingPath": "../../context-loading"
}
```

## Error Handling Strategy

### Graceful Degradation

```pseudocode
HANDLE_PATH_RESOLUTION_ERRORS():
    // Always have a working fallback
    // Log issues but don't stop execution
    // Validate paths before using them
    // Provide clear feedback about what's available
```

### Validation Checks

```pseudocode
VALIDATE_RESOLVED_PATHS(resolved_paths):
    validation_results = []
    
    FOR path IN resolved_paths:
        IF DIRECTORY_EXISTS(path):
            validation_results.append({path: path, status: "OK"})
        ELSE:
            validation_results.append({path: path, status: "MISSING"})
    
    RETURN validation_results
```

## Core Principles

### Flexibility Over Rigidity
- **Environment adaptation**: Different paths for different environments
- **Team collaboration**: Shared context loading directories  
- **Deployment agnostic**: Works in dev, test, and production

### Reliability Through Fallbacks
- **Always working**: Fallback path ensures system never breaks
- **Path validation**: Check directory exists before using
- **Clear logging**: Visibility into path resolution decisions

### Configuration Simplicity
- **Single config point**: One place to change context loading behavior
- **Environment variables**: Support for environment-specific overrides
- **Backward compatibility**: Fallback maintains existing behavior

## Usage Pattern

### Replace Hardcoded Paths

```pseudocode
// OLD (hardcoded)
domain_path = "context-loading/BMW-domain/"

// NEW (dynamic)  
domain_path = GET_DOMAIN_PATH("BMW")
```

### Load Rules Dynamically

```pseudocode
// OLD (hardcoded)
rules = LOAD("context-loading/core/bdd_rules.md")

// NEW (dynamic)
framework_path = GET_FRAMEWORK_PATH("core")
rules = LOAD(f"{framework_path}/bdd_rules.md")
```

This pattern provides maximum flexibility while maintaining reliability through systematic fallback mechanisms.