// Entry point for `node --import ./tests/unit/register.mjs --test ...`: installs the loader that
// transpiles the app's TypeScript and resolves `@/` imports, so node:test can import app modules.
import { register } from "node:module"

register("./loader.mjs", import.meta.url)
