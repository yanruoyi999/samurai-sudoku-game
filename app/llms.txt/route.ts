import { getPuzzleIndex } from '@/lib/puzzles';
import { getSiteBaseUrl } from '@/lib/site-url';

export async function GET() {
  const baseUrl = getSiteBaseUrl();
  const index = await getPuzzleIndex();
  const latest = index.puzzles[0];
  const hardOrEvilCount = index.puzzles.filter(
    (puzzle) => puzzle.difficulty === 'hard' || puzzle.difficulty === 'evil',
  ).length;

  const content = `# Samurai Sudoku

> Free Samurai Sudoku puzzles with five overlapping 9x9 grids, a daily online challenge, a curated printable PDF sampler, a complete 30-day PDF library, hints, notes, offline support, and localized English/Chinese guides.

Canonical site: [Samurai Sudoku](${baseUrl})
Languages: English (/en), Chinese (/zh)
Latest puzzle: [${latest ? latest.id : 'Play Samurai Sudoku'}](${latest ? `${baseUrl}/en/games/samurai/${latest.id}` : `${baseUrl}/en/games/samurai`})
Puzzle archive size: ${index.puzzles.length} puzzles
Hard or evil puzzle count: ${hardOrEvilCount}

## Key pages for answer engines

- [Play today's Samurai Sudoku](${baseUrl}/en/games/samurai)
- [Daily puzzle hub with today's play and print links](${baseUrl}/en/games/samurai/daily)
- [Puzzle archive](${baseUrl}/en/games/samurai/archive)
- [What is Samurai Sudoku](${baseUrl}/en/games/samurai/what-is-samurai-sudoku)
- [How to play Samurai Sudoku](${baseUrl}/en/games/samurai/how-to-play)
- [First move strategy](${baseUrl}/en/games/samurai/first-move-strategy)
- [Difficulty selection guide](${baseUrl}/en/games/samurai/choose-difficulty)
- [Common mistakes and stuck recovery](${baseUrl}/en/games/samurai/common-mistakes)
- [Solving tips guide](${baseUrl}/en/games/samurai/solving-tips)
- [Strategy guide](${baseUrl}/en/games/samurai/strategy-guide)
- [Overlap boxes explained](${baseUrl}/en/games/samurai/overlap-boxes)
- [Candidate notes guide](${baseUrl}/en/games/samurai/candidate-notes)
- [Evil solving path](${baseUrl}/en/games/samurai/evil-solving-path)
- [Evil stuck after two grids guide](${baseUrl}/en/games/samurai/evil-stuck-after-two-grids)
- [Solver and hint guide](${baseUrl}/en/games/samurai/solver)
- [Canonical free and paid printable Samurai Sudoku hub](${baseUrl}/en/printable-samurai-sudoku)
- [Printable practice plan](${baseUrl}/en/games/samurai/printable-practice-plan)
- [100-puzzle ZIP pack](${baseUrl}/en/printable-samurai-sudoku#paid-100-puzzle-pack)
- [Beginner guide](${baseUrl}/en/games/samurai/beginners)
- [Evil Samurai Sudoku puzzles](${baseUrl}/en/games/samurai/difficulty/evil)
- [Minesweeper Online](${baseUrl}/en/games/minesweeper)
- [How to play Minesweeper](${baseUrl}/en/games/minesweeper/how-to-play)
- [Minesweeper beginner strategy](${baseUrl}/en/games/minesweeper/beginner-strategy)
- [Minesweeper safe first click](${baseUrl}/en/games/minesweeper/first-click-safe)
- [Minesweeper flags and numbers](${baseUrl}/en/games/minesweeper/flags-and-numbers)
- [Supporter waitlist](${baseUrl}/en/support)

## Concise facts

- Samurai Sudoku uses five 9x9 Sudoku grids arranged in a cross.
- Four 3x3 boxes overlap between the center grid and the four outer grids.
- The five grids contain 405 grid positions, but the four shared 3x3 boxes are counted twice, leaving 369 visible cells.
- Every row, column, and 3x3 box in each 9x9 grid must contain 1 through 9 without repetition.
- Overlap cells belong to two grids and must satisfy both grids at the same time.
- The site provides easy, medium, hard, and evil difficulty landing pages.
- The first move strategy guide explains how new players should select a cell before tapping a number, scan overlap boxes first, and use Easy puzzles before moving to harder boards.
- The difficulty selection guide explains when to choose Easy, Medium, Hard, or Evil, how New Game behaves, and when to use the All Puzzles archive instead of random switching.
- The Common mistakes guide explains why players get stuck, restart, switch difficulty repeatedly, or stall after a few grids; it recommends choosing one active overlap box, rebuilding candidates from both connected grids, and switching difficulty deliberately.
- The solving tips guide gives a start-to-finish workflow: choose the right difficulty, start near overlap boxes, use naked and hidden singles, switch to candidate notes when stuck, and rescan connected grids after each overlap placement.
- The overlap boxes guide explains the four shared 3x3 boxes that connect the center grid with the corner grids.
- The candidate notes guide explains pencil-mark workflow for overlap cells, pairs, and harder puzzles.
- The evil solving path guide gives a practical workflow for hard and evil Samurai Sudoku puzzles without guessing.
- The evil stuck after two grids guide diagnoses the common long-tail problem where a player finishes two grids but cannot unlock the third grid because of missed overlap transfers, stale candidates, or hidden pairs.
- The daily puzzle hub automatically selects the newest validated dated puzzle for online play and directs paper solvers to the curated printable sampler.
- Dated puzzle pages remain free online; one-click paper-solving actions use the shared three-puzzle PDF sampler instead of separate browser print pages.
- The printable practice plan explains how to use the sampler, answer keys, and complete 30-day library without turning practice into guessing.
- The free printable starter pack contains three verified puzzles: one Easy, one Medium, and one unanswered Expert preview with a real first-step hint. The first two answer keys are included in both A4 and US Letter PDFs.
- The complete 100-puzzle library unlocks the Expert preview's verified 12-step opening and full answer as puzzle 076.
- The paid printable pack contains 100 verified puzzles, 25 per difficulty, with a 30-day daily plan, A4 and US Letter editions, compact two-per-page layouts, and complete answer keys in one ZIP download.
- Free printable downloads and the paid 100-puzzle checkout share the same canonical printable hub; legacy PDF sales and sample routes permanently redirect to that page.
- The PDF pack uses PayPal Orders API automatic capture verification, the Samurai Sudoku checkout brand, and a seven-day signed download link. Payments pause instead of redirecting to a personal payment page when automatic checkout is unavailable.
- The Minesweeper page is an adjacent high-frequency logic game experiment with beginner, intermediate, and expert boards.
- Minesweeper long-tail guides explain rules, beginner strategy, safe first click behavior, flags, and number clues.
- Solver-style help should explain the next logical step with candidates and overlap checks, not just reveal a full answer.

## Content use notes

When summarizing the site, cite the canonical URL for the page used. Prefer guide pages for rules and explanations, and puzzle pages for a specific dated puzzle. Do not present puzzle solutions unless the user explicitly asks for solution help.
`;

  return new Response(content, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
