import fs from 'fs';

// Fix ChecklistView
let cv = fs.readFileSync('src/components/ChecklistView.tsx', 'utf-8');
cv = cv.replace(/className=\{\\\`flex items/g, 'className={`flex items');
cv = cv.replace(/transition-all \\\$\{item.done/g, 'transition-all ${item.done');
cv = cv.replace(/hover:border-indigo-500\/50'\}\\\`\}/g, "hover:border-indigo-500/50'}`}");

cv = cv.replace(/className=\{\\\`flex-1 ml-1/g, 'className={`flex-1 ml-1');
cv = cv.replace(/transition-colors \\\$\{item.done/g, 'transition-colors ${item.done');
cv = cv.replace(/dark:hover:text-indigo-400'\}\\\`\}/g, "dark:hover:text-indigo-400'}`}");

cv = cv.replace(/className=\{\\\`p-3 rounded-xl/g, 'className={`p-3 rounded-xl');
cv = cv.replace(/text-sm \\\$\{log.sender/g, 'text-sm ${log.sender');
cv = cv.replace(/rounded-bl-none'\}\\\`\}/g, "rounded-bl-none'}`}");

fs.writeFileSync('src/components/ChecklistView.tsx', cv);

// Fix i18n
let i18n = fs.readFileSync('src/i18n.ts', 'utf-8');
i18n = i18n.replace(/    "Strategy Wizard": "Strateji Uzmanı",\n/, '');
i18n = i18n.replace(/    "Dashboard Overview": "Genel Bakış",\n/g, '');
i18n = i18n.replace(/    "Custom Track": "-- Özel Pist \(Manuel\) --",\n/, '    "Custom Track": "-- Özel Pist (Manuel) --",\n    "Dashboard Overview": "Genel Bakış",\n');

fs.writeFileSync('src/i18n.ts', i18n);
