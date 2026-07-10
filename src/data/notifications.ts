export interface AppNotification {
  id: string;
  type: 'in-game' | 'patch-note';
  title: string;
  message: string;
  timestamp: string;
}

export const APP_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'patch-d1.1.5',
    type: 'patch-note',
    title: 'Pitwall Pro d1.1.5 - API Sync Options & Onboarding',
    message: 'Added selective API Sync options (Driver, Car, Race Profile). You can now choose exactly what data you import when fetching from Game Token! We also added a Welcome Onboarding modal for new users and scrollable history for updates.',
    timestamp: new Date().toISOString()
  },
  {
    id: 'patch-d1.1.4',
    type: 'patch-note',
    title: 'Pitwall Pro d1.1.4 - S112 Calendar Hotfix',
    message: 'Temporarily bypassed the cloud calendar sync and hardcoded the Season 112 calendar based on user feedback to ensure the Auto-Sync continues to work reliably.',
    timestamp: new Date().toISOString()
  },
  {
    id: 'patch-d1.1.3',
    type: 'patch-note',
    title: 'Pitwall Pro d1.1.3 - Season 112 Ready & Ultimate QOL',
    message: 'We have updated the Official Calendar to Season 112 schedule! We also added massive accessibility improvements: "+-" stepper buttons for calibration laps, driver attribute range sliders, 1-click Driver Presets (Rookie/Vet/Max), and a brand new "Copy Strategy to Clipboard" button!',
    timestamp: new Date().toISOString()
  },
  {
    id: 'patch-d1.1.2',
    type: 'patch-note',
    title: 'Pitwall Pro d1.1.2 Update - QOL & Accessibility',
    message: 'Added highly requested QOL features: You can now quickly copy your race strategy to the clipboard with 1-click in the generator view! Added intuitive +/- steppers to temperature settings instead of manual typing, and added 3 quick presets (Safe/Balanced/Aggressive) to Driver Risk Aggression tab for speedy strategic pivoting without fidgeting with sliders.',
    timestamp: new Date().toISOString()
  },
  {
    id: 'patch-d1.1.1',
    type: 'patch-note',
    title: 'Pitwall Pro d1.1.1 Update',
    message: 'Improved Calendar OCR pattern recognition to perfectly detect numbered track lists and handle mixed dates seamlessly. Added "Starting Grid" attribute to penalty calculations to reflect traffic delays more accurately during pit stops.',
    timestamp: new Date().toISOString()
  },
  {
    id: 'patch-d1.1.0',
    type: 'patch-note',
    title: 'Pitwall Pro d1.1.0 Update',
    message: 'Added new Economy analysis tab, improved Setup Assistant integration, added multi-tier level calibrations, and redesigned the interface to reflect the professional Pitwall Pro identity!',
    timestamp: new Date().toISOString()
  },
  {
    id: 'in-game-1.1.2',
    type: 'in-game',
    title: 'Upcoming Race Reminder',
    message: 'The next race is approaching. Make sure to finalize your strategy setups before the deadline.',
    timestamp: new Date().toISOString()
  },
  {
    id: 'patch-1.1.1',
    type: 'patch-note',
    title: 'Pitwall Pro d1.0.3 Update',
    message: 'Added notification separation, fixed horizontal graphs, and improved admin panel stability.',
    timestamp: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'patch-1.1.0',
    type: 'patch-note',
    title: 'Welcome to Pitwall Pro d1.0.2',
    message: 'We recently updated the stint lap distribution charts and added translation capabilities! You can now analyze your strategy more interactively.',
    timestamp: '2026-06-11T12:00:00Z'
  },
  {
    id: 'patch-d1.0.1',
    type: 'patch-note',
    title: 'Calendar Fetch Fixed',
    message: 'You can now automatically pull the upcoming F1 track from the Dashboard.',
    timestamp: '2026-06-05T08:30:00Z'
  }
];
