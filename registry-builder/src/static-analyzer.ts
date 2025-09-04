#!/usr/bin/env node

import { Command } from 'commander';
import * as fs from 'fs-extra';
import * as path from 'path';
import { ConfigLoader } from './core/config-loader';
import { RouteDiscovery } from './core/route-discovery';
import { PageDiscovery } from './core/page-discovery';
import { ImportResolver } from './core/import-resolver';
import { ASTScanner } from './core/ast-scanner';
import { ElementCategorizer } from './core/element-categorizer';
import { PageRegistry } from './types/registry';
import { isPageListConfig } from './types';

const program = new Command();

program
  .name('static-analyzer')
  .description('Static Analysis Tool for generating page registries from web applications')
  .version('1.0.0');

program
  .command('scan')
  .description('Scan web application for page elements')
  .option('-c, --config <path>', 'Path to configuration file', 'scanner.json')
  .option('-o, --output <path>', 'Output path for registry', './page-registry.json')
  .option('-f, --format <format>', 'Output format (json|typescript)', 'json')
  .option('-w, --watch', 'Watch mode for continuous scanning', false)
  .action(async (options) => {
    try {
      const configPath = path.resolve(options.config);
      const config = await ConfigLoader.load(configPath);
      
      console.log('🔍 Starting static analysis...');
      console.log(`📁 Config: ${configPath}`);
      console.log(`📝 Output: ${options.output}`);
      
      // Phase 1: File Discovery
      let entryFiles: string[];
      if (isPageListConfig(config)) {
        const pageDiscovery = new PageDiscovery(config);
        entryFiles = await pageDiscovery.discoverPages();
      } else {
        const routeDiscovery = new RouteDiscovery(config as any);
        entryFiles = await routeDiscovery.discoverRoutes();
      }
      console.log(`📋 Found ${entryFiles.length} entry files`);
      
      // Phase 2: Import Resolution
      const importResolver = new ImportResolver();
      const importResult = await importResolver.resolveImports(entryFiles);
      console.log(`🔗 Resolved ${importResult.allFiles.length} total files`);
      
      // Phase 3: AST Analysis
      const astScanner = new ASTScanner();
      const elements = await astScanner.scanFiles(importResult.allFiles);
      console.log(`⚡ Found ${elements.length} interactive elements`);
      
      // Phase 4: Element Categorization
      const elementCategorizer = new ElementCategorizer();
      const categorizedElements = elementCategorizer.categorizeElements(
        elements,
        importResult.componentOwnership,
        entryFiles
      );
      
      console.log(`📊 Organized into ${Object.keys(categorizedElements.pages).length} pages and ${Object.keys(categorizedElements.modules).length} modules`);
      
      // Generate Registry
      const registry: PageRegistry = {
        pages: categorizedElements.pages,
        modules: categorizedElements.modules,
        orphanedElements: categorizedElements.orphanedElements,
        statistics: {
          totalFiles: importResult.allFiles.length,
          totalElements: elements.length,
          totalPages: Object.keys(categorizedElements.pages).length,
          totalModules: Object.keys(categorizedElements.modules).length,
          scannedAt: new Date().toISOString(),
          confidence: elements.length > 0 ? 0.8 : 0.5
        }
      };
      
      // Save output
      const outputPath = path.resolve(options.output);
      await fs.ensureDir(path.dirname(outputPath));
      await fs.writeJson(outputPath, registry, { spaces: 2 });
      
      console.log('✅ Static analysis complete!');
      console.log(`📊 Registry saved to: ${outputPath}`);
      
    } catch (error) {
      console.error('❌ Static analysis failed:', error);
      process.exit(1);
    }
  });

program.parse();