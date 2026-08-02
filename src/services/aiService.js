// ================================
// Toyota AI Service
// Version 1.1
// ================================

import { buildPrompt } from "../ai/engine/promptBuilder";
import { runAI } from "../ai/engine/aiEngine";

import facebookPrompt from "../ai/prompts/facebook";
import youtubePrompt from "../ai/prompts/youtube";
import tiktokPrompt from "../ai/prompts/tiktok";
import seoPrompt from "../ai/prompts/seo";
import thumbnailPrompt from "../ai/prompts/thumbnail";

import { buildContext } from "../core/engines/contentEngine";
import { saveHistory } from "./historyService";
import { addMemory } from "../ai/memory/memoryEngine";

// =======================================
// Facebook
// =======================================

export async function generateFacebookPost(car) {

    const context = buildContext();

    const prompt = buildPrompt(
        car,
        facebookPrompt,
        context.knowledge
    );

    const result = await runAI(prompt, car);

    saveHistory({
        type: "facebook",
        model: "gpt-5.5",
        carId: car.id,
        carName: `${car.brand} ${car.model} ${car.year}`,
        prompt,
        result,
    });

    addMemory({
    type: "facebook",
    car: `${car.brand} ${car.model}`,
    summary: result.substring(0, 200)
});

    return result;
}

// =======================================
// Youtube
// =======================================

export async function generateYoutube(car) {

    const context = buildContext();

    const prompt = buildPrompt(
        car,
        youtubePrompt,
        context.knowledge
    );

    const result = await runAI(prompt, car);

    saveHistory({
        type: "youtube",
        model: "gpt-5.5",
        carId: car.id,
        carName: `${car.brand} ${car.model} ${car.year}`,
        prompt,
        result,
    });
    
    addMemory({
    type: "youtube",
    car: `${car.brand} ${car.model}`,
    summary: result.substring(0, 200)
});
    return result;
}

// =======================================
// TikTok
// =======================================

export async function generateTikTok(car) {

    const context = buildContext();

    const prompt = buildPrompt(
        car,
        tiktokPrompt,
        context.knowledge
    );

    const result = await runAI(prompt, car);

    saveHistory({
        type: "tiktok",
        model: "gpt-5.5",
        carId: car.id,
        carName: `${car.brand} ${car.model} ${car.year}`,
        prompt,
        result,
    });

    addMemory({
    type: "tiktok",
    car: `${car.brand} ${car.model}`,
    summary: result.substring(0, 200)
});

    return result;
}

// =======================================
// SEO
// =======================================

export async function generateSEO(car) {

    const context = buildContext();

    const prompt = buildPrompt(
        car,
        seoPrompt,
        context.knowledge
    );

    const result = await runAI(prompt, car);

    saveHistory({
        type: "seo",
        model: "gpt-5.5",
        carId: car.id,
        carName: `${car.brand} ${car.model} ${car.year}`,
        prompt,
        result,
    });

addMemory({
    type: "seo",
    car: `${car.brand} ${car.model}`,
    summary: result.substring(0, 200)
});

    return result;
}

// =======================================
// Thumbnail
// =======================================

export async function generateThumbnail(car) {

    const context = buildContext();

    const prompt = buildPrompt(
        car,
        thumbnailPrompt,
        context.knowledge
    );

    const result = await runAI(prompt, car);

    saveHistory({
        type: "thumbnail",
        model: "gpt-5.5",
        carId: car.id,
        carName: `${car.brand} ${car.model} ${car.year}`,
        prompt,
        result,
    });

    addMemory({
    type: "thumbnail",
    car: `${car.brand} ${car.model}`,
    summary: result.substring(0, 200)
});

    return result;
}