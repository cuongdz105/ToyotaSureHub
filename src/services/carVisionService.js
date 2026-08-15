// =======================================
// Toyota AI Vision Service
// V11
// =======================================
//
// Giai đoạn 1:
// - Mock Vision
// - Không gọi API
// - Không tốn tiền
//
// Sau khi flow chạy ổn sẽ thay provider
// bằng Vision API thật.
//

function delay(ms) {
  return new Promise((resolve) =>
    setTimeout(resolve, ms)
  );
}


function detectFromImages(images = []) {

  /*
   * MOCK DATA
   *
   * Đây chỉ để test toàn bộ flow:
   *
   * Ảnh
   * ↓
   * AI
   * ↓
   * Kết quả
   * ↓
   * CarForm
   *
   * Chưa phải nhận diện ảnh thật.
   */

  const imageCount =
    Array.isArray(images)
      ? images.length
      : 0;


  if (imageCount === 0) {

    throw new Error(
      "Chưa có ảnh để nhận diện."
    );

  }


  return {

    brand: "Toyota",

    model: "Vios",

    version: "G CVT",

    year: "2022",

    color: "Trắng",

    odo: "",

    confidence: 0.94,

    imageCount,

    source: "mock",

    notes:
      "Kết quả mô phỏng để kiểm tra luồng AI nhận diện xe.",

  };

}


export async function recognizeCarFromImages(
  images = []
) {

  console.log(
    "🤖 Toyota Vision đang phân tích:",
    images.length,
    "ảnh"
  );


  await delay(1500);


  const result =
    detectFromImages(images);


  console.log(
    "🤖 Vision Result:",
    result
  );


  return result;

}