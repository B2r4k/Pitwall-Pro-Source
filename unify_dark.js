import fs from 'fs';
let c = fs.readFileSync('src/App.tsx', 'utf-8');

c = c.replace(/dark:bg-slate-800\/50/g, 'dark:bg-slate-900');
c = c.replace(/dark:bg-slate-800/g, 'dark:bg-slate-900');

// Fix contrast issues created by changing bg-slate-800 to bg-slate-900
// For buttons: hover:bg-slate-800 -> hover:bg-slate-800 is actually fine because bg-slate-900 goes to bg-slate-800 on hover.
c = c.replace(/dark:bg-slate-900\/80/g, 'dark:bg-slate-800');

fs.writeFileSync('src/App.tsx', c);
