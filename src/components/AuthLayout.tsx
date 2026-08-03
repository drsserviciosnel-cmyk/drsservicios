export function AuthLayout({
  heading,
  kicker,
  children,
}: {
  heading: string;
  kicker: string;
  children: React.ReactNode;
}) {
  return (
    <main className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      {/* Panel de marca */}
      <section className="grid-field relative flex flex-col justify-between overflow-hidden bg-petrol-deep px-6 py-8 text-milk lg:px-12 lg:py-12">
        <div className="flex items-baseline gap-3">
          <span className="display text-2xl text-milk">DRS</span>
          <span className="mono text-[0.62rem] uppercase tracking-[0.24em] text-petrol-tint/80">
            Servicios · Despacho
          </span>
        </div>

        <div className="hidden max-w-md lg:block">
          <p className="eyebrow !text-signal">Soporte técnico en terreno</p>
          <h1 className="display mt-3 text-4xl text-milk">
            De la emergencia en la lechería al técnico en camino.
          </h1>
          <p className="mt-4 text-milk/70">
            Cada ticket queda georreferenciado y cronometrado por etapa, para que
            el despacho vea el tiempo de respuesta real.
          </p>

          {/* Motivo: línea de respuesta */}
          <div className="mt-8 flex items-center gap-2">
            {["Nuevo", "Asignado", "En camino", "Resuelto"].map((s, i) => (
              <div key={s} className="flex flex-1 items-center last:flex-none">
                <span
                  className={`h-2.5 w-2.5 flex-none rounded-full ${
                    i < 3 ? "bg-signal" : "ring-2 ring-signal"
                  }`}
                />
                {i < 3 && <span className="h-px flex-1 bg-signal/50" />}
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between">
            {["Nuevo", "Asignado", "En camino", "Resuelto"].map((s) => (
              <span
                key={s}
                className="mono text-[0.58rem] uppercase tracking-wider text-milk/50"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        <p className="mono hidden text-[0.6rem] uppercase tracking-[0.14em] text-milk/35 lg:block">
          DRS Servicios · Soporte en terreno
        </p>
      </section>

      {/* Formulario */}
      <section className="flex items-center justify-center bg-milk px-6 py-10">
        <div className="w-full max-w-sm">
          <p className="eyebrow">{kicker}</p>
          <h2 className="display mt-1 mb-6 text-2xl text-ink">{heading}</h2>
          {children}
        </div>
      </section>
    </main>
  );
}
