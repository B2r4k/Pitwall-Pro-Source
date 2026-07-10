import fs from 'fs';
let c = fs.readFileSync('src/App.tsx', 'utf-8');
c = c.replace(/`\\\$\{t\('Account'\)\} \& Sync`/g, "`\${t('Account')} & Sync`");
fs.writeFileSync('src/App.tsx', c);
