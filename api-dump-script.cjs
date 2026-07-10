async function run() {
    const token = "eyJ0eXAiOiJKV1QiLCAiYWxnIjoiSFMyNTYifQ.eyJpZCI6IDExNDMxODAsImNyZWF0ZWQiOiJTYXQgSnVuIDIwIDA0OjQ4OjAwIFVUQyswMjAwIDIwMjYifQ.4lPHXmfs6SHmbDVqrqMmSs7WSLRCadgsB8B3DnnwABc";
    const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };
    const endpoints = ['/backend/api/v2/DriProfile', '/backend/api/v2/UpdateCar', '/backend/api/v2/RaceSetup', '/backend/api/v2/Practice', '/backend/api/v2/Qualify2'];
    const fs = require('fs');
    const out = {};
    for (const ep of endpoints) {
        try {
            const res = await fetch(`https://gpro.net/gb${ep}`, { method: 'GET', headers });
            if (res.ok) out[ep] = await res.json();
        } catch(e) {}
    }
    fs.writeFileSync('api-dump.json', JSON.stringify(out, null, 2));
}
run();
