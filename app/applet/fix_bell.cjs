const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf-8');
app = app.replace("import { ", "import { Bell, MessageSquare, Send, ");
fs.writeFileSync('src/App.tsx', app);
