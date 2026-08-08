const QUEUE_KEY = "facebook_posting_queue";

function createId() {
  return `queue_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export function loadPostingQueue() {
  const data = localStorage.getItem(QUEUE_KEY);

  if (!data) return [];

  try {
    return JSON.parse(data);
  } catch (error) {
    console.error(
      "Không đọc được Facebook Posting Queue:",
      error
    );

    return [];
  }
}

export function savePostingQueue(queue) {
  localStorage.setItem(
    QUEUE_KEY,
    JSON.stringify(queue)
  );
}

export function addToPostingQueue({
  carId,
  group,
  content,
  imageCount = 0,
  accountId = null,
}) {
  if (!group) {
    throw new Error("Chưa chọn hội nhóm.");
  }

  const queue = loadPostingQueue();

  const job = {
    id: createId(),

     logs: [
    {
      message: "📋 Bài đăng được thêm vào Queue",
      timestamp: new Date().toISOString(),
    },
  ],

    carId: carId || null,
    accountId: accountId || null,

    group: {
      id: group.id,
      name: group.name,
      url: group.url || "",
      matchScore: group.matchScore || 0,
    },

    content: content?.trim() || "",

    imageCount,

    status: "waiting",

    error: null,

    createdAt: new Date().toISOString(),

    updatedAt: new Date().toISOString(),
  };

  const updatedQueue = [
    ...queue,
    job,
  ];

  savePostingQueue(updatedQueue);

  return job;
}

export function updateQueueJob(
  jobId,
  updates = {}
) {
  const queue = loadPostingQueue();

  const updatedQueue = queue.map((job) => {
    if (job.id !== jobId) {
      return job;
    }

    return {
      ...job,

      ...updates,

      updatedAt:
        new Date().toISOString(),
    };
  });

  savePostingQueue(updatedQueue);

  return updatedQueue.find(
    (job) => job.id === jobId
  );
}

export function addQueueLog(jobId, message) {
  const queue = loadPostingQueue();

  const updatedQueue = queue.map((job) => {
    if (job.id !== jobId) {
      return job;
    }

    const logs = Array.isArray(job.logs)
      ? job.logs
      : [];

    return {
      ...job,

      logs: [
        ...logs,
        {
          message,
          timestamp: new Date().toISOString(),
        },
      ],

      updatedAt: new Date().toISOString(),
    };
  });

  savePostingQueue(updatedQueue);

  return updatedQueue.find(
    (job) => job.id === jobId
  );
}

export function removeQueueJob(jobId) {
  const queue = loadPostingQueue();

  const updatedQueue = queue.filter(
    (job) => job.id !== jobId
  );

  savePostingQueue(updatedQueue);
}

export function clearPostingQueue() {
  localStorage.removeItem(QUEUE_KEY);
}

export function getQueueStats() {
  const queue = loadPostingQueue();

  return {
    total: queue.length,

    waiting: queue.filter(
      (job) => job.status === "waiting"
    ).length,

    processing: queue.filter(
      (job) => job.status === "processing"
    ).length,

    success: queue.filter(
      (job) => job.status === "success"
    ).length,

    failed: queue.filter(
      (job) => job.status === "failed"
    ).length,
  };
}