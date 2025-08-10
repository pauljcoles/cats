#!/usr/bin/env ts-node
declare class AutomatedRegistryBuilder {
    private nodes;
    private projectRoot;
    constructor(projectRoot?: string);
    /**
     * Main entry point - builds the complete registry
     */
    buildRegistry(): Promise<void>;
    /**
     * Phase 1: Discover all relevant files in the codebase
     */
    private discoverFiles;
    /**
     * Phase 2: Parse files and extract detailed information
     */
    private parseFiles;
    /**
     * Phase 3: Build relationships between nodes
     */
    private buildRelationships;
    /**
     * Parse TypeScript page object files
     */
    private parsePageObject;
    /**
     * Parse JSON test data files to extract TAF selectors
     */
    private parseTestDataFile;
    /**
     * Parse step definition files
     */
    private parseStepDefinition;
    /**
     * Parse feature files
     */
    private parseFeatureFile;
    /**
     * Parse React TSX/JSX components
     */
    private parseReactComponent;
    /**
     * Parse Vue SFC components
     */
    private parseVueComponent;
    /**
     * Build smart mappings between TAF selectors and page elements
     */
    private buildSelectorMappings;
    /**
     * Calculate similarity between TAF selector and page element selector
     */
    private calculateSelectorMapping;
    /**
     * Build relationships for step definitions
     */
    private buildStepRelationships;
    /**
     * Build relationships for feature files
     */
    private buildFeatureRelationships;
    /**
     * Generate all outputs (JSON, visualization, reports)
     */
    private generateOutputs;
    /**
     * Extract prop-based content from JSX elements
     */
    private extractPropBasedContent;
    private isPropBasedTextContent;
    private generateSuggestedTextFromProp;
    private extractTranslationKey;
    /**
     * Enhanced semantic selector recommendation algorithm
     */
    private generateRecommendedSelector;
    private isInteractiveElement;
    private isInputElement;
    private isNonSemanticElement;
    private generateTestId;
    /**
     * Determines the automation priority category for an element
     */
    private getAutomationPriority;
    /**
     * Detects automation-friendly attributes and their quality
     */
    private analyzeAutomationAttributes;
    /**
     * Determines if an HTML element is relevant for test automation
     * Only captures interactive elements that users typically automate
     */
    private isAutomationRelevantElement;
    /**
     * Analyze React component and extract semantic elements
     */
    private analyzeReactComponent;
    /**
     * Analyze Vue component and extract semantic elements
     */
    private analyzeVueComponent;
    private extractSemanticElementFromJsx;
    private extractSemanticElementsFromVueTemplate;
    private getSelectorPriority;
    private generateAccessibilityRecommendations;
    private getJsxTagName;
    private getJsxAttributes;
    private getJsxAttributeValue;
    private getJsxTextContent;
    private parseVueAttributes;
    /**
     * Helper methods for parsing and analysis
     */
    private findFiles;
    private generateNodeId;
    private getNodeType;
    private extractSelectorFromGetter;
    private inferElementType;
    private extractBaseClass;
    private extractStepDefinitions;
    private extractGherkinScenarios;
    private calculateStringSimilarity;
    private levenshteinDistance;
    private stepReferencesPage;
    private findMatchingStepDefinition;
    private stepMatches;
    private getTotalRelationshipCount;
    private generateSummary;
    private generateMappingReport;
    private generateMissingMappingsReport;
    private generateRecommendations;
    private generateVisualizationData;
    private getNodeGroup;
    private generateSemanticAnalysisReport;
    private calculateAccessibilityScore;
    private generateOverallAccessibilityRecommendations;
}
export { AutomatedRegistryBuilder };
//# sourceMappingURL=registry-builder.d.ts.map