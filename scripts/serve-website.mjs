// Local static-export preview only; this is not an application backend.
import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { resolve, sep, extname } from "node:path";

const root = resolve("out");
if (!existsSync(root)) { console.error("Run npm run build before npm start."); process.exit(1); }
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json", ".xml": "application/xml", ".txt": "text/plain; charset=utf-8", ".webp": "image/webp", ".png": "image/png", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".woff2": "font/woff2", ".woff": "font/woff", ".jpg": "image/jpeg" };
const server = createServer((request, response) => {
  if (!["GET", "HEAD"].includes(request.method)) { response.writeHead(405, { Allow: "GET, HEAD" }); response.end(); return; }
  let file;
  try {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    file = resolve(root, `.${pathname}`);
    if (file !== root && !file.startsWith(root + sep)) throw new Error("Invalid path");
    if (existsSync(file) && statSync(file).isDirectory()) file = resolve(file, "index.html");
    if (!existsSync(file) && existsSync(resolve(file, "index.html"))) file = resolve(file, "index.html");
  } catch { file = ""; }
  if (!file || !existsSync(file) || !statSync(file).isFile()) {
    response.statusCode = 404;
    file = resolve(root, "404.html");
    if (!existsSync(file)) { response.end("404"); return; }
  }
  response.setHeader("Content-Type", types[extname(file)] || "application/octet-stream");
  response.setHeader("X-Content-Type-Options", "nosniff");
  if (request.method === "HEAD") { response.end(); return; }
  const stream = createReadStream(file);
  stream.on("error", () => { if (!response.headersSent) response.writeHead(500); response.end(); });
  stream.pipe(response);
});
const port = Number(process.env.PORT || 3000);
server.listen(port, "127.0.0.1", () => console.log(`AutoFlow GCC static preview: http://localhost:${port}`));
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => server.close(() => process.exit(0)));
