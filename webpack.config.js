const webpack = require('webpack');
const path = require('path');
const TsConfigPathsPlugin = require('awesome-typescript-loader').TsConfigPathsPlugin;
const ForkCheckerPlugin = require('awesome-typescript-loader').ForkCheckerPlugin;
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const chalk = require('chalk');

const SourceDir = path.resolve(__dirname, './src');
const DistDir = path.join(__dirname, 'dist');

module.exports = {
    devtool: 'inline-source-map',
    debug: true,
    target: 'node',
    context: __dirname,
    entry: {
        main: path.join(SourceDir, 'main.ts'),
    },
    output: {
        path: DistDir,
        filename: 'main.js',
        pathinfo: true,
        libraryTarget: 'commonjs2',
    },
    module: {
        loaders: [
            { test: /\.ts/,   loader: 'awesome-typescript-loader' },
        ],
        preLoaders: [
            {
                test: /\.ts/,
                include: SourceDir,
                loader: 'tslint',
            },
        ]
    },
    tslint: {
        failOnHint: false,
    },
    resolve: {
        root: SourceDir,
        extensions: ['', '.ts'],
    },
    plugins: [
        new ProgressBarPlugin({
            format: '  build [:bar] ' + chalk.green.bold(':percent') + ' (:elapsed seconds)',
            clear: false,
        }),
        new TsConfigPathsPlugin(),
        new ForkCheckerPlugin(),
        new webpack.DefinePlugin({
            'process.env': {
                BROWSER: JSON.stringify(true),
                NODE_ENV: JSON.stringify('development')
            },
        }),
        new webpack.NoErrorsPlugin(),
    ],
};