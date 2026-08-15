import defaultCars from "../data/cars";
import { loadCars, saveCars } from "./storageService";

const SOLD_STATUS = "🔴 Đã bán";
const ACTIVE_STATUS = "🟢 Đang bán";

// Thời gian lưu xe đã bán tạm thời: 30 ngày
const SOLD_RETENTION_DAYS = 30;
const SOLD_RETENTION_MS =
  SOLD_RETENTION_DAYS *
  24 *
  60 *
  60 *
  1000;


// ==========================================
// CREATE NEW CAR ID
// ==========================================

function createNewCarId() {
  return (
    Date.now() +
    Math.floor(
      Math.random() * 1000
    )
  );
}


// ==========================================
// REMOVE EXPIRED SOLD CARS
// ==========================================
// Xe Đã bán quá 30 ngày sẽ bị xóa khỏi
// kho lưu tạm.
//
// Không đụng tới xe đang bán.
// ==========================================

function purgeExpiredSoldCars(
  cars
) {
  const now =
    Date.now();

  const activeCars =
    cars.filter((car) => {

      if (
        car.status !==
        SOLD_STATUS
      ) {
        return true;
      }

      if (!car.soldAt) {
        return true;
      }

      const soldTime =
        new Date(
          car.soldAt
        ).getTime();

      if (
        Number.isNaN(
          soldTime
        )
      ) {
        return true;
      }

      const age =
        now - soldTime;

      return (
        age <
        SOLD_RETENTION_MS
      );
    });

  return activeCars;
}


// ==========================================
// GET CARS
// ==========================================

export function getCars() {

  let cars =
    loadCars();

  if (
    !Array.isArray(cars) ||
    cars.length === 0
  ) {
    saveCars(
      defaultCars
    );

    return defaultCars;
  }


  // Tự dọn xe Đã bán
  // quá 30 ngày.
  const cleanedCars =
    purgeExpiredSoldCars(
      cars
    );


  if (
    cleanedCars.length !==
    cars.length
  ) {
    saveCars(
      cleanedCars
    );
  }


  return cleanedCars;
}


// ==========================================
// GET CAR BY ID
// ==========================================

export function getCarById(
  id
) {
  return getCars().find(
    (car) =>
      String(car.id) ===
      String(id)
  );
}


// ==========================================
// ADD CAR
// ==========================================

export function addCar(
  car
) {

  const cars =
    getCars();


  const newCar = {
    ...car,

    id:
      createNewCarId(),

    status:
      car.status ||
      ACTIVE_STATUS,

    soldAt:
      null,
  };


  cars.push(
    newCar
  );

  saveCars(
    cars
  );


  return newCar;
}


// ==========================================
// UPDATE CAR
// ==========================================

export function updateCar(
  id,
  updatedData
) {

  const cars =
    getCars();


  const updatedCars =
    cars.map((car) => {

      if (
        String(car.id) !==
        String(id)
      ) {
        return car;
      }


      return {
        ...car,

        ...updatedData,

        aiContent: {
          ...(car.aiContent || {}),
          ...(updatedData.aiContent || {}),
        },
      };
    });


  saveCars(
    updatedCars
  );


  return updatedCars.find(
    (car) =>
      String(car.id) ===
      String(id)
  );
}


// ==========================================
// MARK CAR AS SOLD
// ==========================================
//
// Không xóa xe.
//
// Chỉ chuyển xe sang trạng thái Đã bán
// và ghi thời điểm bán.
//
// Ảnh vẫn dùng bộ ảnh cũ.
// Không tạo bản copy.
// ==========================================

export function markCarAsSold(
  id
) {

  const cars =
    getCars();


  const now =
    new Date().toISOString();


  const updatedCars =
    cars.map((car) => {

      if (
        String(car.id) !==
        String(id)
      ) {
        return car;
      }


      return {
        ...car,

        status:
          SOLD_STATUS,

        soldAt:
          now,
      };
    });


  saveCars(
    updatedCars
  );


  return updatedCars.find(
    (car) =>
      String(car.id) ===
      String(id)
  );
}


// ==========================================
// GET SOLD CARS
// ==========================================

export function getSoldCars() {

  return getCars().filter(
    (car) =>
      car.status ===
      SOLD_STATUS
  );
}


// ==========================================
// GET ACTIVE CARS
// ==========================================

export function getActiveCars() {

  return getCars().filter(
    (car) =>
      car.status !==
      SOLD_STATUS
  );
}


// ==========================================
// RESTORE SOLD CAR AS NEW CAR
// ==========================================
//
// Quan trọng:
// - Tạo ID mới.
// - Không khôi phục Campaign.
// - Không khôi phục Queue.
// - Không khôi phục trạng thái marketing cũ.
//
// Ảnh và thông tin xe được giữ lại để ông
// không phải nhập lại từ đầu.
// ==========================================

export function restoreSoldCar(
  id
) {

  const cars =
    getCars();


  const oldCar =
    cars.find(
      (car) =>
        String(car.id) ===
        String(id)
    );


  if (!oldCar) {
    throw new Error(
      "Không tìm thấy xe đã bán."
    );
  }


  if (
    oldCar.status !==
    SOLD_STATUS
  ) {
    throw new Error(
      "Xe này không nằm trong mục Đã bán."
    );
  }


  const newCar = {
    ...oldCar,

    // ID MỚI
    id:
      createNewCarId(),

    // Trở lại xe đang bán
    status:
      ACTIVE_STATUS,

    // Đây là xe nhập mới
    soldAt:
      null,

    // Không mang trạng thái marketing cũ
    campaignIds:
      [],

    queueJobIds:
      [],

    workPlanIds:
      [],
  };


  const updatedCars =
    cars.filter(
      (car) =>
        String(car.id) !==
        String(id)
    );


  updatedCars.push(
    newCar
  );


  saveCars(
    updatedCars
  );


  return newCar;
}


// ==========================================
// DELETE CAR
// ==========================================
//
// Xóa vật lý khỏi danh sách xe.
// Chỉ dùng khi người dùng chủ động xóa,
// hoặc hệ thống dọn xe Đã bán quá 30 ngày.
// ==========================================

export function deleteCar(
  id
) {

  const cars =
    getCars().filter(
      (car) =>
        String(car.id) !==
        String(id)
    );


  saveCars(
    cars
  );

  return true;
}


// ==========================================
// SOLD RETENTION INFO
// ==========================================

export function getSoldDaysRemaining(
  car
) {

  if (
    !car ||
    car.status !==
      SOLD_STATUS ||
    !car.soldAt
  ) {
    return null;
  }


  const soldTime =
    new Date(
      car.soldAt
    ).getTime();


  if (
    Number.isNaN(
      soldTime
    )
  ) {
    return null;
  }


  const remaining =
    SOLD_RETENTION_MS -
    (
      Date.now() -
      soldTime
    );


  if (
    remaining <= 0
  ) {
    return 0;
  }


  return Math.ceil(
    remaining /
      (
        24 *
        60 *
        60 *
        1000
      )
  );
}


// ==========================================
// CONSTANTS
// ==========================================

export {
  SOLD_STATUS,
  ACTIVE_STATUS,
  SOLD_RETENTION_DAYS,
};