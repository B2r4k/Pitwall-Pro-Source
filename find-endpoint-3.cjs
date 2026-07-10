async function run() {
    const res = await fetch('https://gproanalyzer.info');
    const html = await res.text();
    const jsMatches = html.match(/src="([^"]+\.js[^"]*)"/g) || [];
    for (const match of jsMatches) {
        let jsUrl = match.replace('src="', '').replace('"', '');
        if (!jsUrl.startsWith('http')) {
            jsUrl = 'https://gproanalyzer.info' + (jsUrl.startsWith('/') ? '' : '/') + jsUrl;
        }
        console.log("Fetching", jsUrl);
        try {
           const jsRes = await fetch(jsUrl);
           const jsText = await jsRes.text();
           const strings = jsText.match(/(["'])(?:(?=(\\?))\2.)*?\1/g) || [];
           for (const str of strings) {
               if (str.toLowerCase().includes('gpro.net') || str.toLowerCase().includes('api')) {
                   console.log("   STR:", str);
               }
           }
        } catch(e) {}
    }
}
run();
