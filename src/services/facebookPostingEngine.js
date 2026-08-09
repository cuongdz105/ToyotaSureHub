/**
 * FACEBOOK POSTING ENGINE
 *
 * Hiện tại:
 * - SIMULATION MODE
 * - Chưa đăng Facebook thật
 * - Chỉ mô phỏng toàn bộ quy trình
 *
 * Sau này:
 * - Thay phần simulation bằng Facebook API
 * - Queue Worker không cần viết lại
 */

import {
  loadAccounts,
} from "./facebookAccountService";

export const FACEBOOK_POSTING_MODE =
  "simulation";

const STORAGE_KEY =
  "toyota_sure_hub_cars";

/**
 * Tạo timestamp
 */
function now() {
  return new Date().toISOString();
}

/**
 * Tạo log
 */
function createLog(
  message,
  type = "info"
) {
  return {
    time: now(),
    type,
    message,
  };
}

/**
 * Đọc danh sách xe trực tiếp từ LocalStorage
 *
 * Không phụ thuộc vào export của carService.js
 */
function loadCarsFromStorage() {
  const data =
    localStorage.getItem(STORAGE_KEY);

  if (!data) {
    return [];
  }

  try {
    const cars = JSON.parse(data);

    return Array.isArray(cars)
      ? cars
      : [];
  } catch (error) {
    console.error(
      "Không đọc được dữ liệu xe:",
      error
    );

    return [];
  }
}

/**
 * Tìm xe theo ID
 */
function findCar(carId) {
  const cars =
    loadCarsFromStorage();

  return (
    cars.find(
      (car) =>
        String(car.id) ===
        String(carId)
    ) || null
  );
}

function findAccount(accountId) {
  const accounts = loadAccounts();

  return (
    accounts.find(
      (account) =>
        String(account.id) ===
        String(accountId)
    ) || null
  );
}

/**
 * Lấy danh sách ảnh theo nhiều format
 *
 * Vì ToyotaSureHub có thể lưu ảnh:
 * - string
 * - object.preview
 */
function getCarImages(car) {
  if (
    !car ||
    !Array.isArray(car.images)
  ) {
    return [];
  }

  return car.images.filter(
    (image) => {
      if (
        typeof image ===
        "string"
      ) {
        return image.trim() !== "";
      }

      if (
        image &&
        typeof image ===
          "object" &&
        image.preview
      ) {
        return true;
      }

      return false;
    }
  );
}

/**
 * Kiểm tra dữ liệu bài đăng
 */
function validatePostData(job) {
  if (!job) {
    throw new Error(
      "Không có Posting Job."
    );
  }

  if (!job.group) {
    throw new Error(
      "Chưa có hội nhóm Facebook."
    );
  }

  if (!job.content?.trim()) {
    throw new Error(
      "Nội dung Facebook đang trống."
    );
  }

  if (
    !job.imageCount ||
    job.imageCount <= 0
  ) {
    throw new Error(
      "Bài đăng chưa có ảnh."
    );
  }


if (!job.accountId) {
  throw new Error(
    "Chưa chọn tài khoản Facebook."
  );
}
}
/**
 * Facebook Posting Engine
 *
 * Hiện tại chỉ mô phỏng.
 */
export async function runFacebookPostingEngine(
  job
) {
  validatePostData(job);

  const logs = [];

  logs.push(
    createLog(
      "🚀 Bắt đầu Facebook Posting Engine",
      "start"
    )
  );

  logs.push(
    createLog(
      `📌 Chế độ: ${FACEBOOK_POSTING_MODE.toUpperCase()}`,
      "info"
    )
  );

  // --------------------------------
  // 1. Tìm xe
  // --------------------------------

  const car = findCar(
    job.carId
  );

  if (!car) {
    throw new Error(
      `Không tìm thấy xe với ID: ${job.carId}`
    );
  }

const account = findAccount(
  job.accountId
);

if (!account) {
  throw new Error(
    `Không tìm thấy tài khoản Facebook với ID: ${job.accountId}`
  );
}

if (account.status !== "active") {
  throw new Error(
    `Tài khoản Facebook "${account.name}" hiện không hoạt động.`
  );
}

logs.push(
  createLog(
    `👤 Tài khoản Facebook: ${account.name}`,
    "success"
  )
);

  logs.push(
    createLog(
      `🚗 Đã tìm thấy xe: ${
        car.brand || ""
      } ${car.model || ""}`,
      "success"
    )
  );

  // --------------------------------
  // 2. Kiểm tra ảnh thật của xe
  // --------------------------------

  const images =
    getCarImages(car);

  if (images.length === 0) {
    throw new Error(
      "Xe không có ảnh."
    );
  }

  logs.push(
    createLog(
      `📷 Đã kiểm tra ${images.length} ảnh`,
      "success"
    )
  );

  // --------------------------------
  // 3. Kiểm tra nội dung
  // --------------------------------

  logs.push(
    createLog(
      "📝 Nội dung Facebook hợp lệ",
      "success"
    )
  );

  // --------------------------------
  // 4. Chuẩn bị ảnh
  // --------------------------------

  logs.push(
    createLog(
      "📷 Đang chuẩn bị ảnh",
      "processing"
    )
  );

  await delay(500);

  logs.push(
    createLog(
      `📷 Đã chuẩn bị xong ${images.length} ảnh`,
      "success"
    )
  );

  // --------------------------------
  // 5. Chuẩn bị nội dung
  // --------------------------------

  logs.push(
    createLog(
      "📝 Đang chuẩn bị nội dung Facebook",
      "processing"
    )
  );

  await delay(500);

  logs.push(
    createLog(
      "📝 Nội dung Facebook đã sẵn sàng",
      "success"
    )
  );

  // --------------------------------
  // 6. Chuẩn bị Group
  // --------------------------------

  logs.push(
    createLog(
      `👥 Chuẩn bị đăng vào nhóm: ${
        job.group.name ||
        "Không rõ"
      }`,
      "processing"
    )
  );

  await delay(500);

    // --------------------------------
// 7. SIMULATION
// --------------------------------

if (
  FACEBOOK_POSTING_MODE ===
  "simulation"
) {
  logs.push(
    createLog(
      "⚠️ Đang ở chế độ mô phỏng — chưa gửi dữ liệu tới Facebook",
      "warning"
    )
  );

  await delay(700);

  logs.push(
    createLog(
      "🚀 Posting Engine đã hoàn tất bước mô phỏng",
      "success"
    )
  );

  logs.push(
    createLog(
      "🟢 Bài đăng mô phỏng thành công",
      "success"
    )
  );

  return {
    success: true,

    mode: "simulation",

    // false = chưa đăng Facebook thật
    published: false,

    jobId: job.id,

    carId: job.carId,

    car: {
      brand: car.brand || "",
      model: car.model || "",
      version: car.version || "",
      year: car.year || "",
      color: car.color || "",
    },

    group: {
      id: job.group?.id || null,
      name: job.group?.name || "",
      url: job.group?.url || "",
    },

    account: {
      id: account.id || null,
      name: account.name || "",
      status: account.status || "",
    },

    imageCount: images.length,

    logs,

    completedAt: now(),
  };
}

throw new Error(
  "Facebook Posting Engine chưa được cấu hình."
);
}
// --------------------------------
// Delay cho Simulation
// --------------------------------

function delay(ms) {
  return new Promise(
    (resolve) =>
      setTimeout(resolve, ms)
  );
}