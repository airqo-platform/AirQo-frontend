/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS, loaded
   via NODE_OPTIONS=--require. */
// e2e-only (see playwright.config.ts). Node's http/fetch/axios don't honour
// HTTP_PROXY/HTTPS_PROXY the way curl does — axios's own attempt at it even
// 502s against this proxy — so give both an explicit proxy agent instead.
const proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy ||
  process.env.HTTP_PROXY || process.env.http_proxy;

if (proxyUrl) {
  const { HttpProxyAgent } = require("http-proxy-agent");
  const { HttpsProxyAgent } = require("https-proxy-agent");
  const axios = require("axios");

  // Mutating the default instance also reaches axios.create()-based
  // clients elsewhere, since create() merges in axios.defaults.
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
