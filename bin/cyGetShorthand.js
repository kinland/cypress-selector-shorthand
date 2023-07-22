#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const dirname = path.join(path.dirname(fileURLToPath(import.meta.url)));

execSync(`ts-node --esm -T -P ${dirname}/../tsconfig.json ${dirname}/index.ts ${process.argv.slice(2).join(' ')}`, {
    encoding: 'utf-8',
    stdio: 'inherit',
});