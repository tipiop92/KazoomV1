/**
 * Implémentation mock des dépôts (conversations, contacts) basée sur mockDb en mémoire.
 * Usage: injection dans l’app pour dev / tests.
 */

import { compareIsoDesc, nowIso } from "../domain/time";
import type { Conversation, Message, Contact } from "../domain/types";
import type { ConversationsRepository, ContactsRepository } from "./repositories";
import { mockConversations, mockMessages, mockContacts } from "./mockDb";

function nextId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const mockConversationsRepository: ConversationsRepository = {
  async listConversations(): Promise<Conversation[]> {
    const list = [...mockConversations];
    list.sort((a, b) => compareIsoDesc(a.lastMessageAt, b.lastMessageAt));
    return list;
  },

  async getConversation(id: string): Promise<Conversation | null> {
    const c = mockConversations.find((conv) => conv.id === id) ?? null;
    return c ? { ...c } : null;
  },

  async listMessages(conversationId: string): Promise<Message[]> {
    const list = mockMessages.filter((m) => m.conversationId === conversationId);
    list.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    return list.map((m) => ({ ...m }));
  },

  async sendMessage(
    conversationId: string,
    body: string,
    authorId: string
  ): Promise<Message> {
    const conv = mockConversations.find((c) => c.id === conversationId);
    if (!conv) {
      throw new Error(`Conversation not found: ${conversationId}`);
    }
    const createdAt = nowIso();
    const message: Message = {
      id: nextId("msg"),
      conversationId,
      authorId,
      body,
      createdAt,
      status: "sent",
    };
    mockMessages.push(message);
    conv.lastMessageAt = createdAt;
    return { ...message };
  },
};

export const mockContactsRepository: ContactsRepository = {
  async listContacts(): Promise<Contact[]> {
    return [...mockContacts];
  },

  async createContact(displayName: string, handle?: string): Promise<Contact> {
    const contact: Contact = {
      id: nextId("contact"),
      displayName,
      handle,
      createdAt: nowIso(),
    };
    mockContacts.push(contact);
    return { ...contact };
  },
};
