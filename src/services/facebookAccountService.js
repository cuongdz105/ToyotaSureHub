const STORAGE_KEY = "toyota_fb_accounts";

export function loadAccounts() {
    return JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
    );
}

export function saveAccounts(accounts) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(accounts)
    );
}

export function addAccount(account) {

    const accounts = loadAccounts();

    accounts.unshift({
        id: Date.now(),
        createdAt: new Date().toISOString(),

        status: "active",

        groups: [],

        ...account,
    });

    saveAccounts(accounts);
}

export function updateAccount(id, data) {

    const accounts = loadAccounts().map((item) =>
        item.id === id
            ? { ...item, ...data }
            : item
    );

    saveAccounts(accounts);
}

export function deleteAccount(id) {

    saveAccounts(

        loadAccounts().filter(
            (item) => item.id !== id
        )

    );

}