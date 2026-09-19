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
  Pencil,
  X,
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

  // Estados para modo de edição de peça existente
  const [editingPieceId, setEditingPieceId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState<string>('');
  const [editWidth, setEditWidth] = useState<string>('');
  const [editHeight, setEditHeight] = useState<string>('');
  const [editQuantity, setEditQuantity] = useState<number>(1);
  const [editAllowRotation, setEditAllowRotation] = useState<boolean>(true);
  const [editColor, setEditColor] = useState<string>('');

  // Rastreia unidade anterior para converter valores que estejam sendo digitados no formulário
  const prevUnitRef = React.useRef<DimensionUnit>(unit);

  useEffect(() => {
    if (prevUnitRef.current !== unit) {
      const factor = unit === 'cm' ? 0.1 : 10;
      const convertStr = (valStr: string) => {
        const n = parseFloat(valStr);
        if (isNaN(n) || n <= 0) return valStr;
        return (Math.round(n * factor * 100) / 100).toString();
      };

      if (width) setWidth((prev) => convertStr(prev));
      if (height) setHeight((prev) => convertStr(prev));
      if (editWidth) setEditWidth((prev) => convertStr(prev));
      if (editHeight) setEditHeight((prev) => convertStr(prev));

      prevUnitRef.current = unit;
    }
  }, [unit, width, height, editWidth, editHeight]);

  const handleStartEdit = (piece: CutPieceInput) => {
    setEditingPieceId(piece.id);
    setEditLabel(piece.label);
    setEditWidth(piece.width.toString());
    setEditHeight(piece.height.toString());
    setEditQuantity(piece.quantity);
    setEditAllowRotation(piece.allowRotation ?? true);
    setEditColor(piece.color);
  };

  const handleCancelEdit = () => {
    setEditingPieceId(null);
  };

  const handleSaveEdit = (id: string) => {
    const w = parseFloat(editWidth);
    const h = parseFloat(editHeight);
    if (isNaN(w) || w <= 0 || isNaN(h) || h <= 0) return;

    onUpdatePiece(id, {
      label: editLabel.trim() || undefined,
      width: w,
      height: h,
      quantity: Math.max(1, editQuantity),
      allowRotation: editAllowRotation,
      color: editColor,
    });
    setEditingPieceId(null);
  };

  const handleSwapEditDimensions = () => {
    const temp = editWidth;
    setEditWidth(editHeight);
    setEditHeight(temp);
  };

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
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
            {pieces.map((piece, index) => {
              const isSelected = selectedPieceId === piece.id;
              const isEditing = editingPieceId === piece.id;
              const pieceSingleAreaM2 =
                (piece.width * piece.height) / (unit === 'cm' ? 10_000 : 1_000_000);
              const pieceTotalAreaM2 = pieceSingleAreaM2 * piece.quantity;

              if (isEditing) {
                return (
                  <div
                    key={piece.id}
                    id={`piece-item-editing-${piece.id}`}
                    className="p-3.5 rounded-2xl border-2 border-cyan-500/80 bg-slate-900/95 shadow-xl space-y-3 ring-2 ring-cyan-500/20"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0 ring-2 ring-white/40 shadow-sm"
                          style={{ backgroundColor: editColor }}
                        />
                        <span className="text-xs font-bold text-cyan-300">
                          Editar Dimensões da Peça #{index + 1}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(piece.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 transition shadow cursor-pointer"
                          title="Salvar alterações"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Salvar</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                          title="Cancelar edição"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Descrição / Rótulo */}
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 font-medium">
                        Identificação / Nome
                      </label>
                      <input
                        type="text"
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        placeholder="Ex: Vidro Fixo, Porta Esquerda, etc."
                        className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>

                    {/* Largura × Altura com botão Inverter */}
                    <div className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <label className="text-[10px] text-slate-400 block mb-1 font-medium">
                          Largura ({unit})
                        </label>
                        <input
                          type="number"
                          value={editWidth}
                          onChange={(e) => setEditWidth(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-cyan-500"
                          min="1"
                          step="any"
                        />
                      </div>

                      <div className="col-span-2 flex justify-center pt-4">
                        <button
                          type="button"
                          onClick={handleSwapEditDimensions}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 transition"
                          title="Inverter Largura e Altura"
                        >
                          <ArrowLeftRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="col-span-5">
                        <label className="text-[10px] text-slate-400 block mb-1 font-medium">
                          Altura ({unit})
                        </label>
                        <input
                          type="number"
                          value={editHeight}
                          onChange={(e) => setEditHeight(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-cyan-500"
                          min="1"
                          step="any"
                        />
                      </div>
                    </div>

                    {/* Quantidade e Permissão de Rotação */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
                      <div className="flex items-center gap-2">
                        <label className="text-[11px] text-slate-300 font-medium">Quantidade:</label>
                        <input
                          type="number"
                          value={editQuantity}
                          onChange={(e) =>
                            setEditQuantity(Math.max(1, parseInt(e.target.value) || 1))
                          }
                          className="w-16 bg-slate-950 border border-slate-700/80 rounded-lg px-2 py-1 text-xs text-white font-mono font-bold text-center focus:outline-none focus:border-cyan-500"
                          min="1"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => setEditAllowRotation(!editAllowRotation)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition ${
                          editAllowRotation
                            ? 'border-cyan-500/40 text-cyan-300 bg-cyan-500/15'
                            : 'border-slate-700 text-slate-400 bg-slate-950'
                        }`}
                        title="Permitir rotação automática pelo otimizador"
                      >
                        {editAllowRotation ? '↻ Rotação Permitida' : '🔒 Rotação Fixa'}
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={piece.id}
                  id={`piece-item-${piece.id}`}
                  onClick={() => onSelectPiece(isSelected ? null : piece.id)}
                  className={`group relative p-2.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/95 border-cyan-400 shadow-lg ring-1 ring-cyan-400/50'
                      : 'bg-slate-950/70 border-slate-800/90 hover:bg-slate-800/70 hover:border-slate-700'
                  }`}
                >
                  {/* Linha 1: Marcador de cor, Índice, Nome e Badges de Status */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 ring-2 ring-white/30 shadow-sm"
                        style={{ backgroundColor: piece.color }}
                      />
                      <span className="text-[11px] font-mono font-bold text-slate-400 shrink-0">
                        #{index + 1}
                      </span>
                      <span className="font-bold text-xs text-white truncate max-w-[140px] tracking-tight">
                        {piece.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono border transition ${
                          piece.allowRotation
                            ? 'border-cyan-500/30 text-cyan-300 bg-cyan-500/10'
                            : 'border-slate-700 text-slate-400 bg-slate-900'
                        }`}
                        title={
                          piece.allowRotation
                            ? 'Otimizador pode rotacionar para melhor aproveitamento'
                            : 'Orientação travada pelo usuário'
                        }
                      >
                        {piece.allowRotation ? '↻ Auto' : '🔒 Fixo'}
                      </span>

                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        {formatArea(pieceTotalAreaM2)}
                      </span>
                    </div>
                  </div>

                  {/* Linha 2: Dimensões em destaque e Barra de Ferramentas / Quantidade */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
                    {/* Dimensões em destaque */}
                    <div className="flex items-center gap-2">
                      <div className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-sm">
                        <span>{piece.width}</span>
                        <span className="text-cyan-500 text-[10px]">×</span>
                        <span>{piece.height}</span>
                        <span className="text-[10px] text-cyan-400 font-sans font-normal ml-0.5">
                          {unit}
                        </span>
                      </div>
                    </div>

                    {/* Controles de Quantidade e Ações */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Seletor de Quantidade Moderno */}
                      <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-sm">
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
                          className="px-1.5 py-0.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition"
                          title="Diminuir"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-mono font-bold text-white bg-slate-950/60 min-w-[20px] text-center">
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
                          className="px-1.5 py-0.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition"
                          title="Aumentar"
                        >
                          +
                        </button>
                      </div>

                      {/* Editar Dimensões (Pencil) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(piece);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/30 transition"
                        title="Editar dimensões e dados desta peça"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      {/* Rotacionar Corte (Inverter Largura x Altura) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRotatePiece(piece.id);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/30 transition"
                        title="Girar corte 90° (inverter largura e altura)"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>

                      {/* Duplicar Peça */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicatePiece(piece);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
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
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition"
                        title="Excluir peça"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
