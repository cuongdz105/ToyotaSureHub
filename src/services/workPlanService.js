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


    return Array.isArray(
      parsed
    )
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


function saveStoredPlan(
  plan
) {

  localStorage.setItem(
    WORK_PLAN_KEY,
    JSON.stringify(plan)
  );

}


/*
========================================
WORK PLAN ĐỘNG
========================================

Không phải lịch cứng.

Mỗi lần Dashboard mở:
→ đọc lại dữ liệu
→ tính lại Priority
→ sắp xếp lại.
*/

export function getWorkPlan() {

  const tasks =
    getPriorityTasks();


  const previous =
    loadStoredPlan();


  const now =
    new Date().toISOString();


  const nextPlan =
    tasks.map(
      (task) => {

        const old =
          previous.find(
            (item) =>
              String(
                item.carId
              ) ===
              String(
                task.carId
              )
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

        };

      }
    );


  saveStoredPlan(
    nextPlan
  );


  return nextPlan;

}


export function getWorkPlanTask(
  carId
) {

  return (
    getWorkPlan().find(
      (task) =>
        String(
          task.carId
        ) ===
        String(carId)
    ) || null
  );

}


export function markWorkPlanStarted(
  carId
) {

  const plan =
    getWorkPlan();


  const updated =
    plan.map(
      (item) =>

        String(
          item.carId
        ) ===
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


  saveStoredPlan(
    updated
  );


  return (
    updated.find(
      (item) =>
        String(
          item.carId
        ) ===
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
        String(
          item.carId
        ) !==
        String(carId)
    );


  saveStoredPlan(
    updated
  );


  return updated;

}


export function clearWorkPlan() {

  localStorage.removeItem(
    WORK_PLAN_KEY
  );

}


export const WORK_PLAN_STORAGE_KEY =
  WORK_PLAN_KEY;