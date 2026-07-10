import fs from 'fs';
let c = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /      \{feedbackModalOpen && \([\s\S]*?\}\)\n  \);\n\}/;
c = c.replace(regex, `  );\n}`);

const appEndRegex = /    <\/div>\n  \);\n\}/;

const modalRender = `      {feedbackModalOpen && (
         <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95">
               <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">Feedback</h2>
               <form onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.target;
                  const text = form.elements.namedItem('feedbackText').value;
                  const rating = Number(form.elements.namedItem('rating').value);
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
    </div>
  );
}`;

c = c.replace(appEndRegex, modalRender);
fs.writeFileSync('src/App.tsx', c);
