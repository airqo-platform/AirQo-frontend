export const RemoveTrailingSlash = (url: string) => {
  if (url.endsWith('/')) {
    return url.slice(0, -1)
  }
  return url
}
