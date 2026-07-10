async function testZenrows() {
    const apikey = "39bca48875019fd1b51c9a48dc1c4fd6cab50331";
    const targetUrl = "https://www.gpro.net/gb/DriverProfile.asp";
    
    // ZenRows API URL
    const url = `https://api.zenrows.com/v1/?apikey=${apikey}&url=${encodeURIComponent(targetUrl)}&custom_headers=true&premium_proxy=true`;
    
    console.log("Fetching via ZenRows...");
    try {
        const res = await fetch(url, {
            headers: {
                "Cookie": "PHPSESSID=dummy_session_id"
            }
        });
        
        console.log("Status:", res.status);
        const text = await res.text();
        console.log("HTML Start:", text.substring(0, 500));
        
        if (text.includes("Sign in")) {
            console.log("\\nSUCCESS! We accessed the GPRO login page without getting blocked.");
        }
    } catch (e) {
        console.error("Error:", e);
    }
}
testZenrows();
