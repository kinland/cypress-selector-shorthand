/* eslint-disable @typescript-eslint/naming-convention */
import { defineConfig } from 'cypress';
import _ from 'lodash';
import path from 'path';

// @ts-expect-error No types declaration available
import webpackPreprocessor from '@cypress/webpack-batteries-included-preprocessor';

// eslint-disable-next-line import/no-default-export
export default defineConfig({
    downloadsFolder: 'artifacts/downloads',
    screenshotsFolder: 'artifacts/screenshots',
    videosFolder: 'artifacts/videos',
    e2e: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setupNodeEvents(on, config) {
            // implement node event listeners here
            on('file:preprocessor', webpackPreprocessor({
                target: 'node',
                typescript: require.resolve('typescript'),
                webpackOptions: _.merge(
                    webpackPreprocessor.defaultOptions.webpackOptions,
                    {
                        devtool: 'inline-source-map',
                        resolve: {
                            extensions: ['.ts', '.cts', '.mts', '.tsx', '.js', '.cjs', '.mjs', '.jsx'],
                            alias: {
                                'cypress-selector-shorthand$': path.resolve(__dirname, 'index.js'),
                                'cypress-selector-shorthand/install$': path.resolve(__dirname, 'install.js'),
                                'cypress-selector-shorthand/generator$': path.resolve(__dirname, 'generator.js'),
                            },
                        },
                    }
                ),
            }));
        },
    },
});
