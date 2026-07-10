import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const classMap = {
  'bg-white': 'bg-white dark:bg-slate-900',
  'bg-slate-50': 'bg-slate-50 dark:bg-slate-800/50',
  'border-slate-200': 'border-slate-200 dark:border-slate-700',
  'border-slate-100': 'border-slate-100 dark:border-slate-800',
  'text-slate-800': 'text-slate-800 dark:text-slate-200',
  'text-slate-700': 'text-slate-700 dark:text-slate-300',
  'text-slate-600': 'text-slate-600 dark:text-slate-400',
  'text-slate-500': 'text-slate-500 dark:text-slate-400',
  'border ': 'border dark:border-slate-700 ',
  'border-b ': 'border-b dark:border-slate-700 ',
  "bg-transparent": "bg-transparent dark:text-slate-100",
  "bg-slate-100": "bg-slate-100 dark:bg-slate-800"
};

// Be careful not to double replace.
// Strip existing dark classes first if needed, or just do safe replace.
// For safety, regex replace without the string already having a dark paired with it.

for (let [light, combo] of Object.entries(classMap)) {
  const safeLight = light.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  // Match light class, but NOT if it's already followed by the dark variant mappings 
  // Easy way: replace all, then fix overlaps
  content = content.replace(new RegExp(`\\b${safeLight}\\b`, 'g'), combo);
}

// Fix double dark variants if any (e.g. dark:bg-slate-900 dark:bg-slate-900)
// Because some might be replaced twice.
// Instead of full map, let's just write the replaced content.
const fixMultiples = (str) => {
  return str.replace(/(dark:[\w\-\/]+)(\s+\1)+/g, "$1");
};
content = fixMultiples(content);

// Also fix some specific inputs like <input className="...">
content = content.replace(/className="w-full p-2 border /g, 'className="w-full p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 ');

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx classes updated for dark mode.');
