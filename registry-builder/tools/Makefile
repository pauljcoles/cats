# Registry Analysis Makefile
REGISTRY_FILE ?= ../registry-output/complete-registry.json
OUTPUT_DIR ?= ./output

.PHONY: help stats validate export-csv page-objects serve

help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

stats: ## Show registry statistics
	python3 registry_analyzer.py $(REGISTRY_FILE) --stats

validate: ## Validate registry for issues
	python3 registry_analyzer.py $(REGISTRY_FILE) --validate

missing-testids: ## Find elements missing test IDs
	python3 registry_analyzer.py $(REGISTRY_FILE) --missing-testids

export-csv: ## Export elements to CSV
	mkdir -p $(OUTPUT_DIR)
	python3 registry_analyzer.py $(REGISTRY_FILE) --export-csv $(OUTPUT_DIR)/elements.csv

high-priority: ## Query high priority elements
	python3 registry_analyzer.py $(REGISTRY_FILE) --query priority high

buttons: ## Query all button elements
	python3 registry_analyzer.py $(REGISTRY_FILE) --query tag button

page-objects: ## Generate page objects for all components
	mkdir -p $(OUTPUT_DIR)/page-objects
	@for component in $$(jq -r '.nodes[] | select(.type == "ReactComponent") | .name' $(REGISTRY_FILE) | sort -u); do \
		echo "Generating page object for $$component..."; \
		python3 registry_analyzer.py $(REGISTRY_FILE) --page-object "$$component" --output-dir $(OUTPUT_DIR)/page-objects; \
	done

serve: ## Start web viewer (requires Python HTTP server)
	@echo "Starting registry viewer at http://localhost:8000"
	@cp $(REGISTRY_FILE) ./complete-registry.json
	python3 -m http.server 8000

# Analysis shortcuts
analysis: stats validate missing-testids ## Run complete analysis

quick-export: export-csv ## Quick export to CSV and open
	@if command -v open >/dev/null 2>&1; then open $(OUTPUT_DIR)/elements.csv; fi

clean: ## Clean generated files
	rm -rf $(OUTPUT_DIR)
	rm -f ./complete-registry.json

# Component-specific shortcuts
SingleProduct: ## Generate SingleProduct page object
	python3 registry_analyzer.py $(REGISTRY_FILE) --page-object SingleProduct --output-dir $(OUTPUT_DIR)

ProductCard: ## Generate ProductCard page object  
	python3 registry_analyzer.py $(REGISTRY_FILE) --page-object ProductCard --output-dir $(OUTPUT_DIR)

Navbar: ## Generate Navbar page object
	python3 registry_analyzer.py $(REGISTRY_FILE) --page-object Navbar --output-dir $(OUTPUT_DIR)