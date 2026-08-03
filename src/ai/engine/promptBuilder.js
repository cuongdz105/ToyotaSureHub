import { buildCarName } from "../../utils/format";
import { buildDNA } from "../dna/dnaBuilder";
import { buildMemoryPrompt } from "../memory/memoryBuilder";
import { loadKnowledge } from "../knowledgeLoader";

export function buildPrompt(car, template) {
  const dna = buildDNA("facebook");
  const memory = buildMemoryPrompt();
  const knowledge = loadKnowledge(car, "facebook");

  return `
${dna}

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
YÊU CẦU CUỐI
==================================================

Viết như một người bán xe thật.

Đừng giống AI.

Đừng giống quảng cáo.

Đừng cố viết hay.

Nếu bài dài, hãy tự rút ngắn.

Nếu câu quá hoàn chỉnh, hãy viết tự nhiên hơn.

Nếu có thể kể chuyện thay vì liệt kê, hãy kể.

Mục tiêu là khiến người đọc muốn nhắn tin.

==================================================
NHIỆM VỤ
==================================================

${template}

==================================================
QUY TẮC TRẢ KẾT QUẢ
==================================================

- Chỉ trả về đúng nội dung.
- Không giải thích.
- Không dùng markdown.
- Không nói bạn là AI.
`;
}