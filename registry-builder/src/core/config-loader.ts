import * as fs from 'fs-extra';
import * as path from 'path';
import { ScanConfig, PageListConfig, LegacyScanConfig, isPageListConfig, isLegacyScanConfig } from '../types';

export class ConfigLoader {
  /**
   * Load and validate configuration from JSON file
   */
  static async load(configPath: string): Promise<ScanConfig> {
    try {
      // Check if config file exists
      if (!(await fs.pathExists(configPath))) {
        console.warn(`⚠️  Config file not found: ${configPath}, using defaults`);
        return this.getDefaultConfig();
      }

      // Read and parse JSON
      const configContent = await fs.readJson(configPath);
      
      // Detect config format and validate accordingly
      const config = this.detectAndValidate(configContent, configPath);
      
      console.log(`✅ Loaded ${isPageListConfig(config) ? 'page-list' : 'legacy'} config from: ${configPath}`);
      return config;
      
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to load config from ${configPath}: ${error.message}`);
      }
      throw new Error(`Failed to load config from ${configPath}: ${String(error)}`);
    }
  }

  /**
   * Get default configuration when no config file is found
   */
  private static getDefaultConfig(): ScanConfig {
    // Default to new page-list format
    return {
      pages: [
        'src/pages/*.tsx',
        'src/containers/*.tsx',
        'src/App.tsx'
      ],
      aliases: {
        '@': './src',
        '@components': './src/components',
        '@pages': './src/pages',
        '@utils': './src/utils'
      },
      output: {
        registry: './page-registry.json',
        pageObjects: './page-objects/'
      },
      evaluation: {
        maxDepth: 5,
        followDynamicImports: true,
        resolveCallExpressions: true
      },
      modules: {
        componentDirs: ['src/components', 'src/layouts'],
        sharedPatterns: ['**/components/**/*.tsx', '**/layouts/**/*.tsx']
      }
    };
  }

  /**
   * Detect configuration format and validate accordingly
   */
  private static detectAndValidate(config: any, configPath: string): ScanConfig {
    const baseDir = path.dirname(configPath);
    
    // Check if it's a page-list config
    if (config.pages && Array.isArray(config.pages)) {
      return this.validatePageListConfig(config, baseDir);
    }
    
    // Check if it's a legacy config
    if (config.routes && Array.isArray(config.routes)) {
      return this.validateLegacyConfig(config, baseDir);
    }
    
    throw new Error('Invalid configuration: must contain either "pages" array (new format) or "routes" array (legacy format)');
  }

  /**
   * Validate and normalize page-list configuration
   */
  private static validatePageListConfig(config: any, baseDir: string): PageListConfig {
    const errors: string[] = [];

    // Validate required fields
    if (!Array.isArray(config.pages)) {
      errors.push('pages must be an array of strings');
    }

    if (errors.length > 0) {
      throw new Error(`Invalid page-list configuration: ${errors.join(', ')}`);
    }

    // Normalize paths
    const normalizedConfig: PageListConfig = {
      pages: config.pages.map((page: string) => this.resolvePath(page, baseDir)),
      aliases: this.normalizeAliases(config.aliases || {}, baseDir),
      output: {
        registry: config.output?.registry 
          ? this.resolvePath(config.output.registry, baseDir)
          : './page-registry.json',
        pageObjects: config.output?.pageObjects
          ? this.resolvePath(config.output.pageObjects, baseDir)
          : './page-objects/'
      },
      evaluation: {
        maxDepth: config.evaluation?.maxDepth || 5,
        followDynamicImports: config.evaluation?.followDynamicImports ?? true,
        resolveCallExpressions: config.evaluation?.resolveCallExpressions ?? true
      },
      modules: {
        componentDirs: config.modules?.componentDirs?.map((dir: string) => this.resolvePath(dir, baseDir)) || [],
        sharedPatterns: config.modules?.sharedPatterns || []
      }
    };

    return normalizedConfig;
  }

  /**
   * Validate and normalize legacy configuration
   */
  private static validateLegacyConfig(config: any, baseDir: string): LegacyScanConfig {
    const errors: string[] = [];

    // Validate required fields
    if (!Array.isArray(config.routes)) {
      errors.push('routes must be an array of strings');
    }
    
    if (!Array.isArray(config.includePatterns)) {
      errors.push('includePatterns must be an array of strings');
    }
    
    if (!Array.isArray(config.excludePatterns)) {
      errors.push('excludePatterns must be an array of strings');
    }

    if (errors.length > 0) {
      throw new Error(`Invalid legacy configuration: ${errors.join(', ')}`);
    }

    // Normalize paths
    const normalizedConfig: LegacyScanConfig = {
      routes: config.routes.map((route: string) => this.resolvePath(route, baseDir)),
      includePatterns: config.includePatterns,
      excludePatterns: config.excludePatterns,
      aliases: this.normalizeAliases(config.aliases || {}, baseDir),
      output: {
        registry: config.output?.registry 
          ? this.resolvePath(config.output.registry, baseDir)
          : './page-registry.json',
        pageObjects: config.output?.pageObjects
          ? this.resolvePath(config.output.pageObjects, baseDir)
          : './page-objects/'
      },
      evaluation: {
        maxDepth: config.evaluation?.maxDepth || 5,
        followDynamicImports: config.evaluation?.followDynamicImports ?? true,
        resolveCallExpressions: config.evaluation?.resolveCallExpressions ?? true
      }
    };

    return normalizedConfig;
  }

  /**
   * Resolve relative paths to absolute paths
   */
  private static resolvePath(filePath: string, baseDir: string): string {
    if (path.isAbsolute(filePath)) {
      return filePath;
    }
    return path.resolve(baseDir, filePath);
  }

  /**
   * Normalize alias paths
   */
  private static normalizeAliases(aliases: Record<string, string>, baseDir: string): Record<string, string> {
    const normalized: Record<string, string> = {};
    
    for (const [alias, aliasPath] of Object.entries(aliases)) {
      normalized[alias] = this.resolvePath(aliasPath, baseDir);
    }
    
    return normalized;
  }
}