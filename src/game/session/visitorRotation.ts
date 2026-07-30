import { VISITOR_IDS, type VisitorId } from '../content/visitorRegistry';

/** Deterministic visit order: Nora → Milo → Nora → Milo … */
export const VISITOR_SEQUENCE: readonly VisitorId[] = VISITOR_IDS;

export function getVisitorIdForVisitIndex(visitIndex: number): VisitorId {
  const length = VISITOR_SEQUENCE.length;
  if (length === 0) throw new Error('Visitor sequence is empty.');
  const normalized = ((visitIndex % length) + length) % length;
  return VISITOR_SEQUENCE[normalized];
}

export function advanceVisitIndex(currentIndex: number): number {
  return currentIndex + 1;
}

export function initialVisitIndex(): number {
  return 0;
}
