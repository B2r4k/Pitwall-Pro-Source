const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf-8');

const oldTrack = `  const activeTrack = selectedTrackId === 'custom' 
    ? customTrack 
    : TRACK_DATABASE.find(t => t.id === selectedTrackId)!;`;

const newTrack = `  const activeTrack = useMemo(() => selectedTrackId === 'custom' 
    ? customTrack 
    : TRACK_DATABASE.find(t => t.id === selectedTrackId)!, [selectedTrackId, customTrack]);`;

c = c.replace(oldTrack, newTrack);

fs.writeFileSync('src/App.tsx', c);
