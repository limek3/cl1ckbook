import { accentToneValues, type AccentTone } from '@/lib/appearance-palette';

export type NeutralTone = 'zinc' | 'slate' | 'stone' | 'pearl' | 'sage' | 'sand';
export type DensityMode = 'compact' | 'standard' | 'airy';
export type RadiusMode = 'soft' | 'medium' | 'tight';
export type MotionMode = 'off' | 'fast' | 'smooth';
export type CardMode = 'flat' | 'soft' | 'glass';
export type PublicCover = 'gradient' | 'portrait' | 'minimal';
export type PublicButtonStyle = 'pill' | 'rounded' | 'contrast';
export type PublicCardStyle = 'editorial' | 'soft' | 'compact';
export type PublicServicesStyle = 'grid' | 'chips' | 'stacked';
export type PublicBookingStyle = 'panel' | 'step' | 'minimal';
export type PublicHeroLayout = 'split' | 'centered' | 'compact';
export type PublicSurface = 'soft' | 'contrast' | 'glass';
export type PublicSectionStyle = 'cards' | 'minimal' | 'dividers';
export type PublicGalleryStyle = 'grid' | 'editorial' | 'compact';
export type PlatformWidth = 'focused' | 'balanced' | 'wide';
export type SidebarDensity = 'tight' | 'balanced' | 'roomy';
export type TopbarDensity = 'tight' | 'balanced' | 'roomy';

export interface AppearanceSettings {
  accentTone: AccentTone;
  neutralTone: NeutralTone;
  density: DensityMode;
  radius: RadiusMode;
  motion: MotionMode;
  cardStyle: CardMode;
  publicCover: PublicCover;
  publicAccent: AccentTone;
  publicButtonStyle: PublicButtonStyle;
  publicCardStyle: PublicCardStyle;
  publicServicesStyle: PublicServicesStyle;
  publicBookingStyle: PublicBookingStyle;
  publicHeroLayout: PublicHeroLayout;
  publicSurface: PublicSurface;
  publicSectionStyle: PublicSectionStyle;
  publicGalleryStyle: PublicGalleryStyle;
  platformWidth: PlatformWidth;
  sidebarDensity: SidebarDensity;
  topbarDensity: TopbarDensity;
}

export const APPEARANCE_STORAGE_KEY = 'sloty-appearance-settings';

export const defaultAppearanceSettings: AppearanceSettings = {
  accentTone: 'cobalt',
  neutralTone: 'zinc',
  density: 'standard',
  radius: 'medium',
  motion: 'smooth',
  cardStyle: 'soft',
  publicCover: 'gradient',
  publicAccent: 'cobalt',
  publicButtonStyle: 'pill',
  publicCardStyle: 'soft',
  publicServicesStyle: 'grid',
  publicBookingStyle: 'panel',
  publicHeroLayout: 'split',
  publicSurface: 'soft',
  publicSectionStyle: 'cards',
  publicGalleryStyle: 'grid',
  platformWidth: 'balanced',
  sidebarDensity: 'balanced',
  topbarDensity: 'balanced',
};

const appearanceValueMap = {
  accentTone: accentToneValues,
  neutralTone: ['zinc', 'slate', 'stone', 'pearl', 'sage', 'sand'],
  density: ['compact', 'standard', 'airy'],
  radius: ['soft', 'medium', 'tight'],
  motion: ['off', 'fast', 'smooth'],
  cardStyle: ['flat', 'soft', 'glass'],
  publicCover: ['gradient', 'portrait', 'minimal'],
  publicAccent: accentToneValues,
  publicButtonStyle: ['pill', 'rounded', 'contrast'],
  publicCardStyle: ['editorial', 'soft', 'compact'],
  publicServicesStyle: ['grid', 'chips', 'stacked'],
  publicBookingStyle: ['panel', 'step', 'minimal'],
  publicHeroLayout: ['split', 'centered', 'compact'],
  publicSurface: ['soft', 'contrast', 'glass'],
  publicSectionStyle: ['cards', 'minimal', 'dividers'],
  publicGalleryStyle: ['grid', 'editorial', 'compact'],
  platformWidth: ['focused', 'balanced', 'wide'],
  sidebarDensity: ['tight', 'balanced', 'roomy'],
  topbarDensity: ['tight', 'balanced', 'roomy'],
} as const satisfies {
  [Key in keyof AppearanceSettings]: readonly AppearanceSettings[Key][];
};

export function normalizeAppearanceSettings(value?: Partial<AppearanceSettings> | null): AppearanceSettings {
  const next = { ...defaultAppearanceSettings };

  if (!value) {
    return next;
  }

  (Object.keys(appearanceValueMap) as Array<keyof AppearanceSettings>).forEach((key) => {
    const candidate = value[key];
    const allowed = appearanceValueMap[key] as readonly string[];

    if (typeof candidate === 'string' && allowed.includes(candidate)) {
      next[key] = candidate as AppearanceSettings[typeof key];
    }
  });

  return next;
}

export function applyAppearanceToElement(element: HTMLElement, settings: AppearanceSettings) {
  element.dataset.slotyAccent = settings.accentTone;
  element.dataset.slotyNeutral = settings.neutralTone;
  element.dataset.slotyDensity = settings.density;
  element.dataset.slotyRadius = settings.radius;
  element.dataset.slotyMotion = settings.motion;
  element.dataset.slotyCardStyle = settings.cardStyle;
  element.dataset.slotyPublicCover = settings.publicCover;
  element.dataset.slotyPublicAccent = settings.publicAccent;
  element.dataset.slotyPublicButton = settings.publicButtonStyle;
  element.dataset.slotyPublicCard = settings.publicCardStyle;
  element.dataset.slotyPublicServices = settings.publicServicesStyle;
  element.dataset.slotyPublicBooking = settings.publicBookingStyle;
  element.dataset.slotyPublicHero = settings.publicHeroLayout;
  element.dataset.slotyPublicSurface = settings.publicSurface;
  element.dataset.slotyPublicSection = settings.publicSectionStyle;
  element.dataset.slotyPublicGallery = settings.publicGalleryStyle;
  element.dataset.slotyPlatformWidth = settings.platformWidth;
  element.dataset.slotySidebarDensity = settings.sidebarDensity;
  element.dataset.slotyTopbarDensity = settings.topbarDensity;
}

export function buildAppearancePreferenceScript() {
  const fallback = JSON.stringify(defaultAppearanceSettings);
  const key = JSON.stringify(APPEARANCE_STORAGE_KEY);

  return `
    try {
      const fallback = ${fallback};
      const raw = window.localStorage.getItem(${key});
      const parsed = raw ? JSON.parse(raw) : fallback;
      const settings = { ...fallback, ...parsed };
      const root = document.documentElement;
      root.dataset.slotyAccent = settings.accentTone;
      root.dataset.slotyNeutral = settings.neutralTone;
      root.dataset.slotyDensity = settings.density;
      root.dataset.slotyRadius = settings.radius;
      root.dataset.slotyMotion = settings.motion;
      root.dataset.slotyCardStyle = settings.cardStyle;
      root.dataset.slotyPublicCover = settings.publicCover;
      root.dataset.slotyPublicAccent = settings.publicAccent;
      root.dataset.slotyPublicButton = settings.publicButtonStyle;
      root.dataset.slotyPublicCard = settings.publicCardStyle;
      root.dataset.slotyPublicServices = settings.publicServicesStyle;
      root.dataset.slotyPublicBooking = settings.publicBookingStyle;
      root.dataset.slotyPublicHero = settings.publicHeroLayout;
      root.dataset.slotyPublicSurface = settings.publicSurface;
      root.dataset.slotyPublicSection = settings.publicSectionStyle;
      root.dataset.slotyPublicGallery = settings.publicGalleryStyle;
      root.dataset.slotyPlatformWidth = settings.platformWidth;
      root.dataset.slotySidebarDensity = settings.sidebarDensity;
      root.dataset.slotyTopbarDensity = settings.topbarDensity;
    } catch (error) {
      const root = document.documentElement;
      root.dataset.slotyAccent = 'cobalt';
      root.dataset.slotyNeutral = 'zinc';
      root.dataset.slotyDensity = 'standard';
      root.dataset.slotyRadius = 'medium';
      root.dataset.slotyMotion = 'smooth';
      root.dataset.slotyCardStyle = 'soft';
      root.dataset.slotyPublicCover = 'gradient';
      root.dataset.slotyPublicAccent = 'cobalt';
      root.dataset.slotyPublicButton = 'pill';
      root.dataset.slotyPublicCard = 'soft';
      root.dataset.slotyPublicServices = 'grid';
      root.dataset.slotyPublicBooking = 'panel';
      root.dataset.slotyPublicHero = 'split';
      root.dataset.slotyPublicSurface = 'soft';
      root.dataset.slotyPublicSection = 'cards';
      root.dataset.slotyPublicGallery = 'grid';
      root.dataset.slotyPlatformWidth = 'balanced';
      root.dataset.slotySidebarDensity = 'balanced';
      root.dataset.slotyTopbarDensity = 'balanced';
    }
  `;
}

export function getPublicButtonClassName(style: PublicButtonStyle, variant: 'primary' | 'secondary' | 'ghost' = 'primary') {
  const shapeClass =
    style === 'pill' ? 'rounded-full' : style === 'rounded' ? 'rounded-[16px]' : 'rounded-[14px]';

  if (variant === 'primary') {
    if (style === 'contrast') {
      return `${shapeClass} bg-foreground text-background hover:opacity-92`;
    }

    return `${shapeClass}`;
  }

  if (variant === 'secondary') {
    if (style === 'contrast') {
      return `${shapeClass} border-foreground/14 bg-card/88 text-foreground hover:bg-accent`;
    }

    return `${shapeClass} border-border bg-card/88 text-foreground hover:bg-accent`;
  }

  return `${shapeClass} text-muted-foreground hover:bg-accent hover:text-foreground`;
}
