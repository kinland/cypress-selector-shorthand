import _ from 'lodash';

import type { Loggable, RawSchema } from './cypress-selector-shorthand';

import { noLog } from './constants';
import withinTypeMap from '../withinTypeMap.json' assert { type: 'json' };
import { GeneratedNavigation, getCypressSelectorShorthandState, splitSelectorByWithinState } from './util';

type WithinChainableLike = Cypress.ChainableLike<JQuery<HTMLElement>, GeneratedNavigation>;
type InnerWithinCallbackType = (navigationShorthand: WithinChainableLike, currentSubject: JQuery<HTMLElement>) => void;

const cypressChainableMethodsAndProperties: string[] = [];

function withinWrapper(
    selector: string,
    generatedNavigation: WithinChainableLike & GeneratedNavigation,
    chainable: WithinChainableLike,
    optionsOrFn: Partial<Loggable> | InnerWithinCallbackType,
    fnOrUndefined?: InnerWithinCallbackType
) {
    const [options, originalCallback] = optionsOrFn instanceof Function
        ? [undefined, optionsOrFn]
        : [optionsOrFn, fnOrUndefined!];

    const callback = (subject: JQuery<HTMLElement>) => {
        cy.wrap(subject, noLog)
            .as('cypressSelectorShorthand.#generatedNavigationWithinSubject');
        return originalCallback(generatedNavigation, subject);
    };

    cy.then(() => {
        const { generatedNavigationWithin } = getCypressSelectorShorthandState();
        const escapedFilteredSelector = splitSelectorByWithinState(generatedNavigationWithin, selector);

        cy.wrap([...generatedNavigationWithin, escapedFilteredSelector], noLog)
            .as('cypressSelectorShorthand.#generatedNavigationWithin');
    });
    return (options !== undefined
        ? chainable.within(options, callback)
        : chainable.within(callback)
    ).then((result) => {
        const { generatedNavigationWithin } = getCypressSelectorShorthandState();
        cy.wrap(generatedNavigationWithin.slice(0, -1), noLog)
            .as('cypressSelectorShorthand.#generatedNavigationWithin');
        return cy.wrap(result, noLog);
    });
}

function proxifiedGet(selector: string) {
    return new Proxy(
        new Object(),
        {
            get: function (
                target: GeneratedNavigation,
                property,
                proxy: Cypress.ChainableLike<JQuery<HTMLElement>, typeof target>
            ) {
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

                // the !(propertyStr in target) has the unfortunate consequence that if you overlap your control name
                // with a Cypress command (e.g. 'type'), then you cannot call the Cypress command from the chain
                if (cypressChainableMethodsAndProperties.includes(propertyStr) && !(propertyStr in target)) {
                    // eslint-disable-next-line cypress/no-assigning-return-values
                    const chainable = cy.then(() => {
                        const { generatedNavigationWithin } = getCypressSelectorShorthandState();
                        const escapedFilteredSelector = splitSelectorByWithinState(generatedNavigationWithin, selector);
                        return escapedFilteredSelector !== ''
                            ? cy.tget(escapedFilteredSelector)
                            : cy.get('@cypressSelectorShorthand.#generatedNavigationWithinSubject', noLog);
                    }) as Cypress.ChainableLike<JQuery<HTMLElement>, typeof target>;

                    let chainedProperty = chainable[property as keyof Cypress.Chainable<JQuery<HTMLElement>>];

                    if (property === 'within') {
                        return withinWrapper.bind(chainable, selector, proxy, chainable);
                    }

                    if (typeof chainedProperty === 'function') {
                        chainedProperty = chainedProperty.bind(chainable);
                    }

                    return chainedProperty;
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
                    const key = _.camelCase(selector);
                    const newPrefix = prefix.length > 0 ? `${prefix} ${selector}` : selector;
                    accumulator[key] = { get: generateNavigationSubObject(newPrefix, schema[selector]) };

                    if (_.includes(withinTypeMap, selector)) {
                        const rowChildren = Object.keys(schema![selector] as object);
                        if (rowChildren.length > 0) {
                            accumulator.with = {
                                get: () => Object.defineProperties(
                                    {},
                                    rowChildren.reduce((withAccumulator, column) => {
                                        const rowChild = (text: string) => generateNavigationSubObject(`${prefix} ${selector}:has([data-test='${column}']:contains('${text}'))`, schema![selector])();
                                        withAccumulator[_.camelCase(column)] = { value: rowChild };
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
