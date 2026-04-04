const STORAGE_KEY = 'snaptrack-board'

export function saveBoard(columns) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(columns))
}

export function loadBoard() {
  const saved = localStorage.getItem(STORAGE_KEY)

  if (!saved) return null

  return JSON.parse(saved)
}

export function clearBoard() {
  localStorage.removeItem(STORAGE_KEY)
}