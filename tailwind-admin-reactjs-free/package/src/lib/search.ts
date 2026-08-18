/** Normaliza texto para buscar sin distinguir mayusculas ni acentos. */
export function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

/**
 * Devuelve true si alguno de los campos contiene el texto buscado. Un query
 * vacio coincide con todo (no filtra). Ignora mayusculas y acentos.
 */
export function matchText(
  query: string,
  ...fields: (string | number | null | undefined)[]
): boolean {
  const q = normalize(query.trim());
  if (!q) return true;
  return fields.some((f) => f != null && normalize(String(f)).includes(q));
}
