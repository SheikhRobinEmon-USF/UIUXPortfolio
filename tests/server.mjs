import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { brotliCompressSync, constants, gzipSync } from "node:zlib";

const root = path.resolve("out");
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".vtt": "text/vtt; charset=utf-8",
  ".mp4": "video/mp4",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".webm": "video/webm",
};
const compressible = new Set([
  ".html",
  ".js",
  ".css",
  ".svg",
  ".json",
  ".txt",
  ".vtt",
]);
const encoded = new Map();

function finish(req, res, status, headers, body) {
  res.writeHead(status, headers);
  res.end(req.method === "HEAD" ? undefined : body);
}

function encodingFor(header) {
  const choices = String(header || "")
    .split(",")
    .map((value) => value.trim().split(";"));
  return ["br", "gzip"].find((name) =>
    choices.some(
      ([value, quality]) => value === name && quality?.trim() !== "q=0",
    ),
  );
}

http
  .createServer((req, res) => {
    let pathname;
    try {
      pathname = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname,
      );
    } catch {
      return finish(req, res, 400, {}, "Bad request");
    }
    let file = path.resolve(root, "." + pathname);
    if (!file.startsWith(root + path.sep) && file !== root)
      return finish(req, res, 403, {}, "Forbidden");
    const candidate = fs.statSync(file, { throwIfNoEntry: false });
    if (candidate?.isDirectory()) file = path.join(file, "index.html");
    const stat = fs.statSync(file, { throwIfNoEntry: false });
    if (!stat?.isFile()) return finish(req, res, 404, {}, "Not found");

    const ext = path.extname(file);
    const headers = { "Content-Type": mime[ext] || "application/octet-stream" };
    const range = req.headers.range;
    if (ext === ".mp4" || ext === ".webm") {
      headers["Accept-Ranges"] = "bytes";
      if (range) {
        const [, first, last] = /^bytes=(\d*)-(\d*)$/.exec(range) || [];
        const start = first
          ? Number(first)
          : Math.max(0, stat.size - Number(last));
        const end =
          first && last ? Math.min(Number(last), stat.size - 1) : stat.size - 1;
        if ((!first && !last) || start > end || end < 0) {
          return finish(req, res, 416, {
            ...headers,
            "Content-Range": `bytes */${stat.size}`,
          });
        }
        headers["Content-Range"] = `bytes ${start}-${end}/${stat.size}`;
        headers["Content-Length"] = end - start + 1;
        res.writeHead(206, headers);
        if (req.method === "HEAD") return res.end();
        return fs.createReadStream(file, { start, end }).pipe(res);
      }
    }

    if (compressible.has(ext) && stat.size >= 1024) {
      headers.Vary = "Accept-Encoding";
      const encoding = encodingFor(req.headers["accept-encoding"]);
      if (encoding) {
        const key = `${file}:${encoding}`;
        let buffer = encoded.get(key);
        if (!buffer || buffer.mtime !== stat.mtimeMs) {
          const source = fs.readFileSync(file);
          const content =
            encoding === "br"
              ? brotliCompressSync(source, {
                  params: { [constants.BROTLI_PARAM_QUALITY]: 4 },
                })
              : gzipSync(source);
          buffer = { content, mtime: stat.mtimeMs };
          encoded.set(key, buffer);
        }
        headers["Content-Encoding"] = encoding;
        headers["Content-Length"] = buffer.content.length;
        return finish(req, res, 200, headers, buffer.content);
      }
    }

    headers["Content-Length"] = stat.size;
    res.writeHead(200, headers);
    if (req.method === "HEAD") return res.end();
    fs.createReadStream(file).pipe(res);
  })
  .listen(process.env.PORT || 4173, () =>
    console.log("Static portfolio ready"),
  );
