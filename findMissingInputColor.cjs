const fs = require('fs');

let c = fs.readFileSync('src/App.tsx', 'utf-8');
const lines = c.split('\n');
const res = [];
for (let i = 0; i < lines.length; i++) {
   const l = lines[i];
   if (/<(input|textarea|select)/.test(l)) {
      if (!l.includes('text-white') && !l.includes('text-slate-') && !l.includes('text-indigo-') && !l.includes('text-center') && !l.includes('text-right')) {
          // just looking for text color classes on inputs
          if (!l.includes('dark:text-')) {
             res.push((i+1) + ': ' + l.trim());
          }
      }
   }
}
fs.writeFileSync('missing-input-text-color.txt', res.join('\n'));
