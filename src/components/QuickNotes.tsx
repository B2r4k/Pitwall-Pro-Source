import React, { useState, useEffect } from "react";
import { BookOpen, X, Save, Bookmark, Map, Goal } from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { User } from "firebase/auth";
import { t } from "../i18n";

export default function QuickNotes({
  currentUser,
}: {
  currentUser: User | null;
}) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState<{
    general: string;
    track: string;
    strategy: string;
  }>({ general: "", track: "", strategy: "" });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "track" | "strategy">(
    "general",
  );

  useEffect(() => {
    if (!currentUser) return;
    getDoc(doc(db, "notes", currentUser.uid))
      .then((d) => {
        if (d.exists()) {
          const data = d.data();
          setNotes({
            general: data.general || data.text || "", // fallback to old text field
            track: data.track || "",
            strategy: data.strategy || "",
          });
        }
      })
      .catch((e) => console.error("QuickNotes load err", e));
  }, [currentUser]);

  const saveNotes = async () => {
    if (!currentUser) return;
    setLoading(true);
    await setDoc(
      doc(db, "notes", currentUser.uid),
      { ...notes },
      { merge: true },
    );
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-5 py-4 shadow-lg flex items-center justify-center animate-in zoom-in-95 transition-all z-50 group hover:pr-6"
      >
        <BookOpen className="w-6 h-6 mr-0 group-hover:mr-2 transition-all" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 font-bold text-sm">
          {t("Knowledge Pool")}
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 md:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl rounded-2xl p-0 flex flex-col z-50 animate-in slide-in-from-bottom-5 overflow-hidden">
      <div className="bg-slate-50 dark:bg-slate-800 p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-500" />
          {t("Knowledge Pool")}
        </h3>
        <button
          onClick={() => setOpen(false)}
          className="text-slate-400 hover:text-slate-600 p-1 bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-700 rounded-full transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 overflow-x-auto">
        <button
          onClick={() => setActiveTab("general")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold transition ${activeTab === "general" ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"}`}
        >
          <Bookmark className="w-3 h-3" /> {t("General")}
        </button>
        <button
          onClick={() => setActiveTab("track")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold transition ${activeTab === "track" ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"}`}
        >
          <Map className="w-3 h-3" /> {t("Track Notes")}
        </button>
        <button
          onClick={() => setActiveTab("strategy")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold transition ${activeTab === "strategy" ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"}`}
        >
          <Goal className="w-3 h-3" /> {t("Strategy")}
        </button>
      </div>

      <div className="p-4">
        <textarea
          value={notes[activeTab]}
          onChange={(e) => setNotes({ ...notes, [activeTab]: e.target.value })}
          placeholder={
            activeTab === "track"
              ? t("Notes about track conditions, tyre wear patterns...")
              : activeTab === "strategy"
                ? t("Saved strategy setups and fuel estimations...")
                : t("General setups, random thoughts...")
          }
          className="w-full h-48 resize-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none custom-scrollbar"
        />
        {currentUser ? (
          <button
            onClick={saveNotes}
            disabled={loading}
            className="w-full mt-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition shadow-sm border border-indigo-100 dark:border-indigo-800"
          >
            <Save className="w-4 h-4" />
            {saved ? t("Saved!") : t("Save Data")}
          </button>
        ) : (
          <p className="mt-3 text-xs text-red-500 text-center font-bold">
            {t("Please log in")}
          </p>
        )}
      </div>
    </div>
  );
}
