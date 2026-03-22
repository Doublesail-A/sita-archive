export type SiteLink = {
  href: string;
  label: string;
};

export const SITE_NAME = "汐塔";
export const SITE_TITLE = "汐塔 | 云海之上";
export const SITE_DESCRIPTION = "汐塔同人整理站：news / movies / wiki / doujin / stories / music。";
export const OWNER_EMAIL = "xwd2020@outlook.com";

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
