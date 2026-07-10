async function run() {
    const res = await fetch('https://gpro-tools.eu');
    const html = await res.text();
    const jsMatches = html.match(/src="([^"]+\.js[^"]*)"/g) || [];
    for (const match of jsMatches) {
        let jsUrl = match.replace('src="', '').replace('"', '');
        if (!jsUrl.startsWith('http')) {
            jsUrl = 'https://gpro-tools.eu' + (jsUrl.startsWith('/') ? '' : '/') + jsUrl;
        }
        console.log("Fetching", jsUrl);
        try {
           const jsRes = await fetch(jsUrl);
           const jsText = await jsRes.text();
           if (jsText.includes('gpro.net')) {
               console.log("FOUND gpro.net IN", jsUrl);
               const urls = jsText.match(/https?:\/\/[a-zA-Z0-9_\-\.]*gpro\.net[^\s"']*/g) || [];
               console.log(urls);
           }
        } catch(e) {}
    }
}
run();
