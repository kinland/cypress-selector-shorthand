const noLog: Cypress.Loggable = { log: false };

const withinParenthesesRegex =    /[^(\s]+(\(.*?\)+)?/;
const withinSquareBracketsRegex = /[^[\s]+(\[.*?\]+)?/;
const withinCurlyBracketsRegex =  /[^{\s]+(\{.*?\}+)?/;
const withinAnyBracketsRegex = new RegExp(`${withinParenthesesRegex.source}|${withinSquareBracketsRegex.source}|${withinCurlyBracketsRegex.source}`, 'g');

export {
    noLog,
    withinAnyBracketsRegex,
    withinCurlyBracketsRegex,
    withinParenthesesRegex,
    withinSquareBracketsRegex,
};
