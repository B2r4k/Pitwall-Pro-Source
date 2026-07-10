import fs from 'fs';

let c = fs.readFileSync('src/components/ChecklistView.tsx', 'utf-8');

// Add goToTab to props
c = c.replace(/interface Props \{[\s\S]*?currentUser: any;\n\}/, "interface Props {\n  currentUser: any;\n  goToTab: (tab: string) => void;\n}");
c = c.replace(/export default function ChecklistView\(\{ currentUser \}: Props\) \{/, "export default function ChecklistView({ currentUser, goToTab }: Props) {");

// Add route field to items
const oldInitialItems = `const initialItems = [
  { id: 'weather', text: 'Check weather forecast for Q and R', done: false },
  { id: 'setup', text: 'Adjust car setup for current temperature', done: false },
  { id: 'driver', text: 'Set driver risk/aggression', done: false },
  { id: 'fuel', text: 'Calculate and set starting fuel', done: false },
  { id: 'tyre', text: 'Choose starting tyre compound', done: false },
  { id: 'strategy', text: 'Confirm pit strategy (stints/laps)', done: false },
  { id: 'rain', text: 'Check and configure secondary strategy for rain', done: false },
  { id: 'parts', text: 'Verify part wear and replace if necessary', done: false },
  { id: 'test', text: 'Double check test lap data', done: false }
];`;

const newInitialItems = `const initialItems = [
  { id: 'weather', text: 'Check weather forecast for Q and R', done: false, tab: 'track_setup' },
  { id: 'setup', text: 'Adjust car setup for current temperature', done: false, tab: 'track_setup' },
  { id: 'driver', text: 'Set driver risk/aggression', done: false, tab: 'track_setup' },
  { id: 'test', text: 'Double check test lap data', done: false, tab: 'calibration' },
  { id: 'fuel', text: 'Calculate and set starting fuel', done: false, tab: 'calibration' },
  { id: 'strategy', text: 'Confirm pit strategy (stints/laps)', done: false, tab: 'strategy' },
  { id: 'tyre', text: 'Choose starting tyre compound', done: false, tab: 'strategy' },
  { id: 'rain', text: 'Check and configure secondary strategy for rain', done: false, tab: 'strategy' },
  { id: 'parts', text: 'Verify part wear and replace if necessary', done: false, tab: 'track_setup' }
];`;

c = c.replace(oldInitialItems, newInitialItems);

const checkTarget = /<div \n\s*key=\{idx\} \n\s*onClick=\{[\s\S]*?<span className=\{`text-sm font-medium \$\{item\.done \? 'text-slate-500 line-through dark:text-slate-400' : 'text-slate-700 dark:text-slate-200'\}[\s\S]*?<\/span>\n\s*<\/div>/;

const newChecklistUI = `<div 
            key={idx} 
            className={\`flex items-center gap-3 p-3 rounded-xl border transition-all \${item.done ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/50' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500/50'}\`}
          >
            <div 
               onClick={() => toggle(idx)} 
               className="p-1 -m-1 cursor-pointer hover:scale-110 transition-transform"
            >
               {item.done ? (
                 <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0" />
               ) : (
                 <Circle className="w-6 h-6 text-slate-300 dark:text-slate-600 flex-shrink-0 hover:text-indigo-400 transition-colors" />
               )}
            </div>
            <div 
               onClick={() => goToTab(item.tab || 'track_setup')}
               className={\`flex-1 ml-1 cursor-pointer text-sm font-medium transition-colors \${item.done ? 'text-slate-500 line-through dark:text-slate-400' : 'text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400'}\`}
            >
              {t(item.text)}
            </div>
          </div>`;

c = c.replace(checkTarget, newChecklistUI);

// Wait, the user asked for a simple checklist rule-based Chatbot!
// "Birde o checklist kısmınâ yarış için asistan koy... kullanıcıya yardım etsin"
const assistantUI = `
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
`;
c = c.replace(/<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*$/g, assistantUI + "</div>\n</div>\n</div>\n");

fs.writeFileSync('src/components/ChecklistView.tsx', c);
