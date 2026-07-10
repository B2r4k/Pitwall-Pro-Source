async function run() {
    try {
        const token = "eyJ0eXAiOiJKV1QiLCAiYWxnIjoiSFMyNTYifQ.eyJpZCI6IDExNDMxODAsImNyZWF0ZWQiOiJTYXQgSnVuIDIwIDA0OjQ4OjAwIFVUQyswMjAwIDIwMjYifQ.4lPHXmfs6SHmbDVqrqMmSs7WSLRCadgsB8B3DnnwABc";
        const res = await fetch('https://gpro.net/gb/backend/api/v2/UpdateCar', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log("Status:", res.status);
        console.log("Body:", (await res.text()).substring(0, 500));
    } catch(e) { console.error(e); }
}
run();
