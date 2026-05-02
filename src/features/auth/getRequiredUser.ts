import { getCurrentSession } from "./auth.repository";

export async function getRequiredUser() {
  const session = await getCurrentSession();

  if (!session) {
    throw new Error("User is not authenticated");
  }

  return session.user;
}