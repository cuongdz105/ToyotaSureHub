const STORAGE_KEY = "toyota_sure_hub_cars";

export function loadCars() {
  const data = localStorage.getItem(STORAGE_KEY);

  if (!data) return [];

  return JSON.parse(data);
}

export function saveCars(cars) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(cars)
  );
}

export function clearCars() {
  localStorage.removeItem(STORAGE_KEY);
}