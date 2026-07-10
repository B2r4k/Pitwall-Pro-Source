const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Add Bell icon import
app = app.replace('import { Calculator, Map as MapIcon, ChevronDown, Check, Sun, ThermometerSun, AlertCircle, TrendingUp, HelpCircle, User, Activity, \n  Fuel,\n  Siren,\n  Clock,\n  Wrench,\n  Search,\n  Menu,\n  ChevronRight,\n  MonitorSmartphone,\n  CloudCog,\n  RotateCcw,\n  CheckCircle, Save,\n  Camera\n} from \'lucide-react\';', 
`import { Calculator, Map as MapIcon, ChevronDown, Check, Sun, ThermometerSun, AlertCircle, TrendingUp, HelpCircle, User, Activity, 
  Fuel, Siren, Clock, Wrench, Search, Menu, ChevronRight, MonitorSmartphone, CloudCog, RotateCcw, CheckCircle, Save, Camera, Bell, MessageSquare, Send
} from 'lucide-react';`);

const bellImportRetry = /import \{ Calculator.*?from 'lucide-react';/s;
if (!app.includes('Bell, MessageSquare, Send') && app.match(bellImportRetry)) {
  const match = app.match(bellImportRetry)[0];
  app = app.replace(match, match.replace("} from 'lucide-react';", ", Bell, MessageSquare, Send} from 'lucide-react';"));
}


// 2. Add Feedback/Notification State
const stateRegex = /const \[syncStatus, setSyncStatus\] = useState\(''\);/;
app = app.replace(stateRegex, `const [syncStatus, setSyncStatus] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSending, setFeedbackSending] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  
  const handleSendFeedback = async () => {
    if (!feedbackText.trim()) return;
    setFeedbackSending(true);
    try {
      const { collection, addDoc } = await import('firebase/firestore');
      const { db, auth } = await import('./firebase');
      await addDoc(collection(db, 'feedbacks'), {
        text: feedbackText,
        userId: auth.currentUser?.uid || 'anonymous',
        userEmail: auth.currentUser?.email || 'N/A',
        timestamp: new Date().toISOString()
      });
      setFeedbackSent(true);
      setFeedbackText('');
      setTimeout(() => setFeedbackSent(false), 3000);
    } catch(e) {
      console.error("Feedback failed:", e);
      alert("Hata / Error: " + e.message);
    } finally {
      setFeedbackSending(false);
    }
  };`);

// 3. Add Bell icons next to Menu icons in Header
// Mobile
const mobileMenuRegex = /<button onClick=\{\(\) => setAppView\(appView === 'calculator' \? 'menu' : 'calculator'\)\} className="p-1\.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition">[\s\S]*?<Menu className="w-5 h-5" \/>[\s\S]*?<\/button>/;
const mobileMenuRepl = `<button onClick={() => setAppView('notifications')} className="p-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition relative">
                   <Bell className="w-5 h-5" />
                   <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-slate-800"></span>
                 </button>
                 <button onClick={() => setAppView(appView === 'calculator' ? 'menu' : 'calculator')} className="p-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition">
                   <Menu className="w-5 h-5" />
                 </button>`;
app = app.replace(mobileMenuRegex, mobileMenuRepl);

// Desktop
const desktopMenuRegex = /<div className=\{`hidden lg:flex items-center gap-3 max-lg:data-\[landscape=true\]:flex max-lg:data-\[landscape=true\]:mt-auto`\}>\s*<button onClick=\{\(\) => setAppView\(appView === 'calculator' \? 'menu' : 'calculator'\)\} className="p-1\.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition">\s*<Menu className="w-5 h-5" \/>\s*<\/button>\s*<\/div>/;

const desktopMenuRepl = `<div className={\`hidden lg:flex items-center gap-3 max-lg:data-[landscape=true]:flex max-lg:data-[landscape=true]:mt-auto\`}>
               <button onClick={() => setAppView('notifications')} className="p-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition relative">
                 <Bell className="w-5 h-5" />
                 <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-slate-800"></span>
               </button>
               <button onClick={() => setAppView(appView === 'calculator' ? 'menu' : 'calculator')} className="p-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition">
                 <Menu className="w-5 h-5" />
               </button>
            </div>`;
app = app.replace(desktopMenuRegex, desktopMenuRepl);

// 4. Update Header title when Notifications is active
const viewTitleRegex = /\{appView === 'menu' \? 'App Menu' : appView === 'settings' \? 'Settings' : `\$\{t\('Account'\)\} & Sync`\}/;
app = app.replace(viewTitleRegex, `{appView === 'menu' ? t('App Menu') : appView === 'settings' ? t('Settings') : appView === 'notifications' ? t('Notifications') : \`\${t('Account')} & Sync\`}`);


// 5. Add Notifications View
const settingsViewEndRegex = /(<\/div>\n\s*)(\n\s*\{feedbackModalOpen && \()/;
const notifView = `{appView === 'notifications' && (
      <div className="flex flex-col gap-6 animate-fade-in max-w-3xl mx-auto w-full">
         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-500" /> {t('Recent Notifications')}
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 rounded-xl">
                 <p className="text-sm font-bold text-indigo-800 dark:text-indigo-300">{t('Welcome to GPRO Strategy Wizard')}</p>
                 <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">{t('We recently updated the stint lap distribution charts and added translation capabilities!')}</p>
                 <p className="text-[10px] text-indigo-400 dark:text-indigo-500 mt-2 font-mono">2026-06-10 12:00 UTC</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl opacity-75">
                 <p className="text-sm font-bold text-slate-800 dark:text-slate-300">{t('Calendar Fetch Fixed')}</p>
                 <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{t('You can now automatically pull the upcoming F1 track from the Dashboard.')}</p>
                 <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-mono">2026-06-05 08:30 UTC</p>
              </div>
            </div>
         </div>

         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-500" /> {t('Send Feedback')}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{t('Let us know what features you want next or report a bug. Your message will be sent securely to the developer.')}</p>
            <textarea 
               value={feedbackText}
               onChange={(e) => setFeedbackText(e.target.value)}
               className="w-full h-32 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none mb-4 dark:text-slate-200"
               placeholder={t('Type your feedback here...')}
            ></textarea>
            <div className="flex justify-end items-center gap-3">
               {feedbackSent && <span className="text-sm font-bold text-emerald-500">{t('Feedback Sent! Thank you.')}</span>}
               <button 
                  onClick={handleSendFeedback} 
                  disabled={!feedbackText.trim() || feedbackSending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-xl flex items-center gap-2 transition disabled:opacity-50"
               >
                  {feedbackSending ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {t('Submit')}
               </button>
            </div>
         </div>
      </div>
   )}
   `;
app = app.replace(settingsViewEndRegex, "$1" + notifView + "$2");

fs.writeFileSync('src/App.tsx', app);
