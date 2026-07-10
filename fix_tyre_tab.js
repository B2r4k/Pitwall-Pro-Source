import fs from 'fs';
let c = fs.readFileSync('src/App.tsx', 'utf-8');

c = c.replace(/          \{\/\* TYRE CALCULATOR & DRIVER TAB \*\/\}\n          \{activeTab === 'tyre_analysis' && \([\s\S]*?            <div className="grid grid-cols-1 max-lg:data-\[landscape=true\]:grid-cols-12 lg:grid-cols-12 gap-8">/, `
              {/* DRIVER STATS & TYRE ANALYSIS */}
              <div className="lg:col-span-2 grid grid-cols-1 max-lg:data-[landscape=true]:grid-cols-12 lg:grid-cols-12 gap-8">
`);

c = c.replace(/              <\/div>\n\n            <\/div>\n          \)\}/, `              </div>\n\n            </div>`);

fs.writeFileSync('src/App.tsx', c);
