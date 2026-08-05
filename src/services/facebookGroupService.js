const STORAGE_KEY = "toyota_fb_groups";

export function loadGroups() {
  return JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]"
  );
}

export function saveGroups(groups) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(groups)
  );
}

export function addGroup(group) {
  const groups = loadGroups();

  groups.unshift({
    id: Date.now(),

    rating: 5,

    allowPost: true,

    requireApproval: false,

    suitableCars: [],

    accountId: null,

    notes: "",

    members: "",

    category: "",

    totalPosts: 0,

    lastPostAt: null,

    status: "active",

    createdAt: new Date().toISOString(),

    ...group,
  });

  saveGroups(groups);
}

export function updateGroup(id, data) {
  const groups = loadGroups().map((item) =>
    item.id === id
      ? { ...item, ...data }
      : item
  );

  saveGroups(groups);
}

export function deleteGroup(id) {
  saveGroups(
    loadGroups().filter((item) => item.id !== id)
  );
}