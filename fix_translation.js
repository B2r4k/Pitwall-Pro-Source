import fs from 'fs';

let c = fs.readFileSync('src/App.tsx', 'utf-8');

c = c.replace(/>Uygulama Settingsı<\/h3>/g, ">{t('Settings')}</h3>");

fs.writeFileSync('src/App.tsx', c);
