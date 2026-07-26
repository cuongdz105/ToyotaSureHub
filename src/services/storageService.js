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
export function exportCars() {
  return loadCars();
}

export function updateCar(id, newData) {
  const cars = loadCars();

  const updatedCars = cars.map((car) =>
    car.id === id
      ? {
          ...car,
          ...newData,
        }
      : car
  );

  saveCars(updatedCars);
}

export function getCar(id) {
  return loadCars().find((car) => car.id === id);
}