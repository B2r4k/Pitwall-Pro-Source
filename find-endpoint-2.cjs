async function run() {
    const res = await fetch('https://gpro-tools.eu/assets/js/app.js?v=494706740');
    const text = await res.text();
    console.log("Size:", text.length);
    console.log("Includes gpro:", text.toLowerCase().includes('gpro'));
    console.log("Includes api:", text.toLowerCase().includes('api'));
    console.log("Includes fetch:", text.toLowerCase().includes('fetch'));
    console.log("Includes http:", text.toLowerCase().includes('http'));
    
    // find strings with api in them
    const strings = text.match(/(["'])(?:(?=(\\?))\2.)*?\1/g) || [];
    for (const str of strings) {
       if (str.toLowerCase().includes('api') || str.toLowerCase().includes('gpro')) {
           console.log("STR:", str);
       }
    }
}
run();
