// ================================
// Toyota AI Service
// Version 1.0
// ================================

import { buildCarName } from "../utils/format";

// ================================
// Prompt Builder V2.0
// ================================

function buildPrompt(car, type) {
  return `
Bạn là chuyên gia Marketing của Toyota Sure Mỹ Đình.

Nhiệm vụ:
${type}

========================

THÔNG TIN XE

Tên xe:
${buildCarName(car)}

Năm:
${car.year}

Màu:
${car.color}

ODO:
${car.odo.toLocaleString("vi-VN")} km

Giá:
${car.price} triệu

Bảo hành:
${car.warranty}

Pháp lý:
${car.legal}

========================

THÔNG TIN TOYOTA SURE

- Kiểm định 176 hạng mục

- Cam kết:
+ Không tai nạn
+ Không bổ máy
+ Không ngập nước

- Hỗ trợ trả góp

========================

Yêu cầu:

Viết chuyên nghiệp.

Không dùng icon quá nhiều.

Có Call To Action cuối bài.
`;
}

// ================================
// Mock AI
// ================================

async function mockAI(prompt) {
  console.log(prompt);

  return `
Đây là nội dung AI mô phỏng.

Sau này sẽ thay bằng ChatGPT API.

Prompt:

${prompt}
`;
}

export async function generateYoutubeContent(car){

    const prompt = buildPrompt(
        car,
        "Viết tiêu đề Youtube, mô tả và hashtag."
    );

    return mockAI(prompt);

}

export async function generateSeoArticle(car){

    const prompt = buildPrompt(
        car,
        "Viết bài chuẩn SEO khoảng 800 từ."
    );

    return mockAI(prompt);

}

export async function generateTikTokScript(car){

    const prompt = buildPrompt(
        car,
        "Viết kịch bản TikTok khoảng 60 giây."
    );

    return mockAI(prompt);

}

export async function generateFacebookPost(car) {

    const prompt = buildPrompt(
        car,
        "Viết bài Facebook khoảng 300 từ."
    );

    return mockAI(prompt);

}