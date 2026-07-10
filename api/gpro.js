export default async function handler(req, res) {
  try {
    const endpoint = req.query.endpoint;
    if (!endpoint) {
       return res.status(400).json({ error: "Missing endpoint parameter" });
    }
    
    // endpoint is like /DriverProfile.asp?ID=123
    const targetUrl = 'https://gpro.net/gb' + endpoint;
    
    const authHeader = req.headers.authorization;
    const token = authHeader ? authHeader.split(' ')[1] : process.env.GPRO_API_TOKEN;

    if (!token) {
      return res.status(401).json({ error: "Missing GPRO API Token. Please provide it in Vercel env variables as GPRO_API_TOKEN." });
    }

    const fetchOptions = {
      method: req.method,
      headers: {
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/json' // Or whatever is needed
      }
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
       fetchOptions.headers['Content-Type'] = 'application/json';
       if (req.body) {
           fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
       }
    }

    const response = await fetch(targetUrl, fetchOptions);

    if (!response.ok) {
       console.error('GPRO API returned ' + response.status + ' for ' + targetUrl);
       let errorText = "";
       try { errorText = await response.text(); } catch(e) {}
       return res.status(response.status).json({ error: 'GPRO API Error: ' + response.status, details: errorText });
    }

    const data = await response.text();
    try {
      res.status(200).json(JSON.parse(data));
    } catch(e) {
      res.status(200).send(data);
    }
  } catch (error) {
    console.error("GPRO Proxy Error:", error);
    res.status(500).json({ error: "Proxy Error", details: error.message });
  }
}
