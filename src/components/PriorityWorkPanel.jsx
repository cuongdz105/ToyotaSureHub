import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getDashboardWorkItems,
} from "../services/dashboardWorkService";


const V11_INTENT_KEY =
  "toyota_sure_hub_v11_posting_intent";


function formatCarLabel(task) {

  if (task?.carLabel) {
    return task.carLabel;
  }


  if (task?.car) {

    const car = task.car;

    let odo = "";


    if (
      car.odo !== undefined &&
      car.odo !== null &&
      car.odo !== ""
    ) {

      const odoValue =
        Number(car.odo);


      if (!Number.isNaN(odoValue)) {

        odo =
          `${odoValue.toLocaleString(
            "vi-VN",
            {
              maximumFractionDigits: 1,
            }
          )} vạn km`;

      }

    }


    return [
      car.brand,
      car.model,
      car.version,
      car.year,
      car.color,
      odo,
    ]
      .filter(Boolean)
      .join(" · ");

  }


  return task?.carId
    ? `Xe #${task.carId}`
    : "Xe chưa xác định";

}


function getTaskMeta(task) {

  if (task.type === "queue") {

    return {
      icon: "📋",
      title: "Đang có việc Facebook dở",
      button: "📋 Vào Queue",
    };

  }


  return {
    icon: "🚀",
    title: "Xe cần được đẩy tin",
    button: "🚀 Bắt đầu đăng",
  };

}


function PriorityWorkPanel() {

  const navigate =
    useNavigate();


  const [tasks, setTasks] =
    useState([]);


  // Chỉ loading ở lần tải đầu tiên.
  const [loading, setLoading] =
    useState(true);


  // Khi cập nhật sau đó,
  // giữ nguyên dữ liệu cũ.
  const [refreshing, setRefreshing] =
    useState(false);


  const [error, setError] =
    useState("");


  async function refresh(
    isInitial = false
  ) {

    try {

      if (isInitial) {

        setLoading(true);

      } else {

        setRefreshing(true);

      }


      setError("");


      const items =
        await getDashboardWorkItems();


      const nextTasks =
        Array.isArray(items)
          ? items
          : [];


      /*
       * QUAN TRỌNG:
       *
       * Không setTasks([])
       * trước khi tải xong.
       *
       * Dữ liệu cũ vẫn được giữ trên màn hình
       * trong lúc refresh.
       */

      setTasks(
        nextTasks
      );


    } catch (error) {

      console.error(
        "V11 Priority Work Panel:",
        error
      );


      /*
       * Nếu đã có dữ liệu cũ,
       * không xóa dữ liệu đó chỉ vì
       * một lần refresh bị lỗi.
       */

      if (tasks.length === 0) {

        setError(
          error?.message ||
          "Không thể tải việc ưu tiên."
        );

      } else {

        console.warn(
          "Không cập nhật được Priority Work Panel, giữ dữ liệu cũ."
        );

      }

    } finally {

      if (isInitial) {

        setLoading(false);

      } else {

        setRefreshing(false);

      }

    }

  }


  useEffect(() => {

    refresh(true);


    /*
     * Chỉ refresh khi dữ liệu từ tab khác
     * phát sinh storage event.
     */

    const handleStorage = () => {

      refresh(false);

    };


    window.addEventListener(
      "storage",
      handleStorage
    );


    return () => {

      window.removeEventListener(
        "storage",
        handleStorage
      );

    };

  }, []);


  function handleTask(task) {

    if (!task?.carId) {
      return;
    }


    if (
      task.type === "queue"
    ) {

      navigate(
        "/facebook/queue"
      );

      return;
    }


    sessionStorage.setItem(
      V11_INTENT_KEY,
      JSON.stringify({

        source:
          "v11_priority_work",

        carId:
          task.carId,

        accountId:
          task.accountId ?? null,

        createdAt:
          new Date().toISOString(),

      })
    );


    navigate(
      "/facebook/post"
    );

  }


  /*
   * ========================================
   * INITIAL LOADING
   * ========================================
   */

  if (loading) {

    return (

      <section className="section-card">

        <div
          style={{
            padding: 20,
            color: "#666",
          }}
        >
          🧠 Đang tính việc ưu tiên...
        </div>

      </section>

    );

  }


  /*
   * ========================================
   * MAIN
   * ========================================
   */

  return (

    <section className="section-card">

      {/* HEADER */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 16,
        }}
      >

        <div>

          <h2
            style={{
              margin: 0,
            }}
          >
            🧠 Việc tiếp theo
          </h2>


          <p
            style={{
              margin: "5px 0 0",
              color: "#777",
            }}
          >
            ToyotaSureHub tự xếp thứ tự ưu tiên dựa trên
            Queue, Campaign và tình trạng xe.
          </p>

        </div>


        <button
          type="button"
          onClick={() =>
            refresh(false)
          }
          disabled={refreshing}
          style={{
            border:
              "1px solid #ddd",

            background:
              "#fff",

            borderRadius:
              8,

            padding:
              "8px 12px",

            cursor:
              refreshing
                ? "not-allowed"
                : "pointer",

            opacity:
              refreshing
                ? 0.65
                : 1,

            whiteSpace:
              "nowrap",
          }}
        >

          {refreshing
            ? "⏳ Đang cập nhật..."
            : "↻ Cập nhật"}

        </button>

      </div>


      {/* =================================
          REFRESH STATUS
      ================================= */}

      {refreshing && (

        <div
          style={{
            marginBottom: 10,
            color: "#777",
            fontSize: 12,
          }}
        >
          🔄 Đang cập nhật việc ưu tiên...
        </div>

      )}


      {/* =================================
          ERROR
      ================================= */}

      {error ? (

        <div
          style={{
            padding: 14,
            border:
              "1px solid #f1b5b5",
            borderRadius: 10,
            background:
              "#fff5f5",
            color:
              "#b42318",
          }}
        >
          ❌ {error}
        </div>

      ) : tasks.length === 0 ? (

        <div
          style={{
            padding: 20,
            border:
              "1px dashed #ddd",
            borderRadius: 10,
            color: "#777",
          }}
        >
          🎉 Hiện chưa có việc Facebook cần ưu tiên.
        </div>

      ) : (

        <div
          style={{
            display: "grid",
            gap: 10,
          }}
        >

          {tasks.map(
            (task, index) => {

              const meta =
                getTaskMeta(task);


              return (

                <div
                  key={
                    `${task.carId}-${index}`
                  }
                  style={{
                    display:
                      "grid",

                    gridTemplateColumns:
                      "38px minmax(0, 1fr) auto",

                    alignItems:
                      "center",

                    gap:
                      12,

                    padding:
                      14,

                    border:
                      "1px solid #e8e8e8",

                    borderRadius:
                      12,

                    background:
                      index === 0
                        ? "#fffaf0"
                        : "#fff",

                    transition:
                      "opacity 0.15s ease",
                  }}
                >

                  {/* ICON */}

                  <div
                    style={{
                      fontSize:
                        24,

                      textAlign:
                        "center",
                    }}
                  >
                    {meta.icon}
                  </div>


                  {/* CONTENT */}

                  <div
                    style={{
                      minWidth:
                        0,
                    }}
                  >

                    <div
                      style={{
                        fontWeight:
                          700,
                      }}
                    >
                      {formatCarLabel(
                        task
                      ) ||
                        `Xe #${task.carId}`}
                    </div>


                    <div
                      style={{
                        marginTop:
                          3,

                        color:
                          "#666",

                        fontSize:
                          13,
                      }}
                    >
                      {meta.title}

                      {" · "}

                      <strong>
                        {task.score}
                      </strong>{" "}
                      điểm
                    </div>


                    <div
                      style={{
                        marginTop:
                          6,

                        display:
                          "flex",

                        flexWrap:
                          "wrap",

                        gap:
                          6,
                      }}
                    >

                      {(
                        task.reasons ||
                        []
                      ).map(
                        (reason) => (

                          <span
                            key={
                              reason
                            }
                            style={{
                              fontSize:
                                12,

                              padding:
                                "4px 7px",

                              borderRadius:
                                999,

                              background:
                                "#f3f3f3",
                            }}
                          >
                            {reason}
                          </span>

                        )
                      )}

                    </div>

                  </div>


                  {/* ACTION */}

                  <button
                    type="button"
                    onClick={() =>
                      handleTask(
                        task
                      )
                    }
                    style={{
                      border:
                        "none",

                      borderRadius:
                        9,

                      padding:
                        "10px 14px",

                      background:
                        task.type ===
                        "queue"
                          ? "#f3f3f3"
                          : "#d71920",

                      color:
                        task.type ===
                        "queue"
                          ? "#111"
                          : "#fff",

                      fontWeight:
                        700,

                      cursor:
                        "pointer",

                      whiteSpace:
                        "nowrap",
                    }}
                  >
                    {meta.button}
                  </button>

                </div>

              );

            }
          )}

        </div>

      )}

    </section>

  );

}


export default PriorityWorkPanel;


export const V11_POSTING_INTENT_KEY =
  V11_INTENT_KEY;