import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function getSessionUserId(): Promise<number | null> {
  try {
    const secret = process.env.SESSION_SECRET;

    if (!secret || secret.length < 32) {
      return null;
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return null;
    }

    const key = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, key);

    const userId = Number(payload.sub);

    if (!Number.isSafeInteger(userId) || userId <= 0) {
      return null;
    }

    return userId;
  } catch {
    return null;
  }
}