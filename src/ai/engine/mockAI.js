// =======================================
// Toyota AI Mock Engine
// Version 2.0
// =======================================

export async function mockAI(prompt, car) {

    console.log("===== TOYOTA AI PROMPT =====");
    console.log(prompt);

    // Giả lập AI suy nghĩ
    await new Promise(resolve =>
        setTimeout(resolve, 1200)
    );

    return `
🚗 ${car.brand} ${car.model} ${car.version}

✨ Xe ${car.year} màu ${car.color} vừa cập bến Toyota Sure Mỹ Đình.

✅ ODO chỉ ${(Number(car.odo) * 10000).toLocaleString("vi-VN")} km.

💰 Giá bán: ${car.price} triệu.

✔️ ${car.warranty}

✔️ ${car.legal}

🔍 Đã kiểm định 176 hạng mục Toyota Sure.

💯 Cam kết:

• Không tai nạn

• Không ngập nước

• Không bổ máy

📞 Liên hệ ngay Toyota Sure Mỹ Đình để xem xe và lái thử!
`;

}