import { fetch } from 'undici';

const token = "eyJ0eXAiOiJKV1QiLCAiYWxnIjoiSFMyNTYifQ.eyJpZCI6IDExNDMxODAsImNyZWF0ZWQiOiJTYXQgSnVuIDIwIDA0OjQ4OjAwIFVUQyswMjAwIDIwMjYifQ.4lPHXmfs6SHmbDVqrqMmSs7WSLRCadgsB8B3DnnwABc";

const endpoints = [
    "https://api.gpro.net/v1/",
    "https://api.gpro.net/v1/driver",
    "https://api.gpro.net/v1/manager",
    "https://www.gpro.net/api/v1/driver",
    "https://gpro.net/api/v1/driver",
    "https://www.gpro.net/gb/api.asp",
    "https://www.gpro.net/gb/Api.asp",
    "https://www.gpro.net/gb/graphql",
];

async function test() {
    for (const url of endpoints) {
        console.log("Trying:", url);
        try {
            const res = await fetch(url, {
                headers: { "Authorization": "Bearer " + token }
            });
            console.log("Status:", res.status);
            if (res.status === 200 || res.status === 401 || res.status === 403) {
                const text = await res.text();
                // console.log("Response:", text.substring(0, 200));
            }
        } catch (e) {
            console.log("Error:", (e as Error).message);
        }
    }
}
test();
