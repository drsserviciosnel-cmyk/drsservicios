"use client";

import { useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { resolveTicket } from "@/lib/actions/tickets";

export function ResolveForm({ ticketId }: { ticketId: string }) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const busy = uploading || pending;

  function pickFile(f: File | null) {
    setError(null);
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function submit() {
    if (!file) {
      setError("Adjunta una foto de evidencia del trabajo realizado.");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${ticketId}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("evidencias")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) {
        setUploading(false);
        setError("No se pudo subir la foto. Intenta de nuevo.");
        return;
      }
      const { data } = supabase.storage.from("evidencias").getPublicUrl(path);
      setUploading(false);

      const fd = new FormData();
      fd.set("ticket_id", ticketId);
      fd.set("evidence_url", data.publicUrl);
      fd.set("resolution_note", note);
      startTransition(() => resolveTicket(fd));
    } catch {
      setUploading(false);
      setError("Ocurrió un error inesperado al subir la foto.");
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mono w-full rounded-lg bg-petrol px-4 py-2.5 text-sm font-medium uppercase tracking-wide text-white transition hover:bg-petrol-deep sm:w-auto"
      >
        Marcar resuelto →
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-line bg-milk p-3">
      <p className="mono mb-2 text-xs font-medium uppercase tracking-wide text-ink-soft">
        Evidencia del trabajo
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
      />

      {preview ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="group relative block w-full overflow-hidden rounded-lg border border-line-strong"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Vista previa de la evidencia"
            className="h-44 w-full object-cover"
          />
          <span className="mono absolute inset-x-0 bottom-0 bg-ink/70 py-1 text-center text-[0.65rem] uppercase tracking-wide text-milk">
            Cambiar foto
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-28 w-full flex-col items-center justify-center rounded-lg border border-dashed border-line-strong bg-paper text-ink-soft transition hover:border-petrol hover:text-petrol"
        >
          <span className="text-2xl leading-none">＋</span>
          <span className="mono mt-1 text-xs uppercase tracking-wide">
            Tomar / subir foto
          </span>
        </button>
      )}

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        placeholder="Nota de cierre (opcional): qué se hizo…"
        className="mt-3 w-full rounded-lg border border-line-strong bg-paper px-3 py-2 text-sm text-ink outline-none transition focus:border-petrol focus:ring-2 focus:ring-petrol-tint"
      />

      {error && <p className="mt-2 text-sm text-alert">{error}</p>}

      <div className="mt-3 flex gap-2">
        <button
          onClick={submit}
          disabled={busy}
          className="mono flex-1 rounded-lg bg-petrol px-4 py-2.5 text-sm font-medium uppercase tracking-wide text-white transition hover:bg-petrol-deep disabled:opacity-60"
        >
          {uploading
            ? "Subiendo foto…"
            : pending
              ? "Resolviendo…"
              : "Resolver con evidencia"}
        </button>
        <button
          onClick={() => setOpen(false)}
          disabled={busy}
          className="mono rounded-lg border border-line-strong px-3 py-2.5 text-xs uppercase tracking-wide text-ink-soft transition hover:bg-paper disabled:opacity-60"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
