// =======================================
// OpenAI Provider
// =======================================

export async function generate(prompt) {

    const response = await fetch(
        "https://api.openai.com/v1/responses",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-5.5",
                input: prompt,
            }),
        }
    );

    if (!response.ok) {
        throw new Error("OpenAI API Error");
    }

    const data = await response.json();

    return data.output_text;
}