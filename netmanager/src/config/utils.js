const URL_PATTERN = new RegExp(
  "^(https?:\\/\\/)?" + // protocol
  "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|" + // domain name
  "((\\d{1,3}\\.){3}\\d{1,3}))" + // ip (v4) address
  "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + //port
  "(\\?[;&amp;a-z\\d%_.~+=-]*)?" + // query string
    "(\\#[-a-z\\d_]*)?$",
  "i"
);

const validateUrl = (url) => URL_PATTERN.test(url);

export const stripTrailingSlash = (url) => {
  return url.replace(/\/$/, "");
};

export const joinUrl = (baseUrl, absoluteUrl, options) => {
  const { skipStrip } = options || {};
  if (skipStrip) {
    return baseUrl.concat(absoluteUrl);
  }
  return stripTrailingSlash(baseUrl).concat(absoluteUrl);
};

export const attachPort = (baseUrl, port) => {
  return stripTrailingSlash(baseUrl).concat(":").concat(port);
};

export const createAbsoluteUrls = (
  baseUrl,
  servicePortMapper,
  apiVersion,
  relativeUrlsObject
) => {
  return Object.keys(relativeUrlsObject).reduce((joinedUrls, next) => {
    const [service, relativeUrl] = relativeUrlsObject[next];
    const port = servicePortMapper[service];

    if (!port) {
      throw Error(`Unknown service ${service}`);
    }
    const absoluteUrl = joinUrl(
      joinUrl(attachPort(baseUrl, port), apiVersion),
      relativeUrl
    );

    if (!validateUrl(absoluteUrl)) {
      throw Error(`${absoluteUrl} generated url is invalid`);
    }
    joinedUrls[next] = absoluteUrl;
    return joinedUrls;
  }, {});
};

export const createUrlFactory = (baseUrl, apiVersion, protocol) => {
  const allowedProtocols = ["http", "https"];
  return (relativeUrl, options) => {
    let { overwrittenBaseUrl, overwrittenApiVersion, overwrittenProtocol } =
      options || {};

    if (overwrittenProtocol || protocol) {
      if (!allowedProtocols.includes(overwrittenProtocol || protocol)) {
        throw new Error("Unknown protocol");
      }
    } else {
      overwrittenProtocol = "";
    }
    const protocolLessUrl = joinUrl(
      overwrittenBaseUrl || baseUrl,
      joinUrl(overwrittenApiVersion || apiVersion, relativeUrl)
    );

    const url = joinUrl(
      overwrittenProtocol || protocol
        ? `${overwrittenProtocol || protocol}://`
        : "",
      protocolLessUrl,
      { skipStrip: true }
    );

    if (!validateUrl(url)) {
      throw new Error(`${url} generated url is invalid`);
    }
    return url;
  };
};
