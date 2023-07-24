#!/usr/bin/env node

import { program } from '@commander-js/extra-typings';

import { generateInterfaces } from '../schemaGenerator/interfaceGenerator.mjs';

const cyGetShorthand = program
    .command('interfaces')
    .description('Generate interface files for cypress-selector-shorthand from provided schema file.')
    .requiredOption('-i, --input <filename>', 'You must provide a schema file to process.')
    .requiredOption('-o, --out-file <filename>', 'You must specify where the TypeScript interfaces should be output')
    .requiredOption('-n, --appName <topLevelName>', 'You must provide an app-name, which will determine what your top-level Interface should be called')
    .parse();

const { input: schemaFile, outFile, appName: topLevelName } = cyGetShorthand.opts();

generateInterfaces({
    schemaFile,
    outFile,
    topLevelName,
});
