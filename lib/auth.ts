import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { connectToDatabase } from "./db";
import { User, IUser } from "@/models/User";

const JWT_SECRET_STRING =
  process.env.JWT_SECRET || "draftly-dev-jwt-super-secret-key-32chars-min-length-2026";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

export const AUTH_COOKIE_NAME = "draftly_auth_token";

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
}

export async function signAuthToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyAuthToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
    };
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<IUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return null;
    }

    const payload = await verifyAuthToken(token);
    if (!payload?.userId) {
      return null;
    }

    await connectToDatabase();
    const user = await User.findById(payload.userId).select("-password");
    return user;
  } catch (error) {
    console.error("Error retrieving current user:", error);
    return null;
  }
}

