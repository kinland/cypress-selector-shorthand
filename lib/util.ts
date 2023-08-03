import { withinAnyBracketsRegex } from './constants';

function snakeCaseToCamelCase(data: string) {
    return data.replace(/(_\w)/g, (underscoreAndLetter) => underscoreAndLetter[1].toUpperCase());
}

function camelCaseToSnakeCase(data: string) {
    return data.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
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
            : token.replaceAll(/(?<![:>~].*)([^:>~]+)/g, '[data-test=$1]');
    });
    return modifiedTokens.join(' ');
}

export { calculateTgetSelector, camelCaseToSnakeCase, snakeCaseToCamelCase };
