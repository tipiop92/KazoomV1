/**
 * Helpers temps pour le domaine (ISO 8601).
 * Usage: formatage et comparaison de dates stockées en ISO.
 */

/** Retourne la date/heure courante en ISO 8601. */
export function nowIso(): string {
  return new Date().toISOString();
}

/** Compare deux chaînes ISO en ordre décroissant (plus récent en premier). Pour tri listes. */
export function compareIsoDesc(a: string, b: string): number {
  return b.localeCompare(a);
}

/** Formate une date ISO pour affichage en liste (ex. "14:23", "Hier"). */
export function formatIsoForList(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (dayStart.getTime() === today.getTime()) {
    return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  }
  if (dayStart.getTime() === yesterday.getTime()) {
    return "Hier";
  }
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}
