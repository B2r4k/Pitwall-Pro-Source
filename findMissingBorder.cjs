const fs = require('fs');

let c = fs.readFileSync('src/App.tsx', 'utf-8');
const lines = c.split('\n');
const res = [];
for (let i = 0; i < lines.length; i++) {
   const l = lines[i];
   if (/className=.*(?<!dark:|hover:)border-slate-(700|800|900)/.test(l)) {
      if (!l.includes('dark:border-') && !l.includes('bg-slate-900') && !l.includes('bg-slate-800')) {
          res.push((i+1) + ': ' + l.trim());
      }
   }
}
fs.writeFileSync('missing-dark-border.txt', res.join('\n'));
