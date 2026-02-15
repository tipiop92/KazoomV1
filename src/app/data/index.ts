/** Couche data : interfaces, mock, smoke, persistance. */
export type { ConversationsRepository, ContactsRepository } from "./repositories";
export { mockConversationsRepository, mockContactsRepository } from "./mockRepositories";
export { smoke } from "./smoke";
export {
  loadState,
  saveState,
  saveStateDebounced,
  STATE_VERSION,
  type PersistedAppState,
} from "./persistence";
