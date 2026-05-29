import type { VisualizerWorkspaceDraft } from '../types';

const DB_NAME = 'airqo-data-visualizer';
const DB_VERSION = 1;
const DRAFT_STORE = 'drafts';
const DEFAULT_DRAFT_ID = 'default-workspace';

const openWorkspaceDb = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('Draft storage is not available.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(DRAFT_STORE)) {
        db.createObjectStore(DRAFT_STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error || new Error('Could not open draft storage.'));
  });

const runDraftTransaction = async <T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> => {
  const db = await openWorkspaceDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(DRAFT_STORE, mode);
    const store = transaction.objectStore(DRAFT_STORE);
    const request = operation(store);
    let result: T;
    let settled = false;

    const closeDb = () => db.close();
    const resolveOnce = (value: T) => {
      if (settled) {
        return;
      }

      settled = true;
      closeDb();
      resolve(value);
    };
    const rejectOnce = (error: Error) => {
      if (settled) {
        return;
      }

      settled = true;
      closeDb();
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
};

export const saveWorkspaceDraft = async (
  draft: Omit<VisualizerWorkspaceDraft, 'id' | 'version' | 'savedAt'>
) => {
  const record: VisualizerWorkspaceDraft = {
    ...draft,
    id: DEFAULT_DRAFT_ID,
    version: 3,
    savedAt: new Date().toISOString(),
  };

  await runDraftTransaction('readwrite', store => store.put(record));
  return record;
};

export const loadWorkspaceDraft =
  async (): Promise<VisualizerWorkspaceDraft | null> => {
    const result = await runDraftTransaction<
      VisualizerWorkspaceDraft | undefined
    >('readonly', store => store.get(DEFAULT_DRAFT_ID));

    return result ?? null;
  };

export const deleteWorkspaceDraft = async () => {
  await runDraftTransaction('readwrite', store =>
    store.delete(DEFAULT_DRAFT_ID)
  );
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
