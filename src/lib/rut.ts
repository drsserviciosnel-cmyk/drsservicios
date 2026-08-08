/** Utilidades de RUT chileno (limpieza, formato y dígito verificador). */

/** Deja solo dígitos y K (sin puntos ni guion), en mayúscula. */
export function cleanRut(rut: string): string {
  return rut.replace(/[^0-9kK]/g, "").toUpperCase();
}

/** Calcula el dígito verificador (módulo 11) del cuerpo numérico. */
function dv(body: string): string {
  let sum = 0;
  let mul = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const res = 11 - (sum % 11);
  if (res === 11) return "0";
  if (res === 10) return "K";
  return String(res);
}

/** Valida un RUT completo (cuerpo + DV). */
export function validarRut(rut: string): boolean {
  const clean = cleanRut(rut);
  if (clean.length < 2) return false;
  const body = clean.slice(0, -1);
  const check = clean.slice(-1);
  if (!/^\d+$/.test(body)) return false;
  return dv(body) === check;
}

/** Formatea a "12.345.678-9". */
export function formatRut(rut: string): string {
  const clean = cleanRut(rut);
  if (clean.length < 2) return rut;
  const body = clean.slice(0, -1);
  const check = clean.slice(-1);
  const withDots = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${withDots}-${check}`;
}
