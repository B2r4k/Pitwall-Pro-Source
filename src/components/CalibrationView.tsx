import { t } from '../i18n';
import React, { useState, useMemo } from 'react';
import { TRACK_DATABASE } from '../data';
import { TyreCompound, PlayerStats } from '../types';
import { calculateBaseFuel, calculateBaseWearMultiplier } from '../utils/calculator';
import { Settings, CheckCircle2, History, RotateCcw, MessageSquareText, Plus, Trash2, CloudRain, Save, CloudCog } from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Tooltip from './Tooltip';

interface Props {
  player: PlayerStats;
  setPlayer: (p: PlayerStats) => void;
}

interface PastStint {
  id: number;
  laps: number;
  compound: TyreCompound;
  wearConsumed: number;
  fuelConsumed: number;
}

export default function CalibrationView({ player, setPlayer }: Props) {
  const [trackId, setTrackId] = useState<string>('melbourne');
  const [avgTemp, setAvgTemp] = useState<number>(22);
  const [aggression, setAggression] = useState<number>(20);
  
  const [rainEnabled, setRainEnabled] = useState(false);
  const [rainProps, setRainProps] = useState({ q1: 0, q2_r1: 0, r2: 0, r3: 0, r4: 0 });

  const [stints, setStints] = useState<PastStint[]>([
    { id: 1, laps: 20, compound: 'S', wearConsumed: 50, fuelConsumed: 60 }
  ]);

  const [fuelResult, setFuelResult] = useState<number | null>(null);
  const [wearResult, setWearResult] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string[]>([]);
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');

  const autoFillFromAPI = () => {
      if (player.testingData && player.testingData.length > 0) {
          const apiStints = player.testingData.map((lap, i) => {
              let compound = 'S';
              if (lap.tyres) {
                 if (lap.tyres.toLowerCase().includes('soft')) compound = 'S';
                 if (lap.tyres.toLowerCase().includes('medium')) compound = 'M';
                 if (lap.tyres.toLowerCase().includes('hard')) compound = 'H';
                 if (lap.tyres.toLowerCase().includes('rain')) compound = 'R';
                 if (lap.tyres.toLowerCase().includes('extra')) compound = 'ES';
              }
              
              let wearConsumed = 50;
              if (lap.tyresCond !== undefined) wearConsumed = 100 - parseFloat(lap.tyresCond);
              
              let fuelConsumed = 60;
              if (lap.fuelCond !== undefined) fuelConsumed = 100 - parseFloat(lap.fuelCond);

              return {
                 id: Date.now() + i,
                 laps: parseInt(lap.laps) || 1,
                 compound: compound,
                 wearConsumed: isNaN(wearConsumed) ? 50 : wearConsumed,
                 fuelConsumed: isNaN(fuelConsumed) ? 60 : fuelConsumed
              };
          });
          if (apiStints.length > 0) {
             setStints(apiStints);
             alert(t("Auto-calibrated from API Testing Data!"));
          }
      } else {
          alert(t("No testing/practice data found. Run Auto Sync in Data tab first."));
      }
  };

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
       setSyncStatus(t('Error'));
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
       setSyncStatus(t('Error'));
     } finally {
       setTimeout(() => setSyncStatus(''), 2000);
       setIsSyncing(false);
     }
  };

  // Restrict to 1 dry tyre
  const activeDryTyre = useMemo(() => {
    const dry = stints.find(s => s.compound !== 'Rain');
    return dry ? dry.compound : null;
  }, [stints]);

  const addStint = () => {
    setStints([...stints, { 
      id: Date.now(), 
      laps: 15, 
      compound: activeDryTyre || 'S', 
      wearConsumed: 40,
      fuelConsumed: 45
    }]);
  };

  const removeStint = (id: number) => {
    if (stints.length > 1) {
      setStints(stints.filter(s => s.id !== id));
    }
  };

  const updateStint = (id: number, field: keyof PastStint, value: any) => {
    setStints(stints.map(s => {
      if (s.id === id) {
        // Enforce GPRO tyre rule natively on change
        if (field === 'compound' && value !== 'Rain' && activeDryTyre && activeDryTyre !== value) {
             // Let user change but update ALL dry stints to the new compound?
             alert(t("Under GPRO rules, you may only use one type of dry compound per race. Other stints will be synced automatically."));
             // Will update all below
        }
        return { ...s, [field]: value };
      }
      return s;
    }).map(s => {
       // Sync dry compounds
       if (field === 'compound' && value !== 'Rain' && s.compound !== 'Rain') {
           return { ...s, compound: value };
       }
       return s;
    }));
  };

  const totalLaps = stints.reduce((sum, s) => sum + s.laps, 0);

  const handleCalculate = () => {
    if (totalLaps <= 0) return alert(t("Incorrect number of laps entered."));
    
    let totalFuelConsumed = 0;
    let knownLaps = 0;
    stints.forEach((stint, i) => {
        const isLast = i === stints.length - 1;
        if (isLast && i > 0) {
            const avgFuel = knownLaps > 0 ? totalFuelConsumed / knownLaps : 0;
            totalFuelConsumed += avgFuel * stint.laps;
        } else {
            totalFuelConsumed += (stint.fuelConsumed || 0);
            knownLaps += stint.laps;
        }
    });

    const estimatedBaseFuel = calculateBaseFuel(trackId, totalFuelConsumed, totalLaps, TRACK_DATABASE, player.carParts);
    
    // Average out the wear multiplier across stints
    let totalWearMultiplier = 0;
    stints.forEach(stint => {
       // Very rough estimation: treating each stint independently and averaging out
       const stintWearMult = calculateBaseWearMultiplier(trackId, stint.compound, stint.wearConsumed, stint.laps, avgTemp, aggression, TRACK_DATABASE, player);
       totalWearMultiplier += stintWearMult * stint.laps;
    });
    
    const avgWearMult = totalWearMultiplier / totalLaps;

    setFuelResult(estimatedBaseFuel);
    setWearResult(avgWearMult);

    // AI/Engineer Feedback
    const newFeedback: string[] = [];
    if (avgWearMult > 1.15) {
      newFeedback.push(t("🚨 Your tyre wear factor is very high! You reached the puncture limits in some stints. Lower driver aggression."));
    } else if (avgWearMult < 0.85) {
      newFeedback.push(t("✨ Excellent tyre economy. Wear is well below average."));
    } else {
      newFeedback.push(t("📊 Your tyre wear is around the standard average."));
    }

    if (estimatedBaseFuel > 3.5) {
      newFeedback.push(t("⛽ Your base fuel consumption is very high. Consider optimizing setups or engine updates."));
    }

    const currentTrack = TRACK_DATABASE.find(t => t.id === trackId);
    if (currentTrack) {
        if (totalLaps > currentTrack.laps) {
           newFeedback.push(t("⚠️ Your stint laps sum up to more than the track laps! Check your inputs."));
        } else if (totalLaps < currentTrack.laps) {
            newFeedback.push(t("⚠️ You probably DNF'd or crashed, you mapped fewer laps than the track total.") + " (" + totalLaps + ") ");
        }
    }

    if (rainEnabled) {
       const avgRainProb = (rainProps.q2_r1 + rainProps.r2 + rainProps.r3 + rainProps.r4) / 4;
       if (avgRainProb > 30 && stints.every(s => s.compound !== 'Rain')) {
          newFeedback.push(t("💧 Despite heavy rain probability, you stubbornly stayed on dry tyres! The high wear reflects this loss of grip."));
       } else if (avgRainProb < 10 && stints.some(s => s.compound === 'Rain')) {
          newFeedback.push(t("🌤️ You played it too safe with Rain tyres in mostly dry conditions, causing heavy wear and time loss."));
       } else {
          newFeedback.push(t("🌦️ Your tyre selection in transition periods looks reasonable."));
       }
    }

    setFeedback(newFeedback);
  };

  const handleApply = () => {
    if (fuelResult !== null && wearResult !== null && wearResult > 0) {
      setPlayer({
        ...player,
        baseFuelPerLap: Number(fuelResult.toFixed(3)),
        baseWearMultiplier: Number(wearResult.toFixed(3)),
      });
      alert(t("Settings successfully calibrated to Profile!"));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border dark:border-slate-700/60 border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-800 pb-4 gap-4">
           <div>
             <h2 className="text-lg font-semibold flex items-center gap-2 text-indigo-900 dark:text-indigo-400">
               <History className="w-5 h-5 text-indigo-500" /> {t("Analytical Calibration Suite")}
             </h2>
             <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">{t("Enter past race data to precisely calibrate your car and driver stats.")}</p>
           </div>
           <div className="flex items-center gap-2 sm:self-auto self-end">
             {syncStatus && <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">{syncStatus}</span>}
             <button onClick={autoFillFromAPI} className="px-2.5 py-1.5 bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-400 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 border border-amber-200 dark:border-amber-800/30"><RotateCcw className="w-3.5 h-3.5" /> Auto Fill</button>
             <button onClick={loadFromCloud} disabled={isSyncing} className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"><CloudCog className="w-3.5 h-3.5" /> Load</button>
             <button onClick={saveToCloud} disabled={isSyncing} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 border border-indigo-200 dark:border-indigo-800/30"><Save className="w-3.5 h-3.5" /> Save</button>
           </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t("Past Track")}</label>
                <select 
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/50 border dark:border-slate-700 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  value={trackId}
                  onChange={e => setTrackId(e.target.value)}
                >
                  {TRACK_DATABASE.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                    {t("Rain Conditions?")}
                 </label>
                 <button onClick={() => setRainEnabled(!rainEnabled)} className={`w-full p-2.5 rounded-lg border dark:border-slate-700 font-bold text-sm transition-colors flex items-center justify-center gap-2 ${rainEnabled ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 border-slate-200 dark:border-slate-700'} `}>
                    <CloudRain className="w-4 h-4" /> {rainEnabled ? t("Active") : t("Dry Race")}
                 </button>
              </div>
            </div>

            {rainEnabled && (
                <div className="p-4 bg-blue-50/50 rounded-xl border dark:border-slate-700 border-blue-100 space-y-2 animate-in fade-in">
                    <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-xs uppercase flex items-center gap-1"><CloudRain className="w-3.5 h-3.5 text-blue-500" /> {t("Estimated Rain Probabilities (%)")} <Tooltip content="Approximate rain chances during that session. yaklaşık olarak girin ki performans tespiti kusursuzlaşsın." /></h3>
                    <div className="flex gap-2 text-xs">
                        {['q2_r1', 'r2', 'r3', 'r4'].map(k => (
                           <input key={k} type="number" min="0" max="100" placeholder={k} className="text-slate-800 dark:text-slate-100 w-full p-1.5 rounded bg-white dark:bg-slate-900 border dark:border-slate-700 border-slate-200 dark:border-slate-700 text-center" 
                               value={(rainProps as any)[k]} onChange={e => setRainProps({...rainProps, [k]: Number(e.target.value)})} 
                           />
                        ))}
                    </div>
                </div>
            )}

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border dark:border-slate-700 border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex justify-between items-center">
                 <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">{t("Pit Strategy & Stints")} <Tooltip content={t("Add your stints. At least 1 dry compound is mandatory.")} /></h3>
              </div>
              
              <div className="space-y-3">
                 {stints.map((stint, index) => {
                    const isLast = index === stints.length - 1;
                    
                    let displayFuel = "---";
                    if (isLast && index > 0) {
                        const pastLaps = stints.slice(0, index).reduce((acc, s) => acc + s.laps, 0);
                        const pastFuel = stints.slice(0, index).reduce((acc, s) => acc + (s.fuelConsumed || 0), 0);
                        const avgFuel = pastLaps > 0 ? pastFuel / pastLaps : 0;
                        displayFuel = (avgFuel * stint.laps).toFixed(1);
                    }

                    return (
                    <div key={stint.id} className="p-3 bg-white dark:bg-slate-900 border dark:border-slate-700 border-slate-200 dark:border-slate-700 rounded-lg relative group">
                        <div className="absolute -left-2 -top-2 w-5 h-5 bg-indigo-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm">{index + 1}</div>
                        {stints.length > 1 && (
                            <button onClick={() => removeStint(stint.id)} className="absolute -top-2 -right-2 w-5 h-5 bg-red-100 hover:bg-red-500 text-red-600 hover:text-white transition-colors rounded-full flex items-center justify-center"><Trash2 className="w-3 h-3" /></button>
                        )}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                           <div>
                              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">{t("Compound")}</label>
                              <select value={stint.compound} onChange={e => updateStint(stint.id, 'compound', e.target.value)} className="text-slate-800 dark:text-slate-100 w-full p-1.5 text-sm bg-slate-50 dark:bg-slate-800/50 border dark:border-slate-700 border-slate-200 dark:border-slate-700 rounded">
                                 <option value="XS">Ex. Soft</option>
                                 <option value="S">Soft</option>
                                 <option value="M">Medium</option>
                                 <option value="H">Hard</option>
                                 <option value="Rain">Rain</option>
                              </select>
                           </div>
                           <div>
                              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">{t("Laps (Stint)")}</label>
                              <div className="flex items-center w-full">
                                <button onClick={() => updateStint(stint.id, 'laps', Math.max(1, stint.laps - 1))} className="p-1.5 h-full bg-white dark:bg-slate-700 border border-r-0 border-slate-200 dark:border-slate-600 rounded-l text-slate-500 hover:text-indigo-500 transition">-</button>
                                <input type="number" min="1" value={stint.laps} onChange={e => updateStint(stint.id, 'laps', Number(e.target.value))} className="text-slate-800 dark:text-slate-100 w-full min-w-[30px] p-1.5 text-sm bg-slate-50 dark:bg-slate-800/50 border-t border-b border-l-0 border-r-0 border-slate-200 dark:border-slate-600 text-center focus:ring-0 focus:outline-none appearance-none" />
                                <button onClick={() => updateStint(stint.id, 'laps', stint.laps + 1)} className="p-1.5 h-full bg-white dark:bg-slate-700 border border-l-0 border-slate-200 dark:border-slate-600 rounded-r text-slate-500 hover:text-indigo-500 transition">+</button>
                              </div>
                           </div>
                           <div>
                              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider flex items-center justify-center gap-1">
                                {t("Wear Consumed (%)")}
                                <Tooltip content="Enter how much wear was used (e.g. if 40% remaining, enter 60)" />
                              </label>
                              <input type="number" step="0.1" value={stint.wearConsumed} onChange={e => updateStint(stint.id, 'wearConsumed', Number(e.target.value))} className="text-slate-800 dark:text-slate-100 w-full p-1.5 text-sm bg-slate-50 dark:bg-slate-800/50 border dark:border-slate-700 border-slate-200 dark:border-slate-700 rounded text-center" />
                           </div>
                           <div>
                              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider flex items-center justify-center gap-1">
                                {t("Fuel Consumed (L)")}
                                <Tooltip content="Enter how much fuel was used (Start Fuel - Remaining Fuel Liters). If remaining is 1%, enter StartFuel - (TankCapacity * 0.01)" />
                                {isLast && index > 0 && <Tooltip content="Last stint fuel is auto-estimated based on previous average." />}
                              </label>
                              {isLast && index > 0 ? (
                                  <div className="w-full p-1.5 text-sm bg-indigo-50/50 text-indigo-400 border dark:border-slate-700 border-indigo-100 rounded text-center font-mono cursor-not-allowed" title={t("Estimated Average")}>{displayFuel}</div>
                              ) : (
                                  <input type="number" step="0.1" value={stint.fuelConsumed} onChange={e => updateStint(stint.id, 'fuelConsumed', Number(e.target.value))} className="text-slate-800 dark:text-slate-100 w-full p-1.5 text-sm bg-slate-50 dark:bg-slate-800/50 border dark:border-slate-700 border-indigo-200 rounded text-center text-indigo-700 font-bold" />
                              )}
                           </div>
                        </div>
                    </div>
                 )})}
                 <button onClick={addStint} className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-indigo-600 font-bold text-sm rounded-lg border dark:border-slate-700 border-slate-200 dark:border-slate-700 border-dashed flex items-center justify-center gap-1 transition-colors">
                     <Plus className="w-4 h-4" /> {t("New Stint (Pit)")}
                 </button>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border dark:border-slate-700 border-slate-200 dark:border-slate-700 space-y-4">
              <h3 className="font-semibold text-slate-700 dark:text-slate-300">{t("Overall Race Conditions")}</h3>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 flex items-center">{t("Avg Temp (°C)")} <Tooltip content="Average race or track temperature." /></label>
                    <input type="number" value={avgTemp} onChange={e => setAvgTemp(Number(e.target.value))} className="w-full p-2 rounded-lg border dark:border-slate-700 border-slate-300" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{t("Risk Lvl")}</label>
                    <input type="number" value={aggression} onChange={e => setAggression(Number(e.target.value))} className="w-full p-2 rounded-lg border dark:border-slate-700 border-slate-300" />
                 </div>
              </div>
            </div>

            <button 
              onClick={handleCalculate}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <RotateCcw className="w-5 h-5" />
              {t("Evaluate Race Data")}
            </button>
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 h-full shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col">
              <h3 className="text-xl font-bold flex items-center gap-2 mb-6 text-indigo-600 dark:text-indigo-400">
                <Settings className="w-6 h-6" /> {t("Extracted Base Values")}
              </h3>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="text-sm text-slate-400 mb-1 flex items-center gap-1">{t("Fuel Burn")} <Tooltip content="Fuel burn per lap. Used to update global settings after calibration." /></div>
                    <div className="text-2xl font-mono text-slate-800 dark:text-white">
                      {fuelResult !== null ? fuelResult.toFixed(3) : '---'} <span className="text-sm text-slate-400">L/Lap</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="text-sm text-slate-400 mb-1 flex items-center gap-1">{t("Wear Factor")} <Tooltip content="Your car and driver's standard tyre wear rate scale. 1.0 is default." /></div>
                    <div className="text-2xl font-mono text-slate-800 dark:text-white">
                      {wearResult !== null ? (wearResult > 0 ? 'x' + wearResult.toFixed(3) : t('Error!')) : '---'}
                    </div>
                  </div>
                  
                  {wearResult !== null && fuelResult !== null && (
                    <>
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="text-sm text-slate-400 mb-1 flex items-center gap-1">{t("Max Laps (Soft)")}</div>
                        <div className="text-xl font-mono text-indigo-300">
                          {Math.floor(95 / ((wearResult || 1) * 3.2 * 1.45))} <span className="text-sm">Laps</span>
                        </div>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="text-sm text-slate-400 mb-1 flex items-center gap-1">{t("Max Laps (Medium)")}</div>
                        <div className="text-xl font-mono text-indigo-300">
                          {Math.floor(95 / ((wearResult || 1) * 2.1 * 1.45))} <span className="text-sm">Laps</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Yorumlama Alanı (Engineer Insight) */}
                {feedback.length > 0 && (
                  <div className="bg-indigo-950/40 p-4 rounded-xl border dark:border-slate-700 border-indigo-500/30">
                    <h4 className="flex items-center gap-2 font-semibold text-indigo-300 mb-3 text-sm uppercase tracking-wide">
                      <MessageSquareText className="w-4 h-4" /> {t("AI Engineer Insight")}
                    </h4>
                    <div className="space-y-3 text-sm text-slate-300 leading-relaxed font-normal">
                      {feedback.map((msg, idx) => (
                        <p key={idx}>{msg}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {fuelResult !== null && wearResult !== null && wearResult > 0 && (
                 <div className="mt-auto pt-8 flex-1 flex items-end">
                   <div className="w-full">
                       <button 
                          onClick={handleApply}
                          className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-900 rounded-xl font-black transition-colors flex items-center justify-center gap-2 shadow-sm uppercase tracking-wider"
                       >
                         <CheckCircle2 className="w-5 h-5" />
                         {t("Accept and Apply to Profile")}
                       </button>
                       <p className="text-center text-xs text-slate-400 mt-3 font-medium">{t("Values will be synced to your account.")}</p>
                   </div>
                 </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
