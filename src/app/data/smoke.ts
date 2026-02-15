/**
 * Tests manuels (smoke) pour la couche data — pas de framework.
 * Usage: appeler smoke() depuis la console ou un bouton dev ; lance des assertions et log le résultat.
 */

import { mockConversationsRepository, mockContactsRepository } from "./mockRepositories";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`[smoke] ${message}`);
}

export async function smoke(): Promise<void> {
  console.log("[smoke] Démarrage…");

  const convs = await mockConversationsRepository.listConversations();
  assert(convs.length === 6, `listConversations doit retourner 6 conversations, got ${convs.length}`);
  for (let i = 1; i < convs.length; i++) {
    const ok = convs[i].lastMessageAt <= convs[i - 1].lastMessageAt;
    assert(ok, `listConversations doit être trié par lastMessageAt desc (indices ${i - 1}, ${i})`);
  }
  console.log("[smoke] listConversations() : 6 conversations, tri lastMessageAt desc ✓");

  const conv1 = await mockConversationsRepository.getConversation("conv-1");
  assert(conv1 !== null, "getConversation(conv-1) doit retourner une conversation");
  assert(conv1!.title.length > 0, "conversation doit avoir un title");
  console.log("[smoke] getConversation(conv-1) ✓");

  const messages = await mockConversationsRepository.listMessages("conv-1");
  assert(messages.length > 0, "listMessages(conv-1) doit retourner des messages");
  for (let i = 1; i < messages.length; i++) {
    assert(
      messages[i].createdAt >= messages[i - 1].createdAt,
      "listMessages doit être trié par createdAt asc"
    );
  }
  console.log("[smoke] listMessages(conv-1) tri asc ✓");

  const contactsBefore = await mockContactsRepository.listContacts();
  assert(contactsBefore.length === 15, `listContacts doit retourner 15 contacts, got ${contactsBefore.length}`);
  const created = await mockContactsRepository.createContact("Smoke Test", "@smoke");
  assert(created.id.length > 0 && created.displayName === "Smoke Test", "createContact doit retourner le contact créé");
  const contactsAfter = await mockContactsRepository.listContacts();
  assert(contactsAfter.length === 16, "listContacts après createContact doit avoir 16 contacts");
  console.log("[smoke] listContacts / createContact ✓");

  const sent = await mockConversationsRepository.sendMessage("conv-1", "Smoke message", "me");
  assert(sent.conversationId === "conv-1" && sent.body === "Smoke message", "sendMessage doit retourner le message envoyé");
  const messagesAfter = await mockConversationsRepository.listMessages("conv-1");
  assert(
    messagesAfter.some((m) => m.id === sent.id),
    "listMessages après sendMessage doit contenir le nouveau message"
  );
  console.log("[smoke] sendMessage ✓");

  console.log("[smoke] Tous les checks sont passés.");
}
