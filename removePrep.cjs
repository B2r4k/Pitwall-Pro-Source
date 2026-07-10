const fs = require('fs');

let c = fs.readFileSync('src/App.tsx', 'utf-8');

// remove state declaration
c = c.replace(/const \[racePrepChecked, setRacePrepChecked\] = useState\(\{ track: false, weather: false, parts: false \}\);\n/, "");

// remove from loadFromCloudData
c = c.replace(/if \(data\.racePrepChecked\) setRacePrepChecked\(data\.racePrepChecked\);\n/, "");
c = c.replace(/racePrepChecked: racePrepChecked,\n/g, "");

// remove from dependency array
c = c.replace(/, racePrepChecked\]\);/, "]);");

// remove buttons from HTML (they are grouped together, probably starts with `<div className="hidden lg:flex"`)
// Let's replace the whole verify buttons block.
const buttonsRegex = /<button onClick=\{\(\) => setRacePrepChecked\(p => \(\{\.\.\.p, track: true\}\)\)\}.*?<\/button>\s*<button onClick=\{\(\) => setRacePrepChecked\(p => \(\{\.\.\.p, weather: true\}\)\)\}.*?<\/button>\s*<button onClick=\{\(\) => setRacePrepChecked\(p => \(\{\.\.\.p, parts: true\}\)\)\}.*?<\/button>/gs;

c = c.replace(buttonsRegex, "");

// remove the reset button: `onClick={() => setRacePrepChecked({ track: false, weather: false, parts: false })}`
c = c.replace(/onClick=\{\(\) => setRacePrepChecked\(\{ track: false, weather: false, parts: false \}\)\}/g, "onClick={() => {}}");

fs.writeFileSync('src/App.tsx', c);
