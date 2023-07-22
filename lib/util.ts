function snakeCaseToCamelCase(data: string) {
    return data.replace(/(_\w)/g, (underscoreAndLetter) => underscoreAndLetter[1].toUpperCase());
}

function camelCaseToSnakeCase(data: string) {
    return data.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export { camelCaseToSnakeCase, snakeCaseToCamelCase };
