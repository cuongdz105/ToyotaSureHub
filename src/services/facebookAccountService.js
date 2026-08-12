const STORAGE_KEY = "toyota_fb_accounts";

export function loadAccounts() {
  try {
    const accounts = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );

    if (!Array.isArray(accounts)) {
      return [];
    }

    /*
     * Migration dữ liệu cũ
     *
     * Account cũ chưa có:
     * - allowAllGroups
     * - excludedGroupIds
     *
     * thì tự động bổ sung.
     *
     * Không làm mất dữ liệu cũ.
     */
    return accounts.map((account) => ({
      ...account,

      /*
       * Mặc định Account được phép
       * đăng tất cả các Group.
       */
      allowAllGroups:
        typeof account.allowAllGroups === "boolean"
          ? account.allowAllGroups
          : true,

      /*
       * Danh sách Group bị loại trừ
       * khi allowAllGroups = true.
       */
      excludedGroupIds:
        Array.isArray(account.excludedGroupIds)
          ? account.excludedGroupIds
          : [],
    }));
  } catch (error) {
    console.error(
      "Không đọc được Facebook Accounts:",
      error
    );

    return [];
  }
}

export function saveAccounts(accounts) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(accounts)
  );
}

export function addAccount(account) {
  const accounts = loadAccounts();

  const newAccount = {
    id: Date.now(),

    createdAt:
      new Date().toISOString(),

    status: "active",

    groups: [],

    totalPosts: 0,

    isDefault:
      accounts.length === 0,

    /*
     * Mặc định tài khoản mới
     * được phép đăng tất cả Group.
     */
    allowAllGroups: true,

    /*
     * Chưa có Group nào bị loại trừ.
     */
    excludedGroupIds: [],

    ...account,
  };

  /*
   * Nếu tài khoản mới được đặt
   * làm mặc định thì bỏ mặc định
   * của các tài khoản cũ.
   */
  let updatedAccounts;

  if (newAccount.isDefault) {
    updatedAccounts =
      accounts.map((item) => ({
        ...item,
        isDefault: false,
      }));
  } else {
    updatedAccounts = accounts;
  }

  updatedAccounts.unshift(
    newAccount
  );

  saveAccounts(
    updatedAccounts
  );

  return newAccount;
}

export function updateAccount(
  id,
  data
) {
  const accounts = loadAccounts();

  const updatedAccounts =
    accounts.map((item) =>
      item.id === id
        ? {
            ...item,
            ...data,
          }
        : item
    );

  saveAccounts(
    updatedAccounts
  );

  return updatedAccounts.find(
    (item) =>
      item.id === id
  );
}

export function deleteAccount(id) {
  const accounts = loadAccounts();

  const accountToDelete =
    accounts.find(
      (item) =>
        item.id === id
    );

  if (!accountToDelete) {
    return;
  }

  let updatedAccounts =
    accounts.filter(
      (item) =>
        item.id !== id
    );

  /*
   * Nếu xóa tài khoản mặc định
   * thì tự động chọn tài khoản
   * đầu tiên còn lại làm mặc định.
   */
  if (
    accountToDelete.isDefault &&
    updatedAccounts.length > 0
  ) {
    updatedAccounts =
      updatedAccounts.map(
        (item, index) => ({
          ...item,
          isDefault:
            index === 0,
        })
      );
  }

  saveAccounts(
    updatedAccounts
  );
}

export function setDefaultAccount(
  id
) {
  const accounts = loadAccounts();

  const updatedAccounts =
    accounts.map((item) => ({
      ...item,

      isDefault:
        item.id === id,
    }));

  saveAccounts(
    updatedAccounts
  );

  return updatedAccounts.find(
    (item) =>
      item.id === id
  );
}

export function getDefaultAccount() {
  const accounts =
    loadAccounts();

  return (
    accounts.find(
      (item) =>
        item.isDefault
    ) || null
  );
}

/*
 * ==========================================
 * KIỂM TRA ACCOUNT CÓ ĐƯỢC PHÉP ĐĂNG GROUP
 * ==========================================
 *
 * allowAllGroups = true
 *   → được đăng tất cả
 *   → trừ những Group nằm trong
 *     excludedGroupIds
 *
 * allowAllGroups = false
 *   → hiện tại chưa cấp quyền Group cụ thể
 *   → sẽ xử lý ở bước tiếp theo.
 */
export function isAccountAllowedForGroup(
  account,
  groupId
) {
  if (!account) {
    return false;
  }

  if (
    account.allowAllGroups === true
  ) {
    const excludedIds =
      Array.isArray(
        account.excludedGroupIds
      )
        ? account.excludedGroupIds
        : [];

    return !excludedIds.some(
      (id) =>
        String(id) ===
        String(groupId)
    );
  }

  return false;
}