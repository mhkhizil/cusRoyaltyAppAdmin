export function nullableString(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  return String(value);
}

export function nullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export function normalizeArrayResponse<T extends { id?: string }>(
  data: unknown,
  nestedKeys: string[] = ["items", "data"]
): T[] {
  if (Array.isArray(data)) {
    return data as T[];
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  const record = data as Record<string, unknown>;

  for (const key of nestedKeys) {
    if (Array.isArray(record[key])) {
      return record[key] as T[];
    }
  }

  if (typeof record.id === "string") {
    return [record as unknown as T];
  }

  return [];
}
