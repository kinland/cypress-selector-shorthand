const noLog: Cypress.Loggable = { log: false };

const withinAnyBracketsRegex = /\s+(?![^[]*\]|[^(]*\)|[^{]*})/;

export { noLog, withinAnyBracketsRegex };
