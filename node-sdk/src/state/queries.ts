import type { ConsentState } from './reducer.js';

export const ConsentStateQueries = {
  isActive(state: ConsentState, purposeId: string): boolean {
    return state.active.has(purposeId);
  },

  activePurposes(state: ConsentState): ReadonlyArray<string> {
    return [...state.active.keys()];
  },

  findStale(
    state: ConsentState,
    currentPolicy: {
      id: string;
      purposes: ReadonlyArray<{ id: string; version: number }>;
    },
  ): ReadonlyArray<string> {
    const stale: string[] = [];
    for (const purposeRef of currentPolicy.purposes) {
      const active = state.active.get(purposeRef.id);
      if (active && active.purposeVersion < purposeRef.version) {
        stale.push(purposeRef.id);
      }
    }
    return stale;
  },
};
