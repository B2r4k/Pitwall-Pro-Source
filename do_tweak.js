import fs from 'fs';
let c = fs.readFileSync('src/App.tsx', 'utf-8');

c = c.replace(/import { analyzeStrategies, CalcParams, calculateFuelPerLap } from '.\/utils\/calculator';/, "import { analyzeStrategies, CalcParams, calculateFuelPerLap, simulateStint } from './utils/calculator';");

const hooksLoc = `  const bestStrategy = results.length > 0 ? results[0] : null;
  const selectedStrategy = results[selectedStratIndex] || bestStrategy;`;

const hooksRepl = `  const bestStrategy = results.length > 0 ? results[0] : null;
  const baseSelectedStrategy = results[selectedStratIndex] || bestStrategy;

  const [manualStintLaps, setManualStintLaps] = useState<number[] | null>(null);

  useEffect(() => {
    if (baseSelectedStrategy) {
       setManualStintLaps(baseSelectedStrategy.stints.map(s => s.laps));
    } else {
       setManualStintLaps(null);
    }
  }, [selectedStratIndex, results, activeTrack.name]);

  const selectedStrategy = useMemo(() => {
    if (!baseSelectedStrategy || !manualStintLaps || manualStintLaps.length !== baseSelectedStrategy.stints.length) return baseSelectedStrategy;
    
    let currentLap = 0;
    let valid = true;
    let totalRelativeTime = 0;
    const newStints: any[] = [];
    
    for (let i = 0; i < manualStintLaps.length; i++) {
        const laps = manualStintLaps[i];
        const compound = baseSelectedStrategy.stints[i].tyres;
        const stintSim = simulateStint(laps, compound, calcParams, currentLap);
        
        newStints.push({
            laps,
            tyres: compound,
            fuelStart: stintSim.fuelNeeded,
            fuelNeeded: stintSim.fuelNeeded,
            wearEnd: stintSim.wearEnd
        });
        
        currentLap += laps;
        totalRelativeTime += stintSim.timeCost;
        if (!stintSim.valid) valid = false;
        
        // Add refuel penalties
        if (i < manualStintLaps.length - 1) {
            const pitTime = calcParams.track.pitTimeBase + (simulateStint(manualStintLaps[i+1], baseSelectedStrategy.stints[i+1].tyres, calcParams, currentLap).fuelNeeded / calcParams.pitRefuelRate);
            totalRelativeTime += pitTime;
        }
    }
    
    return {
        stops: baseSelectedStrategy.stops,
        totalRaceTime: totalRelativeTime,
        stints: newStints,
        _isManualValid: valid 
    };
  }, [baseSelectedStrategy, manualStintLaps, calcParams]);`;

c = c.replace(hooksLoc, hooksRepl);

// Now add the interactive sliders to the UI for each stint.
// Find the mapping of stints to cards.
const stintRenderLoc = `                          {selectedStrategy!.stints.map((stint, idx) => (
                            <div key={idx} className={\`bg-white dark:bg-slate-900 rounded-xl p-4 border dark:border-slate-700 shadow-sm flex flex-col justify-between \${selectedStratIndex === 0 ? 'border-emerald-100' : 'border-indigo-100'}\`}>`;

const replacementUI = `                          {selectedStrategy!.stints.map((stint, idx) => (
                            <div key={idx} className={\`bg-white dark:bg-slate-900 rounded-xl p-4 border shadow-sm flex flex-col justify-between \${selectedStratIndex === 0 ? 'border-emerald-100 dark:border-emerald-900/30' : 'border-indigo-100 dark:border-indigo-900/30'} \${stint.wearEnd > 95 ? 'border-red-300 dark:border-red-800' : ''}\`}>`;

c = c.replace(stintRenderLoc, replacementUI);

// Inside the stint card, we want to add the slider for the laps if there are multiple stints.
const innerCardLoc = `                                <p className="flex justify-between items-center">Mesafe: <strong className="text-slate-800 dark:text-slate-200">{stint.laps} v</strong></p>`;

// If idx is not the last stint, and there are multiple stints. Or just an input type range.
// The trick is: you have manualStintLaps as an array. If you increase stint idx, you decrease stint idx+1 or something.
// A simpler way: we can just put a slider for "Pit Stop Lap". 
// But if there are 2 stops (3 stints), we have 2 pit stops. So 2 sliders.
// Let's create a generic lap adjuster.
const newInnerCard = `                                <div className="mb-2">
                                  <p className="flex justify-between items-center mb-1">Mesafe: <strong className={stint.wearEnd > 95 ? "text-red-500" : "text-slate-800 dark:text-slate-200"}>{stint.laps} v</strong></p>
                                  {manualStintLaps && manualStintLaps.length > 1 && idx < manualStintLaps.length - 1 && (
                                     <input 
                                        type="range" 
                                        min="1" 
                                        max={manualStintLaps[idx] + manualStintLaps[idx+1] - 1} 
                                        value={manualStintLaps[idx]} 
                                        onChange={(e) => {
                                            const newVal = parseInt(e.target.value, 10);
                                            const diff = newVal - manualStintLaps[idx];
                                            const newLaps = [...manualStintLaps];
                                            newLaps[idx] = newVal;
                                            newLaps[idx+1] -= diff;
                                            setManualStintLaps(newLaps);
                                        }}
                                        className="w-full accent-indigo-500 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer" 
                                     />
                                  )}
                                </div>`;

c = c.replace(innerCardLoc, newInnerCard);

const fuelInner = `<p className="flex justify-between items-center">Fuel: <strong className="text-slate-800 dark:text-slate-200">{Math.ceil(stint.fuelStart)} L</strong></p>`;
const fuelInnerRepl = `<p className="flex justify-between items-center text-xs">Wear: <strong className={\`\${stint.wearEnd > 95 ? 'text-red-500' : 'text-slate-800 dark:text-slate-200'}\`}>{stint.wearEnd.toFixed(1)}%</strong></p>
                                <p className="flex justify-between items-center text-xs">Fuel: <strong className="text-slate-800 dark:text-slate-200">{Math.ceil(stint.fuelStart)} L</strong></p>`;

c = c.replace(fuelInner, Object.keys({}).length === 0 ? fuelInner : fuelInnerRepl); // Actually it might replace only 1. We should use global replace.
c = c.replace(new RegExp(fuelInner.replace(/[.*+?^\${}()|[\]\\]/g, '\\$&'), 'g'), fuelInnerRepl);

// For the analysis summary warning, we should use _isManualValid
const inspectDivLoc = `                            <div className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-semibold border dark:border-slate-700 border-indigo-200">Inspecting</div>
                          )}`;

const inspectDivRepl = `                            <div className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-semibold border dark:border-slate-700 border-indigo-200">Inspecting</div>
                          )}
                          {selectedStrategy!._isManualValid === false && (
                             <div className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold border border-red-200 ml-2 animate-pulse">Overwear Risk</div>
                          )}`;

c = c.replace(inspectDivLoc, inspectDivRepl);

fs.writeFileSync('src/App.tsx', c);
