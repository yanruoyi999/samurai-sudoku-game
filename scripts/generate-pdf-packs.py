#!/usr/bin/env python3
"""Generate deterministic free and paid Samurai Sudoku PDF packs."""

from __future__ import annotations

import hashlib
import json
import shutil
import zipfile
from pathlib import Path

from reportlab.lib.colors import Color, HexColor, black, white
from reportlab.lib.pagesizes import A4, LETTER
from reportlab.lib.units import mm
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
PUZZLE_ROOT = ROOT / "public" / "puzzles"
PUBLIC_DOWNLOADS = ROOT / "public" / "downloads"
PRIVATE_ASSETS = ROOT / "private-assets"
TEMP_DIR = ROOT / "tmp" / "pdfs"

PRODUCT_ID = "samurai-sudoku-100-pack-v1"
DIFFICULTIES = ("easy", "medium", "hard", "evil")
GRID_ORIGINS = ((0, 0), (0, 12), (6, 6), (12, 0), (12, 12))

INK = HexColor("#20201d")
ACCENT = HexColor("#9a3412")
MUTED = HexColor("#6b7280")
PAPER = HexColor("#fffdfa")
LIGHT = HexColor("#e7e2d9")


def draw_centered(pdf: canvas.Canvas, text: str, center_x: float, baseline_y: float) -> None:
    pdf.drawCentredString(center_x, baseline_y, text)


def load_puzzle_index() -> list[dict]:
    index = json.loads((PUZZLE_ROOT / "index.json").read_text(encoding="utf-8"))
    puzzles = index.get("puzzles")
    if not isinstance(puzzles, list):
        raise ValueError("Puzzle index is missing its puzzles array.")
    return puzzles


def select_balanced(puzzles: list[dict], per_difficulty: int) -> list[dict]:
    selected: list[dict] = []
    for difficulty in DIFFICULTIES:
        matches = [puzzle for puzzle in puzzles if puzzle.get("difficulty") == difficulty]
        if len(matches) < per_difficulty:
            raise ValueError(f"Need {per_difficulty} {difficulty} puzzles, found {len(matches)}.")
        selected.extend(matches[:per_difficulty])
    return selected


def load_puzzle(metadata: dict) -> dict:
    puzzle_id = metadata["id"]
    path = PUZZLE_ROOT / puzzle_id[:4] / f"{puzzle_id}.json"
    puzzle = json.loads(path.read_text(encoding="utf-8"))
    if puzzle.get("id") != puzzle_id or puzzle.get("difficulty") != metadata.get("difficulty"):
        raise ValueError(f"Puzzle metadata mismatch: {path}")
    if not isinstance(puzzle.get("grids"), list) or len(puzzle["grids"]) != 5:
        raise ValueError(f"Puzzle must contain five grids: {path}")
    return puzzle


def global_board(puzzle: dict, solved: bool) -> list[list[int | None]]:
    board: list[list[int | None]] = [[None for _ in range(21)] for _ in range(21)]
    matrix_name = "solution" if solved else "initial"

    for grid, (row_offset, col_offset) in zip(puzzle["grids"], GRID_ORIGINS):
        matrix = grid.get(matrix_name)
        if not isinstance(matrix, list) or len(matrix) != 9:
            raise ValueError(f"Puzzle {puzzle['id']} has no valid {matrix_name} matrix.")
        for row in range(9):
            if not isinstance(matrix[row], list) or len(matrix[row]) != 9:
                raise ValueError(f"Puzzle {puzzle['id']} has an invalid {matrix_name} row.")
            for col in range(9):
                value = int(matrix[row][col])
                global_row = row_offset + row
                global_col = col_offset + col
                existing = board[global_row][global_col]
                if existing is not None and existing != value:
                    raise ValueError(f"Puzzle {puzzle['id']} has conflicting overlap values.")
                board[global_row][global_col] = value
    return board


def draw_cover(pdf: canvas.Canvas, title: str, subtitle: str, puzzle_count: int, page_size: tuple[float, float]) -> None:
    width, height = page_size
    pdf.setFillColor(PAPER)
    pdf.rect(0, 0, width, height, fill=1, stroke=0)
    pdf.setFillColor(ACCENT)
    pdf.rect(0, height - 13 * mm, width, 13 * mm, fill=1, stroke=0)

    pdf.setFillColor(INK)
    pdf.setFont("Helvetica-Bold", 25)
    draw_centered(pdf, title, width / 2, height - 58 * mm)
    pdf.setFont("Helvetica", 12)
    pdf.setFillColor(MUTED)
    draw_centered(pdf, subtitle, width / 2, height - 69 * mm)

    pdf.setStrokeColor(ACCENT)
    pdf.setLineWidth(1.2)
    pdf.line(28 * mm, height - 82 * mm, width - 28 * mm, height - 82 * mm)

    features = [
        f"{puzzle_count} original Samurai Sudoku puzzles",
        "Easy, Medium, Hard, and Evil levels",
        "Complete answer keys in the same file",
        "Black-and-white vector layout for clear printing",
        "No registration required for the free starter pack",
    ]
    pdf.setFont("Helvetica", 11)
    pdf.setFillColor(INK)
    y = height - 103 * mm
    for feature in features:
        pdf.setFillColor(ACCENT)
        pdf.circle(33 * mm, y + 1.2 * mm, 1.1 * mm, fill=1, stroke=0)
        pdf.setFillColor(INK)
        pdf.drawString(40 * mm, y - 1.5 * mm, feature)
        y -= 11 * mm

    pdf.setFillColor(MUTED)
    pdf.setFont("Helvetica", 9)
    draw_centered(pdf, "Generated and validated by SamuraiSudoku.net", width / 2, 24 * mm)
    draw_centered(pdf, "Personal and classroom use. Do not resell or redistribute the pack.", width / 2, 18 * mm)
    pdf.showPage()


def draw_section_page(pdf: canvas.Canvas, title: str, body: str, page_size: tuple[float, float]) -> None:
    width, height = page_size
    pdf.setFillColor(PAPER)
    pdf.rect(0, 0, width, height, fill=1, stroke=0)
    pdf.setFillColor(ACCENT)
    pdf.rect(0, height - 13 * mm, width, 13 * mm, fill=1, stroke=0)
    pdf.setFillColor(INK)
    pdf.setFont("Helvetica-Bold", 28)
    draw_centered(pdf, title, width / 2, height / 2 + 12 * mm)
    pdf.setFillColor(MUTED)
    pdf.setFont("Helvetica", 11)
    draw_centered(pdf, body, width / 2, height / 2 - 2 * mm)
    pdf.showPage()


def draw_puzzle_page(
    pdf: canvas.Canvas,
    puzzle: dict,
    solved: bool,
    sequence: int,
    total: int,
    page_size: tuple[float, float],
) -> None:
    width, height = page_size
    pdf.setFillColor(white)
    pdf.rect(0, 0, width, height, fill=1, stroke=0)

    label = "Answer" if solved else "Puzzle"
    difficulty = str(puzzle["difficulty"]).capitalize()
    pdf.setFillColor(INK)
    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawString(15 * mm, height - 16 * mm, f"Samurai Sudoku {label} {sequence:03d}")
    pdf.setFont("Helvetica", 9)
    pdf.setFillColor(MUTED)
    right_text = f"{difficulty}  |  {puzzle['id']}  |  {sequence}/{total}"
    pdf.drawRightString(width - 15 * mm, height - 15.5 * mm, right_text)

    max_board_width = width - 24 * mm
    max_board_height = height - 48 * mm
    board_size = min(max_board_width, max_board_height)
    x = (width - board_size) / 2
    y = (height - board_size) / 2 - 2 * mm
    draw_board(pdf, global_board(puzzle, solved), x, y, board_size)

    pdf.setFont("Helvetica", 8)
    pdf.setFillColor(MUTED)
    footer = (
        "Answer key - compare only after completing your deductions."
        if solved
        else "Use pencil candidates. Each row, column, and 3x3 box in all five grids contains 1-9 once."
    )
    draw_centered(pdf, footer, width / 2, 8 * mm)
    pdf.showPage()


def draw_two_up_page(
    pdf: canvas.Canvas,
    puzzles: list[dict],
    solved: bool,
    first_sequence: int,
    total: int,
    page_size: tuple[float, float],
) -> None:
    width, height = page_size
    section_height = height / 2
    pdf.setFillColor(white)
    pdf.rect(0, 0, width, height, fill=1, stroke=0)

    for slot, puzzle in enumerate(puzzles):
        section_bottom = height - (slot + 1) * section_height
        section_top = section_bottom + section_height
        sequence = first_sequence + slot
        label = "Answer" if solved else "Puzzle"
        difficulty = str(puzzle["difficulty"]).capitalize()

        pdf.setFillColor(INK)
        pdf.setFont("Helvetica-Bold", 10)
        pdf.drawString(15 * mm, section_top - 10 * mm, f"Samurai Sudoku {label} {sequence:03d}")
        pdf.setFont("Helvetica", 7.5)
        pdf.setFillColor(MUTED)
        pdf.drawRightString(
            width - 15 * mm,
            section_top - 9.8 * mm,
            f"{difficulty}  |  {puzzle['id']}  |  {sequence}/{total}",
        )

        board_size = min(width - 34 * mm, section_height - 27 * mm)
        board_x = (width - board_size) / 2
        board_y = section_bottom + 8 * mm
        draw_board(pdf, global_board(puzzle, solved), board_x, board_y, board_size)

    pdf.setStrokeColor(LIGHT)
    pdf.setLineWidth(0.6)
    pdf.line(12 * mm, height / 2, width - 12 * mm, height / 2)
    pdf.showPage()


def draw_board(pdf: canvas.Canvas, board: list[list[int | None]], x: float, y: float, size: float) -> None:
    cell = size / 21
    pdf.setFillColor(white)
    pdf.rect(x, y, size, size, fill=1, stroke=0)

    # Lightly shade overlap boxes so the five-grid dependency is visible on paper.
    pdf.setFillColor(Color(0.97, 0.95, 0.91))
    for row, col in ((6, 6), (6, 12), (12, 6), (12, 12)):
        pdf.rect(x + col * cell, y + (21 - row - 3) * cell, 3 * cell, 3 * cell, fill=1, stroke=0)

    pdf.setStrokeColor(LIGHT)
    pdf.setLineWidth(0.3)
    for row in range(21):
        for col in range(21):
            if board[row][col] is None:
                continue
            cell_x = x + col * cell
            cell_y = y + (20 - row) * cell
            pdf.rect(cell_x, cell_y, cell, cell, fill=0, stroke=1)

    for row_offset, col_offset in GRID_ORIGINS:
        left = x + col_offset * cell
        bottom = y + (21 - row_offset - 9) * cell
        for index in range(10):
            line_width = 1.35 if index in (0, 3, 6, 9) else 0.45
            pdf.setStrokeColor(INK)
            pdf.setLineWidth(line_width)
            pdf.line(left + index * cell, bottom, left + index * cell, bottom + 9 * cell)
            pdf.line(left, bottom + index * cell, left + 9 * cell, bottom + index * cell)

    font_size = max(7.5, min(12, cell * 0.53))
    pdf.setFont("Helvetica-Bold", font_size)
    pdf.setFillColor(INK)
    for row in range(21):
        for col in range(21):
            value = board[row][col]
            if not value:
                continue
            text = str(value)
            center_x = x + (col + 0.5) * cell
            center_y = y + (20 - row + 0.5) * cell
            pdf.drawString(
                center_x - stringWidth(text, "Helvetica-Bold", font_size) / 2,
                center_y - font_size * 0.34,
                text,
            )


def generate_pdf(
    path: Path,
    puzzles: list[dict],
    page_size: tuple[float, float],
    paper_label: str,
    title: str,
    puzzles_per_page: int = 1,
) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    pdf = canvas.Canvas(str(path), pagesize=page_size, pageCompression=1, invariant=1)
    pdf.setTitle(title)
    pdf.setAuthor("SamuraiSudoku.net")
    pdf.setSubject(f"Printable Samurai Sudoku puzzles and answers - {paper_label}")
    layout_label = "one puzzle per page" if puzzles_per_page == 1 else "two puzzles per page"
    draw_cover(
        pdf,
        title,
        f"{paper_label} edition, {layout_label}, with complete solutions",
        len(puzzles),
        page_size,
    )

    loaded = [load_puzzle(metadata) for metadata in puzzles]
    if puzzles_per_page == 1:
        for sequence, puzzle in enumerate(loaded, start=1):
            draw_puzzle_page(pdf, puzzle, False, sequence, len(loaded), page_size)
    else:
        for offset in range(0, len(loaded), 2):
            draw_two_up_page(pdf, loaded[offset:offset + 2], False, offset + 1, len(loaded), page_size)

    draw_section_page(
        pdf,
        "Answer Keys",
        "Each answer uses the same puzzle number and date as the puzzle section.",
        page_size,
    )
    if puzzles_per_page == 1:
        for sequence, puzzle in enumerate(loaded, start=1):
            draw_puzzle_page(pdf, puzzle, True, sequence, len(loaded), page_size)
    else:
        for offset in range(0, len(loaded), 2):
            draw_two_up_page(pdf, loaded[offset:offset + 2], True, offset + 1, len(loaded), page_size)
    pdf.save()


def add_zip_bytes(archive: zipfile.ZipFile, name: str, content: bytes) -> None:
    entry = zipfile.ZipInfo(name, date_time=(2026, 7, 13, 0, 0, 0))
    entry.compress_type = zipfile.ZIP_DEFLATED
    entry.external_attr = 0o644 << 16
    archive.writestr(entry, content)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def artifact(path: Path, kind: str) -> dict:
    return {
        "path": path.relative_to(ROOT).as_posix(),
        "kind": kind,
        "bytes": path.stat().st_size,
        "sha256": sha256(path),
    }


def main() -> None:
    puzzles = load_puzzle_index()
    starter = select_balanced(puzzles, 5)
    paid = select_balanced(puzzles, 25)

    PUBLIC_DOWNLOADS.mkdir(parents=True, exist_ok=True)
    PRIVATE_ASSETS.mkdir(parents=True, exist_ok=True)
    TEMP_DIR.mkdir(parents=True, exist_ok=True)

    free_a4 = PUBLIC_DOWNLOADS / "samurai-sudoku-starter-pack-with-solutions-a4.pdf"
    free_letter = PUBLIC_DOWNLOADS / "samurai-sudoku-starter-pack-with-solutions-letter.pdf"
    free_a4_two_up = PUBLIC_DOWNLOADS / "samurai-sudoku-starter-pack-with-solutions-a4-2-per-page.pdf"
    free_letter_two_up = PUBLIC_DOWNLOADS / "samurai-sudoku-starter-pack-with-solutions-letter-2-per-page.pdf"
    paid_a4 = TEMP_DIR / "samurai-sudoku-100-puzzles-with-solutions-a4.pdf"
    paid_letter = TEMP_DIR / "samurai-sudoku-100-puzzles-with-solutions-letter.pdf"
    paid_a4_two_up = TEMP_DIR / "samurai-sudoku-100-puzzles-with-solutions-a4-2-per-page.pdf"
    paid_letter_two_up = TEMP_DIR / "samurai-sudoku-100-puzzles-with-solutions-letter-2-per-page.pdf"
    paid_zip = PRIVATE_ASSETS / "samurai-sudoku-100-puzzle-pack.zip"

    generate_pdf(free_a4, starter, A4, "A4", "20 Free Samurai Sudoku Puzzles")
    generate_pdf(free_letter, starter, LETTER, "US Letter", "20 Free Samurai Sudoku Puzzles")
    generate_pdf(free_a4_two_up, starter, A4, "A4", "20 Free Samurai Sudoku Puzzles", 2)
    generate_pdf(free_letter_two_up, starter, LETTER, "US Letter", "20 Free Samurai Sudoku Puzzles", 2)
    generate_pdf(paid_a4, paid, A4, "A4", "100 Samurai Sudoku Printable Puzzles")
    generate_pdf(paid_letter, paid, LETTER, "US Letter", "100 Samurai Sudoku Printable Puzzles")
    generate_pdf(paid_a4_two_up, paid, A4, "A4", "100 Samurai Sudoku Printable Puzzles", 2)
    generate_pdf(paid_letter_two_up, paid, LETTER, "US Letter", "100 Samurai Sudoku Printable Puzzles", 2)

    readme = """100 Samurai Sudoku Printable Puzzles

Included:
- 100 puzzles: 25 Easy, 25 Medium, 25 Hard, and 25 Evil
- Complete answer keys
- A4 and US Letter PDF editions
- One-puzzle-per-page and two-puzzles-per-page layouts
- Vector black-and-white layouts for clear printing

License: personal and classroom use. Do not resell or redistribute this pack.
Support: feedback@samuraisudoku.net
Website: https://www.samuraisudoku.net/en/games/samurai/pdf
"""
    with zipfile.ZipFile(paid_zip, "w") as archive:
        add_zip_bytes(archive, paid_a4.name, paid_a4.read_bytes())
        add_zip_bytes(archive, paid_letter.name, paid_letter.read_bytes())
        add_zip_bytes(archive, paid_a4_two_up.name, paid_a4_two_up.read_bytes())
        add_zip_bytes(archive, paid_letter_two_up.name, paid_letter_two_up.read_bytes())
        add_zip_bytes(archive, "README.txt", readme.encode("utf-8"))

    manifest = {
        "productId": PRODUCT_ID,
        "paidPuzzleCount": len(paid),
        "freePuzzleCount": len(starter),
        "difficultyCounts": {
            difficulty: {
                "paid": sum(1 for puzzle in paid if puzzle["difficulty"] == difficulty),
                "free": sum(1 for puzzle in starter if puzzle["difficulty"] == difficulty),
            }
            for difficulty in DIFFICULTIES
        },
        "artifacts": [
            artifact(paid_zip, "zip"),
            artifact(free_a4, "pdf"),
            artifact(free_letter, "pdf"),
            artifact(free_a4_two_up, "pdf"),
            artifact(free_letter_two_up, "pdf"),
        ],
    }
    (PRIVATE_ASSETS / "pdf-pack-manifest.json").write_text(
        json.dumps(manifest, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )

    shutil.rmtree(TEMP_DIR, ignore_errors=True)
    print(f"Generated {len(starter)} free and {len(paid)} paid Samurai Sudoku puzzles.")
    for entry in manifest["artifacts"]:
        print(f"- {entry['path']}: {entry['bytes']} bytes")


if __name__ == "__main__":
    main()
