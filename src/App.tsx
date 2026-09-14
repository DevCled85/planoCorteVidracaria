import React, { useState, useMemo, useCallback } from 'react';
import { AlertCircle, CheckCircle, Scissors, Layers, Sparkles } from 'lucide-react';
import { CutPieceInput, SheetConfig } from './types';
import { optimizeCutPlan } from './utils/cutterEngine';
import { PRESET_PROJECTS, PresetProject } from './utils/presets';
import { getRandomUniqueColor } from './utils/colors';
import { Header } from './components/Header';
import { MetricsCards } from './components/MetricsCards';
import { CutPlanCanvas } from './components/CutPlanCanvas';
import { SheetConfigCard } from './components/SheetConfigCard';
import { PieceManager } from './components/PieceManager';
import { PrintableReport } from './components/PrintableReport';

export default function App() {
  // Inicializa com o preset elegante de espelhos residenciais
  const initialPreset = PRESET_PROJECTS[0];

  const [sheetConfig, setSheetConfig] = useState<SheetConfig>(initialPreset.sheetConfig);
  const [pieces, setPieces] = useState<CutPieceInput[]>(initialPreset.pieces);
  const [activeSheetIndex, setActiveSheetIndex] = useState<number>(0);
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  // Executa o motor de otimização de plano de corte
  const optimization = useMemo(() => {
    return optimizeCutPlan(sheetConfig, pieces);
  }, [sheetConfig, pieces]);

  // Se a chapa ativa for maior que o número de chapas geradas, ajusta para 0
  const validSheetIndex = Math.min(
    activeSheetIndex,
    Math.max(0, optimization.sheets.length - 1)
  );

  // Handlers para configuração da chapa
  const handleUpdateConfig = useCallback((updated: Partial<SheetConfig>) => {
    setSheetConfig((prev) => ({ ...prev, ...updated }));
  }, []);

  // Handlers para peças
  const handleAddPiece = useCallback((newPiece: CutPieceInput) => {
    setPieces((prev) => [...prev, newPiece]);
  }, []);

  const handleUpdatePiece = useCallback((id: string, updated: Partial<CutPieceInput>) => {
    setPieces((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );
  }, []);

  const handleDeletePiece = useCallback((id: string) => {
    setPieces((prev) => prev.filter((p) => p.id !== id));
    setSelectedPieceId((curr) => (curr === id ? null : curr));
  }, []);

  const handleDuplicatePiece = useCallback((piece: CutPieceInput) => {
    setPieces((prev) => {
      const uniqueColor = getRandomUniqueColor(prev.map((p) => p.color));
      const duplicated: CutPieceInput = {
        ...piece,
        id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        label: `${piece.label} (Cópia)`,
        color: uniqueColor,
      };
      return [...prev, duplicated];
    });
  }, []);

  // Rotacionar corte (inverter largura e altura da peça)
  const handleRotatePiece = useCallback((id: string) => {
    setPieces((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              width: p.height,
              height: p.width,
            }
          : p
      )
    );
  }, []);

  const handleClearAll = useCallback(() => {
    setPieces([]);
    setSelectedPieceId(null);
  }, []);

  // Carregar preset de vidraçaria
  const handleLoadPreset = useCallback((preset: PresetProject) => {
    setSheetConfig(preset.sheetConfig);
    setPieces(preset.pieces);
    setActiveSheetIndex(0);
    setSelectedPieceId(null);
  }, []);

  // Reiniciar
  const handleResetAll = useCallback(() => {
    handleLoadPreset(PRESET_PROJECTS[0]);
  }, [handleLoadPreset]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        sheetConfig={sheetConfig}
        onUpdateConfig={handleUpdateConfig}
        onLoadPreset={handleLoadPreset}
        onResetAll={handleResetAll}
        onPrint={() => setIsPrintModalOpen(true)}
        totalPieces={pieces.reduce((acc, p) => acc + p.quantity, 0)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 lg:p-6 flex flex-col gap-4">
        {/* Alerta de Peças que Não Couberam (se houver) */}
        {optimization.unplacedPieces.length > 0 && (
          <div
            id="unplaced-pieces-alert"
            className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3 shadow-md"
          >
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-amber-300">
                Atenção: Algumas peças não couberam na(s) chapa(s) disponível(is)!
              </div>
              <div className="text-slate-300 flex flex-wrap gap-2">
                {optimization.unplacedPieces.map(({ piece, unplacedCount }) => (
                  <span
                    key={piece.id}
                    className="px-2 py-0.5 rounded bg-amber-900/40 border border-amber-600/40 text-amber-200 font-mono text-[11px]"
                  >
                    {piece.label} ({piece.width} × {piece.height} {sheetConfig.unit}):{' '}
                    <strong>{unplacedCount} não alocada(s)</strong>
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-slate-400">
                Dica: Verifique se as dimensões da peça não ultrapassam o tamanho
                bruto da chapa menos as margens de refilo.
              </p>
            </div>
          </div>
        )}

        {/* Barra de Métricas de Aproveitamento e Área */}
        <MetricsCards
          optimization={optimization}
          sheetConfig={sheetConfig}
          activeSheetIndex={validSheetIndex}
        />

        {/* Grid de 2 Colunas: Formulários à esquerda & Plano Visual de Corte à direita */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Coluna Esquerda: Configuração da Chapa e Gerenciador de Peças */}
          <div className="lg:col-span-4 xl:col-span-4 flex flex-col gap-4">
            {/* Card Dimensões da Chapa */}
            <SheetConfigCard
              config={sheetConfig}
              onChange={handleUpdateConfig}
            />

            {/* Card Gerenciamento de Peças a Cortar */}
            <PieceManager
              pieces={pieces}
              unit={sheetConfig.unit}
              onAddPiece={handleAddPiece}
              onUpdatePiece={handleUpdatePiece}
              onDeletePiece={handleDeletePiece}
              onDuplicatePiece={handleDuplicatePiece}
              onRotatePiece={handleRotatePiece}
              onClearAll={handleClearAll}
              selectedPieceId={selectedPieceId}
              onSelectPiece={setSelectedPieceId}
            />
          </div>

          {/* Coluna Direita: Visualizador Gráfico Vetorial do Plano de Corte */}
          <div className="lg:col-span-8 xl:col-span-8 flex flex-col gap-4">
            <CutPlanCanvas
              optimization={optimization}
              sheetConfig={sheetConfig}
              activeSheetIndex={validSheetIndex}
              onSelectSheet={setActiveSheetIndex}
              selectedPieceId={selectedPieceId}
              onSelectPiece={setSelectedPieceId}
              onRotatePiece={handleRotatePiece}
            />
          </div>
        </div>
      </main>

      {/* Modal de Impressão e Ordem de Oficina */}
      <PrintableReport
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        optimization={optimization}
        sheetConfig={sheetConfig}
        activeSheetIndex={validSheetIndex}
      />
    </div>
  );
}
