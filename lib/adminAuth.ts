// HTTP Basic Auth for /admin. Checked in proxy.ts (to show the browser's login
// prompt) and again in the admin page and its Server Action: Proxy is only an
// optimistic check, and a Server Action can be POSTed to from any route.

export const ADMIN_REALM = 'Basic realm="poznan.events admin", charset="UTF-8"';

// Compares every character regardless of where the first mismatch is, so
// response timing doesn't reveal how much of the password was right.
function safeEqual(a: string, b: string): boolean {
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

export function isAdminAuthorization(header: string | null): boolean {
  const user = process.env.ADMIN_USER;
  const password = process.env.ADMIN_PASSWORD;
  // Fail closed when the credentials aren't configured.
  if (!user || !password || !header?.startsWith("Basic ")) return false;

  let decoded: string;
  try {
    decoded = new TextDecoder().decode(
      Uint8Array.from(atob(header.slice(6)), (c) => c.charCodeAt(0)),
    );
  } catch {
    return false;
  }
  const sep = decoded.indexOf(":");
  if (sep === -1) return false;

  // Evaluate both so a wrong user name takes as long as a wrong password.
  const userOk = safeEqual(decoded.slice(0, sep), user);
  const passwordOk = safeEqual(decoded.slice(sep + 1), password);
  return userOk && passwordOk;
}
