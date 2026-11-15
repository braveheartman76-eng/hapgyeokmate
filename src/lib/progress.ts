export type StoredAttempt = { questionId: string; subjectId: string; prompt: string; selectedIndex: number; correctIndex: number; correct: boolean; explanation: string; answeredAt: string };
const KEY = "hapgyeokmate.attempts.v1";
export function loadAttempts(): StoredAttempt[] { if (typeof window === "undefined") return []; try { return JSON.parse(localStorage.getItem(KEY) ?? "[]") as StoredAttempt[]; } catch { return []; } }
export function saveAttempt(attempt: StoredAttempt) { const attempts = loadAttempts(); localStorage.setItem(KEY, JSON.stringify([attempt, ...attempts.filter((item) => item.questionId !== attempt.questionId)].slice(0, 200))); window.dispatchEvent(new Event("hapgyeokmate:progress")); }
export function clearWrongAttempt(questionId: string) { localStorage.setItem(KEY, JSON.stringify(loadAttempts().filter((item) => item.questionId !== questionId))); window.dispatchEvent(new Event("hapgyeokmate:progress")); }
