// =======================================
// Toyota AI Prompt Builder V3.0
// =======================================

import { COMPANY } from "../knowledge/company";
import { SALES_STYLE } from "../knowledge/sales";
import { MARKETING } from "../knowledge/marketing";
import { INSPECTION } from "../knowledge/inspection";

import { buildCarName } from "../../utils/format";

// =======================================
// Build Prompt
// =======================================

export function buildPrompt(car, template) {

    return `

${template}

============================

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

============================

THÔNG TIN SHOWROOM

Tên:
${COMPANY.name}

Khẩu hiệu:
${COMPANY.slogan}

Tiêu chuẩn:
${COMPANY.inspection}

============================

CAM KẾT

${INSPECTION.commitments.join("\n")}

============================

VĂN PHONG

Người bán xưng:
${SALES_STYLE.seller}

Khách hàng gọi:
${SALES_STYLE.customer}

Giọng văn:
${SALES_STYLE.tone}

============================

QUY TẮC MARKETING

Facebook:
${MARKETING.facebook.minWords}-${MARKETING.facebook.maxWords} từ

============================

Viết tự nhiên.

Không bịa thông tin.

Kết thúc bằng lời kêu gọi liên hệ.

`;

}