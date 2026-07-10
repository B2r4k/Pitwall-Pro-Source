const fs = require('fs');

async function search() {
    const res = await fetch('https://github.com/search?q=gproanalyzer&type=repositories');
    const text = await res.text();
    console.log(text.includes('gproanalyzer'));
    const matches = text.match(/href="\/([^\/]+\/[^\/]+)"/g);
    if(matches) console.log(matches.slice(0, 10));
}
search();
