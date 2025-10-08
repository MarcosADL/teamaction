// app/backoffice/users/page.tsx
import { requireAdmin, listUsers } from "@/lib/auth";
import { updateRoleAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  await requireAdmin();
  const users = await listUsers();

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Utilizadores</h1>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left border-b">
            <tr>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Role</th>
              <th className="py-2 pr-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b">
                <td className="py-2 pr-4">{u.email}</td>
                <td className="py-2 pr-4">{u.role}</td>
                <td className="py-2 pr-4">
                  <form action={updateRoleAction} className="flex items-center gap-2">
                    <input type="hidden" name="email" value={u.email} />
                    <select
                      name="role"
                      defaultValue={u.role}
                      className="border rounded px-2 py-1"
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                    <button
                      type="submit"
                      className="px-3 py-1 rounded border hover:bg-neutral-100"
                    >
                      Guardar
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
