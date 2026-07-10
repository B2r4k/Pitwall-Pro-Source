const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf-8');

c = c.replace(/<select className="[^"]+" value=\{settings\.language\}\s+onChange=\{e => setLocalSettings\(\{\.\.\.settings, language: e\.target\.value, autoTranslate: false\}\)\}\s+className="[^"]+"/g, '<select value={settings.language} onChange={e => setLocalSettings({...settings, language: e.target.value, autoTranslate: false})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl p-2.5 text-sm transition-all focus:ring-2 focus:ring-indigo-500/50 outline-none"');

c = c.replace(/<select className="[^"]+" value=\{customTrack\.wearSeverity\} onChange=\{e => setCustomTrack\(\{\.\.\.customTrack, wearSeverity: e\.target\.value as any\}\)\} className="[^"]+"/g, '<select value={customTrack.wearSeverity} onChange={e => setCustomTrack({...customTrack, wearSeverity: e.target.value as any})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl p-2.5 text-sm transition-all focus:ring-2 focus:ring-indigo-500/50 outline-none"');

c = c.replace(/<select className="[^"]+" value=\{customTrack\.fuelSeverity\} onChange=\{e => setCustomTrack\(\{\.\.\.customTrack, fuelSeverity: e\.target\.value as any\}\)\} className="[^"]+"/g, '<select value={customTrack.fuelSeverity} onChange={e => setCustomTrack({...customTrack, fuelSeverity: e.target.value as any})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl p-2.5 text-sm transition-all focus:ring-2 focus:ring-indigo-500/50 outline-none"');

c = c.replace(/<select className="[^"]+" value=\{player\.tyreSupplier\} onChange=\{e => setPlayer\(\{\.\.\.player, tyreSupplier: e\.target\.value\}\)\} className="[^"]+"/g, '<select value={player.tyreSupplier} onChange={e => setPlayer({...player, tyreSupplier: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl p-2.5 text-sm transition-all focus:ring-2 focus:ring-indigo-500/50 outline-none"');

c = c.replace(/<select className="[^"]+" value=\{player\.league \|\| 'Rookie'\} onChange=\{e => setPlayer\(\{\.\.\.player, league: e\.target\.value as any\}\)\} className="[^"]+"/g, '<select value={player.league || "Rookie"} onChange={e => setPlayer({...player, league: e.target.value as any})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl p-2.5 text-sm transition-all focus:ring-2 focus:ring-indigo-500/50 outline-none"');

c = c.replace(/<select className="[^"]+" value=\{feedbackRating\} onChange=\{e => setFeedbackRating\(Number\(e\.target\.value\)\)\} className="[^"]+"/g, '<select value={feedbackRating} onChange={e => setFeedbackRating(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl p-2.5 text-sm transition-all focus:ring-2 focus:ring-indigo-500/50 outline-none"');

fs.writeFileSync('src/App.tsx', c);
