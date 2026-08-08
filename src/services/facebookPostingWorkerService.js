import {
  loadPostingQueue,
  updateQueueJob,
  addQueueLog,
} from "./facebookPostingQueueService";

import {
  runFacebookPostingEngine,
} from "./facebookPostingEngine";

/**
 * FACEBOOK POSTING WORKER
 *
 * Nhiệm vụ:
 * - Đọc Queue
 * - Lấy Job đang waiting
 * - Chuyển Job sang processing
 * - Gọi Facebook Posting Engine
 * - Ghi Log
 * - Cập nhật success / failed
 *
 * LƯU Ý:
 * Posting Engine hiện tại vẫn là SIMULATION MODE.
 * Chưa đăng Facebook thật.
 */

/**
 * Xử lý 1 bài đăng Facebook
 */
export async function processFacebookJob(jobId) {
  console.log("=================================");
  console.log("🚀 BẮT ĐẦU FACEBOOK WORKER");
  console.log("Job ID:", jobId);

  // --------------------------------
  // 1. Đọc Queue
  // --------------------------------

  const queue = loadPostingQueue();

  const job = queue.find(
    (item) => item.id === jobId
  );

  if (!job) {
    throw new Error(
      "Không tìm thấy bài đăng trong Queue."
    );
  }

  console.log("📦 Job:", job);

  addQueueLog(
    jobId,
    "🚀 Bắt đầu xử lý bài đăng"
  );

  // --------------------------------
  // 2. Kiểm tra trạng thái
  // --------------------------------

  if (job.status !== "waiting") {
    throw new Error(
      `Job hiện đang ở trạng thái "${job.status}".`
    );
  }

  // --------------------------------
  // 3. Chuyển sang PROCESSING
  // --------------------------------

  updateQueueJob(jobId, {
    status: "processing",
    error: null,
  });

  console.log(
    "🔵 Trạng thái: PROCESSING"
  );

  addQueueLog(
    jobId,
    "🔵 Chuyển trạng thái sang PROCESSING"
  );

  try {
    // --------------------------------
    // 4. Gọi Posting Engine
    // --------------------------------

    console.log(
      "🚀 Gọi Facebook Posting Engine..."
    );

    addQueueLog(
      jobId,
      "🚀 Gọi Facebook Posting Engine"
    );

    const result =
      await runFacebookPostingEngine(job);

    console.log(
      "📦 Posting Engine Result:",
      result
    );

    // --------------------------------
    // 5. Ghi các Log từ Engine
    // --------------------------------

    if (
      Array.isArray(result?.logs)
    ) {
      for (const log of result.logs) {
        if (!log?.message) continue;

        addQueueLog(
          jobId,
          log.message
        );
      }
    }

    // --------------------------------
    // 6. Kiểm tra kết quả Engine
    // --------------------------------

    if (!result?.success) {
      throw new Error(
        "Posting Engine không trả về kết quả thành công."
      );
    }

    // --------------------------------
    // 7. Thành công
    // --------------------------------

    const finalResult =
      updateQueueJob(
        jobId,
        {
          status: "success",

          error: null,

          result: {
            ...result,

            mode:
              result.mode ||
              "simulation",

            published:
              result.published === true,

            completedAt:
              result.completedAt ||
              new Date().toISOString(),
          },
        }
      );

    console.log(
      "🟢 FACEBOOK WORKER SUCCESS"
    );

    console.log(
      "Result:",
      finalResult
    );

    addQueueLog(
      jobId,
      result.published === true
        ? "🟢 Đã đăng Facebook thật thành công"
        : "🟡 Hoàn tất mô phỏng — chưa đăng Facebook thật"
    );

    console.log(
      "================================="
    );

    return finalResult;

  } catch (error) {

    // --------------------------------
    // 8. Xử lý lỗi
    // --------------------------------

    console.error(
      "❌ FACEBOOK WORKER ERROR:",
      error
    );

    const errorMessage =
      error?.message ||
      "Lỗi không xác định.";

    addQueueLog(
      jobId,
      `🔴 Worker thất bại: ${errorMessage}`
    );

    const failedResult =
      updateQueueJob(
        jobId,
        {
          status: "failed",

          error: errorMessage,

          result: {
            mode: "simulation",

            published: false,

            failedAt:
              new Date().toISOString(),
          },
        }
      );

    console.log(
      "🔴 FACEBOOK WORKER FAILED"
    );

    console.log(
      "Error:",
      errorMessage
    );

    console.log(
      "================================="
    );

    throw error;
  }
}

/**
 * Chạy toàn bộ bài đang ở trạng thái WAITING
 */
export async function processFacebookQueue() {
  console.log(
    "🚀 BẮT ĐẦU XỬ LÝ TOÀN BỘ QUEUE"
  );

  const queue =
    loadPostingQueue();

  const waitingJobs =
    queue.filter(
      (job) =>
        job.status === "waiting"
    );

  console.log(
    `📦 Có ${waitingJobs.length} bài đang chờ`
  );

  const results = [];

  // --------------------------------
  // Xử lý tuần tự từng Job
  // --------------------------------

  for (const job of waitingJobs) {
    try {
      const result =
        await processFacebookJob(
          job.id
        );

      results.push(result);

    } catch (error) {

      console.error(
        `❌ Job ${job.id} thất bại:`,
        error
      );

      results.push({
        id: job.id,

        status: "failed",

        error:
          error?.message ||
          "Lỗi không xác định.",
      });
    }
  }

  console.log(
    "🟢 ĐÃ XỬ LÝ XONG QUEUE"
  );

  return results;
}