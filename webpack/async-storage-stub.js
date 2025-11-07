/**
 * AsyncStorage Stub Module
 * Empty module to replace @react-native-async-storage/async-storage in browser builds
 * Used by webpack NormalModuleReplacementPlugin to satisfy MetaMask SDK imports
 */

// Export empty object with common AsyncStorage methods
// MetaMask SDK checks for these but doesn't use them in browser mode
module.exports = {
  getItem: async () => null,
  setItem: async () => {},
  removeItem: async () => {},
  clear: async () => {},
  getAllKeys: async () => [],
  multiGet: async () => [],
  multiSet: async () => {},
  multiRemove: async () => {},
};

// Also export default for ES module compatibility
module.exports.default = module.exports;

