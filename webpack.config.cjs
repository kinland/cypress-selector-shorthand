const path = require('path');

module.exports = {
    mode: 'production',
    target: 'node',
    entry: {
        // cyGetShorthand: './bin/cyGetShorthand.ts',
        'cypress-selector-shorthand': './lib/cypress-selector-shorthand.d.ts',
        navigationGenerator: './lib/navigationGenerator.ts',
        install: './lib/install.ts',
    },
    devtool: 'inline-source-map',
    output: {
        library: {
            name: 'cypress_selector_shorthand',
            type: 'umd',
        },
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
    module: {
        rules: [
            {
                test: /(?<!\.d)\.[c|m]?tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.d\.ts$/,
                type: 'asset/resource',
                generator: {
                    filename: '[file]',
                },
            },
        ],
    },
    resolve: {
        extensions: ['.d.ts', '.ts', '.cts', '.mts', '.tsx', '.js', '.cjs', '.mjs', '.jsx'],
    },
};