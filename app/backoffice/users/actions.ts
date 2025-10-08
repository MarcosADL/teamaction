// app/backoffice/users/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { setUserRoleByEmail, type AppRole } from "@/lib/auth";

export async function updateRoleAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const role = String(formData.get("role") || "user") as AppRole;
  await setUserRoleByEmail(email, role);
  revalidatePath("/backoffice/users");
}
