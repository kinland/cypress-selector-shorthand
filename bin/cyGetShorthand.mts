#!/usr/bin/env node

import { program } from '@commander-js/extra-typings';

// We aren't using a bundler for this (yet), so we need to explicitly include the
// .mjs extension, even though it won't exist until we've built
import { generateInterfaces } from '../schemaGenerator/interfaceGenerator.mjs';

const cyGetShorthand = program
    .command('interfaces')
    .description('Generate interface files for cypress-selector-shorthand from provided schema file.')
    .requiredOption('-i, --schema <filename>', 'You must provide a schema file to process.')
    .requiredOption('-o, --outfile <filename>', 'You must specify where the TypeScript interfaces should be output')
    .requiredOption('-n, --appName <topLevelName>', 'You must provide an app-name, which will determine what your top-level Interface should be called')
    .parse();

const { schema: schemaFile, outfile: outFile, appName: topLevelName } = cyGetShorthand.opts();

await generateInterfaces({
    schemaFile,
    outFile,
    topLevelName,
});
