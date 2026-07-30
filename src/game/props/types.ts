export interface PropVisitState {
  readonly awardedPropIds: ReadonlySet<string>;
  readonly linkedPropId: string | null;
}

export interface WorldPoint {
  readonly x: number;
  readonly y: number;
}

export interface PropComboEvaluation {
  readonly scoreBonus: number;
  readonly propId: string | null;
  readonly reactionCopy: string | null;
  readonly awarded: boolean;
}
