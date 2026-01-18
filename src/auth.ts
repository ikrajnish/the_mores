import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/auth-jwt";

export interface Session {
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string;
    role?: string;
  } & any;
}

export async function auth(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    return null;
  }

  const payload = await verifyJWT(token);

  if (!payload) {
    return null;
  }

  return {
    user: payload,
  };
}
