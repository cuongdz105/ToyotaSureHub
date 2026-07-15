// =======================================
// Toyota AI Engine
// =======================================

import { mockAI } from "./mockAI";

// Sau này chỉ cần đổi provider ở đây
const provider = "mock";

export async function runAI(prompt) {
  switch (provider) {
    case "mock":
      return await mockAI(prompt);

    default:
      return await mockAI(prompt);
  }
}