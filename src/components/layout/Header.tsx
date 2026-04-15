import type { ReactNode } from 'react';
import { useLang } from '../../context/LanguageContext';
import { t } from '../../locales';

interface HeaderProps {
  children?: ReactNode;
}

export default function Header({ children }: HeaderProps) {
  const { lang, toggleLang } = useLang();

  return (
    <header className="bg-brand-dark text-white px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold tracking-wide">LEVER STYLE</h1>
        <span className="text-sm text-white/60">|</span>
        <span className="text-sm text-white/80">{t(lang, 'appTitle')}</span>
        {children && (
          <>
            <span className="text-sm text-white/60">|</span>
            {children}
          </>
        )}
      </div>
      <button
        onClick={toggleLang}
        className="text-sm px-3 py-1 rounded border border-white/30 hover:bg-white/10 transition-colors"
      >
        {lang === 'en' ? '中文' : 'EN'}
      </button>
    </header>
  );
}
