function calculateTgetSelector(selector: string): string {
    // This regex matches spaces, excluding space inside (), {}, or []
    // See https://stackoverflow.com/a/18861480/3534080
    const selectorTokens = selector.split(/\s+(?![^[]*\]|[^(]*\)|[^{]*})/);
    const modifiedTokens = selectorTokens.map(token => {
        // only modify tokens that don't start with @, #, ., >, :, [, (, or {
        return (/^[@#.>:[({]/.test(token))
            ? token
            // use negative lookbehind to avoid replacing anything following a :, >, or ~
            // e.g. control:visible will be replaced with [data-test=control]:visible
            : token.replaceAll(/(?<![:>~].*)([^:>~]+)/g, '[data-test=$1]');
    });
    return modifiedTokens.join(' ');
}

Cypress.Commands.add('tget', (selector, options) => cy.get(calculateTgetSelector(selector), options));
