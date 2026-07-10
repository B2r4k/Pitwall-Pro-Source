import fs from 'fs';
let c = fs.readFileSync('src/App.tsx', 'utf-8');

const tAnchor = `  const wearGraphData = useMemo(() => {

    if (!selectedStrategy) return [];
    let data: any[] = [];
    let currentLap = 0;
    selectedStrategy.stints.forEach((stint, idx) => {
      // Pit in drop (for line split effect)
      if (idx > 0) {
         data.push({ lap: currentLap, remaining: null, stint: 'Pit Stop' });
      }
      data.push({
        lap: currentLap + (idx > 0 ? 0.01 : 0), // Slight offset so Recharts doesn't choke on same x-value
        remaining: 100,
        stint: \`Stint \${idx + 1} (\${COMPOUND_FULL_NAMES[stint.tyres]})\`
      });
      currentLap += stint.laps;
      data.push({
        lap: currentLap,
        remaining: 100 - stint.wearEnd,
        stint: \`Stint \${idx + 1} End\`
      });
    });
    return data;
  }, [selectedStrategy]);`;

const newGraphData = `  const wearGraphData = useMemo(() => {
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
  }, [selectedStrategy]);

  const fuelGraphData = useMemo(() => {
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
  }, [selectedStrategy]);`;

c = c.replace(tAnchor, newGraphData);

// Remove the old fuelGraphData if it's there
const oldFuelAnchor = `  const fuelGraphData = useMemo(() => {
    if (!selectedStrategy) return [];
    let data: any[] = [];
    let currentLap = 0;
    selectedStrategy.stints.forEach((stint, idx) => {
      if (idx > 0) {
         data.push({ lap: currentLap, remaining: null, stint: 'Pit Stop' });
      }
      data.push({
        lap: currentLap + (idx > 0 ? 0.01 : 0),
        remaining: Math.ceil(stint.fuelStart),
        stint: \`Stint \${idx + 1}\`
      });
      currentLap += stint.laps;
      data.push({
        lap: currentLap,
        remaining: parseFloat(stint.fuelNeeded.toFixed(2)),
        stint: \`Stint \${idx + 1} End\`
      });
    });
    return data;
  }, [selectedStrategy]);`;

c = c.replace(oldFuelAnchor, "");

fs.writeFileSync('src/App.tsx', c);
