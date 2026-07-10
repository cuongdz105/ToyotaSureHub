const KEY = "toyota_sure_hub";

export function loadData() {
  const data = localStorage.getItem(KEY);

  return data ? JSON.parse(data) : [];
}

export function saveData(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}