import { copy, isLocaleAvailable, locale, localeNames, locales, setLocale } from '../content';

/** Compact language control. Locales not in `availableLocales` stay visible but disabled. */
export function LanguageSwitch({
  label,
  unavailableLabel,
}: {
  label?: string;
  unavailableLabel?: string;
} = {}) {
  const groupLabel = label || copy.nav.language || 'Language';
  const unavailable = unavailableLabel ?? copy.nav.languageUnavailable;
  return (
    <div className="lang-switch" role="group" aria-label={groupLabel}>
      {locales.map((id) => {
        const available = isLocaleAvailable(id);
        const current = id === locale;
        return (
          <button
            key={id}
            type="button"
            className="lang-switch__option"
            lang={id}
            aria-pressed={current}
            aria-current={current ? 'true' : undefined}
            disabled={!available}
            title={available ? undefined : unavailable}
            onClick={() => setLocale(id)}
          >
            {localeNames[id]}
          </button>
        );
      })}
    </div>
  );
}
