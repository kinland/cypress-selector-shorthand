import { noLog } from './constants';

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

Cypress.Commands.overwrite('within', function within(
    originalWithinFn,
    ...args
) {
    const aliases = cy.state('aliases');
    const [withinSelector, navigationShorthand] =
        ['____generatedNavigationWithin', '____generatedNavigation'].map(alias => aliases?.[alias]?.subjectChain[0]) as [string | undefined, object | undefined];

    const fnIndex = args[1] instanceof Function ? 1 : 2;

    // @ts-expect-error Typings are incorrect due to overrides
    const originalCallback = args[fnIndex] as typeof args[1];

    if ((withinSelector?.length ?? 0) > 0) {
        // @ts-expect-error Typings are incorrect due to overrides
        args[fnIndex] = <Subject>(subject: Subject) => originalCallback(navigationShorthand, subject);
    }

    return cy.wrap(originalWithinFn(...args), noLog)
        .then(() => {
            // eslint-disable-next-line no-underscore-dangle
            delete aliases?.____generatedNavigationWithin;
        });
});
