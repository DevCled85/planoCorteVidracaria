export interface ColorOption {
  value: string;
  name: string;
  border: string;
  text: string;
  badge: string;
  lightBg: string;
}

export const PIECE_PALETTE: ColorOption[] = [
  {
    value: '#0284c7', // Sky blue
    name: 'Azul Celeste',
    border: '#0369a1',
    text: '#ffffff',
    badge: 'bg-sky-500 text-white',
    lightBg: '#e0f2fe',
  },
  {
    value: '#10b981', // Emerald
    name: 'Verde Esmeralda',
    border: '#059669',
    text: '#ffffff',
    badge: 'bg-emerald-500 text-white',
    lightBg: '#d1fae5',
  },
  {
    value: '#f59e0b', // Amber
    name: 'Âmbar Dourado',
    border: '#d97706',
    text: '#ffffff',
    badge: 'bg-amber-500 text-white',
    lightBg: '#fef3c7',
  },
  {
    value: '#8b5cf6', // Violet
    name: 'Violeta Vidro',
    border: '#7c3aed',
    text: '#ffffff',
    badge: 'bg-violet-500 text-white',
    lightBg: '#ede9fe',
  },
  {
    value: '#ec4899', // Pink
    name: 'Rosa Cristal',
    border: '#db2777',
    text: '#ffffff',
    badge: 'bg-pink-500 text-white',
    lightBg: '#fce7f3',
  },
  {
    value: '#06b6d4', // Cyan
    name: 'Ciano Água',
    border: '#0891b2',
    text: '#ffffff',
    badge: 'bg-cyan-500 text-white',
    lightBg: '#cffafe',
  },
  {
    value: '#f97316', // Orange
    name: 'Laranja Cobre',
    border: '#ea580c',
    text: '#ffffff',
    badge: 'bg-orange-500 text-white',
    lightBg: '#ffedd5',
  },
  {
    value: '#14b8a6', // Teal
    name: 'Verde Petróleo',
    border: '#0d9488',
    text: '#ffffff',
    badge: 'bg-teal-500 text-white',
    lightBg: '#ccfbf1',
  },
  {
    value: '#6366f1', // Indigo
    name: 'Índigo Real',
    border: '#4f46e5',
    text: '#ffffff',
    badge: 'bg-indigo-500 text-white',
    lightBg: '#e0e7ff',
  },
  {
    value: '#84cc16', // Lime
    name: 'Verde Limão',
    border: '#65a30d',
    text: '#1a2e05',
    badge: 'bg-lime-500 text-slate-900',
    lightBg: '#ecfccb',
  },
  {
    value: '#e11d48', // Rose
    name: 'Rubi Intenso',
    border: '#be123c',
    text: '#ffffff',
    badge: 'bg-rose-500 text-white',
    lightBg: '#ffe4e6',
  },
  {
    value: '#d946ef', // Fuchsia
    name: 'Fúcsia Espelho',
    border: '#c026d3',
    text: '#ffffff',
    badge: 'bg-fuchsia-500 text-white',
    lightBg: '#fae8ff',
  },
  {
    value: '#3b82f6', // Blue
    name: 'Azul Safira',
    border: '#2563eb',
    text: '#ffffff',
    badge: 'bg-blue-500 text-white',
    lightBg: '#dbeafe',
  },
  {
    value: '#eab308', // Yellow
    name: 'Amarelo Ouro',
    border: '#ca8a04',
    text: '#ffffff',
    badge: 'bg-yellow-500 text-slate-950',
    lightBg: '#fef9c3',
  },
  {
    value: '#059669', // Deep emerald
    name: 'Verde Jade',
    border: '#047857',
    text: '#ffffff',
    badge: 'bg-emerald-600 text-white',
    lightBg: '#a7f3d0',
  },
  {
    value: '#a855f7', // Purple
    name: 'Roxo Ametista',
    border: '#9333ea',
    text: '#ffffff',
    badge: 'bg-purple-500 text-white',
    lightBg: '#f3e8ff',
  },
  {
    value: '#ef4444', // Red
    name: 'Vermelho Coral',
    border: '#dc2626',
    text: '#ffffff',
    badge: 'bg-red-500 text-white',
    lightBg: '#fee2e2',
  },
  {
    value: '#0ea5e9', // Sky vibrant
    name: 'Turquesa Marinho',
    border: '#0284c7',
    text: '#ffffff',
    badge: 'bg-sky-500 text-white',
    lightBg: '#bae6fd',
  },
  {
    value: '#22c55e', // Green
    name: 'Verde Folha',
    border: '#16a34a',
    text: '#ffffff',
    badge: 'bg-green-500 text-white',
    lightBg: '#bbf7d0',
  },
  {
    value: '#fb923c', // Light orange
    name: 'Tangerina',
    border: '#f97316',
    text: '#ffffff',
    badge: 'bg-orange-400 text-slate-950',
    lightBg: '#ffedd5',
  },
  {
    value: '#4f46e5', // Deep Indigo
    name: 'Azul Cobalto',
    border: '#4338ca',
    text: '#ffffff',
    badge: 'bg-indigo-600 text-white',
    lightBg: '#c7d2fe',
  },
  {
    value: '#0d9488', // Deep teal
    name: 'Malaquita',
    border: '#0f766e',
    text: '#ffffff',
    badge: 'bg-teal-600 text-white',
    lightBg: '#99f6e4',
  },
  {
    value: '#c026d3', // Magenta
    name: 'Magenta Cristal',
    border: '#a21caf',
    text: '#ffffff',
    badge: 'bg-fuchsia-600 text-white',
    lightBg: '#f5d0fe',
  },
  {
    value: '#ea580c', // Dark orange
    name: 'Bronze Queimado',
    border: '#c2410c',
    text: '#ffffff',
    badge: 'bg-orange-600 text-white',
    lightBg: '#fed7aa',
  },
  {
    value: '#7c3aed', // Bright violet
    name: 'Violeta Imperial',
    border: '#6d28d9',
    text: '#ffffff',
    badge: 'bg-violet-600 text-white',
    lightBg: '#ddd6fe',
  },
  {
    value: '#16a34a', // Grass green
    name: 'Verde Floresta',
    border: '#15803d',
    text: '#ffffff',
    badge: 'bg-green-600 text-white',
    lightBg: '#86efac',
  },
  {
    value: '#be123c', // Crimson
    name: 'Carmim Brilhante',
    border: '#9f1239',
    text: '#ffffff',
    badge: 'bg-rose-700 text-white',
    lightBg: '#fecdd3',
  },
  {
    value: '#2563eb', // Royal blue
    name: 'Azul Ultramar',
    border: '#1d4ed8',
    text: '#ffffff',
    badge: 'bg-blue-600 text-white',
    lightBg: '#bfdbfe',
  },
  {
    value: '#b45309', // Amber bronze
    name: 'Topázio Fumê',
    border: '#92400e',
    text: '#ffffff',
    badge: 'bg-amber-700 text-white',
    lightBg: '#fde68a',
  },
  {
    value: '#0891b2', // Ocean cyan
    name: 'Azul Oceano',
    border: '#0e7490',
    text: '#ffffff',
    badge: 'bg-cyan-600 text-white',
    lightBg: '#a5f3fc',
  },
  {
    value: '#475569', // Slate
    name: 'Fumê Grafite',
    border: '#334155',
    text: '#ffffff',
    badge: 'bg-slate-600 text-white',
    lightBg: '#e2e8f0',
  },
];

export function getPieceColor(index: number): string {
  return PIECE_PALETTE[index % PIECE_PALETTE.length].value;
}

/**
 * Retorna uma cor aleatória garantindo que NÃO repita nenhuma cor já utilizada
 */
export function getRandomUniqueColor(usedColors: string[] = []): string {
  const normalizedUsed = new Set(
    usedColors.map((c) => (c || '').toLowerCase().trim())
  );

  // Filtra as cores da paleta que ainda não foram usadas
  const availableColors = PIECE_PALETTE.filter(
    (c) => !normalizedUsed.has(c.value.toLowerCase())
  );

  if (availableColors.length > 0) {
    // Escolhe aleatoriamente entre as cores ainda não utilizadas
    const randomIndex = Math.floor(Math.random() * availableColors.length);
    return availableColors[randomIndex].value;
  }

  // Se todas as 30+ cores da paleta já foram usadas, gera uma cor HSL randômica única
  // com saturação e brilho calibrados para legibilidade
  for (let attempt = 0; attempt < 50; attempt++) {
    const randomHue = Math.floor(Math.random() * 360);
    // Converte HSL para Hex
    const hex = hslToHex(randomHue, 75, 50);
    if (!normalizedUsed.has(hex.toLowerCase())) {
      return hex;
    }
  }

  // Fallback seguro
  return PIECE_PALETTE[Math.floor(Math.random() * PIECE_PALETTE.length)].value;
}

function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function getColorDetails(colorHex: string): ColorOption {
  const found = PIECE_PALETTE.find(
    (p) => p.value.toLowerCase() === colorHex.toLowerCase()
  );
  if (found) return found;

  return {
    value: colorHex,
    name: 'Personalizada',
    border: colorHex,
    text: '#ffffff',
    badge: 'bg-slate-700 text-white',
    lightBg: '#f1f5f9',
  };
}
