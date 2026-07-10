const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf-8');
const lines = c.split('\n');
const res = [];
for (let i = 0; i < lines.length; i++) {
   const l = lines[i];
   if (/className=.*bg-white/.test(l) || /className=.*bg-slate-50/.test(l) || /className=.*bg-slate-100/.test(l) || /className=.*bg-slate-200/.test(l)) {
      if (!l.includes('dark:bg-') && !l.includes('bg-white/')) {
          if (!l.includes('bg-white rounded-full') && !l.includes('bg-white shadow-sm')) {
              // we don't care about the google logo or stuff we know is correct
              res.push((i+1) + ': ' + l.trim());
          }
      }
   }
}
fs.writeFileSync('missing-dark-bg.txt', res.join('\n'));
