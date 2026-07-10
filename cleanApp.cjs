const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf-8');

app = app.replace(/data-\\\\\[landscape=true\\\\\]/g, 'data-[landscape=true]');
app = app.replace(/data-\\\[landscape=true\\\]/g, 'data-[landscape=true]');
app = app.replace(/data-\[landscape=true\]/g, 'data-[landscape=true]');

// Also fix the other syntax errors, let's just make it super clean.
let lines = app.split('\n');
console.log("Lines:", lines.length);

fs.writeFileSync('src/App.tsx', app);
