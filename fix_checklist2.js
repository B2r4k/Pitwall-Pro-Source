import fs from 'fs';

let c = fs.readFileSync('src/components/ChecklistView.tsx', 'utf-8');

const regex = /<div \n\s*key=\{idx\} \n\s*onClick=\{\(\) => toggle\(idx\)\}\n\s*className=\{\`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all \$\{item\.done \? 'bg-emerald-50\/50 dark:bg-emerald-900\/10 border-emerald-200 dark:border-emerald-800\/50' : 'bg-slate-50 dark:bg-slate-800\/50 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500\/50'\}\`\}\n\s*>[\s\S]*?<\/div>/g;

const matchInfo = c.match(regex);
if(matchInfo) {
  const newUI = `<div 
            key={idx} 
            className={\`flex items-center gap-3 p-3 rounded-xl border transition-all \${item.done ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/50' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500/50'}\`}
          >
            <div 
               onClick={() => toggle(idx)} 
               className="p-1 -m-1 cursor-pointer hover:scale-110 transition-transform"
            >
               {item.done ? (
                 <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0" />
               ) : (
                 <Circle className="w-6 h-6 text-slate-300 dark:text-slate-600 flex-shrink-0 hover:text-indigo-400 transition-colors" />
               )}
            </div>
            <div 
               onClick={() => goToTab(item.tab || 'track_setup')}
               className={\`flex-1 ml-1 cursor-pointer text-sm font-medium transition-colors \${item.done ? 'text-slate-500 line-through dark:text-slate-400' : 'text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400'}\`}
            >
              {t(item.text)}
            </div>
          </div>`;
  c = c.replace(regex, newUI);
  fs.writeFileSync('src/components/ChecklistView.tsx', c);
  console.log("ChecklistView UI replaced!");
} else {
  console.log("Not found.");
}
