#!/usr/bin/env python3
"""
Registry Analyzer Tool
Analyze and work with test automation registry data
"""

import json
import argparse
from collections import defaultdict, Counter
import os
import csv

class RegistryAnalyzer:
    def __init__(self, registry_path):
        with open(registry_path, 'r') as f:
            self.data = json.load(f)
        
        self.components = [node for node in self.data['nodes'] if node['type'] == 'ReactComponent']
        self.elements = [node for node in self.data['nodes'] if node['type'] == 'SemanticElement']
    
    def stats(self):
        """Show registry statistics"""
        priority_counts = Counter()
        test_attr_counts = Counter()
        
        for element in self.elements:
            meta = element['metadata']
            priority = meta.get('automationPriority', 'unknown')
            priority_counts[priority] += 1
            
            test_attrs = meta.get('automationAnalysis', {}).get('testAttributes', [])
            if test_attrs:
                test_attr_counts['with_test_attrs'] += 1
            else:
                test_attr_counts['without_test_attrs'] += 1
        
        print("=== Registry Statistics ===")
        print(f"Total Components: {len(self.components)}")
        print(f"Total Elements: {len(self.elements)}")
        print("\nAutomation Priority Breakdown:")
        for priority, count in priority_counts.most_common():
            print(f"  {priority}: {count}")
        
        print(f"\nTest Attributes:")
        print(f"  With test attributes: {test_attr_counts['with_test_attrs']}")
        print(f"  Without test attributes: {test_attr_counts['without_test_attrs']}")
        
        print(f"\nComponents with most elements:")
        component_counts = Counter()
        for element in self.elements:
            comp = element['metadata'].get('parentComponent', 'Unknown')
            component_counts[comp] += 1
        
        for comp, count in component_counts.most_common(5):
            print(f"  {comp}: {count} elements")
    
    def query(self, **filters):
        """Query elements with filters"""
        filtered = self.elements
        
        if 'priority' in filters:
            filtered = [el for el in filtered 
                       if el['metadata'].get('automationPriority') == filters['priority']]
        
        if 'component' in filters:
            filtered = [el for el in filtered 
                       if el['metadata'].get('parentComponent') == filters['component']]
        
        if 'has_test_id' in filters and filters['has_test_id']:
            filtered = [el for el in filtered 
                       if el['metadata'].get('automationAnalysis', {}).get('testAttributes')]
        
        if 'tag' in filters:
            filtered = [el for el in filtered 
                       if el['metadata'].get('tagName') == filters['tag']]
        
        return filtered
    
    def export_csv(self, output_path):
        """Export elements to CSV"""
        data = []
        for element in self.elements:
            meta = element['metadata']
            
            row = {
                'id': element['id'],
                'name': element['name'],
                'component': meta.get('parentComponent', ''),
                'tagName': meta.get('tagName', ''),
                'automationPriority': meta.get('automationPriority', ''),
                'selectorPriority': meta.get('selectorPriority', ''),
                'recommendedSelector': meta.get('recommendedSelector', ''),
                'hasTestAttrs': bool(meta.get('automationAnalysis', {}).get('testAttributes')),
                'identifierScore': meta.get('automationAnalysis', {}).get('identifierScore', 0),
                'filePath': element.get('filePath', ''),
                'testAttributes': ', '.join(meta.get('automationAnalysis', {}).get('testAttributes', []))
            }
            data.append(row)
        
        # Write CSV without pandas
        if data:
            with open(output_path, 'w', newline='') as csvfile:
                fieldnames = data[0].keys()
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(data)
            print(f"Exported {len(data)} elements to {output_path}")
        else:
            print("No data to export")
    
    def generate_page_object(self, component_name, output_dir=None):
        """Generate page object code for a component"""
        elements = [el for el in self.elements 
                   if el['metadata'].get('parentComponent') == component_name
                   and el['metadata'].get('automationPriority') != 'none']
        
        if not elements:
            print(f"No automation-relevant elements found for component: {component_name}")
            return
        
        # Generate selectors
        selectors = []
        for element in elements:
            meta = element['metadata']
            name = self._generate_element_name(meta)
            selector = meta.get('recommendedSelector', '')
            comment = f"// {meta.get('tagName')} - Priority: {meta.get('automationPriority')}"
            selectors.append(f"  {name}: '{selector}', {comment}")
        
        # Generate code
        code = f'''// {component_name} Page Object - Generated from Registry
class {component_name}Page {{
  constructor(page) {{
    this.page = page;
  }}
  
  selectors = {{
{chr(10).join(selectors)}
  }};
  
  // Helper methods
  async waitForLoad() {{
    // Add component-specific wait logic
  }}
  
  // Add your page methods here
}}

module.exports = {component_name}Page;
'''
        
        if output_dir:
            os.makedirs(output_dir, exist_ok=True)
            file_path = os.path.join(output_dir, f'{component_name}Page.js')
            with open(file_path, 'w') as f:
                f.write(code)
            print(f"Generated page object: {file_path}")
        else:
            print(code)
    
    def _generate_element_name(self, meta):
        """Generate meaningful element names"""
        tag = meta.get('tagName', 'element')
        selectors = meta.get('semanticSelectors', {})
        
        if selectors.get('textContent'):
            return f"{tag}_{selectors['textContent'].lower().replace(' ', '_').replace('-', '_')[:20]}"
        elif selectors.get('title'):
            return f"{tag}_{selectors['title'].lower().replace(' ', '_').replace('-', '_')[:20]}"
        elif selectors.get('placeholder'):
            return f"{tag}_{selectors['placeholder'].lower().replace(' ', '_').replace('-', '_')[:20]}"
        
        return f"{tag}_element"
    
    def find_missing_test_ids(self):
        """Find high-priority elements without test IDs"""
        missing = []
        for element in self.elements:
            meta = element['metadata']
            if (meta.get('automationPriority') == 'high' and 
                not meta.get('automationAnalysis', {}).get('testAttributes')):
                missing.append({
                    'component': meta.get('parentComponent'),
                    'element': meta.get('tagName'),
                    'file': element.get('filePath'),
                    'selector': meta.get('recommendedSelector')
                })
        
        return missing
    
    def validate(self):
        """Validate registry for common issues"""
        issues = []
        
        # Check for high-priority elements without test IDs
        missing_testids = self.find_missing_test_ids()
        if missing_testids:
            issues.append(f"Found {len(missing_testids)} high-priority elements without test IDs")
        
        # Check for elements with very low identifier scores
        low_scores = [el for el in self.elements 
                     if el['metadata'].get('automationAnalysis', {}).get('identifierScore', 0) < 3
                     and el['metadata'].get('automationPriority') in ['high', 'medium']]
        
        if low_scores:
            issues.append(f"Found {len(low_scores)} priority elements with low identifier scores")
        
        print("=== Registry Validation ===")
        if issues:
            for issue in issues:
                print(f"⚠️  {issue}")
        else:
            print("✅ No issues found")
        
        return len(issues) == 0

def main():
    parser = argparse.ArgumentParser(description='Registry Analyzer Tool')
    parser.add_argument('registry', help='Path to complete-registry.json file')
    parser.add_argument('--stats', action='store_true', help='Show registry statistics')
    parser.add_argument('--query', nargs=2, metavar=('KEY', 'VALUE'), action='append', 
                       help='Query elements (e.g., --query priority high)')
    parser.add_argument('--export-csv', help='Export to CSV file')
    parser.add_argument('--page-object', help='Generate page object for component')
    parser.add_argument('--output-dir', help='Output directory for generated files')
    parser.add_argument('--validate', action='store_true', help='Validate registry')
    parser.add_argument('--missing-testids', action='store_true', help='Find missing test IDs')
    
    args = parser.parse_args()
    
    if not os.path.exists(args.registry):
        print(f"Error: Registry file not found: {args.registry}")
        return 1
    
    analyzer = RegistryAnalyzer(args.registry)
    
    if args.stats:
        analyzer.stats()
    
    if args.query:
        filters = {key: value for key, value in args.query}
        results = analyzer.query(**filters)
        print(f"\n=== Query Results ({len(results)} elements) ===")
        for element in results:
            meta = element['metadata']
            print(f"{meta.get('parentComponent')}.{meta.get('tagName')} - {meta.get('recommendedSelector')}")
    
    if args.export_csv:
        analyzer.export_csv(args.export_csv)
    
    if args.page_object:
        analyzer.generate_page_object(args.page_object, args.output_dir)
    
    if args.validate:
        analyzer.validate()
    
    if args.missing_testids:
        missing = analyzer.find_missing_test_ids()
        print(f"\n=== Missing Test IDs ({len(missing)}) ===")
        for item in missing:
            print(f"{item['component']}.{item['element']} in {item['file']}")

if __name__ == '__main__':
    main()