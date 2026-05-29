type PollutantLabelDefinition = {
  symbol: string;
  defaultUnit?: string;
  match: (normalizedKey: string, tokens: string[]) => boolean;
};

const UNIT_PATTERNS: Array<[RegExp, string]> = [
  [/(?:micrograms?|ug|µg)\s*(?:per|\/)?\s*(?:m3|m\^3|m³|cubic_meter)/i, 'µg/m³'],
  [/(?:milligrams?|mg)\s*(?:per|\/)?\s*(?:m3|m\^3|m³|cubic_meter)/i, 'mg/m³'],
  [/(?:nanograms?|ng)\s*(?:per|\/)?\s*(?:m3|m\^3|m³|cubic_meter)/i, 'ng/m³'],
  [/(?:parts?_?per_?million|ppm)\b/i, 'ppm'],
  [/(?:parts?_?per_?billion|ppb)\b/i, 'ppb'],
  [/(?:percent|percentage|pct|%)\b/i, '%'],
  [/(?:degrees?_?c|deg_?c|celsius|°c)\b/i, '°C'],
  [/(?:degrees?_?f|deg_?f|fahrenheit|°f)\b/i, '°F'],
  [/(?:kelvin|\bk)\b/i, 'K'],
];

const POLLUTANT_LABELS: PollutantLabelDefinition[] = [
  {
    symbol: 'PM₂.₅',
    defaultUnit: 'µg/m³',
    match: key =>
      /(^|_)pm_?2_?5($|_)/.test(key) ||
      /(^|_)pm25($|_)/.test(key) ||
      /fine_?particulate/.test(key),
  },
  {
    symbol: 'PM₁₀',
    defaultUnit: 'µg/m³',
    match: key =>
      /(^|_)pm_?10($|_)/.test(key) ||
      /coarse_?particulate/.test(key),
  },
  {
    symbol: 'PM₁',
    defaultUnit: 'µg/m³',
    match: key => /(^|_)pm_?1($|_)/.test(key),
  },
  {
    symbol: 'PM₄',
    defaultUnit: 'µg/m³',
    match: key => /(^|_)pm_?4($|_)/.test(key),
  },
  {
    symbol: 'TSP',
    defaultUnit: 'µg/m³',
    match: key => /(^|_)(tsp|total_?suspended_?particulates?)($|_)/.test(key),
  },
  {
    symbol: 'BC',
    defaultUnit: 'µg/m³',
    match: key => /(^|_)(bc|black_?carbon)($|_)/.test(key),
  },
  {
    symbol: 'O₃',
    defaultUnit: 'µg/m³',
    match: (key, tokens) => tokens.includes('o3') || key.includes('ozone'),
  },
  {
    symbol: 'NO₂',
    defaultUnit: 'µg/m³',
    match: key => /(^|_)(no2|nitrogen_?dioxide)($|_)/.test(key),
  },
  {
    symbol: 'NO',
    defaultUnit: 'µg/m³',
    match: key => /(^|_)(no|nitric_?oxide)($|_)/.test(key),
  },
  {
    symbol: 'NOₓ',
    defaultUnit: 'µg/m³',
    match: key => /(^|_)(nox|nitrogen_?oxides?)($|_)/.test(key),
  },
  {
    symbol: 'SO₂',
    defaultUnit: 'µg/m³',
    match: key => /(^|_)(so2|sulfur_?dioxide|sulphur_?dioxide)($|_)/.test(key),
  },
  {
    symbol: 'CO',
    defaultUnit: 'mg/m³',
    match: key => /(^|_)(co|carbon_?monoxide)($|_)/.test(key),
  },
  {
    symbol: 'CO₂',
    defaultUnit: 'ppm',
    match: key => /(^|_)(co2|carbon_?dioxide)($|_)/.test(key),
  },
  {
    symbol: 'Pb',
    defaultUnit: 'µg/m³',
    match: key => /(^|_)(pb|lead)($|_)/.test(key),
  },
  {
    symbol: 'NH₃',
    defaultUnit: 'µg/m³',
    match: key => /(^|_)(nh3|ammonia)($|_)/.test(key),
  },
  {
    symbol: 'H₂S',
    defaultUnit: 'µg/m³',
    match: key => /(^|_)(h2s|hydrogen_?sulfide|hydrogen_?sulphide)($|_)/.test(key),
  },
  {
    symbol: 'CH₄',
    defaultUnit: 'ppm',
    match: key => /(^|_)(ch4|methane)($|_)/.test(key),
  },
  {
    symbol: 'VOCs',
    defaultUnit: 'ppb',
    match: key => /(^|_)(voc|vocs|tvoc|volatile_?organic_?compounds?)($|_)/.test(key),
  },
  {
    symbol: 'AQI',
    match: key => /(^|_)(aqi|air_?quality_?index)($|_)/.test(key),
  },
];

const normalizeColumnKey = (column: string) =>
  column
    .toLowerCase()
    .replace(/[₂]/g, '2')
    .replace(/[₃]/g, '3')
    .replace(/[₄]/g, '4')
    .replace(/[₅]/g, '5')
    .replace(/[₁₀]/g, match => (match === '₁' ? '1' : '0'))
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const titleCaseToken = (token: string) =>
  token.length <= 3 && token === token.toUpperCase()
    ? token
    : token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();

const humanizeColumnName = (column: string) =>
  column
    .replace(/\([^)]*\)/g, '')
    .replace(/\[[^\]]*\]/g, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map(titleCaseToken)
    .join(' ') || column;

const detectUnit = (column: string) => {
  const normalizedColumn = column.replace(/[_-]+/g, ' ');

  for (const [pattern, unit] of UNIT_PATTERNS) {
    if (pattern.test(normalizedColumn)) {
      return unit;
    }
  }

  return undefined;
};

const getPollutantDefinition = (column: string) => {
  const normalizedKey = normalizeColumnKey(column);
  const tokens = normalizedKey.split('_').filter(Boolean);

  return POLLUTANT_LABELS.find(definition =>
    definition.match(normalizedKey, tokens)
  );
};

export const formatMeasurementLabel = (column: string | undefined) => {
  if (!column) {
    return 'Measurement';
  }

  const pollutant = getPollutantDefinition(column);

  if (!pollutant) {
    return humanizeColumnName(column);
  }

  const unit = detectUnit(column) || pollutant.defaultUnit;

  return unit ? `${pollutant.symbol} (${unit})` : pollutant.symbol;
};

export const formatColumnLabel = (column: string | undefined) => {
  if (!column) {
    return 'Record order';
  }

  return formatMeasurementLabel(column);
};

export const formatSelectOptionLabel = (column: string) => {
  const formatted = formatColumnLabel(column);
  return formatted === column ? column : `${formatted} - ${column}`;
};
