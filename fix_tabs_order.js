import fs from 'fs';
let c = fs.readFileSync('src/App.tsx', 'utf-8');

const t2 = `<button 
                  className={\`py-2 px-4 mx-0.5 max-lg:data-[landscape=true]:mx-0 font-bold text-sm rounded-xl transition-all whitespace-nowrap relative max-lg:data-[landscape=true]:w-full text-left flex items-center \${activeTab === 'track_setup' ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-600' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 hover:bg-slate-200/50'}\`}
                  onClick={() => setActiveTab('track_setup')}
                >
                  <span className="flex items-center gap-2"><Map className="w-4 h-4" /> {t('Track Setup & Car')}</span>
                </button>`;

const t3 = `<button 
                  className={\`py-2 px-4 mx-0.5 max-lg:data-[landscape=true]:mx-0 font-bold text-sm rounded-xl transition-all whitespace-nowrap relative max-lg:data-[landscape=true]:w-full text-left flex items-center \${activeTab === 'strategy' ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-600' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 hover:bg-slate-200/50'}\`}
                  onClick={() => setActiveTab('strategy')}
                >
                  <span className="flex items-center gap-2"><Goal className="w-4 h-4" /> {t('Strategy Engine')}</span>
                </button>`;

if (c.includes(t2) && c.includes(t3)) {
    c = c.replace(t2, "T2_PLACEHOLDER");
    c = c.replace(t3, t2);
    c = c.replace("T2_PLACEHOLDER", t3);
    fs.writeFileSync('src/App.tsx', c);
    console.log("Reordered navigation tabs.");
} else {
    // If exact string match failed, do a regex-based swap.
    const re2 = /<button[\s\S]*?onClick=\{\(\) => setActiveTab\('track_setup'\)\}[\s\S]*?<\/button>/;
    const re3 = /<button[\s\S]*?onClick=\{\(\) => setActiveTab\('strategy'\)\}[\s\S]*?<\/button>/;
    const m2 = c.match(re2);
    const m3 = c.match(re3);
    if(m2 && m3) {
       c = c.replace(re2, "T2_PLACEHOLDER");
       c = c.replace(re3, m2[0]);
       c = c.replace("T2_PLACEHOLDER", m3[0]);
       fs.writeFileSync('src/App.tsx', c);
       console.log("Reordered navigation tabs with regex.");
    } else {
       console.log("Could not find the exact tabs to reorder.");
    }
}
