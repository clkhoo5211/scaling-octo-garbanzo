/**
 * React Native Stub Module
 * Empty module to replace React Native dependencies in browser builds
 * Used by webpack NormalModuleReplacementPlugin to satisfy MetaMask SDK imports
 * 
 * MetaMask SDK checks for React Native packages even in browser builds.
 * This stub provides empty implementations so the imports don't fail.
 */

// Export empty object - React Native modules are not needed in browser
module.exports = {};

// Also export default for ES module compatibility
module.exports.default = {};
