import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';

import { TrackedLink } from '@/components/analytics/TrackedLink';
import { isLocale, type Locale } from '@/i18n';
import { buildLanguageAlternates, buildLocalizedUrl } from '@/lib/seo';
import { buildAbsoluteUrl } from '@/lib/site-url';

type GuideKey =
  | 'beginners'
  | 'strategy'
  | 'overlapBoxes'
  | 'candidateNotes'
  | 'evilSolvingPath'
  | 'paperPractice'
  | 'daily'
  | 'printable'
  | 'solver';

interface GuideItem {
  title: string;
  body: string;
}

interface GuideContent {
  title: string;
  description: string;
  intro: string;
  backLabel: string;
  items: GuideItem[];
  primaryCta: string;
  secondaryCta: string;
}

interface GuideDefinition {
  path: string;
  backHref: string;
  primaryHref: string;
  secondaryHref: string;
  keywords?: Record<Locale, string[]>;
  numbered?: boolean;
  content: Record<Locale, GuideContent>;
}

interface SamuraiGuidePageProps {
  guide: GuideKey;
  locale: string;
}

const guidePages: Record<GuideKey, GuideDefinition> = {
  daily: {
    path: '/games/samurai/daily',
    backHref: '/games/samurai',
    primaryHref: '/games/samurai',
    secondaryHref: '/games/samurai/archive',
    numbered: true,
    keywords: {
      en: ['daily samurai sudoku', 'daily sudoku challenge', 'samurai sudoku today', 'online samurai sudoku'],
      zh: ['每日武士数独', '今日数独', '在线武士数独', '每日逻辑游戏'],
    },
    content: {
      en: {
        title: 'Daily Samurai Sudoku',
        description:
          'Play the daily Samurai Sudoku challenge online, track local progress, and use the archive when you want another five-grid puzzle.',
        intro:
          'The daily puzzle is the main habit loop: one fresh Samurai Sudoku, five overlapping grids, local progress, notes, hints, and a dated archive when you want more practice.',
        backLabel: 'Back to game',
        items: [
          {
            title: 'Start with today, not the full archive',
            body: 'A single dated puzzle keeps practice focused. Finish today first, then choose another puzzle by difficulty if you still want more.',
          },
          {
            title: 'Use notes before guessing',
            body: 'Candidate notes are especially important on a five-grid board because each overlap placement can remove possibilities from two grids.',
          },
          {
            title: 'Build a repeatable streak',
            body: 'Daily practice works best when you repeat the same process: scan overlap boxes, fill singles, add notes, then return to the center grid.',
          },
          {
            title: 'Use the archive for missed days',
            body: 'Every public puzzle has a dated URL, so you can replay older boards, compare difficulty, and resume practice at your own pace.',
          },
        ],
        primaryCta: "Play today's puzzle",
        secondaryCta: 'Browse archive',
      },
      zh: {
        title: '每日武士数独',
        description: '在线挑战每日武士数独，保存本地进度；想继续练习时可进入日期归档题库。',
        intro: '每日题是最适合养成习惯的入口：一题新鲜的五宫重叠数独，支持本地进度、候选数、提示和日期归档。',
        backLabel: '返回游戏',
        items: [
          {
            title: '先完成今日题，不要一开始翻题库',
            body: '每日固定一题能让练习更聚焦。先完成今天的题，再按难度选择更多历史题。',
          },
          {
            title: '先做候选，不要猜',
            body: '五宫棋盘里候选数更重要，因为重叠区的一个数字可能同时排除两个网格里的可能。',
          },
          {
            title: '形成稳定打卡流程',
            body: '建议每次都按同样顺序练习：扫重叠宫、找唯一候选、添加候选数，再回到中心网格复查。',
          },
          {
            title: '用归档补练错过的日期',
            body: '每道公开题都有独立日期 URL，你可以重玩旧题、比较难度，并按自己的节奏继续练习。',
          },
        ],
        primaryCta: '开始今日谜题',
        secondaryCta: '浏览题库归档',
      },
    },
  },
  beginners: {
    path: '/games/samurai/beginners',
    backHref: '/games/samurai/how-to-play',
    primaryHref: '/games/samurai/difficulty/easy',
    secondaryHref: '/games/samurai/strategy-guide',
    keywords: {
      en: ['samurai sudoku for beginners', 'beginner samurai sudoku', 'easy samurai sudoku guide'],
      zh: ['武士数独入门', '武士数独新手', '简单武士数独教程'],
    },
    content: {
      en: {
        title: 'Samurai Sudoku for Beginners',
        description:
          'A beginner-friendly Samurai Sudoku guide covering the five-grid layout, overlap boxes, candidates, and how to start with easy puzzles.',
        intro:
          'If you can play regular Sudoku, Samurai Sudoku is not as strange as it looks. The key is learning to read five grids and four overlap zones together.',
        backLabel: 'Back to rules',
        items: [
          {
            title: 'Think of it as five regular Sudokus first',
            body: 'Each 9x9 grid still follows normal Sudoku rules. Do not let the large board intimidate you; first identify the boundaries of each grid.',
          },
          {
            title: 'Overlap boxes are the key',
            body: 'The four corner boxes of the center grid are shared with the corner grids. Numbers here affect two grids at the same time.',
          },
          {
            title: 'Start on Easy',
            body: 'Easy puzzles provide more givens, which helps you learn the five-grid structure before moving to Medium or Hard.',
          },
          {
            title: 'Do not rush to guess',
            body: 'When stuck, add candidate notes and check how rows, columns, boxes, and overlap zones remove possibilities.',
          },
        ],
        primaryCta: 'Start with Easy',
        secondaryCta: 'Read strategy guide',
      },
      zh: {
        title: '武士数独新手指南',
        description: '给新手的武士数独入门指南：理解五宫结构、重叠区、候选数和从简单题开始练习的方法。',
        intro: '如果你会普通数独，武士数独的核心并不陌生。关键是学会把五个网格和四个重叠区一起看。',
        backLabel: '返回规则说明',
        items: [
          {
            title: '先把它看成五个普通数独',
            body: '每个 9x9 网格仍然遵循普通数独规则。不要一开始就被大棋盘吓到，先找到每个网格的边界。',
          },
          {
            title: '重叠区是关键',
            body: '中心网格的四个角落 3x3 宫与四角网格共享。这里的数字同时影响两个网格，是新手最应该关注的区域。',
          },
          {
            title: '从简单难度开始',
            body: '简单题会给出更多线索，让你熟悉五宫结构。熟悉后再尝试中等和困难题。',
          },
          {
            title: '不要急着猜',
            body: '遇到卡住时先做候选数标记，检查行、列、宫和重叠区的排除关系。',
          },
        ],
        primaryCta: '从简单题开始',
        secondaryCta: '继续看策略指南',
      },
    },
  },
  strategy: {
    path: '/games/samurai/strategy-guide',
    backHref: '/games/samurai/how-to-play',
    primaryHref: '/games/samurai',
    secondaryHref: '/games/samurai/archive',
    numbered: true,
    keywords: {
      en: ['samurai sudoku strategy', 'samurai sudoku solving tips', 'how to solve samurai sudoku'],
      zh: ['武士数独技巧', '武士数独解题策略', '武士数独攻略'],
    },
    content: {
      en: {
        title: 'Samurai Sudoku Strategy Guide',
        description:
          'Learn a reliable Samurai Sudoku solving process: overlap boxes, candidates, hidden singles, and cross-grid deductions.',
        intro:
          'This is a repeatable process for daily practice: start with overlap boxes, build candidates, then use cross-grid logic to solve harder puzzles.',
        backLabel: 'Back to rules',
        items: [
          {
            title: 'Start with the whole-board view',
            body: 'Samurai Sudoku is not five separate puzzles. It is five grids sharing information. First inspect the four overlap boxes and note which two grids each one controls.',
          },
          {
            title: 'Place only justified digits',
            body: 'Begin with single candidates, then hidden singles: a digit that can appear in only one cell within a row, column, or box.',
          },
          {
            title: 'Recheck after every overlap placement',
            body: 'A number placed in an overlap box affects both the center grid and a corner grid. After each placement, scan the other grid for newly removed possibilities.',
          },
          {
            title: 'Use pairs on hard puzzles',
            body: 'When singles disappear, look for paired candidates in a row, column, or box. Pairs can remove candidates elsewhere and reopen the puzzle.',
          },
        ],
        primaryCta: "Play today's puzzle",
        secondaryCta: 'Browse archive',
      },
      zh: {
        title: '武士数独解题策略指南',
        description: '从重叠宫、候选数、唯一位置到跨网格联动，学习武士数独的稳定解题步骤。',
        intro: '这是一套适合日常练习的稳定流程：先找重叠宫，再做候选数，最后用跨网格联动推进困难题。',
        backLabel: '返回玩法规则',
        items: [
          {
            title: '先建立全局视角',
            body: '武士数独不是五道独立数独，而是五个共享信息的网格。先观察四个重叠 3x3 宫，标出它们同时影响哪两个网格。',
          },
          {
            title: '从确定候选开始',
            body: '每次只填有明确逻辑依据的数字。先找单一候选，再找某行、列或宫中只能放在一个位置的数字。',
          },
          {
            title: '重叠宫填完立刻复查',
            body: '重叠区域的一个数字会同时影响中心网格和角落网格。每次填入后，都回到另一个网格检查新排除的可能。',
          },
          {
            title: '困难题使用候选对',
            body: '当没有单一候选时，观察同一行、列或宫里的成对候选。候选对可以排除其他格子的可能，逐步打开局面。',
          },
        ],
        primaryCta: '开始今日谜题',
        secondaryCta: '浏览题库',
      },
    },
  },
  overlapBoxes: {
    path: '/games/samurai/overlap-boxes',
    backHref: '/games/samurai/how-to-play',
    primaryHref: '/games/samurai/what-is-samurai-sudoku',
    secondaryHref: '/games/samurai/strategy-guide',
    numbered: true,
    keywords: {
      en: ['samurai sudoku overlap boxes', 'samurai sudoku overlapping grids', 'samurai sudoku layout', 'five grid sudoku overlap'],
      zh: ['武士数独重叠宫', '武士数独重叠区', '五宫数独布局', '武士数独结构'],
    },
    content: {
      en: {
        title: 'Samurai Sudoku Overlap Boxes Explained',
        description:
          'Understand the four shared 3x3 overlap boxes in Samurai Sudoku and how they connect the center grid with each corner grid.',
        intro:
          'The overlap boxes are the reason Samurai Sudoku feels different from regular Sudoku. Each shared 3x3 box belongs to two grids, so every placement can unlock or block deductions in both places.',
        backLabel: 'Back to rules',
        items: [
          {
            title: 'There are four shared boxes',
            body: 'The center grid shares one corner 3x3 box with each outer grid. These four boxes are not extra cells; they are visible cells counted by two different Sudoku grids.',
          },
          {
            title: 'Read each overlap twice',
            body: 'When you inspect an overlap box, check the row, column, and box constraints in the center grid first, then repeat the same check in the connected corner grid.',
          },
          {
            title: 'Prioritize overlap givens',
            body: 'Given numbers inside or near an overlap usually remove more candidates than givens in an isolated corner. Scan them early before filling easier single-grid cells.',
          },
          {
            title: 'Re-scan after every overlap placement',
            body: 'A digit placed in a shared box can create a hidden single in the other grid. Make overlap re-scanning a habit, especially on Hard and Evil puzzles.',
          },
        ],
        primaryCta: 'View the layout guide',
        secondaryCta: 'Read strategy guide',
      },
      zh: {
        title: '武士数独重叠宫详解',
        description: '理解武士数独四个共享 3x3 重叠宫，以及它们如何连接中心网格和四角网格。',
        intro: '重叠宫是武士数独区别于普通数独的核心。每个共享 3x3 宫同时属于两个网格，因此一个数字可能同时推进或限制两个区域。',
        backLabel: '返回规则说明',
        items: [
          {
            title: '一共有四个共享宫',
            body: '中心网格的四个角落 3x3 宫分别与四个外侧网格共享。这些不是额外格子，而是同时被两个数独网格计算的可见格。',
          },
          {
            title: '每个重叠宫都要读两遍',
            body: '检查重叠宫时，先看它在中心网格里的行、列、宫约束，再看它在对应角落网格里的行、列、宫约束。',
          },
          {
            title: '优先扫描重叠区给定数',
            body: '重叠区内或附近的给定数，通常比孤立角落里的数字排除更多候选。先扫这些位置，再处理单一网格里的简单格。',
          },
          {
            title: '每填一个重叠格都要复查',
            body: '共享宫里填入一个数字，可能在另一个网格制造新的唯一位置。困难和 Evil 题尤其要养成立刻复查重叠区的习惯。',
          },
        ],
        primaryCta: '查看布局图解',
        secondaryCta: '继续看策略指南',
      },
    },
  },
  candidateNotes: {
    path: '/games/samurai/candidate-notes',
    backHref: '/games/samurai/strategy-guide',
    primaryHref: '/games/samurai',
    secondaryHref: '/games/samurai/solver',
    numbered: true,
    keywords: {
      en: ['samurai sudoku candidates', 'samurai sudoku candidate notes', 'sudoku pencil marks', 'samurai sudoku notes'],
      zh: ['武士数独候选数', '武士数独笔记', '数独候选标记', '武士数独铅笔标记'],
    },
    content: {
      en: {
        title: 'Samurai Sudoku Candidate Notes Guide',
        description:
          'Use candidate notes and pencil marks in Samurai Sudoku without cluttering the five-grid board or missing overlap constraints.',
        intro:
          'Candidate notes turn a large Samurai Sudoku board into manageable logic. The trick is to write only useful candidates and refresh them whenever an overlap changes.',
        backLabel: 'Back to strategy',
        items: [
          {
            title: 'Add notes after easy singles dry up',
            body: 'Do not fill every empty cell immediately. First solve obvious singles, then add candidates around the active overlap and high-clue areas.',
          },
          {
            title: 'Treat overlap cells as stricter cells',
            body: 'An overlap cell must survive constraints from two grids. Remove any candidate that conflicts with either grid, even if it looks legal in only one of them.',
          },
          {
            title: 'Refresh notes after each placement',
            body: 'A stale candidate is worse than no candidate. After filling a digit, remove it from the affected rows, columns, boxes, and the connected overlap grid.',
          },
          {
            title: 'Look for pairs and locked candidates',
            body: 'On harder puzzles, two cells sharing the same pair can remove those digits elsewhere. Candidate notes make these patterns visible.',
          },
        ],
        primaryCta: "Practice with today's puzzle",
        secondaryCta: 'Use hint guide',
      },
      zh: {
        title: '武士数独候选数笔记指南',
        description: '学习如何在武士数独里使用候选数和铅笔标记，避免五宫棋盘混乱，同时不漏掉重叠区约束。',
        intro: '候选数能把巨大的武士数独棋盘拆成可管理的逻辑问题。关键是只写有价值的候选，并在重叠区变化后及时刷新。',
        backLabel: '返回解题策略',
        items: [
          {
            title: '简单唯一数做完后再写候选',
            body: '不要一开始就给所有空格写满候选。先解决明显单一候选，再围绕重叠区和线索密集区域补候选。',
          },
          {
            title: '把重叠格当作约束更强的格子',
            body: '重叠格必须同时满足两个网格。某个候选只要在其中一个网格冲突，就要删除，不能只看单边是否合法。',
          },
          {
            title: '每填一个数字都刷新候选',
            body: '过期候选比没有候选更危险。填入数字后，要从相关行、列、宫以及连接的重叠网格中删除它。',
          },
          {
            title: '寻找候选对和锁定候选',
            body: '困难题里，两个格子共享同一组候选时，可以排除其他位置。候选笔记能让这些模式变得可见。',
          },
        ],
        primaryCta: '用今日题练习',
        secondaryCta: '查看提示指南',
      },
    },
  },
  evilSolvingPath: {
    path: '/games/samurai/evil-solving-path',
    backHref: '/games/samurai/difficulty/evil',
    primaryHref: '/games/samurai/difficulty/evil',
    secondaryHref: '/games/samurai/candidate-notes',
    numbered: true,
    keywords: {
      en: ['evil samurai sudoku strategy', 'hard samurai sudoku solving path', 'evil sudoku solving steps', 'advanced samurai sudoku'],
      zh: ['Evil 武士数独策略', '困难武士数独解题路径', '极难数独步骤', '高级武士数独'],
    },
    content: {
      en: {
        title: 'Evil Samurai Sudoku Solving Path',
        description:
          'A practical solving path for hard and evil Samurai Sudoku puzzles: overlap scan, candidate notes, pairs, contradiction review, and pacing.',
        intro:
          'Evil Samurai Sudoku is less about speed and more about preserving clean logic. Use this path when easy singles disappear and the board starts to feel stuck.',
        backLabel: 'Back to Evil puzzles',
        items: [
          {
            title: 'Reset the board mentally',
            body: 'Before guessing, re-scan every overlap box and confirm which grid each unresolved cell belongs to. Many evil puzzles reopen after one missed overlap deduction.',
          },
          {
            title: 'Rebuild candidates in one region',
            body: 'Pick the most constrained overlap or center-grid area and rebuild candidates carefully. Avoid spreading shallow notes across the whole 369-cell board.',
          },
          {
            title: 'Search for pairs before chains',
            body: 'Naked pairs, hidden pairs, and locked candidates are usually enough to restart progress. Use them before trying long speculative chains.',
          },
          {
            title: 'Treat contradictions as audit signals',
            body: 'If a conflict appears, do not push forward. Clear the unsupported step, compare it with the last candidate change, and rebuild from a confirmed placement.',
          },
        ],
        primaryCta: 'Open Evil puzzles',
        secondaryCta: 'Review candidate notes',
      },
      zh: {
        title: 'Evil 极难武士数独解题路径',
        description: '面向困难和 Evil 武士数独的实用解题路径：重叠区扫描、候选数、候选对、冲突复盘和节奏控制。',
        intro: 'Evil 武士数独考验的不是速度，而是能否保持干净的逻辑链。当简单唯一数消失、棋盘开始卡住时，用这条路径复查。',
        backLabel: '返回 Evil 题目',
        items: [
          {
            title: '先在脑中重置棋盘',
            body: '猜之前重新扫描所有重叠宫，确认每个未解格属于哪个网格。很多极难题只是漏掉了一个重叠区排除。',
          },
          {
            title: '只重建一个区域的候选',
            body: '选择约束最强的重叠区或中心网格区域，认真重建候选。不要在 369 格大棋盘上到处写浅层候选。',
          },
          {
            title: '先找候选对，再考虑链',
            body: '显性候选对、隐性候选对和锁定候选，通常足够重新打开局面。先用这些，再考虑更长推理链。',
          },
          {
            title: '把冲突当作审计信号',
            body: '一旦出现冲突，不要继续硬推。清除没有依据的一步，对照上一次候选变化，从确认位置重新建立逻辑。',
          },
        ],
        primaryCta: '打开 Evil 题目',
        secondaryCta: '复习候选数笔记',
      },
    },
  },
  paperPractice: {
    path: '/games/samurai/paper-practice',
    backHref: '/games/samurai/archive',
    primaryHref: '/games/samurai/archive',
    secondaryHref: '/games/samurai/strategy-guide',
    keywords: {
      en: ['samurai sudoku paper practice', 'print samurai sudoku practice', 'paper sudoku notes'],
      zh: ['武士数独纸笔练习', '打印武士数独练习', '数独候选数纸笔'],
    },
    content: {
      en: {
        title: 'Samurai Sudoku Paper Practice Guide',
        description:
          'Use paper-style practice for Samurai Sudoku with candidate notes, overlap marking, difficulty choice, and review habits.',
        intro:
          'Paper-style practice is useful for slower reasoning. You can mark candidates carefully, track your logic, and review each step.',
        backLabel: 'Back to archive',
        items: [
          {
            title: 'Choose the right difficulty first',
            body: 'Start with Easy or Medium. Hard and Evil puzzles are better once candidates and overlap logic feel natural.',
          },
          {
            title: 'Leave room for candidates',
            body: 'Paper-style solving needs space for small notes inside empty cells. A larger page or landscape layout helps.',
          },
          {
            title: 'Mark overlap zones',
            body: 'Lightly mark the four shared 3x3 boxes so you remember to check both grids after each placement.',
          },
          {
            title: 'Review mistakes',
            body: 'If a contradiction appears, return to the last unsupported assumption and rebuild the candidate notes.',
          },
        ],
        primaryCta: 'Choose a puzzle',
        secondaryCta: 'Read solving strategy',
      },
      zh: {
        title: '武士数独纸笔练习指南',
        description: '用纸笔练习武士数独：候选数、重叠区标记、难度选择和复盘方法。',
        intro: '纸笔式练习适合深度思考。你可以更认真地标候选数、记录推理路径，并复盘每一步。',
        backLabel: '返回题库',
        items: [
          {
            title: '先选择合适难度',
            body: '从简单或中等开始。困难和 Evil 题更适合熟悉候选数和重叠区推理的玩家。',
          },
          {
            title: '留出候选数空间',
            body: '纸笔练习时，空格里要能写小候选数。使用较大页面或横向布局会更舒服。',
          },
          {
            title: '标记重叠区',
            body: '把四个共享 3x3 宫轻轻标出，有助于提醒自己跨网格检查。',
          },
          {
            title: '复盘错误路径',
            body: '如果出现矛盾，回到最近一次无依据猜测，重新检查候选数。',
          },
        ],
        primaryCta: '选择一道题',
        secondaryCta: '查看解题策略',
      },
    },
  },
  printable: {
    path: '/printable-samurai-sudoku',
    backHref: '/games/samurai/paper-practice',
    primaryHref: '/games/samurai/archive',
    secondaryHref: '/games/samurai/pdf',
    numbered: true,
    keywords: {
      en: ['printable samurai sudoku', 'samurai sudoku pdf', 'printable sudoku puzzles', 'samurai sudoku with answers'],
      zh: ['可打印武士数独', '武士数独 PDF', '打印数独题', '武士数独答案'],
    },
    content: {
      en: {
        title: 'Printable Samurai Sudoku',
        description:
          'Use Samurai Sudoku as printable logic practice: choose a dated puzzle, print cleanly from the browser, and keep answer checking online.',
        intro:
          'Printable Samurai Sudoku works best when the page is treated as a practice sheet: choose the right difficulty, print the puzzle view, solve slowly, then return online to check progress.',
        backLabel: 'Back to paper practice',
        items: [
          {
            title: 'Choose the difficulty before printing',
            body: 'Easy and Medium are better for classrooms or casual practice. Hard and Evil are better for long sessions where candidate notes matter.',
          },
          {
            title: 'Print one dated puzzle at a time',
            body: 'A dated URL makes the sheet easy to file, share, and revisit. Use the archive to pick the exact board you want to print.',
          },
          {
            title: 'Leave space for candidates',
            body: 'Samurai Sudoku has 369 visible cells, so paper solving needs generous page size and room for small candidate notes.',
          },
          {
            title: 'Return online for hints and checking',
            body: 'After paper solving, open the same dated puzzle online to use conflict highlighting, hints, and completion tracking.',
          },
        ],
        primaryCta: 'Choose a printable puzzle',
        secondaryCta: 'Get the PDF pack',
      },
      zh: {
        title: '可打印武士数独',
        description: '把武士数独作为可打印逻辑练习：选择日期题目，在浏览器中打印，并回到线上检查进度。',
        intro: '可打印武士数独最适合作为纸笔练习单：先选合适难度，打印题面，慢慢推理，再回到线上检查和继续。',
        backLabel: '返回纸笔练习',
        items: [
          {
            title: '打印前先选难度',
            body: '简单和中等适合课堂、休闲或老人练习；困难和 Evil 更适合需要候选数的长时间推理。',
          },
          {
            title: '一次打印一道日期题',
            body: '日期 URL 方便归档、分享和复盘。你可以在题库里选择具体某一天的棋盘打印。',
          },
          {
            title: '给候选数留空间',
            body: '武士数独有 369 个可见格，纸笔解题需要更大的页面和足够空间记录小候选数。',
          },
          {
            title: '回到线上检查和提示',
            body: '纸上推理后，打开同一日期题的线上版本，可使用冲突高亮、提示和完成状态记录。',
          },
        ],
        primaryCta: '选择可打印题目',
        secondaryCta: '查看 PDF 打印包',
      },
    },
  },
  solver: {
    path: '/games/samurai/solver',
    backHref: '/games/samurai/strategy-guide',
    primaryHref: '/games/samurai',
    secondaryHref: '/games/samurai/how-to-play',
    numbered: true,
    keywords: {
      en: ['samurai sudoku solver', 'samurai sudoku hint', 'samurai sudoku help', 'solve samurai sudoku'],
      zh: ['武士数独求解器', '武士数独提示', '武士数独解题帮助', '武士数独怎么解'],
    },
    content: {
      en: {
        title: 'Samurai Sudoku Solver & Hint Guide',
        description:
          'Use solver-style Samurai Sudoku help without spoiling the board: candidates, overlap checks, hints, and conflict review.',
        intro:
          'A useful solver should teach the next logical step, not simply dump an answer. Use this process with the in-game hint, notes, and conflict tools.',
        backLabel: 'Back to strategy',
        items: [
          {
            title: 'Check whether the stuck cell belongs to one or two grids',
            body: 'Overlap cells receive constraints from both grids. Before filling a number, confirm the row, column, and box rules in each connected grid.',
          },
          {
            title: 'List candidates before asking for a hint',
            body: 'Candidate notes make a hint more useful because you can see which digit was eliminated and why the next move is legal.',
          },
          {
            title: 'Use conflicts as a diagnostic tool',
            body: 'If a conflict appears, do not continue guessing. Clear the unsupported placement and return to the last candidate change.',
          },
          {
            title: 'Prefer explanations over full solutions',
            body: 'The fastest way to improve is to understand the next deduction. Full answers finish one puzzle, but explanations improve the next ten.',
          },
        ],
        primaryCta: 'Use hints in the game',
        secondaryCta: 'Review the rules',
      },
      zh: {
        title: '武士数独求解器与提示指南',
        description: '用求解器式思路获得武士数独帮助：候选数、重叠区检查、提示和冲突复盘，而不是直接看答案。',
        intro: '好的求解器应该教你下一步逻辑，而不是直接给完整答案。你可以配合游戏内提示、候选数和冲突检查使用这套流程。',
        backLabel: '返回解题策略',
        items: [
          {
            title: '先判断卡住的格子属于一个还是两个网格',
            body: '重叠格同时受两个网格约束。填数前要同时检查相关网格里的行、列和 3×3 宫规则。',
          },
          {
            title: '请求提示前先列候选',
            body: '先写候选数，提示才更有价值：你能看到某个数字为什么被排除，以及下一步为什么成立。',
          },
          {
            title: '把冲突当成诊断工具',
            body: '如果出现冲突，不要继续猜。清除没有逻辑依据的填数，回到上一次候选变化重新检查。',
          },
          {
            title: '优先理解解释，而不是完整答案',
            body: '真正提升解题能力的是理解下一步推理。完整答案只解决一题，解释能帮助你解决后面的题。',
          },
        ],
        primaryCta: '在游戏中使用提示',
        secondaryCta: '复习玩法规则',
      },
    },
  },
};

function normalizeLocale(locale: string): Locale {
  return isLocale(locale) ? locale : 'en';
}

function localizedHref(locale: Locale, href: string) {
  return `/${locale}${href}`;
}

export function generateGuideMetadata(guide: GuideKey, locale: string): Metadata {
  const normalizedLocale = normalizeLocale(locale);
  const definition = guidePages[guide];
  const content = definition.content[normalizedLocale];
  const canonical = buildLocalizedUrl(normalizedLocale, definition.path);

  return {
    title: content.title,
    description: content.description,
    keywords: definition.keywords?.[normalizedLocale],
    alternates: {
      canonical,
      languages: buildLanguageAlternates(definition.path),
    },
    openGraph: {
      title: content.title,
      description: content.description,
      url: canonical,
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title: content.title,
      description: content.description,
    },
  };
}

function getPrimaryEventName(guide: GuideKey) {
  if (guide === 'daily') return 'daily_puzzle_intent_click';
  if (guide === 'printable') return 'printable_intent_click';
  if (guide === 'solver') return 'solver_intent_click';
  return 'samurai_guide_primary_cta_click';
}

export function SamuraiGuidePage({ guide, locale }: SamuraiGuidePageProps) {
  const normalizedLocale = normalizeLocale(locale);
  const definition = guidePages[guide];
  const content = definition.content[normalizedLocale];
  const isZh = normalizedLocale === 'zh';
  const pageUrl = buildAbsoluteUrl(`/${normalizedLocale}${definition.path}`);
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: content.title,
    description: content.description,
    mainEntityOfPage: pageUrl,
    inLanguage: normalizedLocale === 'zh' ? 'zh-CN' : 'en-US',
    author: {
      '@type': 'Organization',
      name: 'Samurai Sudoku',
      url: buildAbsoluteUrl(`/${normalizedLocale}`),
    },
    publisher: {
      '@type': 'Organization',
      name: 'Samurai Sudoku',
      url: buildAbsoluteUrl(`/${normalizedLocale}`),
    },
  };
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: normalizedLocale === 'zh' ? '首页' : 'Home',
        item: buildAbsoluteUrl(`/${normalizedLocale}`),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Samurai Sudoku',
        item: buildAbsoluteUrl(`/${normalizedLocale}/games/samurai`),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: content.title,
        item: pageUrl,
      },
    ],
  };
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: content.items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.title,
      description: item.body,
    })),
  };

  return (
    <>
      <Script
        id={`samurai-guide-article-jsonld-${guide}-${normalizedLocale}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <Script
        id={`samurai-guide-breadcrumb-jsonld-${guide}-${normalizedLocale}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Script
        id={`samurai-guide-itemlist-jsonld-${guide}-${normalizedLocale}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <article className="container mx-auto max-w-3xl px-4 py-10">
        <Link
          href={localizedHref(normalizedLocale, definition.backHref)}
          className="text-primary hover:underline"
        >
          ← {content.backLabel}
        </Link>
        <h1 className="mt-8 font-display text-4xl font-semibold tracking-tight md:text-5xl">
          {content.title}
        </h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">{content.intro}</p>
        <section className="mt-10 space-y-5">
          {content.items.map((item, index) => (
            <section key={item.title} className="rounded-lg border bg-background p-6">
              <h2 className="text-xl font-semibold">
                {definition.numbered ? `${index + 1}. ` : ''}
                {item.title}
              </h2>
              <p className="mt-3 leading-7 text-muted-foreground">{item.body}</p>
            </section>
          ))}
        </section>
        <section className="mt-10 rounded-lg border bg-secondary/30 p-6">
          <h2 className="text-2xl font-semibold">
            {isZh ? '如何把这页用到实际解题里' : 'How to use this page in a real puzzle'}
          </h2>
          <div className="mt-4 space-y-4 leading-7 text-muted-foreground">
            <p>
              {isZh
                ? '不要把攻略当成一次性阅读材料。打开一局当前难度的武士数独，把本页的步骤应用到一个具体区域：先选重叠宫或中心网格，再写候选数，最后只填能解释清楚的数字。这样页面内容会变成可复用的解题流程，而不是泛泛技巧。'
                : 'Do not treat this guide as a one-time article. Open a puzzle at your current difficulty and apply the steps to one concrete area: choose an overlap box or the center grid, write candidates, then place only numbers you can explain. That turns the page into a repeatable solving workflow instead of generic advice.'}
            </p>
            <p>
              {isZh
                ? '如果你在三到五分钟内没有确定进展，先回到本页的上一个步骤复查，而不是立刻点新游戏。大多数卡点来自漏看重叠区、候选数过期，或难度选择过高；把这些问题拆开检查，比随机换题更能提升通关率。'
                : 'If you make no confirmed progress for three to five minutes, return to the previous step on this page before starting a new game. Most stalls come from a missed overlap, stale candidates, or a difficulty level that is too high; checking those causes separately improves completion more than random puzzle switching.'}
            </p>
            <p>
              {isZh
                ? '完成一题后，用同难度归档再练一题，或切到相关指南补短板。新手优先看入门和第一步攻略；卡在中后盘时看候选数、重叠宫和常见错误；准备纸笔练习时再进入可打印题和 PDF 样张。'
                : 'After finishing one board, practice another puzzle at the same difficulty from the archive or move to the guide that matches your weak point. Beginners should use the starter and first-move pages; mid-puzzle stalls should use candidates, overlap boxes, and common mistakes; paper solvers should move to printable puzzles and the PDF sample.'}
            </p>
            <p>
              {isZh
                ? '最有效的做法是把每页攻略变成一个小检查表：这一页解决的是开局、候选数、重叠宫、难度选择还是卡关恢复？只带着一个目标进入棋盘，完成后再换下一页。这样既能减少来回切换难度，也能避免在 Evil 题里填完两个网格后因为第三个共享区域没有同步而崩盘。'
                : 'The most useful habit is turning each guide into a small checklist: is this page solving the opening, candidates, overlap boxes, difficulty choice, or stuck recovery? Bring one goal back to the board, finish that goal, then move to the next guide. That reduces difficulty switching and prevents Evil puzzles from collapsing after two grids because the third shared area was not synchronized.'}
            </p>
          </div>
          <div className="mt-5 flex flex-wrap gap-2 text-sm">
            <Link
              href={localizedHref(normalizedLocale, '/games/samurai/common-mistakes')}
              className="rounded-md border px-3 py-2 hover:bg-accent"
            >
              {isZh ? '常见错误排查' : 'Common mistakes'}
            </Link>
            <Link
              href={localizedHref(normalizedLocale, '/games/samurai/candidate-notes')}
              className="rounded-md border px-3 py-2 hover:bg-accent"
            >
              {isZh ? '候选数笔记' : 'Candidate notes'}
            </Link>
            <Link
              href={localizedHref(normalizedLocale, '/games/samurai/printable-practice-plan')}
              className="rounded-md border px-3 py-2 hover:bg-accent"
            >
              {isZh ? '打印练习计划' : 'Printable practice plan'}
            </Link>
          </div>
        </section>
        <footer className="mt-10 flex flex-wrap gap-3">
          <TrackedLink
            href={localizedHref(normalizedLocale, definition.primaryHref)}
            eventName={getPrimaryEventName(guide)}
            eventProperties={{
              locale: normalizedLocale,
              guide,
              destination: definition.primaryHref,
            }}
            className="rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {content.primaryCta}
          </TrackedLink>
          <TrackedLink
            href={localizedHref(normalizedLocale, definition.secondaryHref)}
            eventName="samurai_guide_secondary_cta_click"
            eventProperties={{
              locale: normalizedLocale,
              guide,
              destination: definition.secondaryHref,
            }}
            className="rounded-lg border border-primary px-6 py-3 font-medium text-primary hover:bg-primary/10"
          >
            {content.secondaryCta}
          </TrackedLink>
        </footer>
      </article>
    </>
  );
}
