import { program } from 'commander';

import { generateInterfaces } from '../schemaGenerator/interfaceGenerator.mjs';

program
    .requiredOption('-i, --input <filename>', 'You must provide a schema file to process.')
    .requiredOption('-o, --out-file <filename>', 'You must specify where the TypeScript interfaces should be output')
    .requiredOption('-t, --topLevelName <topLevelName>', 'You must specify what your top-level Interface should be called')
    .parse();

const { input: schemaFile, outFile, topLevelName } = program.opts();

generateInterfaces({
    schemaFile,
    outFile,
    topLevelName,
});
