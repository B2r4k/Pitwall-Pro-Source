import * as cheerio from 'cheerio';

async function test() {
   const token = "eyJ0eXAiOiJKV1QiLCAiYWxnIjoiSFMyNTYifQ.eyJpZCI6IDExNDMxODAsImNyZWF0ZWQiOiJTYXQgSnVuIDIwIDA0OjQ4OjAwIFVUQyswMjAwIDIwMjYifQ.4lPHXmfs6SHmbDVqrqMmSs7WSLRCadgsB8B3DnnwABc";
   const u = "https://www.gpro.net/gb/ManagerProfile.asp?IDManager=1143180";
   
   console.log("Fetching: " + u);
   try {
       const res = await fetch(u);
       const txt = await res.text();
       
       const $ = cheerio.load(txt);
       console.log($('title').text());
       console.log($('.dv-content').text().replace(/\s\s+/g, ' ').substring(0, 500) || "No dv-content");
       console.log($('body').text().replace(/\s\s+/g, ' ').substring(0, 500));
       
       const links = [];
       $('a').each((i, el) => {
           links.push($(el).attr('href'));
       });
       console.log("Links found: " + links.length);
       // Check for any links related to this manager's team or driver
       console.log(links.filter((l) => l && (l.includes("Driver") || l.includes("Team") || l.includes("Car"))).slice(0, 30));
   } catch (e) {
       console.log("Error: " + e.message);
   }
}
test();
