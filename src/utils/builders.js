// =========================
// Tạo tên xe
// =========================
import { buildCarName } from "../utils/builders";
export function buildCarName(car) {
  return [
    car.brand,
    car.model,
    car.version,
    car.year,
  ]
    .filter(Boolean)
    .join(" ");
}

// =========================
// Giá nhập theo triệu
// =========================

export function buildPrice(price) {
  return Number(price) * 1000000;
}

// =========================
// ODO nhập theo vạn
// =========================

export function buildOdo(odo) {
  return Number(odo) * 10000;
}

// =========================
// Tiêu đề Facebook
// =========================

export function buildFacebookTitle(car) {
  return "🚗 " + buildCarName(car).toUpperCase();
}