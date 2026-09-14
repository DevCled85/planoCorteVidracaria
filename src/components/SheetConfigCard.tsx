import React from 'react';
import { Settings2, Layers, Check, RefreshCw } from 'lucide-react';
import { SheetConfig } from '../types';
import { STANDARD_SHEET_SIZES } from '../utils/presets';

interface SheetConfigCardProps {
  config: SheetConfig;
  onChange: (updated: Partial<SheetConfig>) => void;
}

export const SheetConfigCard: React.FC<SheetConfigCardProps> = ({
  config,
  onChange,
}) => {
  return (
    <div
      id="sheet-config-card"
      className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4"
    >
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">
              Dimensões da Chapa
            </h2>
            <p className="text-[11px] text-slate-400">
              Tamanho bruto do vidro ou espelho
            </p>
          </div>
        </div>

        {/* Botões Rápidos de Chapas Padrão */}
        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-cyan-400 border border-slate-700">
          {config.unit}
        </span>
      </div>

      {/* Dimensões Principais: Largura e Altura */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Largura ({config.unit})
          </label>
          <input
            id="input-sheet-width"
            type="number"
            min="10"
            max="10000"
            step="1"
            value={config.width}
            onChange={(e) =>
              onChange({ width: Math.max(1, Number(e.target.value) || 0) })
            }
            className="w-full px-3 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
            placeholder="Ex: 3210"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Altura ({config.unit})
          </label>
          <input
            id="input-sheet-height"
            type="number"
            min="10"
            max="10000"
            step="1"
            value={config.height}
            onChange={(e) =>
              onChange({ height: Math.max(1, Number(e.target.value) || 0) })
            }
            className="w-full px-3 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
            placeholder="Ex: 2200"
          />
        </div>
      </div>

      {/* Atalhos Rápidos de Tamanhos de Fábrica */}
      <div>
        <div className="text-[11px] font-medium text-slate-400 mb-1.5">
          Tamanhos padrão de vidraçaria:
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STANDARD_SHEET_SIZES.filter((s) => s.unit === config.unit).map((std) => (
            <button
              key={std.name}
              type="button"
              onClick={() =>
                onChange({
                  width: std.width,
                  height: std.height,
                })
              }
              className={`text-[11px] px-2.5 py-1 rounded-lg border transition font-medium ${
                config.width === std.width && config.height === std.height
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-semibold'
                  : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-700/80'
              }`}
            >
              {std.width} × {std.height}
            </button>
          ))}
        </div>
      </div>

      {/* Parâmetros Técnicos de Vidraceiro: Refilo, Espessura do Corte e Material */}
      <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">
            Margem de Refilo ({config.unit})
          </label>
          <input
            id="input-sheet-margin"
            type="number"
            min="0"
            max="100"
            step="1"
            value={config.margin}
            onChange={(e) =>
              onChange({ margin: Math.max(0, Number(e.target.value) || 0) })
            }
            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
            title="Margem de limpeza das bordas da chapa antes do corte"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">
            Folga / Risco ({config.unit})
          </label>
          <input
            id="input-sheet-kerf"
            type="number"
            min="0"
            max="20"
            step="0.5"
            value={config.kerf}
            onChange={(e) =>
              onChange({ kerf: Math.max(0, Number(e.target.value) || 0) })
            }
            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
            title="Espessura consumida pelo corte (0mm para diamante manual, 2-3mm serra/rebolo)"
          />
        </div>
      </div>

      {/* Descrição do Material */}
      <div>
        <label className="block text-[11px] font-medium text-slate-400 mb-1">
          Identificação do Material / Espessura
        </label>
        <input
          id="input-material-name"
          type="text"
          value={config.materialName}
          onChange={(e) => onChange({ materialName: e.target.value })}
          className="w-full px-3 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-500 placeholder-slate-500"
          placeholder="Ex: Espelho Prata 4mm, Vidro Incolor 6mm"
        />
      </div>
    </div>
  );
};
