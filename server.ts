import express from "express";
import path from "path";
import * as cheerio from "cheerio";

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.use(express.json());

  // Health route
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // GPRO API Proxy Route
  app.all("/api/gpro", async (req, res) => {
    try {
      const endpoint = req.query.endpoint;
      if (!endpoint) return res.status(400).json({ error: "Missing endpoint" });
      const targetUrl = 'https://gpro.net/gb' + endpoint;
      
      const authHeader = req.headers.authorization;
      const token = authHeader ? authHeader.split(' ')[1] : process.env.GPRO_API_TOKEN;

      if (!token) {
        return res.status(401).json({ error: "Missing GPRO API Token. Please provide it in settings or Vercel env variables." });
      }

      const fetchOptions: any = {
        method: req.method,
        headers: {
          'Authorization': 'Bearer ' + token,
          'Accept': 'application/json'
        }
      };

      if (req.method !== 'GET' && req.method !== 'HEAD') {
         fetchOptions.headers['Content-Type'] = 'application/json';
         fetchOptions.body = JSON.stringify(req.body);
      }

      const response = await fetch(targetUrl, fetchOptions);

      if (!response.ok) {
         console.error('GPRO API returned ' + response.status + ' for ' + targetUrl);
         let errorText = "";
         try { errorText = await response.text(); } catch(e) {}
         return res.status(response.status).json({ error: 'GPRO API Error: ' + response.status, details: errorText });
      }

      const text = await response.text();
      try {
        res.json(JSON.parse(text));
      } catch(e) {
        res.send(text);
      }
    } catch (error) {
      console.error("GPRO Proxy Error:", error);
      res.status(500).json({ error: "Proxy Error", details: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // production mode
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
