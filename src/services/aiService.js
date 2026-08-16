// ================================
// Toyota AI Service
// Version 2.2
// ================================

import { buildPrompt } from "../ai/engine/promptBuilder";
import { runAI } from "../ai/engine/aiEngine";

import facebookPrompt from "../ai/prompts/facebook";
import youtubePrompt from "../ai/prompts/youtube";
import tiktokPrompt from "../ai/prompts/tiktok";
import seoPrompt from "../ai/prompts/seo";
import thumbnailPrompt from "../ai/prompts/thumbnail";
import salesChatPrompt from "../ai/prompts/salesChat";

import { saveHistory } from "./historyService";
import { addMemory } from "../ai/memory/memoryEngine";

import {
  formatOdoVan,
} from "../utils/builders";


// =======================================
// CHUẨN HÓA DỮ LIỆU XE CHO AI
// =======================================

function buildAICar(car) {
  return {
    ...car,

    odo:
      formatOdoVan(car?.odo) ||
      "",
  };
}


// =======================================
// GENERATE CONTENT
// =======================================

async function generateContent(
  car,
  type,
  template,
  researchContext = ""
) {
  const aiCar =
    buildAICar(car);

  const prompt =
    buildPrompt(
      aiCar,
      template,
      researchContext
    );

  const result =
    await runAI(
      prompt,
      aiCar
    );

  saveHistory({
    type,

    model:
      "gpt-5.5",

    carId:
      car.id,

    carName:
      `${car.brand} ${car.model} ${car.year}`,

    prompt,

    result,
  });

  console.log(
    "AI Result:",
    result
  );

  addMemory({
    type,

    car:
      `${car.brand} ${car.model}`,

    summary:
      result?.substring(
        0,
        200
      ) || "",
  });

  return result;
}


// =======================================
// FACEBOOK
// =======================================

export async function generateFacebookPost(
  car
) {
  return generateContent(
    car,
    "facebook",
    facebookPrompt
  );
}


// =======================================
// YOUTUBE
// =======================================

export async function generateYoutube(
  car,
  researchContext = ""
) {
  return generateContent(
    car,
    "youtube",
    youtubePrompt,
    researchContext
  );
}


// =======================================
// TIKTOK
// =======================================

export async function generateTikTok(
  car,
  researchContext = ""
) {
  return generateContent(
    car,
    "tiktok",
    tiktokPrompt,
    researchContext
  );
}


// =======================================
// SEO
// =======================================

export async function generateSEO(
  car
) {
  return generateContent(
    car,
    "seo",
    seoPrompt
  );
}


// =======================================
// THUMBNAIL
// =======================================

export async function generateThumbnail(
  car
) {
  return generateContent(
    car,
    "thumbnail",
    thumbnailPrompt
  );
}


// =======================================
// AI SALES CHAT
// =======================================

export async function generateSalesChat(
  car
) {
  return generateContent(
    car,
    "sales-chat",
    salesChatPrompt
  );
}