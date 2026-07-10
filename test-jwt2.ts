import * as cheerio from 'cheerio';

async function test() {
    const urls = [
        "https://www.gpro.net/gb/ManagerProfile.asp?IDManager=1143180",
        "https://www.gpro.net/gb/DriverProfile.asp?ID=1143180",
        "https://www.gpro.net/gb/TeamProfile.asp?TeamID=1143180"
    ];

    for (const url of urls) {
        console.log(`\nTesting: ${url}`);
        try {
            const res = await fetch(url);
            const html = await res.text();
            const $ = cheerio.load(html);
            console.log(`Title: ${$('title').text()}`);
        } catch(e) {}
    }
}
test();
