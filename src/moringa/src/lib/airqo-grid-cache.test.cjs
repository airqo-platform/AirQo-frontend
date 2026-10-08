const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')

function load(fetch) {
  const module = { exports: {} }
  const options = []
  const code = ts.transpileModule(fs.readFileSync(`${__dirname}/airqo-grid-cache.ts`, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  vm.runInNewContext(code, { module, exports: module.exports, fetch, AbortSignal,
    require: () => ({ unstable_cache: (fn, _key, policy) => { options.push(policy); return fn } }),
  })
  return { api: module.exports, options }
}

test('one-hour policy applies only to grid GET routes', () => {
  const { api, options } = load(() => {})
  assert.equal(options[0].revalidate, 3600)
  for (const path of ['devices/measurements/grids/a', 'predict/daily-forecasting/a', 'spatial/heatmaps/a']) {
    assert.equal(api.isCacheableGridRoute('GET', path), true)
    assert.equal(api.isCacheableGridRoute('POST', path), false)
  }
  assert.equal(api.isCacheableGridRoute('GET', 'predict/daily-forecasting'), false)
})

test('simultaneous requests share one upstream call', async () => {
  let calls = 0
  let finish
  const { api } = load(async () => {
    calls++
    await new Promise(resolve => { finish = resolve })
    return new Response(JSON.stringify({ success: true, measurements: [] }))
  })
  const first = api.getCachedGridResponse('https://example.test/grid-a')
  const second = api.getCachedGridResponse('https://example.test/grid-a')
  assert.equal(calls, 1)
  finish()
  assert.deepEqual(await first, await second)
})

test('failed responses are thrown out of the cache and can be retried', async () => {
  for (const response of [new Response('unavailable', { status: 503 }), new Response('{"success":false}'), new Response('invalid JSON')]) {
    let calls = 0
    const { api } = load(async () => { calls++; return response.clone() })
    await assert.rejects(api.getCachedGridResponse('https://example.test/grid-a'), api.UncachedGridResponse)
    await assert.rejects(api.getCachedGridResponse('https://example.test/grid-a'), api.UncachedGridResponse)
    assert.equal(calls, 2)
  }
})
