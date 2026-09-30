export interface SiteButtonConfig {
  id: string;
  label: string;
  target: 'solutions' | 'knowledge' | 'products' | 'projects' | 'news' | 'ai-advisor' | 'tools' | 'contact';
  style: 'primary-red' | 'accent-amber' | 'deep-navy' | 'outline' | 'ghost';
  icon?: 'arrow' | 'cpu' | 'sparkles' | 'file' | 'phone';
  visible: boolean;
}

export interface MetricItemConfig {
  id: string;
  label: string;
  value: string;
  unit: string;
  sub: string;
}

export interface HeroConfig {
  tagline: string;
  titleLine1: string;
  titleLine2: string;
  titleLine3: string;
  jpSubtitle: string;
  description: string;
  bgImage: string;
  bgBrightness: number;
  overlayType: 'light-clean' | 'airy-gradient' | 'subtle-glass' | 'cinematic-dark';
  overlayOpacity: number;
  accentBadge: string;
  showSlogan: boolean;
  textColor: 'dark' | 'light';
  buttons: SiteButtonConfig[];
  metrics: MetricItemConfig[];
}

export interface SiteThemeConfig {
  primaryAccent: string; // e.g. '#d81a28'
  fontFamily: 'noto' | 'inter' | 'serif' | 'zen' | 'jakarta';
  fontSizeScale: 'normal' | 'large' | 'compact';
  heroTheme: 'solar-frontier-light' | 'airy-blue' | 'clean-neutral' | 'dark-tech';
}

export interface SiteConfig {
  hero: HeroConfig;
  theme: SiteThemeConfig;
  sectionTitles?: {
    pickup?: string;
    solutions?: string;
    bessFocus?: string;
    news?: string;
    projects?: string;
    cta?: string;
  };
  lastUpdated?: string;
  updatedBy?: string;
}
