const fs = require('fs');

function processFile(file) {
    let content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    let changed = false;
    for (let i = 0; i < lines.length; i++) {
        let l = lines[i];
        if (/<(input|textarea|select)/.test(l)) {
            // Check if it already has text color
            if (!l.includes('text-slate-800') && !l.includes('text-slate-900') && !l.includes('dark:text-white') && !l.includes('dark:text-slate-100') && !l.includes('dark:text-slate-200')) {
               // Only inject if it's a text/email/password/textarea/select with a dark bg
               if (l.includes('dark:bg-') || l.includes('bg-slate-50')) {
                   l = l.replace('className="', 'className="text-slate-800 dark:text-slate-100 ');
                   lines[i] = l;
                   changed = true;
               }
            }
        }
    }
    if (changed) fs.writeFileSync(file, lines.join('\n'));
}

processFile('src/App.tsx');
processFile('src/components/AdminPanel.tsx');
processFile('src/components/CalibrationView.tsx');
processFile('src/components/ChecklistView.tsx');
processFile('src/components/DataIntegrationsPanel.tsx');
processFile('src/components/EconomyView.tsx');
processFile('src/components/NumberInput.tsx');
processFile('src/components/QuickNotes.tsx');
processFile('src/components/RivalAnalysisTab.tsx');
processFile('src/components/SimulationEngine.tsx');
processFile('src/components/TelemetryContributeView.tsx');
processFile('src/components/TrackAnalysisView.tsx');
