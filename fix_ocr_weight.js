import fs from 'fs';
let c = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Add driverWeight to the OCR interface
c = c.replace(/driverStamina\?: number;\n    driverExperience\?: number;\n    riskAggression\?: number;\n  \} \| null>\(null\);/, `driverStamina?: number;
    driverExperience?: number;
    riskAggression?: number;
    driverWeight?: number;
  } | null>(null);`);

// 2. Add driverWeight extraction logic
const focusAnchor = `      const focus = extractNumberNearKeyword(text, ['concentration', 'konsantrasyon']);`;
const newExtractors = `      const dWeight = extractNumberNearKeyword(text, ['weight', 'ağırlık', 'kilo']);
      if (dWeight && dWeight > 40 && dWeight < 150) parsedData.driverWeight = dWeight;
      
      const focus = extractNumberNearKeyword(text, ['concentration', 'konsantrasyon']);`;
c = c.replace(focusAnchor, newExtractors);

// 3. Apply OCR driverWeight to settings or driver profile?! Wait, in constants it is set. Driver weight is in `constants.driverWeight`. BUT `setPlayer` might not hold it because driver weight is in `constants`. Let's verify where `applyOcrData` sets it.
const applyAnchor = `    const hasPlayerUpdates = ocrPreview.driverFocus !== undefined || ocrPreview.driverStamina !== undefined || ocrPreview.driverExperience !== undefined || ocrPreview.riskAggression !== undefined;`;
const applyUpdates = `    const hasPlayerUpdates = ocrPreview.driverFocus !== undefined || ocrPreview.driverStamina !== undefined || ocrPreview.driverExperience !== undefined || ocrPreview.riskAggression !== undefined;
    
    if (ocrPreview.driverWeight !== undefined) {
      setConstants(c => ({...c, driverWeight: ocrPreview.driverWeight!}));
    }`;
c = c.replace(applyAnchor, applyUpdates);

// 4. Show it in preview
const displayAnchor = `{ocrPreview.riskAggression !== undefined && <div className="flex justify-between items-center"><span className="text-slate-500 dark:text-slate-400">Agresiflik:</span> <strong className="text-slate-800 dark:text-slate-200">{ocrPreview.riskAggression}</strong></div>}`;
const displayNew = `{ocrPreview.riskAggression !== undefined && <div className="flex justify-between items-center"><span className="text-slate-500 dark:text-slate-400">Agresiflik:</span> <strong className="text-slate-800 dark:text-slate-200">{ocrPreview.riskAggression}</strong></div>}
                             {ocrPreview.driverWeight !== undefined && <div className="flex justify-between items-center"><span className="text-slate-500 dark:text-slate-400">Weight:</span> <strong className="text-slate-800 dark:text-slate-200">{ocrPreview.driverWeight} kg</strong></div>}`;
c = c.replace(displayAnchor, displayNew);

fs.writeFileSync('src/App.tsx', c);
