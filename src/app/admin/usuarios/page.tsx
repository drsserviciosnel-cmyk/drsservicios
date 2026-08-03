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
      <div className="mb-6">
        <p className="eyebrow">Despacho</p>
        <h1 className="display mt-1 text-2xl text-ink">Usuarios</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Cambia el rol de un usuario. Los técnicos aparecen luego en la asignación
          de tickets.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-paper shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-milk">
            <tr className="mono text-left text-[0.68rem] uppercase tracking-wide text-ink-faint">
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Teléfono</th>
              <th className="px-4 py-3 font-medium">Registro</th>
              <th className="px-4 py-3 font-medium">Rol</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 font-medium text-ink">
                  {u.full_name}
                  {u.id === profile.id && (
                    <span className="mono ml-2 text-[0.62rem] uppercase text-ink-faint">
                      (tú)
                    </span>
                  )}
                </td>
                <td className="mono px-4 py-3 text-ink-soft">{u.phone ?? "—"}</td>
                <td className="mono px-4 py-3 text-xs text-ink-faint">
                  {fmtDate(u.created_at)}
                </td>
                <td className="px-4 py-3">
                  <form action={setRole} className="flex items-center gap-2">
                    <input type="hidden" name="profile_id" value={u.id} />
                    <select
                      name="role"
                      defaultValue={u.role}
                      className="rounded-lg border border-line-strong bg-paper px-2.5 py-1.5 text-sm text-ink outline-none focus:border-petrol focus:ring-2 focus:ring-petrol-tint"
                    >
                      <option value="cliente">Cliente</option>
                      <option value="tecnico">Técnico</option>
                      <option value="admin">Administrador</option>
                    </select>
                    <button className="mono rounded-lg border border-line-strong px-3 py-1.5 text-[0.7rem] uppercase tracking-wide text-ink-soft transition hover:bg-milk">
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
