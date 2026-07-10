const fs = require('fs');
let i = fs.readFileSync('src/i18n.ts', 'utf-8');
i = i.replace('    "AI Assistant": "Yapay Zeka Asistanı",\n,\n', '    "AI Assistant": "Yapay Zeka Asistanı",\n');
i = i.replace('    "Setup Assistant": "Ayar Asistanı",\n,\n', '    "Setup Assistant": "Ayar Asistanı",\n');
fs.writeFileSync('src/i18n.ts', i);

// Let's also make sure App.tsx compiles. (It should)
