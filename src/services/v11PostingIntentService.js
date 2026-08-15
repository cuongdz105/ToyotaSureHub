import { getCarById } from "./carService";

const V11_INTENT_KEY =
  "toyota_sure_hub_v11_posting_intent";

export function consumeV11PostingIntent() {
  try {
    const raw =
      sessionStorage.getItem(
        V11_INTENT_KEY
      );

    if (!raw) {
      return null;
    }

    // Chỉ dùng 1 lần
    sessionStorage.removeItem(
      V11_INTENT_KEY
    );

    const intent =
      JSON.parse(raw);

    if (!intent?.carId) {
      return null;
    }

    const car =
      getCarById(
        intent.carId
      );

    if (!car) {
      console.warn(
        "V11: Không tìm thấy xe:",
        intent.carId
      );

      return null;
    }

    if (
      car.status ===
      "🔴 Đã bán"
    ) {
      console.warn(
        "V11: Xe đã bán, không mở luồng đăng."
      );

      return null;
    }

    return {
      car,
      accountId:
        intent.accountId ??
        null,
      source:
        intent.source ||
        "v11_priority_work",
    };

  } catch (error) {

    console.error(
      "V11 Posting Intent Error:",
      error
    );

    sessionStorage.removeItem(
      V11_INTENT_KEY
    );

    return null;
  }
}