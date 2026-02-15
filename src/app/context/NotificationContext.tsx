import { createContext, useContext, useState, ReactNode } from "react";

export type NotificationContent = "none" | "contact";

export type AlertSound = "default" | "gentle" | "urgent" | "chime" | "bell";

export interface NotificationSettings {
  enabled: boolean;
  contentType: NotificationContent;
  hideOnLockScreen: boolean;
  sound: boolean;
  vibration: boolean;
  alertsEnabled: boolean;
  alertSound: AlertSound;
}

interface NotificationContextType {
  notificationSettings: NotificationSettings;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    enabled: true,
    contentType: "none",
    hideOnLockScreen: true,
    sound: true,
    vibration: true,
    alertsEnabled: true,
    alertSound: "default",
  });

  const updateNotificationSettings = (settings: Partial<NotificationSettings>) => {
    setNotificationSettings((prev) => ({ ...prev, ...settings }));
  };

  return (
    <NotificationContext.Provider
      value={{ notificationSettings, updateNotificationSettings }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}