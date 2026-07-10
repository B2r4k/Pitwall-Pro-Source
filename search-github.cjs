const fs = require('fs');

async function searchGithub() {
  try {
    const res = await fetch('https://api.github.com/search/code?q=gpro.net+api', {
        headers: { 'User-Agent': 'node.js' }
    });
    const data = await res.json();
    console.log("Github search results:");
    if (data.items) {
      for (const item of data.items.slice(0, 5)) {
        console.log(item.html_url);
        
        // Fetch raw content
        const rawUrl = item.html_url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
        const contentRes = await fetch(rawUrl);
        const content = await contentRes.text();
        
        const lines = content.split('\n');
        for (let i=0; i<lines.length; i++) {
           if (lines[i].toLowerCase().includes('gpro.net')) {
               console.log('   LINE:', lines[i].trim());
           }
        }
      }
    } else {
      console.log(data);
    }
  } catch (e) {
    console.error(e);
  }
}
searchGithub();
