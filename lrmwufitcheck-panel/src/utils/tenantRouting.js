const RESERVED_ROOT_SEGMENTS = new Set([
  "login",
  "register",
  "forgot-password",
  "verify",
  "verify-email",
  "verify-mobile",
  "2fa",
  "auth",
  "chat",
  "profile",
  "tenant-profile",
  "elastic-search",
  "logs",
  "mcp-logs",
  "service",
  "admin",
  "checkout",
  "payment",
  "document",
]);

export function getTenantCodenameFromPath(pathname) {
  if (!pathname) return null;
  const parts = pathname.split("/").filter(Boolean);
  if (!parts.length) return null;

  const first = parts[0];
  if (RESERVED_ROOT_SEGMENTS.has(first)) return null;
  return first;
}

export function withTenantPrefix(path, tenantCodename) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (!tenantCodename || tenantCodename === "root") return normalizedPath;
  return `/${tenantCodename}${normalizedPath}`;
}
