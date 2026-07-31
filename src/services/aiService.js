// ================================
// Toyota AI Service
// Version 1.0
// ================================

import { buildPrompt } from "../ai/engine/promptBuilder";
import { runAI } from "../ai/engine/aiEngine";

import facebookPrompt from "../ai/prompts/facebook";
import youtubePrompt from "../ai/prompts/youtube";
import tiktokPrompt from "../ai/prompts/tiktok";
import seoPrompt from "../ai/prompts/seo";
import thumbnailPrompt from "../ai/prompts/thumbnail";

// ================================
// Prompt Builder V2.0
// ================================


// ================================
// Mock AI
// ================================




export async function generateFacebookPost(car) {

    const prompt = buildPrompt(
        car,
        facebookPrompt
    );

    return await runAI(prompt, car);

}

export async function generateYoutube(car) {

    const prompt = buildPrompt(
    car,
    youtubePrompt
);

    return runAI(prompt, car);

}

export async function generateTikTok(car) {

   const prompt = buildPrompt(
    car,
    tiktokPrompt
);
    return runAI(prompt, car);

}

export async function generateSEO(car) {

    const prompt = buildPrompt(
    car,
    seoPrompt
);

    return runAI(prompt, car);

}


export async function generateThumbnail(car) {

   const prompt = buildPrompt(
    car,
    thumbnailPrompt
);

    return runAI(prompt, car);

}