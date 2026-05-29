'use client';

import React from 'react';
import { usePostHog } from 'posthog-js/react';
import {
  AqBarChartSquareUp,
  AqFileCheck03,
  AqPlus,
  AqRefreshCcw01,
  AqTable,
  AqTrash01,
  AqUploadCloud01,
} from '@airqo/icons-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DatePicker,
  InfoBanner,
  Input,
  LoadingSpinner,
  Select,
  WarningBanner,
  toast,
  type DateRange,
} from '@/shared/components/ui';
import { cn } from '@/shared/lib/utils';
import {
  CHART_TYPE_HELP,
  CHART_TYPE_LABELS,
  MAX_UPLOAD_FILE_SIZE_BYTES,
  SOURCE_COLUMN_KEYS,
  UPLOAD_CANCEL_WARN_MS,
} from '../constants';
import type {
  DatasetProfile,
  UploadedDataset,
  VisualizerDraftSourceFile,
  VisualizerChartConfig,
  VisualizerChartType,
  VisualizerWorkspaceDraft,
} from '../types';
import { profileDataset } from '../utils/dataProfiling';
import {
  getReadableFileSize,
  parseUploadedFile,
  parseUploadedFiles,
} from '../utils/parseFiles';
import {
  formatColumnLabel,
  formatMeasurementLabel,
} from '../utils/measurementLabels';
import {
  detectCoordinateColumns,
  hasCoordinateColumns,
  type CoordinateColumns,
} from '../utils/geospatial';
import {
  buildWorkspaceProfile,
  getDatasetRowsForChart,
  getDatasetSummary,
} from '../utils/workspaceData';
import {
  deleteWorkspaceDraft,
  loadWorkspaceDraft,
  saveWorkspaceDraft,
} from '../utils/workspaceStorage';
import { VisualizerChartCard } from './VisualizerChartCard';
import { DATE_FORMATS, formatWithPattern } from '@/shared/utils';
import { trackEvent } from '@/shared/utils/analytics';

interface DataVisualizerWorkspaceProps {
  title?: string;
  subtitle?: string;
}

const PARSE_MESSAGES = [
  'Reading your file…',
  'Scanning columns and headers…',
  'Detecting date and time fields…',
  'Identifying measurement columns…',
  'Parsing rows — large files take a moment…',
  'Almost there, profiling your data…',
  'Finalising dataset…',
] as const;

const DEFAULT_CHART_ORDER: VisualizerChartType[] = [
  'line',
  'bar',
  'area',
  'composed',
  'scatter',
  'histogram',
  'pie',
  'radar',
  'map',
];

const createChartId = () => {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }

  return `chart-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const createSourceFileId = () => {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }

  return `source-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const createChartConfig = (
  type: VisualizerChartType,
  profile: DatasetProfile,
  datasetIds: string[],
  index: number,
  coordinateColumns: CoordinateColumns = {}
): VisualizerChartConfig => {
  const metricColumn =
    profile.defaultMetricColumn || profile.numericColumns[0] || '';
  const secondaryMetricColumn =
    profile.defaultSecondaryMetricColumn ||
    profile.numericColumns.find(column => column !== metricColumn);
  const compareColumn =
    datasetIds.length > 1
      ? SOURCE_COLUMN_KEYS.dataset
      : profile.defaultCompareColumn || profile.dimensionColumns[0];

  const isDatasetComparison = datasetIds.length > 1;
  const metricLabel = formatMeasurementLabel(metricColumn);
  const compareLabel = formatColumnLabel(compareColumn);
  const isMap = type === 'map';

  return {
    id: createChartId(),
    title: isDatasetComparison
      ? `${CHART_TYPE_LABELS[type]} comparison ${index}`
      : `${CHART_TYPE_LABELS[type]} ${index}`,
    subtitle: isDatasetComparison
      ? `${metricLabel} by ${compareLabel}`
      : isMap
        ? 'Spatial distribution from detected coordinates.'
        : CHART_TYPE_HELP[type],
    type,
    datasetIds,
    metricColumn,
    secondaryMetricColumn:
      type === 'scatter' || type === 'composed'
        ? secondaryMetricColumn
        : undefined,
    xColumn:
      type === 'bar' || type === 'pie' || type === 'radar'
        ? compareColumn
        : profile.defaultTimeColumn,
    compareColumn:
      type === 'histogram'
        ? undefined
        : type === 'bar' || type === 'pie' || type === 'radar'
          ? compareColumn
          : compareColumn,
    latitudeColumn: isMap ? coordinateColumns.latitudeColumn : undefined,
    longitudeColumn: isMap ? coordinateColumns.longitudeColumn : undefined,
    mapLayer: isMap ? 'points' : undefined,
    aggregation: 'average',
    maxGroups: 8,
    showGrid: true,
    showLegend: true,
    showXAxisLabel: true,
    xAxisLabel: formatColumnLabel(
      type === 'bar' || type === 'pie' || type === 'radar'
        ? compareColumn
        : profile.defaultTimeColumn
    ),
    showYAxisLabel: true,
    yAxisLabel: formatMeasurementLabel(metricColumn),
    showReferenceLines: /pm/i.test(metricColumn),
    referenceColor: '#DC2626',
    standards: 'WHO',
    height: 340,
    seriesColors: {},
  };
};

const buildInitialCharts = (
  profile: DatasetProfile,
  datasetIds: string[],
  coordinateColumns: CoordinateColumns = {}
) => {
  if (profile.numericColumns.length === 0) {
    return [];
  }

  const initialTypes: VisualizerChartType[] = [
    ...(profile.defaultTimeColumn ? ['line', 'bar'] : ['bar', 'histogram']),
    ...(hasCoordinateColumns(coordinateColumns) ? ['map'] : []),
  ] as VisualizerChartType[];

  return initialTypes.map((type, index) =>
    createChartConfig(type, profile, datasetIds, index + 1, coordinateColumns)
  );
};

const getColumnKindClass = (kind: string) => {
  switch (kind) {
    case 'time':
      return 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-200 dark:ring-blue-500/20';
    case 'numeric':
      return 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-200 dark:ring-emerald-500/20';
    case 'dimension':
      return 'bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-200 dark:ring-violet-500/20';
    default:
      return 'bg-muted text-muted-foreground ring-border';
  }
};

const formatDraftSavedAt = (savedAt: string) =>
  formatWithPattern(savedAt, DATE_FORMATS.READABLE_DATETIME);

const normalizeChartConfig = (
  chart: VisualizerChartConfig
): VisualizerChartConfig => ({
  ...chart,
  showXAxisLabel: chart.showXAxisLabel !== false,
  xAxisLabel: chart.xAxisLabel || formatColumnLabel(chart.xColumn),
  showYAxisLabel: chart.showYAxisLabel !== false,
  yAxisLabel: chart.yAxisLabel || formatMeasurementLabel(chart.metricColumn),
});

export const DataVisualizerWorkspace: React.FC<
  DataVisualizerWorkspaceProps
> = ({
  title = 'Upload & Visualize Air Quality Data',
  subtitle = 'Upload air quality files, compare sources, and create export-ready charts.',
}) => {
  const posthog = usePostHog();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const sourceFilesRef = React.useRef(new Map<string, File>());
  const hasTrackedViewRef = React.useRef(false);
  const parseAbortRef = React.useRef<AbortController | null>(null);
  const [datasets, setDatasets] = React.useState<UploadedDataset[]>([]);
  const [charts, setCharts] = React.useState<VisualizerChartConfig[]>([]);
  const [activeChartId, setActiveChartId] = React.useState<
    string | undefined
  >();
  const [isParsing, setIsParsing] = React.useState(false);
  const [parseMessage, setParseMessage] = React.useState<string>(
    PARSE_MESSAGES[0]
  );
  const [showCancelHint, setShowCancelHint] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isDragActive, setIsDragActive] = React.useState(false);
  const [uploadOpen, setUploadOpen] = React.useState(true);
  const [draft, setDraft] = React.useState<VisualizerWorkspaceDraft | null>(
    null
  );
  const [lastSavedAt, setLastSavedAt] = React.useState<string | null>(null);
  const [appliedDateRange, setAppliedDateRange] = React.useState<DateRange | null>(null);

  // Cycle through friendly status messages while parsing
  React.useEffect(() => {
    if (!isParsing) {
      setParseMessage(PARSE_MESSAGES[0]);
      setShowCancelHint(false);
      return;
    }

    let msgIdx = 0;
    const msgInterval = window.setInterval(() => {
      msgIdx = (msgIdx + 1) % PARSE_MESSAGES.length;
      setParseMessage(PARSE_MESSAGES[msgIdx]);
    }, 2200);

    const cancelHintTimer = window.setTimeout(() => {
      setShowCancelHint(true);
    }, UPLOAD_CANCEL_WARN_MS);

    return () => {
      window.clearInterval(msgInterval);
      window.clearTimeout(cancelHintTimer);
    };
  }, [isParsing]);

  const trackVisualizerEvent = React.useCallback(
    (eventName: string, properties: Record<string, unknown> = {}) => {
      const payload = {
        module: 'air_quality_explorer',
        ...properties,
      };

      posthog?.capture(eventName, payload);
      trackEvent(eventName, payload);
    },
    [posthog]
  );

  const buildDraftFileState = React.useCallback(() => {
    const sourceFiles: VisualizerDraftSourceFile[] = [];
    const datasetFileMap: Record<string, string> = {};
    const sourceIdsByFile = new Map<File, string>();

    sourceFilesRef.current.forEach((file, datasetId) => {
      let sourceId = sourceIdsByFile.get(file);

      if (!sourceId) {
        sourceId = createSourceFileId();
        sourceIdsByFile.set(file, sourceId);
        sourceFiles.push({
          id: sourceId,
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          file,
        });
      }

      datasetFileMap[datasetId] = sourceId;
    });

    return { sourceFiles, datasetFileMap };
  }, []);

  const restoreDraftFileSources = React.useCallback(
    (workspaceDraft: VisualizerWorkspaceDraft) => {
      sourceFilesRef.current.clear();

      const filesById = new Map<string, File>();

      workspaceDraft.sourceFiles?.forEach(sourceFile => {
        if (sourceFile.file instanceof File) {
          filesById.set(sourceFile.id, sourceFile.file);
        }
      });

      Object.entries(workspaceDraft.datasetFileMap ?? {}).forEach(
        ([datasetId, sourceFileId]) => {
          const file = filesById.get(sourceFileId);

          if (file) {
            sourceFilesRef.current.set(datasetId, file);
          }
        }
      );
    },
    []
  );

  const allDatasetIds = React.useMemo(
    () => datasets.map(dataset => dataset.id),
    [datasets]
  );
  const workspaceRows = React.useMemo(
    () => getDatasetRowsForChart(datasets, allDatasetIds),
    [allDatasetIds, datasets]
  );
  const workspaceProfile = React.useMemo(
    () => profileDataset(workspaceRows, { includeDateRange: true }),
    [workspaceRows]
  );
  const workspaceCoordinateColumns = React.useMemo(
    () =>
      detectCoordinateColumns(workspaceRows, workspaceProfile.numericColumns),
    [workspaceProfile.numericColumns, workspaceRows]
  );
  const workspaceSummary = React.useMemo(
    () => getDatasetSummary(datasets, allDatasetIds),
    [allDatasetIds, datasets]
  );

  const datasetDateRange = React.useMemo(() => {
    if (!workspaceProfile.minDate || !workspaceProfile.maxDate) return null;
    return {
      min: workspaceProfile.minDate,
      max: workspaceProfile.maxDate,
    };
  }, [workspaceProfile.minDate, workspaceProfile.maxDate]);

  // When a new dataset is loaded, pre-fill date range to the full dataset period (only if not already set)
  React.useEffect(() => {
    if (!datasetDateRange) return;
    setAppliedDateRange(prev =>
      prev ? prev : { from: datasetDateRange.min, to: datasetDateRange.max }
    );
  }, [datasetDateRange]);

  React.useEffect(() => {
    if (hasTrackedViewRef.current) {
      return;
    }

    hasTrackedViewRef.current = true;
    trackVisualizerEvent('air_quality_explorer_viewed');
  }, [trackVisualizerEvent]);

  React.useEffect(() => {
    let mounted = true;

    loadWorkspaceDraft()
      .then(savedDraft => {
        if (mounted) {
          setDraft(savedDraft);
        }
      })
      .catch(error => {
        console.warn('Could not load visualizer draft:', error);
      });

    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    if (datasets.length === 0) {
      return;
    }

    const timeout = window.setTimeout(() => {
      const { sourceFiles, datasetFileMap } = buildDraftFileState();

      saveWorkspaceDraft({
        name: 'AirQo air quality explorer draft',
        datasets,
        sourceFiles,
        datasetFileMap,
        charts,
        activeChartId,
      })
        .then(savedDraft => {
          setDraft(savedDraft);
          setLastSavedAt(savedDraft.savedAt);
        })
        .catch(error => {
          console.warn('Could not autosave visualizer draft:', error);
        });
    }, 1200);

    return () => window.clearTimeout(timeout);
  }, [activeChartId, buildDraftFileState, charts, datasets]);

  const applyNewDatasets = React.useCallback(
    (newDatasets: UploadedDataset[], source: 'upload' | 'sheet' = 'upload') => {
      if (newDatasets.length === 0) {
        return;
      }

      setDatasets(current => {
        const nextDatasets = [...current, ...newDatasets];
        const datasetIds = nextDatasets.map(dataset => dataset.id);
        const profile = buildWorkspaceProfile(nextDatasets, datasetIds);
        const rows = getDatasetRowsForChart(nextDatasets, datasetIds);
        const coordinateColumns = detectCoordinateColumns(
          rows,
          profile.numericColumns
        );

        setCharts(currentCharts => {
          if (currentCharts.length > 0) {
            return currentCharts.map(chart => ({
              ...chart,
              datasetIds: Array.from(
                new Set([...chart.datasetIds, ...newDatasets.map(d => d.id)])
              ),
            }));
          }

          const initialCharts = buildInitialCharts(
            profile,
            datasetIds,
            coordinateColumns
          );
          setActiveChartId(initialCharts[0]?.id);
          return initialCharts;
        });

        return nextDatasets;
      });

      setUploadOpen(false);
      toast.success(
        'Datasets ready',
        `${newDatasets.length} file${newDatasets.length === 1 ? '' : 's'} loaded for comparison.`
      );
      trackVisualizerEvent('air_quality_explorer_datasets_added', {
        source,
        dataset_count: newDatasets.length,
        row_count: newDatasets.reduce(
          (total, dataset) => total + dataset.rowCount,
          0
        ),
        file_types: Array.from(
          new Set(newDatasets.map(dataset => dataset.fileType))
        ).join(','),
        workbook_count: newDatasets.filter(
          dataset => dataset.sheetOptions.length > 1
        ).length,
      });
    },
    [trackVisualizerEvent]
  );

  const cancelParsing = React.useCallback(() => {
    parseAbortRef.current?.abort();
    setIsParsing(false);
    setShowCancelHint(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.warning('Upload cancelled', 'File reading was stopped.');
  }, []);

  const handleFiles = React.useCallback(
    async (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      if (files.length === 0) {
        return;
      }

      const abortController = new AbortController();
      parseAbortRef.current = abortController;

      setIsParsing(true);
      setError(null);

      try {
        const { datasets: parsedDatasets, errors } =
          await parseUploadedFiles(files);

        if (abortController.signal.aborted) {
          return;
        }

        files.forEach(file => {
          const matchingDatasets = parsedDatasets.filter(
            dataset => dataset.fileName === file.name
          );
          matchingDatasets.forEach(dataset =>
            sourceFilesRef.current.set(dataset.id, file)
          );
        });

        applyNewDatasets(parsedDatasets);

        if (errors.length > 0) {
          const message = errors
            .map(item => `${item.fileName}: ${item.message}`)
            .join(' ');
          setError(message);
          toast.warning('Some files were skipped', message);
          trackVisualizerEvent('air_quality_explorer_import_warning', {
            file_count: files.length,
            skipped_count: errors.length,
            imported_dataset_count: parsedDatasets.length,
          });
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsParsing(false);
        }
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [applyNewDatasets, trackVisualizerEvent]
  );

  const resetWorkspace = React.useCallback(async () => {
    const previousDatasetCount = datasets.length;
    const previousChartCount = charts.length;

    setDatasets([]);
    setCharts([]);
    setActiveChartId(undefined);
    setError(null);
    setUploadOpen(true);
    setAppliedDateRange(null);
    sourceFilesRef.current.clear();
    await deleteWorkspaceDraft().catch(() => undefined);
    setDraft(null);
    setLastSavedAt(null);
    trackVisualizerEvent('air_quality_explorer_workspace_cleared', {
      dataset_count: previousDatasetCount,
      chart_count: previousChartCount,
    });
  }, [charts.length, datasets.length, trackVisualizerEvent]);

  const restoreDraft = () => {
    if (!draft) {
      return;
    }

    const restoredCharts = draft.charts.map(normalizeChartConfig);

    setDatasets(draft.datasets);
    setCharts(restoredCharts);
    setActiveChartId(draft.activeChartId || restoredCharts[0]?.id);
    restoreDraftFileSources(draft);
    setUploadOpen(false);
    setLastSavedAt(draft.savedAt);
    toast.success('Draft restored', 'Your previous work is ready to continue.');
    trackVisualizerEvent('air_quality_explorer_draft_restored', {
      dataset_count: draft.datasets.length,
      chart_count: draft.charts.length,
      source_file_count: draft.sourceFiles?.length ?? 0,
    });
  };

  const addChart = (type: VisualizerChartType) => {
    if (datasets.length === 0 || workspaceProfile.numericColumns.length === 0) {
      toast.warning(
        'No metrics available',
        'Upload data with at least one numeric measurement column first.'
      );
      return;
    }

    if (type === 'map' && !hasCoordinateColumns(workspaceCoordinateColumns)) {
      toast.warning(
        'Coordinates needed',
        'Add latitude and longitude fields to create a map view.'
      );
      return;
    }

    const nextChart = createChartConfig(
      type,
      workspaceProfile,
      allDatasetIds,
      charts.length + 1,
      workspaceCoordinateColumns
    );
    setCharts(current => [...current, nextChart]);
    setActiveChartId(nextChart.id);
    trackVisualizerEvent('air_quality_explorer_chart_added', {
      chart_type: type,
      dataset_count: allDatasetIds.length,
      has_time_column: Boolean(workspaceProfile.defaultTimeColumn),
    });

    window.setTimeout(() => {
      document
        .getElementById(`visualizer-chart-${nextChart.id}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const updateChart = (chartId: string, nextChart: VisualizerChartConfig) => {
    setCharts(current =>
      current.map(chart => (chart.id === chartId ? nextChart : chart))
    );
  };

  const removeChart = (chartId: string) => {
    const chartToRemove = charts.find(chart => chart.id === chartId);

    setCharts(current => {
      const nextCharts = current.filter(chart => chart.id !== chartId);
      if (activeChartId === chartId) {
        setActiveChartId(nextCharts[0]?.id);
      }
      return nextCharts;
    });
    trackVisualizerEvent('air_quality_explorer_chart_removed', {
      chart_type: chartToRemove?.type,
      remaining_chart_count: Math.max(0, charts.length - 1),
    });
  };

  const updateDataset = (
    datasetId: string,
    partial: Partial<UploadedDataset>
  ) => {
    setDatasets(current =>
      current.map(dataset =>
        dataset.id === datasetId ? { ...dataset, ...partial } : dataset
      )
    );
  };

  const removeDataset = (datasetId: string) => {
    if (datasets.length === 1) {
      void resetWorkspace();
      return;
    }

    const remainingDatasetIds = datasets
      .filter(dataset => dataset.id !== datasetId)
      .map(dataset => dataset.id);

    setDatasets(current => current.filter(dataset => dataset.id !== datasetId));
    setCharts(current =>
      current.map(chart => {
        const nextDatasetIds = chart.datasetIds.filter(id => id !== datasetId);
        return {
          ...chart,
          datasetIds:
            nextDatasetIds.length > 0 ? nextDatasetIds : remainingDatasetIds,
        };
      })
    );
    sourceFilesRef.current.delete(datasetId);
    trackVisualizerEvent('air_quality_explorer_dataset_removed', {
      remaining_dataset_count: remainingDatasetIds.length,
      chart_count: charts.length,
    });
  };

  const changeDatasetSheet = async (
    dataset: UploadedDataset,
    sheetName: string
  ) => {
    const file = sourceFilesRef.current.get(dataset.id);

    if (!file) {
      toast.warning(
        'Re-upload needed',
        'Upload the file again to choose another sheet.'
      );
      return;
    }

    setIsParsing(true);
    try {
      const parsedDataset = await parseUploadedFile(file, {
        sheetName,
        knownSheets: dataset.sheetOptions,
        label: `${file.name.replace(/\.[^.]+$/, '')} - ${sheetName}`,
      });

      updateDataset(dataset.id, {
        ...parsedDataset,
        id: dataset.id,
      });
      trackVisualizerEvent('air_quality_explorer_sheet_changed', {
        sheet_count: dataset.sheetOptions.length,
        row_count: parsedDataset.rowCount,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'The sheet could not be loaded.';
      toast.error('Sheet failed', message);
    } finally {
      setIsParsing(false);
    }
  };

  const addSheetAsDataset = async (dataset: UploadedDataset) => {
    const file = sourceFilesRef.current.get(dataset.id);

    if (!file || dataset.sheetOptions.length <= 1) {
      return;
    }

    const nextSheet = dataset.sheetOptions.find(
      sheet => sheet.name !== dataset.sheetName
    );

    if (!nextSheet) {
      return;
    }

    setIsParsing(true);
    try {
      const parsedDataset = await parseUploadedFile(file, {
        sheetName: nextSheet.name,
        knownSheets: dataset.sheetOptions,
      });
      sourceFilesRef.current.set(parsedDataset.id, file);
      applyNewDatasets([parsedDataset], 'sheet');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'The sheet could not be loaded.';
      toast.error('Sheet failed', message);
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragActive(false);
    void handleFiles(event.dataTransfer.files);
  };

  const saveNow = async () => {
    if (datasets.length === 0) {
      return;
    }

    const { sourceFiles, datasetFileMap } = buildDraftFileState();

    try {
      const savedDraft = await saveWorkspaceDraft({
        name: 'AirQo air quality explorer draft',
        datasets,
        sourceFiles,
        datasetFileMap,
        charts,
        activeChartId,
      });
      setDraft(savedDraft);
      setLastSavedAt(savedDraft.savedAt);
      toast.success('Draft saved', 'You can return later to continue.');
      trackVisualizerEvent('air_quality_explorer_draft_saved', {
        dataset_count: datasets.length,
        chart_count: charts.length,
        source_file_count: sourceFiles.length,
        manual: true,
      });
    } catch (error) {
      console.warn('Could not save visualizer draft:', error);
      toast.warning(
        'Draft not saved',
        'Your browser could not keep this draft right now. You can continue working in this tab.'
      );
      trackVisualizerEvent('air_quality_explorer_draft_save_failed', {
        dataset_count: datasets.length,
        chart_count: charts.length,
        manual: true,
      });
    }
  };

  const showUploadPanel = datasets.length === 0 || uploadOpen;

  const filterRowsByDate = React.useCallback(
    (rows: import('../types').UploadedDataRow[]) => {
      if (!appliedDateRange?.from && !appliedDateRange?.to) return rows;
      const timeCol = workspaceProfile.defaultTimeColumn;
      if (!timeCol) return rows;
      const from = appliedDateRange.from ? appliedDateRange.from.getTime() : -Infinity;
      const to = appliedDateRange.to
        ? new Date(appliedDateRange.to.getFullYear(), appliedDateRange.to.getMonth(), appliedDateRange.to.getDate(), 23, 59, 59, 999).getTime()
        : Infinity;
      return rows.filter(row => {
        const rawVal = row[timeCol];
        if (rawVal == null) return true;
        const d = rawVal instanceof Date ? rawVal : new Date(String(rawVal));
        if (Number.isNaN(d.getTime())) return true;
        return d.getTime() >= from && d.getTime() <= to;
      });
    },
    [appliedDateRange, workspaceProfile.defaultTimeColumn]
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <WarningBanner
        title="Private draft"
        message="Uploaded files are kept private while you work. Drafts can help you continue later, but they are not a permanent backup and may be removed if site data is cleared."
        dense
      />

      {datasets.length > 0 && (
        <Card>
          <CardContent className="flex flex-col gap-3 p-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div>
                <div className="text-xs text-muted-foreground">Datasets</div>
                <div className="font-medium text-foreground">
                  {workspaceSummary.datasetCount}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Rows</div>
                <div className="font-medium text-foreground">
                  {workspaceSummary.rowCount.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Columns</div>
                <div className="font-medium text-foreground">
                  {workspaceSummary.columnCount.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Last saved</div>
                <div className="font-medium text-foreground">
                  {lastSavedAt ? formatDraftSavedAt(lastSavedAt) : 'Pending'}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="sr-only"
                onChange={event => {
                  if (event.target.files) {
                    void handleFiles(event.target.files);
                  }
                }}
              />
              <Button
                size="sm"
                Icon={AqUploadCloud01}
                onClick={() => fileInputRef.current?.click()}
                showTextOnMobile
              >
                Add files
              </Button>
              <Button
                size="sm"
                variant="outlined"
                onClick={() => setUploadOpen(open => !open)}
              >
                {uploadOpen ? 'Hide drop zone' : 'Show drop zone'}
              </Button>
              <Button
                size="sm"
                variant="outlined"
                onClick={() => void saveNow()}
              >
                Save draft
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => void resetWorkspace()}
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {draft && datasets.length === 0 && (
        <InfoBanner
          title="Previous draft available"
          message={`Saved ${formatDraftSavedAt(draft.savedAt)}. Restore it to continue your analysis.`}
          actions={
            <Button size="sm" variant="outlined" onClick={restoreDraft}>
              Restore
            </Button>
          }
          dense
        />
      )}

      {showUploadPanel && (
        <Card>
          <CardHeader className="p-4 pb-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center gap-2 text-base text-foreground">
                <AqUploadCloud01 className="h-4 w-4 text-primary" />
                Upload Dataset
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                CSV and XLSX, up to{' '}
                {getReadableFileSize(MAX_UPLOAD_FILE_SIZE_BYTES)} each.
              </p>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <label
              onDragOver={event => {
                event.preventDefault();
                setIsDragActive(true);
              }}
              onDragLeave={() => setIsDragActive(false)}
              onDrop={handleDrop}
              className={cn(
                'flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-md border border-dashed px-4 py-5 text-center transition-colors',
                isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-background hover:border-primary/50 hover:bg-muted/40'
              )}
            >
              <input
                type="file"
                multiple
                accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="sr-only"
                onChange={event => {
                  if (event.target.files) {
                    void handleFiles(event.target.files);
                  }
                }}
              />

              {isParsing ? (
                <div className="flex flex-col items-center gap-3">
                  <LoadingSpinner />
                  <span className="text-sm text-muted-foreground transition-all duration-500">
                    {parseMessage}
                  </span>
                  {showCancelHint && (
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs text-muted-foreground">
                        Large files may take a while. You can cancel and try a
                        smaller file.
                      </span>
                      <Button
                        size="sm"
                        variant="outlined"
                        onClick={cancelParsing}
                        className="mt-1"
                      >
                        Cancel upload
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <AqUploadCloud01 className="mb-2 h-6 w-6 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    Choose one or more files, or drop them here
                  </span>
                  <span className="mt-1 text-xs text-muted-foreground">
                    Use multiple datasets to compare sites, devices, agencies,
                    sheets, or field campaigns.
                  </span>
                </>
              )}
            </label>

            {error && (
              <div className="mt-3">
                <WarningBanner title="Import issue" message={error} dense />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {datasets.length > 0 && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-foreground">
                <AqFileCheck03 className="h-4 w-4 text-primary" />
                Data sources
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 p-4 pt-2 lg:grid-cols-2">
              {datasets.map(dataset => (
                <div
                  key={dataset.id}
                  className="rounded-md border border-border bg-background p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <Input
                        label="Label"
                        value={dataset.label}
                        onChange={(
                          event: React.ChangeEvent<HTMLInputElement>
                        ) =>
                          updateDataset(dataset.id, {
                            label: event.target.value,
                          })
                        }
                        containerClassName="mb-2"
                        className="h-9"
                      />
                      <div className="text-xs text-muted-foreground">
                        {dataset.fileName} - {dataset.rowCount.toLocaleString()}{' '}
                        rows
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      Icon={AqTrash01}
                      onClick={() => removeDataset(dataset.id)}
                      className="text-destructive hover:bg-destructive/10"
                    />
                  </div>

                  {dataset.sheetOptions.length > 1 && (
                    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                      <Select
                        label="Sheet"
                        value={dataset.sheetName || ''}
                        onChange={event =>
                          void changeDatasetSheet(
                            dataset,
                            String(event.target.value)
                          )
                        }
                        containerClassName="mb-0"
                        disabled={isParsing}
                      >
                        {dataset.sheetOptions.map(sheet => (
                          <option key={sheet.name} value={sheet.name}>
                            {sheet.name} ({sheet.rowCount.toLocaleString()})
                          </option>
                        ))}
                      </Select>
                      <Button
                        size="sm"
                        variant="outlined"
                        onClick={() => void addSheetAsDataset(dataset)}
                        className="self-end"
                      >
                        Add sheet
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-foreground">
                <AqTable className="h-4 w-4 text-primary" />
                Detected fields
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="max-h-[270px] space-y-2 overflow-y-auto pr-1">
                {workspaceProfile.columns.map(column => (
                  <div
                    key={column.name}
                    className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2"
                  >
                    <div className="min-w-0">
                      <div
                        className="truncate text-sm font-medium text-foreground"
                        title={column.name}
                      >
                        {column.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {column.nonEmptyCount.toLocaleString()} values
                      </div>
                    </div>
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-2 py-0.5 text-xs ring-1',
                        getColumnKindClass(column.kind)
                      )}
                    >
                      {column.kind}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {datasets.length > 0 && datasetDateRange && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Date range
                </label>
                <DatePicker
                  mode="range"
                  value={appliedDateRange ?? undefined}
                  onChange={value => {
                    if (
                      value &&
                      typeof value === 'object' &&
                      'from' in value &&
                      !(value instanceof Date)
                    ) {
                      setAppliedDateRange(value as DateRange);
                    }
                  }}
                  showPresets={false}
                  placeholder="Select date range"
                  className="w-full max-w-none"
                />
              </div>
              <Button
                size="sm"
                variant="outlined"
                onClick={() =>
                  setAppliedDateRange({
                    from: datasetDateRange.min,
                    to: datasetDateRange.max,
                  })
                }
              >
                Reset range
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Dataset period:{' '}
              <span className="font-medium">
                {datasetDateRange.min.toLocaleDateString()} –{' '}
                {datasetDateRange.max.toLocaleDateString()}
              </span>
              . Click the date range picker above and press{' '}
              <span className="font-medium">Apply</span> to filter charts.
            </p>
          </CardContent>
        </Card>
      )}

      {datasets.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                  <AqBarChartSquareUp className="h-4 w-4 text-primary" />
                  Charts
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Current charts are shown below. Add more views for trend,
                  distribution, standards, and source comparison analysis.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_CHART_ORDER.filter(
                  type =>
                    type !== 'map' ||
                    hasCoordinateColumns(workspaceCoordinateColumns)
                ).map(type => (
                  <Button
                    key={type}
                    size="sm"
                    variant="outlined"
                    onClick={() => addChart(type)}
                  >
                    {CHART_TYPE_LABELS[type]}
                  </Button>
                ))}
              </div>
            </div>

            {charts.length > 0 && (
              <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
                {charts.map(chart => (
                  <button
                    key={chart.id}
                    type="button"
                    onClick={() => {
                      setActiveChartId(chart.id);
                      document
                        .getElementById(`visualizer-chart-${chart.id}`)
                        ?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start',
                        });
                    }}
                    className={cn(
                      'rounded-md border px-3 py-2 text-left text-sm transition-colors',
                      activeChartId === chart.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-background hover:border-primary/40'
                    )}
                  >
                    <div className="truncate font-medium text-foreground">
                      {chart.title}
                    </div>
                    <div className="mt-1 truncate text-xs text-muted-foreground">
                      {CHART_TYPE_LABELS[chart.type]} -{' '}
                      {formatMeasurementLabel(chart.metricColumn)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {datasets.length > 0 && workspaceProfile.numericColumns.length === 0 && (
        <WarningBanner
          title="No chartable metrics"
          message="Add at least one numeric measurement such as PM2.5, PM10, AQI, temperature, humidity, or another value."
        />
      )}

      {charts.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {charts.map((chart, index) => {
            const rawRows = getDatasetRowsForChart(datasets, chart.datasetIds);
            const rows = filterRowsByDate(rawRows);
            const profile = profileDataset(rows);

            return (
              <div id={`visualizer-chart-${chart.id}`} key={chart.id}>
                <VisualizerChartCard
                  datasets={datasets}
                  profile={profile}
                  rows={rows}
                  chart={chart}
                  chartNumber={index + 1}
                  active={chart.id === activeChartId}
                  canRemove={charts.length > 1}
                  onActivate={() => setActiveChartId(chart.id)}
                  onChange={nextChart => updateChart(chart.id, nextChart)}
                  onRemove={() => removeChart(chart.id)}
                  onTrack={trackVisualizerEvent}
                />
              </div>
            );
          })}
        </div>
      )}

      {datasets.length > 0 && charts.length === 0 && (
        <Card>
          <CardContent className="flex min-h-[150px] flex-col items-center justify-center p-4 text-center">
            <AqRefreshCcw01 className="mb-3 h-7 w-7 text-muted-foreground" />
            <div className="text-sm font-medium text-foreground">
              No charts yet
            </div>
            <Button
              className="mt-3"
              size="sm"
              Icon={AqPlus}
              onClick={() =>
                addChart(workspaceProfile.defaultTimeColumn ? 'line' : 'bar')
              }
              showTextOnMobile
            >
              Add chart
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
