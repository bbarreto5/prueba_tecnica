import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/lib/currentUser";
import { roleRedirectPath } from "@/types/role";

export default async function Home() {
  const user = await getCurrentUser();
  redirect(user ? roleRedirectPath[user.role] : "/login");
}
