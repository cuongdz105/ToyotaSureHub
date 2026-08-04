// =======================================
// OpenAI Provider
// =======================================

const MODEL = "gpt-5.5";

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
                model: MODEL,
                input: prompt,
            }),
        }
    );

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
    }

    const data = await response.json();

    console.log("OpenAI Response:", data);

    if (data.output_text) {
        return data.output_text;
    }

    if (data.output?.length) {
        return data.output
            .flatMap(item => item.content || [])
            .map(item => item.text || "")
            .join("");
    }

    return "";
}