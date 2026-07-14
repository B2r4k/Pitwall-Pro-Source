import React from "react";
import {
  CalcParams,
  calculateWearPerLap,
  calculateFuelPerLap,
} from "../utils/calculator";
import { TyreCompound } from "../types";
import {
  COMPOUND_PACE,
  COMPOUND_IDEAL_TEMP,
  COMPOUND_FULL_NAMES,
} from "../data";
import {
  Activity,
  Fuel,
  Navigation,
  ThermometerSun,
  AlertTriangle,
  ChevronsRight,
} from "lucide-react";
import { t } from "../i18n";

export default function TrackAnalysisView({ params }: { params: CalcParams }) {
  const fuelPerLap = calculateFuelPerLap(params);
  const totalLaps = params.track.laps;
  const totalFuelNeeded = fuelPerLap * totalLaps;

  const compounds: TyreCompound[] = ["XS", "S", "M", "H", "Rain"];

  const avgTemp = (params.weather.tempBase + params.weather.tempMax) / 2;

  return (
    <div className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-700/60 rounded-2xl p-5 xl:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-indigo-900 dark:text-indigo-400">
          <Activity className="w-5 h-5 text-indigo-500" /> Detailed Track & Tyre
          Analysis
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border dark:border-slate-700 border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Fuel className="w-4 h-4" /> Fuel Profile (
            {params.track.fuelSeverity})
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-end border-b border-slate-200 dark:border-slate-700 pb-2">
              <span className="text-slate-600 dark:text-slate-400">
                Consumption per Lap
              </span>
              <span className="text-xl font-mono text-indigo-700 font-bold">
                {fuelPerLap.toFixed(2)}{" "}
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Liters
                </span>
              </span>
            </div>
            <div className="flex justify-between items-end border-b border-slate-200 dark:border-slate-700 pb-2">
              <span className="text-slate-600 dark:text-slate-400">
                Full Race Requirement
                <br />
                <span className="text-xs text-slate-400">
                  (Without pit stop)
                </span>
              </span>
              <span className="text-xl font-mono text-indigo-700 font-bold">
                {totalFuelNeeded.toFixed(1)}{" "}
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Liters
                </span>
              </span>
            </div>
            <div className="flex justify-between items-end pb-1">
              <span className="text-slate-600 dark:text-slate-400">
                Weight Impact
                <br />
                <span className="text-xs text-slate-400">
                  ({params.weightPenaltyPerLiter}s/Tur)
                </span>
              </span>
              <span className="text-lg font-mono text-red-500 font-bold">
                +{(fuelPerLap * params.weightPenaltyPerLiter).toFixed(3)}s{" "}
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  per lap
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border dark:border-slate-700 border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <ThermometerSun className="w-4 h-4" /> Track Conditions
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-end border-b border-slate-200 dark:border-slate-700 pb-2">
              <span className="text-slate-600 dark:text-slate-400">
                Average Temp
              </span>
              <span className="text-xl font-mono font-bold text-orange-600">
                {avgTemp.toFixed(1)}°C
              </span>
            </div>
            <div className="flex justify-between items-end border-b border-slate-200 dark:border-slate-700 pb-2">
              <span className="text-slate-600 dark:text-slate-400">
                Wear Severity
              </span>
              <span className="text-lg font-bold text-slate-700 dark:text-slate-300">
                {params.track.wearSeverity}
              </span>
            </div>
            <div className="flex justify-between items-end pb-1">
              <span className="text-slate-600 dark:text-slate-400">
                Stress Modifier
                <br />
                <span className="text-xs text-slate-400">
                  Including driver and temp
                </span>
              </span>
              <span className="text-lg font-mono text-red-500 font-bold">
                {(() => {
                  // Check a sample compound for dynamic multiplier
                  const wRate = calculateWearPerLap("S", params);
                  // Just an arbitrary baseline compare for UI insight
                  return "~" + wRate.toFixed(1) + "%/Lap";
                })()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <h3 className="text-md font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
        <Navigation className="w-5 h-5 text-emerald-500" /> Compound Wear
        Projection
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm">
              <th className="py-3 px-4 font-semibold rounded-tl-lg">
                Compound
              </th>
              <th className="py-3 px-4 font-semibold">Ideal Temp</th>
              <th className="py-3 px-4 font-semibold">Est. Wear</th>
              <th className="py-3 px-4 font-semibold">Max Safe Laps</th>
              <th className="py-3 px-4 font-semibold">Pace Pen. (Base)</th>
              <th className="py-3 px-4 font-semibold rounded-tr-lg">Status</th>
            </tr>
          </thead>
          <tbody>
            {compounds.map((compound, idx) => {
              const wearPerLap = calculateWearPerLap(compound, params);
              const maxLaps = Math.floor(90 / wearPerLap);
              const idealTemp = COMPOUND_IDEAL_TEMP[compound];
              const isRain = compound === "Rain";

              let statusTag = (
                <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold">
                  SUITABLE
                </span>
              );
              if (maxLaps < 10)
                statusTag = (
                  <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">
                    {t("RISKY")}
                  </span>
                );
              else if (avgTemp > idealTemp + 5 && !isRain)
                statusTag = (
                  <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-bold">
                    TOO HOT
                  </span>
                );

              if (
                isRain &&
                params.weather.rainProps.q1 === 0 &&
                params.weather.rainProps.q2_r1 === 0 &&
                params.weather.rainProps.r2 === 0 &&
                params.weather.rainProps.r3 === 0 &&
                params.weather.rainProps.r4 === 0
              ) {
                statusTag = (
                  <span className="bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-1 rounded text-xs font-bold">
                    USELESS
                  </span>
                );
              }

              return (
                <tr
                  key={idx}
                  className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:bg-slate-800/50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="font-mono text-lg font-black flex items-center gap-2 text-slate-800 dark:text-slate-200">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          compound === "XS"
                            ? "bg-red-500"
                            : compound === "S"
                              ? "bg-yellow-400"
                              : compound === "M"
                                ? "bg-white dark:bg-slate-900 border-2 border-slate-300"
                                : compound === "H"
                                  ? "bg-slate-400"
                                  : "bg-blue-500"
                        }`}
                      ></div>
                      <span className="text-slate-400 font-medium text-sm mr-0.5">
                        |
                      </span>
                      {COMPOUND_FULL_NAMES[compound]}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    {idealTemp}°C
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                    {wearPerLap.toFixed(2)}%{" "}
                    <span className="font-sans text-xs font-normal text-slate-400">
                      /lap
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                    {maxLaps}{" "}
                    <span className="font-sans text-xs font-normal text-slate-400">
                      laps
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400">
                    +{COMPOUND_PACE[compound]}s
                  </td>
                  <td className="py-3 px-4">{statusTag}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-4 bg-blue-50 text-blue-800 rounded-xl text-sm flex gap-3 items-start">
        <AlertTriangle className="w-5 h-5 flex-shrink-0 text-blue-500 mt-0.5" />
        <p>
          Max safe laps are calculated off a 90% wear limit. Beyond that,
          puncturing is highly likely. If the average temperature sits above the
          compound's ideal temperature, wear scales exponentially.
        </p>
      </div>
    </div>
  );
}
