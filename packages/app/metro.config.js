const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  resolver: {
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, '../../node_modules'),
      path.resolve(__dirname, '../../node_modules/.pnpm/@babel+runtime@7.25.0/node_modules'),
      path.resolve(__dirname, '../../node_modules/.pnpm/@babel+runtime@7.28.2/node_modules'),
    ],
  },
};

module.exports = mergeConfig(defaultConfig, config);