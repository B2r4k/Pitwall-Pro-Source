const fs = require('fs');
let check = fs.readFileSync('src/components/ChecklistView.tsx', 'utf-8');
check = check.replace(/placeholder=t\("E\.g\. What should I do if it rains at lap 20\?"\)/, 'placeholder={t("E.g. What should I do if it rains at lap 20?")}');
fs.writeFileSync('src/components/ChecklistView.tsx', check);

let i = fs.readFileSync('src/i18n.ts', 'utf-8');
// remove the duplicate "Language & Translation" at the end of the tr block
i = i.replace(/    "Language & Translation": "Dil ve Çeviri"\n  \}/, '  }');
fs.writeFileSync('src/i18n.ts', i);
