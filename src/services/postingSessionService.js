const KEY = "posting_session";

export function startPosting(car) {
    localStorage.setItem(KEY, JSON.stringify(car));
}

export function getCurrentPosting() {
    const data = localStorage.getItem(KEY);

    if (!data) return null;

    return JSON.parse(data);
}

export function clearPosting() {
    localStorage.removeItem(KEY);
}