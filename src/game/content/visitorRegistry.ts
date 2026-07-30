import type { NpcContent } from '../observation/types';
import type { VisitorVisitConfig } from '../session/types';
import { MILO_CONTENT } from './milo';
import { MILO_VISIT } from './miloVisit';
import { NORA_CONTENT } from './nora';
import { NORA_VISIT } from './noraVisit';

export interface VisitorPalette {
  readonly skin: number;
  readonly dress: number;
  readonly trim: number;
}

export interface VisitorCues {
  readonly objective: string;
  readonly arrivalAnnounce: string;
  readonly activeHaunting: string;
  readonly departureSuccessStatus: string;
  readonly departureFailStatus: string;
  readonly departureCueSuccess: string;
  readonly departureCueFail: string;
}

export interface VisitorDefinition {
  readonly id: string;
  readonly content: NpcContent;
  readonly visit: VisitorVisitConfig;
  readonly palette: VisitorPalette;
  readonly cues: VisitorCues;
}

export const VISITOR_IDS = ['nora', 'milo'] as const;
export type VisitorId = (typeof VISITOR_IDS)[number];

const NORA_DEFINITION: VisitorDefinition = {
  id: 'nora',
  content: NORA_CONTENT,
  visit: NORA_VISIT,
  palette: {
    skin: 0xf6c57b,
    dress: 0xd4789a,
    trim: 0x5b315e,
  },
  cues: {
    objective:
      'Watch Nora closely, gather clues, then try a scare that fits what you learned.',
    arrivalAnnounce: "Nora's on her way!",
    activeHaunting: "Nora's here — observe & spook!",
    departureSuccessStatus: "She's bolting — epic haunt!",
    departureFailStatus: 'She slipped away!',
    departureCueSuccess: 'Epic haunt!',
    departureCueFail: 'She got away!',
  },
};

const MILO_DEFINITION: VisitorDefinition = {
  id: 'milo',
  content: MILO_CONTENT,
  visit: MILO_VISIT,
  palette: {
    skin: 0xe8c89a,
    dress: 0x5a8fc4,
    trim: 0x2d4a6e,
  },
  cues: {
    objective:
      'Watch Milo closely, gather clues, then try a scare that fits what you learned.',
    arrivalAnnounce: "Milo's on his way!",
    activeHaunting: "Milo's here — observe & spook!",
    departureSuccessStatus: "He's bolting — epic haunt!",
    departureFailStatus: 'He slipped away!',
    departureCueSuccess: 'Epic haunt!',
    departureCueFail: 'He got away!',
  },
};

export const VISITOR_REGISTRY: Readonly<Record<VisitorId, VisitorDefinition>> = {
  nora: NORA_DEFINITION,
  milo: MILO_DEFINITION,
};

export function getVisitorDefinition(id: string): VisitorDefinition | undefined {
  if (id === 'nora' || id === 'milo') {
    return VISITOR_REGISTRY[id];
  }
  return undefined;
}

export function isVisitorId(id: string): id is VisitorId {
  return id === 'nora' || id === 'milo';
}
