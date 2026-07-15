// ================================
// Toyota AI Service
// Version 1.0
// ================================

import { buildCarName } from "../utils/format";
import { buildPrompt } from "../ai/engine/promptBuilder";
import { runAI } from "../ai/engine/aiEngine";

import facebookPrompt from "../ai/prompts/facebook";
import youtubePrompt from "../ai/prompts/youtube";
import tiktokPrompt from "../ai/prompts/tiktok";
import seoPrompt from "../ai/prompts/seo";

// ================================
// Prompt Builder V2.0
// ================================


// ================================
// Mock AI
// ================================


export async function generateYoutubeContent(car) {

    const prompt = buildPrompt(
        car,
        youtubePrompt
    );

    return await runAI(prompt);

}

export async function generateSeoArticle(car) {

    const prompt = buildPrompt(
        car,
        seoPrompt
    );

    return await runAI(prompt);

}

export async function generateTikTokScript(car) {

    const prompt = buildPrompt(
        car,
        tiktokPrompt
    );

    return await runAI(prompt);

}

export async function generateFacebookPost(car) {

    const prompt = buildPrompt(
        car,
        facebookPrompt
    );

    return await runAI(prompt, car);

}