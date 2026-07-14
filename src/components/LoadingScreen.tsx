import React, { useState, useEffect } from "react";
import { Zap } from "lucide-react";
import { t } from "../i18n";

const LOADING_MESSAGES = [
  "Warming up the tyres...",
  "Cleaning the track...",
  "Washing the car...",
  "Building empires...",
  "Filling the fuel tank...",
  "Bribing the stewards...",
  "Analyzing telemetry data...",
  "Complaining on the team radio...",
  "Calculating optimum pit strategies...",
  "Checking weather radars...",
  "Adjusting front wing angles...",
  "Preparing the pit crew...",
  "Installing new chassis...",
  "Reviewing track limits...",
  "Drinking energy drinks...",
  "Listening to the engine sound...",
  "Setting up the motorhome...",
  "Calibrating sensors...",
];

export const LoadingScreen: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 600); // Change very fast (0.6 seconds)
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`min-h-screen font-sans antialiased flex flex-col items-center justify-center p-4 transition-colors bg-slate-50 dark:bg-[#0a0f1c]`}
    >
      <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin mb-8"></div>

      <div className="bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800 p-6 rounded-2xl shadow-sm relative overflow-hidden group max-w-md w-full animate-fade-in">
        <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:bg-indigo-500/10 transition-all duration-700"></div>
        <div className="flex items-start gap-4 relative z-10">
          <div className="bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 p-3 rounded-xl shrink-0 mt-1 shadow-sm">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-indigo-950 dark:text-indigo-200 mb-1">
              {t("Initializing Workspace...")}
            </h3>
            <p className="text-indigo-800/80 dark:text-indigo-300/80 text-sm leading-relaxed">
              {t(LOADING_MESSAGES[messageIndex])}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
