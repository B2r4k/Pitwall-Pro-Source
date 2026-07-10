const jwt = "eyJ0eXAiOiJKV1QiLCAiYWxnIjoiSFMyNTYifQ.eyJpZCI6IDExNDMxODAsImNyZWF0ZWQiOiJTYXQgSnVuIDIwIDA0OjQ4OjAwIFVUQyswMjAwIDIwMjYifQ.4lPHXmfs6SHmbDVqrqMmSs7WSLRCadgsB8B3DnnwABc";

async function check() {
    const u = "https://www.gpro.net/gb/DriverProfile.asp";
    try {
        const res = await fetch(u, { headers: { 'Authorization': `Bearer ${jwt}` } });
        const text = await res.text();
        console.log("DRIVER PROFILE STATUS:", res.status);
        console.log("CONTAINS SIGN IN?:", text.includes("Sign in"));
    } catch(e) {}
}
check();
