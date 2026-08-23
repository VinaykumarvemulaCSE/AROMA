import { z } from "zod";

/**
 * Safely unwraps the { data: ... } payload if present, and parses it with the Zod schema.
 * This ensures that server actions can be called either wrapped or flat.
 */
export function parseSafe<T extends z.ZodTypeAny>(schema: T, rawData: unknown): z.infer<T> {
  const unwrapped =
    rawData && typeof rawData === "object" && "data" in rawData
      ? (rawData as Record<string, unknown>).data
      : rawData;
  return schema.parse(unwrapped);
}

/**
 * Formats a Zod validation error or standard error into a friendly string.
 */
export function formatZodError(e: unknown): string {
  if (e instanceof z.ZodError) {
    return "Validation failed: " + e.errors.map((err) => `${err.path.join(".") || "field"}: ${err.message}`).join("; ");
  }
  return e instanceof Error ? e.message : String(e);
}
