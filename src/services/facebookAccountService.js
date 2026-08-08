const STORAGE_KEY = "toyota_fb_accounts";

export function loadAccounts() {
    try {
        return JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]"
        );
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
        createdAt: new Date().toISOString(),

        status: "active",

        groups: [],

        totalPosts: 0,

        isDefault:
            accounts.length === 0,

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

    updatedAccounts.unshift(newAccount);

    saveAccounts(updatedAccounts);

    return newAccount;
}

export function updateAccount(id, data) {
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

    saveAccounts(updatedAccounts);

    return updatedAccounts.find(
        (item) => item.id === id
    );
}

export function deleteAccount(id) {
    const accounts = loadAccounts();

    const accountToDelete =
        accounts.find(
            (item) => item.id === id
        );

    if (!accountToDelete) {
        return;
    }

    let updatedAccounts =
        accounts.filter(
            (item) => item.id !== id
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

    saveAccounts(updatedAccounts);
}

export function setDefaultAccount(id) {
    const accounts = loadAccounts();

    const updatedAccounts =
        accounts.map((item) => ({
            ...item,
            isDefault:
                item.id === id,
        }));

    saveAccounts(updatedAccounts);

    return updatedAccounts.find(
        (item) => item.id === id
    );
}

export function getDefaultAccount() {
    const accounts = loadAccounts();

    return (
        accounts.find(
            (item) => item.isDefault
        ) || null
    );
}