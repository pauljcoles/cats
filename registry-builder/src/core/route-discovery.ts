import { glob } from 'glob';
import * as fs from 'fs-extra';
import * as path from 'path';
import { ScanConfig, PageListConfig, LegacyScanConfig, isPageListConfig, isLegacyScanConfig } from '../types';

export class RouteDiscovery {
  constructor(private config: LegacyScanConfig) {}

  /**
   * Discover all files that should be analyzed based on configuration
   */
  async discoverRoutes(): Promise<string[]> {
    const discoveredFiles = new Set<string>();

    // Step 1: Process route patterns
    console.log('🔍 Discovering route files...');
    for (const route of this.config.routes) {
      const routeFiles = await this.expandRoutePattern(route);
      routeFiles.forEach(file => discoveredFiles.add(file));
    }

    console.log(`📋 Found ${discoveredFiles.size} route files`);

    // Step 2: Apply include patterns
    console.log('🔍 Applying include patterns...');
    const includeFiles = await this.applyIncludePatterns();
    includeFiles.forEach(file => discoveredFiles.add(file));

    console.log(`📋 Total files after include patterns: ${discoveredFiles.size}`);

    // Step 3: Apply exclude patterns
    console.log('🔍 Applying exclude patterns...');
    const filteredFiles = await this.applyExcludePatterns(Array.from(discoveredFiles));

    // Step 4: Verify files exist and are accessible
    const validFiles = await this.validateFiles(filteredFiles);

    console.log(`✅ Final file count: ${validFiles.length}`);
    return validFiles;
  }

  /**
   * Expand a single route pattern using glob
   */
  private async expandRoutePattern(route: string): Promise<string[]> {
    try {
      // Check if it's a specific file first
      if (await fs.pathExists(route) && (await fs.stat(route)).isFile()) {
        return [path.resolve(route)];
      }

      // Use glob to expand pattern
      const files = await glob(route, {
        ignore: this.config.excludePatterns,
        absolute: true,
        nodir: true
      });

      return files.filter(file => this.isTypeScriptOrJSXFile(file));
    } catch (error) {
      console.warn(`⚠️  Could not expand route pattern '${route}':`, error);
      return [];
    }
  }

  /**
   * Apply include patterns to find additional files
   */
  private async applyIncludePatterns(): Promise<string[]> {
    const allFiles = new Set<string>();

    for (const pattern of this.config.includePatterns) {
      try {
        const files = await glob(pattern, {
          ignore: this.config.excludePatterns,
          absolute: true,
          nodir: true
        });

        files.forEach(file => {
          if (this.isTypeScriptOrJSXFile(file)) {
            allFiles.add(file);
          }
        });
      } catch (error) {
        console.warn(`⚠️  Could not expand include pattern '${pattern}':`, error);
      }
    }

    return Array.from(allFiles);
  }

  /**
   * Apply exclude patterns to filter out unwanted files
   */
  private async applyExcludePatterns(files: string[]): Promise<string[]> {
    if (this.config.excludePatterns.length === 0) {
      return files;
    }

    const filteredFiles: string[] = [];

    for (const file of files) {
      let shouldExclude = false;

      for (const excludePattern of this.config.excludePatterns) {
        try {
          // Convert file path to relative for pattern matching
          const relativePath = path.relative(process.cwd(), file);
          
          // Use minimatch-style matching (glob without file system access)
          const matched = await glob(excludePattern, { 
            ignore: [],
            absolute: false,
            nodir: true
          });

          // Check if the relative path matches the exclude pattern
          if (this.matchesPattern(relativePath, excludePattern)) {
            shouldExclude = true;
            break;
          }
        } catch (error) {
          // If pattern matching fails, skip this exclude pattern
          continue;
        }
      }

      if (!shouldExclude) {
        filteredFiles.push(file);
      }
    }

    const excludedCount = files.length - filteredFiles.length;
    if (excludedCount > 0) {
      console.log(`🚫 Excluded ${excludedCount} files based on exclude patterns`);
    }

    return filteredFiles;
  }

  /**
   * Validate that files exist and are readable
   */
  private async validateFiles(files: string[]): Promise<string[]> {
    const validFiles: string[] = [];
    let invalidCount = 0;

    for (const file of files) {
      try {
        const stat = await fs.stat(file);
        if (stat.isFile()) {
          validFiles.push(file);
        } else {
          invalidCount++;
        }
      } catch (error) {
        invalidCount++;
      }
    }

    if (invalidCount > 0) {
      console.warn(`⚠️  ${invalidCount} files were not accessible and were skipped`);
    }

    return validFiles;
  }

  /**
   * Check if file is a TypeScript or JSX file
   */
  private isTypeScriptOrJSXFile(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return ['.ts', '.tsx', '.js', '.jsx'].includes(ext);
  }

  /**
   * Simple pattern matching for exclude patterns
   */
  private matchesPattern(filePath: string, pattern: string): boolean {
    // Convert glob pattern to regex for simple matching
    const regexPattern = pattern
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*')
      .replace(/\?/g, '[^/]');
    
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(filePath) || regex.test(filePath.replace(/\\/g, '/'));
  }
}