import type { Configuration } from 'webpack';

import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';
import nodeExternals from 'webpack-node-externals';

export const mainConfig: Configuration = {
  /**
   * This is the main entry point for the application, it's the first file
   * that runs in the main process.
   */
  entry: './src/main.ts',
  module: {
    rules,
  },
  plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
    fallback: { "path": require.resolve("path-browserify") }
  },
  target: 'electron-main',
  externals: [
    nodeExternals({
      allowlist: ['ffi-napi', 'ref-napi'], // Allow ffi-napi and ref-napi to be bundled
    }),
  ],
};
