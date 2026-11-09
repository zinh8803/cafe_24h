export interface BobAnimationState {
  phase: number;
  isMoving: boolean;
  isSitting: boolean;
}

export function computeAvatarBobOffset(
  state: BobAnimationState,
  deltaMs: number,
): { offsetY: number; tiltRad: number } {
  const speed = state.isMoving ? 0.014 : 0.0032;
  state.phase = (state.phase + deltaMs * speed) % (Math.PI * 2);

  if (state.isMoving) {
    return {
      offsetY: -Math.abs(Math.sin(state.phase)) * 4.5,
      tiltRad: Math.sin(state.phase) * 0.055,
    };
  }

  if (state.isSitting) {
    return {
      offsetY: Math.sin(state.phase) * 1.1,
      tiltRad: 0,
    };
  }

  return {
    offsetY: Math.sin(state.phase) * 1.6,
    tiltRad: 0,
  };
}

