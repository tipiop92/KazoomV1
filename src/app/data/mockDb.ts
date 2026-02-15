/**
 * Base de données mock en mémoire (conversations, messages, contacts).
 * Usage: importée par mockRepositories ; données mutables pour sendMessage / createContact.
 */

import type { Conversation, Message, Contact, ContactRef } from "../domain/types";

const BASE = new Date("2025-02-14T15:30:00.000Z");
function iso(d: Date): string {
  return d.toISOString();
}
function addMs(d: Date, ms: number): Date {
  return new Date(d.getTime() + ms);
}

export const mockContacts: Contact[] = [
  { id: "contact-1", displayName: "Marie Dubois", handle: "@mariedubois", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop", createdAt: iso(addMs(BASE, -30 * 24 * 60 * 60 * 1000)) },
  { id: "contact-2", displayName: "Thomas Martin", handle: "@thomas_m", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop", createdAt: iso(addMs(BASE, -25 * 24 * 60 * 60 * 1000)) },
  { id: "contact-3", displayName: "Sophie Laurent", handle: "@sophielaurent", avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop", createdAt: iso(addMs(BASE, -20 * 24 * 60 * 60 * 1000)) },
  { id: "contact-4", displayName: "Lucas Bernard", handle: "@lucasb", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop", createdAt: iso(addMs(BASE, -18 * 24 * 60 * 60 * 1000)) },
  { id: "contact-5", displayName: "Emma Petit", handle: "@emma_p", avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop", createdAt: iso(addMs(BASE, -15 * 24 * 60 * 60 * 1000)) },
  { id: "contact-6", displayName: "Claire Moreau", handle: "@claire_m", avatarUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop", createdAt: iso(addMs(BASE, -12 * 24 * 60 * 60 * 1000)) },
  { id: "contact-7", displayName: "Antoine Blanc", handle: "@antoine_b", avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop", createdAt: iso(addMs(BASE, -10 * 24 * 60 * 60 * 1000)) },
  { id: "contact-8", displayName: "Isabelle Petit", handle: "@isabelle_p", avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop", createdAt: iso(addMs(BASE, -8 * 24 * 60 * 60 * 1000)) },
  { id: "contact-9", displayName: "Nicolas Leroy", handle: "@nicolas_l", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop", createdAt: iso(addMs(BASE, -7 * 24 * 60 * 60 * 1000)) },
  { id: "contact-10", displayName: "Léa Fernandez", handle: "@lea_f", avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop", createdAt: iso(addMs(BASE, -6 * 24 * 60 * 60 * 1000)) },
  { id: "contact-11", displayName: "Hugo Girard", handle: "@hugo_g", createdAt: iso(addMs(BASE, -5 * 24 * 60 * 60 * 1000)) },
  { id: "contact-12", displayName: "Chloé Mercier", handle: "@chloe_m", avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop", createdAt: iso(addMs(BASE, -4 * 24 * 60 * 60 * 1000)) },
  { id: "contact-13", displayName: "Romain Faure", handle: "@romain_f", createdAt: iso(addMs(BASE, -3 * 24 * 60 * 60 * 1000)) },
  { id: "contact-14", displayName: "Julie Roux", handle: "@julie_r", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop", createdAt: iso(addMs(BASE, -2 * 24 * 60 * 60 * 1000)) },
  { id: "contact-15", displayName: "Paul Simon", handle: "@paul_s", createdAt: iso(addMs(BASE, -1 * 24 * 60 * 60 * 1000)) },
];

function ref(id: string): ContactRef {
  return { id };
}

/** Conversations : 6, 2 avec unreadCount > 0. lastMessageAt décroissant. */
export const mockConversations: Conversation[] = [
  { id: "conv-1", title: "Marie Dubois", lastMessageAt: iso(addMs(BASE, -2 * 60 * 1000)), participants: [ref("contact-1")], unreadCount: 3 },
  { id: "conv-2", title: "Thomas Martin", lastMessageAt: iso(addMs(BASE, -15 * 60 * 1000)), participants: [ref("contact-2")], unreadCount: 0 },
  { id: "conv-3", title: "Sophie Laurent", lastMessageAt: iso(addMs(BASE, -60 * 60 * 1000)), participants: [ref("contact-3")], unreadCount: 2 },
  { id: "conv-4", title: "Lucas Bernard", lastMessageAt: iso(addMs(BASE, -3 * 60 * 60 * 1000)), participants: [ref("contact-4")], unreadCount: 0 },
  { id: "conv-5", title: "Emma Petit", lastMessageAt: iso(addMs(BASE, -24 * 60 * 60 * 1000)), participants: [ref("contact-5")], unreadCount: 0 },
  { id: "conv-6", title: "Équipe projet", lastMessageAt: iso(addMs(BASE, -48 * 60 * 60 * 1000)), participants: [ref("contact-6"), ref("contact-7"), ref("contact-8")], unreadCount: 0 },
];

/** Messages : 40+ répartis dans les 6 conversations, createdAt croissant par conversation. */
export const mockMessages: Message[] = (() => {
  const ms: Message[] = [];
  let mid = 1;

  function msg(convId: string, authorId: string, body: string, createdAt: Date, status: Message["status"] = "read"): void {
    ms.push({ id: `m${mid++}`, conversationId: convId, authorId, body, createdAt: iso(createdAt), status });
  }

  const c1 = BASE;
  msg("conv-1", "contact-1", "Salut ! Tu es libre ce soir ?", addMs(c1, -30 * 60 * 1000));
  msg("conv-1", "me", "Oui, vers 20h ça te va ?", addMs(c1, -28 * 60 * 1000));
  msg("conv-1", "contact-1", "Parfait, on se voit au resto alors", addMs(c1, -25 * 60 * 1000));
  msg("conv-1", "me", "Top 👍", addMs(c1, -24 * 60 * 1000));
  msg("conv-1", "contact-1", "J’ai réservé pour 20h30", addMs(c1, -5 * 60 * 1000));
  msg("conv-1", "contact-1", "Tu confirmes ?", addMs(c1, -3 * 60 * 1000));
  msg("conv-1", "contact-1", "On est 4 finalement", addMs(c1, -2 * 60 * 1000));
  msg("conv-1", "me", "Ok j’arrive à 20h", addMs(c1, -1 * 60 * 1000), "delivered");
  msg("conv-1", "contact-1", "Super à tout à l’heure", addMs(c1, -30 * 1000), "sent");

  const c2 = addMs(BASE, -2 * 60 * 60 * 1000);
  msg("conv-2", "contact-2", "J’ai envoyé le document", addMs(c2, -45 * 60 * 1000));
  msg("conv-2", "me", "Reçu, je regarde ça", addMs(c2, -40 * 60 * 1000));
  msg("conv-2", "contact-2", "Pas de souci", addMs(c2, -38 * 60 * 1000));
  msg("conv-2", "me", "La partie 3 à modifier tu confirmes ?", addMs(c2, -20 * 60 * 1000));
  msg("conv-2", "contact-2", "Oui exact", addMs(c2, -15 * 60 * 1000));
  msg("conv-2", "me", "Je te renvoie la v2 ce soir", addMs(c2, -12 * 60 * 1000));
  msg("conv-2", "contact-2", "Parfait", addMs(c2, -10 * 60 * 1000));

  const c3 = addMs(BASE, -4 * 60 * 60 * 1000);
  msg("conv-3", "me", "Super, merci pour la reco", addMs(c3, -70 * 60 * 1000));
  msg("conv-3", "contact-3", "Avec plaisir !", addMs(c3, -65 * 60 * 1000));
  msg("conv-3", "contact-3", "Tu as testé l’app ?", addMs(c3, -62 * 60 * 1000));
  msg("conv-3", "me", "Pas encore", addMs(c3, -58 * 60 * 1000));
  msg("conv-3", "contact-3", "Dès que tu peux dis-moi", addMs(c3, -55 * 60 * 1000));
  msg("conv-3", "contact-3", "J’ai une mise à jour dispo", addMs(c3, -60 * 60 * 1000));

  const c4 = addMs(BASE, -6 * 60 * 60 * 1000);
  msg("conv-4", "contact-4", "On se voit demain ?", addMs(c4, -200 * 60 * 1000));
  msg("conv-4", "me", "Oui, 14h au bureau", addMs(c4, -190 * 60 * 1000));
  msg("conv-4", "contact-4", "Parfait", addMs(c4, -185 * 60 * 1000));
  msg("conv-4", "me", "J’amène les docs", addMs(c4, -180 * 60 * 1000));
  msg("conv-4", "contact-4", "Super merci", addMs(c4, -3 * 60 * 60 * 1000));

  const c5 = addMs(BASE, -25 * 60 * 60 * 1000);
  msg("conv-5", "contact-5", "😂 C’est trop drôle", addMs(c5, -30 * 60 * 1000));
  msg("conv-5", "me", "Je te l’avais dit", addMs(c5, -28 * 60 * 1000));
  msg("conv-5", "contact-5", "Tu viens samedi ?", addMs(c5, -24 * 60 * 60 * 1000));
  msg("conv-5", "me", "Oui si rien ne change", addMs(c5, -23 * 60 * 60 * 1000));
  msg("conv-5", "contact-5", "Nickel", addMs(c5, -24 * 60 * 60 * 1000));

  const c6 = addMs(BASE, -50 * 60 * 60 * 1000);
  msg("conv-6", "contact-6", "Réunion reportée à mardi", addMs(c6, -45 * 60 * 60 * 1000));
  msg("conv-6", "contact-7", "Ok pour moi", addMs(c6, -44 * 60 * 60 * 1000));
  msg("conv-6", "contact-8", "Moi aussi", addMs(c6, -43 * 60 * 60 * 1000));
  msg("conv-6", "me", "Parfait", addMs(c6, -42 * 60 * 60 * 1000));
  msg("conv-6", "contact-6", "J’envoie l’invite", addMs(c6, -48 * 60 * 60 * 1000));
  msg("conv-6", "contact-7", "Merci", addMs(c6, -47 * 60 * 60 * 1000));
  msg("conv-6", "contact-8", "On fait un point avant ?", addMs(c6, -46 * 60 * 60 * 1000));
  msg("conv-6", "contact-6", "Oui 10h si ça va", addMs(c6, -45 * 60 * 60 * 1000));

  return ms;
})();
