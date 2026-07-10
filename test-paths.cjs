const jwt = "eyJ0eXAiOiJKV1QiLCAiYWxnIjoiSFMyNTYifQ.eyJpZCI6IDExNDMxODAsImNyZWF0ZWQiOiJTYXQgSnVuIDIwIDA0OjQ4OjAwIFVUQyswMjAwIDIwMjYifQ.4lPHXmfs6SHmbDVqrqMmSs7WSLRCadgsB8B3DnnwABc";

const paths = [
    "/api.asp", "/Api.asp", "/api", "/api/manager", "/manager/api", "/api/v1/manager",
    "/api/data", "/data/api", "/gb/api.asp", "/gb/Api.asp", "/v1/api", "/api/export",
    "/api/gpro.asp", "/gb/json.asp", "/api/driver", "/api/track", "/api/car", "/api/season"
];
const hosts = ["https://www.gpro.net", "https://gpro.net", "https://api.gpro.net"];

async function check() {
    for (const host of hosts) {
        for (const path of paths) {
            const url = host + path;
            try {
                const res = await fetch(url, { headers: { 'Authorization': `Bearer ${jwt}`, 'Accept': 'application/json' } });
                if (res.status === 200) {
                    console.log(`FOUND: ${url} STATUS: ${res.status}`);
                    const text = await res.text();
                    if (!text.includes("The page you requested is currently not available") && text.trim().length > 0) {
                        console.log(text.substring(0, 150));
                    }
                }
            } catch (e) {
                // skip
            }
        }
    }
}
check().then(() => console.log('Done'));
