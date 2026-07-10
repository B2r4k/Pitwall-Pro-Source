import fs from 'fs';
let c = fs.readFileSync('src/App.tsx', 'utf-8');

c = c.replace(/useState\<'home' \| 'strategy' \| 'track_setup' \| 'assistant'\>\('home'\)/, "useState<'home' | 'strategy' | 'track_setup' | 'driver_profile' | 'assistant'>('home')");

c = c.replace("onClick={() => setActiveTab('track_setup')} className=\"mt-6 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-bold transition\">Configure Driver</button>", "onClick={() => setActiveTab('driver_profile')} className=\"mt-6 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-bold transition\">Configure Driver</button>");

const rechartsImport = "import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';";
const newRechartsImport = "import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';";
c = c.replace(rechartsImport, newRechartsImport);

fs.writeFileSync('src/App.tsx', c);
