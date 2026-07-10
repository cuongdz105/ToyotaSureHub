const STORAGE_KEY = "toyota_cars";

const defaultCars = [
  {
    id: 1,
    name: "Toyota Vios G",
    version: "",
    year: 2023,
    color: "Đen",
    odo: "12.000 km",
    warranty: "",
    legal: "Cá nhân",
    price: "520 triệu",
    status: "Đang bán",
  },
  {
    id: 2,
    name: "Corolla Cross HEV",
    version: "",
    year: 2025,
    color: "Trắng ngọc trai",
    odo: "8.000 km",
    warranty: "",
    legal: "Cá nhân",
    price: "935 triệu",
    status: "Đang bán",
  },
  {
    id: 3,
    name: "Raize",
    version: "",
    year: 2022,
    color: "Đỏ",
    odo: "55.000 km",
    warranty: "",
    legal: "Cá nhân",
    price: "498 triệu",
    status: "Đang bán",
  },
];

export function getCars() {
  const data = localStorage.getItem(STORAGE_KEY);

  if (data) {
    return JSON.parse(data);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultCars));

  return defaultCars;
}

export function getCarById(id) {
  return getCars().find((car) => car.id === Number(id));
}

export function saveCars(cars) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cars));
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