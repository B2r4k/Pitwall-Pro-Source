import fs from 'fs';
let p = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
p.scripts.dev = "tsx server.ts";
p.scripts.build = "vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs";
p.scripts.start = "node dist/server.cjs";
fs.writeFileSync('package.json', JSON.stringify(p, null, 2));
