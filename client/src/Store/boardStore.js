const STORAGE_KEY = "snaptrack-boards";

export function saveBoards(boards) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
  } catch (e) {
    console.error("Failed to save boards:", e);
  }
}

export function loadBoards() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("Failed to load boards:", e);
    return null;
  }
}