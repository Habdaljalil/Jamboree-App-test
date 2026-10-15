import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes";

// Enable dotenv only in dev
if (process.env.NODE_ENV !== "production") {
  const dotenv = await import("dotenv");
  dotenv.config();
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Parse JSON bodies
app.use(express.json());

// ✅ Register API routes FIRST
await registerRoutes(app);

// ✅ Dev vs Production handling
if (process.env.NODE_ENV === "development") {
  const { createServer } = await import("vite");

  const vite = await createServer({
    server: { middlewareMode: true },
    appType: "custom",
  });

  app.use(vite.middlewares);
} else {
  // ✅ Production: serve built React app from /dist
  const clientPath = path.join(__dirname);

  app.use(express.static(clientPath));

  // SPA fallback (for React Router)
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientPath, "index.html"));
  });
}

// ✅ MUST bind to 0.0.0.0 for cloud platforms
const port = process.env.PORT || 8080;

app.listen(port, "0.0.0.0", () => {
  console.log(`✅ Server running at http://0.0.0.0:${port}`);
});
