import fs from 'fs';
['src/components/TrackAnalysisView.tsx', 'src/components/CalibrationView.tsx'].forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  
  const classMap = {
    'bg-white': 'bg-white dark:bg-slate-900',
    'bg-slate-50': 'bg-slate-50 dark:bg-slate-800/50',
    'bg-slate-100': 'bg-slate-100 dark:bg-slate-800',
    'border-slate-200': 'border-slate-200 dark:border-slate-700',
    'border-slate-100': 'border-slate-100 dark:border-slate-800',
    'text-slate-800': 'text-slate-800 dark:text-slate-200',
    'text-slate-700': 'text-slate-700 dark:text-slate-300',
    'text-slate-600': 'text-slate-600 dark:text-slate-400',
    'text-slate-500': 'text-slate-500 dark:text-slate-400',
    'border ': 'border dark:border-slate-700 '
  };

  for (let [light, combo] of Object.entries(classMap)) {
    const safeLight = light.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    content = content.replace(new RegExp(`\\b${safeLight}\\b`, 'g'), combo);
  }

  const fixMultiples = (str) => {
    return str.replace(/(dark:[\w\-\/]+)(\s+\1)+/g, "$1");
  };
  content = fixMultiples(content);

  fs.writeFileSync(file, content);
});
console.log('Class mapping applied to components.');
