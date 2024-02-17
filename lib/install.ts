import { calculateTgetSelector } from './util';

function install() {
    Cypress.Commands.add('tget', (selector, options) => cy.get(calculateTgetSelector(selector), options));
}

export { install };
