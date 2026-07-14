// ================================
// Toyota AI Service
// Version 1.0
// ================================

import { buildCarName } from "../utils/format";

// -------------------------------
// Prompt Builder
// -------------------------------

function buildPrompt(car, type) {
  return `
Bạn là chuyên gia marketing của Toyota Sure Mỹ Đình.

Thông tin xe:

Tên xe: ${buildCarName(car)}
Năm: ${car.year}
Màu: ${car.color}
ODO: ${car.odo} km
Giá: ${car.price} triệu
Bảo hành: ${car.warranty}
Pháp lý: ${car.legal}

Hãy tạo nội dung dạng:

${type}

Viết đúng văn phong bán xe chuyên nghiệp.
`;
}

// -------------------------------
// Mock AI
// -------------------------------

export async function generateFacebookPost(car) {
  return `
🚗 ${buildCarName(car)}

✔️ ODO: ${car.odo.toLocaleString("vi-VN")} km

✔️ Giá: ${car.price} triệu

✔️ Bảo hành ${car.warranty}

✔️ Cam kết Toyota Sure

📞 Liên hệ ngay để xem xe!
`;
}

export async function generateYoutubeContent(car) {
  return `
🎥 ${buildCarName(car)}

Chiếc xe cực đẹp vừa về Toyota Sure Mỹ Đình.

Giá cực tốt.

ODO thấp.

Liên hệ ngay!
`;
}

export async function generateSeoArticle(car) {
  return `
Toyota Sure Mỹ Đình vừa về ${buildCarName(car)}.

Xe đẹp.

ODO thấp.

Bảo hành chính hãng.

Liên hệ để được tư vấn.
`;
}

export async function generateTikTokScript(car) {
  return `
🔥 Vừa về cực phẩm!

${buildCarName(car)}

Xem hết video nhé!
`;
}