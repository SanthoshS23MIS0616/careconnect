const http = require("http");
const fs = require("fs");
const path = require("path");
const chatHandler = require("./api/chat");
const submitHandler = require("./api/submit");

const root = __dirname;
const port = Number(process.env.PORT || 5173);
const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

const server = http.createServer(async (req, res) => {
  try {
    if (req.url === "/api/chat") {
      await dispatchApi(req, res, chatHandler);
      return;
    }
    if (req.url === "/api/submit") {
      await dispatchApi(req, res, submitHandler);
      return;
    }
    serveStatic(req, res);
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Server error" }));
  }
});

server.listen(port, () => {
  console.log(`CareConnect running at http://localhost:${port}`);
});

async function dispatchApi(req, res, handler) {
  req.body = await readBody(req);
  decorateResponse(res);
  await handler(req, res);
}

function serveStatic(req, res) {
  const urlPath = req.url.split("?")[0] === "/" ? "/index.html" : req.url.split("?")[0];
  const cleanPath = path.normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(root, cleanPath);

  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }
    res.writeHead(200, { "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream" });
    res.end(content);
  });
}

function decorateResponse(res) {
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (payload) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify(payload));
  };
}

async function readBody(req) {
  if (!["POST", "PUT", "PATCH"].includes(req.method)) return {};
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}
