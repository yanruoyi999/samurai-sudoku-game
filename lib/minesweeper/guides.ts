export type MinesweeperGuideSlug =
  | "how-to-play"
  | "beginner-strategy"
  | "first-click-safe"
  | "flags-and-numbers";

type Locale = "en" | "zh";

export interface MinesweeperGuide {
  slug: MinesweeperGuideSlug;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  eyebrow: Record<Locale, string>;
  keywords: Record<Locale, string[]>;
  sections: Array<{
    heading: Record<Locale, string>;
    body: Record<Locale, string>;
    bullets?: Record<Locale, string[]>;
  }>;
  faq: Array<{
    question: Record<Locale, string>;
    answer: Record<Locale, string>;
  }>;
}

export const MINESWEEPER_GUIDES: readonly MinesweeperGuide[] = [
  {
    slug: "how-to-play",
    title: {
      en: "How to Play Minesweeper Online",
      zh: "扫雷怎么玩",
    },
    description: {
      en: "Learn how to play Minesweeper online, read numbers, mark mines, and clear safe cells without guessing too early.",
      zh: "学习在线扫雷的基本玩法，包括数字含义、插旗、翻安全格和避免过早猜测。",
    },
    eyebrow: {
      en: "Minesweeper rules",
      zh: "扫雷规则",
    },
    keywords: {
      en: ["how to play minesweeper", "minesweeper rules", "minesweeper online rules", "free minesweeper guide"],
      zh: ["扫雷怎么玩", "扫雷规则", "在线扫雷规则", "免费扫雷教程"],
    },
    sections: [
      {
        heading: {
          en: "What the numbers mean",
          zh: "数字代表什么",
        },
        body: {
          en: "Every number tells you how many mines touch that square, including diagonals. A 1 means exactly one of the eight surrounding cells is a mine. A blank cell means none of the surrounding cells are mines, so the board can open a larger safe area.",
          zh: "每个数字表示它周围八个方向一共有多少个地雷，包括斜角。数字 1 表示周围八格里正好有一个雷。空白格表示周围没有雷，所以棋盘会展开更大的一片安全区。",
        },
      },
      {
        heading: {
          en: "The basic loop",
          zh: "基本解题循环",
        },
        body: {
          en: "Minesweeper is a repeat loop of reading numbers, marking certain mines, and opening cells that are guaranteed safe. You do not need to guess until the board stops giving forced moves.",
          zh: "扫雷的核心循环是读数字、标记确定的雷、翻开确定安全的格子。在棋盘还有必然推理之前，不需要急着猜。",
        },
        bullets: {
          en: [
            "Open a safe-looking area first.",
            "Flag cells only when the surrounding numbers prove they must be mines.",
            "When all mines around a number are flagged, open the remaining neighboring cells.",
          ],
          zh: [
            "先打开看起来更安全的区域。",
            "只有数字能证明某格一定是雷时再插旗。",
            "当某个数字周围的雷都标完后，翻开剩余相邻格。",
          ],
        },
      },
    ],
    faq: [
      {
        question: {
          en: "Do I need to guess in Minesweeper?",
          zh: "扫雷一定要猜吗？",
        },
        answer: {
          en: "Not at the start. Most beginner boards have many forced safe moves. Guess only after checking every number pattern around the open edge.",
          zh: "开局通常不需要。初级棋盘会给出很多必然安全步。只有检查完开放边界的数字模式后，才考虑猜测。",
        },
      },
      {
        question: {
          en: "What is the fastest way to improve?",
          zh: "怎么最快提高扫雷水平？",
        },
        answer: {
          en: "Replay beginner boards slowly and explain each flag before placing it. Speed comes after your number patterns become automatic.",
          zh: "先慢速重复练初级棋盘，每次插旗前说清理由。常见数字模式熟练后，速度自然会上来。",
        },
      },
    ],
  },
  {
    slug: "beginner-strategy",
    title: {
      en: "Minesweeper Strategy for Beginners",
      zh: "扫雷新手策略",
    },
    description: {
      en: "A beginner Minesweeper strategy guide for reading 1-2-1 patterns, using flags carefully, and avoiding risky early guesses.",
      zh: "面向新手的扫雷策略指南，讲解 1-2-1 模式、谨慎插旗和避免开局冒险猜测。",
    },
    eyebrow: {
      en: "Beginner strategy",
      zh: "新手策略",
    },
    keywords: {
      en: ["minesweeper strategy for beginners", "beginner minesweeper tips", "minesweeper 1-2-1 pattern"],
      zh: ["扫雷新手策略", "扫雷入门技巧", "扫雷 1-2-1 模式"],
    },
    sections: [
      {
        heading: {
          en: "Start from the open edge",
          zh: "从开放边界开始",
        },
        body: {
          en: "The useful information sits on the boundary between revealed numbers and hidden cells. Work along that edge instead of jumping randomly across the board.",
          zh: "最有用的信息在已翻开的数字和未翻开的格子交界处。沿着这条边界推理，比在棋盘上随机跳更稳。",
        },
      },
      {
        heading: {
          en: "Learn the common 1-2-1 shape",
          zh: "先学常见的 1-2-1",
        },
        body: {
          en: "When three numbers on an edge form 1-2-1 and touch the same hidden strip, the two outside hidden cells are often mines and the middle hidden cell is safe. Check the exact neighbors before applying it.",
          zh: "当边界上连续三个数字形成 1-2-1，并且面对同一条未翻开区域时，两侧隐藏格经常是雷，中间隐藏格通常安全。应用前要确认相邻格关系完全一致。",
        },
      },
      {
        heading: {
          en: "Use flags as proof, not decoration",
          zh: "插旗要当证明，不要当标记装饰",
        },
        body: {
          en: "A wrong flag can break the rest of your logic. If you are not certain, leave the cell hidden and continue reading other numbers first.",
          zh: "错误旗帜会破坏后续推理。如果还不能确定，先不要插旗，继续检查其他数字。",
        },
      },
    ],
    faq: [
      {
        question: {
          en: "Should beginners always use flags?",
          zh: "新手一定要插旗吗？",
        },
        answer: {
          en: "Flags are helpful, but only when you are certain. Over-flagging uncertain cells makes the board harder to reason about.",
          zh: "旗帜很有用，但只适合确定的雷。把不确定的格子也插旗，会让后续推理更混乱。",
        },
      },
      {
        question: {
          en: "Which difficulty should I use first?",
          zh: "第一次应该选哪个难度？",
        },
        answer: {
          en: "Use Beginner until you can clear boards without random clicks, then move to Intermediate for larger edge-reading practice.",
          zh: "先练初级，直到可以不靠随机点击通关，再进入中级练更大的边界推理。",
        },
      },
    ],
  },
  {
    slug: "first-click-safe",
    title: {
      en: "Minesweeper Safe First Click Explained",
      zh: "扫雷第一下不踩雷说明",
    },
    description: {
      en: "Understand how safe first click Minesweeper works and why the board is generated after your first move.",
      zh: "了解扫雷第一下不踩雷的实现方式，以及为什么棋盘会在第一次点击后生成。",
    },
    eyebrow: {
      en: "Safe first click",
      zh: "第一下安全",
    },
    keywords: {
      en: ["minesweeper safe first click", "first click safe minesweeper", "can minesweeper first click be a mine"],
      zh: ["扫雷第一下不踩雷", "扫雷第一下安全", "扫雷第一下会踩雷吗"],
    },
    sections: [
      {
        heading: {
          en: "Why the first click is safe here",
          zh: "为什么这里第一下安全",
        },
        body: {
          en: "This board waits for your first click, then places mines everywhere except that first clicked cell. That keeps the opening fair while still generating a fresh puzzle.",
          zh: "本站扫雷会等你第一次点击后再放置地雷，并排除第一次点击的格子。这样开局更公平，同时每局仍然是新棋盘。",
        },
      },
      {
        heading: {
          en: "Safe does not mean solved",
          zh: "安全不等于直接解开",
        },
        body: {
          en: "A safe first click only prevents an instant loss. The opened cell may still be a number, so you still need to read the surrounding clues.",
          zh: "第一下安全只是避免开局立刻失败。翻开的格子仍可能是数字，后续仍需要根据周围线索推理。",
        },
      },
    ],
    faq: [
      {
        question: {
          en: "Can the first click still be next to a mine?",
          zh: "第一下旁边还可能有雷吗？",
        },
        answer: {
          en: "Yes. The clicked cell is safe, but nearby cells can still contain mines. Read the number after the first click.",
          zh: "可能。被点击的格子本身安全，但附近仍可能有雷。第一下后要看数字继续推理。",
        },
      },
      {
        question: {
          en: "Does safe first click make Minesweeper too easy?",
          zh: "第一下安全会让扫雷太简单吗？",
        },
        answer: {
          en: "No. It removes a frustrating instant loss, but the rest of the board keeps the same mine count and logic challenge.",
          zh: "不会。它只是去掉开局秒输的挫败感，后续棋盘的雷数和推理难度不变。",
        },
      },
    ],
  },
  {
    slug: "flags-and-numbers",
    title: {
      en: "Minesweeper Flags and Numbers Guide",
      zh: "扫雷旗帜和数字规则",
    },
    description: {
      en: "A focused guide to Minesweeper flags, number clues, and when to open safe cells around completed numbers.",
      zh: "专门讲解扫雷旗帜、数字线索，以及什么时候可以翻开已完成数字周围的安全格。",
    },
    eyebrow: {
      en: "Flags and numbers",
      zh: "旗帜与数字",
    },
    keywords: {
      en: ["minesweeper flags", "minesweeper numbers explained", "what do minesweeper numbers mean"],
      zh: ["扫雷旗帜", "扫雷数字含义", "扫雷数字代表什么"],
    },
    sections: [
      {
        heading: {
          en: "A number is a local contract",
          zh: "数字是局部约束",
        },
        body: {
          en: "If a 3 touches exactly three hidden cells, all three hidden cells must be mines. If a 3 already touches three flags, every other hidden neighbor is safe.",
          zh: "如果一个 3 正好接触三个未翻开格子，那么这三个格子一定都是雷。如果一个 3 周围已经有三个旗帜，其他相邻隐藏格就是安全的。",
        },
      },
      {
        heading: {
          en: "Do not flag every suspicion",
          zh: "不要把怀疑都插旗",
        },
        body: {
          en: "Flags are best used for certainty. A suspected mine is not the same as a proven mine, and one wrong flag can cause a chain of wrong openings.",
          zh: "旗帜最好只用于确定结论。怀疑有雷不等于证明有雷，一个错误旗帜可能引发一串错误翻格。",
        },
      },
    ],
    faq: [
      {
        question: {
          en: "What does a blank cell mean?",
          zh: "空白格是什么意思？",
        },
        answer: {
          en: "A blank revealed cell has zero adjacent mines, so nearby blank areas can open automatically.",
          zh: "已翻开的空白格表示周围没有雷，所以附近的空白区域会自动展开。",
        },
      },
      {
        question: {
          en: "Can I win without flags?",
          zh: "不插旗能通关吗？",
        },
        answer: {
          en: "Yes, but flags make beginner and intermediate boards easier to track. Use them when a mine is proven.",
          zh: "可以，但旗帜能让初级和中级棋盘更容易跟踪。确认某格是雷时再使用。",
        },
      },
    ],
  },
] as const;

export const MINESWEEPER_GUIDE_SLUGS = MINESWEEPER_GUIDES.map((guide) => guide.slug);

export function getMinesweeperGuide(slug: string): MinesweeperGuide | undefined {
  return MINESWEEPER_GUIDES.find((guide) => guide.slug === slug);
}
