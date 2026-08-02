import { buildCarName } from "../../utils/format";
import { buildDNA } from "../dna/dnaBuilder";
import { buildMemoryPrompt } from "../memory/memoryBuilder";

export function buildPrompt(car, template, knowledge = "") {
  const dna = buildDNA("facebook");
  const memory = buildMemoryPrompt();

  return `
${dna}

==================================================
NHIỆM VỤ
==================================================

${template}

==================================================
KIẾN THỨC BỔ SUNG
==================================================

${knowledge}

${memory}

==================================================
THÔNG TIN XE
==================================================

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

Ghi chú:
${car.notes || "Không có"}

==================================================
YÊU CẦU
==================================================

- Chỉ trả về đúng nội dung cần tạo.
- Không giải thích.
- Không mô tả cách làm.
- Không dùng markdown.
- Không nói bạn là AI.
`;
}