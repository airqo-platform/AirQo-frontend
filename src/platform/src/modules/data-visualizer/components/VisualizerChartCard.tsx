'use client';

import React from 'react';
import { HiChevronDown } from 'react-icons/hi';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  AqDownload01,
  AqPalette,
  AqSettings01,
  AqTrash01,
} from '@airqo/icons-react';
import {
  AGGREGATION_LABELS,
  CHART_TYPE_HELP,
  CHART_TYPE_LABELS,
  COLOR_PICKER_FALLBACKS,
} from '../constants';
import type {
  AggregationMethod,
  DatasetProfile,
  UploadedDataset,
  UploadedDataRow,
  VisualizerChartConfig,
  VisualizerChartType,
} from '../types';
import { buildChartModel } from '../utils/chartTransforms';
import {
  formatColumnLabel,
  formatMeasurementLabel,
  formatSelectOptionLabel,
} from '../utils/measurementLabels';
import {
  Button,
  Card,
  CardContent,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Select,
  toast,
} from '@/shared/components/ui';
import { cn } from '@/shared/lib/utils';
import { VisualizerChart } from './VisualizerChart';
import { VisualizerMapChart } from './VisualizerMapChart';

interface VisualizerChartCardProps {
  datasets: UploadedDataset[];
  profile: DatasetProfile;
  rows: UploadedDataRow[];
  chart: VisualizerChartConfig;
  chartNumber: number;
  active?: boolean;
  canRemove: boolean;
  onActivate?: () => void;
  onChange: (chart: VisualizerChartConfig) => void;
  onRemove: () => void;
  onTrack?: (eventName: string, properties?: Record<string, unknown>) => void;
}

const STANDARDS_LABELS = {
  WHO: 'WHO',
  NEMA_UGANDA: 'NEMA Uganda',
  NEMA_KENYA: 'NEMA Kenya',
} as const;

const MAP_LAYER_LABELS: Record<
  NonNullable<VisualizerChartConfig['mapLayer']>,
  string
> = {
  points: 'Points',
  heatmap: 'Heatmap',
  grid: 'Grid choropleth',
};

const EXPORT_TEXT_COLOR = '#1c1d20';
const EXPORT_MUTED_COLOR = '#64748b';
const EXPORT_BORDER_COLOR = '#e2e8f0';
const EXPORT_BACKGROUND_COLOR = '#ffffff';

const sanitizeFilename = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'airqo-visualization';

const saveBlobToDisk = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = filename;
  anchor.style.visibility = 'hidden';

  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

const canvasToBlob = (canvas: HTMLCanvasElement) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Could not render chart image.'));
      }
    }, 'image/png');
  });

const getColorInputValue = (
  colors: Record<string, string>,
  key: string,
  index: number
) =>
  colors[key] || COLOR_PICKER_FALLBACKS[index % COLOR_PICKER_FALLBACKS.length];

const isTransparentColor = (value: string) =>
  !value ||
  value === 'transparent' ||
  value === 'rgba(0, 0, 0, 0)' ||
  value === 'rgb(0 0 0 / 0)';

const parseColorComponent = (value: string) => {
  const normalized = value.trim();

  if (normalized.endsWith('%')) {
    return (Number(normalized.slice(0, -1)) / 100) * 255;
  }

  const numericValue = Number(normalized);
  return numericValue <= 1 ? numericValue * 255 : numericValue;
};

const normalizeCssColor = (value: string, fallback: string) => {
  const color = value.trim();

  if (!color || color === 'currentColor') {
    return fallback;
  }

  if (color === 'transparent' || color === 'none') {
    return color;
  }

  const rgbMatch = color.match(/^rgba?\((.+)\)$/i);
  if (rgbMatch) {
    const [channelsPart, alphaPart] = rgbMatch[1].split('/');
    const channels = channelsPart
      .trim()
      .split(/[\s,]+/)
      .filter(Boolean)
      .slice(0, 3)
      .map(parseColorComponent);
    const alpha = alphaPart ? Number(alphaPart.trim()) : undefined;

    if (channels.length === 3 && channels.every(Number.isFinite)) {
      const [red, green, blue] = channels.map(channel =>
        Math.max(0, Math.min(255, Math.round(channel)))
      );

      return Number.isFinite(alpha)
        ? `rgba(${red}, ${green}, ${blue}, ${alpha})`
        : `rgb(${red}, ${green}, ${blue})`;
    }
  }

  const srgbMatch = color.match(/^color\(\s*srgb\s+(.+)\)$/i);
  if (srgbMatch) {
    const [channelsPart, alphaPart] = srgbMatch[1].split('/');
    const channels = channelsPart
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 3)
      .map(parseColorComponent);
    const alpha = alphaPart ? Number(alphaPart.trim()) : undefined;

    if (channels.length === 3 && channels.every(Number.isFinite)) {
      const [red, green, blue] = channels.map(channel =>
        Math.max(0, Math.min(255, Math.round(channel)))
      );

      return Number.isFinite(alpha)
        ? `rgba(${red}, ${green}, ${blue}, ${alpha})`
        : `rgb(${red}, ${green}, ${blue})`;
    }
  }

  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (context) {
      context.fillStyle = '#010203';
      context.fillStyle = color;

      if (context.fillStyle !== '#010203') {
        return context.fillStyle;
      }
    }
  }

  return fallback;
};

const applyExportCloneStyles = (
  documentClone: Document,
  chartId: string,
  originalRoot: HTMLElement
) => {
  const clonedRoot = documentClone.querySelector(
    `[data-chart-export-id="${chartId}"]`
  );
  const cloneView = documentClone.defaultView;

  if (!cloneView || !(clonedRoot instanceof cloneView.HTMLElement)) {
    return;
  }

  const originalElements = [
    originalRoot,
    ...Array.from(originalRoot.querySelectorAll('*')),
  ];
  const clonedElements = [
    clonedRoot,
    ...Array.from(clonedRoot.querySelectorAll('*')),
  ];
  const SVGElementCtor = cloneView.SVGElement;

  clonedRoot.style.boxShadow = 'none';
  clonedRoot.style.overflow = 'visible';
  clonedRoot.style.paddingTop = '24px';
  clonedRoot.style.paddingBottom = '24px';
  clonedRoot.style.backgroundColor = EXPORT_BACKGROUND_COLOR;
  clonedRoot.style.color = EXPORT_TEXT_COLOR;

  clonedElements.forEach((clonedElement, index) => {
    const originalElement = originalElements[index];

    if (!originalElement) {
      return;
    }

    const computedStyles = window.getComputedStyle(originalElement);
    const clonedStyle = (clonedElement as HTMLElement | SVGElement).style;

    if (clonedStyle) {
      clonedStyle.color = normalizeCssColor(
        computedStyles.color,
        EXPORT_TEXT_COLOR
      );
      clonedStyle.borderColor = normalizeCssColor(
        computedStyles.borderTopColor,
        EXPORT_BORDER_COLOR
      );

      if (!isTransparentColor(computedStyles.backgroundColor)) {
        clonedStyle.backgroundColor = normalizeCssColor(
          computedStyles.backgroundColor,
          EXPORT_BACKGROUND_COLOR
        );
      }
    }

    const isSvgElement = SVGElementCtor
      ? clonedElement instanceof SVGElementCtor
      : clonedElement.namespaceURI === 'http://www.w3.org/2000/svg';

    if (!isSvgElement) {
      return;
    }

    const originalSvgElement = originalElement as SVGElement;
    const clonedSvgElement = clonedElement as SVGElement;
    const fillAttribute = originalSvgElement.getAttribute('fill');
    const strokeAttribute = originalSvgElement.getAttribute('stroke');

    if (fillAttribute && fillAttribute !== 'none') {
      clonedSvgElement.setAttribute(
        'fill',
        normalizeCssColor(computedStyles.fill, EXPORT_TEXT_COLOR)
      );
    }

    if (strokeAttribute && strokeAttribute !== 'none') {
      clonedSvgElement.setAttribute(
        'stroke',
        normalizeCssColor(computedStyles.stroke, EXPORT_BORDER_COLOR)
      );
    }
  });

  documentClone
    .querySelectorAll('.recharts-legend-wrapper')
    .forEach(element => {
      if (element instanceof cloneView.HTMLElement) {
        element.style.color = EXPORT_TEXT_COLOR;
        element.style.backgroundColor = 'transparent';
      }
    });

  documentClone
    .querySelectorAll('.recharts-legend-item-text, .recharts-text')
    .forEach(element => {
      const style = (element as HTMLElement | SVGElement).style;
      style.color = EXPORT_MUTED_COLOR;
      style.fill = EXPORT_MUTED_COLOR;
    });

  const clonedTitle = documentClone.querySelector(
    `[data-chart-export-title="${chartId}"]`
  );

  if (clonedTitle instanceof cloneView.HTMLElement) {
    clonedTitle.style.whiteSpace = 'normal';
    clonedTitle.style.overflow = 'visible';
    clonedTitle.style.textOverflow = 'clip';
    clonedTitle.style.color = EXPORT_TEXT_COLOR;
  }
};

export const VisualizerChartCard: React.FC<VisualizerChartCardProps> = ({
  datasets,
  profile,
  rows,
  chart,
  chartNumber,
  active = false,
  canRemove,
  onActivate,
  onChange,
  onRemove,
  onTrack,
}) => {
  const captureRef = React.useRef<HTMLDivElement | null>(null);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);
  const [editingField, setEditingField] = React.useState<
    'title' | 'subtitle' | null
  >(null);
  const [draftTitle, setDraftTitle] = React.useState(chart.title);
  const [draftSubtitle, setDraftSubtitle] = React.useState(
    chart.subtitle || ''
  );
  const model = React.useMemo(
    () => buildChartModel(rows, chart),
    [chart, rows]
  );
  const title = chart.title || `Chart ${chartNumber}`;
  const selectedDatasetIds = new Set(chart.datasetIds);

  React.useEffect(() => {
    if (editingField !== 'title') {
      setDraftTitle(chart.title);
    }

    if (editingField !== 'subtitle') {
      setDraftSubtitle(chart.subtitle || '');
    }
  }, [chart.subtitle, chart.title, editingField]);

  const colorTargets = React.useMemo(() => {
    if (chart.type === 'pie') {
      return model.data.map((entry, index) => {
        const label = String(entry[model.xKey] ?? `Segment ${index + 1}`);
        return { key: label, label, index };
      });
    }

    return model.seriesKeys.map((key, index) => ({
      key,
      label: model.seriesLabels[key] ?? key,
      index,
    }));
  }, [chart.type, model]);

  const updateChart = (partial: Partial<VisualizerChartConfig>) => {
    onChange({
      ...chart,
      ...partial,
    });
  };

  const updateSeriesColor = (key: string, color: string) => {
    updateChart({
      seriesColors: {
        ...chart.seriesColors,
        [key]: color,
      },
    });
  };
  const commitTitle = () => {
    const nextTitle = draftTitle.trim() || `Chart ${chartNumber}`;
    setEditingField(null);
    updateChart({ title: nextTitle });
    if (nextTitle !== chart.title) {
      onTrack?.('air_quality_explorer_chart_label_updated', {
        field: 'title',
        chart_type: chart.type,
      });
    }
  };
  const commitSubtitle = () => {
    const nextSubtitle = draftSubtitle.trim();
    setEditingField(null);
    updateChart({ subtitle: nextSubtitle || undefined });
    if (nextSubtitle !== (chart.subtitle || '')) {
      onTrack?.('air_quality_explorer_chart_label_updated', {
        field: 'subtitle',
        chart_type: chart.type,
      });
    }
  };
  const handleEditableKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    field: 'title' | 'subtitle'
  ) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (field === 'title') {
        commitTitle();
      } else {
        commitSubtitle();
      }
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      setDraftTitle(chart.title);
      setDraftSubtitle(chart.subtitle || '');
      setEditingField(null);
    }
  };

  const exportChart = async (format: 'png' | 'pdf') => {
    if (!captureRef.current || isExporting) {
      return;
    }

    setIsExporting(true);
    try {
      await document.fonts?.ready;
      const exportElement = captureRef.current;
      const exportRect = exportElement.getBoundingClientRect();
      const canvas = await html2canvas(exportElement, {
        backgroundColor: EXPORT_BACKGROUND_COLOR,
        scale: Math.min(3, window.devicePixelRatio || 2),
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: Math.ceil(exportRect.width),
        height: Math.ceil(exportRect.height),
        scrollX: 0,
        scrollY: -window.scrollY,
        windowWidth: Math.max(
          document.documentElement.scrollWidth,
          Math.ceil(exportRect.width)
        ),
        windowHeight: Math.max(
          document.documentElement.scrollHeight,
          Math.ceil(exportRect.height)
        ),
        ignoreElements: element => {
          const htmlElement = element as HTMLElement;
          return (
            element.hasAttribute('data-html2canvas-ignore') ||
            htmlElement.style?.display === 'none' ||
            htmlElement.style?.visibility === 'hidden'
          );
        },
        onclone: documentClone => {
          applyExportCloneStyles(documentClone, chart.id, exportElement);
        },
      });
      const filename = sanitizeFilename(title);

      if (format === 'png') {
        saveBlobToDisk(await canvasToBlob(canvas), `${filename}.png`);
      } else {
        const imageData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: canvas.width >= canvas.height ? 'landscape' : 'portrait',
          unit: 'mm',
          format: 'a4',
        });
        const margin = 10;
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const maxWidth = pageWidth - margin * 2;
        const maxHeight = pageHeight - margin * 2;
        const scale = Math.min(
          maxWidth / canvas.width,
          maxHeight / canvas.height
        );
        const finalWidth = canvas.width * scale;
        const finalHeight = canvas.height * scale;
        const x = (pageWidth - finalWidth) / 2;
        const y = margin;

        pdf.addImage(imageData, 'PNG', x, y, finalWidth, finalHeight);
        pdf.save(`${filename}.pdf`);
      }

      toast.success(
        `Exported ${format.toUpperCase()}`,
        'The chart was captured with its labels, legend, colors, and reference lines.'
      );
      onTrack?.('air_quality_explorer_chart_exported', {
        format,
        chart_type: chart.type,
        dataset_count: chart.datasetIds.length,
        series_count: model.seriesKeys.length,
      });
    } catch (error) {
      console.error('Chart export failed:', error);
      toast.error('Export failed', 'We could not capture this chart.');
      onTrack?.('air_quality_explorer_chart_export_failed', {
        format,
        chart_type: chart.type,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const toggleDataset = (datasetId: string, checked: boolean) => {
    const nextIds = new Set(chart.datasetIds);

    if (checked) {
      nextIds.add(datasetId);
    } else if (nextIds.size > 1) {
      nextIds.delete(datasetId);
    }

    updateChart({ datasetIds: Array.from(nextIds) });
    onTrack?.('air_quality_explorer_chart_sources_changed', {
      chart_type: chart.type,
      dataset_count: nextIds.size,
    });
  };
  const xAxisLabel = chart.xAxisLabel || formatColumnLabel(chart.xColumn);
  const yAxisLabel =
    chart.yAxisLabel || formatMeasurementLabel(chart.metricColumn);
  const compareLabel = chart.compareColumn
    ? formatColumnLabel(chart.compareColumn)
    : 'No series grouping';
  const selectedDatasetCount = chart.datasetIds.length;

  return (
    <Card
      className="overflow-visible border border-border/90 shadow-sm"
      data-active={active ? 'true' : 'false'}
      onClick={onActivate}
    >
      <div
        ref={captureRef}
        data-chart-export-id={chart.id}
        className="bg-card p-4 sm:p-5"
      >
        <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 flex-1">
            {editingField === 'title' ? (
              <input
                autoFocus
                value={draftTitle}
                onClick={event => event.stopPropagation()}
                onChange={event => setDraftTitle(event.target.value)}
                onBlur={commitTitle}
                onKeyDown={event => handleEditableKeyDown(event, 'title')}
                className="w-full rounded-md border border-primary/40 bg-background px-2 py-1 text-lg font-semibold leading-snug text-foreground outline-none ring-2 ring-primary/10"
                aria-label="Custom chart title"
              />
            ) : (
              <button
                type="button"
                className="block w-full rounded-sm text-left outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/30"
                onClick={event => {
                  event.stopPropagation();
                  setDraftTitle(chart.title);
                  setEditingField('title');
                }}
                title="Edit chart title"
              >
                <span
                  className="block text-lg font-semibold leading-snug text-foreground"
                  data-chart-export-title={chart.id}
                >
                  {title}
                </span>
              </button>
            )}
            {editingField === 'subtitle' ? (
              <input
                autoFocus
                value={draftSubtitle}
                onClick={event => event.stopPropagation()}
                onChange={event => setDraftSubtitle(event.target.value)}
                onBlur={commitSubtitle}
                onKeyDown={event => handleEditableKeyDown(event, 'subtitle')}
                placeholder="Add a custom subtitle"
                className="mt-1 w-full rounded-md border border-primary/40 bg-background px-2 py-1 text-sm leading-relaxed text-muted-foreground outline-none ring-2 ring-primary/10"
                aria-label="Custom chart subtitle"
              />
            ) : (
              <button
                type="button"
                className="mt-1 block w-full rounded-sm text-left outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/30"
                onClick={event => {
                  event.stopPropagation();
                  setDraftSubtitle(chart.subtitle || '');
                  setEditingField('subtitle');
                }}
                title="Edit chart subtitle"
              >
                <span className="block text-sm leading-relaxed text-muted-foreground">
                  {chart.subtitle ||
                    `${CHART_TYPE_LABELS[chart.type]} - ${CHART_TYPE_HELP[chart.type]}`}
                </span>
              </button>
            )}
            <div
              className="mt-1 text-[11px] text-muted-foreground"
              data-html2canvas-ignore="true"
            >
              Click title or subtitle to customize labels.
            </div>

            <div
              className="mt-3 flex flex-wrap gap-2 text-xs"
              data-html2canvas-ignore="true"
            >
              <span className="rounded-full border border-border bg-background px-2 py-1 text-muted-foreground">
                Y: {yAxisLabel || 'Not selected'}
              </span>
              <span className="rounded-full border border-border bg-background px-2 py-1 text-muted-foreground">
                X: {xAxisLabel}
              </span>
              <span className="rounded-full border border-border bg-background px-2 py-1 text-muted-foreground">
                Series: {compareLabel}
              </span>
              <span className="rounded-full border border-primary/25 bg-primary/5 px-2 py-1 text-primary">
                {selectedDatasetCount} dataset
                {selectedDatasetCount === 1 ? '' : 's'}
              </span>
            </div>
          </div>

          <div
            className="flex shrink-0 items-center gap-2"
            data-html2canvas-ignore="true"
          >
            <Button
              variant="outlined"
              size="sm"
              Icon={AqSettings01}
              onClick={event => {
                event.stopPropagation();
                const nextOpen = !settingsOpen;
                setSettingsOpen(nextOpen);
                onTrack?.('air_quality_explorer_chart_config_toggled', {
                  chart_type: chart.type,
                  open: nextOpen,
                });
              }}
              showTextOnMobile
            >
              {settingsOpen ? 'Hide configuration' : 'Configure'}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    'flex items-center space-x-1 rounded-md border px-3 py-2 text-sm font-medium text-muted-foreground shadow-sm',
                    'transition-colors hover:bg-muted hover:text-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20'
                  )}
                  disabled={isExporting}
                  aria-label={`${title} actions`}
                >
                  <span>{isExporting ? 'Exporting' : 'More'}</span>
                  <HiChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onClick={() => void exportChart('pdf')}
                  disabled={isExporting}
                >
                  <AqDownload01 className="mr-2 h-4 w-4" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => void exportChart('png')}
                  disabled={isExporting}
                >
                  <AqDownload01 className="mr-2 h-4 w-4" />
                  Export as PNG
                </DropdownMenuItem>
                {canRemove && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={onRemove}
                      className="text-destructive focus:text-destructive"
                    >
                      <AqTrash01 className="mr-2 h-4 w-4" />
                      {chart.type === 'map' ? 'Remove map' : 'Remove chart'}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {settingsOpen && (
          <div
            className="mb-4 rounded-md border border-border bg-background/70 p-3"
            onClick={event => event.stopPropagation()}
            data-html2canvas-ignore="true"
          >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-6">
              <Input
                label="Title"
                value={chart.title}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  updateChart({ title: event.target.value })
                }
                containerClassName="mb-0 md:col-span-2"
              />
              <Input
                label="Subtitle"
                value={chart.subtitle || ''}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  updateChart({ subtitle: event.target.value })
                }
                containerClassName="mb-0 md:col-span-2"
              />
              <Select
                label="Type"
                value={chart.type}
                onChange={event =>
                  updateChart({
                    type: event.target.value as VisualizerChartType,
                  })
                }
                containerClassName="mb-0"
              >
                {Object.entries(CHART_TYPE_LABELS).map(([type, label]) => (
                  <option key={type} value={type}>
                    {label}
                  </option>
                ))}
              </Select>
              {chart.type === 'map' && (
                <Select
                  label="Map layer"
                  value={chart.mapLayer ?? 'points'}
                  onChange={event =>
                    updateChart({
                      mapLayer: event.target.value as NonNullable<
                        VisualizerChartConfig['mapLayer']
                      >,
                    })
                  }
                  containerClassName="mb-0"
                >
                  {Object.entries(MAP_LAYER_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              )}
              <Input
                label="Height"
                type="number"
                min={240}
                max={760}
                value={chart.height}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  updateChart({
                    height: Math.min(
                      760,
                      Math.max(240, Number(event.target.value) || 340)
                    ),
                  })
                }
                containerClassName="mb-0"
              />
              <Select
                label="Y axis measurement"
                value={chart.metricColumn}
                onChange={event => {
                  const nextMetricColumn = String(event.target.value);
                  const nextMetricLabel =
                    formatMeasurementLabel(nextMetricColumn);
                  const shouldSyncYAxisLabel =
                    !chart.yAxisLabel ||
                    chart.yAxisLabel === chart.metricColumn ||
                    chart.yAxisLabel ===
                      formatMeasurementLabel(chart.metricColumn);

                  updateChart({
                    metricColumn: nextMetricColumn,
                    yAxisLabel: shouldSyncYAxisLabel
                      ? nextMetricLabel
                      : chart.yAxisLabel,
                    showReferenceLines:
                      chart.showReferenceLines || /pm/i.test(nextMetricColumn),
                  });
                }}
                containerClassName="mb-0"
              >
                {profile.numericColumns.map(column => (
                  <option key={column} value={column}>
                    {formatSelectOptionLabel(column)}
                  </option>
                ))}
              </Select>
              <Input
                label="Y-axis label"
                value={
                  chart.yAxisLabel ?? formatMeasurementLabel(chart.metricColumn)
                }
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  updateChart({
                    yAxisLabel: event.target.value || undefined,
                  })
                }
                containerClassName="mb-0"
              />
              {chart.type === 'map' && (
                <>
                  <Select
                    label="Latitude"
                    value={chart.latitudeColumn || ''}
                    onChange={event =>
                      updateChart({
                        latitudeColumn: String(event.target.value) || undefined,
                      })
                    }
                    containerClassName="mb-0"
                  >
                    <option value="">Select latitude</option>
                    {profile.numericColumns.map(column => (
                      <option key={column} value={column}>
                        {formatSelectOptionLabel(column)}
                      </option>
                    ))}
                  </Select>
                  <Select
                    label="Longitude"
                    value={chart.longitudeColumn || ''}
                    onChange={event =>
                      updateChart({
                        longitudeColumn:
                          String(event.target.value) || undefined,
                      })
                    }
                    containerClassName="mb-0"
                  >
                    <option value="">Select longitude</option>
                    {profile.numericColumns.map(column => (
                      <option key={column} value={column}>
                        {formatSelectOptionLabel(column)}
                      </option>
                    ))}
                  </Select>
                </>
              )}
              <Select
                label="X axis time or category"
                value={chart.xColumn || ''}
                onChange={event => {
                  const nextXColumn = String(event.target.value) || undefined;
                  const nextXLabel = formatColumnLabel(nextXColumn);
                  const currentXLabel = formatColumnLabel(chart.xColumn);
                  const shouldSyncXAxisLabel =
                    !chart.xAxisLabel ||
                    chart.xAxisLabel === currentXLabel ||
                    chart.xAxisLabel === chart.xColumn;

                  updateChart({
                    xColumn: nextXColumn,
                    xAxisLabel: shouldSyncXAxisLabel
                      ? nextXLabel
                      : chart.xAxisLabel,
                  });
                }}
                containerClassName="mb-0"
              >
                <option value="">Record order</option>
                {profile.timeColumns.map(column => (
                  <option key={column} value={column}>
                    {formatSelectOptionLabel(column)}
                  </option>
                ))}
                {profile.dimensionColumns.map(column => (
                  <option key={column} value={column}>
                    {formatSelectOptionLabel(column)}
                  </option>
                ))}
              </Select>
              <Input
                label="X-axis label"
                value={chart.xAxisLabel ?? formatColumnLabel(chart.xColumn)}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  updateChart({
                    xAxisLabel: event.target.value || undefined,
                  })
                }
                containerClassName="mb-0"
              />
              <Select
                label="Series / compare by"
                value={chart.compareColumn || ''}
                onChange={event =>
                  updateChart({
                    compareColumn: String(event.target.value) || undefined,
                  })
                }
                containerClassName="mb-0"
              >
                <option value="">No grouping</option>
                {profile.dimensionColumns.map(column => (
                  <option key={column} value={column}>
                    {formatSelectOptionLabel(column)}
                  </option>
                ))}
              </Select>
              <Select
                label="Second metric"
                value={chart.secondaryMetricColumn || ''}
                onChange={event =>
                  updateChart({
                    secondaryMetricColumn:
                      String(event.target.value) || undefined,
                  })
                }
                containerClassName="mb-0"
              >
                <option value="">None</option>
                {profile.numericColumns
                  .filter(column => column !== chart.metricColumn)
                  .map(column => (
                    <option key={column} value={column}>
                      {formatSelectOptionLabel(column)}
                    </option>
                  ))}
              </Select>
              <Select
                label="Aggregation"
                value={chart.aggregation}
                onChange={event =>
                  updateChart({
                    aggregation: event.target.value as AggregationMethod,
                  })
                }
                containerClassName="mb-0"
              >
                {Object.entries(AGGREGATION_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
              <Select
                label="Standards"
                value={chart.standards}
                onChange={event =>
                  updateChart({
                    standards: event.target
                      .value as VisualizerChartConfig['standards'],
                  })
                }
                containerClassName="mb-0"
              >
                {Object.entries(STANDARDS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
              <Input
                label="Max groups"
                type="number"
                min={1}
                max={20}
                value={chart.maxGroups}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  updateChart({
                    maxGroups: Math.min(
                      20,
                      Math.max(1, Number(event.target.value) || 1)
                    ),
                  })
                }
                containerClassName="mb-0"
              />
              <Input
                label="Reference value"
                type="number"
                value={chart.referenceValue ?? ''}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  const value = Number(event.target.value);
                  updateChart({
                    referenceValue:
                      event.target.value === '' || !Number.isFinite(value)
                        ? undefined
                        : value,
                    showReferenceLines:
                      chart.showReferenceLines || event.target.value !== '',
                  });
                }}
                containerClassName="mb-0"
              />
              <Input
                label="Reference label"
                value={chart.referenceLabel || ''}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  updateChart({
                    referenceLabel: event.target.value || undefined,
                  })
                }
                containerClassName="mb-0"
              />
              <label className="mb-0 flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-foreground">
                  Reference color
                </span>
                <input
                  type="color"
                  value={chart.referenceColor || '#DC2626'}
                  onChange={event =>
                    updateChart({ referenceColor: event.target.value })
                  }
                  className="h-10 w-full cursor-pointer rounded-md border border-border bg-background p-1"
                />
              </label>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-foreground">
                <Checkbox
                  checked={chart.showGrid}
                  onCheckedChange={checked =>
                    updateChart({ showGrid: checked })
                  }
                />
                Grid
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <Checkbox
                  checked={chart.showLegend}
                  onCheckedChange={checked =>
                    updateChart({ showLegend: checked })
                  }
                />
                Legend
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <Checkbox
                  checked={chart.showXAxisLabel !== false}
                  onCheckedChange={checked =>
                    updateChart({ showXAxisLabel: checked })
                  }
                />
                X-axis label
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <Checkbox
                  checked={chart.showYAxisLabel !== false}
                  onCheckedChange={checked =>
                    updateChart({ showYAxisLabel: checked })
                  }
                />
                Y-axis label
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <Checkbox
                  checked={chart.showReferenceLines}
                  onCheckedChange={checked =>
                    updateChart({ showReferenceLines: checked })
                  }
                />
                Reference lines
              </label>
            </div>

            <div className="mt-3 rounded-md border border-border bg-card p-3">
              <div className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                Datasets in this chart
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {datasets.map(dataset => (
                  <label
                    key={dataset.id}
                    className="flex min-w-0 items-center gap-2 rounded-md border border-border px-2 py-1.5 text-sm"
                  >
                    <Checkbox
                      checked={selectedDatasetIds.has(dataset.id)}
                      onCheckedChange={checked =>
                        toggleDataset(dataset.id, checked)
                      }
                    />
                    <span className="truncate" title={dataset.label}>
                      {dataset.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {colorTargets.length > 0 && (
              <div className="mt-3 rounded-md border border-border bg-card p-3">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                  <AqPalette className="h-4 w-4 text-primary" />
                  <span>Colors</span>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {colorTargets.map(({ key, label, index }) => (
                    <label
                      key={key}
                      className="flex min-w-0 items-center justify-between gap-2 rounded-md border border-border px-2 py-1.5 text-sm"
                    >
                      <span className="truncate" title={label}>
                        {label}
                      </span>
                      <input
                        type="color"
                        value={
                          chart.seriesColors[key] ||
                          getColorInputValue(chart.seriesColors, key, index)
                        }
                        onChange={event =>
                          updateSeriesColor(key, event.target.value)
                        }
                        className="h-7 w-9 shrink-0 cursor-pointer rounded border border-border bg-transparent"
                        aria-label={`Color for ${label}`}
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {chart.type === 'map' ? (
          <VisualizerMapChart rows={rows} config={chart} />
        ) : (
          <VisualizerChart model={model} config={chart} />
        )}
      </div>

      <CardContent className="border-t border-border px-4 py-2 text-xs text-muted-foreground sm:px-5">
        {rows.length.toLocaleString()} rows across {chart.datasetIds.length}{' '}
        dataset{chart.datasetIds.length === 1 ? '' : 's'}
      </CardContent>
    </Card>
  );
};
