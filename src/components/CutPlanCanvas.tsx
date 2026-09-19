import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  Maximize2,
  Minimize2,
  Layers,
  Scissors,
  Tag,
  Info,
  ChevronLeft,
  ChevronRight,
  Eye,
  Check,
  Download,
  Pencil,
  X,
} from 'lucide-react';
import {
  CutPieceInput,
  OptimizationResult,
  PlacedPiece,
  SheetConfig,
  WasteArea,
} from '../types';
import { formatArea, formatDimension } from '../utils/cutterEngine';

interface CutPlanCanvasProps {
  optimization: OptimizationResult;
  sheetConfig: SheetConfig;
  activeSheetIndex: number;
  onSelectSheet: (index: number) => void;
  selectedPieceId: string | null;
  onSelectPiece: (pieceId: string | null) => void;
  onRotatePiece?: (pieceId: string) => void;
  pieces?: CutPieceInput[];
  onUpdatePiece?: (id: string, updated: Partial<CutPieceInput>) => void;
}

export const CutPlanCanvas: React.FC<CutPlanCanvasProps> = ({
  optimization,
  sheetConfig,
  activeSheetIndex,
  onSelectSheet,
  selectedPieceId,
  onSelectPiece,
  onRotatePiece,
  pieces,
  onUpdatePiece,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hasDragged, setHasDragged] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Filtros visuais
  const [showCutLines, setShowCutLines] = useState(true);
  const [showWasteInfo, setShowWasteInfo] = useState(true);
  const [showDimensions, setShowDimensions] = useState(true);
  const [hoveredPiece, setHoveredPiece] = useState<PlacedPiece | null>(null);

  // Edição rápida de dimensões direto no canvas inspector
  const [isEditingInspector, setIsEditingInspector] = useState(false);
  const [inspectorWidth, setInspectorWidth] = useState('');
  const [inspectorHeight, setInspectorHeight] = useState('');
  const [inspectorLabel, setInspectorLabel] = useState('');

  const currentSheet =
    optimization.sheets[activeSheetIndex] || optimization.sheets[0];

  // Dimensões do viewBox com margens de cotas integradas para visualização 100% sem zoom
  const sheetW = currentSheet ? currentSheet.width : sheetConfig.width;
  const sheetH = currentSheet ? currentSheet.height : sheetConfig.height;

  const maxDim = Math.max(sheetW, sheetH);
  const padLeft = maxDim * 0.085;
  const padTop = maxDim * 0.075;
  const padRight = maxDim * 0.035;
  const padBottom = maxDim * 0.035;
  const vbX = -padLeft;
  const vbY = -padTop;
  const vbWidth = sheetW + padLeft + padRight;
  const vbHeight = sheetH + padTop + padBottom;

  const rulerLineOffset = maxDim * 0.022;
  const rulerTextOffset = maxDim * 0.046;
  const rulerFontSize = Math.max(11, maxDim * 0.017);

  // Reset de Zoom e Pan
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev * 1.25, 5));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev / 1.25, 0.5));
  };

  // Drag & Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // apenas botão esquerdo
    setIsDragging(true);
    setHasDragged(false);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = Math.abs(e.clientX - dragStart.x - pan.x);
    const deltaY = Math.abs(e.clientY - dragStart.y - pan.y);
    if (deltaX > 4 || deltaY > 4) {
      setHasDragged(true);
    }
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Clicar fora de qualquer peça desfaz a seleção e esconde o popup de informações
  const handleCanvasClick = (e: React.MouseEvent) => {
    // Se o usuário estava apenas arrastando a chapa, não cancela a seleção
    if (hasDragged) return;

    // Se o clique foi no próprio card do inspetor ou dentro de seus controles, não fecha
    const target = e.target as HTMLElement;
    if (target.closest('#piece-inspector-card')) return;

    onSelectPiece(null);
    setHoveredPiece(null);
    setIsEditingInspector(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom((prev) => Math.min(Math.max(prev * zoomFactor, 0.4), 6));
  };

  // Alternar Fullscreen do canvas
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Exportar SVG como arquivo
  const handleExportSVG = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `plano-de-corte-chapa-${activeSheetIndex + 1}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
  };

  // Se não houver peças
  const hasPieces = currentSheet && currentSheet.placedPieces.length > 0;

  return (
    <div
      ref={containerRef}
      id="cut-plan-container"
      className={`flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden transition-all relative ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'w-full'
      }`}
    >
      {/* Barra de Controle Superior do Canvas */}
      <div
        id="canvas-toolbar"
        className="px-4 py-2.5 bg-slate-950/90 border-b border-slate-800/90 flex flex-wrap items-center justify-between gap-2 z-20 text-xs"
      >
        {/* Seletor de Chapas (se houver mais de 1) */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          {optimization.sheets.length > 1 ? (
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
              <span className="text-[11px] font-medium text-slate-400 px-1.5 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                Chapas:
              </span>
              {optimization.sheets.map((sheet, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectSheet(idx)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition flex items-center gap-1.5 ${
                    activeSheetIndex === idx
                      ? 'bg-cyan-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span>Chapa {idx + 1}</span>
                  <span
                    className={`text-[10px] px-1 py-0.2 rounded font-mono ${
                      activeSheetIndex === idx
                        ? 'bg-slate-950/20 text-slate-950'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {sheet.utilizationPercent.toFixed(0)}%
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>
                Chapa Única:{' '}
                <strong className="text-white">
                  {sheetW} × {sheetH} {sheetConfig.unit}
                </strong>
              </span>
              {sheetConfig.materialName && (
                <span className="text-slate-400 text-[11px] border-l border-slate-700 pl-2">
                  {sheetConfig.materialName}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Ferramentas de Visualização (Zoom, Linhas, Exportação) */}
        <div className="flex items-center flex-wrap gap-1.5">
          {/* Alternar Linhas de Corte */}
          <button
            type="button"
            onClick={() => setShowCutLines(!showCutLines)}
            className={`px-2 py-1 rounded-md border flex items-center gap-1 transition ${
              showCutLines
                ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 font-medium'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Alternar exibição das linhas de corte ponta a ponta"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cortes</span>
          </button>

          {/* Alternar Medidas */}
          <button
            type="button"
            onClick={() => setShowDimensions(!showDimensions)}
            className={`px-2 py-1 rounded-md border flex items-center gap-1 transition ${
              showDimensions
                ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 font-medium'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Exibir cotas e dimensões sobre as peças"
          >
            <Tag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Medidas</span>
          </button>

          {/* Alternar Sobras/Retalhos */}
          <button
            type="button"
            onClick={() => setShowWasteInfo(!showWasteInfo)}
            className={`px-2 py-1 rounded-md border flex items-center gap-1 transition ${
              showWasteInfo
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-medium'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Mostrar dimensões das sobras aproveitáveis"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Retalhos</span>
          </button>

          <div className="h-4 w-[1px] bg-slate-800 mx-1" />

          {/* Controles de Zoom */}
          <div className="inline-flex items-center bg-slate-900 rounded-lg border border-slate-800 p-0.5">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
              title="Reduzir Zoom"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 font-mono text-[11px] text-slate-300 select-none">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
              title="Aumentar Zoom"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 ml-0.5"
              title="Ajustar à Tela (100%)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Exportar SVG do Desenho */}
          <button
            type="button"
            onClick={handleExportSVG}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition"
            title="Exportar desenho vetorial em SVG"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Tela Cheia */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition"
            title={isFullscreen ? 'Sair da tela cheia' : 'Expandir em tela cheia'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Área Principal de Renderização Gráfica do SVG */}
      <div
        id="canvas-stage"
        className="relative flex-1 w-full min-h-[440px] md:min-h-[580px] bg-slate-950 cursor-grab active:cursor-grabbing overflow-hidden select-none flex items-center justify-center p-4"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onClick={handleCanvasClick}
      >
        {/* Padrão de mesa de corte de vidraçaria (grid sutil milimetrado no fundo) */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #06b6d4 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {!hasPieces ? (
          <div className="flex flex-col items-center justify-center text-center p-8 max-w-md z-10">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 shadow-lg">
              <Scissors className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              Plano de corte pronto para desenhar
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Adicione as peças de vidro ou espelho no formulário lateral, ou
              clique em <strong>"Exemplos Prontos"</strong> no topo para ver um
              plano de corte completo com cálculo de área e aproveitamento.
            </p>
          </div>
        ) : (
          <div
            className="w-full h-full transition-transform duration-75 origin-center will-change-transform flex items-center justify-center p-1 sm:p-2"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            }}
          >
            {/* SVG Vetorial de Alta Precisão 100% Enquadrado */}
            <svg
              ref={svgRef}
              id="sheet-svg"
              viewBox={`${vbX} ${vbY} ${vbWidth} ${vbHeight}`}
              preserveAspectRatio="xMidYMid meet"
              className="drop-shadow-2xl w-full h-full max-h-[68vh] md:max-h-[580px] rounded-lg bg-slate-900/90 select-none"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
              }}
            >
              <defs>
                {/* Padrão para sobra / desperdício (hatch diagonal elegante) */}
                <pattern
                  id="waste-pattern"
                  width="20"
                  height="20"
                  patternTransform="rotate(45 0 0)"
                  patternUnits="userSpaceOnUse"
                >
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="20"
                    stroke="#334155"
                    strokeWidth="1.5"
                    strokeOpacity="0.4"
                  />
                </pattern>

                {/* Padrão para sobra aproveitável */}
                <pattern
                  id="usable-waste-pattern"
                  width="24"
                  height="24"
                  patternTransform="rotate(45 0 0)"
                  patternUnits="userSpaceOnUse"
                >
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="24"
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                    strokeOpacity="0.25"
                  />
                </pattern>

                {/* Filtro de brilho sutil para seleção */}
                <filter id="glow-selection" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#38bdf8" floodOpacity="0.8" />
                </filter>
              </defs>

              {/* Fundo da Chapa Inteira (Borda e Estrutura) */}
              <rect
                x="0"
                y="0"
                width={sheetW}
                height={sheetH}
                fill="#0f172a"
                stroke="#475569"
                strokeWidth={Math.max(2, sheetW * 0.0015)}
              />

              {/* Margem de Refilo da Chapa (se configurado) */}
              {currentSheet.margin > 0 && (
                <rect
                  x={currentSheet.margin}
                  y={currentSheet.margin}
                  width={currentSheet.usableWidth}
                  height={currentSheet.usableHeight}
                  fill="none"
                  stroke="#64748b"
                  strokeWidth={Math.max(1, sheetW * 0.0008)}
                  strokeDasharray={`${sheetW * 0.008},${sheetW * 0.008}`}
                />
              )}

              {/* Áreas de Sobras / Retalhos */}
              {currentSheet.wasteAreas.map((waste) => {
                const wasteW = waste.width;
                const wasteH = waste.height;
                const wasteMinSide = Math.min(wasteW, wasteH);
                const wasteCenterX = waste.x + wasteW / 2;
                const wasteCenterY = waste.y + wasteH / 2;

                const pxToSvg = sheetW / 850;

                // Dimensões mínimas para exibir o badge informativo da sobra
                const canShowWaste =
                  showWasteInfo &&
                  wasteW >= pxToSvg * 40 &&
                  wasteH >= pxToSvg * 22;

                const wTitleSize = Math.max(
                  pxToSvg * 11,
                  Math.min(pxToSvg * 18, wasteMinSide * 0.24)
                );
                const wDimSize = Math.max(
                  pxToSvg * 10,
                  Math.min(pxToSvg * 16, wasteMinSide * 0.22)
                );

                const hasRoomForDim = wasteH >= wTitleSize * 2.2;
                const badgeW = Math.min(
                  wasteW * 0.95,
                  Math.max(
                    pxToSvg * 120,
                    wTitleSize * (waste.isUsable ? 9.5 : 5.8)
                  )
                );
                const badgeH = Math.min(
                  wasteH * 0.92,
                  hasRoomForDim
                    ? wTitleSize + wDimSize + pxToSvg * 14
                    : wTitleSize + pxToSvg * 8
                );

                return (
                  <g key={waste.id} className="waste-area-group">
                    <rect
                      x={waste.x}
                      y={waste.y}
                      width={waste.width}
                      height={waste.height}
                      fill={
                        waste.isUsable
                          ? 'url(#usable-waste-pattern)'
                          : 'url(#waste-pattern)'
                      }
                      stroke={waste.isUsable ? '#d97706' : '#334155'}
                      strokeWidth={Math.max(1.5, pxToSvg * 1.0)}
                      strokeDasharray={waste.isUsable ? 'none' : '6,6'}
                      opacity={0.85}
                    />

                    {/* Badge da Sobra com Dimensões e Legibilidade Aumentada */}
                    {canShowWaste && (
                      <g pointerEvents="none">
                        <rect
                          x={wasteCenterX - badgeW / 2}
                          y={wasteCenterY - badgeH / 2}
                          width={badgeW}
                          height={badgeH}
                          rx={Math.min(badgeH * 0.25, 8 * pxToSvg)}
                          fill="#020617"
                          fillOpacity="0.94"
                          stroke={waste.isUsable ? '#f59e0b' : '#64748b'}
                          strokeWidth={Math.max(1.5, pxToSvg * 1.2)}
                        />
                        <text
                          x={wasteCenterX}
                          y={
                            hasRoomForDim
                              ? wasteCenterY - wTitleSize * 0.45
                              : wasteCenterY
                          }
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill={waste.isUsable ? '#fbbf24' : '#94a3b8'}
                          fontSize={wTitleSize}
                          fontWeight="900"
                          fontFamily="JetBrains Mono, monospace"
                        >
                          {waste.isUsable ? '★ RETALHO ÚTIL' : 'SOBRA'}
                        </text>
                        {hasRoomForDim && (
                          <text
                            x={wasteCenterX}
                            y={wasteCenterY + wDimSize * 0.65}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fill="#ffffff"
                            fontSize={wDimSize}
                            fontWeight="bold"
                            fontFamily="JetBrains Mono, monospace"
                          >
                            {Math.round(waste.width)} × {Math.round(waste.height)}{' '}
                            {sheetConfig.unit}
                          </text>
                        )}
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Peças Cortadas Posicionadas */}
              {currentSheet.placedPieces.map((piece) => {
                const isSelected = selectedPieceId === piece.pieceId;
                const isHovered = hoveredPiece?.id === piece.id;

                const pxToSvg = sheetW / 850;

                // Coordenadas centrais da peça
                const minSide = Math.min(piece.width, piece.height);
                const centerX = piece.x + piece.width / 2;
                const centerY = piece.y + piece.height / 2;

                // Tamanhos dinâmicos de fonte proporcionais à tela para máxima legibilidade
                const numFontSize = Math.max(
                  pxToSvg * 12,
                  Math.min(pxToSvg * 24, minSide * 0.32)
                );
                const titleFontSize = Math.max(
                  pxToSvg * 10,
                  Math.min(pxToSvg * 18, minSide * 0.22)
                );
                const dimFontSize = Math.max(
                  pxToSvg * 9,
                  Math.min(pxToSvg * 16, minSide * 0.2)
                );

                const hasRoomForLabels =
                  piece.width >= pxToSvg * 28 && piece.height >= pxToSvg * 20;
                const hasRoomForStack =
                  piece.width >= pxToSvg * 60 && piece.height >= pxToSvg * 50;

                return (
                  <g
                    key={piece.id}
                    id={`svg-piece-${piece.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPiece(isSelected ? null : piece.pieceId);
                    }}
                    onMouseEnter={() => setHoveredPiece(piece)}
                    onMouseLeave={() => setHoveredPiece(null)}
                    className="cursor-pointer transition-transform"
                    filter={isSelected ? 'url(#glow-selection)' : undefined}
                  >
                    {/* Retângulo principal da peça */}
                    <rect
                      x={piece.x}
                      y={piece.y}
                      width={piece.width}
                      height={piece.height}
                      fill={piece.color}
                      fillOpacity={isSelected ? 0.95 : isHovered ? 0.9 : 0.82}
                      stroke={isSelected ? '#ffffff' : '#0f172a'}
                      strokeWidth={
                        isSelected
                          ? Math.max(3, pxToSvg * 2.5)
                          : Math.max(1.5, pxToSvg * 1.2)
                      }
                      rx={Math.min(6 * pxToSvg, minSide * 0.04)}
                      className="transition-all duration-150"
                    />

                    {/* Reflexo sutil de vidro na diagonal superior esquerda */}
                    <path
                      d={`M ${piece.x + 2} ${piece.y + 2} L ${
                        piece.x + Math.min(piece.width * 0.7, 50 * pxToSvg)
                      } ${piece.y + 2} L ${piece.x + 2} ${
                        piece.y + Math.min(piece.height * 0.7, 50 * pxToSvg)
                      } Z`}
                      fill="#ffffff"
                      fillOpacity="0.22"
                      pointerEvents="none"
                    />

                    {/* Botão Interativo de Rotacionar diretamente no Canvas (visível se selecionado ou hovered) */}
                    {(isSelected || isHovered) && onRotatePiece && hasRoomForLabels && (
                      <g
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRotatePiece(piece.pieceId);
                        }}
                      >
                        <circle
                          cx={piece.x + piece.width - Math.min(pxToSvg * 22, minSide * 0.22)}
                          cy={piece.y + Math.min(pxToSvg * 22, minSide * 0.22)}
                          r={Math.min(pxToSvg * 16, minSide * 0.18)}
                          fill="#0284c7"
                          stroke="#ffffff"
                          strokeWidth={Math.max(1.5, pxToSvg * 1.2)}
                        />
                        <text
                          x={piece.x + piece.width - Math.min(pxToSvg * 22, minSide * 0.22)}
                          y={piece.y + Math.min(pxToSvg * 22, minSide * 0.22)}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill="#ffffff"
                          fontSize={Math.max(pxToSvg * 11, minSide * 0.12)}
                          fontWeight="bold"
                        >
                          ↻
                        </text>
                      </g>
                    )}

                    {/* Indicador de Peça Rotacionada no canto */}
                    {piece.rotated && hasRoomForLabels && (
                      <g pointerEvents="none">
                        <rect
                          x={piece.x + 4 * pxToSvg}
                          y={piece.y + 4 * pxToSvg}
                          width={Math.min(pxToSvg * 50, minSide * 0.4)}
                          height={Math.min(pxToSvg * 22, minSide * 0.22)}
                          rx={3 * pxToSvg}
                          fill="#020617"
                          fillOpacity="0.85"
                        />
                        <text
                          x={piece.x + 4 * pxToSvg + Math.min(pxToSvg * 25, minSide * 0.2)}
                          y={piece.y + 4 * pxToSvg + Math.min(pxToSvg * 11, minSide * 0.11)}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill="#38bdf8"
                          fontSize={Math.max(pxToSvg * 9, minSide * 0.09)}
                          fontWeight="bold"
                          fontFamily="JetBrains Mono, monospace"
                        >
                          ↻ 90°
                        </text>
                      </g>
                    )}

                    {/* GRAFIA #NÚMERO DO CORTE CENTRALIZADO + Textos Visíveis */}
                    {hasRoomForLabels && (
                      <g pointerEvents="none">
                        {hasRoomForStack ? (
                          <>
                            {/* 1. Grafia #número do corte CENTRALIZADA no topo da pilha */}
                            {(() => {
                              const badgeW = Math.max(
                                pxToSvg * 48,
                                numFontSize * 2.5
                              );
                              const badgeH = numFontSize * 1.45;
                              const badgeY =
                                centerY -
                                titleFontSize * 1.15 -
                                badgeH;

                              return (
                                <>
                                  <rect
                                    x={centerX - badgeW / 2}
                                    y={badgeY}
                                    width={badgeW}
                                    height={badgeH}
                                    rx={badgeH * 0.28}
                                    fill="#020617"
                                    fillOpacity="0.94"
                                    stroke="#38bdf8"
                                    strokeWidth={Math.max(1.5, pxToSvg * 1.2)}
                                  />
                                  <text
                                    x={centerX}
                                    y={badgeY + badgeH / 2}
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    fill="#38bdf8"
                                    fontSize={numFontSize}
                                    fontWeight="900"
                                    fontFamily="JetBrains Mono, monospace"
                                  >
                                    #{piece.itemIndex}
                                  </text>
                                </>
                              );
                            })()}

                            {/* 2. Nome da Peça CENTRALIZADO com contorno escuro para contraste */}
                            <text
                              x={centerX}
                              y={
                                centerY +
                                (showDimensions
                                  ? titleFontSize * 0.15
                                  : titleFontSize * 0.4)
                              }
                              textAnchor="middle"
                              dominantBaseline="central"
                              fill="#ffffff"
                              stroke="#020617"
                              strokeWidth={Math.max(2, pxToSvg * 1.8)}
                              paintOrder="stroke fill"
                              strokeLinejoin="round"
                              fontSize={titleFontSize}
                              fontWeight="bold"
                              fontFamily="Plus Jakarta Sans, sans-serif"
                            >
                              {piece.label.length > 20
                                ? `${piece.label.substring(0, 18)}…`
                                : piece.label}
                            </text>

                            {/* 3. Dimensões CENTRALIZADAS com contorno escuro para contraste */}
                            {showDimensions && (
                              <text
                                x={centerX}
                                y={
                                  centerY +
                                  titleFontSize * 1.25 +
                                  dimFontSize * 0.25
                                }
                                textAnchor="middle"
                                dominantBaseline="central"
                                fill="#38bdf8"
                                stroke="#020617"
                                strokeWidth={Math.max(2, pxToSvg * 1.8)}
                                paintOrder="stroke fill"
                                strokeLinejoin="round"
                                fontSize={dimFontSize}
                                fontWeight="800"
                                fontFamily="JetBrains Mono, monospace"
                              >
                                {Math.round(piece.width)} ×{' '}
                                {Math.round(piece.height)} {sheetConfig.unit}
                              </text>
                            )}
                          </>
                        ) : (
                          /* Para peças menores: #número centralizado com badge no meio da peça */
                          (() => {
                            const badgeW = Math.max(
                              pxToSvg * 42,
                              numFontSize * 2.2
                            );
                            const badgeH = Math.min(
                              piece.height * 0.88,
                              numFontSize * 1.45
                            );
                            return (
                              <>
                                <rect
                                  x={centerX - badgeW / 2}
                                  y={centerY - badgeH / 2}
                                  width={badgeW}
                                  height={badgeH}
                                  rx={badgeH * 0.28}
                                  fill="#020617"
                                  fillOpacity="0.94"
                                  stroke="#38bdf8"
                                  strokeWidth={Math.max(1.5, pxToSvg * 1.2)}
                                />
                                <text
                                  x={centerX}
                                  y={centerY}
                                  textAnchor="middle"
                                  dominantBaseline="central"
                                  fill="#38bdf8"
                                  fontSize={numFontSize}
                                  fontWeight="900"
                                  fontFamily="JetBrains Mono, monospace"
                                >
                                  #{piece.itemIndex}
                                </text>
                              </>
                            );
                          })()
                        )}
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Linhas de Corte da Vidraçaria (Guilhotina / Risco de Diamante) */}
              {showCutLines && (
                <g id="svg-cut-lines" pointerEvents="none">
                  {currentSheet.cutLines.map((line) => (
                    <line
                      key={line.id}
                      x1={line.x1}
                      y1={line.y1}
                      x2={line.x2}
                      y2={line.y2}
                      stroke="#38bdf8"
                      strokeWidth={Math.max(1, sheetW * 0.0008)}
                      strokeDasharray={`${sheetW * 0.006},${sheetW * 0.006}`}
                      strokeOpacity="0.7"
                    />
                  ))}
                </g>
              )}

              {/* Cotas Externas da Chapa Inteira (Borda Superior e Esquerda) integradas no viewBox */}
              <g id="svg-sheet-rulers" pointerEvents="none">
                {/* Linha de Cota Superior (Largura) */}
                <line
                  x1="0"
                  y1={-rulerLineOffset}
                  x2={sheetW}
                  y2={-rulerLineOffset}
                  stroke="#94a3b8"
                  strokeWidth={Math.max(1.5, maxDim * 0.001)}
                />
                <text
                  x={sheetW / 2}
                  y={-rulerTextOffset}
                  textAnchor="middle"
                  fill="#e2e8f0"
                  fontSize={rulerFontSize}
                  fontWeight="bold"
                  fontFamily="JetBrains Mono, monospace"
                >
                  Largura: {sheetW} {sheetConfig.unit}
                </text>

                {/* Linha de Cota Esquerda (Altura) */}
                <line
                  x1={-rulerLineOffset}
                  y1="0"
                  x2={-rulerLineOffset}
                  y2={sheetH}
                  stroke="#94a3b8"
                  strokeWidth={Math.max(1.5, maxDim * 0.001)}
                />
                <text
                  x={-rulerTextOffset}
                  y={sheetH / 2}
                  textAnchor="middle"
                  transform={`rotate(-90, ${-rulerTextOffset}, ${sheetH / 2})`}
                  fill="#e2e8f0"
                  fontSize={rulerFontSize}
                  fontWeight="bold"
                  fontFamily="JetBrains Mono, monospace"
                >
                  Altura: {sheetH} {sheetConfig.unit}
                </text>
              </g>
            </svg>
          </div>
        )}

        {/* Painel Flutuante de Inspeção da Peça Selecionada (Aparece somente ao CLICAR em um corte) */}
        {selectedPieceId && (
          <div
            id="piece-inspector-card"
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-4 left-4 z-20 p-3 rounded-xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-md text-xs text-slate-200 max-w-xs animate-in fade-in slide-in-from-bottom-2 duration-150"
          >
            {(() => {
              const active = currentSheet?.placedPieces.find((p) => p.pieceId === selectedPieceId);

              if (!active) return null;

              const areaM2 = (active.width * active.height) / (sheetConfig.unit === 'cm' ? 10_000 : 1_000_000);

              const sourcePiece = pieces?.find((p) => p.id === active.pieceId);

              const handleStartInspectorEdit = () => {
                setIsEditingInspector(true);
                setInspectorLabel(sourcePiece?.label || active.label);
                setInspectorWidth((sourcePiece?.width ?? active.originalWidth).toString());
                setInspectorHeight((sourcePiece?.height ?? active.originalHeight).toString());
              };

              const handleSaveInspectorEdit = () => {
                if (!onUpdatePiece) return;
                const w = parseFloat(inspectorWidth);
                const h = parseFloat(inspectorHeight);
                if (isNaN(w) || w <= 0 || isNaN(h) || h <= 0) return;

                onUpdatePiece(active.pieceId, {
                  label: inspectorLabel.trim() || undefined,
                  width: w,
                  height: h,
                });
                setIsEditingInspector(false);
              };

              return (
                <div>
                  <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full ring-2 ring-white/30"
                        style={{ backgroundColor: active.color }}
                      />
                      <span className="font-bold text-white text-sm truncate max-w-[140px]">
                        #{active.itemIndex} {active.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {active.rotated ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
                          Girada 90°
                        </span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">
                          Original
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPiece(null);
                          setIsEditingInspector(false);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        title="Fechar painel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {isEditingInspector ? (
                    <div className="space-y-2 py-1">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Descrição</label>
                        <input
                          type="text"
                          value={inspectorLabel}
                          onChange={(e) => setInspectorLabel(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">
                            Largura ({sheetConfig.unit})
                          </label>
                          <input
                            type="number"
                            value={inspectorWidth}
                            onChange={(e) => setInspectorWidth(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                            min="1"
                            step="any"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">
                            Altura ({sheetConfig.unit})
                          </label>
                          <input
                            type="number"
                            value={inspectorHeight}
                            onChange={(e) => setInspectorHeight(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                            min="1"
                            step="any"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={handleSaveInspectorEdit}
                          className="flex-1 py-1 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1 transition shadow cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Salvar Dimensões</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingInspector(false)}
                          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                          title="Cancelar"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Corte no Plano (L × A):</span>
                          <strong className="font-mono text-cyan-300">
                            {active.width} × {active.height} {sheetConfig.unit}
                          </strong>
                        </div>

                        <div>
                          <span className="text-slate-400 block text-[10px]">Área Unitária:</span>
                          <strong className="font-mono text-emerald-400">
                            {formatArea(areaM2)}
                          </strong>
                        </div>

                        <div>
                          <span className="text-slate-400 block text-[10px]">Posição (X, Y):</span>
                          <span className="font-mono text-slate-300">
                            X: {Math.round(active.x)} | Y: {Math.round(active.y)}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-400 block text-[10px]">Dimensão Cadastro:</span>
                          <span className="font-mono text-slate-300">
                            {active.originalWidth} × {active.originalHeight} {sheetConfig.unit}
                          </span>
                        </div>
                      </div>

                      {/* Botões de Ação Direta: Editar e Girar Peça */}
                      <div className="mt-2.5 flex items-center gap-1.5">
                        {onUpdatePiece && (
                          <button
                            type="button"
                            onClick={handleStartInspectorEdit}
                            className="flex-1 py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-cyan-500/30 transition shadow cursor-pointer"
                            title="Editar dimensões desta peça"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Editar</span>
                          </button>
                        )}
                        {onRotatePiece && (
                          <button
                            type="button"
                            onClick={() => onRotatePiece(active.pieceId)}
                            className="flex-1 py-1.5 px-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow cursor-pointer"
                            title="Inverter largura e altura deste corte (90°)"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                            <span>Girar (90°)</span>
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Legenda Flutuante Rápida no Canto Inferior Direito */}
        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-xl text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-cyan-500" />
            <span>Peças Úteis</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-amber-500/80 border border-amber-400" />
            <span>Retalho Aproveitável</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-slate-700" />
            <span>Perda</span>
          </div>
        </div>
      </div>
    </div>
  );
};
