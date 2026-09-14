import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Copy,
  RotateCw,
  Palette,
  Check,
  Maximize,
  Sparkles,
  Layers,
  ArrowLeftRight,
  Dices,
} from 'lucide-react';
import { CutPieceInput, DimensionUnit } from '../types';
import { PIECE_PALETTE, getRandomUniqueColor } from '../utils/colors';
import { formatArea } from '../utils/cutterEngine';

interface PieceManagerProps {
  pieces: CutPieceInput[];
  unit: DimensionUnit;
  onAddPiece: (piece: CutPieceInput) => void;
  onUpdatePiece: (id: string, updated: Partial<CutPieceInput>) => void;
  onDeletePiece: (id: string) => void;
  onDuplicatePiece: (piece: CutPieceInput) => void;
  onRotatePiece: (id: string) => void;
  onClearAll: () => void;
  selectedPieceId: string | null;
  onSelectPiece: (pieceId: string | null) => void;
}

export const PieceManager: React.FC<PieceManagerProps> = ({
  pieces,
  unit,
  onAddPiece,
  onUpdatePiece,
  onDeletePiece,
  onDuplicatePiece,
  onRotatePiece,
  onClearAll,
  selectedPieceId,
  onSelectPiece,
}) => {
  const [label, setLabel] = useState('');
  const [width, setWidth] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [allowRotation, setAllowRotation] = useState<boolean>(true);
  const [selectedColor, setSelectedColor] = useState<string>(() =>
    getRandomUniqueColor(pieces.map((p) => p.color))
  );

  // Inverter largura e altura no formulário
  const handleSwapDimensions = () => {
    const tempW = width;
    setWidth(height);
    setHeight(tempW);
  };

  // Sortear uma nova cor aleatória sem repetir nenhuma já usada
  const handleRandomizeColor = () => {
    setSelectedColor(getRandomUniqueColor(pieces.map((p) => p.color)));
  };

  const handleAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const w = parseFloat(width);
    const h = parseFloat(height);

    if (isNaN(w) || w <= 0 || isNaN(h) || h <= 0) {
      return;
    }

    const newPiece: CutPieceInput = {
      id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      label: label.trim() || `Peça ${pieces.length + 1}`,
      width: w,
      height: h,
      quantity: Math.max(1, quantity),
      allowRotation,
      color: selectedColor,
    };

    onAddPiece(newPiece);

    // Limpa campos e sorteia a PRÓXIMA cor aleatória sem repetir
    setLabel('');
    setWidth('');
    setHeight('');
    setQuantity(1);
    setSelectedColor(
      getRandomUniqueColor([...pieces.map((p) => p.color), newPiece.color])
    );
  };

  const totalPiecesCount = pieces.reduce((acc, p) => acc + p.quantity, 0);
  const totalPiecesAreaM2 = pieces.reduce((acc, p) => {
    const divisor = unit === 'cm' ? 10_000 : 1_000_000;
    return acc + ((p.width * p.height) / divisor) * p.quantity;
  }, 0);

  return (
    <div
      id="piece-manager-card"
      className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4"
    >
      {/* Cabeçalho do Card */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Plus className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">
              Peças a Cortar
            </h2>
            <p className="text-[11px] text-slate-400">
              Espelhos ou vidros com cores e medidas
            </p>
          </div>
        </div>

        {pieces.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-[11px] text-slate-400 hover:text-rose-400 transition"
          >
            Limpar lista
          </button>
        )}
      </div>

      {/* Formulário de Adição Rápida */}
      <form onSubmit={handleAdd} className="space-y-3">
        {/* Identificação / Etiqueta */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
            Descrição / Etiqueta da Peça
          </label>
          <input
            id="input-piece-label"
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Ex: Espelho Banheiro, Porta Box..."
            className="w-full px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 placeholder-slate-500"
          />
        </div>

        {/* Largura, Altura e Quantidade com botão de inversão */}
        <div className="grid grid-cols-12 gap-2 items-end">
          <div className="col-span-4">
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Largura ({unit}) *
            </label>
            <input
              id="input-piece-width"
              type="number"
              min="1"
              step="any"
              required
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              placeholder="Ex: 800"
              className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
            />
          </div>

          {/* Botão de Inverter L e A */}
          <div className="col-span-1 flex justify-center pb-1">
            <button
              type="button"
              onClick={handleSwapDimensions}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-400 border border-slate-700 transition"
              title="Inverter Largura e Altura (Rotacionar 90°)"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="col-span-4">
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Altura ({unit}) *
            </label>
            <input
              id="input-piece-height"
              type="number"
              min="1"
              step="any"
              required
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="Ex: 600"
              className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
            />
          </div>

          <div className="col-span-3">
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Qtd *
            </label>
            <input
              id="input-piece-quantity"
              type="number"
              min="1"
              max="500"
              required
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))
              }
              className="w-full px-2 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white font-mono text-xs text-center focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Opção de Giro e Cor da Peça */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          {/* Checkbox Rotação Automática */}
          <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-300 select-none">
            <input
              type="checkbox"
              checked={allowRotation}
              onChange={(e) => setAllowRotation(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500/40 bg-slate-800"
            />
            <span className="flex items-center gap-1">
              <RotateCw className="w-3 h-3 text-cyan-400" />
              Permitir auto-giro
            </span>
          </label>

          {/* Seletor de Cores com Botão de Sorteio Aleatório */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400">Cor:</span>
            <div
              className="w-4 h-4 rounded-full border border-white/40 shadow-sm"
              style={{ backgroundColor: selectedColor }}
              title="Cor atual sorteada"
            />
            <button
              type="button"
              onClick={handleRandomizeColor}
              className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[10px] text-cyan-300 flex items-center gap-1 transition"
              title="Sortear outra cor aleatória sem repetir"
            >
              <Dices className="w-3 h-3 text-cyan-400" />
              <span>Sortear</span>
            </button>
            <div className="flex items-center gap-1 overflow-x-auto p-0.5 max-w-[120px]">
              {PIECE_PALETTE.slice(0, 5).map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={`w-3.5 h-3.5 rounded-full transition-transform flex items-center justify-center shrink-0 ${
                    selectedColor.toLowerCase() === color.value.toLowerCase()
                      ? 'scale-125 ring-2 ring-white shadow-md'
                      : 'hover:scale-110 opacity-80'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {selectedColor.toLowerCase() === color.value.toLowerCase() && (
                    <Check className="w-2 h-2 text-white stroke-[3]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Botão de Adicionar Peça */}
        <button
          id="btn-add-piece"
          type="submit"
          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-cyan-500/15 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Peça ao Corte</span>
        </button>
      </form>

      {/* Lista de Peças Cadastradas */}
      <div className="pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="font-semibold text-slate-300">
            Lista de Peças ({totalPiecesCount} unid.)
          </span>
          <span className="font-mono text-cyan-400 text-[11px]">
            {formatArea(totalPiecesAreaM2)} total
          </span>
        </div>

        {pieces.length === 0 ? (
          <div className="p-6 text-center rounded-xl bg-slate-950/50 border border-slate-800/60 text-slate-500 text-xs">
            Nenhuma peça cadastrada ainda.
            <br />
            Preencha os campos acima para adicionar.
          </div>
        ) : (
          <div className="space-y-1.5 max-h-[290px] overflow-y-auto pr-1">
            {pieces.map((piece, index) => {
              const isSelected = selectedPieceId === piece.id;
              const pieceAreaM2 =
                (piece.width * piece.height * piece.quantity) /
                (unit === 'cm' ? 10_000 : 1_000_000);

              return (
                <div
                  key={piece.id}
                  id={`piece-item-${piece.id}`}
                  onClick={() => onSelectPiece(isSelected ? null : piece.id)}
                  className={`p-2 rounded-xl border transition-all flex items-center justify-between gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 border-cyan-500 shadow-md ring-1 ring-cyan-500/40'
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700'
                  }`}
                >
                  {/* Identificador com Bolinha de Cor e Nome */}
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 ring-1 ring-white/20"
                      style={{ backgroundColor: piece.color }}
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-white truncate max-w-[130px]">
                        {piece.label}
                      </div>
                      <div className="text-[11px] font-mono text-cyan-300 flex items-center gap-1.5">
                        <span>
                          {piece.width} × {piece.height} {unit}
                        </span>
                        {piece.allowRotation && (
                          <span
                            className="text-[9px] text-slate-400"
                            title="Rotação autorizada"
                          >
                            (↻)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quantidade e Ações */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Badge de Quantidade */}
                    <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (piece.quantity > 1) {
                            onUpdatePiece(piece.id, {
                              quantity: piece.quantity - 1,
                            });
                          } else {
                            onDeletePiece(piece.id);
                          }
                        }}
                        className="px-1.5 py-0.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800"
                        title="Diminuir"
                      >
                        -
                      </button>
                      <span className="px-1.5 text-xs font-mono font-bold text-white">
                        {piece.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdatePiece(piece.id, {
                            quantity: piece.quantity + 1,
                          });
                        }}
                        className="px-1.5 py-0.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800"
                        title="Aumentar"
                      >
                        +
                      </button>
                    </div>

                    {/* Rotacionar Corte (Inverter Largura x Altura) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRotatePiece(piece.id);
                      }}
                      className="p-1 rounded-md text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition"
                      title="Girar corte 90° (inverter largura e altura)"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>

                    {/* Alternar permissão de auto-rotação */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdatePiece(piece.id, {
                          allowRotation: !piece.allowRotation,
                        });
                      }}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono border transition ${
                        piece.allowRotation
                          ? 'border-cyan-500/30 text-cyan-300 bg-cyan-500/10'
                          : 'border-slate-700 text-slate-500 bg-slate-900'
                      }`}
                      title={
                        piece.allowRotation
                          ? 'Auto-giro ativado pelo otimizador (clique para fixar orientação)'
                          : 'Orientação travada (clique para permitir que o otimizador gire se necessário)'
                      }
                    >
                      {piece.allowRotation ? 'Auto' : 'Fixo'}
                    </button>

                    {/* Duplicar Peça */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicatePiece(piece);
                      }}
                      className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
                      title="Duplicar peça"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {/* Excluir Peça */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePiece(piece.id);
                      }}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                      title="Excluir peça"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
