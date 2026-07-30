/** Shared cast wind-up for Whisper, Cold Puff, and Object Nudge. */
export const SCARE_CAST_DURATION_MS = 1500;

export interface ScareCastSession {
  readonly status: 'idle' | 'casting';
  readonly abilityId: string | null;
  readonly progress: number;
  /** Time spent in ability range while this cast is active (milliseconds). */
  readonly exposureMs: number;
}

export function createScareCastSession(): ScareCastSession {
  return { status: 'idle', abilityId: null, progress: 0, exposureMs: 0 };
}

export function isInAbilityRange(distance: number, range: number): boolean {
  return distance <= range;
}

export function exposureRatioFromSession(session: ScareCastSession, durationMs: number): number {
  if (durationMs <= 0) return 0;
  return Math.min(1, session.exposureMs / durationMs);
}

export interface StartScareCastResult {
  readonly session: ScareCastSession;
  readonly started: boolean;
  readonly switchedFromAbilityId: string | null;
  readonly sameAbilityBlocked: boolean;
}

export function canStartScareCast(affordable: boolean): boolean {
  return affordable;
}

/**
 * Starts a cast when affordable (range not required). Same ability while already
 * casting is blocked. A different ability cancels the in-progress cast and starts fresh.
 */
export function tryStartScareCast(
  session: ScareCastSession,
  abilityId: string,
  affordable: boolean,
): StartScareCastResult {
  if (!canStartScareCast(affordable)) {
    return { session, started: false, switchedFromAbilityId: null, sameAbilityBlocked: false };
  }

  if (session.status === 'casting' && session.abilityId === abilityId) {
    return { session, started: false, switchedFromAbilityId: null, sameAbilityBlocked: true };
  }

  const switchedFromAbilityId =
    session.status === 'casting' && session.abilityId !== abilityId ? session.abilityId : null;

  return {
    session: { status: 'casting', abilityId, progress: 0, exposureMs: 0 },
    started: true,
    switchedFromAbilityId,
    sameAbilityBlocked: false,
  };
}

export interface ScareCastTickResult {
  readonly session: ScareCastSession;
  readonly completedAbilityId: string | null;
  readonly exposureRatio: number | null;
}

export function tickScareCast(
  session: ScareCastSession,
  deltaMs: number,
  durationMs: number,
  inRange: boolean,
): ScareCastTickResult {
  if (session.status !== 'casting') {
    return { session, completedAbilityId: null, exposureRatio: null };
  }

  const step = Math.min(Math.max(0, deltaMs), 100);
  const exposureMs = inRange
    ? Math.min(durationMs, session.exposureMs + step)
    : session.exposureMs;
  const progress = Math.min(1, session.progress + step / durationMs);

  if (progress >= 1) {
    const exposureRatio = durationMs > 0 ? Math.min(1, exposureMs / durationMs) : 0;
    return {
      session: createScareCastSession(),
      completedAbilityId: session.abilityId,
      exposureRatio,
    };
  }

  return {
    session: {
      status: 'casting',
      abilityId: session.abilityId,
      progress,
      exposureMs,
    },
    completedAbilityId: null,
    exposureRatio: null,
  };
}

export function cancelScareCast(session: ScareCastSession): ScareCastSession {
  if (session.status !== 'casting') return session;
  return createScareCastSession();
}

export function isCastingAbility(session: ScareCastSession, abilityId: string): boolean {
  return session.status === 'casting' && session.abilityId === abilityId;
}
