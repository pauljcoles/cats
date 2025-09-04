// Legacy configuration format (backwards compatibility)
export interface LegacyScanConfig {
  routes: string[];
  includePatterns: string[];
  excludePatterns: string[];
  aliases?: Record<string, string>;
  output?: {
    registry?: string;
    pageObjects?: string;
  };
  evaluation?: {
    maxDepth?: number;
    followDynamicImports?: boolean;
    resolveCallExpressions?: boolean;
  };
}

// New simplified configuration format
export interface PageListConfig {
  pages: string[];                    // List of page TSX files to scan
  aliases?: Record<string, string>;   // Path aliases for import resolution
  output?: {
    registry?: string;
    pageObjects?: string;
  };
  evaluation?: {
    maxDepth?: number;                // How deep to follow import chains
    followDynamicImports?: boolean;   // Follow dynamic imports (lazy loading)
    resolveCallExpressions?: boolean; // Evaluate function calls in expressions
  };
  modules?: {
    componentDirs?: string[];         // Directories to consider as shared components
    sharedPatterns?: string[];        // Glob patterns for shared/reusable components
  };
}

// Union type for backwards compatibility
export type ScanConfig = PageListConfig | LegacyScanConfig;

export interface ScanStatistics {
  totalFiles: number;
  totalElements: number;
  totalPages: number;
  totalModules: number;
  scannedAt: string;
  confidence: number;
}

// Type guards to detect configuration format
export function isPageListConfig(config: ScanConfig): config is PageListConfig {
  return 'pages' in config && Array.isArray((config as PageListConfig).pages);
}

export function isLegacyScanConfig(config: ScanConfig): config is LegacyScanConfig {
  return 'routes' in config && Array.isArray((config as LegacyScanConfig).routes);
}