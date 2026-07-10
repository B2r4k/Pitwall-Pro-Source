async function test() {
   const token = "eyJ0eXAiOiJKV1QiLCAiYWxnIjoiSFMyNTYifQ.eyJpZCI6IDExNDMxODAsImNyZWF0ZWQiOiJTYXQgSnVuIDIwIDA0OjQ4OjAwIFVUQyswMjAwIDIwMjYifQ.4lPHXmfs6SHmbDVqrqMmSs7WSLRCadgsB8B3DnnwABc";
   const urls = [
       "https://www.gpro.net/gb/api/v1/manager",
       "https://gpro.net/api/v1/driver",
       "https://api.gpro.net/api/driver",
       "https://api.gpro.net/gb/manager"
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
           if(res.status < 400){
              const txt = await res.text();
              console.log("Body: " + txt.substring(0, 100));
           }
       } catch (e) {
           console.log("Error: " + e.message);
       }
   }
}
test();
