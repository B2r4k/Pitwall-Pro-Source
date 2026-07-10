const fs = require('fs');

let c = fs.readFileSync('src/components/RivalAnalysisTab.tsx', 'utf-8');

c = c.replace('if (recs.length === 0) recs.push(t("Standard strategy. Just focus on your own optimal pace."));', 
`if (recs.length === 0) recs.push(t("Standard strategy. Just focus on your own optimal pace."));
    if (o.pitStops === '4+') recs.push(t("Extreme multi-stop strategy detected. They will be very fast but spend a lot of time in pits. Focus on consistency."));`);

c = c.replace('className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2"',
'className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 flex items-center gap-2 tracking-tight"');

c = c.replace('<ShieldAlert className="w-5 h-5 text-purple-600" />\n                       <h3 className="font-bold text-purple-900 dark:text-purple-300">{t(\'Strategic Recommendation\')}</h3>',
`<Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                       <h3 className="font-bold text-purple-900 dark:text-purple-300 flex items-center gap-2">{t('AI Strategic Analysis')} <span className="bg-purple-600 text-white text-[9px] px-2 py-0.5 rounded uppercase tracking-widest shadow-sm">AI Active</span></h3>`);

c = c.replace('className="text-sm text-purple-800/80 dark:text-purple-300/80 leading-relaxed list-disc pl-5 space-y-1"',
'className="text-sm text-purple-900 dark:text-purple-200 leading-relaxed list-disc pl-5 space-y-2 font-medium"');

fs.writeFileSync('src/components/RivalAnalysisTab.tsx', c);
