const KEY = "posting_session";

export function startPosting(car) {
  // Xóa session cũ trước để tránh session cũ quá lớn
  localStorage.removeItem(KEY);

  // Chỉ lưu ID xe, không lưu toàn bộ object + ảnh
  localStorage.setItem(
    KEY,
    JSON.stringify({
      carId: car.id,
    })
  );
}

export function getCurrentPosting() {
  const data = localStorage.getItem(KEY);

  if (!data) return null;

  const session = JSON.parse(data);

  if (!session.carId) return null;

  // Lấy lại dữ liệu xe thật từ kho xe
  const cars = JSON.parse(
    localStorage.getItem("toyota_sure_hub_cars") || "[]"
  );

  return (
    cars.find(
      (car) => car.id === Number(session.carId)
    ) || null
  );
}

export function clearPosting() {
  localStorage.removeItem(KEY);
}