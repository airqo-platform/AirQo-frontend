import test from "node:test"
import assert from "node:assert/strict"
import "../test-env.mjs"

import { toast as shownToast, useToast as shownUseToast } from "@/hooks/use-toast"
import { toast, useToast } from "@/components/ui/use-toast"

// Most of the diagnostics tools import from components/ui. Their toasts never appeared while that
// path had its own copy of the store, because the mounted <Toaster> only listens to the hooks one.
test("both toast import paths share the store the mounted Toaster listens to", () => {
  assert.equal(toast, shownToast)
  assert.equal(useToast, shownUseToast)
})
