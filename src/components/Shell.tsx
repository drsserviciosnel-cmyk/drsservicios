import Link from "next/link";
import { signOut } from "@/lib/actions/auth";
import type { Profile, UserRole } from "@/lib/types";

const ROLE_LABEL: Record<UserRole, string> = {
  cliente: "Cliente",
  admin: "Despacho",
  tecnico: "Técnico",
};

const NAV: Record<UserRole, { href: string; label: string }[]> = {
  cliente: [
    { href: "/cliente", label: "Mis tickets" },
    { href: "/cliente/nuevo", label: "Nuevo" },
  ],
  admin: [
    { href: "/admin", label: "Tablero" },
    { href: "/admin/usuarios", label: "Usuarios" },
  ],
  tecnico: [{ href: "/tecnico", label: "Asignaciones" }],
};

export function Shell({
  profile,
  children,
}: {
  profile: Profile;
  children: React.ReactNode;
}) {
  const initials = (profile.full_name ?? "?")
    .split(" ")
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-dvh">
      <header className="bg-petrol-deep text-milk">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-baseline gap-2">
              <span className="display text-lg leading-none text-milk">DRS</span>
              <span className="mono hidden text-[0.62rem] uppercase tracking-[0.22em] text-petrol-tint/80 sm:inline">
                Despacho
              </span>
            </Link>
            <nav className="flex gap-1">
              {NAV[profile.role].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="mono rounded-md px-2.5 py-1.5 text-[0.72rem] uppercase tracking-wide text-milk/70 transition hover:bg-white/10 hover:text-milk"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium leading-none">
                {profile.full_name}
              </p>
              <p className="mono text-[0.62rem] uppercase tracking-[0.14em] text-petrol-tint/70">
                {ROLE_LABEL[profile.role]}
              </p>
            </div>
            <span className="mono flex h-8 w-8 items-center justify-center rounded-md bg-white/12 text-xs font-medium text-milk ring-1 ring-white/15">
              {initials}
            </span>
            <form action={signOut}>
              <button className="mono rounded-md border border-white/20 px-2.5 py-1.5 text-[0.7rem] uppercase tracking-wide text-milk/80 transition hover:bg-white/10 hover:text-milk">
                Salir
              </button>
            </form>
          </div>
        </div>
        <div className="h-[3px] bg-signal" />
      </header>
      <main className="mx-auto max-w-5xl px-4 py-7">{children}</main>
    </div>
  );
}
