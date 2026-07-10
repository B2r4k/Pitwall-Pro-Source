import fs from 'fs';
let c = fs.readFileSync('src/App.tsx', 'utf-8');
c = c.replace(/import \{([\s\S]*?)CheckCircle,([\s\S]*?)\} from 'lucide-react';/, "import {$1CheckCircle, Save,$2} from 'lucide-react';");
fs.writeFileSync('src/App.tsx', c);
