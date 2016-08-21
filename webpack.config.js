const webpack = require("webpack");
const path = require("path");
const TsConfigPathsPlugin = require('awesome-typescript-loader').TsConfigPathsPlugin;
const ForkCheckerPlugin = require('awesome-typescript-loader').ForkCheckerPlugin;
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const chalk = require('chalk');

module.exports = {
    debug: true,
    target: 'node',
    context: __dirname,
    entry: {
        main: "./src/main.ts",
    },
    output: {
        path: path.join(__dirname, "dist"),
        filename: "main.js",
        pathinfo: true,
        libraryTarget: "commonjs",
        // name of the global var: "Foo",
        library: "loop",
    },
    module: {
        loaders: [
            { test: /\.ts/,   loader: "awesome-typescript-loader" },
        ],
        preLoaders: [
            {
                test: /\.ts/,
                include: path.join(__dirname, "src"),
                loader: "tslint",
            },
        ]
    },
    tslint: {
        failOnHint: false,
    },
    resolve: {
        root: path.join(__dirname, "src"),
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