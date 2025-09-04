import { Project, SourceFile, ImportDeclaration, ExportDeclaration } from 'ts-morph';
import * as path from 'path';
import * as fs from 'fs-extra';

export interface ComponentOwnership {
  pageOwners: Set<string>;           // Which pages import this component
  isShared: boolean;                 // Whether used by multiple pages
  depth: number;                     // How many levels deep from page
}

export interface ImportResult {
  allFiles: string[];
  componentOwnership: Map<string, ComponentOwnership>;
  pageImports: Map<string, string[]>; // page -> [imported components]
}

export class ImportResolver {
  private project: Project;
  private dependencyGraph = new Map<string, Set<string>>();
  private resolvedFiles = new Set<string>();
  private processingStack = new Set<string>(); // To detect circular dependencies
  private componentOwnership = new Map<string, ComponentOwnership>();
  private pageImports = new Map<string, string[]>();
  private currentPageContext: string | null = null;

  constructor(private tsConfigPath?: string) {
    this.project = new Project({
      tsConfigFilePath: tsConfigPath || 'tsconfig.json',
      skipAddingFilesFromTsConfig: false,
      useInMemoryFileSystem: false
    });
  }

  /**
   * Resolve all imports from entry files and track page ownership
   */
  async resolveImports(entryFiles: string[]): Promise<ImportResult> {
    console.log('🔗 Building dependency graph...');
    
    // Add entry files to project
    for (const filePath of entryFiles) {
      if (await fs.pathExists(filePath)) {
        this.project.addSourceFileAtPath(filePath);
      }
    }

    // Process each entry file as a page
    for (const entryFile of entryFiles) {
      this.currentPageContext = path.resolve(entryFile);
      await this.processFile(entryFile, 0); // depth = 0 for pages
      this.currentPageContext = null;
    }

    // Calculate which components are shared
    this.calculateSharedComponents();

    // Return comprehensive results
    const result: ImportResult = {
      allFiles: Array.from(this.resolvedFiles),
      componentOwnership: this.componentOwnership,
      pageImports: this.pageImports
    };

    console.log(`🔗 Dependency graph complete: ${result.allFiles.length} files`);
    console.log(`🔗 Found ${Array.from(this.componentOwnership.values()).filter(c => c.isShared).length} shared components`);
    
    return result;
  }

  /**
   * Process a single file and its imports recursively
   */
  private async processFile(filePath: string, depth: number): Promise<void> {
    const resolvedPath = path.resolve(filePath);
    
    // Skip if already processed
    if (this.resolvedFiles.has(resolvedPath)) {
      return;
    }

    // Detect circular dependencies
    if (this.processingStack.has(resolvedPath)) {
      console.warn(`⚠️  Circular dependency detected: ${resolvedPath}`);
      return;
    }

    // Skip if file doesn't exist
    if (!(await fs.pathExists(resolvedPath))) {
      console.warn(`⚠️  File not found: ${resolvedPath}`);
      return;
    }

    // Add to processing stack
    this.processingStack.add(resolvedPath);
    this.resolvedFiles.add(resolvedPath);

    // Track component ownership
    this.trackComponentOwnership(resolvedPath, depth);

    try {
      // Get or add source file
      let sourceFile = this.project.getSourceFile(resolvedPath);
      if (!sourceFile) {
        sourceFile = this.project.addSourceFileAtPath(resolvedPath);
      }

      // Initialize dependency set
      if (!this.dependencyGraph.has(resolvedPath)) {
        this.dependencyGraph.set(resolvedPath, new Set());
      }

      const dependencies = this.dependencyGraph.get(resolvedPath)!;

      // Process imports
      const importDeclarations = sourceFile.getImportDeclarations();
      for (const importDecl of importDeclarations) {
        const importPath = importDecl.getModuleSpecifierValue();
        const resolvedImportPath = await this.resolveModulePath(importPath, resolvedPath);
        
        if (resolvedImportPath && this.isLocalFile(resolvedImportPath)) {
          dependencies.add(resolvedImportPath);
          await this.processFile(resolvedImportPath, depth + 1);
        }
      }

      // Process re-exports
      const exportDeclarations = sourceFile.getExportDeclarations();
      for (const exportDecl of exportDeclarations) {
        const moduleSpecifier = exportDecl.getModuleSpecifier();
        if (moduleSpecifier) {
          const exportPath = moduleSpecifier.getLiteralValue();
          const resolvedExportPath = await this.resolveModulePath(exportPath, resolvedPath);
          
          if (resolvedExportPath && this.isLocalFile(resolvedExportPath)) {
            dependencies.add(resolvedExportPath);
            await this.processFile(resolvedExportPath, depth + 1);
          }
        }
      }

      // Process dynamic imports (if enabled in config)
      const dynamicImports = this.findDynamicImports(sourceFile);
      for (const dynamicImport of dynamicImports) {
        const resolvedDynamicPath = await this.resolveModulePath(dynamicImport, resolvedPath);
        
        if (resolvedDynamicPath && this.isLocalFile(resolvedDynamicPath)) {
          dependencies.add(resolvedDynamicPath);
          await this.processFile(resolvedDynamicPath, depth + 1);
        }
      }

    } catch (error) {
      console.warn(`⚠️  Error processing ${resolvedPath}:`, error);
    } finally {
      // Remove from processing stack
      this.processingStack.delete(resolvedPath);
    }
  }

  /**
   * Resolve module path using TypeScript module resolution
   */
  private async resolveModulePath(importPath: string, fromFile: string): Promise<string | null> {
    // Handle relative imports
    if (importPath.startsWith('./') || importPath.startsWith('../')) {
      const resolved = path.resolve(path.dirname(fromFile), importPath);
      return await this.findFileWithExtensions(resolved);
    }

    // Handle absolute imports with aliases
    const aliasResolved = this.resolveAlias(importPath, fromFile);
    if (aliasResolved) {
      return await this.findFileWithExtensions(aliasResolved);
    }

    // Skip node_modules imports
    if (!this.isLocalFile(importPath)) {
      return null;
    }

    // Try TypeScript module resolution
    try {
      const compilerOptions = this.project.getCompilerOptions();
      const resolved = path.resolve(path.dirname(fromFile), importPath);
      return await this.findFileWithExtensions(resolved);
    } catch (error) {
      return null;
    }
  }

  /**
   * Resolve alias imports (like @/components)
   */
  private resolveAlias(importPath: string, fromFile: string): string | null {
    const compilerOptions = this.project.getCompilerOptions();
    const paths = compilerOptions.paths;
    
    if (!paths) return null;

    for (const [alias, aliasPaths] of Object.entries(paths)) {
      const aliasPattern = alias.replace('/*', '');
      
      if (importPath.startsWith(aliasPattern)) {
        const relativePath = importPath.substring(aliasPattern.length);
        
        for (const aliasPath of aliasPaths) {
          const resolvedPath = aliasPath.replace('/*', '').replace('*', '');
          const baseUrl = compilerOptions.baseUrl || path.dirname(fromFile);
          const fullPath = path.resolve(baseUrl, resolvedPath + relativePath);
          
          return fullPath;
        }
      }
    }

    return null;
  }

  /**
   * Find file with common TypeScript/JavaScript extensions
   */
  private async findFileWithExtensions(basePath: string): Promise<string | null> {
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
    
    // Try exact path first
    if (await fs.pathExists(basePath) && (await fs.stat(basePath)).isFile()) {
      return basePath;
    }

    // Try with extensions
    for (const ext of extensions) {
      const withExt = basePath + ext;
      if (await fs.pathExists(withExt)) {
        return withExt;
      }
    }

    // Try index files
    for (const ext of extensions) {
      const indexPath = path.join(basePath, `index${ext}`);
      if (await fs.pathExists(indexPath)) {
        return indexPath;
      }
    }

    return null;
  }

  /**
   * Check if import path is a local file (not node_modules)
   */
  private isLocalFile(importPath: string): boolean {
    return !importPath.includes('node_modules') && 
           !this.isNodeModuleImport(importPath);
  }

  /**
   * Check if import is from node_modules
   */
  private isNodeModuleImport(importPath: string): boolean {
    return !importPath.startsWith('./') && 
           !importPath.startsWith('../') && 
           !importPath.startsWith('/') &&
           !importPath.startsWith('@/'); // Common alias pattern
  }

  /**
   * Find dynamic imports in source file
   */
  private findDynamicImports(sourceFile: SourceFile): string[] {
    const dynamicImports: string[] = [];
    
    // Simple regex-based search for dynamic imports for now
    const sourceText = sourceFile.getFullText();
    const dynamicImportRegex = /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
    let match;
    
    while ((match = dynamicImportRegex.exec(sourceText)) !== null) {
      dynamicImports.push(match[1]);
    }

    return dynamicImports;
  }

  /**
   * Track which page owns a component
   */
  private trackComponentOwnership(filePath: string, depth: number): void {
    if (!this.currentPageContext) return;

    // Initialize ownership if not exists
    if (!this.componentOwnership.has(filePath)) {
      this.componentOwnership.set(filePath, {
        pageOwners: new Set(),
        isShared: false,
        depth: depth
      });
    }

    const ownership = this.componentOwnership.get(filePath)!;
    ownership.pageOwners.add(this.currentPageContext);
    
    // Update depth to minimum (closer to page)
    ownership.depth = Math.min(ownership.depth, depth);

    // Track page imports
    if (depth === 1) { // Direct import from page
      if (!this.pageImports.has(this.currentPageContext)) {
        this.pageImports.set(this.currentPageContext, []);
      }
      this.pageImports.get(this.currentPageContext)!.push(filePath);
    }
  }

  /**
   * Calculate which components are shared across multiple pages
   */
  private calculateSharedComponents(): void {
    for (const [filePath, ownership] of this.componentOwnership.entries()) {
      ownership.isShared = ownership.pageOwners.size > 1;
    }
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    // ts-morph will handle cleanup automatically
  }
}