import { CutPieceInput, SheetConfig } from '../types';
import { PIECE_PALETTE } from './colors';

export interface PresetProject {
  id: string;
  name: string;
  description: string;
  sheetConfig: SheetConfig;
  pieces: CutPieceInput[];
}

export const STANDARD_SHEET_SIZES = [
  { name: 'Chapa 1605 × 2400 mm', width: 1605, height: 2400, unit: 'mm' as const },
  { name: 'Chapa 3210 × 2400 mm', width: 3210, height: 2400, unit: 'mm' as const },
  { name: 'Chapa 160.5 × 240 cm', width: 160.5, height: 240, unit: 'cm' as const },
  { name: 'Chapa 321 × 240 cm', width: 321, height: 240, unit: 'cm' as const },
];

//export const PRESET_PROJECTS: PresetProject[] = [];

export const PRESET_PROJECTS: PresetProject[] = [
  {
    id: 'espelhos-residenciais',
    name: 'Kit de Espelhos Residenciais',
    description: 'Espelhos para suíte, lavabo social, camarim e prateleiras decorativas em chapa 3210 × 2400 mm.',
    sheetConfig: {
      width: 3210,
      height: 2400,
      margin: 0,
      kerf: 0,
      unit: 'mm',
      materialName: 'Espelho Chapa',
      allowMultiSheet: true,
    },
    pieces: [
      //{
        //id: 'p1',
        //label: 'Espelho Suíte Casal',
        //width: 1400,
        //height: 900,
        //quantity: 1,
        //allowRotation: true,
        //color: PIECE_PALETTE[0].value, // Sky blue
      //},
      /*{
        id: 'p2',
        label: 'Espelho Banheiro Social',
        width: 1000,
        height: 700,
        quantity: 2,
        allowRotation: true,
        color: PIECE_PALETTE[1].value, // Emerald
      },
      {
        id: 'p3',
        label: 'Espelho Lavabo Estreito',
        width: 500,
        height: 1200,
        quantity: 2,
        allowRotation: true,
        color: PIECE_PALETTE[2].value, // Amber
      },
      {
        id: 'p4',
        label: 'Espelho Camarim LED',
        width: 800,
        height: 600,
        quantity: 2,
        allowRotation: true,
        color: PIECE_PALETTE[3].value, // Violet
      },
      {
        id: 'p5',
        label: 'Prateleiras de Vidro Lavabo',
        width: 600,
        height: 250,
        quantity: 4,
        allowRotation: true,
        color: PIECE_PALETTE[4].value, // Pink
      },*/
    ],
  },
  {
    id: 'box-vidro-temperado',
    name: 'Kit Box F1 e Portas de Vidro',
    description: 'Vidros para box frontal, portas de correr e basculantes.',
    sheetConfig: {
      width: 3210,
      height: 2200,
      margin: 15,
      kerf: 3,
      unit: 'mm',
      materialName: 'Vidro Float Incolor 8mm',
      allowMultiSheet: true,
    },
    pieces: [
      {
        id: 'b1',
        label: 'Porta Móvel Box 1',
        width: 1900,
        height: 650,
        quantity: 1,
        allowRotation: true,
        color: PIECE_PALETTE[5].value, // Cyan
      },
      {
        id: 'b2',
        label: 'Vidro Fixo Box 1',
        width: 1900,
        height: 600,
        quantity: 1,
        allowRotation: true,
        color: PIECE_PALETTE[6].value, // Orange
      },
      {
        id: 'b3',
        label: 'Porta Móvel Box 2',
        width: 1850,
        height: 550,
        quantity: 1,
        allowRotation: true,
        color: PIECE_PALETTE[7].value, // Teal
      },
      {
        id: 'b4',
        label: 'Vidro Fixo Box 2',
        width: 1850,
        height: 500,
        quantity: 1,
        allowRotation: true,
        color: PIECE_PALETTE[8].value, // Indigo
      },
      {
        id: 'b5',
        label: 'Bandeira Superior Fixa',
        width: 1200,
        height: 400,
        quantity: 2,
        allowRotation: true,
        color: PIECE_PALETTE[9].value, // Lime
      },
    ],
  },
  {
    id: 'prateleiras-tampos',
    name: 'Tampos de Mesa e Nichos',
    description: 'Diversos tampos de apoio, prateleiras e nichos decorativos.',
    sheetConfig: {
      width: 2400,
      height: 2000,
      margin: 10,
      kerf: 2,
      unit: 'mm',
      materialName: 'Vidro Fumê 6mm',
      allowMultiSheet: true,
    },
    pieces: [
      {
        id: 't1',
        label: 'Tampo Mesa de Centro',
        width: 1100,
        height: 600,
        quantity: 1,
        allowRotation: true,
        color: PIECE_PALETTE[0].value,
      },
      {
        id: 't2',
        label: 'Prateleiras Cristaleira',
        width: 800,
        height: 350,
        quantity: 4,
        allowRotation: true,
        color: PIECE_PALETTE[2].value,
      },
      {
        id: 't3',
        label: 'Nichos Banheiro',
        width: 500,
        height: 300,
        quantity: 4,
        allowRotation: true,
        color: PIECE_PALETTE[10].value,
      },
    ],
  },
];
