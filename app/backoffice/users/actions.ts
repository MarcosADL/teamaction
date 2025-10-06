"use server";

import { headers as nextHeaders } from "next/headers";
import { requireAdmin, setUserRoleByEmail } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function isSameOrigin() {
  const h = await nextHeaders();
  const origin = h.get("origin");
  const referer = h.get("referer");
  const base = process.env.APP_URL; // ex.: http://localhost:3000
  if (!base) return true;
  return (
    (origin && origin.startsWith(base)) ||
    (referer && referer.startsWith(base))
  );
}

export async function promoteAction(formData: FormData) {
  const admin = await requireAdmin();
  if (!(await isSameOrigin())) throw new Error("Origem inválida.");

  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!email) throw new Error("Email em falta.");

  await setUserRoleByEmail({
    requesterId: admin.id,
    requesterEmail: admin.email,
    targetEmail: email,
    role: "admin",
  });

  revalidatePath("/backoffice/users");
}

export async function downgradeAction(formData: FormData) {
  const admin = await requireAdmin();
  if (!(await isSameOrigin())) throw new Error("Origem inválida.");

  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!email) throw new Error("Email em falta.");

  await setUserRoleByEmail({
    requesterId: admin.id,
    requesterEmail: admin.email,
    targetEmail: email,
    role: "user",
  });

  revalidatePath("/backoffice/users");
}
