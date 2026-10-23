// Each page remembers its view for the browser tab, so that a page shows the
// same view when the user comes back to it. The storage can fail, for example
// in a private window. The page then shows its default view.

export function readRememberedView(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Saves the view of a page. A null view removes the saved view. */
export function rememberView(key: string, view: string | null): void {
  try {
    if (view === null) {
      sessionStorage.removeItem(key);
    } else {
      sessionStorage.setItem(key, view);
    }
  } catch {
    // The page then shows its default view next time.
  }
}
