import { describe, expect, it } from 'vitest';
import { gradeFirstReason, initialProgress, readProgress, startSecond, submitLoop, submitReason, toggleEdge } from './lesson';
import { qaSource, withQa } from './traffic';

const firstSolution = 'A1-A2 A2-A3 A3-A4 A4-B4 B3-B4 B3-C3 C3-C4 C4-D4 D3-D4 D2-D3 C2-D2 C1-C2 B1-C1 A1-B1'.split(' ');
const secondSolution = 'A2-A3 A3-A4 A4-B4 B4-C4 C3-C4 C3-D3 D2-D3 D1-D2 C1-D1 B1-C1 B1-B2 A2-B2'.split(' ');

describe('Shingoki lesson', () => {
  it('requires one selected edge and a reason before unlocking the first loop', () => {
    const empty = initialProgress();
    expect(submitReason(empty)).toBe(empty);
    const left = toggleEdge(empty, 'A1-B1');
    expect(submitReason(left)).toBe(left);
    const down = toggleEdge(left, 'B1-B2');
    expect(down.edges).toEqual(['B1-B2']);
    expect(toggleEdge(down, 'B1-B2').edges).toEqual([]);
    const answered = submitReason({ ...down, reason: 'top' });
    expect(answered.firstEdge).toBe('B1-B2');
    expect(gradeFirstReason(answered.firstEdge, answered.reason).correct).toBe(false);
    expect(submitReason(answered)).toBe(answered);
    expect(startSecond(answered)).toBe(answered);
    expect(submitLoop(answered)).toBe(answered);
  });

  it.each([
    ['A1-B1', 'top', 'edge_right_reason_right', true, true],
    ['B1-C1', 'top', 'edge_right_reason_right', true, true],
    ['B1-C1', 'all', 'edge_right_reason_wrong', true, false],
    ['B1-B2', 'top', 'edge_wrong_reason_right', false, true],
    ['B1-B2', 'turn', 'edge_wrong_reason_wrong', false, false],
  ] as const)('reports the registered outcome for %s and %s', (id, reason, outcome, edgeOk, reasonOk) => {
    expect(gradeFirstReason(id, reason)).toEqual({
      outcome, edge_correct: edgeOk, reason_correct: reasonOk, correct: edgeOk && reasonOk,
    });
  });

  it('locks each valid completion, starts the second board blank, and restores without re-emitting', () => {
    const first = submitReason({ ...toggleEdge(initialProgress(), 'B1-C1'), reason: 'top' });
    const solved = submitLoop({ ...first, edges: firstSolution });
    expect(solved.stage).toBe('firstDone');
    expect(submitLoop(solved)).toBe(solved);
    const second = startSecond(solved);
    expect(second).toMatchObject({ stage: 'second', edges: [] });
    expect(submitLoop({ ...second, edges: firstSolution }).stage).toBe('second');
    const done = submitLoop({ ...second, edges: secondSolution });
    expect(done.stage).toBe('done');
    const restored = readProgress(JSON.stringify(done));
    expect(restored).toEqual(done);
    expect(toggleEdge(restored, secondSolution[0])).toBe(restored);
    expect(submitLoop(restored)).toBe(restored);
    expect(startSecond(restored)).toBe(restored);
  });

  it('ignores corrupted stored progress and invalid edge IDs', () => {
    const state = initialProgress();
    expect(toggleEdge(state, 'D1-A2')).toBe(state);
    for (const raw of ['bad JSON', 'null', JSON.stringify({ ...state, stage: 'done' }),
      JSON.stringify({ ...state, stage: 'done', started: true, firstEdge: 'A1-B1', reason: 'top', edges: firstSolution }),
      JSON.stringify({ ...state, edges: ['A1-C1'] })]) {
      expect(readProgress(raw)).toEqual(state);
    }
  });

  it('carries only the fixed QA markers through related links', () => {
    for (const source of ['desktop', 'mobile', 'review']) {
      expect(withQa('/en/shingoki-puzzle', qaSource(source))).toBe('/en/shingoki-puzzle?qa=' + source);
    }
    for (const value of [undefined, ['mobile', 'desktop'], 'private-tag']) {
      expect(qaSource(value)).toBe('unmarked');
      expect(withQa('/zh/train-tracks-puzzle', qaSource(value))).toBe('/zh/train-tracks-puzzle');
    }
  });
});
