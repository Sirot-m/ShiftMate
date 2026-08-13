"use client";

import { useCallback, useSyncExternalStore } from "react";

const listeners = new Map<string, Set<() => void>>();

type SnapshotCacheEntry = {
  raw: string;
  value: unknown;
};

const snapshotCache = new Map<string, SnapshotCacheEntry>();

const subscribe = (key: string, callback: () => void) => {
  const existing = listeners.get(key) ?? new Set();
  existing.add(callback);
  listeners.set(key, existing);

  return () => {
    existing.delete(callback);
  };
};

const notify = (key: string) => {
  listeners.get(key)?.forEach((callback) => callback());
};

const readSnapshot = <T>(key: string, initialValue: T): T => {
  let raw: string | null = null;

  try {
    raw = window.localStorage.getItem(key);
  } catch {
    raw = null;
  }

  const serialized = raw ?? "";

  const cached = snapshotCache.get(key);
  if (cached && cached.raw === serialized) {
    return cached.value as T;
  }

  let value: T = initialValue;

  if (raw) {
    try {
      value = JSON.parse(raw) as T;
    } catch {
      value = initialValue;
    }
  }

  snapshotCache.set(key, { raw: serialized, value });
  return value;
};

export const useLocalStorage = <T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((current: T) => T)) => void, boolean] => {
  const getSnapshot = useCallback(
    (): T => readSnapshot(key, initialValue),
    [initialValue, key],
  );

  const value = useSyncExternalStore(
    (callback) => subscribe(key, callback),
    getSnapshot,
    () => initialValue,
  );

  const setValue = (next: T | ((current: T) => T)) => {
    const current = readSnapshot(key, initialValue);
    const resolved =
      typeof next === "function"
        ? (next as (current: T) => T)(current)
        : next;

    const serialized = JSON.stringify(resolved);
    window.localStorage.setItem(key, serialized);
    snapshotCache.set(key, { raw: serialized, value: resolved });
    notify(key);
  };

  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  return [value, setValue, isHydrated];
};
