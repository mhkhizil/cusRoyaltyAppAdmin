import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const LANGUAGE_OPTIONS = [
  { value: "en", labelKey: "language.english", shortLabel: "EN" },
  { value: "ko", labelKey: "language.korean", shortLabel: "KO" },
  { value: "my", labelKey: "language.myanmar", shortLabel: "MY" },
  { value: "zh-CN", labelKey: "language.chineseSimplified", shortLabel: "ZH" },
] as const;

function resolveSelectedLanguage(language?: string) {
  if (!language) return "en";
  if (language === "zh-CN" || language.startsWith("zh")) return "zh-CN";
  if (language.startsWith("ko")) return "ko";
  if (language.startsWith("my")) return "my";
  return "en";
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-4 w-4">
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentValue = resolveSelectedLanguage(
    i18n.resolvedLanguage ?? i18n.language
  );

  const currentOption =
    LANGUAGE_OPTIONS.find((opt) => opt.value === currentValue) ??
    LANGUAGE_OPTIONS[0];

  const handleSelect = (value: string) => {
    void i18n.changeLanguage(value);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      <span className="sr-only">{t("language.switchLanguage")}</span>
      <button
        type="button"
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:gap-2 sm:px-3 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        aria-label={t("language.switchLanguage")}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="sm:hidden">{currentOption.shortLabel}</span>
        <span className="hidden sm:inline">{t(currentOption.labelKey)}</span>
        <ChevronDownIcon />
      </button>

      {isOpen ? (
        <ul
          className="absolute right-0 z-30 mt-2 min-w-[10rem] overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
          role="listbox"
          aria-label={t("language.switchLanguage")}
        >
          {LANGUAGE_OPTIONS.map((option) => {
            const isSelected = option.value === currentValue;
            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                className={[
                  "cursor-pointer px-3 py-2 text-sm",
                  isSelected
                    ? "bg-slate-100 font-medium text-slate-900 dark:bg-slate-800 dark:text-white"
                    : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800",
                ].join(" ")}
                onClick={() => handleSelect(option.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelect(option.value);
                  }
                }}
                tabIndex={0}
              >
                {t(option.labelKey)}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
