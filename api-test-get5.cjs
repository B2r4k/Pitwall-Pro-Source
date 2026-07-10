async function run() {
    try {
        const token = "eyJ0eXAiOiJKV1QiLCAiYWxnIjoiSFMyNTYifQ.eyJpZCI6IDExNDMxODAsImNyZWF0ZWQiOiJTYXQgSnVuIDIwIDA0OjQ4OjAwIFVUQyswMjAwIDIwMjYifQ.4lPHXmfs6SHmbDVqrqMmSs7WSLRCadgsB8B3DnnwABc";
        const res = await fetch('https://gpro.net/gb/backend/api/v2/DriProfile', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });
        console.log("Status:", res.status);
        if (!res.ok) {
            console.log("Response text:", await res.text());
        } else {
            console.log("OK!");
        }
    } catch(e) { console.error(e); }
}
run();
