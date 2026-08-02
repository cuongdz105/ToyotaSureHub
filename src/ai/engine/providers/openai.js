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
        throw new Error(await response.text());
    }

    const data = await response.json();

    console.log("OPENAI RESPONSE:", data);
    
    return (
        data.output_text ||
        data.output
            ?.flatMap(item => item.content || [])
            ?.find(c => c.type === "output_text")
            ?.text ||
        ""
    );
}