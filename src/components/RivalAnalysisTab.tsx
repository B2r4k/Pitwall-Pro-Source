import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Users,
  Plus,
  Trash2,
  Crosshair,
  ChevronRight,
  AlertTriangle,
  ShieldAlert,
  Sparkles,
  Loader2,
} from "lucide-react";
import Tooltip from "./Tooltip";

export interface Rival {
  id: string;
  name: string;
  qualyPace: string;
  tyreChoice: string;
  pitStops: string;
  weakness: string;
}

interface RivalAnalysisTabProps {
  t: (k: string) => string;
  settings: any;
  setLocalSettings: (s: any) => void;
  player?: any;
  track?: any;
  weather?: any;
}

export default function RivalAnalysisTab({
  t,
  settings,
  setLocalSettings,
  player,
  track,
  weather,
}: RivalAnalysisTabProps) {
  const rival: Rival | null = settings.rival || null;

  const setRival = (r: Rival | null) => {
    setLocalSettings({ ...settings, rival: r });
  };

  const addOpponent = () => {
    setRival({
      id: Date.now().toString(),
      name: "",
      qualyPace: "0",
      tyreChoice: "Softs",
      pitStops: "2",
      weakness: "High Wear",
    });
  };

  const updateOpponent = (field: keyof Rival, value: string) => {
    if (rival) {
      setRival({ ...rival, [field]: value });
    }
  };

  const removeOpponent = () => {
    setRival(null);
  };

  const getRecommendation = (o: Rival) => {
    let recs = [];
    if (
      o.tyreChoice.includes("Softs") ||
      o.tyreChoice.includes("Super Softs") ||
      o.tyreChoice.includes("Pipirelli")
    ) {
      recs.push(
        t(
          "They are on soft/fast rubber. Expect early pit stops. You can try to overcut them with harder tyres.",
        ),
      );
    }
    if (o.pitStops === "1") {
      recs.push(
        t(
          "1-stop strategy means they will be heavy on fuel and careful with tyres. Push hard early to pass them.",
        ),
      );
    }
    if (o.qualyPace.startsWith("-") || Number(o.qualyPace) < 0) {
      recs.push(
        t(
          "Qualified ahead. If their tyre is softer, defend early. If harder, try an undercut.",
        ),
      );
    }
    if (o.weakness.includes("Wear") || o.weakness.includes("Aggressive")) {
      recs.push(
        t(
          "Aggressive driver or high wear. Let them ruin their tyres, attack at the end of the stint.",
        ),
      );
    }
    if (recs.length === 0)
      recs.push(t("Standard strategy. Just focus on your own optimal pace."));
    if (o.pitStops === "4+")
      recs.push(
        t(
          "Extreme multi-stop strategy detected. They will be very fast but spend a lot of time in pits. Focus on consistency.",
        ),
      );
    return recs;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm min-h-[60vh] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 flex items-center gap-2 tracking-tight">
            <Users className="text-purple-500 w-6 h-6" /> {t("Rival Analysis")}
          </h2>
        </div>
        {!rival && (
          <button
            onClick={addOpponent}
            className="bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400 px-4 py-2 rounded-lg font-bold text-sm hover:bg-purple-200 dark:hover:bg-purple-900/60 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> {t("Add Opponent")}
          </button>
        )}
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        {t(
          "Track your main rivals' pace, tyre choices, and expected strategies to find openings.",
        )}
      </p>

      {!rival ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
          <Crosshair className="w-12 h-12 mb-3 opacity-20" />
          <p>{t("No opponents added yet.")}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div
            key={rival.id}
            className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 md:p-5 bg-slate-50/50 dark:bg-slate-800/20 relative group"
          >
            <button
              onClick={() => removeOpponent()}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition opacity-0 group-hover:opacity-100 focus:opacity-100"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
              <div className="lg:col-span-1 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700 pb-4 md:pb-0 md:pr-4 flex flex-col justify-center">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                  {t("Name")}
                </label>
                <input
                  type="text"
                  value={rival.name}
                  onChange={(e) => updateOpponent("name", e.target.value)}
                  placeholder="Opponent Name"
                  className="w-full bg-transparent border-b-2 border-slate-300 dark:border-slate-600 focus:border-purple-500 dark:focus:border-purple-400 outline-none px-1 py-1 text-lg font-bold text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                  {t("Quali Diff")}
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    step="0.100"
                    value={rival.qualyPace}
                    onChange={(e) =>
                      updateOpponent("qualyPace", e.target.value)
                    }
                    className="text-slate-800 dark:text-slate-100 w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-sm font-mono focus:ring-1 focus:ring-purple-500"
                    placeholder="+0.000"
                  />
                  <span className="ml-2 text-xs text-slate-400">sec</span>
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                  {t("Tyre Choice")}
                </label>
                <select
                  value={rival.tyreChoice}
                  onChange={(e) => updateOpponent("tyreChoice", e.target.value)}
                  className="text-slate-800 dark:text-slate-100 w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-sm focus:ring-1 focus:ring-purple-500 font-medium"
                >
                  <option value="Extra Softs">{t("Extra Softs")}</option>
                  <option value="Softs">{t("Softs")}</option>
                  <option value="Mediums">{t("Mediums")}</option>
                  <option value="Hards">{t("Hards")}</option>
                  <option value="Rain">{t("Rain")}</option>
                  <option value="Unknown">{t("Unknown")}</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                  {t("Est. Pits")}
                </label>
                <select
                  value={rival.pitStops}
                  onChange={(e) => updateOpponent("pitStops", e.target.value)}
                  className="text-slate-800 dark:text-slate-100 w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-sm focus:ring-1 focus:ring-purple-500 font-medium"
                >
                  <option value="1">1 Stop</option>
                  <option value="2">2 Stops</option>
                  <option value="3">3 Stops</option>
                  <option value="4+">4+ Stops</option>
                  <option value="Unknown">{t("Unknown")}</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                  {t("Profile")}
                </label>
                <select
                  value={rival.weakness}
                  onChange={(e) => updateOpponent("weakness", e.target.value)}
                  className="text-slate-800 dark:text-slate-100 w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-sm focus:ring-1 focus:ring-purple-500 font-medium"
                >
                  <option value="Balanced">{t("Balanced")}</option>
                  <option value="High Wear">{t("High Tyre Wear")}</option>
                  <option value="Aggressive">{t("Aggressive/Risky")}</option>
                  <option value="Consistent">{t("Very Consistent")}</option>
                  <option value="Slow Pits">{t("Slow Pit Stops")}</option>
                </select>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/30 p-4 rounded-xl flex flex-col gap-4 mt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-purple-600" />
                  <div className="text-sm font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wider">
                    {t("Tactical Assessment")}
                  </div>
                </div>
              </div>

              <ul className="space-y-1">
                {getRecommendation(rival).map((r, i) => (
                  <li
                    key={i}
                    className="text-sm text-purple-800 dark:text-purple-200 flex items-start gap-1.5 before:content-['•'] before:text-purple-400"
                  >
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
