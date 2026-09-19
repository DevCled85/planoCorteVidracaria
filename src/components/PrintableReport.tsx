import React from 'react';
import { Printer, X, CheckSquare, Layers, Scissors, Info } from 'lucide-react';
import { OptimizationResult, SheetConfig } from '../types';
import { formatArea } from '../utils/cutterEngine';

interface PrintableReportProps {
  isOpen: boolean;
  onClose: () => void;
  optimization: OptimizationResult;
  sheetConfig: SheetConfig;
  activeSheetIndex: number;
}

export const PrintableReport: React.FC<PrintableReportProps> = ({
  isOpen,
  onClose,
  optimization,
  sheetConfig,
  activeSheetIndex,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const sheetsToPrint = optimization.sheets.length > 0 ? optimization.sheets : [];

  return (
    <div
      id="printable-report-modal"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-800 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[95vh]">
        {/* Barra Superior da Janela de Impressão */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="font-bold text-white text-base">
                Relatório de Corte para Oficina & Mesa de Trabalho
              </h3>
              <p className="text-xs text-slate-400">
                {sheetsToPrint.length === 1
                  ? '1 chapa gerada'
                  : `Todas as ${sheetsToPrint.length} chapas geradas prontas para impressão`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir {sheetsToPrint.length > 1 ? `Todas as ${sheetsToPrint.length} Chapas` : 'Agora'} (Ctrl+P)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Conteúdo Imprimível do Relatório */}
        <div
          id="print-sheet-content"
          className="p-6 overflow-y-auto bg-white text-slate-900 print:p-0 print:m-0 print:w-full"
        >
          {/* Resumo Geral se houver múltiplas chapas */}
          {sheetsToPrint.length > 1 && (
            <div className="mb-6 p-4 bg-slate-900 text-white rounded-xl print:bg-slate-100 print:text-slate-900 print:border print:border-slate-300">
              <div className="flex justify-between items-center mb-2">
                <span className="font-black uppercase tracking-wider text-xs text-cyan-400 print:text-slate-900">
                  Resumo Geral do Projeto
                </span>
                <span className="text-xs text-slate-400 print:text-slate-600">
                  Data: {currentDate}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 print:text-slate-600 block text-[10px] uppercase">
                    Total de Chapas
                  </span>
                  <strong className="text-base text-cyan-300 print:text-slate-900">
                    {sheetsToPrint.length} chapas
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 print:text-slate-600 block text-[10px] uppercase">
                    Total de Peças
                  </span>
                  <strong className="text-base text-white print:text-slate-900">
                    {optimization.totalPlacedPieces} de {optimization.totalRequestedPieces} peças
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 print:text-slate-600 block text-[10px] uppercase">
                    Aproveitamento Geral
                  </span>
                  <strong className="text-base text-emerald-400 print:text-emerald-700">
                    {optimization.overallUtilizationPercent.toFixed(1)}%
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 print:text-slate-600 block text-[10px] uppercase">
                    Corte Linear Total
                  </span>
                  <strong className="text-base text-white print:text-slate-900">
                    {optimization.totalLinearCutMeters.toFixed(1)} m
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* Renderização de Cada Chapa Gerada */}
          {sheetsToPrint.map((sheet, sheetIdx) => {
            const pxToSvg = sheet.width / 650;
            const sheetNum = sheetIdx + 1;

            return (
              <div
                key={sheet.sheetIndex}
                className={`sheet-print-block ${
                  sheetIdx > 0 ? 'mt-8 pt-6 border-t-2 border-slate-300 print:pt-0 print:mt-0' : ''
                } print:break-after-page`}
                style={{ breakAfter: sheetIdx < sheetsToPrint.length - 1 ? 'page' : 'auto' }}
              >
                {/* Cabeçalho da Empresa / Vidraçaria */}
                <div className="border-b-2 border-slate-900 pb-3 mb-4 flex justify-between items-start">
                  <div>
                    <h1 className="text-xl font-black tracking-tight text-slate-950 uppercase">
                      Vidraçaria • Ordem de Corte
                    </h1>
                    <p className="text-xs text-slate-600 font-medium">
                      Plano de corte otimizado para aproveitamento máximo de chapa
                    </p>
                  </div>
                  <div className="text-right text-xs text-slate-600">
                    <div>Data: <strong>{currentDate}</strong></div>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">
                      Chapa {sheetNum} de {sheetsToPrint.length}
                    </div>
                  </div>
                </div>

                {/* Dados Técnicos da Chapa */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-100 rounded-lg border border-slate-200 text-xs mb-4">
                  <div>
                    <span className="text-slate-500 block text-[10px] font-bold uppercase">
                      Material / Espessura
                    </span>
                    <strong className="text-slate-900 text-sm">
                      {sheetConfig.materialName || 'Espelho / Vidro'}
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[10px] font-bold uppercase">
                      Dimensões da Chapa
                    </span>
                    <strong className="text-slate-900 font-mono text-sm">
                      {sheet.width} × {sheet.height} {sheetConfig.unit}
                    </strong>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[10px] font-bold uppercase">
                      Área Total & Útil
                    </span>
                    <span className="text-slate-900 font-mono">
                      {formatArea(sheet.totalAreaM2)} (
                      <strong className="text-emerald-700">
                        {formatArea(sheet.usedAreaM2)}
                      </strong>
                      )
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[10px] font-bold uppercase">
                      Aproveitamento
                    </span>
                    <strong className="text-slate-950 font-mono text-sm">
                      {sheet.utilizationPercent.toFixed(1)}%
                    </strong>
                    <span className="text-[10px] text-slate-500 block">
                      Folga: {sheetConfig.kerf} {sheetConfig.unit} | Refilo: {sheetConfig.margin} {sheetConfig.unit}
                    </span>
                  </div>
                </div>

                {/* Miniatura do Desenho Vetorial para Impressão com Textos Visíveis */}
                {sheet.placedPieces.length > 0 && (
                  <div className="mb-4 border border-slate-300 rounded-lg p-2 bg-slate-50">
                    <div className="text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span>Diagrama de Corte - Chapa #{sheetNum}</span>
                      <span className="text-[10px] font-normal text-slate-500">
                        {sheet.placedPieces.length} peças nesta chapa
                      </span>
                    </div>
                    <svg
                      viewBox={`0 0 ${sheet.width} ${sheet.height}`}
                      className="w-full h-auto max-h-[360px] bg-white border border-slate-200"
                    >
                      {/* Chapa Base */}
                      <rect
                        x="0"
                        y="0"
                        width={sheet.width}
                        height={sheet.height}
                        fill="#f8fafc"
                        stroke="#334155"
                        strokeWidth={Math.max(2, sheet.width * 0.0015)}
                      />

                      {/* Sobras com Medidas e Legibilidade Aumentada */}
                      {sheet.wasteAreas.map((waste) => {
                        const canShowWaste = waste.width > pxToSvg * 30 && waste.height > pxToSvg * 18;
                        const wTitleSize = Math.max(pxToSvg * 10, Math.min(pxToSvg * 15, Math.min(waste.width, waste.height) * 0.2));
                        const wDimSize = Math.max(pxToSvg * 9, Math.min(pxToSvg * 14, Math.min(waste.width, waste.height) * 0.18));
                        const hasRoomForDim = waste.height >= wTitleSize * 2.1;

                        return (
                          <g key={waste.id}>
                            <rect
                              x={waste.x}
                              y={waste.y}
                              width={waste.width}
                              height={waste.height}
                              fill={waste.isUsable ? '#fef3c7' : '#e2e8f0'}
                              stroke={waste.isUsable ? '#d97706' : '#94a3b8'}
                              strokeWidth={Math.max(1, pxToSvg * 0.8)}
                              strokeDasharray={waste.isUsable ? 'none' : '4,4'}
                            />
                            {canShowWaste && (
                              <g>
                                <text
                                  x={waste.x + waste.width / 2}
                                  y={hasRoomForDim ? waste.y + waste.height / 2 - wTitleSize * 0.45 : waste.y + waste.height / 2}
                                  textAnchor="middle"
                                  dominantBaseline="central"
                                  fill={waste.isUsable ? '#b45309' : '#64748b'}
                                  fontSize={wTitleSize}
                                  fontWeight="bold"
                                  fontFamily="JetBrains Mono, monospace"
                                >
                                  {waste.isUsable ? '★ RETALHO' : 'SOBRA'}
                                </text>
                                {hasRoomForDim && (
                                  <text
                                    x={waste.x + waste.width / 2}
                                    y={waste.y + waste.height / 2 + wDimSize * 0.65}
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    fill="#334155"
                                    fontSize={wDimSize}
                                    fontWeight="bold"
                                    fontFamily="JetBrains Mono, monospace"
                                  >
                                    {Math.round(waste.width)} × {Math.round(waste.height)} {sheetConfig.unit}
                                  </text>
                                )}
                              </g>
                            )}
                          </g>
                        );
                      })}

                      {/* Peças Posicionadas com Número Centralizado, Rótulo e Medidas Visíveis */}
                      {sheet.placedPieces.map((piece) => {
                        const minSide = Math.min(piece.width, piece.height);
                        const centerX = piece.x + piece.width / 2;
                        const centerY = piece.y + piece.height / 2;

                        const numSize = Math.max(pxToSvg * 11, Math.min(pxToSvg * 22, minSide * 0.3));
                        const titleSize = Math.max(pxToSvg * 9, Math.min(pxToSvg * 16, minSide * 0.2));
                        const dimSize = Math.max(pxToSvg * 8, Math.min(pxToSvg * 14, minSide * 0.18));
                        const hasRoom = piece.width >= pxToSvg * 45 && piece.height >= pxToSvg * 35;

                        return (
                          <g key={piece.id}>
                            <rect
                              x={piece.x}
                              y={piece.y}
                              width={piece.width}
                              height={piece.height}
                              fill={piece.color}
                              stroke="#0f172a"
                              strokeWidth={Math.max(1.5, pxToSvg * 1.2)}
                            />

                            {/* Badge do #número centralizado */}
                            {(() => {
                              const badgeW = Math.max(pxToSvg * 36, numSize * 2.3);
                              const badgeH = numSize * 1.35;
                              const badgeY = hasRoom ? centerY - titleSize * 0.9 - badgeH : centerY - badgeH / 2;

                              return (
                                <>
                                  <rect
                                    x={centerX - badgeW / 2}
                                    y={badgeY}
                                    width={badgeW}
                                    height={badgeH}
                                    rx={badgeH * 0.25}
                                    fill="#020617"
                                    stroke="#ffffff"
                                    strokeWidth={Math.max(1, pxToSvg * 0.8)}
                                  />
                                  <text
                                    x={centerX}
                                    y={badgeY + badgeH / 2}
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    fill="#ffffff"
                                    fontSize={numSize}
                                    fontWeight="900"
                                    fontFamily="JetBrains Mono, monospace"
                                  >
                                    #{piece.itemIndex}
                                  </text>
                                </>
                              );
                            })()}

                            {/* Nome e dimensões da peça */}
                            {hasRoom && (
                              <>
                                <text
                                  x={centerX}
                                  y={centerY + titleSize * 0.2}
                                  textAnchor="middle"
                                  dominantBaseline="central"
                                  fill="#ffffff"
                                  stroke="#020617"
                                  strokeWidth={Math.max(1.5, pxToSvg * 1.5)}
                                  paintOrder="stroke fill"
                                  fontSize={titleSize}
                                  fontWeight="bold"
                                  fontFamily="Plus Jakarta Sans, sans-serif"
                                >
                                  {piece.label.length > 18 ? `${piece.label.substring(0, 16)}…` : piece.label}
                                </text>
                                <text
                                  x={centerX}
                                  y={centerY + titleSize * 1.1 + dimSize * 0.3}
                                  textAnchor="middle"
                                  dominantBaseline="central"
                                  fill="#ffffff"
                                  stroke="#020617"
                                  strokeWidth={Math.max(1.5, pxToSvg * 1.5)}
                                  paintOrder="stroke fill"
                                  fontSize={dimSize}
                                  fontWeight="800"
                                  fontFamily="JetBrains Mono, monospace"
                                >
                                  {Math.round(piece.width)} × {Math.round(piece.height)} {sheetConfig.unit}
                                </text>
                              </>
                            )}
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                )}

                {/* Tabela de Conferência na Mesa de Corte para esta Chapa */}
                <div className="mb-4">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                    <span>Lista de Peças da Chapa #{sheetNum} (Conferência na Mesa)</span>
                  </h2>
                  <div className="border border-slate-300 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                          <th className="p-2 text-center w-12">Item</th>
                          <th className="p-2">Descrição da Peça</th>
                          <th className="p-2 text-center">Largura</th>
                          <th className="p-2 text-center">Altura</th>
                          <th className="p-2 text-center">Área Unitária</th>
                          <th className="p-2 text-center">Giro (90°)</th>
                          <th className="p-2 text-center w-24">Concluído</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {sheet.placedPieces.map((piece) => (
                          <tr key={piece.id} className="hover:bg-slate-50">
                            <td className="p-2 text-center font-bold text-slate-900">
                              #{piece.itemIndex}
                            </td>
                            <td className="p-2 font-semibold text-slate-900 flex items-center gap-2">
                              <span
                                className="w-3 h-3 rounded-full border border-slate-400 shrink-0"
                                style={{ backgroundColor: piece.color }}
                              />
                              <span>{piece.label}</span>
                            </td>
                            <td className="p-2 text-center font-mono font-bold">
                              {piece.width} {sheetConfig.unit}
                            </td>
                            <td className="p-2 text-center font-mono font-bold">
                              {piece.height} {sheetConfig.unit}
                            </td>
                            <td className="p-2 text-center font-mono text-slate-600">
                              {formatArea(
                                (piece.width * piece.height) /
                                  (sheetConfig.unit === 'cm' ? 10_000 : 1_000_000)
                              )}
                            </td>
                            <td className="p-2 text-center text-slate-600">
                              {piece.rotated ? 'Sim (Girada)' : 'Não'}
                            </td>
                            <td className="p-2 text-center">
                              <div className="w-5 h-5 border-2 border-slate-400 rounded mx-auto" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Lista de Retalhos Aproveitáveis desta Chapa */}
                {sheet.wasteAreas.filter((w) => w.isUsable).length > 0 && (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-950 mb-4">
                    <strong className="block font-bold text-amber-900 mb-1">
                      ★ Sobras Úteis para Armazenamento (Retalhos da Chapa #{sheetNum}):
                    </strong>
                    <div className="flex flex-wrap gap-3">
                      {sheet.wasteAreas
                        .filter((w) => w.isUsable)
                        .map((w, idx) => (
                          <span
                            key={w.id}
                            className="px-2 py-1 rounded bg-amber-100 border border-amber-300 font-mono font-bold"
                          >
                            Retalho #{idx + 1}: {Math.round(w.width)} × {Math.round(w.height)}{' '}
                            {sheetConfig.unit} ({formatArea(w.areaM2)})
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Rodapé da Ordem */}
          <div className="mt-6 pt-3 border-t border-slate-300 flex justify-between items-center text-[10px] text-slate-500">
            <span>Sistema Vidraçaria • Plano de Corte Otimizado ({sheetsToPrint.length} Chapa{sheetsToPrint.length > 1 ? 's' : ''})</span>
            <span>Assinatura do Vidraceiro: ______________________________</span>
          </div>
        </div>
      </div>
    </div>
  );
};
