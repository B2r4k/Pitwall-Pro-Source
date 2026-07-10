import React, { useState } from 'react';
import { HelpCircle, ArrowLeft, Camera, Database, CheckSquare, XCircle, MonitorSmartphone } from 'lucide-react';
import Tooltip from './Tooltip';
import { AnimatePresence, motion } from 'framer-motion';

interface DataIntegrationsPanelProps {
  settings: any;
  setLocalSettings: (settings: any) => void;
  t: (key: string) => string;
  // API Fetch Props
  fetchGproApi: (isAuto?: boolean) => void;
  isSyncing: boolean;
  apiPreview: any;
  setApiPreview: (val: any) => void;
  applyApiData: () => void;
  // OCR Props
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isOCRProcessing: boolean;
  ocrStatus: string;
  ocrPreview: any;
  applyOcrData: () => void;
  setOcrPreview: (val: any) => void;
}

export function DataIntegrationsPanel({
  settings, setLocalSettings, t,
  fetchGproApi, isSyncing, apiPreview, setApiPreview, applyApiData,
  fileInputRef, handleFileChange, isOCRProcessing, ocrStatus, ocrPreview, applyOcrData, setOcrPreview
}: DataIntegrationsPanelProps) {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="col-span-2 md:col-span-3 mt-4 space-y-6">
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
         <Database className="w-5 h-5 text-indigo-500" /> {t('Data Imports & Integrations')}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LEFT: API INTEG */}
          <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30 rounded-xl relative overflow-hidden transition-all duration-300">
              <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between">
                   <label className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-2 text-sm">
                      {t('Official API Token (JWT)')} <span className="text-[10px] font-bold opacity-80 border border-indigo-200 dark:border-indigo-700 bg-indigo-100 dark:bg-indigo-900/40 px-1.5 py-0.5 rounded uppercase">{t('Direct Sync')}</span>
                   </label>
                   <button onClick={() => setShowHelp(!showHelp)} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 transition p-1 hover:bg-white dark:hover:bg-slate-800 rounded-full">
                      <HelpCircle className="w-4 h-4" />
                   </button>
                </div>
                
                {showHelp && (
                  <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-indigo-200 dark:border-indigo-700 text-xs text-slate-700 dark:text-slate-300 space-y-2 relative shadow-sm">
                      <ol className="list-decimal ml-4 space-y-1">
                          <li>{t("Login to GPRO.")}</li>
                          <li>{t("Go to Account > API Access.")}</li>
                          <li>{t("Click 'Generate Token' if none exists.")}</li>
                          <li>{t("Copy the long string and paste it below.")}</li>
                      </ol>
                  </div>
                )}

                <div className="mb-2 bg-white dark:bg-slate-800 p-2 rounded-lg border border-indigo-100 dark:border-indigo-800 shadow-sm">
                    <div className="text-[10px] font-bold text-indigo-800 dark:text-indigo-400 uppercase tracking-wider mb-2 border-b dark:border-slate-700 border-indigo-50 pb-1 flex justify-between">
                        <span>API Modules (Limit: 65/day)</span>
                        <Tooltip content="Select which endpoints to fetch. Each selected module consumes 1 request limit." />
                    </div>
                    <div className="grid grid-cols-2 gap-y-2 gap-x-1 text-xs">
                       {[
                         { id: 'driver', label: 'Driver Stats' },
                         { id: 'practice', label: 'Practice/Q' },
                         { id: 'office', label: 'Office/Pits' },
                         { id: 'carUpdate', label: 'Car Levels' },
                         { id: 'staff', label: 'Staff/Fac' },
                         { id: 'setup', label: 'Race Setup' },
                         { id: 'trackProfile', label: 'Track Profile' },
                         { id: 'testing', label: 'Testing Data' }
                       ].map(mod => (
                          <label key={mod.id} className="flex items-center gap-1.5 cursor-pointer select-none">
                             <input 
                                type="checkbox" 
                                checked={settings.apiModules ? settings.apiModules[mod.id] !== false : true}
                                onChange={e => {
                                   const newMods = { ...(settings.apiModules || { driver:true, practice:true, office:true, carUpdate:true, staff:true, setup:true, trackProfile:true, testing:true }) };
                                   newMods[mod.id] = e.target.checked;
                                   setLocalSettings({...settings, apiModules: newMods});
                                }}
                                className="w-3.5 h-3.5 accent-indigo-600 rounded-sm"
                             />
                             <span className="text-slate-700 dark:text-slate-300 truncate">{mod.label}</span>
                          </label>
                       ))}
                    </div>
                </div>
                <div className="flex gap-2">
                  <input 
                     type="password" 
                     name="gproToken"
                     autoComplete="current-password"
                     className="w-full p-2 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 text-slate-800 dark:text-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-xs placeholder:text-slate-400 font-mono" 
                     value={settings.gproToken} 
                     onChange={e => setLocalSettings({...settings, gproToken: e.target.value})} 
                     onClick={() => {
                         if (settings.gproToken) {
                             setLocalSettings({...settings, gproToken: ''});
                         }
                     }}
                     placeholder="e.g. eyJ0eXAiOiJKV1Qi..." 
                  />
                  <button 
                      onClick={() => fetchGproApi(false)}
                      disabled={isSyncing || !settings.gproToken}
                      className="whitespace-nowrap bg-indigo-600 dark:bg-indigo-500 text-white text-xs px-3 rounded-lg font-bold shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition flex items-center justify-center gap-1"
                  >
                      <MonitorSmartphone className="w-3.5 h-3.5" /> {isSyncing ? t('Syncing...') : t('Fetch')}
                  </button>
                </div>
                
                {/* Auto Sync & Filters Area */}
                <div className="mt-3 p-3 bg-white dark:bg-slate-800/50 rounded-lg border border-indigo-100 dark:border-indigo-800/40">
                    <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-700/50 pb-2">
                        <div>
                            <div className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                                {t('Auto-Calibration')} <Tooltip content={t('Fetches updated data automatically when you open the app.')} />
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={settings.autoApiSync} onChange={e => setLocalSettings({...settings, autoApiSync: e.target.checked})} />
                            <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>

                    <div className="space-y-2">
                       <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('Data Filters')}</div>
                       <div className="grid grid-cols-3 gap-2">
                          {(['driver', 'car', 'track', 'weather', 'risks'] as const).map(f => (
                             <label key={f} className={"flex items-center justify-center gap-1.5 p-1.5 border rounded cursor-pointer transition text-[10px] font-bold uppercase " + (settings.apiSyncOptions?.[f] !== false ? "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800/50" : "bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700")}>
                               <input type="checkbox" className="sr-only" checked={settings.apiSyncOptions?.[f] !== false} onChange={e => setLocalSettings({...settings, apiSyncOptions: {...(settings.apiSyncOptions||{}), [f]: e.target.checked}})} />
                               {t(f)}
                             </label>
                          ))}
                       </div>
                       <label className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/50 cursor-pointer group">
                           <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 transition">{t('Ignore filters on Auto Sync')} <Tooltip content={t('When auto-sync runs, it will fetch and apply everything.')} /></span>
                           <input type="checkbox" className="w-3.5 h-3.5 accent-indigo-600" checked={settings.apiSyncOptions?.ignoreFiltersAuto !== false} onChange={e => setLocalSettings({...settings, apiSyncOptions: {...(settings.apiSyncOptions||{}), ignoreFiltersAuto: e.target.checked}})} />
                       </label>
                    </div>
                </div>

                {apiPreview && (
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border dark:border-indigo-800/30 border-indigo-200 shadow-sm animate-in zoom-in-95 mt-2">
                      <div className="text-[10px] font-black tracking-wider text-indigo-500 uppercase mb-2 border-b pb-1 dark:border-slate-700">{t('Review & Confirm')}</div>
                      
                      {apiPreview.message && <div className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 p-2 rounded mb-3">{apiPreview.message}</div>}

                      <div className="flex flex-wrap gap-1.5 mb-3">
                          {apiPreview.driver && <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded text-[10px] font-bold border border-blue-200 dark:border-blue-800">Driver ✓</span>}
                          {apiPreview.car && <span className="px-1.5 py-0.5 bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 rounded text-[10px] font-bold border border-orange-200 dark:border-orange-800">Car ✓</span>}
                          {apiPreview.track && <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 rounded text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">Track ✓</span>}
                          {apiPreview.weather && <span className="px-1.5 py-0.5 bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 rounded text-[10px] font-bold border border-cyan-200 dark:border-cyan-800">Weather ✓</span>}
                          {apiPreview.risks && <span className="px-1.5 py-0.5 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded text-[10px] font-bold border border-red-200 dark:border-red-800">Risks ✓</span>}
                          {apiPreview.staff && <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 rounded text-[10px] font-bold border border-purple-200 dark:border-purple-800">Staff ✓</span>}
                          {apiPreview.manager && <span className="px-1.5 py-0.5 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 rounded text-[10px] font-bold border border-yellow-200 dark:border-yellow-800">Manager & Economy ✓</span>}
                      </div>

                      <div className="flex gap-2">
                         <button onClick={() => { applyApiData(); }} className="flex-1 py-1.5 bg-emerald-500 text-white rounded text-xs font-bold hover:bg-emerald-600 transition flex items-center justify-center gap-1"><CheckSquare className="w-3.5 h-3.5" /> {t('Confirm')}</button>
                         <button onClick={() => { setApiPreview(null); }} className="py-1.5 px-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs font-bold hover:bg-slate-300 transition flex items-center justify-center gap-1"><XCircle className="w-3.5 h-3.5" /> {t('Close')}</button>
                      </div>
                  </div>
                )}
              </div>
          </div>

          {/* RIGHT: OCR INTEG */}
          <div className="p-5 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 rounded-xl relative overflow-hidden transition-all duration-300">
             <div className="flex items-center gap-2 mb-2">
                <label className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-2 text-sm">
                   {t('Smart Screenshot Reader')} <span className="text-[10px] font-bold opacity-80 border border-emerald-200 dark:border-emerald-700 bg-emerald-100 dark:bg-emerald-900/40 px-1.5 py-0.5 rounded uppercase text-emerald-700 dark:text-emerald-300">{t('Prototype')}</span>
                </label>
             </div>
             
             <div className="flex flex-col gap-2 items-start mt-4">
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  onClick={(e) => { (e.target as HTMLInputElement).value = '' }}
                  onChange={handleFileChange} 
                  className="hidden" 
                />
                
                <button 
                  onClick={() => {
                    if(fileInputRef.current) {
                       fileInputRef.current.accept = "image/*";
                       fileInputRef.current.click();
                    }
                  }}
                  disabled={isOCRProcessing}
                  className="w-full bg-emerald-600 dark:bg-emerald-500 text-white text-xs px-4 py-2 rounded font-bold shadow-sm hover:bg-emerald-700 dark:hover:bg-emerald-600 transition disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  <Camera className="w-4 h-4" /> {isOCRProcessing ? t('Scanning, please wait...') : t('Select & Read Screenshot')}
                </button>
                
                <AnimatePresence>
                  {ocrStatus && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -5, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className={`text-[10px] mt-1 font-medium ${ocrStatus.toLowerCase().includes('error') || ocrStatus.toLowerCase().includes('not found') ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400 bg-emerald-100/50 dark:bg-emerald-900/30 px-2 py-0.5 rounded border dark:border-emerald-800/30 border-emerald-100 w-full text-center'}`}>
                      {ocrStatus}
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>

             {ocrPreview && (
                <div className="mt-4 p-3 bg-white dark:bg-slate-800 rounded-lg border dark:border-emerald-800/30 border-emerald-200 shadow-sm animate-in fade-in slide-in-from-top-2">
                  <h4 className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2 border-b dark:border-slate-700 border-emerald-50 pb-1">{t('Detected Data')}</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs mb-3">
                     {ocrPreview.tempBase !== undefined && <div className="flex justify-between items-center"><span className="text-slate-500 dark:text-slate-400">Min Temp:</span> <strong className="text-slate-800 dark:text-slate-200">{ocrPreview.tempBase}°C</strong></div>}
                     {ocrPreview.tempMax !== undefined && <div className="flex justify-between items-center"><span className="text-slate-500 dark:text-slate-400">Max Temp:</span> <strong className="text-slate-800 dark:text-slate-200">{ocrPreview.tempMax}°C</strong></div>}
                     {ocrPreview.driverFocus !== undefined && <div className="flex justify-between items-center"><span className="text-slate-500 dark:text-slate-400">Focus:</span> <strong className="text-slate-800 dark:text-slate-200">{ocrPreview.driverFocus}</strong></div>}
                     {ocrPreview.driverStamina !== undefined && <div className="flex justify-between items-center"><span className="text-slate-500 dark:text-slate-400">Stamina:</span> <strong className="text-slate-800 dark:text-slate-200">{ocrPreview.driverStamina}</strong></div>}
                     {ocrPreview.driverExperience !== undefined && <div className="flex justify-between items-center"><span className="text-slate-500 dark:text-slate-400">Experience:</span> <strong className="text-slate-800 dark:text-slate-200">{ocrPreview.driverExperience}</strong></div>}
                     {ocrPreview.riskAggression !== undefined && <div className="flex justify-between items-center"><span className="text-slate-500 dark:text-slate-400">Agresiflik:</span> <strong className="text-slate-800 dark:text-slate-200">{ocrPreview.riskAggression}</strong></div>}
                     {ocrPreview.driverWeight !== undefined && <div className="flex justify-between items-center"><span className="text-slate-500 dark:text-slate-400">Weight:</span> <strong className="text-slate-800 dark:text-slate-200">{ocrPreview.driverWeight} kg</strong></div>}
                  </div>
                  
                  {ocrPreview.rainProps && (
                    <div className="mb-3 bg-slate-50 dark:bg-slate-900 rounded p-1.5 text-[10px] border dark:border-slate-700 border-slate-100">
                       <div className="font-semibold text-slate-600 dark:text-slate-400 mb-0.5">{t("Detected Rain Probabilities (%)")}</div>
                       <div className="flex justify-between text-slate-800 dark:text-slate-200 font-mono">
                          <span>Q1:{ocrPreview.rainProps.q1}</span>
                          <span>Q2:{ocrPreview.rainProps.q2}</span>
                          ...
                       </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                     <button onClick={applyOcrData} className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-xs font-bold transition flex items-center justify-center gap-1"><CheckSquare className="w-3.5 h-3.5" /> {t("Confirm & Process")}</button>
                     <button onClick={() => setOcrPreview(null)} className="py-1.5 px-3 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded text-xs font-bold transition flex items-center justify-center"><XCircle className="w-3.5 h-3.5" /> {t("Cancel")}</button>
                  </div>
                </div>
             )}
          </div>
      </div>
    </div>
  );
}
