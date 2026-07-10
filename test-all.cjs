async function run() {
    const token = "eyJ0eXAiOiJKV1QiLCAiYWxnIjoiSFMyNTYifQ.eyJpZCI6IDExNDMxODAsImNyZWF0ZWQiOiJTYXQgSnVuIDIwIDA0OjQ4OjAwIFVUQyswMjAwIDIwMjYifQ.4lPHXmfs6SHmbDVqrqMmSs7WSLRCadgsB8B3DnnwABc";
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
    };

    const endpoints = [
        '/backend/api/v2/DriProfile',
        '/backend/api/v2/UpdateCar',
        '/backend/api/v2/Practice',
        '/backend/api/v2/Qualify2',
        '/backend/api/v2/Tracks',
        '/backend/api/v2/office',
        '/backend/api/v2/CCPHistory',
        '/backend/api/v2/Testing',
        '/backend/api/v2/TrackProfile/1',
        '/backend/api/v2/StaffAndFacilities',
        '/backend/api/v2/RaceSetup',
        '/backend/api/v2/RaceAnalysis',
        '/backend/api/v2/History',
        '/backend/api/v2/RaceSummary'
    ];

    for (const ep of endpoints) {
        console.log(`\n--- Fetching ${ep} ---`);
        try {
            const res = await fetch(`https://gpro.net/gb${ep}`, { method: 'GET', headers });
            if (res.ok) {
                const text = await res.text();
                console.log(`Status 200, length: ${text.length}`);
                console.log(text.substring(0, 300) + (text.length > 300 ? '...' : ''));
            } else {
                console.log(`Status: ${res.status}`);
            }
        } catch(e) {
            console.log("Error:", e.message);
        }
    }
}
run();
