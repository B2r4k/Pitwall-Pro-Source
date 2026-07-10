import fs from 'fs';
let c = fs.readFileSync('src/App.tsx', 'utf-8');

const buggyText = `              <div className="max-lg:data-\\[landscape=true\\]:col-span-7 lg:col-span-8">
                 <TrackAnalysisView params={calcParams} />
              </div>
            </div>
            </div>
          )}`;

const fixedText = `              <div className="max-lg:data-\\[landscape=true\\]:col-span-7 lg:col-span-8">
                 <TrackAnalysisView params={calcParams} />
              </div>
            </div>
            
            </div>
          )}`;

c = c.replace(/              <div className="max-lg:data-\\\\[landscape=true\\\\]:col-span-7 lg:col-span-8">\n                 <TrackAnalysisView params=\{calcParams\} \/>\n              <\/div>\n            <\/div>\n            <\/div>\n          \)\}/g, `              <div className="max-lg:data-\\[landscape=true\\]:col-span-7 lg:col-span-8">\n                 <TrackAnalysisView params={calcParams} />\n              </div>\n            </div>\n            </div>\n          )}`);

// Let's do it with string replace precisely on the blocks
c = c.replace(/              <div className="max-lg:data-\[landscape=true\]:col-span-7 lg:col-span-8">\n                 <TrackAnalysisView params=\{calcParams\} \/>\n              <\/div>\n            <\/div>\n            <\/div>\n          \)\}/, `              <div className="max-lg:data-[landscape=true]:col-span-7 lg:col-span-8">\n                 <TrackAnalysisView params={calcParams} />\n              </div>\n            </div>\n            </div>\n          )}`);

fs.writeFileSync('src/App.tsx', c);
