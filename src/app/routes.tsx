import { createBrowserRouter, Navigate } from "react-router";
import { LockProvider } from "./context/LockContext";
import { PrivacyProvider } from "./context/PrivacyContext";
import { NotificationProvider } from "./context/NotificationContext";
import { VaultAuthProvider } from "./context/VaultAuthContext";
import { AppStoreProvider } from "./state/AppStore";
import { mockConversationsRepository, mockContactsRepository } from "./data/mockRepositories";
import { RootLayout } from "./layouts/RootLayout";
import { LockScreen } from "./components/LockScreen";
import { ConversationsList } from "./pages/ConversationsList";
import { ChatView } from "./pages/ChatView";
import { Contacts } from "./pages/Contacts";
import { AddContact } from "./pages/AddContact";
import { QRScanner } from "./pages/QRScanner";
import { ContactDetail } from "./pages/ContactDetail";
import { ContactQR } from "./pages/ContactQR";
import { NewChat } from "./pages/NewChat";
import { Profile } from "./pages/Profile";
import { ProfileQR } from "./pages/ProfileQR";
import { SafetyNumber } from "./pages/SafetyNumber";
import { Settings } from "./pages/Settings";
import { SecuritySettings } from "./pages/SecuritySettings";
import { ConfidentialitySettings } from "./pages/ConfidentialitySettings";
import { NotificationSettings } from "./pages/NotificationSettings";
import { StorageSettings } from "./pages/StorageSettings";
import { Vault } from "./pages/Vault";
import { VaultFiles } from "./pages/vault/VaultFiles";
import { VaultNotes } from "./pages/vault/VaultNotes";
import { VaultMedia } from "./pages/vault/VaultMedia";
import { VaultSettings } from "./pages/vault/VaultSettings";
import { NoteEditor } from "./pages/vault/NoteEditor";
import { DocumentEditor } from "./pages/vault/DocumentEditor";
import { TableSetup } from "./pages/vault/TableSetup";
import { TableEditor } from "./pages/vault/TableEditor";
import { MediaDetail } from "./pages/vault/MediaDetail";
import { VaultContacts } from "./pages/vault/VaultContacts";
import { VaultContactFiles } from "./pages/vault/VaultContactFiles";
import { Logout } from "./pages/Logout";
import { Alerts } from "./pages/Alerts";

function AppRoot() {
  return (
    <LockProvider>
      <PrivacyProvider>
        <NotificationProvider>
          <VaultAuthProvider>
            <AppStoreProvider
              conversationsRepo={mockConversationsRepository}
              contactsRepo={mockContactsRepository}
            >
              <RootLayout />
            </AppStoreProvider>
          </VaultAuthProvider>
        </NotificationProvider>
      </PrivacyProvider>
    </LockProvider>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppRoot />,
    children: [
      {
        path: "lock",
        element: <LockScreen />,
      },
      {
        index: true,
        element: <ConversationsList />,
      },
      {
        path: "chat/:id",
        element: <ChatView />,
      },
      {
        path: "contacts",
        element: <Contacts />,
      },
      {
        path: "contacts/add",
        element: <AddContact />,
      },
      {
        path: "contacts/scan",
        element: <QRScanner />,
      },
      {
        path: "contacts/:id",
        element: <ContactDetail />,
      },
      {
        path: "contacts/:id/qr",
        element: <ContactQR />,
      },
      {
        path: "contacts/:id/verify",
        element: <QRScanner />,
      },
      {
        path: "chat/new",
        element: <NewChat />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "profile/qr",
        element: <ProfileQR />,
      },
      {
        path: "profile/safety-number",
        element: <SafetyNumber />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "settings/security",
        element: <SecuritySettings />,
      },
      {
        path: "settings/confidentiality",
        element: <ConfidentialitySettings />,
      },
      {
        path: "settings/notifications",
        element: <NotificationSettings />,
      },
      {
        path: "settings/storage",
        element: <StorageSettings />,
      },
      {
        path: "vault",
        element: <Vault />,
      },
      {
        path: "vault/files",
        element: <VaultFiles />,
      },
      {
        path: "vault/notes",
        element: <VaultNotes />,
      },
      {
        path: "vault/media",
        element: <VaultMedia />,
      },
      {
        path: "vault/settings",
        element: <VaultSettings />,
      },
      {
        path: "vault/note/:id",
        element: <NoteEditor />,
      },
      {
        path: "vault/document/:id",
        element: <DocumentEditor />,
      },
      {
        path: "vault/table/setup",
        element: <TableSetup />,
      },
      {
        path: "vault/table/:id",
        element: <TableEditor />,
      },
      {
        path: "vault/media/:id",
        element: <MediaDetail />,
      },
      {
        path: "vault/contacts",
        element: <VaultContacts />,
      },
      {
        path: "vault/contacts/:id",
        element: <VaultContactFiles />,
      },
      {
        path: "logout",
        element: <Logout />,
      },
      {
        path: "alerts",
        element: <Alerts />,
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);