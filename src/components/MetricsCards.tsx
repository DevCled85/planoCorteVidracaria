import React from 'react';
import {
  Maximize2,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Scissors,
  Layers,
} from 'lucide-react';
import { OptimizationResult, SheetConfig } from '../types';
import { formatArea } from '../utils/cutterEngine';

interface MetricsCardsProps {
  optimization: OptimizationResult;
  sheetConfig: SheetConfig;
  activeSheetIndex: number;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({
  optimization,
  sheetConfig,
  activeSheetIndex,
}) => {
  const currentSheet = optimization.sheets[activeSheetIndex] || optimization.sheets[0];

  const utilization = currentSheet ? currentSheet.utilizationPercent : 0;

  // Cor do aproveitamento
  const getUtilizationBadge = (pct: number) => {
    if (pct >= 85) {
      return {
        bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        bar: 'bg-emerald-500',
        label: 'Excelente Aproveitamento',
      };
    }
    if (pct >= 70) {
      return {
        bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
        bar: 'bg-cyan-500',
        label: 'Bom Aproveitamento',
      };
    }
    if (pct >= 50) {
      return {
        bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        bar: 'bg-amber-500',
        label: 'Aproveitamento Médio',
      };
    }
    return {
      bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      bar: 'bg-rose-500',
      label: 'Alto Desperdício',
    };
  };

  const badgeInfo = getUtilizationBadge(utilization);
  const usableWasteCount = currentSheet?.wasteAreas.filter((w) => w.isUsable).length || 0;

  return (
    <div
      id="metrics-overview"
      className="grid grid-cols-2 lg:grid-cols-5 gap-3"
    >
      {/* 1. Área Total da Chapa */}
      <div
        id="metric-sheet-area"
        className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 shadow-sm relative overflow-hidden group"
      >
        <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
          <span>Área da Chapa</span>
          <Maximize2 className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="text-xl font-bold text-white tracking-tight">
          {formatArea(currentSheet?.totalAreaM2 || 0)}
        </div>
        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5 font-mono">
          <span>
            {sheetConfig.width} × {sheetConfig.height} {sheetConfig.unit}
          </span>
          {sheetConfig.margin > 0 && (
            <span className="text-slate-500 text-[10px]">
              (refilo {sheetConfig.margin}{sheetConfig.unit})
            </span>
          )}
        </div>
      </div>

      {/* 2. Área Cortada (Útil) */}
      <div
        id="metric-used-area"
        className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 shadow-sm relative overflow-hidden"
      >
        <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
          <span>Área Cortada (Útil)</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="text-xl font-bold text-emerald-300 tracking-tight">
          {formatArea(currentSheet?.usedAreaM2 || 0)}
        </div>
        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
          <span className="font-semibold text-slate-200">
            {currentSheet?.placedPieces.length || 0}
          </span>
          <span>peças nesta chapa</span>
          {optimization.sheets.length > 1 && (
            <span className="text-[10px] text-cyan-400">
              ({optimization.totalPlacedPieces} no total)
            </span>
          )}
        </div>
      </div>

      {/* 3. Aproveitamento % */}
      <div
        id="metric-utilization"
        className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 shadow-sm relative overflow-hidden col-span-2 sm:col-span-1"
      >
        <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
          <span>Aproveitamento</span>
          <TrendingUp className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-extrabold text-white tracking-tight">
            {utilization.toFixed(1)}%
          </span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold border ${badgeInfo.bg}`}>
            {badgeInfo.label}
          </span>
        </div>
        {/* Barra de progresso visual */}
        <div className="w-full bg-slate-700/60 h-1.5 rounded-full mt-2 overflow-hidden">
          <div
            className={`h-full ${badgeInfo.bar} transition-all duration-500 rounded-full`}
            style={{ width: `${Math.min(100, Math.max(0, utilization))}%` }}
          />
        </div>
      </div>

      {/* 4. Sobras & Desperdício */}
      <div
        id="metric-waste-area"
        className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 shadow-sm relative overflow-hidden"
      >
        <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
          <span>Sobra & Desperdício</span>
          <AlertTriangle className="w-4 h-4 text-amber-400" />
        </div>
        <div className="text-xl font-bold text-amber-300 tracking-tight">
          {formatArea(currentSheet?.wasteAreaM2 || 0)}
        </div>
        <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
          <span>{(100 - utilization).toFixed(1)}% perda</span>
          {usableWasteCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {usableWasteCount} retalho{usableWasteCount > 1 ? 's' : ''} útil
            </span>
          )}
        </div>
      </div>

      {/* 5. Metros Lineares de Corte */}
      <div
        id="metric-cut-meters"
        className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 shadow-sm relative overflow-hidden"
      >
        <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
          <span>Metros de Corte</span>
          <Scissors className="w-4 h-4 text-purple-400" />
        </div>
        <div className="text-xl font-bold text-purple-300 tracking-tight">
          {optimization.totalLinearCutMeters.toFixed(1)} m
        </div>
        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
          <span>folga: {sheetConfig.kerf} {sheetConfig.unit}</span>
        </div>
      </div>
    </div>
  );
};
