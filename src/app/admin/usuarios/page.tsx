import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { setRole } from "@/lib/actions/tickets";
import { Shell } from "@/components/Shell";
import { fmtDate } from "@/lib/format";
import type { Profile } from "@/lib/types";

export default async function UsuariosPage() {
  const profile = await requireRole("admin");
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  const users = (data ?? []) as Profile[];

  return (
    <Shell profile={profile}>
      <h1 className="mb-1 text-xl font-semibold text-slate-900">Usuarios</h1>
      <p className="mb-5 text-sm text-slate-500">
        Cambia el rol de un usuario. Los técnicos aparecen luego en la asignación de
        tickets.
      </p>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-2.5">Nombre</th>
              <th className="px-4 py-2.5">Teléfono</th>
              <th className="px-4 py-2.5">Registro</th>
              <th className="px-4 py-2.5">Rol</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 font-medium text-slate-900">
                  {u.full_name}
                  {u.id === profile.id && (
                    <span className="ml-2 text-xs text-slate-400">(tú)</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600">{u.phone ?? "—"}</td>
                <td className="px-4 py-3 text-slate-500">{fmtDate(u.created_at)}</td>
                <td className="px-4 py-3">
                  <form action={setRole} className="flex items-center gap-2">
                    <input type="hidden" name="profile_id" value={u.id} />
                    <select
                      name="role"
                      defaultValue={u.role}
                      className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                    >
                      <option value="cliente">Cliente</option>
                      <option value="tecnico">Técnico</option>
                      <option value="admin">Administrador</option>
                    </select>
                    <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100">
                      Guardar
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
