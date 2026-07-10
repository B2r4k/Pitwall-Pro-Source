import fs from 'fs';
let c = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Add timer logic
const useStatesLoc = `  // Inputs State`;
const useStatesNew = `  // Timer States
  const [nextRaceName, setNextRaceName] = useState<string>('');
  const [nextRaceTime, setNextRaceTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number } | null>(null);

  useEffect(() => {
    // Fetch Next Race info
    fetch('https://api.jolpi.ca/ergast/f1/current/next.json')
      .then(res => res.json())
      .then(data => {
         const race = data.MRData.RaceTable.Races[0];
         if (race) {
            setNextRaceName(race.raceName);
            const raceDate = new Date(\`\${race.date}T\${race.time || '15:00:00Z'}\`);
            setNextRaceTime(raceDate.getTime());
         }
      })
      .catch(err => console.error("Could not fetch next race:", err));
  }, []);

  useEffect(() => {
    if (!nextRaceTime) return;
    const interval = setInterval(() => {
       const now = Date.now();
       const diff = nextRaceTime - now;
       if (diff <= 0) {
          setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
          return;
       }
       setTimeLeft({
          d: Math.floor(diff / (1000 * 60 * 60 * 24)),
          h: Math.floor((diff / (1000 * 60 * 60)) % 24),
          m: Math.floor((diff / 1000 / 60) % 60),
          s: Math.floor((diff / 1000) % 60)
       });
    }, 1000);
    return () => clearInterval(interval);
  }, [nextRaceTime]);

  // Inputs State`;

c = c.replace(useStatesLoc, useStatesNew);

// 2. Wrap strings in t() for the UI
// Look for "Fetch liand calendar..." => t("Fetch liand calendar...") but it's "Fetching liand calendar..."
c = c.replace(/'Fetching liand calendar\.\.\.'/g, "t('Fetching liand calendar...')");
c = c.replace(/🌐 Fetch Liand Calendar/g, "🌐 {t('Fetch F1 Calendar')}");
c = c.replace(/Track Selection/g, "{t('Track Selection')}");
c = c.replace(/Total Race Laps:/g, "{t('Total Race Laps:')}");

// And let's add the Race Timer UI somewhere, maybe the Dashboard Overview (Home tab)
// Or just globally under the App title. Let's put it on top of the generic dashboard views.
const titleLoc = `<div className="flex justify-between items-center bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-800 p-4 sticky top-0 z-40 transition-colors">`;
const titleNew = `<div className="flex flex-col sm:flex-row justify-between items-center sm:items-start bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-800 p-4 sticky top-0 z-40 transition-colors gap-3">
            {timeLeft && (
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 border dark:border-slate-700 rounded-lg px-3 py-1.5 shadow-sm text-xs font-mono absolute top-2 right-2 sm:right-6 sm:top-[1.2rem] hidden md:flex">
                 <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                 <span className="font-bold text-slate-800 dark:text-slate-200">{nextRaceName} In:</span>
                 <span className="text-red-600 font-bold">{timeLeft.d}d {timeLeft.h.toString().padStart(2,'0')}h {timeLeft.m.toString().padStart(2,'0')}m {timeLeft.s.toString().padStart(2,'0')}s</span>
              </div>
            )}`;

c = c.replace(titleLoc, titleNew);

fs.writeFileSync('src/App.tsx', c);
