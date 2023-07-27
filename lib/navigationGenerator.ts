import { noLog } from './constants';
import { snakeCaseToCamelCase } from './util';

type RawSchema = {
    [key: string]: RawSchema | null;
};

const cypressChainableMethodsAndProperties: string[] = [];

function proxifiedGet(selector: string) {
    return new Proxy(
        new Object(),
        {
            get: function (target, property) {
                const propertyStr = property.toString();

                if (cypressChainableMethodsAndProperties.length === 0) {
                    // eslint-disable-next-line cypress/no-assigning-return-values
                    const mockChainable = cy.wrap(Cypress.$('<div/>'), noLog);
                    const capturedMethodsAndProperties = [
                        ...Cypress._.functionsIn(mockChainable),
                        ...Cypress._.keysIn(mockChainable),
                    ].filter(n => !Cypress._.has(new Object(), n));
                    cypressChainableMethodsAndProperties.push(...capturedMethodsAndProperties);
                }

                if (cypressChainableMethodsAndProperties.includes(propertyStr)) {
                    const shouldLog = ['specWindow', 'chainerId'].includes(propertyStr) ? noLog : undefined;
                    // eslint-disable-next-line cypress/no-assigning-return-values
                    const chainable = cy.wrap(target, noLog).as('____generatedNavigation')
                        .then(() => {
                            const state = cy.state();
                            const withinCyWithin = state.withinSubjectChain !== undefined;
                            const generatedNavigationWithin // eslint-disable-next-line no-underscore-dangle
                                = state.aliases?.____generatedNavigationWithin?.subjectChain[0] as string | undefined;

                            const escapedFilteredSelector = withinCyWithin
                                ? selector.replace(new RegExp(`^${generatedNavigationWithin?.replace(/[^A-Za-z0-9_]/g, '\\$&')} `), '')
                                : selector;

                            return cy.tget(escapedFilteredSelector, shouldLog);
                        });


                    if (property === 'within') {
                        cy.wrap(selector, noLog).as('____generatedNavigationWithin');
                    }

                    return (chainable[property as keyof Cypress.Chainable<JQuery<HTMLElement>>]);
                }
                return target[property as keyof typeof target];
            },
        });
}

function generateNavigationSubObject(prefix: string, schema: RawSchema | null) {
    const proxiedObject = prefix.length > 0 || schema === null ? proxifiedGet(prefix) : {};

    if (schema !== null) {
        Object.defineProperties(
            proxiedObject,
            Object.keys(schema)
                .reduce((accumulator, selector) => {
                    const key = snakeCaseToCamelCase(selector);
                    const newPrefix = prefix.length > 0 ? `${prefix} ${selector}` : selector;
                    accumulator[key] = { get: generateNavigationSubObject(newPrefix, schema[selector]) };

                    if (selector === 'row') {
                        const rowChildren = Object.keys(schema.row as object);
                        if (rowChildren.length > 0) {
                            accumulator.with = {
                                get: () => Object.defineProperties(
                                    {},
                                    rowChildren.reduce((withAccumulator, column) => {
                                        const rowChild = (text: string) => generateNavigationSubObject(`${prefix} row:has([data-test=${column}]:contains(${text}))`, schema.row)();
                                        withAccumulator[snakeCaseToCamelCase(column)] = { value: rowChild };
                                        return withAccumulator;
                                    }, {} as PropertyDescriptorMap)),
                            };
                        }
                    }

                    return accumulator;
                // eslint-disable-next-line @typescript-eslint/naming-convention
                }, { '___prefix': { value: prefix } } as PropertyDescriptorMap)
        );
    }

    return () => proxiedObject;
}

function memoizedGenerateNavigationObject(prefix: string, schema: RawSchema | null) {
    return Cypress._.memoize(generateNavigationSubObject, (...args) => JSON.stringify(args))(prefix, schema);
}

function generateNavigationObject<T>(schema: RawSchema | null) {
    return memoizedGenerateNavigationObject('', schema)() as T;
}

export { generateNavigationObject };
export type { RawSchema };
