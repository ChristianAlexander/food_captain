export function relativeUrl(path: string): string {
  return new URL(path, document.location.origin).href;
}

export function getCSRFToken(): string | null {
  const metaTag = document.querySelector(
    'meta[name="csrf-token"]',
  ) as HTMLMetaElement;
  return metaTag ? metaTag.content : null;
}

export function getCurrentUserId(): string {
  const metaTag = document.querySelector(
    'meta[name="currentUserId"]',
  ) as HTMLMetaElement;
  return metaTag?.content ?? "";
}
