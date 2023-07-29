/* eslint-disable @typescript-eslint/naming-convention */
import { defineConfig } from 'cypress';
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
                typescript: require.resolve('typescript'),
                webpackOptions: {
                    ...webpackPreprocessor.defaultOptions.webpackOptions,
                    resolve: {
                        extensions: ['.cts', '.mts', '.tsx', '.d.ts', '.ts', '.js'],
                        alias: {
                            'cypress-selector-shorthand$': path.resolve(__dirname, 'index.js'),
                            'cypress-selector-shorthand/install$': path.resolve(__dirname, 'install.js'),
                        },
                    },
                },
            }));
        },
    },
});
