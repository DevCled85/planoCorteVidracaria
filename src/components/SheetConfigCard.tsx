import React, { useState, useEffect } from 'react';
import { Settings2, Layers, Check, RefreshCw, BookmarkPlus, X } from 'lucide-react';
import { SheetConfig, DimensionUnit } from '../types';
import { STANDARD_SHEET_SIZES } from '../utils/presets';

interface CustomSheetSize {
  name: string;
  width: number;
  height: number;
  unit: DimensionUnit;
}

const LOCAL_STORAGE_CUSTOM_SIZES = 'plano_corte_custom_sheet_sizes';

interface SheetConfigCardProps {
  config: SheetConfig;
  onChange: (updated: Partial<SheetConfig>) => void;
}

export const SheetConfigCard: React.FC<SheetConfigCardProps> = ({
  config,
  onChange,
}) => {
  // Carrega tamanhos personalizados salvos pelo usuário no navegador
  const [customSizes, setCustomSizes] = useState<CustomSheetSize[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CUSTOM_SIZES);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Salvar tamanhos customizados no localStorage sempre que mudar
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_CUSTOM_SIZES, JSON.stringify(customSizes));
    } catch (e) {
      console.error(e);
    }
  }, [customSizes]);

  // Lista combinada de tamanhos de fábrica + tamanhos salvos pelo vidraceiro
  const allSizes: CustomSheetSize[] = [
    ...STANDARD_SHEET_SIZES,
    ...customSizes,
  ];

  // Filtra pelos tamanhos da unidade atual (mm ou cm)
  const availableSizes = allSizes.filter((s) => s.unit === config.unit);

  // Verifica se a dimensão atual já existe na lista de padrões
  const isCurrentSizeSaved = availableSizes.some(
    (s) => s.width === config.width && s.height === config.height
  );

  // Função para salvar o tamanho atual como novo padrão de vidraçaria
  const handleSaveCurrentAsStandard = () => {
    if (isCurrentSizeSaved || config.width <= 0 || config.height <= 0) return;

    const newEntry: CustomSheetSize = {
      name: `Chapa ${config.width} × ${config.height} ${config.unit}`,
      width: config.width,
      height: config.height,
      unit: config.unit,
    };

    setCustomSizes((prev) => [...prev, newEntry]);
  };

  // Remover um tamanho customizado
  const handleRemoveCustomSize = (width: number, height: number, unit: DimensionUnit) => {
    setCustomSizes((prev) =>
      prev.filter((s) => !(s.width === width && s.height === height && s.unit === unit))
    );
  };
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

      {/* Atalhos Rápidos de Tamanhos de Vidraçaria */}
      <div>
        <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 mb-1.5">
          <span>Tamanhos padrão de vidraçaria:</span>
          {!isCurrentSizeSaved && config.width > 0 && config.height > 0 && (
            <button
              type="button"
              onClick={handleSaveCurrentAsStandard}
              className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 px-2 py-0.5 rounded-md border border-cyan-500/30 transition cursor-pointer"
              title="Salvar tamanho atual como padrão de vidraçaria permanente"
            >
              <BookmarkPlus className="w-3 h-3" />
              <span>Salvar {config.width}×{config.height} como padrão</span>
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {availableSizes.map((std) => {
            const isSelected = config.width === std.width && config.height === std.height;
            const isCustom = customSizes.some(
              (c) => c.width === std.width && c.height === std.height && c.unit === std.unit
            );

            return (
              <div key={`${std.width}-${std.height}-${std.unit}`} className="relative group">
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      width: std.width,
                      height: std.height,
                    })
                  }
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition font-medium flex items-center gap-1 cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-semibold shadow-sm'
                      : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-700/80'
                  }`}
                  title={std.name}
                >
                  <span>{std.width} × {std.height}</span>
                  {isCustom && (
                    <span className="text-[9px] text-amber-400 font-mono" title="Tamanho salvo por você">★</span>
                  )}
                </button>

                {/* Excluir tamanho customizado se foi criado pelo usuário */}
                {isCustom && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveCustomSize(std.width, std.height, std.unit);
                    }}
                    className="absolute -top-1 -right-1 hidden group-hover:flex w-3.5 h-3.5 rounded-full bg-rose-600 text-white items-center justify-center text-[8px] shadow cursor-pointer"
                    title="Remover este tamanho padrão"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}
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
