import { useSyncExternalStore } from "react";

interface PersistentStoreOptions<T> {
  key: string;
  serverValue: T;
  fallback: () => T;
  parse: (raw: string) => T | undefined;
  serialize: (value: T) => string | null;
  onChange?: (value: T) => void;
}

export interface PersistentStore<T> {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => T;
  getServerSnapshot: () => T;
  set: (value: T) => void;
}

export function createPersistentStore<T>(options: PersistentStoreOptions<T>): PersistentStore<T> {
  const listeners = new Set<() => void>();
  let memoryRaw: string | null = null;
  let cachedRaw: string | null | undefined;
  let cachedValue: T = options.serverValue;

  const readRaw = (): string | null => {
    try {
      return window.localStorage.getItem(options.key);
    } catch {
      return memoryRaw;
    }
  };

  const writeRaw = (raw: string | null): void => {
    memoryRaw = raw;
    try {
      if (raw === null) window.localStorage.removeItem(options.key);
      else window.localStorage.setItem(options.key, raw);
    } catch {}
  };

  const getSnapshot = (): T => {
    const raw = readRaw();
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedValue = (raw === null ? undefined : options.parse(raw)) ?? options.fallback();
    }
    return cachedValue;
  };

  const notify = () => listeners.forEach((listener) => listener());

  const onStorage = (event: StorageEvent) => {
    if (event.key !== options.key) return;
    options.onChange?.(getSnapshot());
    notify();
  };

  return {
    subscribe(listener) {
      listeners.add(listener);
      if (listeners.size === 1) window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) window.removeEventListener("storage", onStorage);
      };
    },
    getSnapshot,
    getServerSnapshot: () => options.serverValue,
    set(value) {
      const raw = options.serialize(value);
      writeRaw(raw);
      cachedRaw = raw;
      cachedValue = value;
      options.onChange?.(value);
      notify();
    },
  };
}

export function usePersistentStore<T>(store: PersistentStore<T>): T {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
}
