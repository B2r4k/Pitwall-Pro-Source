import fs from 'fs';
let c = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace the auto Translate block with a Language select block.
const autoTranslateLoc = `<label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 transition">
                              <div>
                                 <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">Auto Translate (Google) <Tooltip content="Display in other languages" /></div>
                                 <div className="text-xs text-slate-500 dark:text-slate-400">{t('Enable automatic local translation based on your browser language.')}</div>
                              </div>
                              <input 
                                 type="checkbox" 
                                 className="w-5 h-5 accent-indigo-600 cursor-pointer" 
                                 checked={settings.autoTranslate}
                                 onChange={e => setLocalSettings({...settings, language: e.target.checked})} 
                              />
                           </label>`;

const newDropdown = `<div className="flex flex-col p-4 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 border-slate-200 dark:border-slate-700 rounded-xl transition">
                              <div className="mb-2">
                                 <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">{t('Language')} / Dil </div>
                                 <div className="text-xs text-slate-500 dark:text-slate-400">{t('Select your preferred language')}</div>
                              </div>
                              <select 
                                 value={settings.language}
                                 onChange={e => setLocalSettings({...settings, language: e.target.value})} 
                                 className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                              >
                                 <option value="en">English</option>
                                 <option value="tr">Türkçe</option>
                              </select>
                           </div>`;

c = c.replace(autoTranslateLoc, newDropdown);

fs.writeFileSync('src/App.tsx', c);
