const urlRegex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/g;

export const stripTrailingSlash = (url) => {
  return url.replace(/\/$/, "");
};

export const joinUrl = (baseUrl, absoluteUrl) => {
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

    if (!absoluteUrl.match(urlRegex)) {
      throw Error(`${absoluteUrl} generated url is invalid`);
    }
    joinedUrls[next] = absoluteUrl;
    return joinedUrls;
  }, {});
};
