async function run() {
    try {
        const token = process.env.TEST_TOKEN || "eyJ0eXAiOiJKV1QiLCAiYWxnIjoiSFMyNTYifQ.eyJpZCI6IDExNDMxODAsImNyZWF0ZWQiOiJTYXQgSnVuIDIwIDA0OjQ4OjAwIFVUQyswMjAwIDIwMjYifQ.4lPHXmfs6SHmbDVqrqMmSs7WSLRCadgsB8B3DnnwABc";
        const res = await fetch('https://gpro.net/gb/backend/api/v2/DriverProfile', {
            method: 'OPTIONS',
            headers: {
                'Origin': 'http://localhost:3000',
                'Access-Control-Request-Method': 'GET',
                'Access-Control-Request-Headers': 'Authorization'
            }
        });
        console.log("CORS Headers:", res.headers.get('access-control-allow-origin'));
    } catch(e) { console.error(e); }
}
run();
