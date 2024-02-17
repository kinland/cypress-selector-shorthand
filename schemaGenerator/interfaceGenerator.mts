import _ from 'lodash';
import { readFile, writeFile } from 'fs/promises';
import { InputData, jsonInputForTargetLanguage, quicktype, TypeScriptTargetLanguage } from 'quicktype-core';

import type { InterfaceGenerationOptions, RawSchema } from '../lib/cypress-selector-shorthand';
import withinTypeMap from '../withinTypeMap.json' assert { type: 'json' };

const processWithTypeArray = (values: string[]) => values.map(value => _.upperFirst(_.camelCase(value))).join('|');

const withinTypesRowRegexFragment = processWithTypeArray(Object.values(withinTypeMap));

const rowInterfaceRegex = new RegExp(`^export interface (?=(.*?)(${withinTypesRowRegexFragment}) \\{)`);

function addWithToSchemaRows(schema: RawSchema) {
    if (schema === null || schema === undefined) {
        return;
    }
    Object.keys(schema).forEach(key => {
        const [containerPrefix, containerType] = key.match(new RegExp(`(.*)?(${Object.keys(withinTypeMap).join('|')})$`))?.slice(1) ?? [];
        if (containerType !== undefined) {
            const innerSchema = schema[key]!;
            const rowType = `${containerPrefix ?? ''}${withinTypeMap[containerType as keyof typeof withinTypeMap]}`;
            if (rowType in innerSchema) {
                const payload = innerSchema[rowType]!;
                innerSchema.with = _.cloneDeep(payload);
            }
        }
        addWithToSchemaRows(schema[key]!);
    });
}

async function generateInterfaces(options: InterfaceGenerationOptions) {
    const schema = JSON.parse((await readFile(options.schemaFile)).toString());
    addWithToSchemaRows(schema);

    // TODO: Replace TypeScriptTargetLanguage with custom subclass to avoid need for manual string processing below
    const cypressTsLang = new TypeScriptTargetLanguage();
    const schemaInput = jsonInputForTargetLanguage(cypressTsLang);
    schemaInput.addSourceSync({
        name: options.topLevelName,
        samples: [JSON.stringify(schema)],
    });
    const inputData = new InputData();
    inputData.addInput(schemaInput);

    const final = await quicktype({
        inputData,
        outputFilename: options.outFile,
        lang: cypressTsLang,
        rendererOptions: {
            /* eslint-disable @typescript-eslint/naming-convention */
            'just-types': true, // just-types?
            'acronym-style': 'camel',
            'nice-property-names': true,
            // topLevel: options.topLevelName,
            /* eslint-enable @typescript-eslint/naming-convention */
        },
        combineClasses: false,
    });

    let topLevel = true;
    let interfaceProps: string[] = [];
    let rowInterfacePrefix: string | null = null;
    let rowType: string | null = null;
    let rowInterface: string[] = [];

    final.lines = final.lines.flatMap((row) => {
        let modifiedRow = row;
        if (modifiedRow.endsWith('null;')) {
            // Replace the 'null' types with Cypress.Chainable<JQuery<HTMLElement>>
            modifiedRow = modifiedRow.replace(/null;$/, 'Cypress.Chainable<JQuery<HTMLElement>>;');
        } else if (topLevel || !modifiedRow.match(/^\s*with:/)) {
            modifiedRow = modifiedRow.replace(/(:\s*)([^;]+);$/, '$1Cypress.ChainableLike<JQuery<HTMLElement>, $2>;');
        } else if (!topLevel) {
            modifiedRow = modifiedRow.replace(new RegExp(`^(\\s*with:\\s*)(.*?)(?:${withinTypesRowRegexFragment});$`), '} & {\n$1$2With;');
        }

        modifiedRow = modifiedRow.replace(/export interface (.*) \{$/, 'export type $1 = {');

        rowInterfacePrefix ??= row.match(rowInterfaceRegex)?.[1] ?? null;
        rowType ??= row.match(rowInterfaceRegex)?.[2] ?? null;

        if (rowType !== null) {
            rowInterface.push(
                row
                    .replace(new RegExp(`^export interface (.*?)(${withinTypesRowRegexFragment}) \\{$`), 'export interface $1With {')
                    .replace(/null;$/, `(text: string) => Cypress.ChainableLike<JQuery<HTMLElement>, ${rowInterfacePrefix}${rowType}>;`)
            );
        }

        const fieldRegex = /(:\s*)([^;]+);$/;

        if (row.endsWith('}')) {
            topLevel = false;
            rowInterfacePrefix = rowType = null;
            if (interfaceProps.length > 0) {
                // this can go at the top in a future version; no need for the &.
                // The main reason for this (for now) is we don't know all the interface props yet,
                // and it simplifies parsing
                modifiedRow += ` & { [key: string]: Cypress.ChainableLike<JQuery<HTMLElement>, ${interfaceProps.join(' | ')}> };`;
            } else {
                modifiedRow += ';';
            }
            interfaceProps = [];
        } else if (row.match(fieldRegex) !== null) {
            const innerType = modifiedRow.match(/:\s*Cypress.ChainableLike<JQuery<HTMLElement>, ([^>]+)>;/);

            if (innerType !== null) {
                interfaceProps.push(innerType![1]);
            }
        }

        if (rowType === null && rowInterface.length > 0) {
            const result = [modifiedRow, '', ...rowInterface];
            rowInterface = [];
            return result;
        } else {
            return modifiedRow;
        }
    });

    const leadingLines = [
        '/**',
        ' * WARNING:',
        ' * THIS FILE IS AUTOMATICALLY GENERATED BY {@link https://github.com/kinland/cypress-selector-shorthand}.',
        ' * DO NOT MODIFY IT OR CHANGES MAY BE OVERWRITTEN!',
        ' */',
        '',
        '/* eslint-disable max-len */',
        '',
    ];

    return writeFile(options.outFile, [...leadingLines, ...final.lines].join('\n'));
}

export { generateInterfaces };
