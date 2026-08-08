const POSTING_RESULT_KEY = "facebook_posting_result";

function createId() {
  return `fb_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export function prepareFacebookPost({
  carId,
  group,
  content,
  imageCount = 0,
}) {
  if (!group) {
    throw new Error("Chưa chọn hội nhóm.");
  }

  if (!content?.trim()) {
    throw new Error("Chưa có nội dung Facebook.");
  }

  const session = {
    id: createId(),

    carId: carId || null,

    group: {
      id: group.id,
      name: group.name,
      url: group.url || "",
      matchScore: group.matchScore || 0,
    },

    content: content.trim(),

    imageCount,

    status: "ready",

    createdAt: new Date().toISOString(),

    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(
    POSTING_RESULT_KEY,
    JSON.stringify(session)
  );

  return session;
}

export function getFacebookPostingResult() {
  const data = localStorage.getItem(
    POSTING_RESULT_KEY
  );

  if (!data) return null;

  try {
    return JSON.parse(data);
  } catch (error) {
    console.error(
      "Không đọc được Facebook Posting Result:",
      error
    );

    return null;
  }
}

export function updateFacebookPostingStatus(
  status,
  extra = {}
) {
  const current =
    getFacebookPostingResult();

  if (!current) return null;

  const updated = {
    ...current,

    status,

    ...extra,

    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(
    POSTING_RESULT_KEY,
    JSON.stringify(updated)
  );

  return updated;
}

export function clearFacebookPostingResult() {
  localStorage.removeItem(
    POSTING_RESULT_KEY
  );
}