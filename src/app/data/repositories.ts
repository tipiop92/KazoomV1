/**
 * Interfaces des dépôts de données (conversations, messages, contacts).
 * Usage: implémenter (ex. mock) puis injecter dans l’app.
 */

import type { Conversation, Message, Contact } from "../domain/types";

export interface ConversationsRepository {
  /** Liste les conversations triées par lastMessageAt décroissant. */
  listConversations(): Promise<Conversation[]>;

  /** Récupère une conversation par id, ou null si absente. */
  getConversation(id: string): Promise<Conversation | null>;

  /** Liste les messages d’une conversation (ordre chronologique). */
  listMessages(conversationId: string): Promise<Message[]>;

  /** Envoie un message et retourne le message créé. */
  sendMessage(
    conversationId: string,
    body: string,
    authorId: string
  ): Promise<Message>;
}

export interface ContactsRepository {
  /** Liste tous les contacts. */
  listContacts(): Promise<Contact[]>;

  /** Crée un contact et retourne l’entité créée (id et createdAt assignés). */
  createContact(displayName: string, handle?: string): Promise<Contact>;
}
