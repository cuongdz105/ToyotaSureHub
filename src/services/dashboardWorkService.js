import { getWorkPlan } from "./workPlanService";


export function getDashboardWorkItems() {

  const plan =
    getWorkPlan();

  return plan.slice(0, 8);
}


export function getDashboardWorkSummary() {

  const plan =
    getWorkPlan();


  return {

    total:
      plan.length,

    urgent:
      plan.filter(
        (item) =>
          item.score >= 80
      ).length,

    inProgress:
      plan.filter(
        (item) =>
          item.type === "queue"
      ).length,

    newTasks:
      plan.filter(
        (item) =>
          item.type ===
          "new_posting"
      ).length,

  };
}