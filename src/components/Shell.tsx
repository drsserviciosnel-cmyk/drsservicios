import Link from "next/link";
import { signOut } from "@/lib/actions/auth";
import type { Profile, UserRole } from "@/lib/types";

const ROLE_LABEL: Record<UserRole, string> = {
  cliente: "Cliente",
  admin: "Administrador",
  tecnico: "Técnico",
};

const NAV: Record<UserRole, { href: string; label: string }[]> = {
  cliente: [
    { href: "/cliente", label: "Mis tickets" },
    { href: "/cliente/nuevo", label: "Nuevo ticket" },
  ],
  admin: [
    { href: "/admin", label: "Tickets" },
    { href: "/admin/usuarios", label: "Usuarios" },
  ],
  tecnico: [{ href: "/tecnico", label: "Mis asignaciones" }],
};

export function Shell({
  profile,
  children,
}: {
  profile: Profile;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
                DRS
              </span>
              <span className="hidden font-semibold text-slate-900 sm:inline">
                Servicios
              </span>
            </Link>
            <nav className="flex gap-1">
              {NAV[profile.role].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium leading-none text-slate-900">
                {profile.full_name}
              </p>
              <p className="text-xs text-slate-500">{ROLE_LABEL[profile.role]}</p>
            </div>
            <form action={signOut}>
              <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100">
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
