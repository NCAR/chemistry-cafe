import "@testing-library/react";
import "@testing-library/jest-dom";

// Node >= 25 exposes a global `localStorage` that is non-functional (an empty
// null-prototype object with no methods unless `--localstorage-file` is set).
// It shadows jsdom's `window.localStorage`, breaking tests that use storage.
// Install a working in-memory Storage shim so tests behave the same on any Node
// version (CI runs Node 16/18, which have no such global).
class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

const storage = new MemoryStorage();
Object.defineProperty(globalThis, "localStorage", {
  value: storage,
  configurable: true,
  writable: true,
});
Object.defineProperty(window, "localStorage", {
  value: storage,
  configurable: true,
  writable: true,
});
