const fs = require('fs');
let lines = fs.readFileSync('src/i18n.ts', 'utf-8').split('\n');
lines[331] = lines[331] + ",";
fs.writeFileSync('src/i18n.ts', lines.join('\n'));
