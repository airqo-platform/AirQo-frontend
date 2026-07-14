/* eslint-disable @typescript-eslint/no-require-imports -- loaded via
   NODE_OPTIONS=--require, which requires plain CommonJS. */
// Loaded via NODE_OPTIONS=--require in playwright.config.ts's webServer.env
// only — never wired into `npm run dev`/`npm run build` directly, so it has
// no effect outside e2e runs.
//
// Some sandboxed/corporate networks only allow outbound internet traffic
// through an explicit HTTP(S) proxy (HTTP_PROXY/HTTPS_PROXY). curl honours
// those env vars automatically; Node's built-in http/https/fetch do not.
// Two failure modes were observed against this app's real outbound calls
// (NextAuth's credentials authorize() and the OAuth profile fetch), both to
// the same staging backend, in the same sandbox:
//
//   - Plain https.get / global fetch: attempt a direct connection, which
//     the sandbox silently drops — hangs until the caller's own timeout.
//   - axios's built-in HTTP_PROXY/HTTPS_PROXY env-var proxying (via
//     follow-redirects): reaches the proxy, but the proxy (Squid) returns a
//     502 "ERR_READ_ERROR" for HTTPS POSTs tunneled this way — reproduced
//     consistently, while curl and an explicitly-constructed
//     HttpsProxyAgent against the exact same URL both succeed.
//
// So both need an explicit proxy agent rather than relying on each
// library's own env-var detection.
const proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy ||
  process.env.HTTP_PROXY || process.env.http_proxy;

if (proxyUrl) {
  const { HttpProxyAgent } = require("http-proxy-agent");
  const { HttpsProxyAgent } = require("https-proxy-agent");
  const axios = require("axios");

  // Disable axios/follow-redirects' own (broken, for this proxy) env-var
  // proxying and give it working agents instead. Mutating the default
  // instance also reaches axios.create()-based clients elsewhere in the
  // app, since create() merges in axios.defaults at call time — as long as
  // this module loads before those instances are constructed, which
  // --require guarantees (it runs before any application code imports).
  axios.defaults.proxy = false;
  axios.defaults.httpAgent = new HttpProxyAgent(proxyUrl);
  axios.defaults.httpsAgent = new HttpsProxyAgent(proxyUrl);

  // Native fetch (undici, used by fetchOAuthProfile and a few server-side
  // service calls) — undici ships its own proxy-aware dispatcher.
  try {
    const { setGlobalDispatcher, EnvHttpProxyAgent } = require("undici");
    setGlobalDispatcher(new EnvHttpProxyAgent());
  } catch {
    // undici not resolvable as a direct import in this Node/Next version —
    // axios (the login-critical path) is already covered above.
  }

  console.log(`[proxy-bootstrap] Routing outbound axios/fetch calls through ${proxyUrl}`);
}
