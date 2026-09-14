export type DimensionUnit = 'mm' | 'cm';

export interface SheetConfig {
  width: number; // in active unit
  height: number; // in active unit
  margin: number; // refilo / trim margin in active unit
  kerf: number; // espessura do corte / disco / riscador in active unit
  unit: DimensionUnit;
  materialName: string; // Ex: 'Espelho Prata 4mm', 'Vidro Incolor 6mm'
  allowMultiSheet: boolean;
}

export interface CutPieceInput {
  id: string;
  label: string;
  width: number; // in active unit
  height: number; // in active unit
  quantity: number;
  allowRotation: boolean;
  color: string;
}

export interface PlacedPiece {
  id: string; // unique placement id
  pieceId: string; // source CutPieceInput id
  itemIndex: number; // 1-based overall piece counter (#1, #2...)
  label: string;
  x: number; // in active unit
  y: number; // in active unit
  width: number; // placed width (might be rotated)
  height: number; // placed height (might be rotated)
  originalWidth: number;
  originalHeight: number;
  rotated: boolean;
  color: string;
  sheetIndex: number; // 0-based
}

export interface WasteArea {
  id: string;
  sheetIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  areaM2: number;
  isUsable: boolean; // Sobra aproveitável (retalho) vs perda mínima
}

export interface CutLine {
  id: string;
  sheetIndex: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  orientation: 'horizontal' | 'vertical';
  length: number;
}

export interface SheetResult {
  sheetIndex: number;
  width: number;
  height: number;
  usableWidth: number;
  usableHeight: number;
  margin: number;
  placedPieces: PlacedPiece[];
  wasteAreas: WasteArea[];
  cutLines: CutLine[];
  totalAreaM2: number;
  usedAreaM2: number;
  wasteAreaM2: number;
  utilizationPercent: number;
  usableWasteAreaM2: number; // Área de sobras que podem ser guardadas como retalhos
}

export interface OptimizationResult {
  sheets: SheetResult[];
  unplacedPieces: {
    piece: CutPieceInput;
    unplacedCount: number;
  }[];
  totalRequestedPieces: number;
  totalPlacedPieces: number;
  totalSheetAreaM2: number;
  totalUsedAreaM2: number;
  totalWasteAreaM2: number;
  overallUtilizationPercent: number;
  totalLinearCutMeters: number;
  timestamp: number;
}
