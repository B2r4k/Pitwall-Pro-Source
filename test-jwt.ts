import * as cheerio from 'cheerio';

async function test() {
    const token = "eyJ0eXAiOiJKV1QiLCAiYWxnIjoiSFMyNTYifQ.eyJpZCI6IDExNDMxODAsImNyZWF0ZWQiOiJTYXQgSnVuIDIwIDA0OjQ4OjAwIFVUQyswMjAwIDIwMjYifQ.4lPHXmfs6SHmbDVqrqMmSs7WSLRCadgsB8B3DnnwABc";
    const endpoints = [
        "https://www.gpro.net/gb/api/ManagerProfile.asp",
        "https://www.gpro.net/api/ManagerProfile",
        "https://api.gpro.net/ManagerProfile",
        "https://www.gpro.net/gb/MobileApi.asp",
    ];

    for (const url of endpoints) {
        console.log(`\nTesting: ${url}`);
        for(const headerKey of ['Authorization', 'Token', 'X-Auth-Token']) {
           try {
             const res = await fetch(url, {
                 headers: {
                    [headerKey]: headerKey === 'Authorization' ? `Bearer ${token}` : token
                 }
             });
             console.log(` [${headerKey}] Status: ${res.status}`);
           } catch(e) {}
        }
    }
}
test();
