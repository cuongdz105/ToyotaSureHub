// =======================================
// Toyota AI Engine
// =======================================

import { mockAI } from "./mockAI";



// Sau này chỉ cần đổi provider ở đây
const provider = "mock";

export async function runAI(prompt, car) {
    return mockAI(prompt, car);
}