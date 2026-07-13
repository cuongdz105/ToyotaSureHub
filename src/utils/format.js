// =========================
// ĐỊNH DẠNG GIÁ BÁN
// =========================
export function formatPrice(price) {
  if (!price) return "";

  return Number(price).toLocaleString("vi-VN") + " đ";
}

// =========================
// ĐỊNH DẠNG ODO
// =========================
export function formatOdo(odo) {
  if (!odo) return "";

  return (Number(odo) * 10000).toLocaleString("vi-VN") + " km";
}

// =========================
// NHẬP GIÁ THEO TRIỆU
// Ví dụ: 498 -> 498000000
// =========================
export function convertPrice(priceInMillion) {
  if (!priceInMillion) return 0;

  return Number(priceInMillion) * 1000000;
}

// =========================
// NHẬP ODO THEO VẠN
// Ví dụ: 2.3 -> 23000
// =========================
export function convertOdo(odoInVan) {
  if (!odoInVan) return 0;

  return Number(odoInVan) * 10000;
}

// =========================
// TỰ GHÉP TÊN XE
// =========================
export function buildCarName(car) {
  return [
    car.brand,
    car.model,
    car.version,
    car.year
  ]
    .filter(Boolean)
    .join(" ");
}

// =========================
// TIÊU ĐỀ FACEBOOK
// =========================
export function buildFacebookTitle(car) {
  return "🚗 " + buildCarName(car).toUpperCase();
}

// =========================
// ĐỊNH DẠNG SỐ
// =========================
export function formatNumber(number) {
  return Number(number).toLocaleString("vi-VN");
}