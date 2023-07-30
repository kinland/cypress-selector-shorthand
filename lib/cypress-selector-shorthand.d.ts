/// <reference types="Cypress" />
// Cypress uses any instead of unknown in a number of places, so disable that lint check here.
/* eslint-disable @typescript-eslint/no-explicit-any */

type Loggable = globalThis.Cypress.Loggable;
type Timeoutable = globalThis.Cypress.Timeoutable;

type Alias = {
    ctx: Mocha.Context,
    subjectChain: unknown[],
    command: globalThis.Cypress.Command,
    alias: string
};

type State = {
    [key: string]: unknown;
    aliases?: Record<string, Alias>,
    ctx: Mocha.Context,
    runnable: Mocha.Runnable,
    withinSubjectChain?: boolean
};

type WithinCallbackType<Subject = any, NavigationShorthand extends object = never> = [NavigationShorthand] extends [never]
    ? never
    : (navigationShorthand: Cypress.ChainableLike<Subject, NavigationShorthand>, currentSubject: Subject) => void;

interface ChainableLikeInner<
    Subject = any,
    NavigationShorthand extends object | never = never
> extends Cypress.Chainable<Subject, NavigationShorthand> {
    /**
     * Scopes all subsequent cy commands to within this element.
     * Useful when working within a particular group of elements such as a `<form>`.
     * @see https://on.cypress.io/within
     * @see https://github.com/kinland/cypress-selector-shorthand/blob/main/README.md
     * @example
    ```
    myApp.appsPage.applications.rows
        .with.name('TestApp')
        .within((row, $rowEl) => {
            row.manageLink.click();
        });
    ```
    */
    within(fn: WithinCallbackType<Subject, NavigationShorthand>): Cypress.ChainableLike<Subject, NavigationShorthand>;
    /**
     * Scopes all subsequent cy commands to within this element.
     * Useful when working within a particular group of elements such as a `<form>`.
     * @see https://on.cypress.io/within
     * @see https://github.com/kinland/cypress-selector-shorthand/blob/main/README.md
     * @example
    ```
    myApp.appsPage.applications.rows
        .with.name('TestApp')
        .within({ log: false }, (row, $rowEl) => {
            row.manageLink.click();
        });
    ```
    */
    within( // inconsistent argument order
        options: Partial<Loggable>,
        fn: WithinCallbackType<Subject, NavigationShorthand>
    ): Cypress.ChainableLike<Subject, NavigationShorthand>;

    // Built in cy.within
    within(fn: (currentSubject: Subject) => void): Cypress.Chainable<Subject>;
    // Built in cy.within
    within(
        options: Partial<Loggable>,
        fn: (currentSubject: Subject) => void
    ): Cypress.Chainable<Subject>; // inconsistent argument order

    // Override filter's return type
    filter<K extends keyof HTMLElementTagNameMap>(
        selector: K,
        options?: Partial<Loggable & Timeoutable>
    ): Cypress.ChainableLike<JQuery<HTMLElementTagNameMap[K]>, NavigationShorthand>;

    filter<E extends Node = HTMLElement>(
        selector: string,
        options?: Partial<Loggable & Timeoutable>
    ): Cypress.ChainableLike<JQuery<E>, NavigationShorthand>;

    filter<E extends Node = HTMLElement>(
        fn: (index: number, element: E) => boolean,
        options?: Partial<Loggable & Timeoutable>
    ): Cypress.ChainableLike<JQuery<E>, NavigationShorthand>;
}

declare global {
    export namespace Cypress {
        interface Chainable<Subject = any, NavigationShorthand extends object = never> {
            /**
             * Wrapper around {@link cy.get} that automatically wraps selector with [data-test={@link selector}]
             * Get one or more DOM elements by node name: input, button, etc.
             * @see https://on.cypress.io/get
             * @example
             *    cy.tget('#foo address_input')
             *    is equivalent to
             *    cy.get('#foo [data-test=address_input]')
             */
            tget<K extends keyof HTMLElementTagNameMap>(
                selector: K,
                options?: Partial<Loggable & Timeoutable & Withinable & Shadow>
            ): Chainable<JQuery<HTMLElementTagNameMap[K]>, NavigationShorthand>;

            /**
             * Wrapper around {@link cy.get} that automatically wraps selector with [data-test={@link selector}]
             * Get one or more DOM elements by selector.
             * The querying behavior of this command matches exactly how $(…) works in jQuery.
             * @see https://on.cypress.io/get
             * @example
             *    cy.tget('.list>li foo')    // Yield the <li>'s in <.list> that also match [data-test=foo]
             *    is equivalent to
             *    cy.get('.list>li [data-test=foo]')
             */
            tget<E extends Node = HTMLElement>(
                selector: string,
                options?: Partial<Loggable & Timeoutable & Withinable & Shadow>
            ): Chainable<JQuery<E>, NavigationShorthand>;

            /**
             * Get one or more DOM elements by alias.
             * @see https://on.cypress.io/get#Alias
             * @example
             *    // Get the aliased 'todos' elements
             *    cy.get('ul#todos').as('todos')
             *    //...hack hack hack...
             *    //later retrieve the todos
             *    cy.get('@todos')
             */
            tget<S = any>(
                alias: `@${string}`,
                options?: Partial<Loggable & Timeoutable & Withinable & Shadow>
            ): Chainable<S | Subject, NavigationShorthand>;

            /**
             * Access internal Cypress state. @see https://glebbahmutov.com/blog/cy-now-and-state/
             * @param key If provided, equivalent to `cy.state()['key']`
             */
            state(): State;
            state<StateKey extends keyof State>(key: StateKey): State[StateKey];
        }

        export type ChainableLike<Subject = any, NavigationShorthand extends object | never = never>
            = [NavigationShorthand] extends [never]
                ? Chainable<Subject, NavigationShorthand>
                : ChainableLikeInner<Subject, NavigationShorthand> & NavigationShorthand;
    }
}

export type RawSchema = {
    [key: string]: RawSchema | null;
};

export interface InterfaceGenerationOptions {
    schemaFile: string,
    outFile: string,
    topLevelName: string
}

export function generateInterfaces(options: InterfaceGenerationOptions): Promise<void>;

export function generateNavigationObject<T>(schema: RawSchema | null): T;
