import React, { useState, useEffect, useMemo } from 'react';
import { Send, CheckCircle, AlertTriangle, HelpCircle, Activity, LayoutGrid, Droplet, Settings } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { CalcParams, calculateFuelPerLap, calculateRaceCarWear, calculateWearPerLap } from '../utils/calculator';
import { TRACK_DATABASE } from '../data';
import Tooltip from './Tooltip';
import NumberInput from './NumberInput';
import { PlayerStats, Track, Weather, TyreCompound } from '../types';

interface Props {
  player?: PlayerStats;
  weather?: Weather;
  selectedTrackId?: string;
  constants?: { driverWeight: number, pitRefuelRate: number };
}

export default function TelemetryContributeView({ player, weather, selectedTrackId, constants }: Props) {
    const [submitting, setSubmitting] = useState(false);
    const [statusText, setStatusText] = useState('');

    // Toggles
    const [includeFuel, setIncludeFuel] = useState(true);
    const [includeTyres, setIncludeTyres] = useState(true);
    const [includeParts, setIncludeParts] = useState(true);

    // Form inputs
    const [form, setForm] = useState({
        trackId: 'australia',
        laps: 60,
        // Weather
        tempBase: 20, tempMax: 25, rainProb: 0,
        // Driver & Risks
        driverFocus: 250, driverStamina: 250, driverExperience: 0, driverWeight: 80,
        aggression: 20, clearRisk: 0, defendRisk: 0,
        // Car
        power: 20, handling: 20, acceleration: 20,
        baseFuelPerLap: 1.8,
        tyreSupplier: 'Pipirelli' as PlayerStats['tyreSupplier'],
        compound: 'Soft' as TyreCompound,

        // Outcomes
        outFuelUsed: 110,
        outTyreWear: 80,
        outPartsWearAvg: 12
    });

    const [validations, setValidations] = useState<{
        fuelMatch?: boolean; fuelDelta?: number; fuelExpected?: number;
        tyresMatch?: boolean; tyresDelta?: number; tyresExpected?: number;
        partsMatch?: boolean; partsDelta?: number; partsExpected?: number;
        unknownFactor?: number;
        fatalError?: string;
    }>({});

    const selectedTrack = useMemo(() => TRACK_DATABASE.find(t => t.id === form.trackId) || TRACK_DATABASE[0], [form.trackId]);

    // Validation logic (Automatic)
    useEffect(() => {
        // Construct mock definitions to feed calculator
        const mockPlayer: PlayerStats = {
            baseWearMultiplier: 1.0,
            driverFocus: form.driverFocus, driverStamina: form.driverStamina, driverExperience: form.driverExperience,
            riskAggression: form.aggression,
            baseFuelPerLap: form.baseFuelPerLap,
            tyreSupplier: form.tyreSupplier,
            pha: { power: form.power, handling: form.handling, acceleration: form.acceleration },
            risks: { clear: form.clearRisk, defend: form.defendRisk, overtake: 0, malfunction: 0 }
        };

        const mockWeather: Weather = {
            tempBase: form.tempBase, tempMax: form.tempMax,
            rainProps: { q1:0, q2_r1: form.rainProb, r2:form.rainProb, r3:form.rainProb, r4:form.rainProb }
        };

        const calcParams: CalcParams = {
            track: selectedTrack,
            weather: mockWeather,
            player: mockPlayer,
            driverWeight: form.driverWeight,
            weightPenaltyPerLiter: 0.03,
            pitRefuelRate: 14.5
        };

        let newValidations: any = {};
        let totalDeviation = 0;
        let applicableModules = 0;
        let hasFatalError = false;

        // Fuel Evaluation
        if (includeFuel) {
            const lapFuel = calculateFuelPerLap(calcParams);
            const expectedFuel = lapFuel * form.laps;
            const fuelDelta = form.outFuelUsed - expectedFuel;
            const errorMargin = Math.abs(fuelDelta / form.outFuelUsed);

            newValidations.fuelExpected = expectedFuel;
            newValidations.fuelDelta = fuelDelta;
            if (errorMargin > 0.4) {
               newValidations.fuelMatch = false;
               newValidations.fatalError = `Fuel disparity too high (Expected ${expectedFuel.toFixed(1)}L, Got ${form.outFuelUsed}L). Please check inputs.`;
               hasFatalError = true;
            } else {
               newValidations.fuelMatch = errorMargin <= 0.05; // 5% accepted
               totalDeviation += fuelDelta;
               applicableModules++;
            }
        }

        // Tyre Evaluation
        if (includeTyres) {
            const lapWear = calculateWearPerLap(form.compound, calcParams, form.rainProb);
            const expectedTyres = lapWear * form.laps;
            const tyreDelta = form.outTyreWear - expectedTyres;
            const errorMargin = Math.abs(tyreDelta / form.outTyreWear);

            newValidations.tyresExpected = expectedTyres;
            newValidations.tyresDelta = tyreDelta;
            if (!hasFatalError && errorMargin > 0.45) {
               newValidations.tyresMatch = false;
               newValidations.fatalError = `Tyre disparity too high (Expected ${expectedTyres.toFixed(1)}%, Got ${form.outTyreWear}%). Please check inputs.`;
               hasFatalError = true;
            } else {
               newValidations.tyresMatch = errorMargin <= 0.08; 
               totalDeviation += tyreDelta;
               applicableModules++;
            }
        }

        // Car Parts Evaluation
        if (includeParts) {
            const expectedWearObj = calculateRaceCarWear(calcParams);
            const expectedAvg = Object.values(expectedWearObj).reduce((a,b)=>a+b, 0) / 11;
            const partsDelta = form.outPartsWearAvg - expectedAvg;
            // Handle edge case where outPartsWearAvg is 0
            const errorMargin = form.outPartsWearAvg === 0 ? Math.abs(partsDelta) : Math.abs(partsDelta / form.outPartsWearAvg);

            newValidations.partsExpected = expectedAvg;
            newValidations.partsDelta = partsDelta;
            
            if (!hasFatalError && errorMargin > 0.6) {
               newValidations.partsMatch = false;
               newValidations.fatalError = `Parts wear disparity too high (Expected ${expectedAvg.toFixed(1)}%, Got ${form.outPartsWearAvg}%). Ensure this is for the FULL race.`;
               hasFatalError = true;
            } else {
               newValidations.partsMatch = errorMargin <= 0.15;
               totalDeviation += partsDelta;
               applicableModules++;
            }
        }

        if (!hasFatalError && applicableModules > 0) {
            newValidations.unknownFactor = Number((totalDeviation / applicableModules).toFixed(3));
        }

        setValidations(newValidations);

    }, [form, includeFuel, includeTyres, includeParts, selectedTrack]);

    const submitTelemetry = async () => {
        if (!includeFuel && !includeTyres && !includeParts) {
            setStatusText('Lütfen en az bir veri modülünü aktifleştirin.');
            return;
        }
        if (validations.fatalError) {
            setStatusText('Hata payı aşırı yüksek, veriler kaydedilmez.');
            return;
        }

        setSubmitting(true);
        setStatusText('Buluta gönderiliyor...');
        
        const payload = {
            timestamp: new Date().toISOString(),
            trackId: form.trackId,
            laps: form.laps,
            weather: { tempBase: form.tempBase, tempMax: form.tempMax, rainProb: form.rainProb },
            driver: { focus: form.driverFocus, stamina: form.driverStamina, exp: form.driverExperience, weight: form.driverWeight, aggression: form.aggression },
            car: { power: form.power, handling: form.handling, acceleration: form.acceleration },
            risks: { clear: form.clearRisk, defend: form.defendRisk },
            
            modules: {
                fuel: includeFuel ? { expected: validations.fuelExpected, actual: form.outFuelUsed, basePerLap: form.baseFuelPerLap } : null,
                tyre: includeTyres ? { expected: validations.tyresExpected, actual: form.outTyreWear, compound: form.compound, supplier: form.tyreSupplier } : null,
                parts: includeParts ? { expected: validations.partsExpected, actual: form.outPartsWearAvg } : null,
            },
            
            failedChecks: {
                fuel: includeFuel ? !validations.fuelMatch : false,
                tyres: includeTyres ? !validations.tyresMatch : false,
                parts: includeParts ? !validations.partsMatch : false
            },
            
            unknownFactor: validations.unknownFactor || 0
        };

        try {
            await addDoc(collection(db, 'telemetry_contributions'), payload);
            setStatusText('Verileriniz başarıyla kaydedildi! Geliştirmeye desteğiniz için teşekkürler.');
            setTimeout(() => setStatusText(''), 5000);
        } catch (error) {
            console.error(error);
            setStatusText('Hata oluştu. Bağlantınızı kontrol edin.');
        }
        setSubmitting(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-gradient-to-r from-indigo-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10"><Activity className="w-32 h-32" /></div>
                <h2 className="text-2xl font-black mb-2 relative z-10">Geliştirmeye Destek (Telemetry)</h2>
                <p className="text-indigo-200 text-sm max-w-xl relative z-10 leading-relaxed">
                    Yarış gerçeklerinden elde ettiğiniz verileri girerek simülasyon kodlarımızı kalibre etmemize yardımcı olabilirsiniz. Sadece bildiğiniz verileri aktif edip giriniz.
                </p>
            </div>

            <div className="flex gap-4 mb-4">
               <label className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition ${includeTyres ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-700/50 dark:text-indigo-300' : 'bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700'}`}>
                  <input type="checkbox" checked={includeTyres} onChange={e => setIncludeTyres(e.target.checked)} className="rounded text-indigo-600" />
                  <span className="font-bold text-sm flex items-center gap-2">Lastik Verisi</span>
               </label>
               <label className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition ${includeFuel ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-700/50 dark:text-indigo-300' : 'bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700'}`}>
                  <input type="checkbox" checked={includeFuel} onChange={e => setIncludeFuel(e.target.checked)} className="rounded text-indigo-600" />
                  <span className="font-bold text-sm flex items-center gap-2"><Droplet className="w-4 h-4"/> Yakıt Verisi</span>
               </label>
               <label className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition ${includeParts ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-700/50 dark:text-indigo-300' : 'bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700'}`}>
                  <input type="checkbox" checked={includeParts} onChange={e => setIncludeParts(e.target.checked)} className="rounded text-indigo-600" />
                  <span className="font-bold text-sm flex items-center gap-2"><Settings className="w-4 h-4"/> Araç Aşınması</span>
               </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                    <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                        <h3 className="text-indigo-900 dark:text-indigo-400 font-bold flex items-center gap-2">
                            🏁 Parametreler
                        </h3>
                        {player && (
                            <button 
                                onClick={() => {
                                    setForm(prev => {
                                        let newForm = { ...prev };
                                        if (selectedTrackId) newForm.trackId = selectedTrackId;
                                        if (weather) {
                                            newForm.tempBase = weather.tempBase || prev.tempBase;
                                            newForm.tempMax = weather.tempMax || prev.tempMax;
                                            newForm.rainProb = weather.rainProps?.r2 || prev.rainProb;
                                        }
                                        if (player) {
                                            newForm.driverFocus = player.driverFocus || prev.driverFocus;
                                            newForm.driverStamina = player.driverStamina || prev.driverStamina;
                                            newForm.driverExperience = player.driverExperience || prev.driverExperience;
                                            newForm.driverWeight = constants?.driverWeight || prev.driverWeight;
                                            newForm.aggression = player.riskAggression || prev.aggression;
                                            if (player.risks) {
                                                newForm.clearRisk = player.risks.clear || prev.clearRisk;
                                                newForm.defendRisk = player.risks.defend || prev.defendRisk;
                                            }
                                            newForm.power = player.carPower || prev.power;
                                            newForm.handling = player.carHandling || prev.handling;
                                            newForm.acceleration = player.carAcceleration || prev.acceleration;
                                            newForm.tyreSupplier = player.tyreSupplier || prev.tyreSupplier;
                                            
                                            if (player.testingData && player.testingData.length > 0) {
                                                const lap = player.testingData[0];
                                                if (lap.tyres) {
                                                    const tl = lap.tyres.toLowerCase();
                                                    if (tl.includes('soft')) newForm.compound = 'Soft';
                                                    if (tl.includes('medium')) newForm.compound = 'Medium';
                                                    if (tl.includes('hard')) newForm.compound = 'Hard';
                                                    if (tl.includes('rain')) newForm.compound = 'Rain';
                                                    if (tl.includes('extra')) newForm.compound = 'ExtraSoft';
                                                }
                                                if (lap.laps) newForm.laps = parseInt(lap.laps) || prev.laps;
                                                if (lap.tyresCond !== undefined) newForm.outTyreWear = Number((100 - parseFloat(lap.tyresCond)).toFixed(2));
                                                if (lap.fuelCond !== undefined) newForm.outFuelUsed = Number((100 - parseFloat(lap.fuelCond)).toFixed(2));
                                            }
                                        }
                                        return newForm;
                                    });
                                }}
                                className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 transition flex items-center gap-1"
                            >
                                <Settings className="w-3.5 h-3.5" /> API Verisiyle Doldur
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-slate-500 mb-1">Pist</label>
                            <select value={form.trackId} onChange={e => setForm({...form, trackId: e.target.value})} className="text-slate-800 dark:text-slate-100 w-full p-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm">
                                {TRACK_DATABASE.map(t => <option key={t.id} value={t.id}>{t.name} (Yakıt: {t.fuelSeverity}, Aşınma: {t.wearSeverity})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Tur Sayısı (Stint/Yarış)</label>
                            <NumberInput value={form.laps} onChange={v => setForm({...form, laps: v})} className="w-full p-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg" />
                        </div>
                        
                        {includeFuel && (
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Base Yakıt (Örn: 1.8)</label>
                                <input type="number" step="0.01" value={form.baseFuelPerLap} onChange={e => setForm({...form, baseFuelPerLap: Number(e.target.value)})} className="text-slate-800 dark:text-slate-100 w-full p-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg" />
                            </div>
                        )}

                        <div className="col-span-2 pt-2 border-t border-slate-100 dark:border-slate-800 mt-2">
                            <label className="block text-xs font-bold text-slate-500 mb-1">Hava & Riskler</label>
                            <div className="grid grid-cols-4 gap-2">
                               <div><label className="block text-[10px] text-slate-400">Min Temp</label><NumberInput value={form.tempBase} onChange={v => setForm({...form, tempBase: v})} className="w-full p-1 border border-slate-200 dark:border-slate-700 rounded"/></div>
                               <div><label className="block text-[10px] text-slate-400">Max Temp</label><NumberInput value={form.tempMax} onChange={v => setForm({...form, tempMax: v})} className="w-full p-1 border border-slate-200 dark:border-slate-700 rounded"/></div>
                               <div><label className="block text-[10px] text-slate-400">Açık Risk</label><NumberInput value={form.clearRisk} onChange={v => setForm({...form, clearRisk: v})} className="w-full p-1 border border-slate-200 dark:border-slate-700 rounded"/></div>
                               <div><label className="block text-[10px] text-slate-400">CT/Aggress.</label><NumberInput value={form.aggression} onChange={v => setForm({...form, aggression: v})} className="w-full p-1 border border-slate-200 dark:border-slate-700 rounded"/></div>
                            </div>
                        </div>

                        {(includeParts || includeFuel) && (
                            <div className="col-span-2 mt-2">
                                <label className="block text-xs font-bold text-slate-500 mb-1">Araç: Hızlanma / Güç / Yol Tutuş</label>
                                <div className="grid grid-cols-3 gap-2">
                                   <NumberInput value={form.acceleration} onChange={v => setForm({...form, acceleration: v})} className="w-full p-1 border border-slate-200 dark:border-slate-700 rounded text-center"/>
                                   <NumberInput value={form.power} onChange={v => setForm({...form, power: v})} className="w-full p-1 border border-slate-200 dark:border-slate-700 rounded text-center"/>
                                   <NumberInput value={form.handling} onChange={v => setForm({...form, handling: v})} className="w-full p-1 border border-slate-200 dark:border-slate-700 rounded text-center"/>
                                </div>
                            </div>
                        )}

                        {includeTyres && (
                            <div className="col-span-2 grid grid-cols-2 gap-2 mt-2">
                                <div>
                                    <label className="block text-[10px] text-slate-400">Compound</label>
                                    <select value={form.compound} onChange={e => setForm({...form, compound: e.target.value as any})} className="w-full p-1 border border-slate-200 dark:border-slate-700 rounded bg-transparent">
                                        <option value="Extra Soft">Extra Soft</option><option value="Soft">Soft</option><option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option><option value="Rain">Rain</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] text-slate-400">Supplier</label>
                                    <select value={form.tyreSupplier} onChange={e => setForm({...form, tyreSupplier: e.target.value as any})} className="w-full p-1 border border-slate-200 dark:border-slate-700 rounded bg-transparent">
                                        <option value="Pipirelli">Pipirelli</option><option value="Avonn">Avonn</option><option value="Michelin">Michelin</option>
                                        <option value="Bridgestone">Bridgestone</option><option value="Contimental">Contimental</option><option value="Dunnolop">Dunnolop</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                    <h3 className="text-emerald-700 dark:text-emerald-500 font-bold mb-4 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                        📊 Sonuçlar (Çıktılar)
                    </h3>
                    
                    <div className="space-y-4">
                        {includeTyres && (
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Nihai Lastik Aşınması (%)</label>
                                <NumberInput value={form.outTyreWear} onChange={v => setForm({...form, outTyreWear: v})} className="w-full p-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg" />
                            </div>
                        )}
                        {includeFuel && (
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Harcanan Yakıt (Litre)</label>
                                <NumberInput value={form.outFuelUsed} onChange={v => setForm({...form, outFuelUsed: v})} className="w-full p-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg" />
                            </div>
                        )}
                        {includeParts && (
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">Ortalama Parça Aşınması (%) <Tooltip content="Tüm parçaların ortalama aşınma yüzdesi"/></label>
                                <NumberInput value={form.outPartsWearAvg} onChange={v => setForm({...form, outPartsWearAvg: v})} className="w-full p-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg" />
                            </div>
                        )}
                    </div>
                    
                    <div className="mt-8 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                        {validations.fatalError ? (
                            <div className="text-red-600 bg-red-50 dark:bg-red-900/30 p-3 rounded-lg flex items-start gap-2 text-sm border border-red-200 dark:border-red-900/50">
                                <AlertTriangle className="w-5 h-5 shrink-0" />
                                <div>
                                    <p className="font-bold">Otomatik Doğrulama Reddedildi</p>
                                    <p className="text-xs opacity-90">{validations.fatalError}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2 text-sm">
                                {includeFuel && (
                                   <div className={`flex justify-between items-center ${validations.fuelMatch ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-500'}`}>
                                      <span className="flex items-center gap-1.5"><Droplet className="w-4 h-4"/> Yakıt Uyum: {validations.fuelMatch ? 'Başarılı' : 'Hatalı (Göz ardı edildi)'}</span>
                                      <span className="text-xs font-mono">Beklenen: {validations.fuelExpected?.toFixed(1)}L</span>
                                   </div>
                                )}
                                {includeTyres && (
                                   <div className={`flex justify-between items-center ${validations.tyresMatch ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-500'}`}>
                                      <span className="flex items-center gap-1.5"><Activity className="w-4 h-4"/> Lastik Uyum: {validations.tyresMatch ? 'Başarılı' : 'Hatalı (Göz ardı edildi)'}</span>
                                      <span className="text-xs font-mono">Beklenen: {validations.tyresExpected?.toFixed(1)}%</span>
                                   </div>
                                )}
                                {includeParts && (
                                   <div className={`flex justify-between items-center ${validations.partsMatch ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-500'}`}>
                                      <span className="flex items-center gap-1.5"><Settings className="w-4 h-4"/> Parça Uyum: {validations.partsMatch ? 'Başarılı' : 'Hatalı (Göz ardı edildi)'}</span>
                                      <span className="text-xs font-mono">Beklenen: {validations.partsExpected?.toFixed(1)}%</span>
                                   </div>
                                )}
                                
                                <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-700">
                                    <div className="flex justify-between items-center">
                                       <span className="font-bold text-slate-600 dark:text-slate-400">Bilinmeyen Değişken (Hata Payı)</span>
                                       <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{(validations.unknownFactor || 0) > 0 ? '+' : ''}{(validations.unknownFactor || 0).toFixed(2)}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight mt-1">
                                        Modüller arası makul farkların ortalaması. Simülasyonumuzdaki eksik çarpanı temsil eder.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            <div className="flex flex-col items-center justify-center p-6 bg-indigo-50/50 dark:bg-slate-900 rounded-2xl border border-indigo-100 dark:border-slate-800">
                <button 
                    onClick={submitTelemetry} 
                    disabled={submitting || !!validations.fatalError || (!includeFuel && !includeTyres && !includeParts)}
                    className="flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                >
                    <Send className="w-5 h-5" /> Buluta Gönder (Paket)
                </button>
                {statusText && <p className="mt-3 text-sm font-bold text-indigo-800 dark:text-indigo-400">{statusText}</p>}
                {validations.fatalError && <p className="mt-2 text-xs text-red-500 font-bold">Kayıt için hataları düzeltin veya hatalı modülü kapatın.</p>}
            </div>
        </div>
    );
}
