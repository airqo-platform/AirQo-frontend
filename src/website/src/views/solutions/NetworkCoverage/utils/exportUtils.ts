import type {
  ImpactCityEntry,
  NetworkCoverageCountry,
  NetworkCoverageImpact,
} from '../networkCoverageTypes';

export interface ExportData {
  countries: NetworkCoverageCountry[];
  impactData: NetworkCoverageImpact | null;
  selectedTypes: string[];
  activeOnly: boolean;
  selectedNetworks: string[];
  selectedCountryId: string | null;
  selectedCountry: NetworkCoverageCountry | null;
  snapshotGetter: (() => Promise<string | null>) | null;
}

export const formatPdfDateTime = (value?: string) => {
  if (!value) {
    return '--';
  }

  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return '--';
  }
};

export const getTypeLabel = (type: string) => {
  if (!type) return type;
  if (type === 'LCS') return 'Low-Cost Sensor (LCS)';
  if (type === 'Reference') return 'Reference Monitor';
  return type;
};

export const formatNetworkName = (value?: string | null) => {
  if (!value || !value.trim()) return '--';
  const trimmed = value.trim();
  return trimmed.toLowerCase() === 'airqo' ? 'AirQo' : trimmed;
};

export const buildPdfFileName = (scope: string) => {
  const dateSuffix = new Date().toISOString().split('T')[0];
  const normalizedScope = scope.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  return `network-coverage-${normalizedScope}-${dateSuffix}.pdf`;
};

export const buildCsvFileName = (scope: string, suffix: string) => {
  const dateSuffix = new Date().toISOString().split('T')[0];
  const normalizedScope = scope.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `network-coverage-${normalizedScope}-${suffix}-${dateSuffix}.csv`;
};

export const escapeCsvField = (
  value: string | number | null | undefined,
): string => {
  const str = value == null ? '' : String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

export const formatExportCoordinates = (monitor: {
  latitude: number | null;
  longitude: number | null;
}) => {
  if (
    typeof monitor.latitude !== 'number' ||
    typeof monitor.longitude !== 'number'
  ) {
    return '--';
  }

  if (
    !Number.isFinite(monitor.latitude) ||
    !Number.isFinite(monitor.longitude)
  ) {
    return '--';
  }

  const latitude = `${Math.abs(monitor.latitude).toFixed(4)}°${monitor.latitude < 0 ? 'S' : 'N'}`;
  const longitude = `${Math.abs(monitor.longitude).toFixed(4)}°${monitor.longitude < 0 ? 'W' : 'E'}`;
  return `${latitude}, ${longitude}`;
};

export const captureWithTimeout = async <T>(
  factory: () => Promise<T>,
  timeoutMs: number,
  fallback: T,
): Promise<T> => {
  if (typeof window === 'undefined') {
    return fallback;
  }

  let timeoutId: number | undefined;

  try {
    const timeoutPromise = new Promise<T>((resolve) => {
      timeoutId = window.setTimeout(() => resolve(fallback), timeoutMs);
    });

    return await Promise.race([
      Promise.resolve()
        .then(factory)
        .catch(() => fallback),
      timeoutPromise,
    ]);
  } finally {
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
    }
  }
};

const displayText = (value?: string | null) =>
  value && value.trim() ? value : '--';

export async function generatePdf(data: ExportData): Promise<void> {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  const {
    countries: exportCountries,
    impactData,
    selectedTypes,
    activeOnly,
    selectedNetworks,
    selectedCountryId,
    snapshotGetter,
  } = data;

  const isSingleCountry = !!selectedCountryId && exportCountries.length === 1;
  const selectedCountryObj = isSingleCountry ? exportCountries[0] : null;
  const countryName = selectedCountryObj?.country ?? null;

  const scopeText = countryName ? countryName : 'All monitored countries';
  const scopeLabel = countryName
    ? countryName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    : 'all-countries';

  const filterParts: string[] = [];
  if (selectedTypes.length < 3) {
    filterParts.push(selectedTypes.map(getTypeLabel).join(', '));
  }
  if (activeOnly) {
    filterParts.push('Active only');
  }
  if (selectedNetworks.length > 0) {
    filterParts.push(
      `Source${selectedNetworks.length === 1 ? '' : 's'}: ${selectedNetworks.map((n) => formatNetworkName(n)).join(', ')}`,
    );
  }
  const filterSummary = filterParts.join(' · ');

  const totalMonitors = exportCountries.reduce(
    (sum, country) => sum + country.monitors.length,
    0,
  );
  const countriesWithMonitors = exportCountries.filter(
    (country) => country.monitors.length > 0,
  );
  const countrySummaryRows = countriesWithMonitors.map((country) => [
    country.country,
    country.iso2 || '--',
    String(country.monitors.length),
    String(
      country.monitors.filter((monitor) => monitor.status === 'active').length,
    ),
  ]);

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });
  const PAGE_W = 297;
  const PAGE_H = 210;
  const MARGIN = 14;
  const CONTENT_W = PAGE_W - MARGIN * 2;
  const HEADER_H = 18;
  const FOOTER_Y = PAGE_H - 8;

  doc.setProperties({
    title: countryName
      ? `Air Quality Monitoring Landscape — ${countryName} Report`
      : 'Air Quality Monitoring Landscape in Africa Report',
    subject: `Air quality monitoring landscape export — ${scopeText}`,
    author: 'Africa Air Quality Monitoring Network',
  });

  const NAVY: [number, number, number] = [12, 28, 90];

  const drawFooter = () => {
    const currentPage =
      (doc as any).getCurrentPageInfo?.().pageNumber ?? doc.getNumberOfPages();
    doc.setDrawColor(180, 185, 210);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, FOOTER_Y - 2, PAGE_W - MARGIN, FOOTER_Y - 2);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(120, 130, 160);
    doc.text('AirQo Network Coverage', MARGIN, FOOTER_Y);
    doc.text(`Page ${currentPage}`, PAGE_W - MARGIN, FOOTER_Y, {
      align: 'right',
    });
  };

  const drawHeader = (titleText: string, subtitleText?: string) => {
    doc.setFillColor(...NAVY);
    doc.rect(0, 0, PAGE_W, HEADER_H, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text(titleText, MARGIN, 12);
    if (subtitleText) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(180, 200, 255);
      doc.text(subtitleText, MARGIN, 16);
    }
  };

  drawHeader(
    countryName
      ? `Air Quality Monitoring Landscape — ${countryName}`
      : 'Air Quality Monitoring Landscape in Africa',
    filterSummary || undefined,
  );

  const STRIP_Y = HEADER_H;
  const STRIP_H = 9;
  doc.setFillColor(240, 242, 248);
  doc.rect(0, STRIP_Y, PAGE_W, STRIP_H, 'F');

  const filtersLabel =
    filterSummary ||
    `${selectedTypes.map(getTypeLabel).join(', ')}${activeOnly ? ' · Active only' : ''}`;
  const metaLine = `Scope: ${scopeText}  ·  Filters: ${filtersLabel}  ·  Generated: ${formatPdfDateTime(new Date().toISOString())}`;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(60, 70, 100);
  doc.text(metaLine, MARGIN, STRIP_Y + 6);

  const uniqueCountries = new Set(
    exportCountries
      .filter((country) => country.monitors.length > 0)
      .map((country) => country.country)
      .filter(Boolean),
  );
  const countriesMonitored = uniqueCountries.size;
  const countriesInReport = exportCountries.length;

  const countsByType: Record<string, number> = { Reference: 0, LCS: 0 };
  const countsByStatus: Record<string, number> = { active: 0, inactive: 0 };
  exportCountries.forEach((country) => {
    country.monitors.forEach((monitor) => {
      const type = monitor.type || 'LCS';
      countsByType[type] = (countsByType[type] || 0) + 1;
      const status = monitor.status || 'active';
      countsByStatus[status] = (countsByStatus[status] || 0) + 1;
    });
  });

  const BODY_Y = STRIP_Y + STRIP_H + 6;
  const SECTION_HEAD_COLOR: [number, number, number] = NAVY;
  const ALT_ROW: [number, number, number] = [245, 247, 252];
  const COMMON_STYLES = {
    font: 'helvetica' as const,
    fontSize: 9,
    cellPadding: 3,
  };

  const summaryBody: string[][] = [];
  summaryBody.push(['Total monitors', String(totalMonitors)]);
  summaryBody.push(['Countries in report', String(countriesInReport)]);
  summaryBody.push(['Countries with monitors', String(countriesMonitored)]);
  summaryBody.push(['Reference monitors', String(countsByType.Reference || 0)]);
  summaryBody.push([
    'Low-Cost Sensor (LCS) monitors',
    String(countsByType.LCS || 0),
  ]);
  summaryBody.push(['Active monitors', String(countsByStatus.active || 0)]);
  summaryBody.push(['Inactive monitors', String(countsByStatus.inactive || 0)]);

  if (impactData) {
    summaryBody.push([
      'Population reached',
      impactData.totalPopulationReached
        ? impactData.totalPopulationReached.toLocaleString()
        : '--',
    ]);
    summaryBody.push([
      'Cities with population data',
      String(impactData.citiesWithPopulationData),
    ]);
    summaryBody.push(['Total cities', String(impactData.totalCities)]);
  }

  autoTable(doc, {
    startY: BODY_Y,
    head: [['Metric', 'Value']],
    body: summaryBody,
    theme: 'grid',
    styles: COMMON_STYLES,
    headStyles: {
      fillColor: SECTION_HEAD_COLOR,
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: { fillColor: ALT_ROW },
    columnStyles: {
      0: { cellWidth: CONTENT_W * 0.6 },
      1: { cellWidth: CONTENT_W * 0.4, halign: 'right' },
    },
    margin: { left: MARGIN, right: MARGIN },
    didDrawPage: () => drawFooter(),
  });

  let currentY = ((doc as any).lastAutoTable?.finalY ?? BODY_Y + 50) + 8;

  if (currentY > PAGE_H - 55) {
    doc.addPage('a4', 'landscape');
    currentY = MARGIN;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Country summary', MARGIN, currentY);
  currentY += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    'Monitor counts by country in the current report scope.',
    MARGIN,
    currentY,
  );
  currentY += 5;

  autoTable(doc, {
    startY: currentY,
    head: [['Country', 'ISO', 'Monitors', 'Active']],
    body: countrySummaryRows,
    theme: 'grid',
    styles: COMMON_STYLES,
    headStyles: {
      fillColor: SECTION_HEAD_COLOR,
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: { fillColor: ALT_ROW },
    columnStyles: {
      0: { cellWidth: CONTENT_W * 0.5 },
      1: { cellWidth: CONTENT_W * 0.15, halign: 'center' },
      2: { cellWidth: CONTENT_W * 0.175, halign: 'right' },
      3: { cellWidth: CONTENT_W * 0.175, halign: 'right' },
    },
    margin: { left: MARGIN, right: MARGIN },
    didDrawPage: () => drawFooter(),
  });

  currentY = ((doc as any).lastAutoTable?.finalY ?? currentY) + 8;

  if (impactData && impactData.byCity.length > 0) {
    if (currentY > PAGE_H - 55) {
      doc.addPage('a4', 'landscape');
      currentY = MARGIN;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('Population reached by city', MARGIN, currentY);
    currentY += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(
      'Estimated population in cities with active monitoring stations.',
      MARGIN,
      currentY,
    );
    currentY += 5;

    const cityPopRows = impactData.byCity.map((city: ImpactCityEntry) => [
      city.city,
      city.country,
      city.iso2 || '--',
      String(city.total),
      String(city.active),
      city.population ? city.population.toLocaleString() : '--',
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['City', 'Country', 'ISO', 'Monitors', 'Active', 'Population']],
      body: cityPopRows,
      theme: 'grid',
      styles: COMMON_STYLES,
      headStyles: {
        fillColor: SECTION_HEAD_COLOR,
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: { fillColor: ALT_ROW },
      columnStyles: {
        0: { cellWidth: CONTENT_W * 0.22 },
        1: { cellWidth: CONTENT_W * 0.2 },
        2: { cellWidth: CONTENT_W * 0.1, halign: 'center' },
        3: { cellWidth: CONTENT_W * 0.13, halign: 'right' },
        4: { cellWidth: CONTENT_W * 0.13, halign: 'right' },
        5: { cellWidth: CONTENT_W * 0.22, halign: 'right' },
      },
      margin: { left: MARGIN, right: MARGIN },
      didDrawPage: () => drawFooter(),
    });

    currentY = ((doc as any).lastAutoTable?.finalY ?? currentY) + 8;
  }

  if (countriesWithMonitors.length > 0) {
    if (currentY > PAGE_H - 55) {
      doc.addPage('a4', 'landscape');
      currentY = MARGIN;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('Monitor inventory', MARGIN, currentY);
    currentY += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(
      'Each country section lists the devices, coordinates, and status for the selected scope.',
      MARGIN,
      currentY,
    );
    currentY += 5;

    countriesWithMonitors.forEach((country) => {
      if (currentY > PAGE_H - 55) {
        doc.addPage('a4', 'landscape');
        currentY = MARGIN;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42);
      doc.text(
        `${country.country} (${country.iso2 || '--'})`,
        MARGIN,
        currentY,
      );
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text(
        `${country.monitors.length} monitor${country.monitors.length === 1 ? '' : 's'}`,
        PAGE_W - MARGIN,
        currentY,
        { align: 'right' },
      );
      currentY += 4.5;

      autoTable(doc, {
        startY: currentY,
        head: [
          ['Monitor', 'City', 'Type', 'Status', 'Coordinates', 'Manufacturer'],
        ],
        body: country.monitors.map((monitor) => [
          monitor.name || '--',
          monitor.city || '--',
          getTypeLabel(monitor.type),
          monitor.status === 'active' ? 'Active' : 'Inactive',
          formatExportCoordinates(monitor),
          displayText(monitor.manufacturer || monitor.organisation),
        ]),
        theme: 'grid',
        styles: {
          font: 'helvetica',
          fontSize: 8.2,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: SECTION_HEAD_COLOR,
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: { fillColor: ALT_ROW },
        columnStyles: {
          0: { cellWidth: CONTENT_W * 0.25 },
          1: { cellWidth: CONTENT_W * 0.14 },
          2: { cellWidth: CONTENT_W * 0.14 },
          3: { cellWidth: CONTENT_W * 0.12 },
          4: { cellWidth: CONTENT_W * 0.21 },
          5: { cellWidth: CONTENT_W * 0.14 },
        },
        margin: { left: MARGIN, right: MARGIN },
        didDrawPage: () => drawFooter(),
      });

      currentY = ((doc as any).lastAutoTable?.finalY ?? currentY) + 8;
    });
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('No monitors match the current filters.', MARGIN, currentY);
    currentY += 8;
  }

  try {
    if (snapshotGetter) {
      const dataUrl = await captureWithTimeout(
        () => snapshotGetter() ?? Promise.resolve(null),
        6000,
        null,
      );
      if (dataUrl && dataUrl.length > 100) {
        doc.addPage('a4', 'landscape');

        drawHeader(
          countryName
            ? `Map Snapshot — ${countryName}`
            : 'Map Snapshot — Air Quality Monitoring Landscape in Africa',
          `Scope: ${scopeText}`,
        );

        const IMG_Y = HEADER_H + 4;
        const IMG_H = PAGE_H - IMG_Y - 14;

        const img = new Image();
        img.src = dataUrl;
        await new Promise((resolve) => {
          img.onload = () => resolve(null);
          img.onerror = () => resolve(null);
        });

        const imgRatio =
          img.naturalWidth && img.naturalHeight
            ? img.naturalWidth / img.naturalHeight
            : CONTENT_W / IMG_H;
        let targetW = CONTENT_W;
        let targetH = CONTENT_W / imgRatio;
        if (targetH > IMG_H) {
          targetH = IMG_H;
          targetW = IMG_H * imgRatio;
        }

        const targetX = MARGIN + (CONTENT_W - targetW) / 2;
        doc.addImage(dataUrl, 'PNG', targetX, IMG_Y, targetW, targetH);

        drawFooter();
      }
    }
  } catch {
    // Snapshot failed — omit page 2, report is still complete
  }

  doc.save(buildPdfFileName(scopeLabel));
}

export async function generateCsv(data: ExportData): Promise<void> {
  const {
    countries: exportCountries,
    impactData,
    selectedTypes,
    activeOnly,
    selectedNetworks,
    selectedCountryId,
  } = data;

  const isSingleCountry = !!selectedCountryId && exportCountries.length === 1;
  const selectedCountryObj = isSingleCountry ? exportCountries[0] : null;
  const countryName = selectedCountryObj?.country ?? null;

  const scopeText = countryName ? countryName : 'All monitored countries';
  const scopeLabel = countryName
    ? countryName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    : 'all-countries';

  const allMonitors = exportCountries.flatMap((c) => c.monitors);
  const totalMonitors = allMonitors.length;
  const activeMonitors = allMonitors.filter(
    (m) => m.status === 'active',
  ).length;
  const inactiveMonitors = totalMonitors - activeMonitors;
  const referenceCount = allMonitors.filter(
    (m) => m.type === 'Reference',
  ).length;
  const lcsCount = allMonitors.filter((m) => m.type === 'LCS').length;
  const countriesWithMonitorsArray = exportCountries.filter(
    (c) => c.monitors.length > 0,
  );
  const countriesWithMonitors = countriesWithMonitorsArray.length;

  const cities = new Set(
    allMonitors.map((m) => `${m.city}, ${m.country}`).filter(Boolean),
  );
  const networks = new Set(allMonitors.map((m) => m.network).filter(Boolean));
  const manufacturers = new Set(
    allMonitors.map((m) => m.manufacturer).filter(Boolean),
  );
  const pollutants = new Set(
    allMonitors.flatMap((m) => m.pollutants).filter(Boolean),
  );

  const uptimeValues = allMonitors
    .map((m) => parseFloat(m.uptime30d))
    .filter((v) => !isNaN(v) && v >= 0 && v <= 100);
  const avgUptime =
    uptimeValues.length > 0
      ? (uptimeValues.reduce((a, b) => a + b, 0) / uptimeValues.length).toFixed(
          1,
        )
      : '--';

  const lines: string[] = [];

  lines.push('AIR QUALITY MONITORING NETWORK - SUMMARY REPORT');
  lines.push('');
  lines.push('Report Scope,' + escapeCsvField(scopeText));
  lines.push(
    'Generated,' +
      escapeCsvField(
        new Intl.DateTimeFormat(undefined, {
          dateStyle: 'medium',
          timeStyle: 'short',
        }).format(new Date()),
      ),
  );
  lines.push(
    'Filters Applied,' +
      escapeCsvField(
        `${selectedTypes.map((t) => getTypeLabel(t)).join(', ')}${activeOnly ? ' · Active only' : ''}${selectedNetworks.length > 0 ? ` · Sources: ${selectedNetworks.map((n) => formatNetworkName(n)).join(', ')}` : ''}`,
      ),
  );
  lines.push('');
  lines.push('NETWORK OVERVIEW');
  lines.push('Metric,Value');
  lines.push('Total Sensors Installed,' + totalMonitors);
  lines.push('Active Sensors,' + activeMonitors);
  lines.push('Inactive Sensors,' + inactiveMonitors);
  lines.push('Countries Represented,' + countriesWithMonitors);
  lines.push('Total Countries in Report,' + exportCountries.length);
  lines.push('Unique Cities/Locations,' + cities.size);
  lines.push('Data Sources/Networks,' + networks.size);
  lines.push('Unique Manufacturers,' + manufacturers.size);
  lines.push('Unique Pollutants Measured,' + pollutants.size);
  if (impactData) {
    lines.push(
      'Population Reached,' +
        (impactData.totalPopulationReached
          ? impactData.totalPopulationReached.toLocaleString()
          : '--'),
    );
    lines.push(
      'Cities with Population Data,' + impactData.citiesWithPopulationData,
    );
    lines.push('Total Cities Monitored,' + impactData.totalCities);
  }
  lines.push('');
  lines.push('MONITOR TYPE BREAKDOWN');
  lines.push('Type,Count,Percentage');
  lines.push(
    `Reference Monitors,${referenceCount},${totalMonitors > 0 ? ((referenceCount / totalMonitors) * 100).toFixed(1) : 0}%`,
  );
  lines.push(
    `Low-Cost Sensors (LCS),${lcsCount},${totalMonitors > 0 ? ((lcsCount / totalMonitors) * 100).toFixed(1) : 0}%`,
  );
  lines.push(
    `Inactive,${inactiveMonitors},${totalMonitors > 0 ? ((inactiveMonitors / totalMonitors) * 100).toFixed(1) : 0}%`,
  );
  lines.push('');
  lines.push('DATA QUALITY');
  lines.push('Metric,Value');
  lines.push('Average 30-Day Uptime,' + avgUptime + '%');
  lines.push(
    'Public Data Available,' +
      allMonitors.filter((m) => m.publicData === 'Yes').length +
      ' of ' +
      totalMonitors,
  );
  lines.push('');

  lines.push('COUNTRY SUMMARY');
  lines.push(
    'Country,ISO2,Total Monitors,Active,Inactive,Reference,LCS,Data Sources',
  );
  countriesWithMonitorsArray.forEach((country) => {
    const countryActive = country.monitors.filter(
      (m) => m.status === 'active',
    ).length;
    const countryInactive = country.monitors.length - countryActive;
    const countryRef = country.monitors.filter(
      (m) => m.type === 'Reference',
    ).length;
    const countryLcs = country.monitors.filter((m) => m.type === 'LCS').length;
    const countryNetworks = [
      ...new Set(country.monitors.map((m) => m.network).filter(Boolean)),
    ].join('; ');
    lines.push(
      [
        escapeCsvField(country.country),
        escapeCsvField(country.iso2),
        country.monitors.length,
        countryActive,
        countryInactive,
        countryRef,
        countryLcs,
        escapeCsvField(countryNetworks),
      ].join(','),
    );
  });
  lines.push('');

  lines.push('CITIES / LOCATIONS WITH MONITORS');
  lines.push('City,Country,ISO2,Number of Monitors,Sources');
  const cityMap = new Map<
    string,
    { country: string; iso2: string; count: number; networks: Set<string> }
  >();
  allMonitors.forEach((m) => {
    const key = `${m.city}|${m.country}`;
    if (!cityMap.has(key)) {
      cityMap.set(key, {
        country: m.country,
        iso2: m.iso2,
        count: 0,
        networks: new Set(),
      });
    }
    const entry = cityMap.get(key)!;
    entry.count += 1;
    if (m.network) entry.networks.add(m.network);
  });
  Array.from(cityMap.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .forEach(([cityKey, info]) => {
      const cityName = cityKey.split('|')[0];
      lines.push(
        [
          escapeCsvField(cityName),
          escapeCsvField(info.country),
          escapeCsvField(info.iso2),
          info.count,
          escapeCsvField([...info.networks].join('; ')),
        ].join(','),
      );
    });
  lines.push('');

  if (impactData && impactData.byCity.length > 0) {
    lines.push('POPULATION REACHED BY CITY');
    lines.push(
      'City,Country,ISO2,Total Monitors,Active,Population (estimated)',
    );
    impactData.byCity.forEach((city: ImpactCityEntry) => {
      lines.push(
        [
          escapeCsvField(city.city),
          escapeCsvField(city.country),
          escapeCsvField(city.iso2),
          city.total,
          city.active,
          city.population ? city.population.toLocaleString() : '--',
        ].join(','),
      );
    });
    lines.push('');
  }

  lines.push('SOURCE / NETWORK BREAKDOWN');
  lines.push('Source/Network,Total Monitors,Active,Inactive,Countries');
  const networkMap = new Map<
    string,
    {
      total: number;
      active: number;
      inactive: number;
      countries: Set<string>;
    }
  >();
  allMonitors.forEach((m) => {
    const net = m.network || 'Unknown';
    if (!networkMap.has(net)) {
      networkMap.set(net, {
        total: 0,
        active: 0,
        inactive: 0,
        countries: new Set(),
      });
    }
    const entry = networkMap.get(net)!;
    entry.total += 1;
    if (m.status === 'active') entry.active += 1;
    else entry.inactive += 1;
    if (m.country) entry.countries.add(m.country);
  });
  Array.from(networkMap.entries())
    .sort((a, b) => b[1].total - a[1].total)
    .forEach(([net, info]) => {
      lines.push(
        [
          escapeCsvField(net),
          info.total,
          info.active,
          info.inactive,
          info.countries.size,
        ].join(','),
      );
    });
  lines.push('');

  lines.push('DETAILED MONITOR DATA');
  lines.push(
    [
      'Monitor Name',
      'City',
      'Country',
      'ISO2',
      'Type',
      'Status',
      'Network/Source',
      'Operator',
      'Organization',
      'Manufacturer',
      'Equipment',
      'Pollutants',
      'Latitude',
      'Longitude',
      'Resolution',
      'Transmission',
      'Land Use',
      'Site',
      'Deployed',
      'Last Active',
      'Calibration Date',
      'Calibration Method',
      'Uptime (30d)',
      'Public Data',
      'Co-location',
      'View Data URL',
    ].join(','),
  );
  allMonitors.forEach((m) => {
    lines.push(
      [
        escapeCsvField(m.name),
        escapeCsvField(m.city),
        escapeCsvField(m.country),
        escapeCsvField(m.iso2),
        escapeCsvField(m.type),
        escapeCsvField(m.status),
        escapeCsvField(m.network),
        escapeCsvField(m.operator),
        escapeCsvField(m.organisation),
        escapeCsvField(m.manufacturer),
        escapeCsvField(m.equipment),
        escapeCsvField(m.pollutants.join('; ')),
        m.latitude ?? '',
        m.longitude ?? '',
        escapeCsvField(m.resolution),
        escapeCsvField(m.transmission),
        escapeCsvField(m.landUse),
        escapeCsvField(m.site),
        escapeCsvField(m.deployed),
        escapeCsvField(m.lastActive),
        escapeCsvField(m.calibrationLastDate),
        escapeCsvField(m.calibrationMethod),
        escapeCsvField(m.uptime30d),
        escapeCsvField(m.publicData),
        escapeCsvField(m.coLocation),
        escapeCsvField(m.viewDataUrl),
      ].join(','),
    );
  });

  const csvContent = lines.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = buildCsvFileName(scopeLabel, 'data');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
