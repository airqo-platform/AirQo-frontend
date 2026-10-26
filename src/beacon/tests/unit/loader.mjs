// Node ESM loader hooks for the unit tests:
// - `@/...` resolves to the beacon app root, like tsconfig's `paths`
// - `.ts` / `.tsx` sources are transpiled with the project's TypeScript (no type checking)
// - Next.js runtime-only modules are swapped for small stubs so components render with react-dom/server
import { existsSync, statSync } from "node:fs"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import ts from "typescript"

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(HERE, "../..")
const EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mjs"]
const STUBS = {
  "next/navigation": path.join(HERE, "stubs/next-navigation.mjs"),
  "next/dynamic": path.join(HERE, "stubs/next-dynamic.mjs"),
  "next/link": path.join(HERE, "stubs/next-link.mjs"),
}

const isFile = (candidate) => existsSync(candidate) && statSync(candidate).isFile()

function resolveFile(base) {
  if (isFile(base)) return base
  for (const ext of EXTENSIONS) if (isFile(base + ext)) return base + ext
  for (const ext of EXTENSIONS) {
    const index = path.join(base, `index${ext}`)
    if (isFile(index)) return index
  }
  return null
}

export async function resolve(specifier, context, nextResolve) {
  if (STUBS[specifier]) {
    return { url: pathToFileURL(STUBS[specifier]).href, shortCircuit: true }
  }
  if (specifier.startsWith("@/")) {
    const file = resolveFile(path.join(ROOT, specifier.slice(2)))
    if (file) return { url: pathToFileURL(file).href, shortCircuit: true }
  }
  if ((specifier.startsWith("./") || specifier.startsWith("../")) && context.parentURL?.startsWith("file:")) {
    const parent = fileURLToPath(context.parentURL)
    if (!parent.includes(`${path.sep}node_modules${path.sep}`)) {
      const file = resolveFile(path.resolve(path.dirname(parent), specifier))
      if (file) return { url: pathToFileURL(file).href, shortCircuit: true }
    }
  }
  return nextResolve(specifier, context)
}

export async function load(url, context, nextLoad) {
  if (url.startsWith("file:") && /\.(ts|tsx)$/.test(url) && !url.includes("/node_modules/")) {
    const fileName = fileURLToPath(url)
    const source = await readFile(fileName, "utf8")
    const { outputText } = ts.transpileModule(source, {
      fileName,
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2020,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
        isolatedModules: true,
      },
    })
    return { format: "module", source: outputText, shortCircuit: true }
  }
  return nextLoad(url, context)
}
