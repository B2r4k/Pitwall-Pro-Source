async function run() {
    try {
        const res = await fetch('https://api.gpro.net');
        console.log("Status:", res.status);
        const text = await res.text();
        console.log(text.substring(0, 200));
    } catch(e) { console.error("Error 1", e.message); }
    try {
        const res = await fetch('https://api.gpro.net/v1/manager');
        console.log("Status2:", res.status);
    } catch(e) { console.error("Error 2", e.message); }
    try {
        const res = await fetch('https://api.gpro.net/openapi.json');
        console.log("Status3:", res.status);
    } catch(e) { console.error("Error 3", e.message); }
}
run();
