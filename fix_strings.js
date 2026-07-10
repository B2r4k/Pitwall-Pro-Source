import fs from 'fs';

let c = fs.readFileSync('src/data.ts', 'utf-8');
c = c.replace(/Barselona \(İspanya\)/g, "Barcelona (Spain)");
// Are there any other Turkish entries in data.ts?
// Let's replace 'ı' 'ş' 'ğ' 'ü' 'ö' 'ç' inside `data.ts` ? Wait, there's `Contimental` that was translated to balanced.
fs.writeFileSync('src/data.ts', c);

let cApp = fs.readFileSync('src/App.tsx', 'utf-8');
cApp = cApp.replace(/>Strateji Uzmanı</g, ">{t('Strategy Wizard')}<");
// Also verify tab translation for dashboard:
// I added `{t('Dashboard Overview')}` earlier.
cApp = cApp.replace(/BugFix/g, ""); // Just to check

// User also requested: "uygun ise prototip bir feedback kısmı bile ekle ayarlar sekmesine"
// "Add a feedback section to settings"
const feedbackSection = `
                        <div className="mt-8">
                           <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> {t('Feedback & Support')}</h3>
                           <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80">
                              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{t('Experiencing issues or have a feature request? Let us know to help improve the prototype.')}</p>
                              <button onClick={() => alert('Feedback submitted! Thank you for helping us improve.')} className="font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition shadow-sm w-full sm:w-auto">{t('Send Feedback')}</button>
                           </div>
                        </div>`;

cApp = cApp.replace(/<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*<\/main>\n\s*<\/div>[\s\S]*?\/\/ ACCOUNT TAB/, feedbackSection + "$&");

fs.writeFileSync('src/App.tsx', cApp);
