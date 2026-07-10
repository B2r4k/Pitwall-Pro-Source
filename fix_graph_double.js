import fs from 'fs';
let c = fs.readFileSync('src/App.tsx', 'utf-8');

// Use regex to replace the entire fuelGraphData and wearGraphData blocks
c = c.replace(/  const fuelGraphData = useMemo\(\(\) => \{[\s\S]*?  \}, \[selectedStrategy\]\);\n\n  const wearGraphData = useMemo\(\(\) => \{[\s\S]*?  \}, \[selectedStrategy\]\);/, `  const fuelGraphData = useMemo(() => {
    if (!selectedStrategy) return [];
    let data: any[] = [];
    let currentLap = 0;
    selectedStrategy.stints.forEach((stint, idx) => {
      if (idx > 0) {
         data.push({ lap: currentLap, remaining: null, stint: 'Pit Stop' });
      }
      const fuelPerLap = stint.fuelNeeded / stint.laps;
      for (let i = 0; i <= stint.laps; i++) {
        data.push({
          lap: currentLap + i,
          remaining: parseFloat((stint.fuelStart - (fuelPerLap * i)).toFixed(2)),
          stint: \`Stint \${idx + 1}\`
        });
      }
      currentLap += stint.laps;
    });
    return data;
  }, [selectedStrategy]);

  const wearGraphData = useMemo(() => {
    if (!selectedStrategy) return [];
    let data: any[] = [];
    let currentLap = 0;
    selectedStrategy.stints.forEach((stint, idx) => {
      if (idx > 0) {
         data.push({ lap: currentLap, remaining: null, stint: 'Pit Stop' });
      }
      const wearPerLap = stint.wearEnd / stint.laps;
      for (let i = 0; i <= stint.laps; i++) {
        data.push({
          lap: currentLap + i,
          remaining: parseFloat((100 - (wearPerLap * i)).toFixed(2)),
          stint: \`Stint \${idx + 1} (\${COMPOUND_FULL_NAMES[stint.tyres]})\`
        });
      }
      currentLap += stint.laps;
    });
    return data;
  }, [selectedStrategy]);`);

fs.writeFileSync('src/App.tsx', c);
