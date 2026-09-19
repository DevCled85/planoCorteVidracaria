import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Se já estiver rodando em standalone / instalado, não exibe
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        id="pwa-install-btn"
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-xs shadow-md shadow-cyan-500/20 transition-all cursor-pointer border border-cyan-400/30 active:scale-95"
        title="Instalar aplicativo no seu celular ou computador"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Instalar App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          id="pwa-ios-install-btn"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-medium text-xs border border-slate-700 transition cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Instalar no iPhone</span>
        </button>

        {showIOSGuide && (
          <div
            id="ios-pwa-modal"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
          >
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-5 shadow-2xl text-slate-100 relative">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-white">Instalar no iPhone / iPad</h3>
                  <p className="text-[11px] text-slate-400">Acesse em tela cheia como aplicativo</p>
                </div>
              </div>

              <ol className="space-y-2.5 text-xs text-slate-300 bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-cyan-400 shrink-0">1.</span>
                  <span>Toque no botão <strong>Compartilhar</strong> (ícone do quadrado com a seta para cima) na barra do Safari.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-cyan-400 shrink-0">2.</span>
                  <span>Role para baixo e toque em <strong>Adicionar à Tela de Início</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-cyan-400 shrink-0">3.</span>
                  <span>Toque em <strong>Adicionar</strong> no canto superior direito.</span>
                </li>
              </ol>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition shadow-sm"
              >
                Entendi
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
