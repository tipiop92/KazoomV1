/**
 * Store global minimal (Context + useReducer) pour Conversations / Chat / Contacts.
 * Repositories injectés via props du Provider.
 */

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { nowIso } from "../domain/time";
import type { Conversation, Message, Contact } from "../domain/types";
import type {
  ConversationsRepository,
  ContactsRepository,
} from "../data/repositories";
import {
  loadState,
  saveStateDebounced,
  type PersistedAppState,
} from "../data/persistence";

// --- State

export interface AppState {
  meId: string;
  conversations: Conversation[];
  selectedConversationId: string | null;
  messagesByConversationId: Record<string, Message[]>;
  contacts: Contact[];
  loading: boolean;
  error: string | null;
}

const initialState: AppState = {
  meId: "me",
  conversations: [],
  selectedConversationId: null,
  messagesByConversationId: {},
  contacts: [],
  loading: false,
  error: null,
};

// --- Actions (reducer)

type BootstrapStart = { type: "BOOTSTRAP_START" };
type BootstrapSuccess = {
  type: "BOOTSTRAP_SUCCESS";
  payload: {
    conversations: Conversation[];
    contacts: Contact[];
    selectedConversationId: string | null;
    messages: Message[];
    /** Optionnel : état complet des messages (ex. hydratation). */
    messagesByConversationId?: Record<string, Message[]>;
  };
};
type BootstrapFail = { type: "BOOTSTRAP_FAIL"; payload: { error: string } };
type SelectConversation = {
  type: "SELECT_CONVERSATION";
  payload: { conversationId: string };
};
type LoadMessages = {
  type: "LOAD_MESSAGES";
  payload: { conversationId: string; messages: Message[] };
};
type SendMessageOptimistic = {
  type: "SEND_MESSAGE_OPTIMISTIC";
  payload: { conversationId: string; message: Message };
};
type SendMessageConfirmed = {
  type: "SEND_MESSAGE_CONFIRMED";
  payload: { conversationId: string; tempId: string; message: Message };
};
type CreateContact = { type: "CREATE_CONTACT"; payload: { contact: Contact } };

type AppAction =
  | BootstrapStart
  | BootstrapSuccess
  | BootstrapFail
  | SelectConversation
  | LoadMessages
  | SendMessageOptimistic
  | SendMessageConfirmed
  | CreateContact;

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "BOOTSTRAP_START":
      return { ...state, loading: true, error: null };
    case "BOOTSTRAP_SUCCESS": {
      const {
        conversations,
        contacts,
        selectedConversationId,
        messages,
        messagesByConversationId: payloadMessagesByConv,
      } = action.payload;
      const messagesByConversationId =
        payloadMessagesByConv != null
          ? payloadMessagesByConv
          : selectedConversationId && messages.length > 0
            ? { ...state.messagesByConversationId, [selectedConversationId]: messages }
            : state.messagesByConversationId;
      return {
        ...state,
        loading: false,
        error: null,
        conversations,
        contacts,
        selectedConversationId,
        messagesByConversationId,
      };
    }
    case "BOOTSTRAP_FAIL":
      return {
        ...state,
        loading: false,
        error: action.payload.error,
      };
    case "SELECT_CONVERSATION":
      return {
        ...state,
        selectedConversationId: action.payload.conversationId,
      };
    case "LOAD_MESSAGES": {
      const { conversationId, messages } = action.payload;
      return {
        ...state,
        messagesByConversationId: {
          ...state.messagesByConversationId,
          [conversationId]: messages,
        },
      };
    }
    case "SEND_MESSAGE_OPTIMISTIC": {
      const { conversationId, message } = action.payload;
      const prev = state.messagesByConversationId[conversationId] ?? [];
      return {
        ...state,
        messagesByConversationId: {
          ...state.messagesByConversationId,
          [conversationId]: [...prev, message],
        },
      };
    }
    case "SEND_MESSAGE_CONFIRMED": {
      const { conversationId, tempId, message } = action.payload;
      const prev = state.messagesByConversationId[conversationId] ?? [];
      const next = prev.map((m) => (m.id === tempId ? message : m));
      return {
        ...state,
        messagesByConversationId: {
          ...state.messagesByConversationId,
          [conversationId]: next,
        },
      };
    }
    case "CREATE_CONTACT":
      return {
        ...state,
        contacts: [...state.contacts, action.payload.contact],
      };
    default:
      return state;
  }
}

// --- Actions API (async, utilisent les repos)

export interface AppStoreActions {
  bootstrap: () => Promise<void>;
  selectConversation: (conversationId: string) => Promise<void>;
  /** Envoi optimiste + confirmation via repository. */
  sendMessage: (conversationId: string, body: string) => Promise<void>;
  sendMessageOptimistic: (conversationId: string, body: string) => string;
  sendMessageConfirmed: (
    conversationId: string,
    tempId: string,
    message: Message
  ) => void;
  createContact: (displayName: string, handle?: string) => Promise<Contact>;
}

// --- Context

interface AppStoreValue {
  state: AppState;
  actions: AppStoreActions;
}

const AppStoreContext = createContext<AppStoreValue | null>(null);

// --- Provider

export interface AppStoreProviderProps {
  children: ReactNode;
  conversationsRepo: ConversationsRepository;
  contactsRepo: ContactsRepository;
}

export function AppStoreProvider({
  children,
  conversationsRepo,
  contactsRepo,
}: AppStoreProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const actions = useMemo<AppStoreActions>(() => {
    return {
      async bootstrap() {
        dispatch({ type: "BOOTSTRAP_START" });
        try {
          const hydrated: PersistedAppState = loadState();
          const hasHydrated =
            (hydrated.conversations?.length ?? 0) > 0 &&
            (hydrated.contacts?.length ?? 0) > 0;

          if (hasHydrated && hydrated.conversations && hydrated.contacts) {
            const conversations = hydrated.conversations;
            const contacts = hydrated.contacts;
            const messagesByConversationId =
              hydrated.messagesByConversationId ?? {};
            const selectedConversationId = conversations[0]?.id ?? null;
            const messages =
              selectedConversationId != null
                ? messagesByConversationId[selectedConversationId] ?? []
                : [];
            dispatch({
              type: "BOOTSTRAP_SUCCESS",
              payload: {
                conversations,
                contacts,
                selectedConversationId,
                messages,
                messagesByConversationId,
              },
            });
            return;
          }

          const [conversations, contacts] = await Promise.all([
            conversationsRepo.listConversations(),
            contactsRepo.listContacts(),
          ]);
          const selectedConversationId = conversations[0]?.id ?? null;
          let messages: Message[] = [];
          if (selectedConversationId) {
            messages = await conversationsRepo.listMessages(selectedConversationId);
          }
          dispatch({
            type: "BOOTSTRAP_SUCCESS",
            payload: {
              conversations,
              contacts,
              selectedConversationId,
              messages,
            },
          });
        } catch (err) {
          const error =
            err instanceof Error ? err.message : "Bootstrap failed";
          dispatch({ type: "BOOTSTRAP_FAIL", payload: { error } });
        }
      },

      async selectConversation(conversationId: string) {
        dispatch({ type: "SELECT_CONVERSATION", payload: { conversationId } });
        const hasMessages = state.messagesByConversationId[conversationId];
        if (!hasMessages) {
          const messages = await conversationsRepo.listMessages(conversationId);
          dispatch({ type: "LOAD_MESSAGES", payload: { conversationId, messages } });
        }
      },

      async sendMessage(conversationId: string, body: string) {
        const tempId = this.sendMessageOptimistic(conversationId, body);
        try {
          const message = await conversationsRepo.sendMessage(
            conversationId,
            body,
            state.meId
          );
          this.sendMessageConfirmed(conversationId, tempId, message);
        } catch {
          this.sendMessageConfirmed(conversationId, tempId, {
            id: tempId,
            conversationId,
            authorId: state.meId,
            body,
            createdAt: nowIso(),
            status: "sent",
          });
        }
      },

      sendMessageOptimistic(conversationId: string, body: string): string {
        const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const message: Message = {
          id: tempId,
          conversationId,
          authorId: state.meId,
          body,
          createdAt: nowIso(),
          status: "sent",
        };
        dispatch({
          type: "SEND_MESSAGE_OPTIMISTIC",
          payload: { conversationId, message },
        });
        return tempId;
      },

      sendMessageConfirmed(
        conversationId: string,
        tempId: string,
        message: Message
      ) {
        dispatch({
          type: "SEND_MESSAGE_CONFIRMED",
          payload: { conversationId, tempId, message },
        });
      },

      async createContact(
        displayName: string,
        handle?: string
      ): Promise<Contact> {
        const contact = await contactsRepo.createContact(displayName, handle);
        dispatch({ type: "CREATE_CONTACT", payload: { contact } });
        return contact;
      },
    };
  }, [
    conversationsRepo,
    contactsRepo,
    state.meId,
    state.messagesByConversationId,
  ]);

  useEffect(() => {
    if (state.loading) return;
    saveStateDebounced(
      {
        conversations: state.conversations,
        messagesByConversationId: state.messagesByConversationId,
        contacts: state.contacts,
      },
      400
    );
  }, [
    state.loading,
    state.conversations,
    state.messagesByConversationId,
    state.contacts,
  ]);

  const value = useMemo<AppStoreValue>(
    () => ({ state, actions }),
    [state, actions]
  );

  return (
    <AppStoreContext.Provider value={value}>
      {children}
    </AppStoreContext.Provider>
  );
}

// --- Hook

export function useAppStore(): AppStoreValue {
  const ctx = useContext(AppStoreContext);
  if (!ctx) {
    throw new Error("useAppStore must be used within AppStoreProvider");
  }
  return ctx;
}
