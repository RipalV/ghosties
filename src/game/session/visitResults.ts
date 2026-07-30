import type { FearStage } from '../fear/FearEngine';
import type { ClueDefinition } from '../observation/types';
import type { VisitOutcome } from './types';

export interface VisitSessionStats {
  readonly visitorName: string;
  readonly outcome: VisitOutcome;
  readonly finalFearStage: FearStage;
  readonly finalFear: number;
  readonly score: number;
  readonly observationBonusTotal: number;
  readonly ineffectiveScareCount: number;
  readonly repeatedScareCount: number;
  readonly discoveredClueIds: readonly string[];
  readonly clues: readonly ClueDefinition[];
}

export interface VisitResultsSummary {
  readonly headline: string;
  readonly outcomeGlyph: string;
  readonly outcomeLabel: string;
  readonly stageLine: string;
  readonly scoreLine: string;
  readonly bonusLine: string | null;
  readonly notes: readonly string[];
  readonly cluesTitle: string;
  readonly clueLines: readonly string[];
  readonly tip: string;
}

interface VisitGrade {
  readonly outcomeLabel: string;
  readonly outcomeGlyph: string;
  readonly spookMeter: string;
  readonly headline: (name: string, escaped: boolean) => string;
}

/** Fun mischief grades from chill → epic haunt (one per fear stage). */
const VISIT_GRADES: Record<FearStage, VisitGrade> = {
  calm: {
    outcomeLabel: 'Ice cold',
    outcomeGlyph: '😌',
    spookMeter: 'Totally chill',
    headline: (name) => `${name} felt nothing. Try sneakier!`,
  },
  curious: {
    outcomeLabel: 'Side-eye spook',
    outcomeGlyph: '👀',
    spookMeter: 'A bit curious…',
    headline: (name, escaped) =>
      escaped ? `${name} got curious — then bolted!` : `${name} spotted something odd…`,
  },
  uneasy: {
    outcomeLabel: 'Jitters unlocked',
    outcomeGlyph: '😬',
    spookMeter: 'Getting jumpy',
    headline: (name, escaped) =>
      escaped ? `${name} left with the jitters!` : `${name} is on edge!`,
  },
  frightened: {
    outcomeLabel: 'Big scares!',
    outcomeGlyph: '😱',
    spookMeter: 'Properly rattled',
    headline: (name, escaped) =>
      escaped ? `${name} rattled — then escaped!` : `${name} got a proper fright!`,
  },
  runaway: {
    outcomeLabel: 'Almost bolted!',
    outcomeGlyph: '🏃',
    spookMeter: 'Ready to run',
    headline: (name, escaped) =>
      escaped ? `${name} nearly bolted — so close!` : `${name} is ready to sprint!`,
  },
  swoon: {
    outcomeLabel: 'Wobble zone',
    outcomeGlyph: '💫',
    spookMeter: 'Wobbling!',
    headline: (name, escaped) =>
      escaped ? `${name} wobbled out — epic was close!` : `${name} is wobbling!`,
  },
  possessed: {
    outcomeLabel: 'Epic haunt!',
    outcomeGlyph: '👻✨',
    spookMeter: 'Goofily haunted!',
    headline: (name) => `${name} got the full spook!`,
  },
};

export function gradeForFearStage(stage: FearStage): VisitGrade {
  return VISIT_GRADES[stage];
}

export function buildVisitResults(stats: VisitSessionStats): VisitResultsSummary {
  const escaped = stats.outcome === 'unimpressed';
  const name = stats.visitorName;
  const grade = gradeForFearStage(stats.finalFearStage);

  // One short note max — keep the summary scannable.
  let note: string | null = null;
  if (stats.repeatedScareCount > 0) {
    note =
      stats.repeatedScareCount === 1
        ? 'Same scare got stale — mix it up!'
        : `${stats.repeatedScareCount} same-y scares — mix it up!`;
  } else if (stats.ineffectiveScareCount > 0) {
    note =
      stats.ineffectiveScareCount === 1
        ? `${name} giggled — check those secrets!`
        : `${stats.ineffectiveScareCount} giggles — check those secrets!`;
  } else if (stats.finalFearStage === 'possessed') {
    note = 'Tricks on point — they never saw it!';
  }

  const discovered = stats.clues.filter((clue) => stats.discoveredClueIds.includes(clue.id));
  const clueLines =
    discovered.length > 0
      ? discovered.map((clue) => clue.text)
      : ['None yet — snoop with 👁 next time!'];

  const tip =
    stats.finalFearStage === 'possessed'
      ? 'Fewer repeats = bigger frights!'
      : stats.discoveredClueIds.length === 0
        ? 'Snoop first — secrets show the way!'
        : stats.finalFearStage === 'calm' || stats.finalFearStage === 'curious'
          ? 'Match scares to your secrets!'
          : 'One more push for epic haunt!';

  return {
    headline: grade.headline(name, escaped),
    outcomeGlyph: grade.outcomeGlyph,
    outcomeLabel: grade.outcomeLabel,
    stageLine: `Spook-o-meter: ${grade.spookMeter}`,
    scoreLine: `Haunt points: ${stats.score}`,
    bonusLine:
      stats.observationBonusTotal > 0
        ? `Spy bonus: +${stats.observationBonusTotal}`
        : null,
    notes: note ? [note] : [],
    cluesTitle: discovered.length > 0 ? 'Secrets' : 'Secrets (none yet)',
    clueLines,
    tip,
  };
}
