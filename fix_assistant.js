import fs from 'fs';

let c = fs.readFileSync('src/components/ChecklistView.tsx', 'utf-8');

const targetStr = `      </div>\n    </div>\n  );\n}`;

const assistantUI = `      </div>
      
      <div className="mt-8 p-5 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-2xl w-full">
         <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
            </div>
            <div>
               <h3 className="font-bold text-indigo-900 dark:text-indigo-300 leading-tight">Race Assistant</h3>
               <p className="text-xs text-indigo-700/80 dark:text-indigo-400/80">Need help preparing for the race?</p>
            </div>
         </div>
         
         <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-indigo-100/50 dark:border-indigo-800/50 text-sm font-medium text-slate-700 dark:text-slate-300">
            {items.every(i => i.done) ? (
               <p>All checks complete! Great job, your car setup and strategy are ready. Trust your analysis and good luck out there on the track!</p>
            ) : items.filter(i => i.done).length > 4 ? (
               <p>You're almost there. Double check your tyre strategy based on the track temperature. It often drops towards the end of the race!</p>
            ) : (
               <p>Welcome to race day! Start by configuring your <span className="text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline" onClick={() => goToTab('track_setup')}>Track Setup</span> to pull in the correct Track data, then check your <span className="text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline" onClick={() => goToTab('calibration')}>Calibration</span> limits.</p>
            )}
         </div>
      </div>
    </div>
  );
}`;

c = c.replace(targetStr, assistantUI);
if(c.includes("Race Assistant")) {
   fs.writeFileSync('src/components/ChecklistView.tsx', c);
   console.log("Success Assistant");
} else {
   console.log("Fail Assistant", c.substring(c.length - 200));
}
