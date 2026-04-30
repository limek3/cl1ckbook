'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useLocale } from '@/lib/locale-context';
import { parseServices, slugify } from '@/lib/utils';
import { buildWorkspaceSeed, type WorkspaceSections, type WorkspaceSnapshot } from '@/lib/workspace-store';
import { getDemoBookings, getDemoProfile, saveStoredDemoProfile, SLOTY_DEMO_SLUG } from '@/lib/demo-data';
import { isDashboardDemoEnabled } from '@/lib/dashboard-demo';
import type {
  Booking,
  BookingFormValues,
  BookingStatus,
  MasterProfile,
  MasterProfileFormValues,
} from '@/lib/types';

interface SaveProfileResult {
  success: boolean;
  error?: string;
  profile?: MasterProfile;
}

interface CreateBookingResult {
  success: boolean;
  error?: string;
  booking?: Booking;
}

type SaveProfileValues = MasterProfileFormValues &
  Partial<
    Pick<
      MasterProfile,
      'priceHint' | 'experienceLabel' | 'responseTime' | 'workGallery' | 'reviews' | 'rating' | 'reviewCount'
    >
  >;

interface AppContextValue {
  hasHydrated: boolean;
  workspaceId: string | null;
  ownedProfile: MasterProfile | null;
  profiles: MasterProfile[];
  bookings: Booking[];
  workspaceData: WorkspaceSections;
  saveProfile: (values: SaveProfileValues) => Promise<SaveProfileResult>;
  createBooking: (masterSlug: string, values: BookingFormValues) => Promise<CreateBookingResult>;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => Promise<void>;
  updateWorkspaceSection: <T>(section: string, value: T) => Promise<boolean>;
  refreshWorkspace: () => Promise<void>;
  getProfileBySlug: (slug: string) => MasterProfile | null;
  getDemoProfileBySlug: (slug: string) => MasterProfile | null;
  getBookingsBySlug: (slug: string) => Booking[];
  getDemoBookingsBySlug: (slug: string) => Booking[];
  getPublicPath: (slug: string) => string;
}

const AppContext = createContext<AppContextValue | null>(null);

function buildProfile(values: SaveProfileValues, previous?: MasterProfile | null): MasterProfile {
  const priceHint = 'priceHint' in values ? values.priceHint?.trim() || undefined : previous?.priceHint;
  const experienceLabel =
    'experienceLabel' in values ? values.experienceLabel?.trim() || undefined : previous?.experienceLabel;
  const responseTime = 'responseTime' in values ? values.responseTime?.trim() || undefined : previous?.responseTime;
  const workGallery = values.workGallery ?? previous?.workGallery;
  const reviews = values.reviews ?? previous?.reviews;
  const rating = typeof values.rating === 'number' ? values.rating : previous?.rating;
  const reviewCount = typeof values.reviewCount === 'number' ? values.reviewCount : previous?.reviewCount;

  return {
    id: previous?.id ?? crypto.randomUUID(),
    slug: slugify(values.slug || values.name),
    name: values.name.trim(),
    profession: values.profession.trim(),
    city: values.city.trim(),
    bio: values.bio.trim(),
    services: parseServices(values.servicesText),
    phone: values.phone.trim() || undefined,
    telegram: values.telegram.trim() || undefined,
    whatsapp: values.whatsapp.trim() || undefined,
    hidePhone: values.hidePhone,
    hideTelegram: values.hideTelegram,
    hideWhatsapp: values.hideWhatsapp,
    avatar: values.avatar.trim() || undefined,
    priceHint,
    experienceLabel,
    responseTime,
    workGallery,
    reviews,
    rating,
    reviewCount,
    createdAt: previous?.createdAt ?? new Date().toISOString(),
  };
}

function buildBooking(masterSlug: string, values: BookingFormValues): Omit<Booking, 'id' | 'status' | 'createdAt'> {
  return {
    masterSlug,
    clientName: values.clientName.trim(),
    clientPhone: values.clientPhone.trim(),
    service: values.service.trim(),
    date: values.date,
    time: values.time,
    comment: values.comment.trim() || undefined,
  };
}

async function parseJson<T>(response: Response) {
  return (await response.json()) as T;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { copy, locale } = useLocale();
  const [hasHydrated, setHasHydrated] = useState(false);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [ownedProfile, setOwnedProfile] = useState<MasterProfile | null>(null);
  const [storedBookings, setStoredBookings] = useState<Booking[]>([]);
  const [workspaceData, setWorkspaceData] = useState<WorkspaceSections>({});

  const applySnapshot = useCallback((snapshot: WorkspaceSnapshot | null) => {
    if (!snapshot) {
      setWorkspaceId(null);
      setOwnedProfile(null);
      setStoredBookings([]);
      setWorkspaceData({});
      return;
    }

    setWorkspaceId(snapshot.id);
    setOwnedProfile(snapshot.profile);
    setStoredBookings(Array.isArray(snapshot.data?.bookings) ? (snapshot.data.bookings as Booking[]) : []);
    setWorkspaceData(snapshot.data ?? {});
  }, []);

  const refreshWorkspace = useCallback(async () => {
    try {
      const response = await fetch('/api/workspace', {
        credentials: 'include',
        cache: 'no-store',
      });

      if (response.status === 401 || response.status === 404) {
        applySnapshot(null);
        return;
      }

      if (!response.ok) {
        throw new Error('workspace_fetch_failed');
      }

      const snapshot = await parseJson<WorkspaceSnapshot>(response);
      applySnapshot(snapshot);
    } catch {
      applySnapshot(null);
    }
  }, [applySnapshot]);

  useEffect(() => {
    let active = true;

    (async () => {
      await refreshWorkspace();
      if (active) {
        setHasHydrated(true);
      }
    })();

    return () => {
      active = false;
    };
  }, [refreshWorkspace]);

  const profiles = useMemo(() => {
    return ownedProfile ? [ownedProfile] : [];
  }, [ownedProfile]);

  const bookings = useMemo(() => {
    return [...storedBookings].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [storedBookings]);

  const getProfileBySlug = useCallback(
    (slug: string) => profiles.find((profile) => profile.slug === slug) ?? null,
    [profiles],
  );

  const getDemoProfileBySlug = useCallback(
    (slug: string) => getDemoProfile(slug, locale),
    [locale],
  );

  const getBookingsBySlug = useCallback(
    (slug: string) => bookings.filter((booking) => booking.masterSlug === slug),
    [bookings],
  );

  const getDemoBookingsBySlug = useCallback(
    (slug: string) => getDemoBookings(slug, locale),
    [locale],
  );

  const validateProfile = useCallback(
    (values: MasterProfileFormValues, existingProfile?: MasterProfile | null) => {
      const slug = slugify(values.slug || values.name);
      const services = parseServices(values.servicesText);

      if (!values.name.trim()) return copy.validation.masterName;
      if (!values.profession.trim()) return copy.validation.profession;
      if (!values.city.trim()) return copy.validation.city;
      if (!values.bio.trim()) return copy.validation.bio;
      if (!slug) return copy.validation.slug;
      if (services.length === 0) return copy.validation.services;

      return null;
    },
    [copy.validation],
  );

  const validateBooking = useCallback(
    (values: BookingFormValues) => {
      if (!values.clientName.trim()) return copy.validation.clientName;
      if (!values.clientPhone.trim()) return copy.validation.clientPhone;
      if (!values.service.trim()) return copy.validation.service;
      if (!values.date) return copy.validation.date;
      if (!values.time) return copy.validation.time;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const selectedDate = new Date(`${values.date}T00:00:00`);
      if (selectedDate.getTime() < today.getTime()) return copy.validation.pastDate;

      return null;
    },
    [copy.validation],
  );

  const saveProfile = useCallback(
    async (values: SaveProfileValues): Promise<SaveProfileResult> => {
      const error = validateProfile(values, ownedProfile);
      if (error) {
        return { success: false, error };
      }

      const demoMode =
        typeof window !== 'undefined' &&
        isDashboardDemoEnabled(new URLSearchParams(window.location.search || ''));
      const previousProfile = demoMode ? getDemoProfile(SLOTY_DEMO_SLUG, locale) : ownedProfile;
      const nextProfile = buildProfile(
        demoMode ? { ...values, slug: SLOTY_DEMO_SLUG } : values,
        previousProfile,
      );

      if (demoMode) {
        saveStoredDemoProfile(nextProfile);
        return {
          success: true,
          profile: nextProfile,
        };
      }

      try {
        const response = await fetch('/api/profile', {
          method: 'POST',
          credentials: 'include',
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            workspaceId,
            profile: nextProfile,
            locale,
          }),
        });

        if (response.status === 401) {
          return {
            success: false,
            error: locale === 'ru' ? 'Сессия истекла. Войдите снова.' : 'Session expired. Please sign in again.',
          };
        }

        if (response.status === 409) {
          return { success: false, error: copy.validation.slugTaken };
        }

        if (!response.ok) {
          return {
            success: false,
            error: locale === 'ru' ? 'Не удалось сохранить данные. Попробуйте ещё раз.' : 'Could not save the data. Please try again.',
          };
        }

        const snapshot = await parseJson<WorkspaceSnapshot>(response);
        const nextData = Object.keys(snapshot.data ?? {}).length > 0
          ? snapshot.data
          : buildWorkspaceSeed(nextProfile, snapshot.data?.bookings as Booking[] ?? [], locale);

        applySnapshot({
          ...snapshot,
          data: nextData,
        });

        return {
          success: true,
          profile: nextProfile,
        };
      } catch {
        return {
          success: false,
          error: locale === 'ru' ? 'Не удалось сохранить данные. Попробуйте ещё раз.' : 'Could not save the data. Please try again.',
        };
      }
    },
    [applySnapshot, copy.validation.slugTaken, locale, ownedProfile, validateProfile, workspaceId],
  );

  const createBooking = useCallback(
    async (masterSlug: string, values: BookingFormValues): Promise<CreateBookingResult> => {
      const error = validateBooking(values);

      if (error) {
        return { success: false, error };
      }

      try {
        const response = await fetch('/api/bookings', {
          method: 'POST',
          credentials: 'include',
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            masterSlug,
            values: buildBooking(masterSlug, values),
          }),
        });

        if (!response.ok) {
          return {
            success: false,
            error: locale === 'ru' ? 'Не удалось сохранить данные. Попробуйте ещё раз.' : 'Could not save the data. Please try again.',
          };
        }

        const payload = await parseJson<{ booking: Booking }>(response);

        if (ownedProfile?.slug === masterSlug) {
          setStoredBookings((current) => [payload.booking, ...current]);
          setWorkspaceData((current) => ({
            ...current,
            bookings: [payload.booking, ...(Array.isArray(current.bookings) ? (current.bookings as Booking[]) : storedBookings)],
          }));
        }

        return {
          success: true,
          booking: payload.booking,
        };
      } catch {
        return {
          success: false,
          error: locale === 'ru' ? 'Не удалось сохранить данные. Попробуйте ещё раз.' : 'Could not save the data. Please try again.',
        };
      }
    },
    [locale, ownedProfile?.slug, storedBookings, validateBooking],
  );

  const updateWorkspaceSection = useCallback(
    async <T,>(section: string, value: T) => {
      if (!workspaceId) return false;

      const optimistic = {
        ...workspaceData,
        [section]: value,
      };
      setWorkspaceData(optimistic);

      if (section === 'bookings' && Array.isArray(value)) {
        setStoredBookings(value as Booking[]);
      }

      try {
        const response = await fetch('/api/workspace/section', {
          method: 'PATCH',
          credentials: 'include',
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            workspaceId,
            section,
            value,
          }),
        });

        if (!response.ok) {
          throw new Error('section_update_failed');
        }

        const snapshot = await parseJson<WorkspaceSnapshot>(response);
        applySnapshot(snapshot);
        return true;
      } catch {
        return false;
      }
    },
    [applySnapshot, workspaceData, workspaceId],
  );

  const updateBookingStatus = useCallback(
    async (bookingId: string, status: BookingStatus) => {
      if (!workspaceId) return;

      const optimisticBookings = bookings.map((booking) => (booking.id === bookingId ? { ...booking, status } : booking));
      setStoredBookings(optimisticBookings);
      setWorkspaceData((current) => ({
        ...current,
        bookings: optimisticBookings,
      }));

      try {
        const response = await fetch('/api/bookings', {
          method: 'PATCH',
          credentials: 'include',
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bookingId,
            status,
          }),
        });

        if (!response.ok) {
          throw new Error('booking_status_update_failed');
        }

        const payload = await parseJson<{ booking: Booking }>(response);
        const confirmedBookings = optimisticBookings.map((booking) =>
          booking.id === bookingId ? payload.booking : booking,
        );

        setStoredBookings(confirmedBookings);
        setWorkspaceData((current) => ({
          ...current,
          bookings: confirmedBookings,
        }));
      } catch {
        await refreshWorkspace();
      }
    },
    [bookings, refreshWorkspace, workspaceId],
  );

  const getPublicPath = useCallback((slug: string) => `/m/${slug}`, []);

  const value = useMemo<AppContextValue>(
    () => ({
      hasHydrated,
      workspaceId,
      ownedProfile,
      profiles,
      bookings,
      workspaceData,
      saveProfile,
      createBooking,
      updateBookingStatus,
      updateWorkspaceSection,
      refreshWorkspace,
      getProfileBySlug,
      getDemoProfileBySlug,
      getBookingsBySlug,
      getDemoBookingsBySlug,
      getPublicPath,
    }),
    [
      bookings,
      createBooking,
      getBookingsBySlug,
      getDemoBookingsBySlug,
      getDemoProfileBySlug,
      getProfileBySlug,
      getPublicPath,
      hasHydrated,
      ownedProfile,
      profiles,
      refreshWorkspace,
      saveProfile,
      updateBookingStatus,
      updateWorkspaceSection,
      workspaceData,
      workspaceId,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }

  return context;
}
