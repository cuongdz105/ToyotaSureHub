const STORAGE_KEY = "toyota_ai_history";

export function loadHistory() {
    return JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
    );
}

export function saveHistory(context) {

    const history = loadHistory();

    history.unshift(context);

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(history)
    );

}

export function clearHistory() {

    localStorage.removeItem(STORAGE_KEY);

}