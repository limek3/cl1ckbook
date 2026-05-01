
import type { AppearanceSettings } from '@/lib/appearance';
import type { Locale } from '@/lib/i18n';
import {
  buildWorkspaceDataset,
  type AvailabilityDayInsight,
  type ClientInsight,
  type MessageTemplateInsight,
  type NotificationInsight,
  type ServiceInsight,
  type WorkspaceDataset,
} from '@/lib/master-workspace';
import type { Booking, MasterProfile } from '@/lib/types';

export const WORKSPACE_ID_STORAGE_KEY = 'sloty-workspace-id';

export interface WorkspaceSections {
  bookings?: Booking[];
  services?: ServiceInsight[];
  availability?: AvailabilityDayInsight[];
  templates?: MessageTemplateInsight[];
  notifications?: unknown[];
  chats?: unknown[];
  appearance?: AppearanceSettings;
  quietHours?: boolean;
  fallbackEmail?: boolean;
  clientNotes?: Record<string, string>;
  clientReminders?: Record<string, { text?: string; remindAt?: string; updatedAt?: string }>;
  [key: string]: unknown;
}

export interface WorkspaceSnapshot {
  id: string;
  ownerId?: string;
  slug: string;
  profile: MasterProfile;
  data: WorkspaceSections;
  appearance?: Partial<AppearanceSettings> | null;
  createdAt?: string;
  updatedAt?: string;
}

function normalizeNotificationItems(
  value: unknown[] | undefined,
  fallback: NotificationInsight[],
): NotificationInsight[] {
  if (!Array.isArray(value) || value.length === 0) return fallback;

  const fallbackById = new Map(fallback.map((item) => [item.id, item]));
  const usedIds = new Set<string>();
  const normalized = value.map((item, index) => {
    if (!item || typeof item !== 'object') return fallback[index] ?? fallback[0];
    const candidate = item as Record<string, unknown>;
    const id = String(candidate.id ?? fallback[index]?.id ?? `notification-${index}`);
    const fallbackItem = fallbackById.get(id) ?? fallback[index] ?? fallback[0];
    usedIds.add(id);

    return {
      id,
      title: String(candidate.title ?? fallbackItem?.title ?? ''),
      description: String(candidate.description ?? fallbackItem?.description ?? ''),
      channel: (candidate.channel === 'push' || candidate.channel === 'email' || candidate.channel === 'telegram' || candidate.channel === 'max'
        ? candidate.channel
        : fallbackItem?.channel ?? 'telegram') as NotificationInsight['channel'],
      enabled: typeof candidate.enabled === 'boolean' ? candidate.enabled : fallbackItem?.enabled ?? true,
      critical: typeof candidate.critical === 'boolean' ? candidate.critical : fallbackItem?.critical,
    };
  });

  for (const item of fallback) {
    if (!usedIds.has(item.id)) normalized.push(item);
  }

  return normalized;
}


function normalizeClientTextMap(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([key, item]) => key && typeof item === 'string')
      .map(([key, item]) => [key, item as string]),
  );
}

function overlayClientExtras(clients: ClientInsight[], sections: WorkspaceSections): ClientInsight[] {
  const notes = normalizeClientTextMap(sections.clientNotes);

  if (Object.keys(notes).length === 0) return clients;

  return clients.map((client) => {
    const note = notes[client.id] ?? notes[client.phone];
    return note !== undefined ? { ...client, note } : client;
  });
}

export function buildWorkspaceSeed(
  profile: MasterProfile,
  bookings: Booking[],
  locale: Locale,
): WorkspaceSections {
  const dataset = buildWorkspaceDataset(profile, bookings, locale);

  return {
    bookings,
    services: dataset.services,
    availability: dataset.availability,
    templates: dataset.templates,
    notifications: dataset.notifications,
    chats: [],
    quietHours: false,
    fallbackEmail: true,
  };
}

export function buildWorkspaceDatasetFromStored(
  profile: MasterProfile,
  bookings: Booking[],
  locale: Locale,
  sections: WorkspaceSections | null | undefined,
): WorkspaceDataset {
  const base = buildWorkspaceDataset(profile, bookings, locale);
  const source = sections ?? {};

  return {
    ...base,
    services: Array.isArray(source.services) && source.services.length > 0 ? (source.services as ServiceInsight[]) : base.services,
    availability: Array.isArray(source.availability) && source.availability.length > 0 ? (source.availability as AvailabilityDayInsight[]) : base.availability,
    templates: Array.isArray(source.templates) && source.templates.length > 0 ? (source.templates as MessageTemplateInsight[]) : base.templates,
    notifications: normalizeNotificationItems(source.notifications as unknown[] | undefined, base.notifications),
    clients: overlayClientExtras(base.clients, source),
  };
}
