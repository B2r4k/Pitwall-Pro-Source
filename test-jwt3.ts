async function test() {
    const token = "eyJ0eXAiOiJKV1QiLCAiYWxnIjoiSFMyNTYifQ.eyJpZCI6IDExNDMxODAsImNyZWF0ZWQiOiJTYXQgSnVuIDIwIDA0OjQ4OjAwIFVUQyswMjAwIDIwMjYifQ.4lPHXmfs6SHmbDVqrqMmSs7WSLRCadgsB8B3DnnwABc";

    const attempts = [
        { url: "https://www.gpro.net/gb/Login.asp", method: "POST", body: `JWT=${token}` },
        { url: "https://www.gpro.net/gb/Login.asp", method: "POST", body: `Token=${token}` },
        { url: "https://www.gpro.net/gb/Login.asp", method: "POST", body: `api_token=${token}` }
    ];

    for (const attempt of attempts) {
        console.log(`\nTesting POST: ${attempt.url} with ${attempt.body.split('=')[0]}`);
        try {
            const res = await fetch(attempt.url, {
                method: attempt.method,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: attempt.body,
                redirect: 'manual'
            });
            console.log(`Status: ${res.status}`);
            console.log(`Location: ${res.headers.get('location')}`);
            console.log(`Set-Cookie: ${res.headers.get('set-cookie')}`);
        } catch(e) {}
    }
}
test();
