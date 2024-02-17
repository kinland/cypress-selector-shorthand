/**
    Forked from cypress-kitchen-sink (to add additional data-test fields)
    @link https://github.com/cypress-io/cypress-example-kitchensink/
    Specifically:
    @see https://github.com/cypress-io/cypress-example-kitchensink/blob/master/cypress/e2e/1-getting-started/todo.cy.js

    MIT License © Cypress-io
*/

import { generateNavigationObject } from 'cypress-selector-shorthand';

import { calculateTgetSelector } from '../../lib/util';
import type { TodoApp } from '../todoInterface';
import schema from '../todoSchema.json';

const { todoPage } = generateNavigationObject<TodoApp>(schema);

// Welcome to Cypress!
//
// This spec file contains a variety of sample tests
// for a todo list app that are designed to demonstrate
// the power of writing tests in Cypress.
//
// To learn more about how Cypress works and
// what makes it such an awesome testing tool,
// please read our getting started guide:
// https://on.cypress.io/introduction-to-cypress

describe('example to-do app', () => {
    beforeEach(() => {
        // Cypress starts out with a blank slate for each test
        // so we must tell it to visit our website with the `cy.visit()` command.
        // Since we want to visit the same URL at the start of all our tests,
        // we include it in our beforeEach function so that it runs before each test
        cy.visit('../../testApp/todo.html');
    });

    context('from clean state', () => {
        it('displays two todo items by default', () => {
        // We use the `cy.get()` command to get all elements that match the selector.
        // Then, we use `should` to assert that there are two matched items,
        // which are the two default items.
            todoPage.todoApp.main.rows.row
                .should('have.length', 2);

            // We can go even further and check that the default todos each contain
            // the correct text. We use the `first` and `last` functions
            // to get just the first and last matched elements individually,
            // and then perform an assertion with `should`.
            todoPage.todoApp.main.rows.row
                .first().should('have.text', 'Pay electric bill');
            todoPage.todoApp.main.rows.row
                .last().should('have.text', 'Walk the dog');
        });

        it('can add new todo items', () => {
        // We'll store our item text in a variable so we can reuse it
            const newItem = 'Feed the cat';

            // Let's get the input element and use the `type` command to
            // input our new list item. After typing the content of our item,
            // we need to type the enter key as well in order to submit the input.
            // This input has a data-test attribute so we'll use that to select the
            // element in accordance with best practices:
            // https://on.cypress.io/selecting-elements
            todoPage.todoApp.newTodo
                .type(`${newItem}{enter}`);

            // Now that we've typed our new item, let's check that it actually was added to the list.
            // Since it's the newest item, it should exist as the last element in the list.
            // In addition, with the two default items, we should have a total of 3 elements in the list.
            // Since assertions yield the element that was asserted on,
            // we can chain both of these assertions together into a single statement.
            todoPage.todoApp.main.rows.row
                .should('have.length', 3)
                .last()
                .should('have.text', newItem);
        });

        it('can check off an item as completed', () => {
        // In addition to using the `get` command to get an element by selector,
        // we can also use the `contains` command to get an element by its contents.
        // However, this will yield the <label>, which is lowest-level element that contains the text.
        // In order to check the item, we'll find the <input> element for this <label>
        // by traversing up the dom to the parent element. From there, we can `find`
        // the child checkbox <input> element and use the `check` command to check it.
            todoPage.todoApp.main.rows
                .with.label('Pay electric bill')
                .checkbox
                .check();

            // Now that we've checked the button, we can go ahead and make sure
            // that the list element is now marked as completed.
            // Again we'll use `contains` to find the <label> element and then use the `parents` command
            // to traverse multiple levels up the dom until we find the corresponding <li> element.
            // Once we get that element, we can assert that it has the completed class.
            todoPage.todoApp.main.rows
                .with.label('Pay electric bill')
                .should('have.class', 'completed');
        });
    });

    context('with a checked task', () => {
        beforeEach(() => {
        // We'll take the command we used above to check off an element
        // Since we want to perform multiple tests that start with checking
        // one element, we put it in the beforeEach hook
        // so that it runs at the start of every test.
            todoPage.todoApp.main.rows
                .with.label('Pay electric bill')
                .checkbox
                .check();
        });

        it('can filter for uncompleted tasks', () => {
        // We'll click on the "active" button in order to
        // display only incomplete items
            todoPage.todoApp.footer.filters.active
                .click();

            // After filtering, we can assert that there is only the one
            // incomplete item in the list.
            todoPage.todoApp.main.rows.row
                .should('have.length', 1)
                .first()
                .should('have.text', 'Walk the dog');

            // For good measure, let's also assert that the task we checked off
            // does not exist on the page.
            todoPage.todoApp.main.rows
                .with.label('Pay electric bill')
                .should('not.exist');
        });

        it('can filter for completed tasks', () => {
        // We can perform similar steps as the test above to ensure
        // that only completed tasks are shown
            todoPage.todoApp.footer.filters.completed
                .click();

            todoPage.todoApp.main.rows.row
                .should('have.length', 1)
                .first()
                .should('have.text', 'Pay electric bill');

            todoPage.todoApp.main.rows
                .with.label('Walk the dog')
                .should('not.exist');
        });

        it('can delete all completed tasks', () => {
            // First, make sure that the clear button is present and visible.
            // This was not part of cypress-example-kitchensink's original test,
            // but since we are not using .contains() like the original test case,
            // 'not.exist' as an assertion won't work, since the element still exists
            todoPage.todoApp.footer.clearCompletedButton
                .should('exist')
                .should('be.visible');

            // First, let's click the "Clear completed" button
            // `contains` is actually serving two purposes here.
            // First, it's ensuring that the button exists within the dom.
            // This button only appears when at least one task is checked
            // so this command is implicitly verifying that it does exist.
            // Second, it selects the button so we can click it.
            todoPage.todoApp.footer.clearCompletedButton
                .click();

            // Then we can make sure that there is only one element
            // in the list and our element does not exist
            todoPage.todoApp.main.rows.row
                .should('have.length', 1)
                .should('not.have.text', 'Pay electric bill');

            // Finally, make sure that the clear button no longer exists.
            todoPage.todoApp.footer.clearCompletedButton
                .should('not.be.visible');
        });
    });

    context('Additional tests not covered by original cypress-kitchen-sink Todo tests', () => {
        it('test tget selector', () => {
            expect(
                calculateTgetSelector('todo_page todo_app main rows row')
            ).to.equal("[data-test='todo_page'] [data-test='todo_app'] [data-test='main'] [data-test='rows'] [data-test='row']");
        });

        it('test tget does not process within parenthesis or brackets', () => {
            expect(
                calculateTgetSelector('todo_page [data-test=todo_app] main rows row:has(label:contains(Walk the dog))')
            ).to.equal("[data-test='todo_page'] [data-test=todo_app] [data-test='main'] [data-test='rows'] [data-test='row']:has(label:contains(Walk the dog))");
        });

        it('test tget directly', () => {
            cy.tget('todo_page todo_app main rows row:has([data-test=label]:contains(Walk the dog))')
                .should('exist')
                .should('have.text', 'Walk the dog');
        });

        it('deep nested withins behave as expected', () => {
        // test whether navigation shorthands are passed properly to within and still function
        // this is an excessive number of withins to ensure that a within within within still works.
            todoPage.todoApp
                .within(todoApp =>
                    todoApp.main
                        .within(main =>
                            main.rows.within(rows => {
                                rows.row
                                    .first().should('have.text', 'Pay electric bill');
                                rows.row
                                    .last().should('have.text', 'Walk the dog');
                            })
                        ));
        });
    });
});