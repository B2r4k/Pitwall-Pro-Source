import React, { useState, useMemo } from "react";
import { PlayerStats, Track } from "../types";
import {
  DollarSign,
  ShieldAlert,
  Zap,
  Banknote,
  Shield,
  Wrench,
  CircleDollarSign,
  AlertTriangle,
  Activity,
} from "lucide-react";
import { t } from "../i18n";
import { calculateRaceCarWear } from "../utils/calculator";

interface EconomyViewProps {
  player: PlayerStats;
  track?: Track; // Receive track data for the danger engine
}

export default function EconomyView({ player, track }: EconomyViewProps) {
  const LEAGUE_MULT: Record<string, number> = {
    Rookie: 1.0,
    Amateur: 1.5,
    Pro: 2.2,
    Master: 3.5,
    Elite: 5.0,
  };

  const currentMult = LEAGUE_MULT[player.league || "Rookie"] || 1.0;

  const [customSponsorIncome, setCustomSponsorIncome] = useState<string>(
    Math.floor(2000000 * currentMult).toString(),
  );
  const [localRisk, setLocalRisk] = useState<number>(player.riskAggression);

  const sponsorIncome = Number(customSponsorIncome) || 0;

  const partBaseCosts: Record<string, number> = {
    chassis: 400000,
    engine: 500000,
    frontWing: 250000,
    rearWing: 250000,
    underbody: 300000,
    sidepods: 200000,
    cooling: 250000,
    gearbox: 450000,
    brakes: 300000,
    suspension: 350000,
    electronics: 400000,
  };

  const getPartCost = (part: string, level: number) => {
    const base = partBaseCosts[part] || 300000;
    return Math.floor(base * Math.pow(level, 1.3) * currentMult);
  };

  const parts = player.carParts || {
    chassis: 1,
    engine: 1,
    frontWing: 1,
    rearWing: 1,
    underbody: 1,
    sidepods: 1,
    cooling: 1,
    gearbox: 1,
    brakes: 1,
    suspension: 1,
    electronics: 1,
  };

  // Engine integration
  const estimatedWearMap = useMemo(() => {
    // Mock track if none provided
    const calcTrack =
      track ||
      ({
        distance: 305,
        laps: 60,
        fuelSeverity: "Medium",
        wearSeverity: "Medium",
      } as Track);

    // Build a mock calc params
    // calculateRaceCarWear only needs params.player.riskAggression and params.track.distance
    const params = {
      track: calcTrack,
      player: { ...player, riskAggression: localRisk } as PlayerStats,
    } as any;

    return calculateRaceCarWear(params);
  }, [track, player, localRisk]);

  let totalCarValue = 0;
  let estimatedRepairCost = 0;
  Object.keys(parts).forEach((key) => {
    const cost = getPartCost(key, parts[key as keyof typeof parts]);
    totalCarValue += cost;
    // VERY rough assumption: 100% wear = full replace cost, so cost is roughly linear.
    const wear = estimatedWearMap[key as keyof typeof parts] || 0;
    estimatedRepairCost += Math.floor(cost * (wear / 100));
  });

  const raceBalancePreview = sponsorIncome - estimatedRepairCost;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-indigo-900 dark:text-indigo-400">
            <Banknote className="w-5 h-5 text-emerald-500" />{" "}
            {t("Financial Overview")}
          </h2>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 w-full sm:w-auto">
              <span className="text-[10px] sm:text-sm font-bold text-slate-500 flex items-center gap-1.5 whitespace-nowrap uppercase tracking-wider">
                <Activity className="w-3.5 h-3.5 text-orange-500" /> Risk:{" "}
                {localRisk}
              </span>
              <input
                type="range"
                min="0"
                max="100"
                value={localRisk}
                onChange={(e) => setLocalRisk(Number(e.target.value))}
                className="w-24 sm:w-32 accent-orange-500"
              />
            </div>
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 w-full sm:w-auto">
              <span className="text-sm font-bold text-slate-500 flex items-center gap-1.5 whitespace-nowrap">
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Income
              </span>
              <input
                type="text"
                inputMode="numeric"
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 sm:px-3 sm:py-1.5 text-sm font-mono text-emerald-600 dark:text-emerald-400 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 w-24 sm:w-32"
                value={customSponsorIncome}
                onChange={(e) => setCustomSponsorIncome(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 p-4 opacity-10">
              <CircleDollarSign className="w-16 h-16" />
            </div>
            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-bold mb-2 flex items-center gap-1">
              <CircleDollarSign className="w-4 h-4" />{" "}
              {t("Estimated Car Value")}
            </p>
            <h3 className="text-3xl font-black text-emerald-700 dark:text-emerald-300 tracking-tight">
              ${totalCarValue.toLocaleString()}
            </h3>
          </div>

          <div className="p-5 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 rounded-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 p-4 opacity-10">
              <Wrench className="w-16 h-16" />
            </div>
            <p className="text-sm text-orange-600 dark:text-orange-400 font-bold mb-2 flex items-center gap-1">
              <Wrench className="w-4 h-4" /> {t("Estimated Repair Cost")}
            </p>
            <h3 className="text-3xl font-black text-orange-700 dark:text-orange-300 tracking-tight">
              -${estimatedRepairCost.toLocaleString()}
            </h3>
          </div>

          <div className="p-5 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 p-4 opacity-10">
              <Zap className="w-16 h-16" />
            </div>
            <p className="text-sm text-indigo-600 dark:text-indigo-400 font-bold mb-2 flex items-center gap-1">
              <Zap className="w-4 h-4" /> {t("Net Balance Preview")}
            </p>
            <h3
              className={`text-3xl tracking-tight font-black ${raceBalancePreview >= 0 ? "text-indigo-700 dark:text-indigo-300" : "text-red-600"}`}
            >
              {raceBalancePreview >= 0 ? "+" : ""}$
              {raceBalancePreview.toLocaleString()}
            </h3>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold">{t("Detailed Part Analysis")}</h3>
            {!track && (
              <p className="text-[10px] sm:text-xs text-orange-500 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Warning: Select a track in
                the Dashboard for accurate wear.
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.keys(parts).map((partKey) => {
              const lvl = parts[partKey as keyof typeof parts];
              const cost = getPartCost(partKey, lvl);
              const estWear =
                estimatedWearMap[partKey as keyof typeof parts] || 0;

              return (
                <div
                  key={partKey}
                  className="flex flex-col p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 transition hover:border-indigo-300 dark:hover:border-indigo-700 shadow-sm relative overflow-hidden group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="capitalize font-bold text-slate-800 dark:text-slate-200 block mb-0.5">
                        {t(partKey.replace(/([A-Z])/g, " $1").trim())}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border dark:border-slate-700 text-slate-500 shadow-sm">
                        Level {lvl}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase text-slate-400 font-bold block">
                        {t("Replace Cost")}
                      </span>
                      <span className="block text-slate-900 dark:text-white font-mono font-bold">
                        $
                        {(cost / 1000).toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })}
                        k
                      </span>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-500">
                        {t("Est. Race Wear")}
                      </span>
                      <span
                        className={`text-xs font-bold font-mono ${estWear > 90 ? "text-red-500" : "text-slate-600 dark:text-slate-300"}`}
                      >
                        {estWear}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden relative">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${estWear >= 90 ? "bg-red-500" : estWear >= 70 ? "bg-orange-500" : "bg-emerald-500"}`}
                          style={{ width: `${Math.min(100, estWear)}%` }}
                        />
                        {/* Danger marker */}
                        <div
                          className="absolute top-0 bottom-0 left-[90%] w-0.5 bg-red-600/50 z-10"
                          title="90% Danger Threshold"
                        ></div>
                      </div>
                    </div>
                    {estWear >= 90 && (
                      <p className="text-[10px] text-red-500 font-bold mt-2 flex items-center gap-1 animate-pulse">
                        <AlertTriangle className="w-3 h-3" /> DNF Risk: High.
                        Upgrade or dial down aggression.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-emerald-600 dark:text-emerald-400">
          <ShieldAlert className="w-5 h-5" /> {t("Economy AI Insight")}
        </h3>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
          {t(
            "Managing economy in GPRO requires balancing car wear with sponsor income. As a",
          )}{" "}
          <strong className="text-slate-900 dark:text-white">
            {player.league || "Rookie"}
          </strong>{" "}
          {t("driver, your current setup incurs an estimated")}{" "}
          <strong className="text-orange-500">
            ${estimatedRepairCost.toLocaleString()}
          </strong>{" "}
          {t("in wear costs. With an income of")}{" "}
          <strong className="text-emerald-500">
            ${sponsorIncome.toLocaleString()}
          </strong>
          , {t("your net delta is")}{" "}
          <strong
            className={
              raceBalancePreview >= 0 ? "text-emerald-500" : "text-red-500"
            }
          >
            ${raceBalancePreview.toLocaleString()}
          </strong>
          .
        </p>
        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg">
          <ul className="list-disc pl-5 text-sm space-y-2 text-indigo-700 dark:text-indigo-200">
            <li>
              {t("Lower your risk aggression by 10 points to save roughly")}{" "}
              <strong className="font-mono">
                ~${Math.floor(totalCarValue * 0.02).toLocaleString()}
              </strong>{" "}
              {t("in repair costs.")}
            </li>
            <li>
              {t(
                "High Chassis and Suspension reduce tire wear, potentially saving a pit stop worth ~24 seconds. Evaluate if this time covers the",
              )}{" "}
              <strong className="font-mono">
                $
                {(
                  getPartCost("chassis", parts.chassis) +
                  getPartCost("suspension", parts.suspension)
                ).toLocaleString()}
              </strong>{" "}
              {t("investment.")}
            </li>
            <li>
              {raceBalancePreview < 0
                ? t(
                    "🚨 CRITICAL: You are running at a loss. Downgrade engine or gearbox immediately if not fighting for promotion.",
                  )
                : t(
                    "✅ HEALTHY: Your economy is stable. Reinvest surplus into driver training or high-impact parts.",
                  )}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
