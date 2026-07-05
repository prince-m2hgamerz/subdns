function camelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

type NestedObj = Record<string, unknown> | unknown[] | unknown;

export function camelCaseKeys<T extends NestedObj>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map(camelCaseKeys) as unknown as T;
  }
  if (obj && typeof obj === "object" && obj !== null) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const camelKey = camelCase(key);
      result[camelKey] =
        value && typeof value === "object" && !(value instanceof Date)
          ? camelCaseKeys(value as NestedObj)
          : value;
    }
    return result as T;
  }
  return obj;
}
