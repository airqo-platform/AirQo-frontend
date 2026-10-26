const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')

function mapContext(gridId) {
  const html = fs.readFileSync(`${__dirname}/map.html`, 'utf8')
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1]
  // Execute the reference script without network or browser UI. Leaflet and
  // jQuery initialization are stubbed; data parsing helpers execute unchanged.
  const map = { setView() { return this }, getContainer() { return { classList: { add() {} } } } }
  const context = vm.createContext({
    URLSearchParams, window: { location: { search: `?grid_id=${gridId}` } }, console,
    L: { map: () => map, tileLayer: () => ({ addTo() {} }), control: { attribution: () => ({ addTo() {} }) } },
    $: Object.assign(() => ({ keyup() {}, click() {} }), { extend: (_deep, _target, source) => structuredClone(source) }),
  })
  vm.runInContext(script.replace('    loadServerConfig();', ''), context)
  return context
}

test('grid requests use same-origin proxy URLs and correct pagination', () => {
  const map = mapContext('688d201f472adf0013d08fa6')
  assert.equal(map.getGridMeasurementsUrl(2), '/api/airqo/devices/measurements/grids/688d201f472adf0013d08fa6?page=2&limit=1000')
  assert.equal(map.forecastEndpoint, '/api/airqo/predict/daily-forecasting/688d201f472adf0013d08fa6')
  assert.equal(map.heatmapEndpoint, '/api/airqo/spatial/heatmaps/688d201f472adf0013d08fa6')
})

test('all supported measurement envelopes stay searchable after merging', () => {
  const map = mapContext('grid-a')
  const readings = [{ site_id: 'a' }, { site_id: 'b' }]
  for (const response of [{ measurements: readings }, { data: readings }, { data: { measurements: readings } }]) {
    assert.equal(map.getGridMeasurements(response).length, 2)
    assert.equal(map.buildMergedGridMeasurementResponse(response, readings).measurements.length, 2)
  }
})

test('missing values are unavailable and API text cannot become markup', () => {
  const map = mapContext('grid-a')
  assert.equal(map.valueOrNA(null), 'N/A')
  assert.equal(map.valueOrNA(0), '0.0')
  assert.equal(map.escapeHtml('<img onerror="x">'), '&lt;img onerror=&quot;x&quot;&gt;')
  assert.equal(map.normalizeAqiColor('ECAA06'), '#ecaa06')
  assert.equal(map.normalizeAqiColor('red; background:url(x)'), '#ffff00')
  assert.equal(map.isValidCoordinate(0, 30), true)
})
