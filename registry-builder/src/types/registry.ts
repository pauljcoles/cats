import { ScanStatistics } from './config';

export interface PageInfo {
  name: string;
  filePath: string;
  route?: string;
  elements: PageElement[];
  imports: string[];                  // List of imported component files
  metadata: {
    scannedAt: string;
    confidence: number;
  };
}

export interface ModuleInfo {
  name: string;
  filePath: string;
  elements: PageElement[];
  usedByPages: string[];              // Which pages use this module
  isShared: boolean;                  // Whether used by multiple pages
  metadata: {
    scannedAt: string;
    confidence: number;
  };
}

export interface PageRegistry {
  pages: Record<string, PageInfo>;
  modules: Record<string, ModuleInfo>;
  orphanedElements: PageElement[];    // Elements that couldn't be categorized
  statistics: ScanStatistics;
}

export interface PageElement {
  type: 'interactive' | 'skeleton' | 'whirligig';
  component: string;
  selectors: AccessibleSelectors;
  dynamicExpressions: ResolvedExpression[];
  location: SourceLocation;
}

export interface AccessibleSelectors {
  byRole?: string;
  byLabelText?: string;
  byPlaceholderText?: string;
  byText?: string;
  byDisplayValue?: string;
  byAltText?: string;
  byTitle?: string;
  byTestId?: string;
}

export interface ResolvedExpression {
  type: 'template-literal' | 'variable-reference' | 'function-call';
  original: string;
  resolved: string | string[];
  confidence: 'high' | 'medium' | 'low';
}

export interface SourceLocation {
  filePath: string;
  line: number;
  column: number;
  length?: number;
}