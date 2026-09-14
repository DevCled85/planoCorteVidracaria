import React, { useState } from 'react';
import {
  Layers,
  Printer,
  Sparkles,
  RotateCcw,
  SlidersHorizontal,
  FileSpreadsheet,
} from 'lucide-react';
import { DimensionUnit, SheetConfig } from '../types';
import { PRESET_PROJECTS, PresetProject } from '../utils/presets';

interface HeaderProps {
  sheetConfig: SheetConfig;
  onUpdateConfig: (config: Partial<SheetConfig>) => void;
  onLoadPreset: (preset: PresetProject) => void;
  onResetAll: () => void;
  onPrint: () => void;
  totalPieces: number;
}

export const Header: React.FC<HeaderProps> = ({
  sheetConfig,
  onUpdateConfig,
  onLoadPreset,
  onResetAll,
  onPrint,
  totalPieces,
}) => {
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);

  const toggleUnit = (unit: DimensionUnit) => {
    if (unit === sheetConfig.unit) return;
    // Conversão de valores ao trocar unidade
    const factor = unit === 'cm' ? 0.1 : 10;
    onUpdateConfig({
      unit,
      width: Math.round(sheetConfig.width * factor * 10) / 10,
      height: Math.round(sheetConfig.height * factor * 10) / 10,
      margin: Math.round(sheetConfig.margin * factor * 10) / 10,
      kerf: Math.round(sheetConfig.kerf * factor * 10) / 10,
    });
  };

  return (
    <header
      id="app-header"
      className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 px-4 lg:px-8 py-3 transition-colors"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Marca e Título */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-bold text-lg ring-1 ring-white/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Plano de Corte
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Vidraçaria & Espelhos
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              Otimizador de corte com redução de desperdício e cálculo de área
            </p>
          </div>
        </div>

        {/* Ações Rápidas do Topo */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Alternador de Unidade mm / cm */}
          <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-800/90 border border-slate-700/80 text-xs font-medium">
            <button
              id="btn-unit-mm"
              type="button"
              onClick={() => toggleUnit('mm')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                sheetConfig.unit === 'mm'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              mm
            </button>
            <button
              id="btn-unit-cm"
              type="button"
              onClick={() => toggleUnit('cm')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                sheetConfig.unit === 'cm'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              cm
            </button>
          </div>

          {/* Menu de Exemplos Prontos */}
          <div className="relative">
            <button
              id="btn-presets"
              type="button"
              onClick={() => setShowPresetsMenu(!showPresetsMenu)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Exemplos Prontos</span>
            </button>

            {showPresetsMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowPresetsMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 text-xs">
                  <div className="px-2 py-1.5 text-slate-400 font-semibold border-b border-slate-700/60 flex items-center justify-between">
                    <span>Carregar Modelo de Corte</span>
                    <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="mt-1 space-y-1">
                    {PRESET_PROJECTS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          onLoadPreset(preset);
                          setShowPresetsMenu(false);
                        }}
                        className="w-full text-left p-2 rounded-lg hover:bg-slate-700 transition text-slate-200 group"
                      >
                        <div className="font-semibold text-cyan-300 group-hover:text-cyan-200">
                          {preset.name}
                        </div>
                        <div className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                          {preset.description}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-2">
                          <span>
                            Chapa: {preset.sheetConfig.width} × {preset.sheetConfig.height} mm
                          </span>
                          <span>•</span>
                          <span>{preset.pieces.length} itens</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Botão de Impressão / Relatório da Oficina */}
          <button
            id="btn-print-report"
            type="button"
            onClick={onPrint}
            disabled={totalPieces === 0}
            className="px-3 py-1.5 rounded-lg bg-cyan-600/90 hover:bg-cyan-500 disabled:opacity-50 disabled:hover:bg-cyan-600/90 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shadow-sm"
            title="Imprimir plano de corte e tabela de conferência para mesa de corte"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Plano</span>
          </button>

          {/* Limpar / Reiniciar */}
          <button
            id="btn-reset-all"
            type="button"
            onClick={onResetAll}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/30 hover:text-rose-300 border border-slate-700 text-slate-400 transition-colors"
            title="Limpar peças e redefinir"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
