/** Base URL do admin interno. */
export const ADMIN_BASE = "/fireadmin";

export function adminPath(path = "/"): string {
  if (!path || path === "/") return ADMIN_BASE;
  return `${ADMIN_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}
