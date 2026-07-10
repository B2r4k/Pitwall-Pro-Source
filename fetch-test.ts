async function test() {
   const token = "eyJ0eXAiOiJKV1QiLCAiYWxnIjoiSFMyNTYifQ.eyJpZCI6IDExNDMxODAsImNyZWF0ZWQiOiJTYXQgSnVuIDIwIDA0OjQ4OjAwIFVUQyswMjAwIDIwMjYifQ.4lPHXmfs6SHmbDVqrqMmSs7WSLRCadgsB8B3DnnwABc";
   const urls = [
       "https://www.gpro.net/gb/ManagerProfile.asp?IDManager=1143180",
       "https://api.gpro.net/v1/driver",
       "https://www.gpro.net/api/driver",
       "https://www.gpro.net/gb/api/driver.asp"
   ];
   
   for (const u of urls) {
       console.log("Fetching: " + u);
       try {
           const res = await fetch(u, {
               headers: {
                  'Authorization': `Bearer ${token}`
               }
           });
           console.log("Status: " + res.status);
           const txt = await res.text();
           console.log("Body preview: " + txt.substring(0, 150).replace(/\n/g, ' '));
       } catch (e) {
           console.log("Error: " + e.message);
       }
   }
}
test();
