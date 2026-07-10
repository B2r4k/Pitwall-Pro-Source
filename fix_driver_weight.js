import fs from 'fs';
let c = fs.readFileSync('src/App.tsx', 'utf-8');

const target = `<label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 flex items-center">Weight Penalty (s/L/Lap)</label>
                         <input type="number" step="0.005" value={(constants.driverWeight * 0.00045)} onChange={e => setConstants({...constants, driverWeight: Number(e.target.value)})} className="w-full p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 dark:border-slate-700 border-slate-200 dark:border-slate-700 rounded-lg" />`;

const replacement = `<label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 flex items-center">{t('Driver Weight (kg)')}</label>
                         <input type="number" step="1" value={constants.driverWeight} onChange={e => setConstants({...constants, driverWeight: Number(e.target.value)})} className="w-full p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 dark:border-slate-700 border-slate-200 dark:border-slate-700 rounded-lg" />
                         <p className="text-[10px] text-slate-400 mt-1">Calculated penalty per liter: {(constants.driverWeight * 0.00045).toFixed(3)}s/L</p>`;

c = c.replace(target, replacement);

fs.writeFileSync('src/App.tsx', c);
