const https = require('https');
https.get('https://www.gpro.net/gb/Api.asp', (res) => {
    console.log(res.statusCode);
    console.log(res.headers);
});
