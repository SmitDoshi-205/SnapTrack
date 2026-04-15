function storageKey(userId) {
  return `snaptrack-boards-${userId}`
}

export function saveBoards(boards, userId) {
  if (!userId) return
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(boards))
  } catch (e) {
    console.error('Failed to save boards:', e)
  }
}

export function loadBoards(userId) {
  if (!userId) return null
  try {
    const raw = localStorage.getItem(storageKey(userId))
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    console.error('Failed to load boards:', e)
    return null
  }
}