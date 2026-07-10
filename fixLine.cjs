const fs = require('fs');
let c = fs.readFileSync('src/i18n.ts', 'utf-8');

c = c.replace(/\\n/g, "\n");
fs.writeFileSync('src/i18n.ts', c);
