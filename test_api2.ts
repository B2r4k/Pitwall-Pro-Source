const token = "eyJ0eXAiOiJKV1QiLCAiYWxnIjoiSFMyNTYifQ.eyJpZCI6IDExNDMxODAsImNyZWF0ZWQiOiJTYXQgSnVuIDIwIDA0OjQ4OjAwIFVUQyswMjAwIDIwMjYifQ.4lPHXmfs6SHmbDVqrqMmSs7WSLRCadgsB8B3DnnwABc";

async function testApi() {
    const urls = [
        "https://www.gpro.net/api/v1/driver",
        "https://www.gpro.net/api/v1/Setup/Driver",
        "https://www.gpro.net/igpro/api/driver",
        "https://gpro.net/api/v1/DriverProfile",
        "https://gpro.net/api/driver",
    ];

    for (const url of urls) {
        try {
            console.log("Fetching", url);
            const res = await fetch(url, {
                headers: {
                    "Authorization": "Bearer " + token,
                    "Accept": "application/json"
                }
            });
            console.log(res.status);
        } catch (e) {}
    }
}
testApi();
