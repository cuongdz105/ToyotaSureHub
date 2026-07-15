// =======================================
// Toyota AI Mock Engine
// Version 1.0
// =======================================

export async function mockAI(prompt) {

    console.log(prompt);

    // Giả lập AI đang suy nghĩ
    await new Promise(resolve =>
        setTimeout(resolve, 1200)
    );

    return `

🤖 Đây là kết quả từ Toyota AI.

==================================

Prompt nhận được:

${prompt}

==================================

Sau này phần này sẽ được thay bằng OpenAI API.

`;

}