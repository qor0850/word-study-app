const WORDS_BASE = "/words";
const DAYS_BASE = "/days";

export interface Word {
  id: string;
  word: string;
  meaning: string;
  example: string | null;
  study_day?: number;
  created_at: string;
}

export interface WordCreate {
  word: string;
  meaning: string;
  example?: string;
  study_day?: number;
}

export type WordUpdate = Partial<WordCreate>;

export interface DaySummary {
  day_number: number;
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
  list(search?: string, day?: number): Promise<Word[]> {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (day) params.set("day", String(day));
    const qs = params.toString() ? `?${params.toString()}` : "";
    return request(`${WORDS_BASE}${qs}`);
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
  list(): Promise<DaySummary[]> {
    return request(`${DAYS_BASE}`);
  },
  getWords(dayNumber: number, cacheBuster?: string): Promise<Word[]> {
    const qs = cacheBuster ? `?${cacheBuster}` : "";
    return request(`${DAYS_BASE}/${dayNumber}/words${qs}`);
  },
};
