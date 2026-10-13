import { safeEqual } from "./adminAuth";

/**
 * True when the request carries `Authorization: Bearer <secret>`. Fails closed
 * when the secret isn't configured; otherwise the expected header would be the
 * literal "Bearer undefined", which anyone can send.
 */
export function hasBearer(request: Request, secret: string | undefined) {
  if (!secret) return false;
  return safeEqual(
    request.headers.get("authorization") ?? "",
    `Bearer ${secret}`,
  );
}
