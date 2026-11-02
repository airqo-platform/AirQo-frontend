// next/link stand-in: a plain anchor, so links render with their href outside Next.js
import React from "react"

export default function Link({ href, children, prefetch, replace, scroll, shallow, locale, legacyBehavior, passHref, ...rest }) {
  const url = typeof href === "string" ? href : href?.pathname ?? "#"
  return React.createElement("a", { href: url, ...rest }, children)
}
