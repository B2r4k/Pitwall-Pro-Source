const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(/className="p-3 bg-indigo-50 text-indigo-600/g, 'className="p-3 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400');
content = content.replace(/className="p-3 bg-blue-50 text-blue-600/g, 'className="p-3 bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400');
content = content.replace(/className="p-3 bg-orange-50 text-orange-600/g, 'className="p-3 bg-orange-50 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400');
content = content.replace(/className="p-3 bg-emerald-50 text-emerald-600/g, 'className="p-3 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400');
content = content.replace(/className="p-3 bg-red-50 text-red-600/g, 'className="p-3 bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400');

fs.writeFileSync('src/App.tsx', content);
