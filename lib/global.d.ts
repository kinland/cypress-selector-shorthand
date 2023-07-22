/// <reference types="Cypress" />
// Cypress uses any instead of unknown in a number of places, so disable that lint check here.
/* eslint-disable @typescript-eslint/no-explicit-any */

declare global {
    export namespace Cypress {
        export interface Chainable<
            Subject = any
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
            ): Chainable<JQuery<E>>;

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
            ): Chainable<S | Subject>;
        }
    }
}

export {};
