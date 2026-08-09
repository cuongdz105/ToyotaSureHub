const STORAGE_KEY = "toyota_fb_groups";

export function loadGroups() {
  try {
    const groups = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );

    if (!Array.isArray(groups)) {
      return [];
    }

    /*
     * Migration dữ liệu cũ
     *
     * Nếu Group cũ chưa có accountIds
     * thì tự động thêm mảng rỗng.
     *
     * Không làm mất dữ liệu cũ.
     */
    return groups.map((group) => ({
      ...group,

      accountIds: Array.isArray(group.accountIds)
        ? group.accountIds
        : [],
    }));
  } catch (error) {
    console.error(
      "Không đọc được Facebook Groups:",
      error
    );

    return [];
  }
}

export function saveGroups(groups) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(groups)
  );
}

export function addGroup(group) {
  const groups = loadGroups();

  const newGroup = {
    id: Date.now(),

    rating: 5,

    allowPost: true,

    requireApproval: false,

    suitableCars: [],

    /*
     * Danh sách tài khoản Facebook
     * được phép đăng vào nhóm này.
     *
     * Một nhóm có thể có nhiều tài khoản.
     */
    accountIds: [],

    notes: "",

    members: "",

    category: "",

    totalPosts: 0,

    lastPostAt: null,

    status: "active",

    createdAt:
      new Date().toISOString(),

    ...group,
  };

  groups.unshift(newGroup);

  saveGroups(groups);

  return newGroup;
}

export function updateGroup(id, data) {
  const groups = loadGroups();

  const updatedGroups = groups.map(
    (item) =>
      item.id === id
        ? {
            ...item,
            ...data,
          }
        : item
  );

  saveGroups(updatedGroups);

  return updatedGroups.find(
    (item) => item.id === id
  );
}

export function deleteGroup(id) {
  saveGroups(
    loadGroups().filter(
      (item) => item.id !== id
    )
  );
}