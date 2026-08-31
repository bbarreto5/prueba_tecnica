import { getSessionToken } from "@/features/auth/lib/session";
import { listUsers } from "@/services/users";
import { toUser } from "./mappers";
import type { User } from "../types";

/** Fetches the real user list for the current session (backend already scopes it by the caller's role). Throws on failure — callers render the error state. */
export async function getUsers(): Promise<User[]> {
  const token = await getSessionToken();
  if (!token) return [];

  const users = await listUsers(token);
  return users.map(toUser);
}
