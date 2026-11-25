import { isEdge, isSolvedLoop, puzzles } from './board';

export type Stage = 'reason' | 'first' | 'firstDone' | 'second' | 'done';
export const reasons = ['turn', 'top', 'all'] as const;
export type Reason = typeof reasons[number];
export type Progress = {
  stage: Stage;
  started: boolean;
  edges: string[];
  reason: Reason | null;
  firstEdge: string | null;
};

export function initialProgress(): Progress {
  return { stage: 'reason', started: false, edges: [], reason: null, firstEdge: null };
}

export function gradeFirstReason(edge: string | null, reason: Reason | null) {
  const edgeCorrect = edge === 'A1-B1' || edge === 'B1-C1';
  const reasonCorrect = reason === 'top';
  return {
    edge_correct: edgeCorrect,
    reason_correct: reasonCorrect,
    correct: edgeCorrect && reasonCorrect,
    outcome: (edgeCorrect ? 'edge_right' : 'edge_wrong') + (reasonCorrect ? '_reason_right' : '_reason_wrong'),
  };
}

export function readProgress(raw: string | null): Progress {
  if (!raw) return initialProgress();
  try {
    const state = JSON.parse(raw) as Progress;
    if (!['reason', 'first', 'firstDone', 'second', 'done'].includes(state.stage) ||
        typeof state.started !== 'boolean' || !Array.isArray(state.edges) || !state.edges.every(isEdge) || new Set(state.edges).size !== state.edges.length ||
        (state.reason !== null && !reasons.includes(state.reason))) return initialProgress();
    if (state.stage === 'reason') {
      if (state.edges.length > 1 || state.firstEdge !== null || (!state.started && (state.edges.length || state.reason))) return initialProgress();
    } else if (!state.started || !isEdge(state.firstEdge) || state.reason === null) return initialProgress();
    if (state.stage === 'firstDone' && !isSolvedLoop(puzzles[0], state.edges)) return initialProgress();
    if (state.stage === 'done' && !isSolvedLoop(puzzles[1], state.edges)) return initialProgress();
    return state;
  } catch {
    return initialProgress();
  }
}

export function toggleEdge(state: Progress, id: string): Progress {
  if (!isEdge(id) || state.stage === 'firstDone' || state.stage === 'done') return state;
  const edges = state.edges.includes(id)
    ? state.edges.filter(edge => edge !== id)
    : [...(state.stage === 'reason' ? [] : state.edges), id];
  return { ...state, started: true, edges };
}

export function submitReason(state: Progress): Progress {
  if (state.stage !== 'reason' || state.edges.length !== 1 || !state.reason) return state;
  return { ...state, stage: 'first', firstEdge: state.edges[0] };
}

export function submitLoop(state: Progress): Progress {
  if (state.stage !== 'first' && state.stage !== 'second') return state;
  if (!isSolvedLoop(puzzles[state.stage === 'first' ? 0 : 1], state.edges)) return state;
  return { ...state, stage: state.stage === 'first' ? 'firstDone' : 'done' };
}

export function startSecond(state: Progress): Progress {
  if (state.stage !== 'firstDone') return state;
  return { ...state, stage: 'second', edges: [] };
}
