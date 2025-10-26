#!/usr/bin/env tsx

import { Puzzle, Difficulty } from '@/lib/sudoku/types';
import { SudokuEngine } from '@/lib/sudoku/engine';
import { GlobalPosition, globalToLocal } from '@/lib/sudoku/coordinates';

/**
 * Difficulty analysis result
 */
export interface DifficultyAnalysis {
  difficulty: Difficulty;
  score: number;
  metrics: {
    totalClues: number;
    nakedSingles: number;
    hiddenSingles: number;
    emptyCells: number;
    averageCandidates: number;
  };
  reasoning: string[];
}

/**
 * Count clues in puzzle
 */
function countClues(puzzle: Puzzle): number {
  let count = 0;
  for (const grid of puzzle.grids) {
    for (const row of grid.initial) {
      for (const val of row) {
        if (val !== 0) count++;
      }
    }
  }
  return count;
}

/**
 * Count empty cells
 */
function countEmptyCells(engine: SudokuEngine): number {
  const board = engine.getBoard();
  let count = 0;

  for (let row = 0; row < 21; row++) {
    for (let col = 0; col < 21; col++) {
      const locals = globalToLocal({ row, col });
      if (locals.length > 0 && board[row][col] === 0) {
        count++;
      }
    }
  }

  return count;
}

/**
 * Count naked singles (cells with only one candidate)
 */
function countNakedSingles(engine: SudokuEngine): number {
  let count = 0;

  for (let row = 0; row < 21; row++) {
    for (let col = 0; col < 21; col++) {
      const pos: GlobalPosition = { row, col };
      const locals = globalToLocal(pos);

      if (locals.length === 0) continue;

      const candidates = engine.getCandidates(pos);
      if (candidates.size === 1) {
        count++;
      }
    }
  }

  return count;
}

/**
 * Calculate average candidates per empty cell
 */
function calculateAverageCandidates(engine: SudokuEngine): number {
  let totalCandidates = 0;
  let emptyCells = 0;

  for (let row = 0; row < 21; row++) {
    for (let col = 0; col < 21; col++) {
      const pos: GlobalPosition = { row, col };
      const locals = globalToLocal(pos);

      if (locals.length === 0) continue;

      const candidates = engine.getCandidates(pos);
      if (candidates.size > 0) {
        totalCandidates += candidates.size;
        emptyCells++;
      }
    }
  }

  return emptyCells > 0 ? totalCandidates / emptyCells : 0;
}

/**
 * Analyze puzzle difficulty
 */
export function analyzeDifficulty(puzzle: Puzzle): DifficultyAnalysis {
  const engine = new SudokuEngine(puzzle);
  const reasoning: string[] = [];

  // Collect metrics
  const totalClues = countClues(puzzle);
  const emptyCells = countEmptyCells(engine);
  const nakedSingles = countNakedSingles(engine);
  const averageCandidates = calculateAverageCandidates(engine);

  const metrics = {
    totalClues,
    nakedSingles,
    hiddenSingles: 0, // Not implemented yet
    emptyCells,
    averageCandidates: Math.round(averageCandidates * 10) / 10,
  };

  // Calculate difficulty score (0-100)
  let score = 0;

  // Factor 1: Number of clues (more clues = easier)
  // Typical range: 80-150 clues for Samurai Sudoku
  const clueScore = Math.max(0, Math.min(100, ((150 - totalClues) / 70) * 100));
  score += clueScore * 0.3;
  reasoning.push(`Clue count: ${totalClues} (score: ${Math.round(clueScore)})`);

  // Factor 2: Naked singles (more naked singles = easier)
  // If > 20% of empty cells are naked singles, it's easier
  const nakedSingleRatio = emptyCells > 0 ? nakedSingles / emptyCells : 0;
  const nakedSingleScore = Math.max(0, 100 - nakedSingleRatio * 300);
  score += nakedSingleScore * 0.3;
  reasoning.push(
    `Naked singles: ${nakedSingles}/${emptyCells} (${Math.round(nakedSingleRatio * 100)}%, score: ${Math.round(nakedSingleScore)})`
  );

  // Factor 3: Average candidates (more candidates = harder)
  // Typical range: 3-7 candidates
  const candidateScore = Math.max(0, Math.min(100, ((averageCandidates - 3) / 4) * 100));
  score += candidateScore * 0.4;
  reasoning.push(
    `Avg candidates: ${averageCandidates.toFixed(1)} (score: ${Math.round(candidateScore)})`
  );

  reasoning.push(`Final score: ${Math.round(score)}/100`);

  // Determine difficulty
  let difficulty: Difficulty;
  if (score < 30) {
    difficulty = 'easy';
    reasoning.push('→ Difficulty: EASY (many clues, many naked singles)');
  } else if (score < 60) {
    difficulty = 'medium';
    reasoning.push('→ Difficulty: MEDIUM (moderate clues and techniques)');
  } else {
    difficulty = 'hard';
    reasoning.push('→ Difficulty: HARD (few clues, complex deduction needed)');
  }

  return {
    difficulty,
    score: Math.round(score),
    metrics,
    reasoning,
  };
}

/**
 * Analyze puzzle file
 */
export async function analyzePuzzleFile(filePath: string): Promise<DifficultyAnalysis> {
  const fs = await import('fs/promises');
  const content = await fs.readFile(filePath, 'utf-8');
  const puzzle: Puzzle = JSON.parse(content);

  return analyzeDifficulty(puzzle);
}

/**
 * CLI entry point
 */
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: tsx difficulty-analyzer.ts <puzzle-file.json>');
    process.exit(1);
  }

  const filePath = args[0];

  analyzePuzzleFile(filePath).then((result) => {
    console.log('Difficulty Analysis:');
    console.log('===================');
    console.log(`Difficulty: ${result.difficulty.toUpperCase()}`);
    console.log(`Score: ${result.score}/100`);
    console.log('\nMetrics:');
    console.log(`  Total Clues: ${result.metrics.totalClues}`);
    console.log(`  Empty Cells: ${result.metrics.emptyCells}`);
    console.log(`  Naked Singles: ${result.metrics.nakedSingles}`);
    console.log(`  Avg Candidates: ${result.metrics.averageCandidates}`);
    console.log('\nReasoning:');
    result.reasoning.forEach((line) => console.log(`  ${line}`));
  });
}
