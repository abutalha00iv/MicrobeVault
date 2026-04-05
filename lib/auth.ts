import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

export const ADMIN_COOKIE =
  process.env.NODE_ENV === "production"
    ? "__Secure-microbevault-admin"
    : "microbevault-admin";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET env variable must be set and at least 32 characters.");
  }
  return new TextEncoder().encode(secret);
}

export async function createAdminToken(payload: {
  id: string;
  username: string;
  role: string;
}) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(getSecret());
}

export async function verifyAdminToken(token: string) {
  const { payload } = await jwtVerify(token, getSecret());
  return payload as {
    id: string;
    username: string;
    role: string;
  };
}

export async function getCurrentAdmin() {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  if (!token) {
    return null;
  }

  try {
    return await verifyAdminToken(token);
  } catch {
    return null;
  }
}

