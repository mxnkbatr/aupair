/**
 * Au Pair Mongolia color system — logo palette (red · teal · yellow · orange · mint).
 */

export type ModuleId = "programs" | "shop" | "lessons" | "events";
export type ProgramId = "edu" | "and" | "vclub";

export type ColorSwatch = {
  main: string;
  soft: string;
  border: string;
  gradFrom: string;
  gradTo: string;
  onSoft: string;
};

/** Үндсэн 4 модуль — нүүр хуудсын category card */
export const MODULE_COLORS: Record<ModuleId, ColorSwatch & { label: string; sub: string }> = {
  programs: {
    label: "Хөтөлбөр",
    sub: "Au Pair · Гэр бүл",
    main: "#C41E3A",
    soft: "#FDE8EC",
    border: "#F5A8B4",
    gradFrom: "#E02845",
    gradTo: "#9E1530",
    onSoft: "#9E1530",
  },
  shop: {
    label: "Дэлгүүр",
    sub: "APM бүтээгдэхүүн",
    main: "#F18F01",
    soft: "#FFF3E0",
    border: "#FFCC80",
    gradFrom: "#FFAA22",
    gradTo: "#C87808",
    onSoft: "#A86006",
  },
  lessons: {
    label: "Сургалт",
    sub: "Бэлтгэл хичээл",
    main: "#1AABB8",
    soft: "#E0F6F8",
    border: "#8AD4DB",
    gradFrom: "#2BC4D0",
    gradTo: "#128A95",
    onSoft: "#0F7A84",
  },
  events: {
    label: "Арга хэмжээ",
    sub: "Бүртгэл, эвент",
    main: "#E8A800",
    soft: "#FFF8E0",
    border: "#F5D96A",
    gradFrom: "#F5C518",
    gradTo: "#C89000",
    onSoft: "#A87800",
  },
};

/** Хөтөлбөр бүрийн өнгө */
export const PROGRAM_COLORS: Record<ProgramId, ColorSwatch & { emoji: string }> = {
  edu: {
    emoji: "🎓",
    main: "#1AABB8",
    soft: "#E0F6F8",
    border: "#8AD4DB",
    gradFrom: "#2BC4D0",
    gradTo: "#128A95",
    onSoft: "#0F7A84",
  },
  and: {
    emoji: "🤝",
    main: "#7EC8B0",
    soft: "#E8F6F1",
    border: "#B5E0D2",
    gradFrom: "#8FD4BE",
    gradTo: "#4FA890",
    onSoft: "#3A8A74",
  },
  vclub: {
    emoji: "🌍",
    main: "#F18F01",
    soft: "#FFF3E0",
    border: "#FFCC80",
    gradFrom: "#FFAA22",
    gradTo: "#C87808",
    onSoft: "#A86006",
  },
};

export function programColorsByCode(code?: string): ColorSwatch {
  const key = (code || "").toLowerCase() as ProgramId;
  if (key in PROGRAM_COLORS) return PROGRAM_COLORS[key];
  return PROGRAM_COLORS.edu;
}

export function programColorsBySlug(slug?: string): ColorSwatch {
  return programColorsByCode(slug);
}

/** CSS gradient string for program headers / cards */
export function programGradient(code?: string): string {
  const c = programColorsByCode(code);
  return `linear-gradient(145deg, ${c.gradFrom}, ${c.gradTo})`;
}

export const BRAND_SURFACE = {
  bg: "#FFF9F8",
  bgElevated: "#FFFFFF",
  bgMuted: "#FFF0EE",
  bgTint: "#E8F7F8",
  border: "#F0DDD8",
  text: "#1A1418",
  textSecondary: "#5C4A4E",
  textTertiary: "#8A7478",
  primary: "#C41E3A",
  primarySoft: "#FDE8EC",
} as const;

/** 4 модулийн spectrum gradient (CSS) */
export const MODULE_SPECTRUM =
  "linear-gradient(90deg, #C41E3A 0%, #1AABB8 33%, #F18F01 66%, #F5C518 100%)";
