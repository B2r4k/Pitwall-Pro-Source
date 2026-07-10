const fs = require('fs');

let c = fs.readFileSync('src/App.tsx', 'utf-8');
const lines = c.split('\n');
const res = [];
for (let i = 0; i < lines.length; i++) {
   const l = lines[i];
   if (/className=.*(?<!dark:|hover:)text-slate-(800|900)/.test(l)) {
      if (!l.includes('bg-slate-800') && !l.includes('bg-slate-900') && !l.includes('bg-indigo-600') && !l.includes('bg-gradient')) {
          if (!l.includes('dark:text-') && !l.includes('bg-[#0f172a]')) {
              res.push((i+1) + ': ' + l.trim());
          }
      }
   }
}
fs.writeFileSync('missing-text-color.txt', res.join('\n'));
