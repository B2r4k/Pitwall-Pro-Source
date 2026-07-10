import fs from 'fs';
let c = fs.readFileSync('src/App.tsx', 'utf-8');
console.log(c.substring(c.indexOf('const loadFromCloudData'), c.indexOf('const resetPlayerSettings') + 100));
