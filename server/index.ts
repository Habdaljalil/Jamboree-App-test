import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes"; // your routes.ts
import { DotenvConfigOptions } from "dotenv";

// Enable dotenv only in dev
if (process.env.NODE_ENV !== "production") {
  const dotenv = await import("dotenv");
  dotenv.config();
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Parse JSON bodies (needed for POST /api/assignments, etc.)
app.use(express.json());

// ✅ Register API routes first
await registerRoutes(app);

// ✅ Development mode: use Vite middleware
if (process.env.NODE_ENV === "development") {
  const { createServer } = await import("vite");
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: "custom",
  });
  app.use(vite.middlewares);
} else {
  // ✅ Production: serve built React frontend
  const clientPath = path.join(__dirname, "public");
  app.use(express.static(clientPath));

  // Catch-all → send React's index.html
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientPath, "index.html"));
  });
}

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});

