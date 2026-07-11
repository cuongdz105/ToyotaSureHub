import {
  loadCars,
  saveCars,
} from "./storageService";

const defaultCars = [
  {
    id: 1,
    brand: "Toyota",
    model: "Vios",
    version: "G CVT",
    year: 2023,
    color: "Đen",
    odo: 12000,
    warranty: "Toyota Sure",
    legal: "Cá nhân",
    price: 520,
    status: "🟢 Đang bán",
    images: [],
    notes: "",
  },

  {
    id: 2,
    brand: "Toyota",
    model: "Corolla Cross",
    version: "HEV",
    year: 2025,
    color: "Trắng ngọc trai",
    odo: 8000,
    warranty: "Toyota Sure",
    legal: "Cá nhân",
    price: 935,
    status: "🟢 Đang bán",
    images: [],
    notes: "",
  },

  {
    id: 3,
    brand: "Toyota",
    model: "Raize",
    version: "Turbo",
    year: 2022,
    color: "Đỏ",
    odo: 55000,
    warranty: "Toyota Sure",
    legal: "Cá nhân",
    price: 498,
    status: "🟢 Đang bán",
    images: [],
    notes: "",
  },
];
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
    id: Date.now(),
    ...car,
    status: "Đang bán",
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