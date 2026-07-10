const fs = require('fs');

let c = fs.readFileSync('src/data/notifications.ts', 'utf-8');

// The new versions will start from d1.0.0 and slowly increment up to something like d1.1.5
// We will replace versions and ids.
c = c.replace(/v2\.9\.0/g, 'd1.1.5');
c = c.replace(/v2\.8\.1/g, 'd1.1.4');
c = c.replace(/v2\.8\.0/g, 'd1.1.3');
c = c.replace(/v2\.7\.0/g, 'd1.1.2');
c = c.replace(/v2\.6\.0/g, 'd1.1.1');
c = c.replace(/v2\.5\.0/g, 'd1.1.0');
c = c.replace(/v1\.1\.1/g, 'd1.0.3');
c = c.replace(/v1\.1\.0/g, 'd1.0.2');
c = c.replace(/patch-1\.0\.1/g, 'patch-d1.0.1');

c = c.replace(/patch-2\.9\.0/g, 'patch-d1.1.5');
c = c.replace(/patch-2\.8\.1/g, 'patch-d1.1.4');
c = c.replace(/patch-2\.8\.0/g, 'patch-d1.1.3');
c = c.replace(/patch-2\.7\.0/g, 'patch-d1.1.2');
c = c.replace(/patch-2\.6\.0/g, 'patch-d1.1.1');
c = c.replace(/patch-2\.5\.0/g, 'patch-d1.1.0');

fs.writeFileSync('src/data/notifications.ts', c);

let app = fs.readFileSync('src/App.tsx', 'utf-8');
app = app.replace(/v2\.9\.0/g, 'd1.1.5');
fs.writeFileSync('src/App.tsx', app);
