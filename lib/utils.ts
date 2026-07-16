import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(input: string): string {
  const normalizeArabicDigits = (value: string) =>
    value
      // Arabic-Indic digits
      .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
      // Eastern Arabic-Indic digits
      .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06f0));

  const transliterateArabic = (value: string) => {
    // Map Arabic letters to Latin approximations
    const map: Record<string, string> = {
      أ: "a",
      إ: "i",
      آ: "a",
      ا: "a",
      ء: "a",
      ؤ: "u",
      ئ: "i",
      ب: "b",
      ت: "t",
      ث: "th",
      ج: "j",
      ح: "h",
      خ: "kh",
      د: "d",
      ذ: "dh",
      ر: "r",
      ز: "z",
      س: "s",
      ش: "sh",
      ص: "s",
      ض: "d",
      ط: "t",
      ظ: "z",
      ع: "a",
      غ: "gh",
      ف: "f",
      ق: "q",
      ك: "k",
      ل: "l",
      م: "m",
      ن: "n",
      ه: "h",
      و: "w",
      ي: "y",
      ى: "a",
      ة: "h",
      // Arabic-Indic digits already normalized above, but keep Latin digits as-is
    };

    // Convert tanween marks to 'n' before stripping diacritics
    value = value.replace(/[\u064B\u064C\u064D]/g, "n");

    // Remove other combining marks (harakat, shadda, sukun)
    value = value.normalize("NFKD").replace(/\p{M}+/gu, "");

    // Replace each Arabic letter using the map
    return value.replace(/[\u0600-\u06FF]/g, (ch) => map[ch] ?? "");
  };

  const latin = transliterateArabic(
    normalizeArabicDigits(input).toString().trim().toLowerCase()
  );

  return (
    latin
      // Replace non a-z0-9 with hyphen
      .replace(/[^a-z0-9]+/g, "-")
      // Trim hyphens
      .replace(/^-+|-+$/g, "")
      // Collapse repeats
      .replace(/-{2,}/g, "-")
  );
}

export function stripEmojis(text: string): string {
  if (!text) return "";
  return text
    .replace(/[\u{1F300}-\u{1F9FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F1E6}-\u{1F1FF}]|[\u{1F191}-\u{1F251}]|[\u{1F004}]|[\u{1F0CF}]|[\u{1F170}-\u{1F171}]|[\u{1F17E}-\u{1F17F}]|[\u{1F18E}]|[\u{3030}]|[\u{2B50}]|[\u{2B55}]|[\u{2934}-\u{2935}]|[\u{2B05}-\u{2B07}]|[\u{2B1B}-\u{2B1C}]|[\u{3297}]|[\u{3299}]|[\u{303D}]|[\u{00A9}]|[\u{00AE}]|[\u{2122}]/gu, "")
    .trim();
}
