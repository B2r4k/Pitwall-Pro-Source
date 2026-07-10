async function run() {
    try {
        const token = "eyJ0eXAiOiJKV1QiLCAiYWxnIjoiSFMyNTYifQ.eyJpZCI6IDExNDMxODAsImNyZWF0ZWQiOiJTYXQgSnVuIDIwIDA0OjQ4OjAwIFVUQyswMjAwIDIwMjYifQ.4lPHXmfs6SHmbDVqrqMmSs7WSLRCadgsB8B3DnnwABc";
        const res = await fetch('https://gpro.net/gb/backend/api/v2/DriProfile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log("Status:", res.status);
        console.log("Body:", await res.text());
    } catch(e) { console.error(e); }
}
run();
