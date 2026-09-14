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

  const currentSheet =
    optimization.sheets[activeSheetIndex] || optimization.sheets[0];

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

  return (
    <div
      id="printable-report-modal"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[95vh]">
        {/* Barra Superior da Janela de Impressão */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-white text-base">
              Relatório de Corte para Oficina & Mesa de Trabalho
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Agora (Ctrl+P)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
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
          {/* Cabeçalho da Empresa / Vidraçaria */}
          <div className="border-b-2 border-slate-900 pb-4 mb-4 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-950 uppercase">
                Vidraçaria • Ordem de Corte
              </h1>
              <p className="text-xs text-slate-600 font-medium">
                Plano de corte otimizado para aproveitamento máximo de chapa
              </p>
            </div>
            <div className="text-right text-xs text-slate-600">
              <div>Data: <strong>{currentDate}</strong></div>
              <div>
                Chapa:{' '}
                <strong>
                  {activeSheetIndex + 1} de {optimization.sheets.length}
                </strong>
              </div>
            </div>
          </div>

          {/* Dados Técnicos da Chapa */}
          <div className="grid grid-cols-4 gap-3 p-3 bg-slate-100 rounded-lg border border-slate-200 text-xs mb-4">
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
                {currentSheet?.width} × {currentSheet?.height} {sheetConfig.unit}
              </strong>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] font-bold uppercase">
                Área Total & Útil
              </span>
              <span className="text-slate-900 font-mono">
                {formatArea(currentSheet?.totalAreaM2 || 0)} (
                <strong className="text-emerald-700">
                  {formatArea(currentSheet?.usedAreaM2 || 0)}
                </strong>
                )
              </span>
            </div>

            <div>
              <span className="text-slate-500 block text-[10px] font-bold uppercase">
                Aproveitamento
              </span>
              <strong className="text-slate-950 font-mono text-sm">
                {currentSheet?.utilizationPercent.toFixed(1)}%
              </strong>
              <span className="text-[10px] text-slate-500 block">
                Folga: {sheetConfig.kerf} {sheetConfig.unit} | Refilo:{' '}
                {sheetConfig.margin} {sheetConfig.unit}
              </span>
            </div>
          </div>

          {/* Miniatura do Desenho Vetorial para Impressão */}
          {currentSheet && currentSheet.placedPieces.length > 0 && (
            <div className="mb-5 border border-slate-300 rounded-lg p-2 bg-slate-50">
              <div className="text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>Diagrama Visual de Corte da Chapa</span>
                <span className="text-[10px] font-normal text-slate-500">
                  {currentSheet.placedPieces.length} peças
                </span>
              </div>
              <svg
                viewBox={`0 0 ${currentSheet.width} ${currentSheet.height}`}
                className="w-full h-auto max-h-[320px] bg-white border border-slate-200"
              >
                {/* Chapa Base */}
                <rect
                  x="0"
                  y="0"
                  width={currentSheet.width}
                  height={currentSheet.height}
                  fill="#f8fafc"
                  stroke="#334155"
                  strokeWidth={Math.max(2, currentSheet.width * 0.0015)}
                />

                {/* Sobras */}
                {currentSheet.wasteAreas.map((waste) => (
                  <g key={waste.id}>
                    <rect
                      x={waste.x}
                      y={waste.y}
                      width={waste.width}
                      height={waste.height}
                      fill={waste.isUsable ? '#fef3c7' : '#e2e8f0'}
                      stroke="#94a3b8"
                      strokeWidth="1"
                    />
                    {waste.isUsable && waste.width > 200 && waste.height > 200 && (
                      <text
                        x={waste.x + waste.width / 2}
                        y={waste.y + waste.height / 2}
                        textAnchor="middle"
                        fill="#b45309"
                        fontSize={Math.max(12, currentSheet.width * 0.015)}
                        fontWeight="bold"
                      >
                        SOBRA: {Math.round(waste.width)} × {Math.round(waste.height)}
                      </text>
                    )}
                  </g>
                ))}

                {/* Peças */}
                {currentSheet.placedPieces.map((piece) => (
                  <g key={piece.id}>
                    <rect
                      x={piece.x}
                      y={piece.y}
                      width={piece.width}
                      height={piece.height}
                      fill={piece.color}
                      stroke="#0f172a"
                      strokeWidth={Math.max(1.5, currentSheet.width * 0.0012)}
                    />
                    <text
                      x={piece.x + piece.width / 2}
                      y={piece.y + piece.height / 2 - 4}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize={Math.max(10, Math.min(piece.width * 0.12, 22))}
                      fontWeight="bold"
                    >
                      #{piece.itemIndex} {piece.label}
                    </text>
                    <text
                      x={piece.x + piece.width / 2}
                      y={piece.y + piece.height / 2 + 14}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize={Math.max(9, Math.min(piece.width * 0.09, 18))}
                      fontWeight="600"
                    >
                      {Math.round(piece.width)} × {Math.round(piece.height)} {sheetConfig.unit}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          )}

          {/* Tabela de Conferência na Mesa de Corte com Checkbox */}
          <div className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              <span>Lista de Peças para Corte (Conferência na Mesa)</span>
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
                  {currentSheet?.placedPieces.map((piece) => (
                    <tr key={piece.id} className="hover:bg-slate-50">
                      <td className="p-2 text-center font-bold text-slate-900">
                        #{piece.itemIndex}
                      </td>
                      <td className="p-2 font-semibold text-slate-900 flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full border border-slate-400"
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

          {/* Lista de Retalhos Aproveitáveis */}
          {currentSheet?.wasteAreas.filter((w) => w.isUsable).length > 0 && (
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-950">
              <strong className="block font-bold text-amber-900 mb-1">
                ★ Sobras Úteis para Armazenamento (Retalhos de Vidraçaria):
              </strong>
              <div className="flex flex-wrap gap-3">
                {currentSheet.wasteAreas
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

          {/* Rodapé da Ordem */}
          <div className="mt-6 pt-3 border-t border-slate-300 flex justify-between items-center text-[10px] text-slate-500">
            <span>Sistema Vidraçaria • Plano de Corte Otimizado</span>
            <span>Assinatura do Vidraceiro: ______________________________</span>
          </div>
        </div>
      </div>
    </div>
  );
};
