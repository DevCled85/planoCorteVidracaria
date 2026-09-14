import {
  CutPieceInput,
  OptimizationResult,
  PlacedPiece,
  SheetConfig,
  SheetResult,
  WasteArea,
  CutLine,
} from '../types';

interface FreeRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ItemToPack {
  piece: CutPieceInput;
  id: string;
  label: string;
  width: number;
  height: number;
  allowRotation: boolean;
  color: string;
}

type SplitRule = 'SplitShorterAxis' | 'SplitLongerAxis' | 'SplitHorizontal' | 'SplitVertical';
type Heuristic = 'BSSF' | 'BLSF' | 'BAF';

/**
 * Converte valor para mm para cálculos consistentes de alta precisão
 */
export function toMillimeters(value: number, unit: 'mm' | 'cm'): number {
  return unit === 'cm' ? value * 10 : value;
}

export function fromMillimeters(valueMm: number, unit: 'mm' | 'cm'): number {
  return unit === 'cm' ? valueMm / 10 : valueMm;
}

export function formatDimension(value: number, unit: 'mm' | 'cm', decimals: number = 0): string {
  if (decimals > 0) {
    return `${value.toFixed(decimals)} ${unit}`;
  }
  return `${Math.round(value)} ${unit}`;
}

export function formatArea(areaM2: number): string {
  return `${areaM2.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 3 })} m²`;
}

/**
 * Guillotine 2D Bin Packing Engine especializado em corte de vidro/espelho
 */
class GuillotinePacker {
  private freeRects: FreeRect[] = [];
  public placedPieces: PlacedPiece[] = [];
  public cutLines: CutLine[] = [];
  private sheetWidth: number;
  private sheetHeight: number;
  private kerf: number;
  private margin: number;
  private sheetIndex: number;
  private splitRule: SplitRule;
  private heuristic: Heuristic;

  constructor(
    sheetWidth: number,
    sheetHeight: number,
    margin: number,
    kerf: number,
    sheetIndex: number,
    splitRule: SplitRule = 'SplitShorterAxis',
    heuristic: Heuristic = 'BSSF'
  ) {
    this.sheetWidth = sheetWidth;
    this.sheetHeight = sheetHeight;
    this.margin = margin;
    this.kerf = kerf;
    this.sheetIndex = sheetIndex;
    this.splitRule = splitRule;
    this.heuristic = heuristic;

    // Área útil inicial dentro da margem de refilo da chapa
    const usableW = Math.max(0, sheetWidth - 2 * margin);
    const usableH = Math.max(0, sheetHeight - 2 * margin);

    if (usableW > 0 && usableH > 0) {
      this.freeRects.push({
        x: margin,
        y: margin,
        width: usableW,
        height: usableH,
      });
    }
  }

  public pack(
    item: ItemToPack,
    itemCounter: number
  ): { placed: boolean; placedPiece?: PlacedPiece } {
    let bestRectIdx = -1;
    let bestRotated = false;
    let bestScore1 = Infinity;
    let bestScore2 = Infinity;

    for (let i = 0; i < this.freeRects.length; i++) {
      const free = this.freeRects[i];

      // 1. Orientação normal (sem rotação)
      if (item.width <= free.width && item.height <= free.height) {
        const { score1, score2 } = this.score(free, item.width, item.height);
        if (score1 < bestScore1 || (score1 === bestScore1 && score2 < bestScore2)) {
          bestScore1 = score1;
          bestScore2 = score2;
          bestRectIdx = i;
          bestRotated = false;
        }
      }

      // 2. Orientação rotacionada 90 graus
      if (
        item.allowRotation &&
        item.height <= free.width &&
        item.width <= free.height
      ) {
        const { score1, score2 } = this.score(free, item.height, item.width);
        if (score1 < bestScore1 || (score1 === bestScore1 && score2 < bestScore2)) {
          bestScore1 = score1;
          bestScore2 = score2;
          bestRectIdx = i;
          bestRotated = true;
        }
      }
    }

    if (bestRectIdx === -1) {
      return { placed: false };
    }

    const chosenRect = this.freeRects.splice(bestRectIdx, 1)[0];
    const placedW = bestRotated ? item.height : item.width;
    const placedH = bestRotated ? item.width : item.height;

    const placedPiece: PlacedPiece = {
      id: `${item.id}-${itemCounter}-${Math.random().toString(36).substring(2, 6)}`,
      pieceId: item.piece.id,
      itemIndex: itemCounter,
      label: item.label,
      x: chosenRect.x,
      y: chosenRect.y,
      width: placedW,
      height: placedH,
      originalWidth: item.width,
      originalHeight: item.height,
      rotated: bestRotated,
      color: item.color,
      sheetIndex: this.sheetIndex,
    };

    this.placedPieces.push(placedPiece);
    this.splitFreeRect(chosenRect, placedW, placedH);

    return { placed: true, placedPiece };
  }

  private score(
    free: FreeRect,
    w: number,
    h: number
  ): { score1: number; score2: number } {
    const leftoverW = free.width - w;
    const leftoverH = free.height - h;

    if (this.heuristic === 'BSSF') {
      const bssf = Math.min(leftoverW, leftoverH);
      const blsf = Math.max(leftoverW, leftoverH);
      return { score1: bssf, score2: blsf };
    } else if (this.heuristic === 'BLSF') {
      const blsf = Math.max(leftoverW, leftoverH);
      const bssf = Math.min(leftoverW, leftoverH);
      return { score1: blsf, score2: bssf };
    } else {
      // BAF - Best Area Fit
      const areaFit = free.width * free.height - w * h;
      const bssf = Math.min(leftoverW, leftoverH);
      return { score1: areaFit, score2: bssf };
    }
  }

  private splitFreeRect(free: FreeRect, placedW: number, placedH: number) {
    // Adiciona o kerf (folga de corte) no espaço consumido se ainda houver sobra
    const effectiveW = placedW + this.kerf;
    const effectiveH = placedH + this.kerf;

    const remainingW = free.width - effectiveW;
    const remainingH = free.height - effectiveH;

    // Se preencheu exatamente o retângulo livre
    if (remainingW <= 0 && remainingH <= 0) {
      return;
    }

    let splitHorizontal = true;

    switch (this.splitRule) {
      case 'SplitHorizontal':
        splitHorizontal = true;
        break;
      case 'SplitVertical':
        splitHorizontal = false;
        break;
      case 'SplitShorterAxis':
        splitHorizontal = free.width <= free.height;
        break;
      case 'SplitLongerAxis':
        splitHorizontal = free.width > free.height;
        break;
    }

    if (splitHorizontal) {
      // Corte horizontal ponta a ponta na largura
      // Retângulo à direita da peça
      if (remainingW > 0) {
        this.freeRects.push({
          x: free.x + effectiveW,
          y: free.y,
          width: remainingW,
          height: placedH,
        });
      }
      // Retângulo abaixo de toda a largura
      if (remainingH > 0) {
        this.freeRects.push({
          x: free.x,
          y: free.y + effectiveH,
          width: free.width,
          height: remainingH,
        });
      }
    } else {
      // Corte vertical ponta a ponta na altura
      // Retângulo abaixo da peça
      if (remainingH > 0) {
        this.freeRects.push({
          x: free.x,
          y: free.y + effectiveH,
          width: placedW,
          height: remainingH,
        });
      }
      // Retângulo à direita de toda a altura
      if (remainingW > 0) {
        this.freeRects.push({
          x: free.x + effectiveW,
          y: free.y,
          width: remainingW,
          height: free.height,
        });
      }
    }
  }

  public getWasteAreas(unit: 'mm' | 'cm'): WasteArea[] {
    const minUsableDimension = unit === 'cm' ? 25 : 250; // Sobra com pelo menos 25cm / 250mm
    const minUsableAreaM2 = 0.08; // 0.08 m² mínimo para ser guardado como retalho útil

    return this.freeRects
      .filter((r) => r.width > 2 && r.height > 2)
      .map((r, idx) => {
        const areaM2 = (toMillimeters(r.width, unit) * toMillimeters(r.height, unit)) / 1_000_000;
        const isUsable =
          (r.width >= minUsableDimension && r.height >= minUsableDimension) ||
          areaM2 >= minUsableAreaM2;

        return {
          id: `waste-${this.sheetIndex}-${idx}`,
          sheetIndex: this.sheetIndex,
          x: r.x,
          y: r.y,
          width: r.width,
          height: r.height,
          areaM2,
          isUsable,
        };
      });
  }
}

/**
 * Executa múltiplas estratégias de corte e seleciona a melhor (maior aproveitamento)
 */
export function optimizeCutPlan(
  sheetConfig: SheetConfig,
  pieces: CutPieceInput[]
): OptimizationResult {
  // Desdobra quantidades em itens individuais
  const rawItems: ItemToPack[] = [];
  pieces.forEach((p) => {
    for (let q = 0; q < p.quantity; q++) {
      rawItems.push({
        piece: p,
        id: p.id,
        label: p.label || 'Peça',
        width: Math.max(1, p.width),
        height: Math.max(1, p.height),
        allowRotation: p.allowRotation,
        color: p.color,
      });
    }
  });

  const totalRequestedPieces = rawItems.length;

  if (totalRequestedPieces === 0) {
    return createEmptyResult(sheetConfig);
  }

  // Estratégias de ordenação para testar
  const sortingStrategies: { name: string; sortFn: (a: ItemToPack, b: ItemToPack) => number }[] = [
    {
      name: 'AreaDesc',
      sortFn: (a, b) => b.width * b.height - a.width * a.height,
    },
    {
      name: 'MaxDimensionDesc',
      sortFn: (a, b) => Math.max(b.width, b.height) - Math.max(a.width, a.height),
    },
    {
      name: 'PerimeterDesc',
      sortFn: (a, b) => 2 * (b.width + b.height) - 2 * (a.width + a.height),
    },
    {
      name: 'WidthDesc',
      sortFn: (a, b) => b.width - a.width || b.height - a.height,
    },
    {
      name: 'HeightDesc',
      sortFn: (a, b) => b.height - a.height || b.width - a.width,
    },
  ];

  const splitRules: SplitRule[] = [
    'SplitShorterAxis',
    'SplitLongerAxis',
    'SplitHorizontal',
    'SplitVertical',
  ];

  const heuristics: Heuristic[] = ['BSSF', 'BAF'];

  let bestResult: OptimizationResult | null = null;
  let bestScore = -1;

  // Testamos as combinações para encontrar o melhor empacotamento
  for (const sortStrat of sortingStrategies) {
    for (const splitRule of splitRules) {
      for (const heuristic of heuristics) {
        const sortedItems = [...rawItems].sort(sortStrat.sortFn);
        const result = runSingleSimulation(
          sheetConfig,
          sortedItems,
          splitRule,
          heuristic
        );

        // Score: prioriza colocar mais peças, menos chapas, e maior % de aproveitamento
        const unplacedPenalty = result.unplacedPieces.reduce(
          (acc, u) => acc + u.unplacedCount * 10000,
          0
        );
        const sheetPenalty = result.sheets.length * 500;
        const score =
          result.totalPlacedPieces * 1000 +
          result.overallUtilizationPercent * 10 -
          unplacedPenalty -
          sheetPenalty;

        if (bestResult === null || score > bestScore) {
          bestScore = score;
          bestResult = result;
        }
      }
    }
  }

  return bestResult || createEmptyResult(sheetConfig);
}

function runSingleSimulation(
  config: SheetConfig,
  items: ItemToPack[],
  splitRule: SplitRule,
  heuristic: Heuristic
): OptimizationResult {
  const sheets: SheetResult[] = [];
  const remainingItems = [...items];
  let sheetIndex = 0;
  let itemGlobalCounter = 1;

  const maxSheetsAllowed = config.allowMultiSheet ? 50 : 1;

  while (remainingItems.length > 0 && sheetIndex < maxSheetsAllowed) {
    const packer = new GuillotinePacker(
      config.width,
      config.height,
      config.margin,
      config.kerf,
      sheetIndex,
      splitRule,
      heuristic
    );

    const unplacedThisSheet: ItemToPack[] = [];

    for (const item of remainingItems) {
      const res = packer.pack(item, itemGlobalCounter);
      if (res.placed) {
        itemGlobalCounter++;
      } else {
        unplacedThisSheet.push(item);
      }
    }

    // Se nenhuma peça coube nesta chapa nova, interrompe para não entrar em loop infinito
    if (packer.placedPieces.length === 0) {
      break;
    }

    // Calcula métricas da chapa
    const sheetAreaM2 =
      (toMillimeters(config.width, config.unit) *
        toMillimeters(config.height, config.unit)) /
      1_000_000;

    const usedAreaM2 = packer.placedPieces.reduce((acc, p) => {
      const wMm = toMillimeters(p.width, config.unit);
      const hMm = toMillimeters(p.height, config.unit);
      return acc + (wMm * hMm) / 1_000_000;
    }, 0);

    const wasteAreaM2 = Math.max(0, sheetAreaM2 - usedAreaM2);
    const utilizationPercent =
      sheetAreaM2 > 0 ? Math.min(100, (usedAreaM2 / sheetAreaM2) * 100) : 0;

    const wasteAreas = packer.getWasteAreas(config.unit);
    const usableWasteAreaM2 = wasteAreas
      .filter((w) => w.isUsable)
      .reduce((acc, w) => acc + w.areaM2, 0);

    // Gerar linhas de corte das peças
    const cutLines = generateCutLines(packer.placedPieces, config);

    sheets.push({
      sheetIndex,
      width: config.width,
      height: config.height,
      usableWidth: Math.max(0, config.width - 2 * config.margin),
      usableHeight: Math.max(0, config.height - 2 * config.margin),
      margin: config.margin,
      placedPieces: packer.placedPieces,
      wasteAreas,
      cutLines,
      totalAreaM2: sheetAreaM2,
      usedAreaM2,
      wasteAreaM2,
      utilizationPercent,
      usableWasteAreaM2,
    });

    remainingItems.length = 0;
    remainingItems.push(...unplacedThisSheet);
    sheetIndex++;
  }

  // Agrupa peças não alocadas
  const unplacedMap = new Map<string, { piece: CutPieceInput; count: number }>();
  remainingItems.forEach((it) => {
    const existing = unplacedMap.get(it.piece.id);
    if (existing) {
      existing.count += 1;
    } else {
      unplacedMap.set(it.piece.id, { piece: it.piece, count: 1 });
    }
  });

  const unplacedPieces = Array.from(unplacedMap.values()).map((v) => ({
    piece: v.piece,
    unplacedCount: v.count,
  }));

  const totalPlacedPieces = sheets.reduce(
    (acc, s) => acc + s.placedPieces.length,
    0
  );
  const totalSheetAreaM2 = sheets.reduce((acc, s) => acc + s.totalAreaM2, 0);
  const totalUsedAreaM2 = sheets.reduce((acc, s) => acc + s.usedAreaM2, 0);
  const totalWasteAreaM2 = Math.max(0, totalSheetAreaM2 - totalUsedAreaM2);
  const overallUtilizationPercent =
    totalSheetAreaM2 > 0
      ? Math.min(100, (totalUsedAreaM2 / totalSheetAreaM2) * 100)
      : 0;

  // Calcula metros lineares de corte (perímetro de cortes internos + refilo)
  let totalLinearCutMeters = 0;
  sheets.forEach((sheet) => {
    // Refilo periférico
    if (sheet.margin > 0) {
      const perimeterM =
        (2 *
          (toMillimeters(sheet.width, config.unit) +
            toMillimeters(sheet.height, config.unit))) /
        1000;
      totalLinearCutMeters += perimeterM;
    }
    // Cortes de cada peça
    sheet.cutLines.forEach((line) => {
      totalLinearCutMeters += toMillimeters(line.length, config.unit) / 1000;
    });
  });

  return {
    sheets,
    unplacedPieces,
    totalRequestedPieces: items.length,
    totalPlacedPieces,
    totalSheetAreaM2,
    totalUsedAreaM2,
    totalWasteAreaM2,
    overallUtilizationPercent,
    totalLinearCutMeters,
    timestamp: Date.now(),
  };
}

function generateCutLines(placedPieces: PlacedPiece[], config: SheetConfig): CutLine[] {
  const lines: CutLine[] = [];

  placedPieces.forEach((p, idx) => {
    // Linha horizontal superior e inferior da peça
    lines.push({
      id: `cut-h-${idx}-1`,
      sheetIndex: p.sheetIndex,
      x1: p.x,
      y1: p.y,
      x2: p.x + p.width,
      y2: p.y,
      orientation: 'horizontal',
      length: p.width,
    });
    lines.push({
      id: `cut-h-${idx}-2`,
      sheetIndex: p.sheetIndex,
      x1: p.x,
      y1: p.y + p.height,
      x2: p.x + p.width,
      y2: p.y + p.height,
      orientation: 'horizontal',
      length: p.width,
    });
    // Linha vertical esquerda e direita da peça
    lines.push({
      id: `cut-v-${idx}-1`,
      sheetIndex: p.sheetIndex,
      x1: p.x,
      y1: p.y,
      x2: p.x,
      y2: p.y + p.height,
      orientation: 'vertical',
      length: p.height,
    });
    lines.push({
      id: `cut-v-${idx}-2`,
      sheetIndex: p.sheetIndex,
      x1: p.x + p.width,
      y1: p.y,
      x2: p.x + p.width,
      y2: p.y + p.height,
      orientation: 'vertical',
      length: p.height,
    });
  });

  return lines;
}

function createEmptyResult(config: SheetConfig): OptimizationResult {
  const sheetAreaM2 =
    (toMillimeters(config.width, config.unit) *
      toMillimeters(config.height, config.unit)) /
    1_000_000;

  return {
    sheets: [
      {
        sheetIndex: 0,
        width: config.width,
        height: config.height,
        usableWidth: Math.max(0, config.width - 2 * config.margin),
        usableHeight: Math.max(0, config.height - 2 * config.margin),
        margin: config.margin,
        placedPieces: [],
        wasteAreas: [
          {
            id: 'waste-0-0',
            sheetIndex: 0,
            x: config.margin,
            y: config.margin,
            width: Math.max(0, config.width - 2 * config.margin),
            height: Math.max(0, config.height - 2 * config.margin),
            areaM2: sheetAreaM2,
            isUsable: true,
          },
        ],
        cutLines: [],
        totalAreaM2: sheetAreaM2,
        usedAreaM2: 0,
        wasteAreaM2: sheetAreaM2,
        utilizationPercent: 0,
        usableWasteAreaM2: sheetAreaM2,
      },
    ],
    unplacedPieces: [],
    totalRequestedPieces: 0,
    totalPlacedPieces: 0,
    totalSheetAreaM2: sheetAreaM2,
    totalUsedAreaM2: 0,
    totalWasteAreaM2: sheetAreaM2,
    overallUtilizationPercent: 0,
    totalLinearCutMeters: 0,
    timestamp: Date.now(),
  };
}
