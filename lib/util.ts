import { withinAnyBracketsRegex } from './constants';

// eslint-disable-next-line @typescript-eslint/naming-convention
type GeneratedNavigation = object & { ___prefix: string };

function getCypressSelectorShorthandState() {
    const aliases = cy.state('aliases');
    return {
        generatedNavigationWithin: aliases?.['cypressSelectorShorthand.#generatedNavigationWithin']?.subjectChain[0] as string[] ?? [],
        generatedNavigationWithinSubject: aliases?.['cypressSelectorShorthand.#generatedNavigationWithin']?.subjectChain[0] as JQuery<HTMLElement> | undefined,
    };
}

function splitSelectorByWithinState(generatedNavigationWithin: string[], selector: string): string {
    return selector.replace(new RegExp(`^(${
        generatedNavigationWithin.join(' ')
            // this escapes special characters that would interfere with the RegEx
            .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    } ?)`), '');
}

function calculateTgetSelector(selector: string): string {
    // This regex matches spaces, excluding space inside (), {}, or []
    const selectorTokens = selector.match(withinAnyBracketsRegex) ?? [];
    const modifiedTokens = selectorTokens.map(token => {
        // only modify tokens that don't start with @, #, ., >, :, [, (, or {
        return (/^[@#.>:[({]/.test(token))
            ? token
            // use negative lookbehind to avoid replacing anything following a :, >, or ~
            // e.g. control:visible will be replaced with [data-test=control]:visible
            : token.replaceAll(/(?<![:>~].*)([^:>~]+)/g, '[data-test=\'$1\']');
    });
    return modifiedTokens.join(' ');
}

export { calculateTgetSelector, getCypressSelectorShorthandState, splitSelectorByWithinState };
export type { GeneratedNavigation };