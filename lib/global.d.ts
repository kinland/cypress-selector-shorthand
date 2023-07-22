/// <reference types="Cypress" />
// Cypress uses any instead of unknown in a number of places, so disable that lint check here.
/* eslint-disable @typescript-eslint/no-explicit-any */

type Loggable = Cypress.Loggable;
type Timeoutable = Cypress.Timeoutable;
type Alias = {
    ctx: Mocha.Context,
    subjectChain: unknown[],
    command: Cypress.Command,
    alias: string
};

type State = {
    [key: string]: unknown;
    aliases?: Record<string, Alias>,
    ctx: Mocha.Context,
    runnable: Mocha.Runnable,
    withinSubjectChain?: boolean
};

declare global {
    export namespace Cypress {
        export interface Chainable<
            Subject = any,
            NavigationShorthand extends object = never,
            WithinCallbackType = NavigationShorthand extends never
                ? ((currentSubject: Subject) => void)
                : ((navigationShorthand: ChainableLike<Subject, NavigationShorthand>, currentSubject: Subject) => void)
        > {
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
            ): Chainable<JQuery<HTMLElementTagNameMap[K]>>;

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

            within(fn: WithinCallbackType): Chainable<Subject, NavigationShorthand>;
            // inconsistent argument order
            within(options: Partial<Loggable>, fn: WithinCallbackType): Chainable<Subject, NavigationShorthand>;

            /**
             * Access internal Cypress state. @see https://glebbahmutov.com/blog/cy-now-and-state/
             * @param key If provided, equivalent to `cy.state()['key']`
             */
            state(): State;
            state<StateKey extends keyof State>(key: StateKey): State[StateKey];
        }

        // @ts-expect-error No easy solution for this, but if we ignore the typing error, it works as expected.
        export interface ChainableLike<
            Subject = unknown,
            NavigationShorthand extends object = never
        > extends Cypress.Chainable<Subject, NavigationShorthand>, NavigationShorthand {
            /**
             * Scopes all subsequent cy commands to within this element.
             * Useful when working within a particular group of elements such as a `<form>`.
             * @see https://on.cypress.io/within
             * @example
                ```
                cy.get('form').within(($form) => {
                    // cy.get() will only search for elements within form,
                    // not within the entire document
                    cy.get('input[name="username"]').type('john')
                    cy.get('input[name="password"]').type('password')
                    cy.root().submit()
                })
                ```
                * @example
                ```
                myApp.appsPage.applications.rows.with.name('TestApp')
                    .within((row, $rowEl) => {
                        row.manageLink.click();
                    });
                ```
            */
            within(
                fn: (navigationShorthand: ChainableLike<Subject, NavigationShorthand>, currentSubject: Subject) => void
            ): ChainableLike<Subject, NavigationShorthand>;
            /**
             * Scopes all subsequent cy commands to within this element.
             * Useful when working within a particular group of elements such as a `<form>`.
             * @see https://on.cypress.io/within
             */
            within(
                options: Partial<Loggable>,
                fn: (navigationShorthand: ChainableLike<Subject, NavigationShorthand>, currentSubject: Subject) => void
            ): ChainableLike<Subject, NavigationShorthand>; // inconsistent argument order

            filter<K extends keyof HTMLElementTagNameMap>(
                selector: K,
                options?: Partial<Loggable & Timeoutable>
            ): ChainableLike<JQuery<HTMLElementTagNameMap[K]>, NavigationShorthand>

            filter<E extends Node = HTMLElement>(
                selector: string,
                options?: Partial<Loggable & Timeoutable>
            ): ChainableLike<JQuery<E>, NavigationShorthand>

            filter<E extends Node = HTMLElement>(
                fn: (index: number, element: E) => boolean,
                options?: Partial<Loggable & Timeoutable>
            ): ChainableLike<JQuery<E>, NavigationShorthand>
        }
    }
}

export { generateNavigationObject } from './navigationGenerator';
