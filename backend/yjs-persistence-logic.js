// backend/yjs-persistence-logic.js

const Y = require('yjs');
const Document = require('./models/DocumentModel'); // Your Mongoose Document model

const activeYDocs = new Map(); // Key: roomId, Value: { ydoc: Y.Doc, saveTimeout: NodeJS.Timeout | null, updateListener: Function, isSaving: boolean }
const SAVE_DEBOUNCE_MS = process.env.YJS_SAVE_DEBOUNCE_MS || 2500; // e.g., save at most every 2.5 seconds
const MAX_DB_RETRIES = 3;
const DB_RETRY_DELAY_MS = 1000;

/**
 * Helper function to delay execution.
 * @param {number} ms Milliseconds to delay.
 * @returns {Promise<void>}
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generic retry mechanism for async operations.
 * @param {Function} operation Async function to retry.
 * @param {string} operationName Name of the operation for logging.
 * @param {number} maxRetries Maximum number of retries.
 * @param {number} retryDelayMs Delay between retries.
 * @returns {Promise<any>} Result of the successful operation.
 * @throws Error if operation fails after all retries.
 */
async function retryOperation(operation, operationName, maxRetries = MAX_DB_RETRIES, retryDelayMs = DB_RETRY_DELAY_MS) {
  let attempts = 0;
  while (attempts < maxRetries) {
    try {
      attempts++;
      console.log(`[DBRetry] Attempt ${attempts}/${maxRetries} for ${operationName}...`);
      return await operation(); // Attempt the operation
    } catch (error) {
      console.error(`[DBRetry] Error during ${operationName} (Attempt ${attempts}/${maxRetries}):`, error.message);
      if (attempts >= maxRetries) {
        console.error(`[DBRetry] ${operationName} failed after ${maxRetries} attempts.`);
        throw error; // Re-throw the error if max retries reached
      }
      console.log(`[DBRetry] Retrying ${operationName} in ${retryDelayMs / 1000}s...`);
      await delay(retryDelayMs * attempts); // Exponential backoff (simple version)
    }
  }
}

/**
 * Core logic to save a Y.Doc state to MongoDB.
 * @param {string} roomId The room ID.
 * @param {Y.Doc} ydoc The Y.Doc instance to save.
 */
async function saveYDocToDB(roomId, ydoc) {
  const docEntry = activeYDocs.get(roomId);
  if (docEntry && docEntry.isSaving) {
    console.log(`[YjsPersistence] Save for room ${roomId} already in progress. Skipping.`);
    // Optionally, schedule another save after current one finishes if updates occurred during save.
    return;
  }
  if (docEntry) docEntry.isSaving = true;

  console.log(`[YjsPersistence] Attempting to save Y.Doc state for room ${roomId} to MongoDB.`);
  try {
    const currentDocumentState = Y.encodeStateAsUpdate(ydoc);
    const operation = () => Document.findOneAndUpdate(
      { roomId: roomId },
      { yjsDocumentState: currentDocumentState },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const updatedMongoDoc = await retryOperation(operation, `SaveDoc-${roomId}`);
    
    if (updatedMongoDoc) {
      console.log(`[YjsPersistence] Successfully saved Y.Doc state for room ${roomId} to MongoDB. DB LastUpdated: ${updatedMongoDoc.updatedAt}`);
    } else {
      // This case should ideally not be reached if retryOperation throws on persistent failure
      console.warn(`[YjsPersistence] Document.findOneAndUpdate returned null/undefined for room ${roomId} after retries.`);
    }
  } catch (dbError) {
    // This catch is for errors that persisted after retries from retryOperation
    console.error(`[YjsPersistence] CRITICAL: Failed to save Y.Doc state for room ${roomId} to MongoDB after all retries:`, dbError);
    // In a production system, you would log this to an error tracking service (e.g., Sentry, Datadog).
    // Consider alerting mechanisms for persistent DB save failures.
  } finally {
    if (docEntry) docEntry.isSaving = false;
  }
}

async function getOrCreateYDoc(roomId) {
  const activeDocEntry = activeYDocs.get(roomId);
  if (activeDocEntry) {
    console.log(`[YjsPersistence] Returning active Y.Doc for room: ${roomId}`);
    return activeDocEntry.ydoc;
  }

  const ydoc = new Y.Doc();
  console.log(`[YjsPersistence] Trying to load Y.Doc for room ${roomId} from MongoDB...`);

  try {
    const operation = () => Document.findOne({ roomId: roomId });
    const persistedDoc = await retryOperation(operation, `LoadDoc-${roomId}`);

    if (persistedDoc && persistedDoc.yjsDocumentState) {
      try {
        Y.applyUpdate(ydoc, persistedDoc.yjsDocumentState);
        console.log(`[YjsPersistence] Y.Doc for room ${roomId} loaded from MongoDB. DB LastSaved: ${persistedDoc.updatedAt}`);
      } catch (applyUpdateError) {
        console.error(`[YjsPersistence] CORRUPTION? Error applying Yjs update from DB for room ${roomId}. Data might be corrupt.`, applyUpdateError);
        console.warn(`[YjsPersistence] Proceeding with an EMPTY Y.Doc for room ${roomId} due to applyUpdate error. Old data for room ${roomId} in DB should be investigated.`);
        // For critical applications, you might not want to proceed with an empty doc.
        // Instead, you could throw an error here to prevent the room from loading,
        // and alert administrators to inspect the corrupted data.
        // Example: throw new Error(`Corrupted Yjs data for room ${roomId}`);
      }
    } else {
      console.log(`[YjsPersistence] Initializing new Y.Doc for room ${roomId} (not found in DB or no prior state).`);
      // For a brand new document, we might want to save its initial empty state immediately
      // so that it exists in the DB, or rely on the first update to trigger the save.
      // Let's rely on the first update for now, as per current upsert logic.
    }
  } catch (dbLoadError) {
    // This catches errors from retryOperation if Document.findOne persistently failed.
    console.error(`[YjsPersistence] CRITICAL: Failed to load Y.Doc for room ${roomId} from MongoDB after all retries.`, dbLoadError);
    // Depending on requirements, you might:
    // 1. Proceed with an empty Y.Doc (current behavior if findOne returns null and then we proceed).
    // 2. Throw an error to prevent the room from loading, requiring manual intervention.
    // For now, ydoc is an empty doc, so it will proceed as if it's a new document.
    console.warn(`[YjsPersistence] Proceeding with an empty Y.Doc for room ${roomId} due to DB load failure.`);
  }

  let saveTimeout = null;
  const debouncedSaveListener = (update, origin, docInstance) => {
    const currentActiveDocEntry = activeYDocs.get(roomId); // Get fresh entry
    if (currentActiveDocEntry && currentActiveDocEntry.saveTimeout) {
      clearTimeout(currentActiveDocEntry.saveTimeout);
    }
    const newTimeout = setTimeout(async () => {
      await saveYDocToDB(roomId, docInstance); // Use the passed docInstance
      const entry = activeYDocs.get(roomId);
      if (entry) entry.saveTimeout = null;
    }, SAVE_DEBOUNCE_MS);

    if (currentActiveDocEntry) {
      currentActiveDocEntry.saveTimeout = newTimeout;
    } else {
      // This case (doc not in activeYDocs but listener fires) should be rare if managed properly.
      console.warn(`[YjsPersistence] debouncedSaveListener fired for room ${roomId} but doc not in activeYDocs cache.`);
    }
  };
  
  ydoc.on('update', debouncedSaveListener);

  activeYDocs.set(roomId, { ydoc, saveTimeout: null, updateListener: debouncedSaveListener, isSaving: false });
  console.log(`[YjsPersistence] Y.Doc for room ${roomId} is now active in memory with persistence enabled.`);
  return ydoc;
}

async function closeYDoc(roomId) {
  const activeDocEntry = activeYDocs.get(roomId);
  if (activeDocEntry) {
    const { ydoc, saveTimeout, updateListener } = activeDocEntry;
    console.log(`[YjsPersistence] Closing Y.Doc for room: ${roomId}`);

    if (saveTimeout) {
      clearTimeout(saveTimeout);
      console.log(`[YjsPersistence] Cleared pending debounced save for room: ${roomId}.`);
    }

    // Perform a final, non-debounced save.
    console.log(`[YjsPersistence] Performing final save for closing room: ${roomId}.`);
    await saveYDocToDB(roomId, ydoc); // Reuse the saveYDocToDB logic

    if (updateListener) {
      ydoc.off('update', updateListener);
    }
    activeYDocs.delete(roomId);
    console.log(`[YjsPersistence] Y.Doc for room ${roomId} removed from active cache and closed.`);
  }
}

module.exports = { getOrCreateYDoc, closeYDoc, activeYDocs };