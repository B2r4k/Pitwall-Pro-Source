import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PlayerStats, Weather, Track, TyreCompound } from '../types';
import { calculateWearPerLap, calculateFuelPerLap, CalcParams, calculateRaceCarWear } from '../utils/calculator';
import { Play, Pause, RotateCcw, Activity, AlertCircle, ChevronLeft, HelpCircle } from 'lucide-react';
import { t } from '../i18n';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Tooltip as RechartsTooltip, ReferenceLine, Brush } from 'recharts';
import { TRACK_DATABASE } from '../data';

interface SimulationEngineProps {
   player: PlayerStats;
   track: Track;
   weather: Weather;
   onBack: () => void;
}

const InfoTooltip = ({ text }: { text: string }) => (
    <div title={text} className="ml-1.5 inline-flex items-center justify-center align-middle cursor-help">
        <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-indigo-500 transition-colors" />
    </div>
);

const TrackVisualizer = ({ simRef }: { simRef: any }) => {
    const pathRef = useRef<SVGPathElement>(null);
    const containerRef = useRef<SVGGElement>(null);

    useEffect(() => {
        let rAF: number;
        const tick = () => {
            if (pathRef.current && containerRef.current && simRef.current) {
                const s = simRef.current;
                const pathLength = pathRef.current.getTotalLength();
                
                // Construct children dynamically
                let html = '';
                
                // Draw bots
                s.bots?.forEach((b: any) => {
                    const prog = Math.max(0, Math.min(1, b.progress));
                    const point = pathRef.current!.getPointAtLength(pathLength * prog);
                    html += `<circle cx="${point.x}" cy="${point.y}" r="4" fill="${b.color}" opacity="0.6"/>`;
                });

                // Draw player
                const playerProg = Math.max(0, Math.min(1, s.lapProgress));
                const playerPoint = pathRef.current.getPointAtLength(pathLength * playerProg);
                
                let px = playerPoint.x;
                let py = playerPoint.y;
                if (s.playerMistakeTimer > 0) {
                    px += Math.sin(Date.now() / 100) * 10;
                    py -= Math.sin(Date.now() / 150) * 10;
                } else if (s.playerQueuePenalty > 0) {
                    px += (Math.random() - 0.5) * 4;
                    py += (Math.random() - 0.5) * 4;
                }

                html += `<circle cx="${px}" cy="${py}" r="7" fill="${s.status === 'DNF' ? '#ef4444' : s.status === 'Running' ? '#6366f1' : '#a8a29e'}" filter="drop-shadow(0 0 4px rgba(99,102,241,0.6))"/>`;
                
                containerRef.current.innerHTML = html;
            }
            rAF = requestAnimationFrame(tick);
        };
        tick();
        return () => cancelAnimationFrame(rAF);
    }, [simRef]);

    return (
        <div className="relative w-full h-40 sm:h-48 bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden shadow-inner flex items-center justify-center p-4">
             <div className="absolute top-3 left-3 text-[10px] font-bold tracking-widest uppercase text-slate-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                Live Telemetry
             </div>
             <svg viewBox="0 0 500 250" className="w-[90%] h-[90%] opacity-90 mx-auto">
                 <defs>
                     <linearGradient id="trackGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                         <stop offset="0%" stopColor="#334155" />
                         <stop offset="100%" stopColor="#1e293b" />
                     </linearGradient>
                 </defs>
                 <path 
                     ref={pathRef}
                     d="M 100 200 C 0 200, 0 50, 150 50 L 350 50 C 500 50, 500 200, 400 200 Z" 
                     fill="none" 
                     stroke="url(#trackGradient)" 
                     strokeWidth="16" 
                     strokeLinecap="round" 
                     strokeLinejoin="round" 
                 />
                 <path 
                     d="M 100 200 C 0 200, 0 50, 150 50 L 350 50 C 500 50, 500 200, 400 200 Z" 
                     fill="none" 
                     stroke="#475569" 
                     strokeWidth="2" 
                     strokeDasharray="4 6" 
                 />
                 <path d="M 100 190 L 100 210" stroke="#f8fafc" strokeWidth="3" />
                 <g ref={containerRef}></g>
             </svg>
        </div>
    );
};

export default function SimulationEngine({ player, track: initialTrack, weather, onBack }: SimulationEngineProps) {
    const [isRunning, setIsRunning] = useState(false);
    const [speedMultiplier, setSpeedMultiplier] = useState(1);
    const speedMultiplierRef = useRef(1);
    
    useEffect(() => { speedMultiplierRef.current = speedMultiplier; }, [speedMultiplier]);
    
    // Config States
    const [selectedTrackId, setSelectedTrackId] = useState<string>(initialTrack.id);
    const activeTrack = useMemo(() => TRACK_DATABASE.find(t => t.id === selectedTrackId) || initialTrack, [selectedTrackId, initialTrack]);
    
    const [selectedTyre, setSelectedTyre] = useState<'Extra Soft' | 'Soft' | 'Medium' | 'Hard'>('Soft');
    const [riskClear, setRiskClear] = useState<number>(30);
    const [pitConditionLimit, setPitConditionLimit] = useState<number>(0);
    const [startFuelStr, setStartFuelStr] = useState<string>("80");
    const [pitRefuelStrategyStr, setPitRefuelStrategyStr] = useState<string>("140");
    
    const startFuel = Number(startFuelStr) || 0;
    const pitRefuelStrategy = Number(pitRefuelStrategyStr) || 0;

    // Opponents state
    const [customBots, setCustomBots] = useState<any[]>([
        { id: 'Bot A', basePace: 91.5, color: '#f59e0b' },
        { id: 'Bot B', basePace: 90.0, color: '#ef4444' }
    ]);
    const [newBotName, setNewBotName] = useState('');
    const [newBotPaceStr, setNewBotPaceStr] = useState('90');
    
    // Data stream for charts
    const [lapData, setLapData] = useState<any[]>([]);
    const [lapWindow, setLapWindow] = useState<number | 'Max'>('Max');
    
    // Continuous UI State mapped from physics simulation
    const [uiState, setUiState] = useState({
        status: 'Ready' as 'Ready' | 'Running' | 'Pitting' | 'Finished' | 'DNF',
        message: 'Configure parameters and press Start',
        lap: 0,
        lapProgress: 0,
        fuel: startFuel,
        tyreWear: 0,
        energy: 100,
        totalTime: 0,
        pits: 0,
        carWear: { chassis: 0, engine: 0, frontWing: 0, rearWing: 0, underbody: 0, sidepods: 0, cooling: 0, gearbox: 0, brakes: 0, suspension: 0, electronics: 0 } as Record<string, number>,
        distance: 0,
        logs: [] as string[]
    });

    // Refs for real-time calculation
    const rAF = useRef<number>();
    const lastTick = useRef<number>(0);
    
    const sim = useRef({
        isRunning: false,
        status: 'Ready' as 'Ready' | 'Running' | 'Pitting' | 'Finished' | 'DNF',
        message: '',
        lap: 0,
        lapProgress: 0,
        fuel: startFuel,
        tyreWear: 0,
        energy: 100,
        totalTime: 0,
        pits: 0,
        carWear: { chassis: 0, engine: 0, frontWing: 0, rearWing: 0, underbody: 0, sidepods: 0, cooling: 0, gearbox: 0, brakes: 0, suspension: 0, electronics: 0 } as Record<string, number>,
        distance: 0,
        logs: [] as string[],
        
        // Active lap targets
        targetLapTime: 90,
        lapFuelUsage: 0,
        lapWearIncrease: 0,
        pittingNext: false,
        pitTimer: 0, // Used to track time spent in pitlane simulation
        bots: [] as any[],
        playerMistakeTimer: 0,
        playerQueuePenalty: 0,
        playerOvertakeTimer: 0
    });

    const compoundMap: Record<string, TyreCompound> = {
       'Extra Soft': 'XS',
       'Soft': 'S',
       'Medium': 'M',
       'Hard': 'H',
       'Rain': 'Rain'
    };

    const calcParams: CalcParams = useMemo(() => ({
        track: activeTrack,
        weather: weather,
        player: { ...player, riskAggression: riskClear },
        weightPenaltyPerLiter: 0.035,
        pitRefuelRate: 12.0,
        driverWeight: (player as any).weight || 80
    }), [activeTrack, weather, player, riskClear]);

    const estimatedCarWear = useMemo(() => calculateRaceCarWear(calcParams), [calcParams]);

    useEffect(() => {
        resetSim();
        return () => {
             if (rAF.current) cancelAnimationFrame(rAF.current);
        };
    }, []);

    // Push state changes to React only occasionally so UI stays responsive
    const updateUIState = () => {
        setUiState({ ...sim.current, carWear: { ...sim.current.carWear } });
    };

    const resetSim = () => {
        const bots = customBots.map((b, i) => ({
            id: b.id,
            progress: 0,
            lap: 0,
            basePace: b.basePace,
            color: b.color || ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'][i % 5],
            status: 'Running'
        }));
        
        sim.current = {
            isRunning: false,
            status: 'Ready',
            message: 'Ready to race.',
            lap: 0,
            lapProgress: 0,
            fuel: startFuel,
            tyreWear: 0,
            tyreTemp: 90, // Initial tyre temperature
            trackEvo: 0,  // Initial track evolution (grip)
            energy: 100,
            totalTime: 0,
            pits: 0,
            carWear: { ...(player.carParts || { chassis: 0, engine: 0, frontWing: 0, rearWing: 0, underbody: 0, sidepods: 0, cooling: 0, gearbox: 0, brakes: 0, suspension: 0, electronics: 0 }) },
            distance: 0,
            logs: [] as string[],
            targetLapTime: 90,
            lapFuelUsage: 0,
            lapWearIncrease: 0,
            pittingNext: false,
            pitTimer: 0,
            bots,
            playerMistakeTimer: 0,
            playerQueuePenalty: 0,
            playerOvertakeTimer: 0
        };
        setIsRunning(false);
        setLapData([]);
        updateUIState();
        if (rAF.current) cancelAnimationFrame(rAF.current);
    };

    const calculateLapTargets = (s: typeof sim.current) => {
        const compound: TyreCompound = compoundMap[selectedTyre] || 'S';
        s.lapFuelUsage = calculateFuelPerLap(calcParams);
        s.lapWearIncrease = calculateWearPerLap(compound, calcParams, weather.rainProps.q1);
        
        const paceDiff = compound === 'XS' ? 0 : compound === 'S' ? 0.5 : compound === 'M' ? 1.2 : 2.0;
        const tyreDegSpeedPenalty = Math.pow(Math.max(0, s.tyreWear) / 100, 2) * 5.0; 
        const fuelWeightPenalty = s.fuel * calcParams.weightPenaltyPerLiter; 
        const riskReward = - (riskClear / 100) * 1.5;
        const energyPenalty = s.energy < 20 ? (20 - s.energy) * 0.1 : 0;
        
        s.targetLapTime = 90 + paceDiff + tyreDegSpeedPenalty + fuelWeightPenalty + riskReward + energyPenalty + (Math.random() * 0.2);
        
        // In GPRO, if fuel drops to 0 right at the finish line, you complete the lap and enter pits.
        const fuelNext = s.fuel - s.lapFuelUsage;
        if (fuelNext < -0.5) { // Meaning we ran out of fuel mid-lap
            s.targetLapTime += 40; // Huge crawl penalty
        }
        
        const conditionNext = 100 - (s.tyreWear + s.lapWearIncrease);
        const limitHit = pitConditionLimit > 0 && conditionNext <= pitConditionLimit;
        s.pittingNext = fuelNext <= 0 || limitHit;
    };

    const handleSimTick = (timestamp: number) => {
        if (!lastTick.current) lastTick.current = timestamp;
        const dt = timestamp - lastTick.current; // Real delta-time in ms
        lastTick.current = timestamp;

        const s = sim.current;

        if (s.isRunning && s.status === 'Running') {
            // Apply speed multiplier to real elapsed time to get virtual milliseconds passed this frame
            const virtualMs = dt * speedMultiplierRef.current;
            const virtualSecs = virtualMs / 1000;
            
            s.totalTime += virtualSecs;
            
            // Track Evolution (Grip increases over time)
            if (s.trackEvo < 100) s.trackEvo += virtualSecs * 0.05;
            
            // Tyre Temperature
            // Base temp seeks weather temp + 60, pushing aggression increases it.
            const targetTemp = weather.tempMax + 60 + (player.riskAggression * 0.2);
            s.tyreTemp += (targetTemp - s.tyreTemp) * 0.01 * virtualSecs;

            // Player traffic/mistake mechanics
            let dynamicLapTime = s.targetLapTime - (s.trackEvo * 0.01); // Track evolution makes you faster by up to 1 second
            
            // Check for malfunctional parts > 90%
            Object.keys(s.carWear).forEach(part => {
                 const key = part as keyof typeof estimatedCarWear;
                 // 90'ı geçince bozulma şansı
                 if (s.carWear[key] > 90 && Math.random() < 0.0001) {
                      s.playerMistakeTimer = 2.0;
                      s.logs.unshift(`[Lap ${s.lap}] ⚠️ ${(key as string).toUpperCase()} malfunction! Losing pace.`);
                 }
            });

            if (s.playerMistakeTimer > 0) {
               s.playerMistakeTimer -= virtualSecs;
               dynamicLapTime += 5; // drastically slow down during mistake
            } else if (Math.random() < ((player.risks?.clear || 30) / 50000)) { 
               // Randomly trigger mistake based on Clear track risk
               s.playerMistakeTimer = 1.0 + (Math.random() * 2); // 1-3 seconds mistake
               s.logs.unshift(`[Lap ${s.lap}] ⚠️ Big mistake! Slid out, losing time.`);
            }

            s.playerQueuePenalty = 0;
            // Bots logic
            s.bots.forEach((b: any) => {
                if(b.status === 'Running') {
                    // check distance to player (in meters roughly)
                    const playerTotal = s.lap + s.lapProgress;
                    const botTotal = b.lap + b.progress;
                    // distanceDiff > 0 means player is ahead. < 0 means bot is ahead.
                    const distanceDiff = (playerTotal - botTotal) * activeTrack.distance * 1000;
                    
                    let bPace = b.basePace;
                    // basic queue penalty for bot
                    if (distanceDiff > -20 && distanceDiff < 0) {
                        bPace += 1.5; // Bot stuck behind player
                    }
                    
                    // player stuck behind bot (0 to 20 meters behind)
                    if (distanceDiff < 0 && distanceDiff > -20) {
                       s.playerQueuePenalty = 1;
                       dynamicLapTime += 1.0; // Queue penalty (kuyruk cezası)
                       if (Math.random() < ((player.risks?.overtake || 30) / 10000)) {
                           s.logs.unshift(`[Lap ${s.lap}] 🏎️ Overtook Driver ${b.id}!`);
                           b.progress -= 0.005; // Bot loses time being overtaken
                           s.playerMistakeTimer = -0.5; // Quick burst
                       }
                    }

                    b.progress += virtualSecs / bPace;
                    if (b.progress >= 1) {
                        b.lap += 1;
                        b.progress = 0;
                        if (b.lap >= activeTrack.laps) b.status = 'Finished';
                    }
                }
            });

            // Advance lap progress (targetLapTime is in seconds)
            s.lapProgress += virtualSecs / dynamicLapTime;

            // Handle end-of-lap
            if (s.lapProgress >= 1) {
                s.lap += 1;
                s.lapProgress = 0;
                
                // Finalize consumptions
                s.fuel -= s.lapFuelUsage;
                s.tyreWear += s.lapWearIncrease;
                
                // Finalize Energy Drain
                const avgTemp = (weather.tempBase + weather.tempMax) / 2;
                const tempStrain = Math.max(0, avgTemp - 20) * 0.05;
                const staminaBonus = player.driverStamina * 0.002;
                s.energy -= Math.max(0.1, 1.0 + tempStrain + (riskClear * 0.01) - staminaBonus);
                
                // Finalize Car Wear
                let dnfPart: string | null = null;
                const distanceRatio = 1 / activeTrack.laps;
                Object.keys(s.carWear).forEach(part => {
                     const key = part as keyof typeof estimatedCarWear;
                     s.carWear[key] += estimatedCarWear[key] * distanceRatio;
                     if (s.carWear[key] >= 100 && !dnfPart) dnfPart = key as string;
                });
                
                // Boundaries Check
                if (s.energy < 0) s.energy = 0;
                
                // Push Lap Data
                setLapData(prev => [...prev, {
                    lap: s.lap,
                    lapTime: parseFloat(s.targetLapTime.toFixed(3)),
                    fuel: Math.max(0, parseFloat(s.fuel.toFixed(1))),
                    tyreWear: Math.min(100, parseFloat(s.tyreWear.toFixed(1))),
                    energy: parseFloat(s.energy.toFixed(1)),
                    pitted: s.pittingNext && s.lap < activeTrack.laps
                }]);

                // Evaluate Checkered Flag or DNF
                if (dnfPart) {
                    s.status = 'DNF';
                    s.message = `DNF: ${dnfPart.toUpperCase()} Failure!`;
                    s.logs.unshift(`[Lap ${s.lap}] 💥 DNF due to catastrophic ${dnfPart} failure.`);
                    s.isRunning = false;
                } else if (s.tyreWear >= 100) {
                    s.tyreWear = 100;
                    s.status = 'DNF';
                    s.message = 'DNF: Tyre Puncture!';
                    s.logs.unshift(`[Lap ${s.lap}] 💥 DNF: Tyre Puncture! Strategy pushed too far.`);
                    s.isRunning = false;
                } else if (s.lap >= activeTrack.laps) {
                    s.status = 'Finished';
                    const h = Math.floor(s.totalTime / 3600);
                    const m = Math.floor((s.totalTime % 3600) / 60);
                    s.message = `Finished: ${h > 0 ? h + 'h ' : ''}${m}m ${(s.totalTime % 60).toFixed(3)}s`;
                    s.logs.unshift(`🏁 Checkered Flag! Finished in ${h > 0 ? h + 'h ' : ''}${m}m ${(s.totalTime % 60).toFixed(3)}s. (${s.pits} pits)`);
                    s.isRunning = false;
                } else if (s.pittingNext || s.fuel <= 0) {
                    if (s.fuel <= 0) {
                        s.fuel = 0; // Prevent negative fuel showing if they rolled into pit empty
                        s.logs.unshift(`[Lap ${s.lap}] ⛽ Fuel empty! Crawling into the pitlane.`);
                    }
                    s.status = 'Pitting';
                    s.message = `Pit Stop!`;
                    s.logs.unshift(`[Lap ${s.lap}] 🔧 Entered Pitlane. Tyre condition was ${(100 - s.tyreWear).toFixed(1)}%.`);
                    s.pitTimer = activeTrack.pitTimeBase + ((pitRefuelStrategy - Math.max(0, s.fuel)) / calcParams.pitRefuelRate);
                } else {
                    // Calculate next lap normally
                    calculateLapTargets(s);
                    s.message = `Running Lap ${s.lap + 1}...`;
                }
            }
        } else if (s.isRunning && s.status === 'Pitting') {
            const virtualMs = dt * speedMultiplierRef.current;
            const virtualSecs = virtualMs / 1000;
            
            s.totalTime += virtualSecs;
            s.pitTimer -= virtualSecs;
            
            if (s.pitTimer <= 0) {
                // Return to track
                s.status = 'Running';
                s.pits += 1;
                s.tyreWear = 0;
                s.fuel = pitRefuelStrategy;
                s.logs.unshift(`[Lap ${s.lap}] 🟢 Exited Pitlane. New ${selectedTyre} tyres, refuelled to ${s.fuel}L.`);
                calculateLapTargets(s);
                s.message = `Running Lap ${s.lap + 1}...`;
            }
        }
        
        updateUIState();

        if (s.isRunning || s.status === 'Running' || s.status === 'Pitting') {
            rAF.current = requestAnimationFrame(handleSimTick);
        } else {
            setIsRunning(false);
        }
    };

    const toggleSim = () => {
        if (!isRunning && sim.current.status !== 'Finished' && sim.current.status !== 'DNF') {
            setIsRunning(true);
            sim.current.isRunning = true;
            if (sim.current.lap === 0) {
                sim.current.status = 'Running';
                sim.current.message = `Running Lap 1...`;
                sim.current.logs.unshift(`🟢 Race Started at ${activeTrack.name}! Temp: ${weather.tempBase}°C. Strategy: ${selectedTyre} tyres, ${sim.current.fuel}L fuel.`);
                calculateLapTargets(sim.current);
            }
            lastTick.current = performance.now();
            rAF.current = requestAnimationFrame(handleSimTick);
        } else if (isRunning) {
            setIsRunning(false);
            sim.current.isRunning = false;
            sim.current.logs.unshift(`⏸️ Simulation paused on Lap ${uiState.lap}.`);
            if (rAF.current) cancelAnimationFrame(rAF.current);
        }
    };

    // Derived Display values based on progress
    const displayTyreWear = Math.min(100, uiState.tyreWear + (sim.current.lapWearIncrease * uiState.lapProgress));
    const displayFuel = Math.max(0, uiState.fuel - (sim.current.lapFuelUsage * uiState.lapProgress));
    
    // Risk buttons configuration
    const riskPresets = [
        { label: 'Safe', val: 10 },
        { label: 'Normal', val: 30 },
        { label: 'Push', val: 60 },
        { label: 'Attack', val: 95 }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                        <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    </button>
                    <div>
                        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                           <Activity className="w-6 h-6 text-indigo-500" /> Lab Simulator <span className="px-2 py-0.5 text-[10px] bg-indigo-100 text-indigo-600 font-bold uppercase rounded-md tracking-wider">Live</span>
                        </h2>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                            <p className="text-sm text-slate-500 dark:text-slate-400">Run laps continuously. Adjust parameters mid-race to see effects instantly.</p>
                            <span className="text-[10px] bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 px-2 py-0.5 rounded-full font-bold">⚠️ Early Development Phase: Free to use for now, but may be restricted later.</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 {/* SETTINGS PANEL */}
                 <div className="lg:col-span-1 space-y-6">
                     <div className="bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-sm">
                         <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-4">Parameters</h3>
                         
                         <div className="space-y-5">
                             <div>
                                 <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-xs font-bold text-slate-500 uppercase">Track Select</label>
                                    <button 
                                      onClick={() => { setSelectedTrackId(initialTrack.id); resetSim(); }}
                                      disabled={isRunning || uiState.lap > 0 || selectedTrackId === initialTrack.id}
                                      className="text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded font-bold transition disabled:opacity-50"
                                    >
                                        Takvimden Çek
                                    </button>
                                 </div>
                                 <select value={selectedTrackId} onChange={(e) => { setSelectedTrackId(e.target.value); resetSim(); }} disabled={isRunning || uiState.lap > 0} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 dark:text-slate-200 cursor-pointer disabled:opacity-50">
                                     {TRACK_DATABASE.map(t => (
                                         <option key={t.id} value={t.id}>{t.name} ({t.laps} Laps)</option>
                                     ))}
                                 </select>
                             </div>

                             <div>
                                 <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Tyre Compound</label>
                                 <select value={selectedTyre} onChange={(e) => setSelectedTyre(e.target.value as any)} disabled={isRunning || uiState.lap > 0} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 dark:text-slate-200 cursor-pointer disabled:opacity-50">
                                     <option value="Extra Soft">Extra Soft (XS)</option>
                                     <option value="Soft">Soft (S)</option>
                                     <option value="Medium">Medium (M)</option>
                                     <option value="Hard">Hard (H)</option>
                                 </select>
                             </div>
                             
                             <div>
                                 <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center uppercase">
                                    Risk Aggression
                                    <InfoTooltip text="Higher risk improves lap pace but drains fuel, degrades tyres, and wears car parts faster." />
                                 </label>
                                 <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-full">
                                    {riskPresets.map(preset => (
                                        <button 
                                            key={preset.val} 
                                            onClick={() => setRiskClear(preset.val)} 
                                            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${riskClear === preset.val ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                        >
                                            {preset.label}
                                        </button>
                                    ))}
                                 </div>
                             </div>

                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                     <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center uppercase">
                                        Start Fuel (L)
                                        <InfoTooltip text="Starting fuel payload. Heavier cars are slower and wear tyres more." />
                                     </label>
                                     <input type="text" inputMode="decimal" value={startFuelStr} onChange={e => { setStartFuelStr(e.target.value); if (uiState.lap === 0 && !isNaN(Number(e.target.value))) setUiState(u => ({...u, fuel: Number(e.target.value)})); }} className="text-slate-800 dark:text-slate-100 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-bold disabled:opacity-50" disabled={isRunning || uiState.lap > 0} />
                                </div>
                                <div>
                                     <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center uppercase">
                                        Pit Target (L)
                                        <InfoTooltip text="Refill fuel payload to this amount whenever hitting the pit lane." />
                                     </label>
                                     <input type="text" inputMode="decimal" value={pitRefuelStrategyStr} onChange={e => setPitRefuelStrategyStr(e.target.value)} className="text-slate-800 dark:text-slate-100 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-bold" disabled={isRunning} />
                                </div>
                             </div>

                             <div>
                                 <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center justify-between uppercase">
                                     <span className="flex items-center">Condition Limit <InfoTooltip text="Forces a pit stop if tyre condition drops below this percentage." /></span>
                                     <span className="font-mono text-indigo-500">{pitConditionLimit === 0 ? "OFF" : `${pitConditionLimit}%`}</span>
                                 </label>
                                 <input type="range" min="0" max="100" step="5" value={pitConditionLimit} onChange={e => setPitConditionLimit(parseInt(e.target.value))} className="w-full accent-indigo-500" disabled={isRunning} />
                             </div>
                             
                             <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                 <div className="text-xs font-bold text-slate-500 uppercase flex items-center">
                                    Sim Speed
                                    <InfoTooltip text="1x equals real-time (e.g. 90s per lap). Use higher values to fast-forward." />
                                 </div>
                                 <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 gap-0.5 overflow-x-auto">
                                    {[1, 5, 10, 20, 50, 100, 200, 500].map(s => (
                                        <button key={s} onClick={() => setSpeedMultiplier(s)} className={`px-2 py-1 flex-shrink-0 text-[10px] font-bold rounded-md ${speedMultiplier === s ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600/50'}`}>{s}x</button>
                                    ))}
                                 </div>
                             </div>

                             <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                <label className="text-xs font-bold text-slate-500 uppercase flex items-center mb-2">
                                    Opponents (Bots)
                                    <InfoTooltip text="Add custom opponents with specific static lap paces. E.g. A pace of 90 means they try to run 1m30s laps, minus traffic." />
                                </label>
                                <div className="space-y-2 mb-3">
                                    {customBots.map((bot, i) => (
                                        <div key={i} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/80 p-2 rounded border border-slate-100 dark:border-slate-700">
                                            <div className="flex items-center gap-2">
                                                 <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: bot.color }}></div>
                                                 <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{bot.id}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                 <span className="text-xs font-mono text-slate-500">{bot.basePace.toFixed(2)}s pace</span>
                                                 <button onClick={() => setCustomBots(customBots.filter((_, idx) => idx !== i))} disabled={isRunning || uiState.lap > 0} className="text-red-400 hover:text-red-600 font-bold px-1 disabled:opacity-30">×</button>
                                            </div>
                                        </div>
                                    ))}
                                    {customBots.length === 0 && <p className="text-xs text-slate-400 italic text-center py-2">No opponents. You are racing alone.</p>}
                                </div>
                                <div className="flex gap-2">
                                    <input type="text" placeholder="Name" value={newBotName} onChange={e=>setNewBotName(e.target.value)} disabled={isRunning || uiState.lap > 0} className="text-slate-800 dark:text-slate-100 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 text-xs font-bold" />
                                    <input type="text" placeholder="Pace (s)" value={newBotPaceStr} onChange={e=>setNewBotPaceStr(e.target.value)} disabled={isRunning || uiState.lap > 0} className="text-slate-800 dark:text-slate-100 w-20 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 text-xs font-mono font-bold text-center" />
                                    <button 
                                        onClick={() => {
                                            if (newBotName.trim() && !isNaN(Number(newBotPaceStr))) {
                                                setCustomBots([...customBots, { id: newBotName.trim(), basePace: Number(newBotPaceStr), color: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'][customBots.length % 5] }]);
                                                setNewBotName('');
                                            }
                                        }}
                                        disabled={isRunning || uiState.lap > 0}
                                        className="bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-400 px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50"
                                    >Add</button>
                                </div>
                             </div>
                             
                             <div className="flex gap-2">
                                <button onClick={toggleSim} className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-white transition-all transform active:scale-[0.98] ${isRunning ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20' : uiState.status === 'Finished' || uiState.status === 'DNF' ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'} shadow-md`} disabled={uiState.status === 'Finished' || uiState.status === 'DNF'}>
                                   {isRunning ? <><Pause className="w-4 h-4"/> PAUSE</> : <><Play className="w-4 h-4"/> {uiState.lap > 0 ? 'RESUME' : 'START'}</>}
                                </button>
                                <button onClick={resetSim} className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition" title="Reset Simulation">
                                   <RotateCcw className="w-5 h-5" />
                                </button>
                             </div>
                         </div>
                     </div>
                 </div>

                 {/* LIVE VIEW PANEL */}
                 <div className="lg:col-span-2 space-y-6">
                     <div className="bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-sm">
                         
                         {/* SVG CONTINUOUS TRACK VIEW */}
                         <TrackVisualizer simRef={sim} />
                         
                         <div className="mt-6 flex flex-col md:flex-row gap-6">
                             <div className="flex-1">
                                 <div className="text-xs font-bold uppercase tracking-widest mb-1 text-slate-500">Live Status</div>
                                 <div className={`text-xl font-bold font-mono tracking-tight ${uiState.status === 'DNF' ? 'text-red-500' : uiState.status === 'Finished' ? 'text-green-500' : 'text-slate-800 dark:text-slate-100'}`}>
                                     {uiState.message}
                                 </div>
                                 
                                 <div className="mt-5 grid grid-cols-2 lg:grid-cols-6 gap-4">
                                     <div>
                                         <div className="text-[10px] font-bold uppercase text-slate-500 mb-1">Lap</div>
                                         <div className="font-mono text-lg font-bold text-slate-800 dark:text-slate-100 flex items-baseline gap-1">
                                            {uiState.lap} <span className="text-xs text-slate-400">/ {activeTrack.laps}</span>
                                         </div>
                                     </div>
                                     <div>
                                         <div className="text-[10px] font-bold uppercase text-slate-500 mb-1">Tyre Condition</div>
                                         <div className="font-mono text-lg font-bold text-slate-800 dark:text-slate-100">{Math.max(0, 100 - displayTyreWear).toFixed(1)}%</div>
                                     </div>
                                     <div>
                                         <div className="text-[10px] font-bold uppercase text-slate-500 mb-1">Fuel Load</div>
                                         <div className="font-mono text-lg font-bold text-slate-800 dark:text-slate-100">{displayFuel.toFixed(1)} L</div>
                                     </div>
                                     <div>
                                         <div className="text-[10px] font-bold uppercase text-slate-500 mb-1">Pits</div>
                                         <div className="font-mono text-lg font-bold text-slate-800 dark:text-slate-100">{uiState.pits}</div>
                                     </div>
                                     <div>
                                         <div className="text-[10px] font-bold uppercase text-slate-500 mb-1">Tyre Temp</div>
                                         <div className={`font-mono text-lg font-bold flex items-baseline gap-1 ${uiState.tyreTemp && uiState.tyreTemp > 105 ? 'text-orange-500' : 'text-slate-800 dark:text-slate-100'}`}>
                                            {uiState.tyreTemp ? uiState.tyreTemp.toFixed(1) : '90.0'}<span className="text-xs">°C</span>
                                         </div>
                                     </div>
                                     <div>
                                         <div className="text-[10px] font-bold uppercase text-slate-500 mb-1">Track Grip</div>
                                         <div className="font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                            {uiState.trackEvo ? uiState.trackEvo.toFixed(0) : '0'}%
                                         </div>
                                     </div>
                                 </div>
                             </div>
                             
                             <div className="w-[300px] bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden hidden xl:flex">
                                 <div className="bg-slate-200/50 dark:bg-slate-800/80 px-3 py-2 border-b border-slate-200 dark:border-slate-700/80 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                     Race Data Logs
                                 </div>
                                 <div className="flex-1 overflow-y-auto p-3 space-y-2 h-40">
                                     {uiState.logs?.length === 0 && <div className="text-xs text-slate-400 dark:text-slate-600 font-mono italic">Waiting for events...</div>}
                                     {uiState.logs?.map((msg, idx) => (
                                         <div key={idx} className="text-[11px] font-mono text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 pb-1.5 last:border-0">{msg}</div>
                                     ))}
                                 </div>
                             </div>

                             <div className="min-w-[200px] bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 hidden lg:block">
                                 <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center justify-between">
                                     <span>Est. Race Car Wear</span>
                                     <Activity className="w-3.5 h-3.5 text-indigo-400" />
                                 </div>
                                 <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs font-mono">
                                     {Object.entries(estimatedCarWear).slice(0, 8).map(([part, wear]) => (
                                         <div key={part} className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                                             <span className="capitalize">{part.replace(/([A-Z])/g, ' $1').trim()}</span>
                                             <span className={`font-bold ${uiState.carWear[part] > 75 ? 'text-red-500' : uiState.carWear[part] > 50 ? 'text-orange-500' : 'text-slate-700 dark:text-slate-200'}`}>
                                                {uiState.carWear[part].toFixed(1)}%
                                             </span>
                                         </div>
                                     ))}
                                 </div>
                             </div>
                         </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-inner h-24 mb-2 flex items-center justify-center relative overflow-hidden md:col-span-2">
                             {/* Simple conceptual race track loop visualization */}
                             <div className="absolute inset-0 opacity-20 pointer-events-none">
                                 <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="w-full h-full">
                                    <path d="M 50,50 L 950,50" stroke="#fff" strokeWidth="2" strokeDasharray="10 10" />
                                 </svg>
                             </div>
                             
                             <div className="w-full max-w-4xl px-8 relative z-10">
                                 <div className="text-xs uppercase font-bold text-slate-500 mb-2 flex justify-between">
                                     <span className="text-emerald-400">START</span>
                                     <span className="text-slate-400 text-[10px]">Lap {uiState.lap} Progress</span>
                                     <span className="text-indigo-400">FINISH</span>
                                 </div>
                                 <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full border border-slate-300 dark:border-slate-700 relative overflow-visible">
                                      {/* The ball */}
                                      <div 
                                        className="absolute top-1/2 -ml-3 -mt-3 w-6 h-6 bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.6)] flex items-center justify-center border-2 border-white transition-all duration-[50ms]"
                                        style={{ left: `${Math.min(100, Math.max(0, uiState.lapProgress * 100))}%` }}
                                      >
                                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                                      </div>
                                 </div>
                             </div>
                         </div>

                         <div className="bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-sm h-64">
                             <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-widest">Lap Time Trace</h3>
                                <div className="flex gap-0.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                                   {[5, 10, 20, 30, 50, 100, 'Max'].map(w => (
                                      <button key={w} onClick={() => setLapWindow(w as any)} className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition ${lapWindow === w ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-slate-200' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>{w}</button>
                                   ))}
                                </div>
                             </div>
                             <ResponsiveContainer width="100%" height="100%" className="-ml-3 pb-4">
                                <AreaChart data={lapWindow === 'Max' ? lapData : lapData.slice(-(lapWindow as number))} syncId="simCharts">
                                    <defs>
                                      <linearGradient id="colorLap" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                      </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                                    <XAxis dataKey="lap" hide />
                                    <YAxis yAxisId="left" domain={['dataMin - 1', 'dataMax + 1']} stroke="#94a3b8" fontSize={10} width={35} />
                                    <RechartsTooltip 
                                       contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                       itemStyle={{ color: '#0f172a', fontWeight: 'bold', fontSize: '12px' }}
                                       labelStyle={{ color: '#64748b', fontWeight: 'bold', fontSize: '10px' }}
                                    />
                                    <Area yAxisId="left" type="monotone" dataKey="lapTime" stroke="#6366f1" fillOpacity={1} fill="url(#colorLap)" strokeWidth={2} isAnimationActive={false} />
                                </AreaChart>
                             </ResponsiveContainer>
                         </div>
                         
                         <div className="bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-sm h-64">
                              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-4">Tyre Condition %</h3>
                              <ResponsiveContainer width="100%" height="100%" className="pb-4">
                                 <AreaChart data={lapWindow === 'Max' ? lapData : lapData.slice(-(lapWindow as number))} syncId="simCharts">
                                     <defs>
                                       <linearGradient id="colorWear" x1="0" y1="0" x2="0" y2="1">
                                         <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                                         <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                       </linearGradient>
                                     </defs>
                                     <XAxis dataKey="lap" hide />
                                     <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={10} width={25} />
                                     <RechartsTooltip />
                                     <Area type="monotone" dataKey={(d: any) => Math.max(0, 100 - d.tyreWear)} stroke="#22c55e" fillOpacity={1} fill="url(#colorWear)" strokeWidth={2} isAnimationActive={false} />
                                 </AreaChart>
                              </ResponsiveContainer>
                          </div>
                     </div>
                 </div>
            </div>
        </div>
    );
}
