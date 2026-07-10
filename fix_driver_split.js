import fs from 'fs';
let c = fs.readFileSync('src/App.tsx', 'utf-8');

const anchorDriverStart = `              {/* DRIVER STATS & TYRE ANALYSIS */}`;
const anchorDriverEnd = `            </div>
          )}

          {/* STRATEGY TAB */}`;

const [firstPart, restPart] = c.split(anchorDriverStart);
const [driverStr, lastPart] = restPart.split(anchorDriverEnd);

const replacementStr = `            </div>
          )}

          {activeTab === 'driver_profile' && (
             <div className="grid grid-cols-1 lg:grid-cols-2 max-lg:data-[landscape=true]:grid-cols-2 gap-8">
               <div className="space-y-6">
                 ${driverStr.split('              <div className="max-lg:data-[landscape=true]:col-span-7 lg:col-span-8">')[0].replace('<div className="col-span-1 lg:col-span-2 grid grid-cols-1 max-lg:data-[landscape=true]:grid-cols-12 lg:grid-cols-12 gap-8 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">', '').replace('<div className="max-lg:data-[landscape=true]:col-span-5 lg:col-span-4 space-y-6">', '')}
             </div>
          )}

          {/* STRATEGY TAB */}`;

c = firstPart + replacementStr + lastPart;
fs.writeFileSync('src/App.tsx', c);
