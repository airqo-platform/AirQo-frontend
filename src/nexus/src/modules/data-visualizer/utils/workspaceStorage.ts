import type { UploadedDataRow, VisualizerWorkspaceDraft } from '../types';

const DB_NAME = 'airqo-data-visualizer';
const DB_VERSION = 2;
const DRAFT_STORE = 'drafts';
/**
 * Parsed rows live in their own store, keyed by dataset id, so that editing a
 * chart rewrites only the small config record. Writing the rows inline meant
 * re-serializing every row (up to 50k per file) on every keystroke-timer,
 * which exhausted the storage quota and made *every* save fail.
 */
const DATA_STORE = 'draftData';
const DEFAULT_DRAFT_ID = 'default-workspace';

type DraftRecord = Omit<VisualizerWorkspaceDraft, 'datasets'> & {
  datasets: VisualizerWorkspaceDraft['datasets'];
  /** Row fingerprint per dataset, so unchanged data is never rewritten. */
  rowSignatures?: Record<string, string>;
};

interface StoredDatasetData {
  datasetId: string;
  signature: string;
  rows: UploadedDataRow[];
}

const openWorkspaceDb = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('Draft storage is not available.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    // Without a timeout, an open blocked by another tab on an older version
    // never settles and saving silently wedges forever.
    const timeout = setTimeout(() => {
      reject(
        new Error(
          'Draft storage is blocked by another tab. Close other AirQo tabs and reload.'
        )
      );
    }, 5000);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(DRAFT_STORE)) {
        db.createObjectStore(DRAFT_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(DATA_STORE)) {
        db.createObjectStore(DATA_STORE, { keyPath: 'datasetId' });
      }
    };

    request.onsuccess = () => {
      clearTimeout(timeout);
      resolve(request.result);
    };
    request.onerror = () => {
      clearTimeout(timeout);
      reject(request.error || new Error('Could not open draft storage.'));
    };
    request.onblocked = () => {
      clearTimeout(timeout);
      reject(
        new Error(
          'Draft storage upgrade is blocked by another AirQo tab. Close it and reload.'
        )
      );
    };
  });

/**
 * Explains an IndexedDB failure instead of surfacing a bare "saving failed".
 * The four causes need very different user actions, so they are named.
 */
export const describeStorageError = (error: unknown): string => {
  const name = error instanceof DOMException ? error.name : '';
  const message = error instanceof Error ? error.message : String(error);

  switch (name) {
    case 'QuotaExceededError':
      return 'The draft is too large for this browser to store.';
    case 'DataCloneError':
      return 'Part of the draft could not be stored (it holds a value the browser cannot save).';
    case 'InvalidStateError':
      return 'Draft storage is not available in this browser mode.';
    case 'SecurityError':
      return 'This browser blocked storage for the site.';
    case 'UnknownError':
      return 'The browser could not store the draft (usually out of space, or private browsing).';
    default:
      return message;
  }
};

/**
 * Proves a value can be persisted before handing it to IndexedDB. A
 * non-cloneable value (a File handle, a function, a DOM node) otherwise fails
 * opaquely and takes the whole save with it.
 */
const assertCloneable = (value: unknown, context: string): void => {
  if (typeof structuredClone !== 'function') {
    return;
  }

  try {
    structuredClone(value);
  } catch (error) {
    throw new DOMException(
      `${context} could not be saved: ${describeStorageError(error)}`,
      'DataCloneError'
    );
  }
};

const runDraftTransaction = async <T>(
  storeName: string,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T | undefined> => {
  const db = await openWorkspaceDb();

  try {
    return await new Promise<T | undefined>((resolve, reject) => {
      const transaction = db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);
      const request = operation(store);
      let result: T | undefined;
      let settled = false;

      const resolveOnce = (value: T | undefined) => {
        if (settled) {
          return;
        }

        settled = true;
        resolve(value);
      };

      const rejectOnce = (error: Error) => {
        if (settled) {
          return;
        }

        settled = true;
        reject(error);
      };

      request.onsuccess = () => {
        result = request.result;
      };
      request.onerror = () =>
        rejectOnce(
          request.error || new Error('Draft storage operation failed.')
        );
      transaction.oncomplete = () => resolveOnce(result);
      transaction.onerror = () =>
        rejectOnce(
          transaction.error || new Error('Draft storage transaction failed.')
        );
      transaction.onabort = () =>
        rejectOnce(
          transaction.error || new Error('Draft storage transaction aborted.')
        );
    });
  } finally {
    db.close();
  }
};

/**
 * Cheap fingerprint of a dataset's rows. Used only to decide whether the rows
 * need rewriting, so length plus a sample of the first/last row is enough —
 * a full hash would cost more than the write it avoids.
 */
const rowSignature = (rows: UploadedDataRow[]): string => {
  if (rows.length === 0) {
    return '0';
  }

  const first = rows[0];
  const last = rows[rows.length - 1];

  return `${rows.length}:${Object.keys(first).length}:${String(
    first[Object.keys(first)[0]]
  )}:${String(last[Object.keys(last).length - 1])}`;
};

export const saveWorkspaceDraft = async (
  draft: Omit<VisualizerWorkspaceDraft, 'id' | 'version' | 'savedAt'>
) => {
  const rowSignatures: Record<string, string> = {};
  const lightDatasets = draft.datasets.map(dataset => {
    rowSignatures[dataset.id] = rowSignature(dataset.rows);
    // Rows are persisted separately; the config record stays small.
    return { ...dataset, rows: [] as UploadedDataRow[] };
  });

  const record: DraftRecord = {
    ...draft,
    datasets: lightDatasets,
    rowSignatures,
    id: DEFAULT_DRAFT_ID,
    version: 4,
    savedAt: new Date().toISOString(),
  };

  const previous = await runDraftTransaction<DraftRecord | undefined>(
    DRAFT_STORE,
    'readonly',
    store => store.get(DEFAULT_DRAFT_ID)
  );
  const previousSignatures = previous?.rowSignatures ?? {};

  try {
    for (const dataset of draft.datasets) {
      if (previousSignatures[dataset.id] === rowSignatures[dataset.id]) {
        continue;
      }

      const stored: StoredDatasetData = {
        datasetId: dataset.id,
        signature: rowSignatures[dataset.id],
        rows: dataset.rows,
      };

      assertCloneable(stored, `Rows for "${dataset.fileName || dataset.id}"`);

      await runDraftTransaction(DATA_STORE, 'readwrite', store =>
        store.put(stored)
      );
    }
  } catch (error) {
    // Out of space is the common case here (large uploads). The config is the
    // part users cannot recreate, so it is still written below; only the rows
    // are lost, and the caller is told so it can say something honest.
    console.warn('Could not persist visualizer dataset rows:', error);
    record.rowSignatures = {};
    record.datasets = draft.datasets.map(dataset => ({
      ...dataset,
      rows: [] as UploadedDataRow[],
    }));
    await runDraftTransaction(DRAFT_STORE, 'readwrite', store =>
      store.put(record)
    );
    throw error;
  }

  // Drop rows for datasets that no longer exist.
  const currentIds = new Set(draft.datasets.map(dataset => dataset.id));
  const staleIds = Object.keys(previousSignatures).filter(
    id => !currentIds.has(id)
  );

  for (const staleId of staleIds) {
    await runDraftTransaction(DATA_STORE, 'readwrite', store =>
      store.delete(staleId)
    );
  }

  // The config is the part users cannot recreate, so it is validated and
  // written on its own — a rows failure must not take the chart setup with it.
  assertCloneable(record, 'Chart setup');

  await runDraftTransaction(DRAFT_STORE, 'readwrite', store =>
    store.put(record)
  );

  return record as VisualizerWorkspaceDraft;
};

/**
 * Reassembles a draft from its stored config and the rows kept in the data
 * store.
 *
 * Backward compatibility matters here: drafts written before the split stored
 * their rows INLINE in the config record. Those must be honoured — reading only
 * the data store would silently restore every legacy draft with zero rows,
 * which looks exactly like a lost draft ("no chartable metrics").
 *
 * Precedence per dataset: rows from the data store (current layout) → rows
 * still present inline (legacy layout) → empty.
 */
export const reassembleDraft = (
  record: DraftRecord,
  storedRows: Record<string, UploadedDataRow[]>
): VisualizerWorkspaceDraft =>
  ({
    ...record,
    datasets: (record.datasets ?? []).map(dataset => ({
      ...dataset,
      rows: storedRows[dataset.id] ?? dataset.rows ?? [],
    })),
  }) as VisualizerWorkspaceDraft;

export const loadWorkspaceDraft =
  async (): Promise<VisualizerWorkspaceDraft | null> => {
    const record = await runDraftTransaction<DraftRecord | undefined>(
      DRAFT_STORE,
      'readonly',
      store => store.get(DEFAULT_DRAFT_ID)
    );

    if (!record) {
      return null;
    }

    const datasets = record.datasets ?? [];
    const storedRows: Record<string, UploadedDataRow[]> = {};

    await Promise.all(
      datasets.map(async dataset => {
        const stored = await runDraftTransaction<StoredDatasetData | undefined>(
          DATA_STORE,
          'readonly',
          store => store.get(dataset.id)
        );

        if (stored?.rows?.length) {
          storedRows[dataset.id] = stored.rows;
        }
      })
    );

    return reassembleDraft(record, storedRows);
  };

export const deleteWorkspaceDraft = async () => {
  const db = await openWorkspaceDb();

  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(
        [DRAFT_STORE, DATA_STORE],
        'readwrite'
      );
      transaction.objectStore(DRAFT_STORE).clear();
      transaction.objectStore(DATA_STORE).clear();
      transaction.oncomplete = () => resolve();
      transaction.onerror = () =>
        reject(
          transaction.error || new Error('Draft storage transaction failed.')
        );
    });
  } finally {
    db.close();
  }
};

export const getWorkspaceStorageEstimate = async () => {
  if (typeof navigator === 'undefined' || !navigator.storage?.estimate) {
    return null;
  }

  return navigator.storage.estimate();
};

export const requestPersistentWorkspaceStorage = async () => {
  if (typeof navigator === 'undefined' || !navigator.storage?.persist) {
    return false;
  }

  return navigator.storage.persist();
};
