export type VaultItemType = 'note' | 'document' | 'table' | 'media';

export interface BaseVaultItem {
  id: string;
  type: VaultItemType;
  title: string;
  size: number; // en bytes
  createdAt: Date;
  modifiedAt: Date;
  fromConversation?: string; // Pour les médias
}

export interface Note extends BaseVaultItem {
  type: 'note';
  content: string;
}

export interface Document extends BaseVaultItem {
  type: 'document';
  content: string; // Markdown
}

export interface TableCell {
  value: string;
}

export interface TableData extends BaseVaultItem {
  type: 'table';
  columns: string[]; // Noms des colonnes
  rows: TableCell[][];
}

export interface Media extends BaseVaultItem {
  type: 'media';
  mediaType: 'image' | 'video' | 'audio' | 'file';
  url: string;
  thumbnail?: string;
}

export type VaultItem = Note | Document | TableData | Media;

export interface StorageInfo {
  total: number;
  vault: number;
  cache: number;
  incomplete: number;
}
