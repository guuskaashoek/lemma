/**
 * Colour coding for formulas.
 *
 * Lemma uses exactly three formula colours, everywhere, always with the same
 * meaning (see the legend in the app):
 *
 * - variables (x, y, a, ...)          → class `m-var`
 * - numbers (3, 2,5, ...)              → class `m-num`
 * - the part that changes in a step    → class `m-hl`, written as `\hl{...}`
 *
 * Content authors only write `\hl{...}` by hand. Variables and numbers are
 * coloured automatically by `colorize`, which rewrites LaTeX before KaTeX
 * renders it.
 */

/** Commands whose braced argument is text, not maths: copied unchanged. */
const TEXT_COMMANDS = new Set(["\\text", "\\textbf", "\\mathrm", "\\operatorname", "\\mbox", "\\htmlClass"]);
/** Commands followed by N mandatory arguments that may be single tokens. */
const ARG_COUNT: Record<string, number> = { "\\frac": 2, "\\dfrac": 2, "\\tfrac": 2, "\\sqrt": 1, "\\binom": 2 };

const wrap = (cls: string, inner: string) => `\\htmlClass{${cls}}{${inner}}`;

/** Index of the brace that closes the group opened at `open`. */
function closingBrace(s: string, open: number): number {
  let depth = 0;
  for (let i = open; i < s.length; i++) {
    if (s[i] === "\\") {
      i++; // skip escaped character
      continue;
    }
    if (s[i] === "{") depth++;
    else if (s[i] === "}" && --depth === 0) return i;
  }
  return s.length - 1;
}

/** Rewrites LaTeX so variables, numbers and highlights get their colour class. */
export function colorize(latex: string): string {
  let out = "";
  let i = 0;
  // Number of upcoming single-token arguments that need braces (e.g. ^2).
  let pendingArgs = 0;

  const emitToken = (token: string) => {
    out += pendingArgs > 0 ? `{${token}}` : token;
    if (pendingArgs > 0) pendingArgs--;
  };

  while (i < latex.length) {
    const ch = latex[i];

    if (ch === "\\") {
      const m = latex.slice(i).match(/^\\([a-zA-Z]+|.)/);
      const cmd = m ? m[0] : "\\";
      i += cmd.length;

      if (cmd === "\\hl" && latex[i] === "{") {
        const end = closingBrace(latex, i);
        emitToken(wrap("m-hl", colorize(latex.slice(i + 1, end))));
        i = end + 1;
        continue;
      }
      if (TEXT_COMMANDS.has(cmd)) {
        // Copy the command and all its directly following braced groups.
        let chunk = cmd;
        while (latex[i] === "{") {
          const end = closingBrace(latex, i);
          chunk += latex.slice(i, end + 1);
          i = end + 1;
        }
        emitToken(chunk);
        continue;
      }
      if (pendingArgs > 0) pendingArgs--;
      out += cmd;
      if (cmd in ARG_COUNT) {
        // Optional argument of \sqrt[n]{...}.
        if (cmd === "\\sqrt" && latex[i] === "[") {
          const end = latex.indexOf("]", i);
          out += "[" + colorize(latex.slice(i + 1, end)) + "]";
          i = end + 1;
        }
        pendingArgs = ARG_COUNT[cmd];
      }
      continue;
    }

    if (ch === "{") {
      const end = closingBrace(latex, i);
      const inner = colorize(latex.slice(i + 1, end));
      if (pendingArgs > 0) pendingArgs--;
      out += `{${inner}}`;
      i = end + 1;
      continue;
    }

    if (ch === "^" || ch === "_") {
      out += ch;
      pendingArgs = 1;
      i++;
      continue;
    }

    if (/\d/.test(ch)) {
      // A pending single-token argument takes only one digit: x^23 = x^{2}3.
      if (pendingArgs > 0) {
        emitToken(wrap("m-num", ch));
        i++;
        continue;
      }
      const m = latex.slice(i).match(/^\d+(?:(?:\.|\{,\}|,)\d+)?/)!;
      out += wrap("m-num", m[0]);
      i += m[0].length;
      continue;
    }

    if (/[a-zA-Z]/.test(ch)) {
      emitToken(wrap("m-var", ch));
      i++;
      continue;
    }

    if (ch.trim() === "") {
      out += ch;
      i++;
      continue;
    }

    emitToken(ch);
    i++;
  }
  return out;
}

/** KaTeX options used everywhere formulas are rendered. */
export const KATEX_OPTIONS = {
  throwOnError: false,
  // Only our colour classes are allowed, no other HTML extensions.
  trust: (ctx: { command: string }) => ctx.command === "\\htmlClass",
  strict: "ignore" as const,
  macros: {
    // Unknown \hl outside colorize (e.g. in a raw render) just shows the content.
    "\\hl": "#1",
  },
};
