
const fs = require('fs');
const schema = JSON.parse(fs.readFileSync('schema.json', 'utf8'));

const tableName = 'interaction_logs';
const table = schema.definitions[tableName];
let output = '';

if (table) {
    output += `Table: ${tableName}\n`;
    output += `Columns found: ${Object.keys(table.properties).length}\n`;
    for (const [colName, colDef] of Object.entries(table.properties)) {
        let typeInfo = colDef.type;
        if (colDef.format) typeInfo += ` (${colDef.format})`;
        if (colDef.maxLength) typeInfo += ` [maxlen: ${colDef.maxLength}]`;
        output += `  - ${colName}: ${typeInfo}\n`;
    }
} else {
    output += `Table ${tableName} not found in schema.\n`;
}

fs.writeFileSync('schema_results.txt', output);
console.log('Results written to schema_results.txt');
