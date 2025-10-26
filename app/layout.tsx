import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Samurai Sudoku - Daily Puzzle Challenge",
  description: "Play Samurai Sudoku online. Daily puzzles with offline support, hints, and progress tracking.",
  keywords: ["sudoku", "samurai sudoku", "puzzle", "brain game", "logic game"],
  authors: [{ name: "Samurai Sudoku" }],
  openGraph: {
    title: "Samurai Sudoku - Daily Puzzle Challenge",
    description: "Challenge yourself with daily Samurai Sudoku puzzles",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
