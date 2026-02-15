/**
 * Types du domaine Kazoom (messagerie, contacts, coffre-fort).
 * Usage: imports depuis ce fichier pour tout le domaine.
 */

/** Identifiant unique (UUID) pour entités. */
export type ID = string;

/** Référence à un contact dans une conversation (participant). */
export interface ContactRef {
  id: ID;
}

/** Conversation : fil de messages entre participants. */
export interface Conversation {
  id: ID;
  title: string;
  lastMessageAt: string;
  participants: ContactRef[];
  unreadCount: number;
}

/** Statut de livraison d’un message. */
export type MessageStatus = "sent" | "delivered" | "read";

/** Message : un envoi dans une conversation. */
export interface Message {
  id: ID;
  conversationId: ID;
  authorId: ID;
  body: string;
  createdAt: string;
  status: MessageStatus;
}

/** Contact : personne avec qui on peut discuter. */
export interface Contact {
  id: ID;
  displayName: string;
  handle?: string;
  avatarUrl?: string;
  createdAt: string;
}

/** État du coffre-fort (verrouillé / dernière déverrouillage). */
export interface VaultState {
  isLocked: boolean;
  lastUnlockedAt?: string;
}
