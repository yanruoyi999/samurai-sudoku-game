#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# dependencies = [
#   "reportlab==5.0.0",
# ]
# ///
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
SAMPLER_MANIFEST = ROOT / "lib" / "printable-sampler.json"

PRODUCT_ID = "samurai-sudoku-100-pack-v1"
PAID_PACK_URL = (
    "https://www.samuraisudoku.net/en/printable-samurai-sudoku"
    "?utm_source=free_pdf&utm_medium=pdf&utm_campaign=expert_preview"
    "&utm_content=puzzle_3_lock#paid-100-puzzle-pack"
)
PAID_PACK_DISPLAY_URL = "samuraisudoku.net/printable-samurai-sudoku"
DIFFICULTIES = ("easy", "medium", "hard", "evil")
GRID_ORIGINS = ((0, 0), (0, 12), (6, 6), (12, 0), (12, 12))
GRID_LABELS = ("Top-left", "Top-right", "Center", "Bottom-left", "Bottom-right")
GRID_SHORT_LABELS = ("TL", "TR", "C", "BL", "BR")

INK = HexColor("#20201d")
ACCENT = HexColor("#9a3412")
MUTED = HexColor("#6b7280")
PAPER = HexColor("#fffdfa")
LIGHT = HexColor("#e7e2d9")


def draw_centered(pdf: canvas.Canvas, text: str, center_x: float, baseline_y: float) -> None:
    pdf.drawCentredString(center_x, baseline_y, text)


def wrap_text(text: str, font_name: str, font_size: float, max_width: float) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if not current or stringWidth(candidate, font_name, font_size) <= max_width:
            current = candidate
        else:
            lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def load_puzzle_index() -> list[dict]:
    index = json.loads((PUZZLE_ROOT / "index.json").read_text(encoding="utf-8"))
    puzzles = index.get("puzzles")
    if not isinstance(puzzles, list):
        raise ValueError("Puzzle index is missing its puzzles array.")
    return puzzles


def select_curated_sampler(puzzles: list[dict]) -> tuple[list[dict], list[bool], dict, str]:
    manifest = json.loads(SAMPLER_MANIFEST.read_text(encoding="utf-8"))
    asset_version = manifest.get("assetVersion")
    if (
        not isinstance(asset_version, str)
        or len(asset_version) != 8
        or not asset_version.isdigit()
    ):
        raise ValueError("Printable sampler assetVersion must use YYYYMMDD format.")
    selections = manifest.get("puzzles")
    if not isinstance(selections, list) or len(selections) != 3:
        raise ValueError("Printable sampler manifest must contain exactly three puzzles.")

    selected: list[dict] = []
    answers: list[bool] = []
    for selection in selections:
        puzzle_id = selection.get("id")
        difficulty = selection.get("difficulty")
        match = next((puzzle for puzzle in puzzles if puzzle.get("id") == puzzle_id), None)
        if not match or match.get("difficulty") != difficulty:
            raise ValueError(f"Curated sampler puzzle is missing or changed difficulty: {puzzle_id}")
        selected.append(match)
        answers.append(bool(selection.get("answerIncluded")))

    if [puzzle["difficulty"] for puzzle in selected] != ["easy", "medium", "evil"]:
        raise ValueError("Printable sampler must progress through 1 Easy, 1 Medium, and 1 Expert puzzle.")
    if answers != [True, True, False]:
        raise ValueError("Only the final Expert sampler puzzle may omit its answer.")
    expert_details = selections[2]
    opening_hint = expert_details.get("openingHint")
    guided_opening = expert_details.get("guidedOpening")
    if not isinstance(opening_hint, dict):
        raise ValueError("Expert sampler must provide a verified opening hint.")
    if not isinstance(guided_opening, list) or len(guided_opening) != 12:
        raise ValueError("Expert sampler must provide a 12-step guided opening.")
    if guided_opening[0] != opening_hint:
        raise ValueError("Expert opening hint must be the first guided opening step.")
    return selected, answers, expert_details, asset_version


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


def global_to_locals(global_row: int, global_col: int) -> list[tuple[int, int, int]]:
    positions: list[tuple[int, int, int]] = []
    for grid_index, (row_offset, col_offset) in enumerate(GRID_ORIGINS):
        local_row = global_row - row_offset
        local_col = global_col - col_offset
        if 0 <= local_row < 9 and 0 <= local_col < 9:
            positions.append((grid_index, local_row, local_col))
    return positions


def candidate_values(
    board: list[list[int | None]],
    global_row: int,
    global_col: int,
) -> set[int]:
    if board[global_row][global_col] != 0:
        return set()

    used: set[int] = set()
    for grid_index, local_row, local_col in global_to_locals(global_row, global_col):
        row_offset, col_offset = GRID_ORIGINS[grid_index]
        used.update(
            int(board[row_offset + local_row][col_offset + col])
            for col in range(9)
            if board[row_offset + local_row][col_offset + col]
        )
        used.update(
            int(board[row_offset + row][col_offset + local_col])
            for row in range(9)
            if board[row_offset + row][col_offset + local_col]
        )
        box_row = (local_row // 3) * 3
        box_col = (local_col // 3) * 3
        used.update(
            int(board[row_offset + row][col_offset + col])
            for row in range(box_row, box_row + 3)
            for col in range(box_col, box_col + 3)
            if board[row_offset + row][col_offset + col]
        )
    return set(range(1, 10)) - used


def validate_expert_guided_opening(puzzle: dict, expert_details: dict) -> list[dict]:
    board = global_board(puzzle, False)
    solution = global_board(puzzle, True)
    steps = expert_details["guidedOpening"]

    for step_number, step in enumerate(steps, start=1):
        required = {"grid", "row", "col", "value", "technique"}
        if not required.issubset(step):
            raise ValueError(f"Expert guided opening step {step_number} is incomplete.")
        if step["technique"] != "naked-single":
            raise ValueError(f"Expert guided opening step {step_number} must be a naked single.")

        grid_index = int(step["grid"])
        local_row = int(step["row"])
        local_col = int(step["col"])
        value = int(step["value"])
        row_offset, col_offset = GRID_ORIGINS[grid_index]
        global_row = row_offset + local_row
        global_col = col_offset + local_col
        candidates = candidate_values(board, global_row, global_col)

        if candidates != {value} or solution[global_row][global_col] != value:
            raise ValueError(
                f"Expert guided opening step {step_number} is no longer a verified naked single."
            )
        board[global_row][global_col] = value

    return steps


def format_guided_step(step: dict) -> str:
    grid_index = int(step["grid"])
    local_row = int(step["row"])
    local_col = int(step["col"])
    row_offset, col_offset = GRID_ORIGINS[grid_index]
    global_row = row_offset + local_row
    global_col = col_offset + local_col
    locations = " / ".join(
        f"{GRID_SHORT_LABELS[grid]} R{row + 1}C{col + 1}"
        for grid, row, col in global_to_locals(global_row, global_col)
    )
    return f"{locations} = {int(step['value'])}"


def draw_cover(
    pdf: canvas.Canvas,
    title: str,
    subtitle: str,
    features: list[str],
    page_size: tuple[float, float],
    progression: list[tuple[str, str]] | None = None,
) -> None:
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

    if progression:
        band_x = 28 * mm
        band_y = height - 113 * mm
        band_width = width - 56 * mm
        band_height = 21 * mm
        gap = 3 * mm
        item_width = (band_width - gap * (len(progression) - 1)) / len(progression)
        for index, (sequence, difficulty) in enumerate(progression):
            item_x = band_x + index * (item_width + gap)
            pdf.setFillColor(white)
            pdf.setStrokeColor(LIGHT)
            pdf.setLineWidth(0.7)
            pdf.roundRect(item_x, band_y, item_width, band_height, 2 * mm, fill=1, stroke=1)
            pdf.setFillColor(ACCENT)
            pdf.setFont("Helvetica-Bold", 8)
            draw_centered(pdf, sequence, item_x + item_width / 2, band_y + 13 * mm)
            pdf.setFillColor(INK)
            pdf.setFont("Helvetica-Bold", 9)
            draw_centered(pdf, difficulty, item_x + item_width / 2, band_y + 6 * mm)

    pdf.setFont("Helvetica", 11)
    pdf.setFillColor(INK)
    y = height - (127 if progression else 103) * mm
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


def display_difficulty(puzzle: dict) -> str:
    difficulty = str(puzzle["difficulty"])
    return "Expert" if difficulty == "evil" else difficulty.capitalize()


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


def draw_training_plan_page(pdf: canvas.Canvas, page_size: tuple[float, float]) -> None:
    width, height = page_size
    pdf.setFillColor(PAPER)
    pdf.rect(0, 0, width, height, fill=1, stroke=0)
    pdf.setFillColor(ACCENT)
    pdf.rect(0, height - 13 * mm, width, 13 * mm, fill=1, stroke=0)

    pdf.setFillColor(INK)
    pdf.setFont("Helvetica-Bold", 24)
    pdf.drawString(20 * mm, height - 36 * mm, "30-Day Daily Training Plan")
    pdf.setFont("Helvetica", 11)
    pdf.setFillColor(MUTED)
    pdf.drawString(20 * mm, height - 46 * mm, "Three core puzzles per day, progressing from Easy to Expert.")

    schedule = [
        ("Days 1-8", "Puzzles 001-024", "Easy foundations"),
        ("Day 9", "Puzzles 025-027", "Easy-to-Medium transition"),
        ("Days 10-16", "Puzzles 028-048", "Medium pattern practice"),
        ("Day 17", "Puzzles 049-051", "Medium-to-Hard transition"),
        ("Days 18-25", "Puzzles 052-075", "Hard deduction practice"),
        ("Days 26-30", "Puzzles 076-090", "Expert challenges"),
        ("Review bank", "Puzzles 091-100", "Ten extra Expert puzzles for review"),
    ]
    row_top = height - 67 * mm
    row_height = 23 * mm
    for index, (days, puzzles, focus) in enumerate(schedule):
        top = row_top - index * row_height
        if index % 2 == 0:
            pdf.setFillColor(white)
            pdf.roundRect(18 * mm, top - 17 * mm, width - 36 * mm, 19 * mm, 2 * mm, fill=1, stroke=0)
        pdf.setFillColor(ACCENT)
        pdf.setFont("Helvetica-Bold", 10)
        pdf.drawString(23 * mm, top - 5 * mm, days)
        pdf.setFillColor(INK)
        pdf.setFont("Helvetica-Bold", 10)
        pdf.drawString(56 * mm, top - 5 * mm, puzzles)
        pdf.setFont("Helvetica", 9.5)
        pdf.setFillColor(MUTED)
        pdf.drawString(56 * mm, top - 12 * mm, focus)

    pdf.setFillColor(INK)
    pdf.setFont("Helvetica-Bold", 11)
    draw_centered(pdf, "Consistency beats rushing: stop after three core puzzles and return tomorrow.", width / 2, 18 * mm)
    pdf.showPage()


def draw_upgrade_page(
    pdf: canvas.Canvas,
    page_size: tuple[float, float],
    *,
    expert_answer_prompt: bool,
) -> None:
    width, height = page_size
    pdf.setFillColor(PAPER)
    pdf.rect(0, 0, width, height, fill=1, stroke=0)
    pdf.setFillColor(ACCENT)
    pdf.rect(0, height - 13 * mm, width, 13 * mm, fill=1, stroke=0)

    eyebrow = "EXPERT PREVIEW COMPLETE" if expert_answer_prompt else "KEEP THE MOMENTUM"
    title = (
        "Unlock the Expert walkthrough"
        if expert_answer_prompt
        else "Enjoyed the three-puzzle sampler?"
    )
    intro = (
        "The final puzzle is your preview of the Complete 100-Puzzle Training Library. "
        "Its verified 12-step opening and full answer are included in the complete pack."
        if expert_answer_prompt
        else "These three puzzles are a hand-picked taste of the same quality and progression "
        "inside the Complete 100-Puzzle Training Library."
    )

    pdf.setFillColor(ACCENT)
    pdf.setFont("Helvetica-Bold", 10)
    pdf.drawString(22 * mm, height - 42 * mm, eyebrow)
    pdf.setFillColor(INK)
    pdf.setFont("Helvetica-Bold", 26)
    pdf.drawString(22 * mm, height - 57 * mm, title)

    pdf.setFillColor(MUTED)
    pdf.setFont("Helvetica", 11)
    y = height - 73 * mm
    for line in wrap_text(intro, "Helvetica", 11, width - 44 * mm):
        pdf.drawString(22 * mm, y, line)
        y -= 6 * mm

    benefits = [
        ("Finish the Expert preview", "Unlock its verified guided opening and complete answer as Puzzle 076."),
        ("A month of daily puzzle meditation", "Spend about 10 focused, screen-free minutes with logic each day."),
        ("30-day daily challenge", "100 puzzles grouped progressively; solve 3 core puzzles a day."),
        ("Portable two-per-page edition", "Save paper and carry puzzles for commutes, travel, or coffee breaks."),
    ]
    y -= 5 * mm
    for heading, detail in benefits:
        pdf.setFillColor(ACCENT)
        pdf.circle(25 * mm, y + 1.2 * mm, 1.1 * mm, fill=1, stroke=0)
        pdf.setFillColor(INK)
        pdf.setFont("Helvetica-Bold", 11)
        pdf.drawString(31 * mm, y, heading)
        y -= 6 * mm
        pdf.setFillColor(MUTED)
        pdf.setFont("Helvetica", 9.5)
        for line in wrap_text(detail, "Helvetica", 9.5, width - 58 * mm):
            pdf.drawString(31 * mm, y, line)
            y -= 5 * mm
        y -= 5 * mm

    box_y = 47 * mm
    pdf.setFillColor(white)
    pdf.setStrokeColor(LIGHT)
    pdf.setLineWidth(0.8)
    pdf.roundRect(22 * mm, box_y, width - 44 * mm, 49 * mm, 3 * mm, fill=1, stroke=1)
    pdf.setFillColor(INK)
    pdf.setFont("Helvetica-Bold", 25)
    draw_centered(pdf, "$9.90 one-time", width / 2, box_y + 33 * mm)
    pdf.setFont("Helvetica", 10)
    pdf.setFillColor(MUTED)
    draw_centered(pdf, "Just $0.33 a day for 30 days of focused, screen-free play.", width / 2, box_y + 24 * mm)

    button_x = 34 * mm
    button_y = box_y + 7 * mm
    button_width = width - 68 * mm
    button_height = 11 * mm
    pdf.setFillColor(ACCENT)
    pdf.roundRect(button_x, button_y, button_width, button_height, 2 * mm, fill=1, stroke=0)
    pdf.setFillColor(white)
    pdf.setFont("Helvetica-Bold", 11)
    draw_centered(pdf, "Unlock the Complete Library", width / 2, button_y + 3.7 * mm)
    pdf.linkURL(
        PAID_PACK_URL,
        (button_x, button_y, button_x + button_width, button_y + button_height),
        relative=0,
    )
    pdf.setFillColor(MUTED)
    pdf.setFont("Helvetica", 8)
    draw_centered(pdf, PAID_PACK_DISPLAY_URL, width / 2, 24 * mm)
    pdf.showPage()


def draw_expert_lock_panel(
    pdf: canvas.Canvas,
    page_size: tuple[float, float],
    panel_top: float,
    expert_details: dict,
) -> None:
    width, _ = page_size
    hint = expert_details["openingHint"]
    panel_x = 15 * mm
    panel_y = 10 * mm
    panel_width = width - 30 * mm
    panel_height = panel_top - panel_y

    pdf.setFillColor(PAPER)
    pdf.setStrokeColor(ACCENT)
    pdf.setLineWidth(1)
    pdf.setDash(4, 3)
    pdf.roundRect(panel_x, panel_y, panel_width, panel_height, 2.5 * mm, fill=1, stroke=1)
    pdf.setDash()

    text_x = panel_x + 7 * mm
    text_width = panel_width - 14 * mm
    y = panel_top - 8 * mm
    pdf.setFillColor(ACCENT)
    pdf.setFont("Helvetica-Bold", 9)
    pdf.drawString(text_x, y, "EXPERT ANSWER LOCKED")
    y -= 9 * mm

    pdf.setFillColor(INK)
    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawString(text_x, y, "First-step hint")
    y -= 6.5 * mm
    hint_copy = (
        f"{GRID_LABELS[int(hint['grid'])]} grid, R{int(hint['row']) + 1}C{int(hint['col']) + 1}: "
        "check its row, column, and 3x3 box. Only one candidate survives."
    )
    pdf.setFillColor(MUTED)
    pdf.setFont("Helvetica", 8.7)
    for line in wrap_text(hint_copy, "Helvetica", 8.7, text_width):
        pdf.drawString(text_x, y, line)
        y -= 4.4 * mm

    y -= 1.5 * mm
    benefits = [
        "A verified 12-step guided opening and the full answer.",
        "204 naked singles and 15 hidden singles in the verified path.",
        "One of 25 Expert puzzles in the complete training library.",
    ]
    pdf.setFont("Helvetica", 8.4)
    for benefit in benefits:
        pdf.setFillColor(ACCENT)
        pdf.circle(text_x + 1 * mm, y + 0.9 * mm, 0.8 * mm, fill=1, stroke=0)
        pdf.setFillColor(INK)
        pdf.drawString(text_x + 5 * mm, y, benefit)
        y -= 5.2 * mm

    button_height = 9 * mm
    button_y = panel_y + 6 * mm
    pdf.setFillColor(ACCENT)
    pdf.roundRect(text_x, button_y, text_width, button_height, 2 * mm, fill=1, stroke=0)
    pdf.setFillColor(white)
    pdf.setFont("Helvetica-Bold", 9.5)
    draw_centered(pdf, "Unlock the Expert Walkthrough + 100 Puzzles - $9.90", width / 2, button_y + 3 * mm)
    pdf.linkURL(
        PAID_PACK_URL,
        (text_x, button_y, text_x + text_width, button_y + button_height),
        relative=0,
    )
    pdf.setFillColor(MUTED)
    pdf.setFont("Helvetica", 6.8)
    draw_centered(pdf, PAID_PACK_DISPLAY_URL, width / 2, panel_y + 2.2 * mm)


def draw_expert_walkthrough_page(
    pdf: canvas.Canvas,
    puzzle: dict,
    steps: list[dict],
    paid_sequence: int,
    page_size: tuple[float, float],
) -> None:
    width, height = page_size
    pdf.setFillColor(PAPER)
    pdf.rect(0, 0, width, height, fill=1, stroke=0)
    pdf.setFillColor(ACCENT)
    pdf.rect(0, height - 13 * mm, width, 13 * mm, fill=1, stroke=0)

    pdf.setFillColor(ACCENT)
    pdf.setFont("Helvetica-Bold", 9)
    pdf.drawString(20 * mm, height - 35 * mm, "UNLOCKED FROM THE FREE SAMPLER")
    pdf.setFillColor(INK)
    pdf.setFont("Helvetica-Bold", 23)
    pdf.drawString(20 * mm, height - 49 * mm, "Expert Preview Guided Opening")
    pdf.setFillColor(MUTED)
    pdf.setFont("Helvetica", 10)
    pdf.drawString(
        20 * mm,
        height - 59 * mm,
        f"Free sampler Puzzle 003 | Paid library Puzzle {paid_sequence:03d} | {puzzle['id']}",
    )

    intro_y = height - 78 * mm
    pdf.setFillColor(white)
    pdf.setStrokeColor(LIGHT)
    pdf.setLineWidth(0.8)
    pdf.roundRect(20 * mm, intro_y - 23 * mm, width - 40 * mm, 28 * mm, 2 * mm, fill=1, stroke=1)
    pdf.setFillColor(INK)
    pdf.setFont("Helvetica-Bold", 11)
    pdf.drawString(26 * mm, intro_y - 5 * mm, "How to use this walkthrough")
    pdf.setFillColor(MUTED)
    pdf.setFont("Helvetica", 9)
    intro = (
        "Each move below is a verified naked single. Recheck the named row, column, and box, "
        "place the value, then let the deductions ripple through the overlapping grids."
    )
    y = intro_y - 12 * mm
    for line in wrap_text(intro, "Helvetica", 9, width - 52 * mm):
        pdf.drawString(26 * mm, y, line)
        y -= 4.5 * mm

    column_gap = 10 * mm
    column_width = (width - 50 * mm) / 2
    start_y = intro_y - 39 * mm
    for index, step in enumerate(steps):
        column = 0 if index < 6 else 1
        row = index if index < 6 else index - 6
        x = 20 * mm + column * (column_width + column_gap)
        row_y = start_y - row * 18 * mm
        pdf.setFillColor(white)
        pdf.setStrokeColor(LIGHT)
        pdf.roundRect(x, row_y - 11 * mm, column_width, 14 * mm, 1.5 * mm, fill=1, stroke=1)
        pdf.setFillColor(ACCENT)
        pdf.setFont("Helvetica-Bold", 8)
        pdf.drawString(x + 4 * mm, row_y - 3 * mm, f"STEP {index + 1:02d}")
        pdf.setFillColor(INK)
        pdf.setFont("Helvetica-Bold", 10)
        pdf.drawRightString(x + column_width - 4 * mm, row_y - 3 * mm, format_guided_step(step))
        pdf.setFillColor(MUTED)
        pdf.setFont("Helvetica", 7.8)
        pdf.drawString(x + 4 * mm, row_y - 8.5 * mm, "Naked single: one candidate remains.")

    summary_y = 27 * mm
    pdf.setFillColor(INK)
    pdf.setFont("Helvetica-Bold", 11)
    draw_centered(
        pdf,
        "Verified path: 204 naked singles + 15 hidden singles before the final 30-cell endgame.",
        width / 2,
        summary_y + 12 * mm,
    )
    pdf.setFillColor(MUTED)
    pdf.setFont("Helvetica", 9)
    draw_centered(
        pdf,
        f"Continue solving, then compare with Answer {paid_sequence:03d} in this PDF.",
        width / 2,
        summary_y + 4 * mm,
    )
    pdf.showPage()


def draw_puzzle_page(
    pdf: canvas.Canvas,
    puzzle: dict,
    solved: bool,
    sequence: int,
    total: int,
    page_size: tuple[float, float],
    footer_override: str | None = None,
    expert_details: dict | None = None,
) -> None:
    width, height = page_size
    pdf.setFillColor(white)
    pdf.rect(0, 0, width, height, fill=1, stroke=0)

    label = "Answer" if solved else "Puzzle"
    difficulty = display_difficulty(puzzle)
    pdf.setFillColor(INK)
    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawString(15 * mm, height - 16 * mm, f"Samurai Sudoku {label} {sequence:03d}")
    pdf.setFont("Helvetica", 9)
    pdf.setFillColor(MUTED)
    right_text = f"{difficulty}  |  {puzzle['id']}  |  {sequence}/{total}"
    pdf.drawRightString(width - 15 * mm, height - 15.5 * mm, right_text)

    max_board_width = width - (50 * mm if expert_details else 24 * mm)
    max_board_height = height - (88 * mm if expert_details else 48 * mm)
    board_size = min(max_board_width, max_board_height)
    x = (width - board_size) / 2
    y = height - 31 * mm - board_size if expert_details else (height - board_size) / 2 - 2 * mm
    draw_board(pdf, global_board(puzzle, solved), x, y, board_size)

    if expert_details and not solved:
        draw_expert_lock_panel(pdf, page_size, y - 6 * mm, expert_details)
    else:
        pdf.setFont("Helvetica", 8)
        pdf.setFillColor(MUTED)
        footer = footer_override or (
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
    preview_sequences: set[int] | None = None,
    expert_details: dict | None = None,
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
        difficulty = display_difficulty(puzzle)
        if preview_sequences and sequence in preview_sequences:
            difficulty = f"{difficulty} Preview"

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

    if (
        not solved
        and len(puzzles) == 1
        and preview_sequences
        and first_sequence in preview_sequences
        and expert_details
    ):
        hint = expert_details["openingHint"]
        panel_x = 20 * mm
        panel_y = 13 * mm
        panel_width = width - 40 * mm
        panel_height = height / 2 - 26 * mm
        panel_top = panel_y + panel_height
        pdf.setFillColor(PAPER)
        pdf.setStrokeColor(ACCENT)
        pdf.setLineWidth(1)
        pdf.setDash(4, 3)
        pdf.roundRect(panel_x, panel_y, panel_width, panel_height, 2.5 * mm, fill=1, stroke=1)
        pdf.setDash()

        pdf.setFillColor(ACCENT)
        pdf.setFont("Helvetica-Bold", 9)
        draw_centered(pdf, "EXPERT ANSWER LOCKED", width / 2, panel_top - 14 * mm)
        pdf.setFillColor(INK)
        pdf.setFont("Helvetica-Bold", 18)
        draw_centered(pdf, "Unlock the guided opening + full answer", width / 2, panel_top - 27 * mm)
        pdf.setFillColor(MUTED)
        pdf.setFont("Helvetica-Bold", 9)
        draw_centered(
            pdf,
            (
                f"First hint: {GRID_LABELS[int(hint['grid'])]} grid R{int(hint['row']) + 1}"
                f"C{int(hint['col']) + 1} - only one candidate survives."
            ),
            width / 2,
            panel_top - 39 * mm,
        )
        pdf.setFont("Helvetica", 8.5)
        draw_centered(
            pdf,
            "12 verified opening steps, the full answer, and 97 more curated puzzles.",
            width / 2,
            panel_top - 50 * mm,
        )
        draw_centered(
            pdf,
            "Representative of 25 Expert puzzles in the 30-day training library.",
            width / 2,
            panel_top - 58 * mm,
        )
        button_x = 38 * mm
        button_y = panel_y + 10 * mm
        button_width = width - 76 * mm
        button_height = 11 * mm
        pdf.setFillColor(ACCENT)
        pdf.roundRect(button_x, button_y, button_width, button_height, 2 * mm, fill=1, stroke=0)
        pdf.setFillColor(white)
        pdf.setFont("Helvetica-Bold", 10)
        draw_centered(pdf, "Unlock Expert Walkthrough + 100 Puzzles - $9.90", width / 2, button_y + 3.7 * mm)
        pdf.linkURL(
            PAID_PACK_URL,
            (button_x, button_y, button_x + button_width, button_y + button_height),
            relative=0,
        )
        pdf.setFillColor(MUTED)
        pdf.setFont("Helvetica", 6.8)
        draw_centered(pdf, PAID_PACK_DISPLAY_URL, width / 2, panel_y + 2.2 * mm)
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
    include_training_plan: bool = False,
    expert_details: dict | None = None,
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
        f"{paper_label} edition, {layout_label}, with solutions",
        [
            "30-day plan: three core puzzles a day plus ten review challenges",
            "100 puzzles: 25 Easy, 25 Medium, 25 Hard, and 25 Expert",
            "Complete answer keys in the same file",
            "A4 and US Letter editions with clear vector grids",
            "One-time purchase with no subscription or renewal",
        ],
        page_size,
    )
    loaded = [load_puzzle(metadata) for metadata in puzzles]
    if expert_details:
        expert_sequence = next(
            (
                sequence
                for sequence, puzzle in enumerate(loaded, start=1)
                if puzzle["id"] == expert_details["id"]
            ),
            None,
        )
        if expert_sequence is None:
            raise ValueError("Expert sampler preview is missing from the complete library.")
        expert_puzzle = loaded[expert_sequence - 1]
        steps = validate_expert_guided_opening(expert_puzzle, expert_details)
        draw_expert_walkthrough_page(pdf, expert_puzzle, steps, expert_sequence, page_size)
    if include_training_plan:
        draw_training_plan_page(pdf, page_size)

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


def generate_free_sampler_pdf(
    path: Path,
    puzzles: list[dict],
    answers: list[bool],
    page_size: tuple[float, float],
    paper_label: str,
    puzzles_per_page: int = 1,
    expert_details: dict | None = None,
) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    title = "3 Curated Samurai Sudoku Puzzles"
    pdf = canvas.Canvas(str(path), pagesize=page_size, pageCompression=1, invariant=1)
    pdf.setTitle(title)
    pdf.setAuthor("SamuraiSudoku.net")
    pdf.setSubject(f"Three-puzzle Samurai Sudoku sampler - {paper_label}")
    layout_label = "one puzzle per page" if puzzles_per_page == 1 else "two puzzles per page"
    draw_cover(
        pdf,
        title,
        f"{paper_label} edition, {layout_label}, curated from Easy to Expert",
        [
            "Three hand-picked puzzles: 1 Easy, 1 Medium, 1 Expert preview",
            "Solutions for puzzles 1-2; the Expert preview includes a verified first-step hint",
            "Program-validated puzzles with unique solutions",
            "Black-and-white vector layout for crisp home printing",
            "No registration or email required",
        ],
        page_size,
        progression=[
            ("PUZZLE 01", "Easy"),
            ("PUZZLE 02", "Medium"),
            ("PUZZLE 03", "Expert Preview"),
        ],
    )

    loaded = [load_puzzle(metadata) for metadata in puzzles]
    if not expert_details:
        raise ValueError("Free sampler generation requires verified Expert preview details.")
    validate_expert_guided_opening(loaded[-1], expert_details)
    if puzzles_per_page == 1:
        for sequence, puzzle in enumerate(loaded, start=1):
            footer = (
                "This puzzle's answer and 97 more curated puzzles are in the Complete 100-Puzzle Training Library."
                if sequence == len(loaded)
                else None
            )
            draw_puzzle_page(
                pdf,
                puzzle,
                False,
                sequence,
                len(loaded),
                page_size,
                footer_override=footer,
                expert_details=expert_details if sequence == len(loaded) else None,
            )
    else:
        for offset in range(0, len(loaded), 2):
            draw_two_up_page(
                pdf,
                loaded[offset:offset + 2],
                False,
                offset + 1,
                len(loaded),
                page_size,
                preview_sequences={len(loaded)},
                expert_details=expert_details,
            )

    draw_upgrade_page(pdf, page_size, expert_answer_prompt=True)
    answer_puzzles = [
        (sequence, puzzle)
        for sequence, (puzzle, answer_included) in enumerate(zip(loaded, answers), start=1)
        if answer_included
    ]
    draw_section_page(
        pdf,
        "Answers for Puzzles 1-2",
        "Puzzle 3 is the Expert preview; its answer is included in the complete library.",
        page_size,
    )
    if puzzles_per_page == 1:
        for sequence, puzzle in answer_puzzles:
            draw_puzzle_page(pdf, puzzle, True, sequence, len(loaded), page_size)
    else:
        answer_only = [puzzle for _, puzzle in answer_puzzles]
        for offset in range(0, len(answer_only), 2):
            draw_two_up_page(pdf, answer_only[offset:offset + 2], True, offset + 1, len(loaded), page_size)
    draw_upgrade_page(pdf, page_size, expert_answer_prompt=False)
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
    starter, starter_answers, expert_details, sampler_asset_version = select_curated_sampler(puzzles)
    paid = select_balanced(puzzles, 25)
    paid_ids = {puzzle["id"] for puzzle in paid}
    if any(puzzle["id"] not in paid_ids for puzzle in starter):
        raise ValueError("Every curated sampler puzzle must also be present in the complete library.")
    expert_paid_sequence = next(
        index for index, puzzle in enumerate(paid, start=1) if puzzle["id"] == expert_details["id"]
    )

    PUBLIC_DOWNLOADS.mkdir(parents=True, exist_ok=True)
    PRIVATE_ASSETS.mkdir(parents=True, exist_ok=True)
    TEMP_DIR.mkdir(parents=True, exist_ok=True)

    free_a4 = PUBLIC_DOWNLOADS / (
        f"samurai-sudoku-free-3-puzzle-sampler-a4-v{sampler_asset_version}.pdf"
    )
    free_letter = PUBLIC_DOWNLOADS / (
        f"samurai-sudoku-free-3-puzzle-sampler-letter-v{sampler_asset_version}.pdf"
    )
    free_a4_two_up = PUBLIC_DOWNLOADS / (
        f"samurai-sudoku-free-3-puzzle-sampler-a4-2-per-page-v{sampler_asset_version}.pdf"
    )
    free_letter_two_up = PUBLIC_DOWNLOADS / (
        f"samurai-sudoku-free-3-puzzle-sampler-letter-2-per-page-v{sampler_asset_version}.pdf"
    )
    paid_a4 = TEMP_DIR / "samurai-sudoku-100-puzzles-with-solutions-a4.pdf"
    paid_letter = TEMP_DIR / "samurai-sudoku-100-puzzles-with-solutions-letter.pdf"
    paid_a4_two_up = TEMP_DIR / "samurai-sudoku-100-puzzles-with-solutions-a4-2-per-page.pdf"
    paid_letter_two_up = TEMP_DIR / "samurai-sudoku-100-puzzles-with-solutions-letter-2-per-page.pdf"
    paid_zip = PRIVATE_ASSETS / "samurai-sudoku-100-puzzle-pack.zip"

    generate_free_sampler_pdf(
        free_a4,
        starter,
        starter_answers,
        A4,
        "A4",
        expert_details=expert_details,
    )
    generate_free_sampler_pdf(
        free_letter,
        starter,
        starter_answers,
        LETTER,
        "US Letter",
        expert_details=expert_details,
    )
    generate_free_sampler_pdf(
        free_a4_two_up,
        starter,
        starter_answers,
        A4,
        "A4",
        2,
        expert_details=expert_details,
    )
    generate_free_sampler_pdf(
        free_letter_two_up,
        starter,
        starter_answers,
        LETTER,
        "US Letter",
        2,
        expert_details=expert_details,
    )
    generate_pdf(
        paid_a4,
        paid,
        A4,
        "A4",
        "100 Samurai Sudoku Printable Puzzles",
        include_training_plan=True,
        expert_details=expert_details,
    )
    generate_pdf(
        paid_letter,
        paid,
        LETTER,
        "US Letter",
        "100 Samurai Sudoku Printable Puzzles",
        include_training_plan=True,
        expert_details=expert_details,
    )
    generate_pdf(
        paid_a4_two_up,
        paid,
        A4,
        "A4",
        "100 Samurai Sudoku Printable Puzzles",
        2,
        include_training_plan=True,
        expert_details=expert_details,
    )
    generate_pdf(
        paid_letter_two_up,
        paid,
        LETTER,
        "US Letter",
        "100 Samurai Sudoku Printable Puzzles",
        2,
        include_training_plan=True,
        expert_details=expert_details,
    )

    readme = """100 Samurai Sudoku Printable Puzzles

Included:
- 100 puzzles: 25 Easy, 25 Medium, 25 Hard, and 25 Evil
- 30-day daily training plan: three core puzzles per day plus ten review challenges
- Expert Preview guided opening: 12 verified naked-single steps plus the full Answer 076
- Complete answer keys
- A4 and US Letter PDF editions
- One-puzzle-per-page and two-puzzles-per-page layouts
- Portable two-per-page editions for commutes and travel
- Vector black-and-white layouts for clear printing

License: personal and classroom use. Do not resell or redistribute this pack.
Support: feedback@samuraisudoku.net
Website: https://www.samuraisudoku.net/en/printable-samurai-sudoku#paid-100-puzzle-pack
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
        "freeAnswerCount": sum(1 for answer_included in starter_answers if answer_included),
        "samplerAssetVersion": sampler_asset_version,
        "expertPreview": {
            "id": expert_details["id"],
            "paidSequence": expert_paid_sequence,
            "guidedOpeningSteps": len(expert_details["guidedOpening"]),
        },
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
