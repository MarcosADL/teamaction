import { listUsers, getSession } from "@/lib/auth";
import { promoteAction, downgradeAction } from "./actions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function UsersAdminPage() {
  const me = await getSession();
  const users = await listUsers();

  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold">Utilizadores</h1>

      <div className="overflow-x-auto">
        <table className="w-full border text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="border px-3 py-2 text-left">Nome</th>
              <th className="border px-3 py-2 text-left">Email</th>
              <th className="border px-3 py-2">Role</th>
              <th className="border px-3 py-2">Criado</th>
              <th className="border px-3 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="border px-3 py-2">{u.name}</td>
                <td className="border px-3 py-2">{u.email}</td>
                <td className="border px-3 py-2 text-center">{u.role}</td>
                <td className="border px-3 py-2">
                  {new Date(u.createdAt).toLocaleString()}
                </td>
                <td className="border px-3 py-2">
                  <div className="flex items-center gap-2">
                    {u.role !== "admin" && (
                      <form action={promoteAction}>
                        <input type="hidden" name="email" value={u.email} />
                        <button className="rounded-md border px-3 py-1 hover:bg-emerald-50">
                          Promover
                        </button>
                      </form>
                    )}
                    {u.role === "admin" && u.email !== me?.email && (
                      <form action={downgradeAction}>
                        <input type="hidden" name="email" value={u.email} />
                        <button className="rounded-md border px-3 py-1 hover:bg-muted/40">
                          Downgrade
                        </button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="border px-3 py-6 text-center text-muted-foreground">
                  Sem utilizadores.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Nota: alterações são auditadas em <code>data/audit.log.json</code>.
      </p>
    </>
  );
}
