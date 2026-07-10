import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, Save, RotateCcw, Send, Loader2 } from 'lucide-react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User as FirebaseUser } from 'firebase/auth';
import { t } from '../i18n';

interface ChecklistViewProps {
  currentUser: FirebaseUser | null;
  goToTab: (tab: string) => void;
  appState?: any;
}

export default function ChecklistView({ currentUser, goToTab, appState }: ChecklistViewProps) {
  const [items, setItems] = useState([
    { text: "Check weather forecast for Q and R", done: false, tab: 'track_setup' },
    { text: "Adjust car setup for current temperature", done: false, tab: 'driver_profile' },
    { text: "Set driver risk/aggression", done: false, tab: 'driver_profile' },
    { text: "Calculate and set starting fuel", done: false, tab: 'strategy' },
    { text: "Choose starting tyre compound", done: false, tab: 'strategy' },
    { text: "Confirm pit strategy (stints/laps)", done: false, tab: 'strategy' },
    { text: "Check and configure secondary strategy for rain", done: false, tab: 'strategy' },
    { text: "Verify part wear and replace if necessary", done: false, tab: 'driver_profile' },
    { text: "Double check test lap data", done: false, tab: 'calibration' }
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveUI, setSaveUI] = useState('Save');
  
  const [chatMessage, setChatMessage] = useState('');
  const [chatLog, setChatLog] = useState<{sender: 'user'|'ai', text: string}[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      load();
    }
  }, [currentUser]);

  const load = async () => {
    if (!currentUser) return;
    try {
      const d = await getDoc(doc(db, 'checklists', currentUser.uid));
      if (d.exists() && d.data().items) {
        setItems(d.data().items);
      }
    } catch (e) {
      console.error("Checklist load err", e);
    }
  };

  const save = async () => {
    if (!currentUser) return alert(t('Please log in'));
    try {
      setIsSaving(true);
      await setDoc(doc(db, 'checklists', currentUser.uid), {
        items
      }, { merge: true });
      setSaveUI('Saved!');
      setTimeout(() => setSaveUI('Save'), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const toggle = (idx: number) => {
    const newItems = [...items];
    newItems[idx].done = !newItems[idx].done;
    setItems(newItems);
  };

  const reset = () => {
    setItems(items.map(i => ({...i, done: false})));
  };
  
  const handleChat = async () => {
    if(!chatMessage.trim()) return;
    const msg = chatMessage.trim();
    setChatLog(prev => [...prev, {sender: 'user', text: msg}]);
    setChatMessage('');
    setIsAiLoading(true);
    
    // Simulate thinking time
    setTimeout(() => {
      let reply = t("I'm not sure about that. Try adjusting your setup based on test laps.");
      const m = msg.toLowerCase();
      
      if (m.includes("rain") || m.includes("yağmur")) {
        reply = t("If it rains, make sure you have a secondary strategy configured to pit for Rain tyres when the water level exceeds your threshold (usually around 1-3mm).");
      } else if (m.includes("fuel") || m.includes("yakıt")) {
        reply = t("Check the Strategy tab. Make sure your total fuel covers the target laps + 1 extra lap for safety, but don't overfuel as it costs lap time (approx 0.03s per liter).");
      } else if (m.includes("tyre") || m.includes("lastik")) {
        reply = t("Tyre wear depends heavily on Track Temperature. Use harder compounds for hot tracks, and softer ones for cold tracks. Make sure the total estimated wear doesn't exceed 100%.");
      } else if (m.includes("setup") || m.includes("ayar")) {
        reply = t("Your car setup should be calibrated using Test Laps. Adjust Wings, Engine, and Brakes based on the track characteristics (Power vs Handling).");
      } else if (m.includes("risk") || m.includes("aggression") || m.includes("agresif")) {
        reply = t("Higher driver risk yields faster laps but drastically increases part wear and tyre wear, plus higher chance of mistakes. Use it sparingly!");
      }

      setChatLog(prev => [...prev, {sender: 'ai', text: reply}]);
      setIsAiLoading(false);
    }, 800);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 p-5 rounded-2xl shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-indigo-900 dark:text-indigo-400">
          <CheckCircle className="w-5 h-5 text-indigo-500" /> {t('Pre-Race Checklist')} </h2>
        <div className="flex items-center gap-2 sm:self-auto self-end">
          <button onClick={reset} className="px-2 py-1 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 font-bold transition rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"><RotateCcw className="w-4 h-4" /></button>
          {(currentUser) && (
            <button 
              onClick={save} 
              disabled={isSaving}
              className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 dark:border-indigo-800/30 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-[11px] font-bold tracking-wide rounded-lg flex items-center gap-1.5 shadow-sm transition"
            >
              <Save className="w-3.5 h-3.5" /> {t(saveUI)}
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item, idx) => (
          <div 
            key={idx} 
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${item.done ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/50' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500/50'}`}
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
               className={`flex-1 ml-1 cursor-pointer text-sm font-medium transition-colors ${item.done ? 'text-slate-500 line-through dark:text-slate-400' : 'text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
            >
              {t(item.text)}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-5 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-2xl w-full flex flex-col gap-4">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
            </div>
            <div>
               <h3 className="font-bold text-indigo-900 dark:text-indigo-300 leading-tight">{t('Race Assistant')}</h3>
               <p className="text-xs text-indigo-700/80 dark:text-indigo-400/80">{t('Need help preparing for the race?')}</p>
            </div>
         </div>
         
         {chatLog.length === 0 && (
           <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-indigo-100/50 dark:border-indigo-800/50 text-sm font-medium text-slate-700 dark:text-slate-300">
             {items.every(i => i.done) ? (
                <p>{t('All checks complete! Great job, your car setup and strategy are ready. Trust your analysis and good luck out there on the track!')}</p>
             ) : items.filter(i => i.done).length > 4 ? (
                <p>{t("You're almost there. Double check your tyre strategy based on the track temperature. It often drops towards the end of the race!")}</p>
             ) : (
                <p>{t('Welcome to race day! Start by configuring your')} <span className="text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline" onClick={() => goToTab('track_setup')}>{t('Track Setup')}</span> {t('to pull in the correct Track data, then check your')} <span className="text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline" onClick={() => goToTab('calibration')}>{t('Calibration')}</span> {t('limits.')}</p>
             )}
           </div>
         )}
         
         <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2">
            {chatLog.map((log, idx) => (
              <div key={idx} className={`p-3 rounded-xl max-w-[90%] text-sm ${log.sender === 'user' ? 'bg-indigo-600 text-white self-end rounded-br-none' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 self-start rounded-bl-none'}`}>
                {log.text}
              </div>
            ))}
            {isAiLoading && (
              <div className="p-3 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 self-start rounded-xl rounded-bl-none">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
              </div>
            )}
         </div>
         
         <div className="flex gap-2">
            <input 
               type="text" 
               className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-400"
               placeholder={t("E.g. What should I do if it rains at lap 20?")}
               value={chatMessage}
               onKeyDown={e => e.key === 'Enter' && handleChat()}
               onChange={e => setChatMessage(e.target.value)}
            />
            <button 
               onClick={handleChat}
               disabled={!chatMessage.trim() || isAiLoading}
               className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-2 rounded-xl transition-colors"
            >
               <Send className="w-5 h-5" />
            </button>
         </div>
      </div>
    </div>
  );
}
