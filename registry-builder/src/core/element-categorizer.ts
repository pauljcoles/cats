import * as path from 'path';
import { PageElement, PageInfo, ModuleInfo } from '../types/registry';
import { ComponentOwnership } from './import-resolver';

/**
 * Categorizes page elements into pages vs shared modules
 */
export class ElementCategorizer {
  
  /**
   * Categorize elements into pages and modules based on ownership data
   */
  categorizeElements(
    elements: PageElement[],
    componentOwnership: Map<string, ComponentOwnership>,
    pageFiles: string[]
  ): {
    pages: Record<string, PageInfo>;
    modules: Record<string, ModuleInfo>;
    orphanedElements: PageElement[];
  } {
    const pages: Record<string, PageInfo> = {};
    const modules: Record<string, ModuleInfo> = {};
    const orphanedElements: PageElement[] = [];

    // Initialize page info for each page file
    for (const pageFile of pageFiles) {
      const pageName = this.getPageName(pageFile);
      pages[pageName] = {
        name: pageName,
        filePath: path.resolve(pageFile),
        elements: [],
        imports: [],
        metadata: {
          scannedAt: new Date().toISOString(),
          confidence: 0.8
        }
      };
    }

    // Categorize each element
    for (const element of elements) {
      const elementFilePath = path.resolve(element.location.filePath);
      const ownership = componentOwnership.get(elementFilePath);

      if (!ownership) {
        // No ownership data - element is orphaned
        orphanedElements.push(element);
        continue;
      }

      if (this.isPageFile(elementFilePath, pageFiles)) {
        // Element belongs to a page
        this.categorizeAsPageElement(element, elementFilePath, pages, pageFiles);
      } else if (ownership.isShared) {
        // Element belongs to a shared component
        this.categorizeAsModuleElement(element, elementFilePath, ownership, modules);
      } else {
        // Element belongs to a component used by only one page
        this.categorizeAsModuleElement(element, elementFilePath, ownership, modules);
      }
    }

    // Calculate imports for each page
    this.calculatePageImports(pages, componentOwnership);

    return { pages, modules, orphanedElements };
  }

  /**
   * Check if a file is one of the page files
   */
  private isPageFile(filePath: string, pageFiles: string[]): boolean {
    const resolvedPath = path.resolve(filePath);
    return pageFiles.some(pageFile => path.resolve(pageFile) === resolvedPath);
  }

  /**
   * Categorize element as belonging to a page
   */
  private categorizeAsPageElement(
    element: PageElement,
    filePath: string,
    pages: Record<string, PageInfo>,
    pageFiles: string[]
  ): void {
    const matchingPageFile = pageFiles.find(pageFile => 
      path.resolve(pageFile) === filePath
    );

    if (matchingPageFile) {
      const pageName = this.getPageName(matchingPageFile);
      if (pages[pageName]) {
        pages[pageName].elements.push(element);
      }
    }
  }

  /**
   * Categorize element as belonging to a module/component
   */
  private categorizeAsModuleElement(
    element: PageElement,
    filePath: string,
    ownership: ComponentOwnership,
    modules: Record<string, ModuleInfo>
  ): void {
    const moduleName = this.getModuleName(filePath);

    // Initialize module if it doesn't exist
    if (!modules[moduleName]) {
      modules[moduleName] = {
        name: moduleName,
        filePath: filePath,
        elements: [],
        usedByPages: Array.from(ownership.pageOwners).map(p => this.getPageName(p)),
        isShared: ownership.isShared,
        metadata: {
          scannedAt: new Date().toISOString(),
          confidence: ownership.isShared ? 0.9 : 0.7
        }
      };
    }

    modules[moduleName].elements.push(element);
  }

  /**
   * Calculate import lists for each page based on ownership data
   */
  private calculatePageImports(
    pages: Record<string, PageInfo>,
    componentOwnership: Map<string, ComponentOwnership>
  ): void {
    for (const [pageName, pageInfo] of Object.entries(pages)) {
      const imports: string[] = [];

      // Find all components that this page imports
      for (const [componentPath, ownership] of componentOwnership.entries()) {
        if (ownership.pageOwners.has(pageInfo.filePath)) {
          // This page imports this component
          if (!this.isPageFile(componentPath, [pageInfo.filePath])) {
            imports.push(componentPath);
          }
        }
      }

      pageInfo.imports = imports;
    }
  }

  /**
   * Extract page name from file path
   */
  private getPageName(filePath: string): string {
    const fileName = path.basename(filePath, path.extname(filePath));
    
    // Remove common suffixes
    const cleanName = fileName
      .replace(/Page$/, '')
      .replace(/Container$/, '')
      .replace(/Screen$/, '');
    
    return cleanName || fileName;
  }

  /**
   * Extract module name from file path
   */
  private getModuleName(filePath: string): string {
    const fileName = path.basename(filePath, path.extname(filePath));
    
    // Use directory + filename for better uniqueness
    const dir = path.basename(path.dirname(filePath));
    
    // If component is in a 'components' directory, use just the filename
    if (dir === 'components' || dir === 'ui' || dir === 'common') {
      return fileName;
    }
    
    // Otherwise use directory_filename format
    return `${dir}_${fileName}`;
  }
}