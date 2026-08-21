import {
  getPriorityTasks,
} from "./priorityEngine";


const WORK_PLAN_KEY =
  "toyota_sure_hub_work_plan_v11";


function loadStoredPlan() {

  try {

    const raw =
      localStorage.getItem(
        WORK_PLAN_KEY
      );


    if (!raw) {
      return [];
    }


    const parsed =
      JSON.parse(raw);


    return Array.isArray(parsed)
      ? parsed
      : [];

  } catch (error) {

    console.error(
      "Không đọc được Work Plan:",
      error
    );

    return [];

  }

}


function saveStoredPlan(plan) {

  localStorage.setItem(
    WORK_PLAN_KEY,
    JSON.stringify(plan)
  );

}


/*
========================================
WORK PLAN ĐỘNG - SUPABASE
========================================

Nguồn xe thực tế nằm ở Supabase thông qua
priorityEngine.

Mỗi lần Dashboard mở:
→ đọc lại xe đang bán từ Supabase
→ tính lại Priority
→ loại toàn bộ task của xe không còn tồn tại
→ giữ lại firstSeen/status cho xe còn tồn tại
→ sắp xếp lại.
*/

export async function getWorkPlan() {

  const tasks =
    await getPriorityTasks();


  const previous =
    loadStoredPlan();


  const now =
    new Date().toISOString();


  const activeCarIds =
    new Set(
      tasks.map((task) =>
        String(task.carId)
      )
    );


  // Dọn task mồ côi khỏi localStorage.
  // Chỉ giữ những task vẫn thuộc xe đang có trong
  // Priority Engine / Supabase.
  const validPrevious =
    previous.filter((item) =>
      activeCarIds.has(
        String(item.carId)
      )
    );


  const nextPlan =
    tasks.map((task) => {

      const old =
        validPrevious.find(
          (item) =>
            String(item.carId) ===
            String(task.carId)
        );


      return {

        ...task,

        firstSeenAt:
          old?.firstSeenAt ||
          now,

        lastEvaluatedAt:
          now,

        status:
          old?.status ||
          "pending",

        startedAt:
          old?.startedAt ||
          null,

      };

    });


  saveStoredPlan(nextPlan);


  return nextPlan;

}


export async function getWorkPlanTask(
  carId
) {

  const plan =
    await getWorkPlan();


  return (
    plan.find(
      (task) =>
        String(task.carId) ===
        String(carId)
    ) || null
  );

}


export async function markWorkPlanStarted(
  carId
) {

  const plan =
    await getWorkPlan();


  const updated =
    plan.map((item) =>

      String(item.carId) ===
      String(carId)

        ? {

            ...item,

            status:
              "in_progress",

            startedAt:
              item.startedAt ||
              new Date().toISOString(),

          }

        : item
    );


  saveStoredPlan(updated);


  return (
    updated.find(
      (item) =>
        String(item.carId) ===
        String(carId)
    ) || null
  );

}


export function clearWorkPlanForCar(
  carId
) {

  const plan =
    loadStoredPlan();


  const updated =
    plan.filter(
      (item) =>
        String(item.carId) !==
        String(carId)
    );


  saveStoredPlan(updated);


  return updated;

}


export function clearWorkPlan() {

  localStorage.removeItem(
    WORK_PLAN_KEY
  );

}


export const WORK_PLAN_STORAGE_KEY =
  WORK_PLAN_KEY;
