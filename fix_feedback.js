import fs from 'fs';
let c = fs.readFileSync('src/App.tsx', 'utf-8');

const anchor = `{appView === 'settings' && (`;
const replacement = `
               {appView === 'settings' && (
                  <>
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border dark:border-slate-700 border-slate-200 shadow-sm flex flex-col gap-6 relative">
`;

// wait, safer to replace `{appView === 'settings' && (` directly but it might be tricky. Let's do a string replace on the exact settings div.
const exactSettingsDiv = `{appView === 'settings' && (
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border dark:border-slate-700 border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-6">`;

const newSettingsDiv = `{appView === 'settings' && (
                  <>
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border dark:border-slate-700 border-slate-200 shadow-sm flex flex-col gap-6 relative">`;

c = c.replace(exactSettingsDiv, newSettingsDiv);

// Then find the end of the settings block.
const exactSettingsEnd = `                           </label>
                        </div>
                     </div>
                  </div>
               )}`;

const newSettingsEnd = `                           </label>
                        </div>
                     </div>
                     <button onClick={() => setFeedbackModalOpen(true)} className="fixed bottom-8 right-8 bg-indigo-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-indigo-700 transition transform hover:scale-105 flex items-center gap-2 z-50">
                        <MessageSquare className="w-5 h-5" /> Give Feedback
                     </button>
                  </div>
                  </>
               )}`;

c = c.replace(exactSettingsEnd, newSettingsEnd);

// Adding state for Feedback Modal
const stateAnchor = `const [selectedTrackId, setSelectedTrackId] = useState<string>('melbourne');`;
const newStates = `const [selectedTrackId, setSelectedTrackId] = useState<string>('melbourne');
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);`;

c = c.replace(stateAnchor, newStates);

// Adding MessageSquare to lucide-react imports
c = c.replace(/import \{[\s\S]*?\} from 'lucide-react';/, (match) => {
   return match.replace("CheckCircle,", "CheckCircle,\n  MessageSquare,\n  Star,");
});

// Adding modal render right before the last closing div of the app
const appEnd = `  );
}`;
const modalRender = `
      {feedbackModalOpen && (
         <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95">
               <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">Feedback</h2>
               <form onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const text = (form.elements.namedItem('feedbackText') as HTMLTextAreaElement).value;
                  const rating = Number((form.elements.namedItem('rating') as HTMLInputElement).value);
                  try {
                     const { addDoc, collection } = await import('firebase/firestore');
                     const { db } = await import('./firebase');
                     await addDoc(collection(db, 'feedback'), { text, rating, timestamp: new Date() });
                     alert('Feedback submitted!');
                     setFeedbackModalOpen(false);
                  } catch (err) {
                     console.error(err);
                     alert('Error submitting feedback');
                  }
               }}>
                  <textarea name="feedbackText" required className="w-full h-32 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl mb-4 text-slate-800 dark:text-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Tell us about your experience..."></textarea>
                  <div className="flex items-center gap-2 mb-6">
                     <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Rating (1-5):</span>
                     <input type="number" name="rating" min="1" max="5" defaultValue="5" required className="w-16 p-2 text-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200" />
                  </div>
                  <div className="flex justify-end gap-3">
                     <button type="button" onClick={() => setFeedbackModalOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800">Cancel</button>
                     <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700">Submit</button>
                  </div>
               </form>
            </div>
         </div>
      )}
  );
}`;
c = c.replace(appEnd, modalRender);

fs.writeFileSync('src/App.tsx', c);
