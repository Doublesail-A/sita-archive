export type SiteLink = {
  href: string;
  label: string;
};

export const SITE_URL = "https://cetus.wiki";
export const SITE_DOMAIN = "cetus.wiki";
export const SITE_NAME = "汐塔";
export const SITE_ALT_NAME = "Cetus";
export const SITE_TITLE = "汐塔 Cetus Wiki";
export const SITE_DESCRIPTION = "自天空坠落云海，随潮汐回归彼岸。";
export const SITE_SECTION_DESCRIPTION = "汐塔同人整理站，收录 news、movies、wiki、doujin、stories 与音乐页面。";
export const SITE_AUTHOR_NAME = "汐塔同人整理站";
export const OWNER_EMAIL = "xwd2020@outlook.com";
export const DEFAULT_THEME_COLOR = "#ece6da";
export const DEFAULT_SOCIAL_IMAGE = "/favicon.svg";

export const SITE_KEYWORDS = [
  "汐塔",
  "潮汐之塔",
  "云海逐鲸",
  "云上邮差",
  "汐塔同人",
  "汐塔wiki",
  "cetus",
];

export function absoluteUrl(pathname = "/"): string {
  return new URL(pathname, SITE_URL).toString();
}

export function absoluteAssetUrl(pathname?: string): string | undefined {
  if (!pathname) return undefined;
  return new URL(pathname, SITE_URL).toString();
}

export function mergeKeywords(extra: string[] = []): string[] {
  return Array.from(new Set([...SITE_KEYWORDS, ...extra.filter(Boolean)]));
}

export function buildBreadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_TITLE,
    alternateName: [SITE_NAME, SITE_ALT_NAME, "汐塔wiki"],
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "zh-CN",
    keywords: SITE_KEYWORDS.join(", "),
  };
}

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_AUTHOR_NAME,
    url: SITE_URL,
    email: OWNER_EMAIL,
  };
}

export const DEFAULT_PAGE_LINKS: SiteLink[] = [
  { href: "/news/", label: "news" },
  { href: "/wiki/", label: "wiki" },
  { href: "/doujin/", label: "doujin" },
  { href: "/stories/", label: "stories" },
  { href: "/about/", label: "about" },
];

export const HOME_DESKTOP_LINKS: SiteLink[] = [
  { href: "#news", label: "news" },
  { href: "#movies", label: "movies" },
  { href: "#wiki", label: "wiki" },
  { href: "#doujin", label: "doujin" },
  { href: "#stories", label: "stories" },
  { href: "/music", label: "music" },
  { href: "/about/", label: "about" },
];

export const FOOTER_LINKS: SiteLink[] = [
  { href: "/", label: "home" },
  { href: "/news/", label: "news" },
  { href: "/wiki/", label: "wiki" },
  { href: "/doujin/", label: "doujin" },
  { href: "/stories/", label: "stories" },
  { href: "/music", label: "music" },
  { href: "/about/", label: "about" },
];
