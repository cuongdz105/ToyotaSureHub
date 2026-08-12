import {
  loadPostingQueue,
  updateQueueJob,
  addQueueLog,
} from "./facebookPostingQueueService";

import {
  runFacebookPostingEngine,
} from "./facebookPostingEngine";

/**
 * ==========================================
 * FACEBOOK POSTING WORKER
 * ==========================================
 *
 * Nhiệm vụ:
 *
 * 1. Đọc Queue
 * 2. Lấy Job WAITING
 * 3. Kiểm tra dữ liệu Job
 * 4. Chuyển Job -> PROCESSING
 * 5. Gọi Facebook Posting Engine
 * 6. Nhận kết quả từ Engine
 * 7. Ghi Log
 * 8. Chuyển Job -> SUCCESS / FAILED
 *
 * Hiện tại:
 * - Posting Engine = SIMULATION
 * - Chưa đăng Facebook thật
 *
 * Sau này:
 * - Posting Engine có thể dùng Facebook API
 * - Worker không cần viết lại
 *
 * ==========================================
 */


/**
 * ==========================================
 * XỬ LÝ 1 JOB
 * ==========================================
 */
export async function processFacebookJob(jobId) {
  console.log("=================================");
  console.log("🚀 BẮT ĐẦU FACEBOOK WORKER");
  console.log("Job ID:", jobId);

  /**
   * ----------------------------------------
   * 1. Đọc Queue mới nhất
   * ----------------------------------------
   */
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

  /**
   * ----------------------------------------
   * 2. Kiểm tra trạng thái
   * ----------------------------------------
   */
  if (job.status !== "waiting") {
    throw new Error(
      `Job hiện đang ở trạng thái "${job.status}".`
    );
  }

  /**
   * ----------------------------------------
   * 3. Log bắt đầu
   * ----------------------------------------
   */
  addQueueLog(
    jobId,
    "🚀 Bắt đầu xử lý bài đăng"
  );

  /**
   * ----------------------------------------
   * 4. Chuyển sang PROCESSING
   * ----------------------------------------
   */
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
    /**
     * --------------------------------------
     * 5. Gọi Facebook Posting Engine
     * --------------------------------------
     */

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

    /**
     * --------------------------------------
     * 6. Ghi Log từ Posting Engine
     * --------------------------------------
     */

    if (
      Array.isArray(result?.logs)
    ) {
      for (const log of result.logs) {
        if (!log?.message) {
          continue;
        }

        addQueueLog(
          jobId,
          log.message
        );
      }
    }

    /**
     * --------------------------------------
     * 7. Kiểm tra kết quả
     * --------------------------------------
     */

    if (!result?.success) {
      throw new Error(
        "Posting Engine không trả về kết quả thành công."
      );
    }

    /**
     * --------------------------------------
     * 8. Thành công
     * --------------------------------------
     */

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

    /**
     * --------------------------------------
     * 9. Log kết quả cuối
     * --------------------------------------
     */

    if (
      result.published === true
    ) {
      addQueueLog(
        jobId,
        "🟢 Đã đăng Facebook thật thành công"
      );
    } else {
      addQueueLog(
        jobId,
        "🟡 Hoàn tất mô phỏng — chưa đăng Facebook thật"
      );
    }

    console.log(
      "================================="
    );

    return finalResult;

  } catch (error) {

    /**
     * --------------------------------------
     * 10. XỬ LÝ LỖI
     * --------------------------------------
     */

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

    /**
     * --------------------------------------
     * 11. Chuyển Job -> FAILED
     * --------------------------------------
     */

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

    /**
     * Quan trọng:
     *
     * Ném lỗi trở lại cho UI hoặc
     * processFacebookQueue xử lý tiếp.
     */
    throw error;
  }
}


/**
 * ==========================================
 * XỬ LÝ TOÀN BỘ QUEUE
 * ==========================================
 *
 * Chỉ xử lý các Job đang:
 *
 * status === "waiting"
 *
 * Các Job:
 * - success
 * - failed
 * - processing
 *
 * sẽ không bị chạy lại.
 *
 * Xử lý tuần tự:
 *
 * Job 1
 * ↓
 * hoàn tất
 * ↓
 * Job 2
 * ↓
 * hoàn tất
 * ↓
 * Job 3
 *
 * Điều này rất quan trọng khi sau này
 * đăng Facebook thật để tránh gửi quá
 * nhiều request cùng lúc.
 *
 * ==========================================
 */
export async function processFacebookQueue() {
  console.log(
    "🚀 BẮT ĐẦU XỬ LÝ TOÀN BỘ QUEUE"
  );

  /**
   * ----------------------------------------
   * 1. Đọc Queue mới nhất
   * ----------------------------------------
   */
  const queue =
    loadPostingQueue();

  /**
   * ----------------------------------------
   * 2. Chỉ lấy Job WAITING
   * ----------------------------------------
   */
  const waitingJobs =
    queue.filter(
      (job) =>
        job.status === "waiting"
    );

  console.log(
    `📦 Có ${waitingJobs.length} bài đang chờ`
  );

  const results = [];

  /**
   * ----------------------------------------
   * 3. Không có Job
   * ----------------------------------------
   */
  if (
    waitingJobs.length === 0
  ) {
    console.log(
      "📭 Không có bài đăng nào đang chờ."
    );

    return results;
  }

  /**
   * ----------------------------------------
   * 4. Xử lý tuần tự
   * ----------------------------------------
   */
  for (
    const job of waitingJobs
  ) {

    console.log(
      "---------------------------------"
    );

    console.log(
      "🚀 Đang xử lý Job:",
      job.id
    );

    try {

      const result =
        await processFacebookJob(
          job.id
        );

      results.push(
        result
      );

    } catch (error) {

      console.error(
        `❌ Job ${job.id} thất bại:`,
        error
      );

      /**
       * Job đã được processFacebookJob
       * chuyển thành FAILED rồi.
       *
       * Ở đây chỉ trả kết quả về cho UI.
       */

      const failedJob =
        loadPostingQueue().find(
          (item) =>
            item.id === job.id
        );

      results.push(
        failedJob || {
          id: job.id,

          status: "failed",

          error:
            error?.message ||
            "Lỗi không xác định.",
        }
      );
    }
  }

  /**
   * ----------------------------------------
   * 5. Hoàn tất Queue
   * ----------------------------------------
   */

  console.log(
    "================================="
  );

  console.log(
    "🟢 ĐÃ XỬ LÝ XONG QUEUE"
  );

  console.log(
    `📦 Tổng Job: ${waitingJobs.length}`
  );

  console.log(
    `🟢 Thành công: ${
      results.filter(
        (item) =>
          item?.status ===
          "success"
      ).length
    }`
  );

  console.log(
    `🔴 Thất bại: ${
      results.filter(
        (item) =>
          item?.status ===
          "failed"
      ).length
    }`
  );

  console.log(
    "================================="
  );

  return results;
}