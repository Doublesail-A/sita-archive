export function toDate(value: unknown): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  const date = new Date(String(value));
  return Number.isNaN(date.valueOf()) ? undefined : date;
}

export function formatDate(value?: Date | string | null): string {
  const date = toDate(value ?? undefined);
  return date ? date.toISOString().slice(0, 10) : "—";
}

export function compareDateDesc(a?: Date | string | null, b?: Date | string | null): number {
  const av = toDate(a ?? undefined)?.valueOf() ?? -Infinity;
  const bv = toDate(b ?? undefined)?.valueOf() ?? -Infinity;
  return bv - av;
}

export function toAssetSrc(asset: unknown): string {
  if (!asset) return "";
  if (typeof asset === "string") return asset;

  if (typeof asset === "object" && asset && "src" in asset) {
    const value = (asset as { src?: unknown }).src;
    if (typeof value === "string") return value;
  }

  if (typeof asset === "object" && asset && "default" in asset) {
    const value = (asset as { default?: unknown }).default;
    return toAssetSrc(value);
  }

  return "";
}

export function encodeSlug(slug: string): string {
  return slug
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}
