# cypress-selector-shorthand

Tired of the boilerplate needed for writing unambiguous selectors for Cypress UI tests? Use `cypress-selector-shorthand` to create navigation shorthands!

With this plugin, the following examples have full IntelliSense, and you can chain arbitrary Cypress commands off of your app selectors:
```js
myApp.appInfo.createNewUserSection.firstNameInput
    .type('First');
myApp.appInfo.createNewUserSection.lastNameInput
    .type('Last');
myApp.appInfo.createNewUserSection.submitButton
    .click();
```
```js
myApp.appInfo.createNewUserSection
    .within(({ firstNameInput, lastNameInput, submitButton }) => {
        firstNameInput
            .type('First');
        lastNameInput
            .type('Last');
        submitButton
            .click();
    });
```

The above snippets are equivalent to the following raw Cypress:
```js
cy.get('[data-test=app_info] [data-test=create_new_user_section] [data-test=first_name_input]')
    .type('First');
cy.get('[data-test=app_info] [data-test=create_new_user_section] [data-test=last_name_input]')
    .type('Last');
cy.get('[data-test=app_info] [data-test=create_new_user_section] [data-test=submit_button]')
    .click();
```
```js
cy.get('[data-test=app_info] [data-test=create_new_user_section]')
    .within(() => {
        cy.get('[data-test=first_name_input]')
            .type('First');
        cy.get('[data-test=last_name_input]')
            .type('Last');
        cy.get('[data-test=submit_button]')
            .click();
    });
```

There's also new `cy.tget` command. It works the same way as the built-in `cy.get`, but automatically wraps non-css/jQuery identifiers with `[data-test]`.

For example: 
```js
cy.tget('app_info:visible create_new_user_section submit_button');
```
will be converted automatically into 
```js
cy.get('[data-test=app_info]:visible [data-test=create_new_user_section] [data-test=submit_button]');
```

## Installation
```bash
pnpm add -D cypress-selector-shorthand
# or
npm i -D cypress-selector-shorthand
# or
yarn add -D cypress-selector-shorthand
```

Add this line to your project's `cypress/support/commands.js` (or `commands.ts`):
```js
import 'cypress-selector-shorthand/install';
```

## Configuration
To make use of the navigation shorthands, there's three extra steps you need to do to generate the objects and interfaces. (Note: you can use `cy.tget()` without this.)

First, you need to create a schema JSON file, e.g. the following might be used for the example at the top of this file:

`./myAppSchema.json`
```json
{
    "app_info": {
        "create_new_user_section": {
            "name_input": null,
            "address_input": null,
            "submit_button": null
        },
        "existing_users_table": {
            "rows" : {
                "row": {
                    "firstName": null,
                    "lastName": null
                }
            }
        }
    }
}
```

Once you have your schema, you need to generate interfaces for IntelliSense:

```bash
npx cypress-selector-shorthand interfaces --appName 'MyApp' --infile './myAppSchema.json' --outfile './src/myAppInterface.ts'`
```

This will create a number of interfaces from your schema file (using the `quicktype` library). For example, the below is the result of the sample JSON above.

`./src/myAppInterface.ts`
```typescript
export interface MyApp {
    appInfo: Cypress.ChainableLike<JQuery<HTMLElement>, AppInfo>;
}

export interface AppInfo {
    createNewUserSection: Cypress.ChainableLike<JQuery<HTMLElement>, CreateNewUserSection>;
    existingUsersTable:   Cypress.ChainableLike<JQuery<HTMLElement>, ExistingUsersTable>;
}

export interface CreateNewUserSection {
    nameInput:    Cypress.Chainable<JQuery<HTMLElement>>
    addressInput: Cypress.Chainable<JQuery<HTMLElement>>
    submitButton: Cypress.Chainable<JQuery<HTMLElement>>
}

export interface ExistingUsersTable {
    rows: Cypress.ChainableLike<JQuery<HTMLElement>, Rows>;
}

export interface Rows {
    row:  Cypress.ChainableLike<JQuery<HTMLElement>, Row>;
    with: With;
}

export interface Row {
    firstName: Cypress.Chainable<JQuery<HTMLElement>>
    lastName:  Cypress.Chainable<JQuery<HTMLElement>>
}

export interface With {
    firstName: (text: string) => Cypress.ChainableLike<JQuery<HTMLElement>, Row>;
    lastName:  (text: string) => Cypress.ChainableLike<JQuery<HTMLElement>, Row>;
}
```

You might notice this generated a `with` field that didn't exist in the schema. More on that under the Usage section.

Finally, you need to generate your navigation object:

`myApp.ts`
```js
import { generateNavigationObject } from 'cypress-selector-shorthand';

import type MyApp from './myAppInterface.ts';

const myApp = generateNavigationObject<MyApp>(schema);

export { myApp };
```

## Usage

`cy.tget(selector, options)` behaves the same way as `cy.get`, but it processes your selector string before passing it to `cy.get`.

For any tokens in `selector` that are not inside `()`/`{}`/`[]` and do not start with `@`, `#`, `.`, `>`, `:`, `[`, `(`, or `{`, the token is wrapped as `[data-test=${token}]`. If token is followed by a `:`, `>`, or `~`, those are left alone. So `token:visible` will become `[data-test=token]:visible`, etc.

If you are using the generated selector shorthands, you can chain Cypress commands off them. The shorthand chain is not evaluated until you chain a Cypress command off of it. So `myApp.appInfo.existingUsersSection` will not do anything, but `myApp.appInfo.existingUsersSection.refresh.click()` is equivalent to `cy.tget('my_app app_info existing_users_section refresh').click()`.

Note that the selector shorthand generation looks for any field named `'row'` with descendants, and generates a corresponding `with` property. So in the example, you can use `myApp.appInfo.existingUsersSection.rows.with.firstName('John')` and that will return all rows for people with the first name John. This is equivalent to `cy.tget('my_app app_info existing_users_section rows row:has([data-test=firstName]:contains(John))')`, except the tget won't actually fire until you chain further Cypress commands off of it.

The selector shorthands are also passed to `.within`. If you use `.within` on a regular Cypress command, it behaves exactly like normal, but if you chain `.within` on a generated navigation object, it yields the navigation object AND the previous subject:
```js
import { myApp } from './myApp.ts';

cy.tget('something')
    // Normal Cypress callback parameters
    .within((prevSubject) => {});

myApp.appInfo
    // Parameter order is different! First argument matches whatever shorthand the `.within` was chained off of,
    // whereas the second argument is generally going to be the corresponding element itself.
    .within((appInfo, prevSubject) => {});

myApp.appInfo
    // You can destructure and continue using shorthands:
    .within(({ createNewUserSection, existingUsersTable }) => {
        createNewUserSection
            .should('be.visible');
        existingUsersTable
            .scrollIntoView();
    });
```
