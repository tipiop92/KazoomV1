/**
 * Persistance locale (localStorage) pour conversations, messages, contacts.
 * Versionnée ; corruption → reset propre.
 */

import type { Conversation, Message, Contact } from "../domain/types";

export const STATE_VERSION = 1;

const STORAGE_KEY = "kazoom-app-state";

/** Partie du state qu’on persiste (pas loading, error, selectedConversationId). */
export interface PersistedAppState {
  conversations?: Conversation[];
  messagesByConversationId?: Record<string, Message[]>;
  contacts?: Contact[];
}

function isRecordOfMessages(
  v: unknown
): v is Record<string, Message[]> {
  if (v === null || typeof v !== "object") return false;
  for (const key of Object.keys(v)) {
    const arr = (v as Record<string, unknown>)[key];
    if (!Array.isArray(arr)) return false;
    for (const m of arr) {
      if (
        typeof m?.id !== "string" ||
        typeof m?.conversationId !== "string" ||
        typeof m?.authorId !== "string" ||
        typeof m?.body !== "string" ||
        typeof m?.createdAt !== "string"
      )
        return false;
    }
  }
  return true;
}

function isConversation(m: unknown): m is Conversation {
  return (
    m !== null &&
    typeof m === "object" &&
    typeof (m as Conversation).id === "string" &&
    typeof (m as Conversation).title === "string" &&
    typeof (m as Conversation).lastMessageAt === "string" &&
    Array.isArray((m as Conversation).participants) &&
    typeof (m as Conversation).unreadCount === "number"
  );
}

function isContact(m: unknown): m is Contact {
  return (
    m !== null &&
    typeof m === "object" &&
    typeof (m as Contact).id === "string" &&
    typeof (m as Contact).displayName === "string" &&
    typeof (m as Contact).createdAt === "string"
  );
}

function parsePayload(raw: string): PersistedAppState | null {
  try {
    const data = JSON.parse(raw) as unknown;
    if (data === null || typeof data !== "object") return null;
    const obj = data as Record<string, unknown>;
    if (Number(obj.version) !== STATE_VERSION) return null;

    const result: PersistedAppState = {};

    if (Array.isArray(obj.conversations)) {
      const list = obj.conversations.filter(isConversation);
      if (list.length > 0) result.conversations = list;
    }
    if (obj.messagesByConversationId !== undefined && isRecordOfMessages(obj.messagesByConversationId)) {
      result.messagesByConversationId = obj.messagesByConversationId;
    }
    if (Array.isArray(obj.contacts)) {
      const list = obj.contacts.filter(isContact);
      if (list.length > 0) result.contacts = list;
    }

    return result;
  } catch {
    return null;
  }
}

/**
 * Charge l’état persisté. En cas d’erreur ou de corruption, retourne un objet vide.
 */
export function loadState(): PersistedAppState {
  if (typeof localStorage === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = parsePayload(raw);
    if (!parsed) {
      localStorage.removeItem(STORAGE_KEY);
      return {};
    }
    return parsed;
  } catch {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    return {};
  }
}

/**
 * Enregistre l’état (conversations, messagesByConversationId, contacts).
 * À appeler debounced depuis le provider.
 */
export function saveState(state: PersistedAppState): void {
  if (typeof localStorage === "undefined") return;
  try {
    const payload = {
      version: STATE_VERSION,
      conversations: state.conversations ?? [],
      messagesByConversationId: state.messagesByConversationId ?? {},
      contacts: state.contacts ?? [],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    if (typeof console !== "undefined" && console.warn) {
      console.warn("[persistence] saveState failed", err);
    }
  }
}

/** Debounce 400 ms pour éviter écritures trop fréquentes. */
let saveTimeout: ReturnType<typeof setTimeout> | null = null;

export function saveStateDebounced(state: PersistedAppState, delayMs: number = 400): void {
  if (saveTimeout !== null) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveTimeout = null;
    saveState(state);
  }, delayMs);
}
