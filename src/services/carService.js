import defaultCars from "../data/cars";

import {
  loadCars,
  saveCars,
} from "./storageService";


export function getCars() {
  const cars = loadCars();

  if (cars.length > 0) {
    return cars;
  }

  saveCars(defaultCars);

  return defaultCars;
}

export function getCarById(id) {
  return getCars().find((car) => car.id === Number(id));
}

export function addCar(car) {
  const cars = getCars();

  cars.push({
  ...car,
  id: Date.now(),
});

  saveCars(cars);
}

export function updateCar(updatedCar) {
  const cars = getCars().map((car) =>
    car.id === updatedCar.id ? updatedCar : car
  );

  saveCars(cars);
}

export function deleteCar(id) {
  const cars = getCars().filter((car) => car.id !== id);

  saveCars(cars);
}