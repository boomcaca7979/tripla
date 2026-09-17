/**
 * proxy-fetch — server-side outbound JSON fetch helper.
 *
 * Why: some upstream APIs (e.g. api.geoapify.com) are not directly reachable
 * from certain network environments and must go through a local HTTP proxy.
 * Standard `fetch` (undici) ignores the system proxy and Node's built-in
 * env-proxy CONNECT fails for these environments, so when OUTBOUND_PROXY_URL
 * is configured we open an explicit HTTP CONNECT tunnel (node:http + node:tls)
 * and speak HTTP/1.1 over it.
 *
 * Behaviour:
 *   · OUTBOUND_PROXY_URL unset (production default) → plain global fetch.
 *   · OUTBOUND_PROXY_URL set (e.g. http://127.0.0.1:17897) → CONNECT tunnel.
 *   · Never logs the URL query (which may contain API keys) — errors carry
 *     only status codes / short messages.
 */

import { request as httpRequest } from "node:http";
import tls from "node:tls";

export interface ProxiedJsonResult {
  status: number;
  body: string;
}

function httpsGetViaProxy(
  target: URL,
  proxy: URL,
  timeoutMs: number,
): Promise<ProxiedJsonResult> {
  return new Promise((resolve, reject) => {
    const host = target.hostname;
    const port = target.port || 443;
    const connect = httpRequest({
      host: proxy.hostname,
      port: proxy.port,
      method: "CONNECT",
      path: `${host}:${port}`,
      headers: { Host: `${host}:${port}` },
    });
    connect.setTimeout(timeoutMs, () => connect.destroy(new Error("connect timeout")));
    connect.on("error", reject);
    connect.on("connect", (res, socket) => {
      if (res.statusCode !== 200) {
        socket.destroy();
        reject(new Error(`proxy CONNECT ${res.statusCode ?? "?"}`));
        return;
      }
      const tlsSocket = tls.connect({ socket, servername: host });
      tlsSocket.setTimeout(timeoutMs, () => tlsSocket.destroy(new Error("request timeout")));
      tlsSocket.on("error", reject);
      tlsSocket.once("secureConnect", () => {
        tlsSocket.write(
          `GET ${target.pathname + target.search} HTTP/1.1\r\n` +
            `Host: ${host}\r\n` +
            `Accept: application/json\r\n` +
            `User-Agent: UtriplaServer/1.0\r\n` +
            `Connection: close\r\n\r\n`,
        );
        let raw = "";
        tlsSocket.setEncoding("utf8");
        tlsSocket.on("data", (chunk: string) => {
          raw += chunk;
        });
        tlsSocket.on("close", () => {
          const split = raw.indexOf("\r\n\r\n");
          if (split < 0) {
            reject(new Error("malformed response"));
            return;
          }
          const head = raw.slice(0, split);
          const status = parseInt(head.split(" ")[1] ?? "0", 10);
          resolve({ status, body: raw.slice(split + 4) });
        });
      });
    });
    connect.end();
  });
}

/**
 * Fetch a JSON endpoint server-side, optionally through OUTBOUND_PROXY_URL.
 * Returns { status, json } or throws on transport failure (timeout, DNS,
 * proxy errors). JSON extraction tolerates chunked-telemetry leftovers by
 * trimming to the outermost JSON object.
 */
export async function serverFetchJson(
  url: string,
  { timeoutMs = 12_000 }: { timeoutMs?: number } = {},
): Promise<{ status: number; json: unknown }> {
  const proxyUrl = process.env.OUTBOUND_PROXY_URL;
  let status: number;
  let body: string;
  if (proxyUrl) {
    const result = await httpsGetViaProxy(new URL(url), new URL(proxyUrl), timeoutMs);
    status = result.status;
    body = result.body;
  } else {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(timeoutMs),
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    status = res.status;
    body = await res.text();
  }
  let json: unknown;
  try {
    json = JSON.parse(body);
  } catch {
    const start = body.indexOf("{");
    const end = body.lastIndexOf("}");
    if (start < 0 || end <= start) throw new Error("non-JSON response");
    json = JSON.parse(body.slice(start, end + 1));
  }
  return { status, json };
}
