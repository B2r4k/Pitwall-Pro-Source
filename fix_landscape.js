import fs from 'fs';
let c = fs.readFileSync('src/App.tsx', 'utf-8');
c = c.replace(/max-lg:landscape:/g, 'max-lg:data-\\[landscape=true\\]:');
fs.writeFileSync('src/App.tsx', c);
