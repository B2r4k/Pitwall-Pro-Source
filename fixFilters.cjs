const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf-8');

c = c.replace(
    /const checkFilter = \(key\) => applyFilters \? opt\[key\] : true;/g,
    "const checkFilter = (key) => applyFilters ? (opt[key] !== false) : true;"
);

fs.writeFileSync('src/App.tsx', c);
