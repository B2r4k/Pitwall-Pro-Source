async function getJs() {
    const res = await fetch("https://www.gpro.net/gb/gpro.asp");
    const html = await res.text();
    const jsLinks = html.match(/"([^"]+\.js[^"]*)"/g) || [];
    for (let link of jsLinks) {
        link = link.replace(/"/g, '');
        if (!link.startsWith('http')) link = "https://www.gpro.net" + (link.startsWith('/') ? '' : '/') + link;
        try {
            const jsRes = await fetch(link);
            const jsText = await jsRes.text();
            if (jsText.toLowerCase().includes('api')) {
                console.log('FOUND API IN:', link);
                const apiPaths = jsText.match(/['"`]\/[a-zA-Z0-9_\-\/]*api[a-zA-Z0-9_\-\/]*['"`]/gi) || [];
                console.log(apiPaths);
            }
        } catch(e) {}
    }
}
getJs();
