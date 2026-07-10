const fs = require('fs');
let calib = fs.readFileSync('src/components/CalibrationView.tsx', 'utf-8');

const regex = /<div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">\n           <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">\n             <History className="w-6 h-6 text-indigo-500" \/> \{t\("Analytical Calibration Suite"\)\}\n           <\/h2>\n           <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-1 sm:mt-0">.*?<\/p>\n        <\/div>/;

const buttonAdding = `<div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <History className="w-6 h-6 text-indigo-500" /> {t("Analytical Calibration Suite")}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-1 sm:mt-0">{t("Enter past race data to precisely calibrate your car and driver stats.")}</p>
          </div>
          <div className="flex items-center gap-2">
             {syncStatus && <span className="text-xs font-medium text-emerald-500">{syncStatus}</span>}
             <button onClick={loadFromCloud} disabled={isSyncing} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5"><CloudCog className="w-3.5 h-3.5" /> Load</button>
             <button onClick={saveToCloud} disabled={isSyncing} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5"><Save className="w-3.5 h-3.5" /> Save</button>
          </div>
        </div>`;

if (calib.match(regex)) {
   calib = calib.replace(regex, buttonAdding);
} else {
   // Let's fallback
   calib = calib.replace(/<History className="w-6 h-6 text-indigo-500" \/> \{t\("Analytical Calibration Suite"\)\}\n           <\/h2>[\s\S]*?<\/div>/, `<History className="w-6 h-6 text-indigo-500" /> {t("Analytical Calibration Suite")}
           </h2>
           <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-1 sm:mt-0">{t("Enter past race data to precisely calibrate your car and driver stats. uygulamanın sizin araba ve pilotunuza göre hassas kalibrasyon yapmasını sağlayın.")}</p>
        </div>
        <div className="flex items-center gap-2 mb-6 -mt-2">
             {syncStatus && <span className="text-xs font-medium text-emerald-500">{syncStatus}</span>}
             <button onClick={loadFromCloud} disabled={isSyncing} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5"><CloudCog className="w-3.5 h-3.5" /> Load</button>
             <button onClick={saveToCloud} disabled={isSyncing} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5"><Save className="w-3.5 h-3.5" /> Save</button>
        </div>`);
}

fs.writeFileSync('src/components/CalibrationView.tsx', calib);
