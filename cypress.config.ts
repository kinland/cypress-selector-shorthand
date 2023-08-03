import { defineConfig } from 'cypress';

// eslint-disable-next-line import/no-default-export
export default defineConfig({
    downloadsFolder: 'artifacts/downloads',
    screenshotsFolder: 'artifacts/screenshots',
    videosFolder: 'artifacts/videos',
    e2e: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        setupNodeEvents(on, config) {
            // implement node event listeners here
        },
    },
});
