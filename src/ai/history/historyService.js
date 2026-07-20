const STORAGE_KEY = "toyota_ai_history";

export function loadHistory() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveHistory(item) {
  const history = loadHistory();

  history.unshift({
    id: Date.now(),
    createdAt: new Date().toISOString(),
    ...item,
  });

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(history.slice(0, 100))
  );
}

export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY);
}