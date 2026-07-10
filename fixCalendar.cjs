const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf-8');

const calendarDefinition = `
export const F1_CALENDAR_2026 = [
  { id: 'melbourne', name: 'Melbourne', date: '2026-03-03T19:00:00Z' },
  { id: 'catalunya', name: 'Barcelona', date: '2026-03-06T19:00:00Z' },
  { id: 'montreal', name: 'Montreal', date: '2026-03-10T19:00:00Z' },
  { id: 'silverstone', name: 'Silverstone', date: '2026-03-13T19:00:00Z' },
  { id: 'spa', name: 'Spa', date: '2026-03-17T19:00:00Z' },
  { id: 'monza', name: 'Monza', date: '2026-03-20T19:00:00Z' },
  { id: 'interlagos', name: 'Interlagos', date: '2026-03-24T19:00:00Z' },
  { id: 'bahrain', name: 'Sakhir', date: '2026-03-27T19:00:00Z' },
  { id: 'sepang', name: 'Sepang', date: '2026-03-31T19:00:00Z' },
  { id: 'monaco', name: 'Monaco', date: '2026-04-03T19:00:00Z' },
  { id: 'shanghai', name: 'Shanghai', date: '2026-04-07T19:00:00Z' },
  { id: 'zandvoort', name: 'Zandvoort', date: '2026-04-10T19:00:00Z' },
  { id: 'suzuka', name: 'Suzuka', date: '2026-04-14T19:00:00Z' },
  { id: 'austin', name: 'Austin', date: '2026-04-17T19:00:00Z' },
  { id: 'mexico_city', name: 'Mexico City', date: '2026-04-21T19:00:00Z' },
  { id: 'brasilia', name: 'Brasilia', date: '2026-04-24T19:00:00Z' },
  { id: 'baku', name: 'Baku City', date: '2026-04-28T19:00:00Z' }
];
`;

c = c.replace(/import \{ t, setLanguage \} from "\.\/i18n";/, calendarDefinition + "\nimport { t, setLanguage } from \"./i18n\";");

fs.writeFileSync('src/App.tsx', c);
