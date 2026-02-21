const WORDS_BASE = "/words";
const DAYS_BASE = "/days";

export interface Word {
  id: string;
  word: string;
  meaning: string;
  example: string | null;
  study_day?: number;
  user_id: number;
  created_at: string;
}

export interface WordCreate {
  word: string;
  meaning: string;
  example?: string;
  study_day?: number;
  user_id?: number;
}

export type WordUpdate = Partial<WordCreate>;

export interface DaySummary {
  day_number: number;
  word_count: number;
}

export interface UserSummary {
  user_id: number;
  word_count: number;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.detail ?? `Error ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  list(search?: string, day?: number, userId: number = 0): Promise<Word[]> {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (day) params.set("day", String(day));
    params.set("user_id", String(userId));
    return request(`${WORDS_BASE}?${params.toString()}`);
  },
  get(id: string): Promise<Word> {
    return request(`${WORDS_BASE}/${id}`);
  },
  create(data: WordCreate): Promise<Word> {
    return request(`${WORDS_BASE}`, { method: "POST", body: JSON.stringify(data) });
  },
  update(id: string, data: WordUpdate): Promise<Word> {
    return request(`${WORDS_BASE}/${id}`, { method: "PUT", body: JSON.stringify(data) });
  },
  delete(id: string): Promise<void> {
    return request(`${WORDS_BASE}/${id}`, { method: "DELETE" });
  },
};

export const daysApi = {
  list(userId: number = 0): Promise<DaySummary[]> {
    return request(`${DAYS_BASE}?user_id=${userId}`);
  },
  getWords(dayNumber: number, userId: number = 0, cacheBuster?: string): Promise<Word[]> {
    const params = new URLSearchParams({ user_id: String(userId) });
    if (cacheBuster) params.set("_t", String(Date.now()));
    return request(`${DAYS_BASE}/${dayNumber}/words?${params.toString()}`);
  },
};

export const personalApi = {
  summary(): Promise<UserSummary[]> {
    return request("/personal/summary");
  },
};
