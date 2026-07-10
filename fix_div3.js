import fs from 'fs';
let c = fs.readFileSync('src/App.tsx', 'utf-8');

// The buggy part starts around line 1025.
const buggy = `
                  </div>
                </section>
              </div>

            </div>

              {/* DRIVER STATS & TYRE ANALYSIS */}
              <div className="col-span-1 lg:col-span-2 grid grid-cols-1 max-lg:data-[landscape=true]:grid-cols-12 lg:grid-cols-12 gap-8 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="max-lg:data-[landscape=true]:col-span-5 lg:col-span-4 space-y-6">
                 {/* PLAYER & CAR STATS */}
`;

const fixed = `
                  </div>
                </section>
              </div>

              {/* DRIVER STATS & TYRE ANALYSIS */}
              <div className="col-span-1 lg:col-span-2 grid grid-cols-1 max-lg:data-[landscape=true]:grid-cols-12 lg:grid-cols-12 gap-8 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="max-lg:data-[landscape=true]:col-span-5 lg:col-span-4 space-y-6">
                 {/* PLAYER & CAR STATS */}
`;

c = c.replace(buggy, fixed);

fs.writeFileSync('src/App.tsx', c);
