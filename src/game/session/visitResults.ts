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

const STAGE_LABELS: Record<FearStage, string> = {
  calm: 'Totally chill',
  curious: 'Hmm, curious…',
  uneasy: 'A bit jumpy',
  frightened: 'Properly spooked',
  runaway: 'Ready to bolt',
  swoon: 'Wobbling from the frights',
  possessed: 'Goofily haunted!',
};

export function buildVisitResults(stats: VisitSessionStats): VisitResultsSummary {
  const haunted = stats.outcome === 'haunted';
  const name = stats.visitorName;

  const headline = haunted
    ? `${name} got the full spook treatment!`
    : `${name} slipped away barely spooked.`;
  const outcomeGlyph = haunted ? '👻✨' : '🚪💨';
  const outcomeLabel = haunted ? 'Epic haunt!' : 'Close call';

  const notes: string[] = [];
  if (stats.ineffectiveScareCount > 0) {
    const count = stats.ineffectiveScareCount;
    notes.push(
      count === 1
        ? 'One scare just made her giggle — peek at your clues next time!'
        : `${count} scares made her giggle instead of jump — clues are your secret weapon!`,
    );
  }
  if (stats.repeatedScareCount > 0) {
    const count = stats.repeatedScareCount;
    notes.push(
      count === 1
        ? 'You reused a scare — mix it up for bigger jumps!'
        : `${count} same-y scares got stale — switch it up for max mischief!`,
    );
  }
  if (notes.length === 0) {
    notes.push(
      haunted
        ? 'What a mix of tricks — she never saw it coming!'
        : 'Nice tries! Next time, sneak in closer and stack those scares.',
    );
  }

  const discovered = stats.clues.filter((clue) => stats.discoveredClueIds.includes(clue.id));
  const clueLines =
    discovered.length > 0
      ? discovered.map((clue) => clue.text)
      : ['No secrets yet — stick close and tap 👁 to snoop next visit!'];

  const tip = haunted
    ? 'Fewer repeats = bigger frights. Can you top that score?'
    : stats.discoveredClueIds.length === 0
      ? 'Snoop at each stop — secrets tell you what freaks her out!'
      : 'Match your scares to those secrets — that\'s the mischievous way!';

  return {
    headline,
    outcomeGlyph,
    outcomeLabel,
    stageLine: `Spook-o-meter: ${STAGE_LABELS[stats.finalFearStage]}`,
    scoreLine: `Haunt points: ${stats.score}`,
    bonusLine:
      stats.observationBonusTotal > 0
        ? `Sneaky spy bonus: +${stats.observationBonusTotal}`
        : null,
    notes,
    cluesTitle: discovered.length > 0 ? 'Secrets you snagged' : 'Secrets (empty… for now)',
    clueLines,
    tip,
  };
}
