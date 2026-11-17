// Offline queue — retries failed Firestore writes on reconnect
// Uses AsyncStorage to persist the queue across app restarts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const QUEUE_KEY = '@reversia_offline_queue';

/**
 * Add a failed write to the queue.
 * @param {{ collection: string, data: object }} item
 */
export async function enqueueFailedWrite(item) {
  try {
    const existing = await getQueue();
    existing.push(item);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(existing));
  } catch (err) {
    console.warn('[offlineQueue] enqueueFailedWrite error:', err);
  }
}

/**
 * Get all queued writes.
 * @returns {Promise<Array>}
 */
export async function getQueue() {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('[offlineQueue] getQueue error:', err);
    return [];
  }
}

/**
 * Remove a successfully retried item from the queue by index.
 * @param {number} index
 */
export async function dequeueByIndex(index) {
  try {
    const queue = await getQueue();
    if (index < 0 || index >= queue.length) return;
    queue.splice(index, 1);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.warn('[offlineQueue] dequeueByIndex error:', err);
  }
}

/**
 * Attempt to flush the queue — retry all pending writes.
 * @param {Function} writeFn — async (item) => void — the Firestore write function
 * @returns {Promise<{ succeeded: number, failed: number }>}
 */
export async function flushQueue(writeFn) {
  const queue = await getQueue();
  let succeeded = 0;
  let failed = 0;
  const remaining = [];
  for (const item of queue) {
    try {
      await writeFn(item);
      succeeded++;
    } catch (_) {
      failed++;
      remaining.push(item);
    }
  }
  try {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
  } catch (err) {
    console.warn('[offlineQueue] flushQueue persist error:', err);
  }
  return { succeeded, failed };
}

/**
 * Automatically flush all queued offline writes to Firestore.
 */
export async function syncOfflineQueue() {
  return flushQueue(async (item) => {
    const path = item?.path || item?.collection;
    if (!path || !item?.data) return;
    const parts = path.split('/').filter(Boolean);
    const colRef = collection(db, ...parts);
    await addDoc(colRef, {
      ...item.data,
      syncedAt: serverTimestamp(),
    });
  });
}
