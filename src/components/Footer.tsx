import React from 'react';
import { ShieldCheck, Tag } from 'lucide-react';
import { APP_VERSION, APP_AUTHOR, APP_NAME } from '../version';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      id="app-footer"
      className="no-print w-full mt-auto border-t border-slate-850 bg-slate-950/80 backdrop-blur-sm py-4 px-4 sm:px-6"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <ShieldCheck className="w-4 h-4 text-cyan-500 shrink-0" />
          <span>
            © {currentYear} <strong>{APP_NAME}</strong>. Todos os direitos reservados a{' '}
            <span className="text-cyan-400 font-semibold">{APP_AUTHOR}</span>.
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500">Versão:</span>
          <span
            id="app-version-badge"
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-slate-800/90 text-cyan-300 border border-slate-700/80 shadow-xs"
          >
            <Tag className="w-3 h-3 text-cyan-400" />
            v{APP_VERSION}
          </span>
        </div>
      </div>
    </footer>
  );
};
