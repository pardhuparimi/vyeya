const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

const config = {
  resolver: {
    unstable_enableSymlinks: true,
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, '../../node_modules'),
    ],
    disableHierarchicalLookup: true,
  },
  watchFolders: [
    path.resolve(__dirname, '../../'),
  ],
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);