import fs from 'fs';
let c = fs.readFileSync('src/App.tsx', 'utf-8');

const anchor = `const wearGraphData = useMemo(() => {`;
const fuelGraphText = `
  const fuelGraphData = useMemo(() => {
    if (!selectedStrategy) return [];
    let data: any[] = [];
    let currentLap = 0;
    selectedStrategy.stints.forEach((stint, idx) => {
      // Pit Stop gap
      if (idx > 0) {
         data.push({ lap: currentLap, remaining: null, stint: 'Pit Stop' });
      }
      data.push({
        lap: currentLap + (idx > 0 ? 0.01 : 0),
        remaining: parseFloat(stint.fuelNeeded.toFixed(2)),
        stint: \`Stint \${idx + 1}\`
      });
      currentLap += stint.laps;
      data.push({
        lap: currentLap,
        remaining: 0,
        stint: \`Stint \${idx + 1} End\`
      });
    });
    return data;
  }, [selectedStrategy]);

  const wearGraphData = useMemo(() => {
`;

c = c.replace(anchor, fuelGraphText);

const renderAnchor = `{/* VISUAL STINT BAR */}`;
const fuelRender = `
                        {/* FUEL CURVE */}
                        <div className="mt-8">
                          <div className="flex items-center gap-2 mb-1.5 ml-1">
                             <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('Fuel Load Curve (Liters)')}</div>
                             <Tooltip content="Fuel amount in tank over laps." />
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={fuelGraphData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#e2e8f0'} />
                                <XAxis dataKey="lap" type="number" domain={[0, 'dataMax']} style={{fontSize: '10px'}} stroke={isDark ? '#64748b' : '#94a3b8'} />
                                <YAxis domain={[0, 'dataMax']} style={{fontSize: '10px'}} stroke={isDark ? '#64748b' : '#94a3b8'} />
                                <RechartsTooltip 
                                  contentStyle={{backgroundColor: isDark ? '#1e293b' : '#ffffff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                  itemStyle={{color: '#f97316', fontSize: '12px', fontWeight: 'bold'}}
                                  labelStyle={{color: isDark ? '#94a3b8' : '#64748b', fontSize: '10px', marginBottom: '2px'}}
                                  formatter={(value: any) => [\`\${Number(value).toFixed(1)} L\`, 'Fuel Remaining']}
                                  labelFormatter={(label) => \`Lap \${label}\`}
                                />
                                <Line 
                                  connectNulls={false} 
                                  type="monotone" 
                                  dataKey="remaining" 
                                  stroke="#f97316" 
                                  strokeWidth={3}
                                  animationDuration={1500}
                                  dot={{r: 4, strokeWidth: 2, fill: isDark ? '#1e293b' : '#ffffff'}} 
                                  activeDot={{r: 6}} 
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* VISUAL STINT BAR */}
`;
c = c.replace(renderAnchor, fuelRender);
fs.writeFileSync('src/App.tsx', c);
