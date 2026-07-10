const fs = require('fs');
let calib = fs.readFileSync('src/components/CalibrationView.tsx', 'utf-8');

const importsAdding = `import { Settings, CheckCircle2, History, RotateCcw, MessageSquareText, Plus, Trash2, CloudRain, Save, CloudCog } from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';`;

calib = calib.replace(/import \{ Settings, CheckCircle2, History, RotateCcw, MessageSquareText, Plus, Trash2, CloudRain \} from 'lucide-react';/, importsAdding);

const stateAdding = `  const [fuelResult, setFuelResult] = useState<number | null>(null);
  const [wearResult, setWearResult] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string[]>([]);
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');

  const saveToCloud = async () => {
     setIsSyncing(true);
     setSyncStatus(t('Saving...'));
     try {
       const payload = {
          trackId, avgTemp, aggression, rainEnabled, rainProps, stints
       };
       if (auth.currentUser) {
          await setDoc(doc(db, "calibration_saves", auth.currentUser.uid), payload);
       } else {
          localStorage.setItem('gpro_calib_save', JSON.stringify(payload));
       }
       setSyncStatus(t('Saved successfully!'));
     } catch (e) {
       console.error(e);
       setSyncStatus('Error saving!');
     } finally {
       setTimeout(() => setSyncStatus(''), 2000);
       setIsSyncing(false);
     }
  };

  const loadFromCloud = async () => {
     setIsSyncing(true);
     setSyncStatus(t('Loading...'));
     try {
       let data = null;
       if (auth.currentUser) {
          const docSnap = await getDoc(doc(db, "calibration_saves", auth.currentUser.uid));
          if (docSnap.exists()) data = docSnap.data();
       } 
       if (!data) {
          const local = localStorage.getItem('gpro_calib_save');
          if (local) data = JSON.parse(local);
       }

       if (data) {
           if (data.trackId) setTrackId(data.trackId);
           if (data.avgTemp) setAvgTemp(data.avgTemp);
           if (data.aggression) setAggression(data.aggression);
           if (data.rainEnabled !== undefined) setRainEnabled(data.rainEnabled);
           if (data.rainProps) setRainProps(data.rainProps);
           if (data.stints) setStints(data.stints);
           setSyncStatus(t('Loaded!'));
       } else {
           setSyncStatus(t('No save found.'));
       }
     } catch (e) {
       console.error(e);
       setSyncStatus('Error loading!');
     } finally {
       setTimeout(() => setSyncStatus(''), 2000);
       setIsSyncing(false);
     }
  };`;

calib = calib.replace(/  const \[fuelResult, setFuelResult\] = useState<number \| null>\(null\);\n  const \[wearResult, setWearResult\] = useState<number \| null>\(null\);\n  const \[feedback, setFeedback\] = useState<string\[\]>\(\[\]\);/, stateAdding);

const buttonAdding = `<div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <History className="w-6 h-6 text-indigo-500" /> {t("Analytical Calibration Suite")}
          </h2>
          <div className="flex items-center gap-2">
             {syncStatus && <span className="text-xs font-medium text-emerald-500">{syncStatus}</span>}
             <button onClick={loadFromCloud} disabled={isSyncing} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5"><CloudCog className="w-3.5 h-3.5" /> Load</button>
             <button onClick={saveToCloud} disabled={isSyncing} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5"><Save className="w-3.5 h-3.5" /> Save</button>
          </div>
        </div>`;

calib = calib.replace(/<div className="flex items-center grid-cols-1 mb-6">\n          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">\n             <History className="w-6 h-6 text-indigo-500" \/> \{t\("Analytical Calibration Suite"\)\}\n          <\/h2>\n        <\/div>/, buttonAdding);

fs.writeFileSync('src/components/CalibrationView.tsx', calib);
