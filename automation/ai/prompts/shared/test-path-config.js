export const TEST_PATH_CONFIG = {
    // Component type mapping for test types
    componentTypeMapping: {
        // Backend components
        'service': 'unit',
        'controller': 'unit', 
        'repository': 'unit',
        'entity': 'unit',
        'middleware': 'unit',
        'handler': 'unit',
        'command': 'unit',
        'api': 'integration',
        'database': 'integration',
        'workflow': 'integration',
        
        // Frontend components  
        'component': 'unit',
        'hook': 'unit',
        'store': 'unit',
        'page': 'integration',
        'flow': 'e2e'
    },

    // Category paths for different project structures
    categoryPaths: {
        'backend': 'backend/tests',
        'frontend': 'frontend/tests',
        'database': 'backend/tests',
        'api': 'backend/tests',
        'security': 'backend/tests',
        'performance': 'backend/tests',
        'testing': 'backend/tests',
        'documentation': 'backend/tests',
        'migration': 'backend/tests',
        'automation': 'backend/tests',
        'ai': 'backend/tests',
        'ide': 'backend/tests',
        'shared': 'tests',
        'common': 'tests'
    },

    // Test file extensions by category
    testExtensions: {
        'frontend': '.test.jsx',
        'default': '.test.js'
    },

    // Test type directories
    testTypeDirs: {
        'unit': 'unit',
        'integration': 'integration',
        'e2e': 'e2e',
        'performance': 'performance',
        'security': 'security'
    },

    // Monorepo structure patterns
    monorepoPatterns: {
        'backend': {
            basePath: 'backend',
            testPath: 'backend/tests',
            srcPath: 'backend/src'
        },
        'frontend': {
            basePath: 'frontend',
            testPath: 'frontend/tests',
            srcPath: 'frontend/src'
        },
        'shared': {
            basePath: 'shared',
            testPath: 'shared/tests',
            srcPath: 'shared/src'
        }
    }
};

/**
 * Resolve test path for a component based on category and type
 * @param {string} category - The category (backend, frontend, etc.)
 * @param {string} componentName - The component name
 * @param {string} componentType - The component type (service, component, etc.)
 * @returns {string} The resolved test path
 */
export function resolveTestPath(category, componentName, componentType = 'service') {
    const config = TEST_PATH_CONFIG;
    
    // Get test type from component type mapping
    const testType = config.componentTypeMapping[componentType] || 'unit';
    
    // Get base path from category paths
    const basePath = config.categoryPaths[category] || 'tests';
    
    // Get test type directory
    const testTypeDir = config.testTypeDirs[testType] || 'unit';
    
    // Get file extension
    const extension = config.testExtensions[category] || config.testExtensions.default;
    
    // Build the path
    return `${basePath}/${testTypeDir}/${componentName}${extension}`;
}

/**
 * Resolve test path for monorepo structure
 * @param {string} category - The category (backend, frontend, etc.)
 * @param {string} componentName - The component name
 * @param {string} componentType - The component type
 * @param {string} subPath - Optional sub-path within the category
 * @returns {string} The resolved test path
 */
export function resolveMonorepoTestPath(category, componentName, componentType = 'service', subPath = '') {
    const config = TEST_PATH_CONFIG;
    const monorepoConfig = config.monorepoPatterns[category];
    
    if (!monorepoConfig) {
        // Fallback to regular test path resolution
        return resolveTestPath(category, componentName, componentType);
    }
    
    // Get test type from component type mapping
    const testType = config.componentTypeMapping[componentType] || 'unit';
    
    // Get test type directory
    const testTypeDir = config.testTypeDirs[testType] || 'unit';
    
    // Get file extension
    const extension = config.testExtensions[category] || config.testExtensions.default;
    
    // Build the path with optional sub-path
    const subPathSegment = subPath ? `/${subPath}` : '';
    return `${monorepoConfig.testPath}${subPathSegment}/${testTypeDir}/${componentName}${extension}`;
}

/**
 * Get test path patterns for a category
 * @param {string} category - The category
 * @returns {object} Test path patterns
 */
export function getTestPathPatterns(category) {
    const config = TEST_PATH_CONFIG;
    const basePath = config.categoryPaths[category] || 'tests';
    
    return {
        unit: `${basePath}/unit/**/*.test.js`,
        integration: `${basePath}/integration/**/*.test.js`,
        e2e: `${basePath}/e2e/**/*.test.js`,
        performance: `${basePath}/performance/**/*.test.js`,
        security: `${basePath}/security/**/*.test.js`
    };
}

/**
 * Validate test path structure
 * @param {string} testPath - The test path to validate
 * @param {string} category - The category
 * @returns {boolean} Whether the path is valid
 */
export function validateTestPath(testPath, category) {
    const config = TEST_PATH_CONFIG;
    const basePath = config.categoryPaths[category] || 'tests';
    
    // Check if path starts with the correct base path
    if (!testPath.startsWith(basePath)) {
        return false;
    }
    
    // Check if path contains a valid test type directory
    const testTypeDirs = Object.values(config.testTypeDirs);
    const hasValidTestType = testTypeDirs.some(dir => testPath.includes(`/${dir}/`));
    
    if (!hasValidTestType) {
        return false;
    }
    
    // Check if path ends with a valid test extension
    const validExtensions = Object.values(config.testExtensions);
    const hasValidExtension = validExtensions.some(ext => testPath.endsWith(ext));
    
    return hasValidExtension;
}

/**
 * Generate test file content template
 * @param {string} componentName - The component name
 * @param {string} componentType - The component type
 * @param {string} category - The category
 * @returns {string} Test file content template
 */
export function generateTestFileTemplate(componentName, componentType, category) {
    const testPath = resolveTestPath(category, componentName, componentType);
    const testType = TEST_PATH_CONFIG.componentTypeMapping[componentType] || 'unit';
    
    return `import { describe, it, expect, beforeEach, afterEach } from 'vitest';
// Import your component/service here
// import { ${componentName} } from '../path/to/${componentName}';

describe('${componentName}', () => {
    beforeEach(() => {
        // Setup before each test
    });

    afterEach(() => {
        // Cleanup after each test
    });

    describe('${testType} tests', () => {
        it('should work correctly', () => {
            // Your test implementation
            expect(true).toBe(true);
        });

        it('should handle edge cases', () => {
            // Test edge cases
            expect(true).toBe(true);
        });

        it('should throw errors when appropriate', () => {
            // Test error conditions
            expect(() => {
                // Code that should throw
            }).toThrow();
        });
    });
});`;
}

/**
 * Get test configuration for a specific project structure
 * @param {string} projectType - The project type (monorepo, single, etc.)
 * @param {string} category - The category
 * @returns {object} Test configuration
 */
export function getTestConfig(projectType, category) {
    const config = TEST_PATH_CONFIG;
    
    if (projectType === 'monorepo') {
        return {
            basePath: config.monorepoPatterns[category]?.testPath || 'tests',
            patterns: getTestPathPatterns(category),
            resolvePath: (componentName, componentType, subPath) => 
                resolveMonorepoTestPath(category, componentName, componentType, subPath)
        };
    }
    
    return {
        basePath: config.categoryPaths[category] || 'tests',
        patterns: getTestPathPatterns(category),
        resolvePath: (componentName, componentType) => 
            resolveTestPath(category, componentName, componentType)
    };
}

export default {
    TEST_PATH_CONFIG,
    resolveTestPath,
    resolveMonorepoTestPath,
    getTestPathPatterns,
    validateTestPath,
    generateTestFileTemplate,
    getTestConfig
};
