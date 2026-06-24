#!/usr/bin/env tsx

import { readdir, readFile, writeFile } from 'fs/promises';
import { basename, join } from 'path';
import { isPuzzleId } from '@/lib/puzzles';
import { Puzzle, PuzzleIndex, PuzzleMetadata } from '@/lib/sudoku/types';
import { calculateChecksum } from '@/lib/utils';

/**
 * Build puzzle index from all puzzle files
 */
export async function buildPuzzleIndex(puzzlesDir: string = 'public/puzzles'): Promise<PuzzleIndex> {
  console.log(`Building index from ${puzzlesDir}...`);

  const allPuzzles: PuzzleMetadata[] = [];
  const seenIds = new Set<string>();
  const errors: string[] = [];
  let latestCreatedAt = 0;

  try {
    // Get all year directories
    const entries = await readdir(puzzlesDir, { withFileTypes: true });
    const years = entries
      .filter((e) => e.isDirectory())
      .filter((e) => /^\d{4}$/.test(e.name))
      .map((e) => e.name)
      .sort();

    console.log(`Found ${years.length} year directories: ${years.join(', ')}`);

    // Process each year
    for (const year of years) {
      const yearDir = join(puzzlesDir, year);
      const files = await readdir(yearDir);
      const jsonFiles = files.filter((f) => f.endsWith('.json'));

      console.log(`  ${year}: ${jsonFiles.length} puzzles`);

      // Process each puzzle file
      for (const file of jsonFiles) {
        const filePath = join(yearDir, file);

        try {
          const content = await readFile(filePath, 'utf-8');
          const puzzle: Puzzle = JSON.parse(content);
          const expectedId = basename(file, '.json');

          if (!isPuzzleId(puzzle.id)) {
            throw new Error(`Invalid puzzle ID "${puzzle.id}"`);
          }
          if (puzzle.id !== expectedId) {
            throw new Error(`Puzzle ID "${puzzle.id}" does not match filename "${expectedId}"`);
          }
          if (puzzle.id.slice(0, 4) !== year) {
            throw new Error(`Puzzle ID "${puzzle.id}" is stored in the wrong year directory`);
          }
          if (seenIds.has(puzzle.id)) {
            throw new Error(`Duplicate puzzle ID "${puzzle.id}"`);
          }
          seenIds.add(puzzle.id);

          // Extract metadata
          const metadata: PuzzleMetadata = {
            id: puzzle.id,
            difficulty: puzzle.difficulty,
            estimatedTime: puzzle.metadata.estimatedTime,
            checksum: puzzle.metadata.checksum || calculateChecksum(puzzle),
            tags: puzzle.metadata.tags || ['daily'],
          };

          allPuzzles.push(metadata);
          const createdAt = new Date(puzzle.metadata.createdAt).getTime();
          const fallbackCreatedAt = new Date(`${puzzle.id}T00:00:00.000Z`).getTime();
          latestCreatedAt = Math.max(
            latestCreatedAt,
            Number.isNaN(createdAt) ? fallbackCreatedAt : createdAt,
          );
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          errors.push(`${filePath}: ${message}`);
        }
      }
    }

    if (errors.length > 0) {
      errors.forEach((error) => console.error(`    Error: ${error}`));
      throw new Error(`Puzzle index was not written because ${errors.length} file(s) failed.`);
    }

    // Sort by date (newest first)
    allPuzzles.sort((a, b) => b.id.localeCompare(a.id));

    const index: PuzzleIndex = {
      puzzles: allPuzzles,
      total: allPuzzles.length,
      lastUpdated: new Date(latestCreatedAt || 0).toISOString(),
    };

    // Write index file
    const indexPath = join(puzzlesDir, 'index.json');
    await writeFile(indexPath, `${JSON.stringify(index, null, 2)}\n`);

    console.log(`\n✅ Index built successfully:`);
    console.log(`   Total puzzles: ${index.total}`);
    console.log(`   Output: ${indexPath}`);

    return index;
  } catch (error) {
    console.error('❌ Error building index:', error);
    throw error;
  }
}

/**
 * CLI entry point
 */
if (require.main === module) {
  const args = process.argv.slice(2);
  const puzzlesDir = args[0] || 'public/puzzles';

  buildPuzzleIndex(puzzlesDir)
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to build index:', error);
      process.exit(1);
    });
}
