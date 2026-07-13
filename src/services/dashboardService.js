import { getCars } from "./carService";

export function getDashboardData() {
  const cars = getCars();

  const totalCars = cars.length;

  const sellingCars = cars.filter(
    (car) => car.status === "🟢 Đang bán"
  ).length;

  const soldCars = cars.filter(
    (car) => car.status === "🔴 Đã bán"
  ).length;

  const inventoryValue = cars.reduce(
    (total, car) => total + Number(car.price),
    0
  );

  return [
    {
      icon: "🚗",
      title: "Xe trong kho",
      value: totalCars,
    },
    {
      icon: "🟢",
      title: "Đang bán",
      value: sellingCars,
    },
    {
      icon: "🔴",
      title: "Đã bán",
      value: soldCars,
    },
    {
      icon: "💰",
      title: "Tổng giá trị",
      value: inventoryValue + " triệu",
    },
  ];
}