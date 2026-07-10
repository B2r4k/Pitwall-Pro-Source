import fs from 'fs';
let c = fs.readFileSync('src/App.tsx', 'utf-8');

c = c.replace(/<button onClick=\{resetPlayerSettings\} className="p-1\.5 hover:bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 dark:text-slate-400 transition flex items-center gap-1 text-\[10px\] font-bold uppercase tracking-widest"><Tooltip content="Reset values to default\."\/><\/button>\n                    <\/div>\n                    <div className="space-y-4">/, `<button onClick={resetPlayerSettings} className="p-1.5 hover:bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 dark:text-slate-400 transition flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest"><Tooltip content="Reset values to default."/></button>\n                      </div>\n                    </div>\n                    <div className="space-y-4">`);

fs.writeFileSync('src/App.tsx', c);
