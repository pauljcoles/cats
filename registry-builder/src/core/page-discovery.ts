import { glob } from 'glob';
import * as fs from 'fs-extra';
import * as path from 'path';
import { PageListConfig } from '../types';

/**
 * Simple page discovery for new page-list configuration format
 */
export class PageDiscovery {
  constructor(private config: PageListConfig) {}

  /**
   * Discover all page files from the page list
   */
  async discoverPages(): Promise<string[]> {
    const discoveredFiles = new Set<string>();

    console.log('🔍 Discovering page files...');
    
    for (const pagePattern of this.config.pages) {
      const pageFiles = await this.expandPattern(pagePattern);
      pageFiles.forEach(file => {
        if (this.isValidFile(file)) {
          discoveredFiles.add(file);
        }
      });
    }

    const finalFiles = Array.from(discoveredFiles);
    console.log(`📋 Found ${finalFiles.length} page files`);
    
    return finalFiles;
  }

  /**
   * Expand a pattern using glob
   */
  private async expandPattern(pattern: string): Promise<string[]> {
    try {
      // Check if it's a specific file first
      if (await fs.pathExists(pattern) && (await fs.stat(pattern)).isFile()) {
        return [pattern];
      }

      // Use glob to expand pattern
      const files = await glob(pattern, {
        ignore: ['**/node_modules/**', '**/*.test.*', '**/*.spec.*'],
        absolute: true
      });

      return files;
    } catch (error) {
      console.warn(`⚠️  Error expanding pattern ${pattern}:`, error);
      return [];
    }
  }

  /**
   * Check if file is valid (exists and has correct extension)
   */
  private isValidFile(filePath: string): boolean {
    const ext = path.extname(filePath);
    return ['.tsx', '.ts', '.jsx', '.js'].includes(ext);
  }
}