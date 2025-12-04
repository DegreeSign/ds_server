import webpack, { Configuration } from 'webpack';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import TerserPlugin from 'terser-webpack-plugin';
import path from 'path';

// Common configuration
const commonConfig: Configuration = {
    entry: `./src/index.ts`, // Entry point for your library
    resolve: {
        extensions: [`.ts`, `.js`], // Resolve .ts and .js files
    },
    module: {
        rules: [
            {
                test: /\.ts$/,         // Match .ts files
                use: `ts-loader`,      // Use ts-loader for TypeScript
                exclude: /node_modules/,
            },
        ],
    },
    plugins: [
        new BundleAnalyzerPlugin(),
        new CleanWebpackPlugin(), // Clean output directory before each build
        new webpack.BannerPlugin({
            banner: `/*! MIT License. DegreeSign Server SDK. https://opensource.org/licenses/MIT */`,
            raw: true, // Ensures the comment appears as-is without being wrapped
        }),
    ],
    optimization: {
        minimize: true,           // Minify the output
        minimizer: [new TerserPlugin()],
        usedExports: true,        // Enable tree-shaking
        sideEffects: false,       // Mark the project as free of side effects
    },
    mode: `production`,          // Ensure output is optimized
};

module.exports = [{
    ...commonConfig,
    target: `node18`,
    resolve: {
        ...commonConfig.resolve,
        mainFields: [`module`, `main`],
        conditionNames: [`import`, `default`],
        aliasFields: [],
        preferRelative: true,
    },
    externals: {
        express: "commonjs express",
    },
    output: {
        path: path.resolve(__dirname, `dist/node`), // Separate output directory
        filename: `degreesign.node.min.js`,
        libraryTarget: `commonjs`, // CommonJS for Node.js
        globalObject: `typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this)`,
    },
    node: {
        __dirname: false, // Prevent Webpack from mocking __dirname
        __filename: false, // Prevent Webpack from mocking __filename
    },
}];