export type BookingStatus = 'new' | 'confirmed' | 'completed' | 'cancelled';

export interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  text: string;
  dateLabel: string;
  service?: string;
}

export interface WorkGalleryItem {
  id: string;
  title: string;
  image: string;
  note?: string;
}

export interface MasterProfile {
  id: string;
  slug: string;
  name: string;
  profession: string;
  city: string;
  bio: string;
  services: string[];
  phone?: string;
  telegram?: string;
  whatsapp?: string;
  hidePhone?: boolean;
  hideTelegram?: boolean;
  hideWhatsapp?: boolean;
  avatar?: string;
  rating?: number;
  reviewCount?: number;
  responseTime?: string;
  experienceLabel?: string;
  priceHint?: string;
  reviews?: ReviewItem[];
  workGallery?: WorkGalleryItem[];
  createdAt: string;
}

export interface Booking {
  id: string;
  masterSlug: string;
  clientName: string;
  clientPhone: string;
  service: string;
  date: string;
  time: string;
  comment?: string;
  status: BookingStatus;
  createdAt: string;
}

export interface MasterProfileFormValues {
  name: string;
  profession: string;
  city: string;
  bio: string;
  servicesText: string;
  phone: string;
  telegram: string;
  whatsapp: string;
  hidePhone: boolean;
  hideTelegram: boolean;
  hideWhatsapp: boolean;
  slug: string;
  avatar: string;
}

export interface BookingFormValues {
  clientName: string;
  clientPhone: string;
  service: string;
  date: string;
  time: string;
  comment: string;
}

export interface PersistedAppState {
  ownedProfile: MasterProfile | null;
  bookings: Booking[];
}
