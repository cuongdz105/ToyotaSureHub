import { useEffect, useState } from "react";

import SectionCard from "../../components/Common/SectionCard";
import PrimaryButton from "../../components/Common/PrimaryButton";

import {
  loadPostingQueue,
  removeQueueJob,
  clearPostingQueue,
  getQueueStats,
} from "../../services/facebookPostingQueueService";

import {
  processFacebookJob,
  processFacebookQueue,
} from "../../services/facebookPostingWorkerService";

function FacebookPostingQueue() {
  const [queue, setQueue] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    waiting: 0,
    processing: 0,
    success: 0,
    failed: 0,
  });

  const [processing, setProcessing] = useState(false);

  function refresh() {
    setQueue(loadPostingQueue());
    setStats(getQueueStats());
  }

  useEffect(() => {
    refresh();
  }, []);

  function handleRemove(id) {
    removeQueueJob(id);
    refresh();
  }

  function handleClear() {
    if (
      !window.confirm(
        "Xóa toàn bộ hàng đợi đăng Facebook?"
      )
    ) {
      return;
    }

    clearPostingQueue();
    refresh();
  }

  async function handleProcessJob(jobId) {
  try {
    setProcessing(true);

    await processFacebookJob(jobId);

    refresh();

    alert(
      "🟢 Job đã xử lý thành công!\n\n" +
      "Lưu ý: Đây vẫn là Posting Engine mô phỏng, chưa đăng Facebook thật."
    );
  } catch (error) {
    console.error(error);

    refresh();

    alert(
      "🔴 Xử lý thất bại:\n\n" +
      error.message
    );
  } finally {
    setProcessing(false);
  }
}

async function handleProcessAll() {
  try {
    setProcessing(true);

    const results =
      await processFacebookQueue();

    refresh();

    const successCount = results.filter(
      (item) => item?.status === "success"
    ).length;

    const failedCount = results.filter(
      (item) => item?.status === "failed"
    ).length;

    alert(
      "🚀 Queue đã xử lý xong!\n\n" +
      `🟢 Thành công: ${successCount}\n` +
      `🔴 Thất bại: ${failedCount}\n\n` +
      "⚠️ Đây vẫn là Posting Engine mô phỏng."
    );
  } catch (error) {
    console.error(error);

    alert(
      "❌ Queue Worker lỗi:\n\n" +
      error.message
    );
  } finally {
    setProcessing(false);
    refresh();
  }
}

  function getStatusLabel(status) {
    switch (status) {
      case "waiting":
        return "🟡 Chờ đăng";

      case "processing":
        return "🔵 Đang xử lý";

      case "success":
        return "🟢 Thành công";

      case "failed":
        return "🔴 Thất bại";

      default:
        return status;
    }
  }

  return (
    <main className="content">
      <h1>📋 Facebook Posting Queue</h1>

      <p>
        Quản lý các bài đăng Facebook đang chờ
        xử lý.
      </p>

      <SectionCard title="📊 Tổng quan">
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "12px",
          }}
        >
          <div>
            📦 Tổng: <strong>{stats.total}</strong>
          </div>

          <div>
            🟡 Chờ:
            <strong> {stats.waiting}</strong>
          </div>

          <div>
            🔵 Đang xử lý:
            <strong> {stats.processing}</strong>
          </div>

          <div>
            🟢 Thành công:
            <strong> {stats.success}</strong>
          </div>

          <div>
            🔴 Thất bại:
            <strong> {stats.failed}</strong>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="🚀 Hàng đợi đăng">

<div
  style={{
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    flexWrap: "wrap",
  }}
>
  <PrimaryButton
    onClick={handleProcessAll}
    disabled={processing || queue.length === 0}
  >
    {processing
      ? "⏳ Queue Worker đang chạy..."
      : "🚀 CHẠY QUEUE WORKER"}
  </PrimaryButton>
</div>

<p
  style={{
    background: "#fff8e1",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ffe082",
  }}
>
  ⚠️ <strong>Chế độ mô phỏng:</strong>{" "}
  Queue Worker hiện chỉ mô phỏng quá trình đăng Facebook,
  chưa đăng bài thật lên Facebook.
</p>

        {queue.length === 0 ? (
          <p>
            📭 Chưa có bài đăng nào trong
            hàng đợi.
          </p>
        ) : (
          <>
            {queue.map((job, index) => (
              <div
                key={job.id}
                style={{
                  border:
                    "1px solid #ddd",
                  borderRadius: "10px",
                  padding: "15px",
                  marginBottom: "12px",
                  background: "#fff",
                }}
              >
                <h3>
                  #{index + 1}{" "}
                  {job.group?.name}
                </h3>

                <p>
                  🚗 Car ID:{" "}
                  <strong>
                    {job.carId || "-"}
                  </strong>
                </p>

                <p>
                  📷 Ảnh:{" "}
                  <strong>
                    {job.imageCount}
                  </strong>
                </p>

                <p>
                  📌 Trạng thái:{" "}
                  <strong>
                    {getStatusLabel(
                      job.status
                    )}
                  </strong>
                </p>

                {Array.isArray(job.logs) &&
  job.logs.length > 0 && (
    <div
      style={{
        marginTop: "15px",
        padding: "12px",
        background: "#f7f7f7",
        borderRadius: "8px",
        border: "1px solid #e0e0e0",
      }}
    >
      <strong>
        📜 Nhật ký xử lý
      </strong>

      <div
        style={{
          marginTop: "10px",
        }}
      >
        {job.logs.map(
          (log, logIndex) => (
            <div
              key={logIndex}
              style={{
                padding: "6px 0",
                borderBottom:
                  logIndex <
                  job.logs.length - 1
                    ? "1px solid #eee"
                    : "none",
                fontSize: "14px",
              }}
            >
              <span>
                {log.message}
              </span>

              <span
                style={{
                  marginLeft: "10px",
                  color: "#888",
                  fontSize: "12px",
                }}
              >
                {new Date(
                  log.timestamp
                ).toLocaleTimeString(
                  "vi-VN"
                )}
              </span>
            </div>
          )
        )}
      </div>
    </div>
  )}

                {job.error && (
                  <p>
                    ❌ Lỗi:{" "}
                    {job.error}
                  </p>
                )}

                <div
  style={{
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  }}
>
  {job.status === "waiting" && (
    <PrimaryButton
      onClick={() =>
        handleProcessJob(job.id)
      }
      disabled={processing}
    >
      🚀 Xử lý bài này
    </PrimaryButton>
  )}

  <PrimaryButton
    onClick={() =>
      handleRemove(job.id)
    }
  >
    🗑️ Xóa
  </PrimaryButton>
</div>
              </div>
            ))}

            <PrimaryButton
              onClick={handleClear}
            >
              🗑️ Xóa toàn bộ Queue
            </PrimaryButton>
          </>
        )}
      </SectionCard>
    </main>
  );
}

export default FacebookPostingQueue;