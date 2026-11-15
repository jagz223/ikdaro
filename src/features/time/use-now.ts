"use client";

import { useSyncExternalStore } from "react";

const TICK_MS = 60_000;
const SERVER_NOW = 0;

let now = SERVER_NOW;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;

function tick() {
  now = Date.now();
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!timer) timer = setInterval(tick, TICK_MS);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

function getSnapshot() {
  if (now === SERVER_NOW) now = Date.now();
  return now;
}

export function useNow(): number | undefined {
  const value = useSyncExternalStore(subscribe, getSnapshot, () => SERVER_NOW);
  return value === SERVER_NOW ? undefined : value;
}
