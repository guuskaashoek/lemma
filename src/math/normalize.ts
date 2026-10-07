/**
 * Turns LaTeX as typed by a learner (via MathLive) or written in lesson
 * content into LaTeX the Compute Engine parses the way a Dutch school would.
 *
 * Important Dutch conventions handled here:
 * - Decimal comma: `2,5` and MathLive's `2{,}5` both mean 2.5.
 * - `:` is division: `12 : 4` means 12 ÷ 4.
 * - `·` and `×` are multiplication.
 */

/**
 * Removes our own markup macros so the expression can be parsed.
 * `\hl{3x}` (highlighted, see `markup.ts`) becomes `3x`, and so does
 * `\ask{3x}` (a blank the learner fills in during guided solving).
 */
export function stripMarkup(latex: string): string {
  let out = latex;
  // Repeat to handle nested macros such as \hl{\hl{x}}.
  for (let i = 0; i < 5; i++) {
    const next = replaceMacro(replaceMacro(out, "\\hl", (inner) => inner), "\\ask", (inner) => inner);
    if (next === out) break;
    out = next;
  }
  return out;
}

/**
 * Replaces every `\name{...}` with `fn(...)`, respecting nested braces.
 * Exported for the colouring code, which uses the same scanner.
 */
export function replaceMacro(
  latex: string,
  name: string,
  fn: (inner: string) => string,
): string {
  let out = "";
  let i = 0;
  while (i < latex.length) {
    const at = latex.indexOf(name + "{", i);
    // Make sure we matched the whole command, not a prefix of a longer one.
    if (at === -1) {
      out += latex.slice(i);
      break;
    }
    out += latex.slice(i, at);
    let depth = 0;
    let j = at + name.length;
    for (; j < latex.length; j++) {
      if (latex[j] === "{") depth++;
      else if (latex[j] === "}") {
        depth--;
        if (depth === 0) break;
      }
    }
    const inner = latex.slice(at + name.length + 1, j);
    out += fn(inner);
    i = j + 1;
  }
  return out;
}

/** Normalises learner or content LaTeX before handing it to the CAS. */
export function normalizeLatex(raw: string): string {
  let s = stripMarkup(raw).trim();

  // MathLive writes a decimal comma as `{,}`; people may also type a plain
  // comma between digits. Both become a decimal point.
  s = s.replace(/(\d)\s*\{,\}\s*(\d)/g, "$1.$2");
  s = s.replace(/(\d),(\d)/g, "$1.$2");

  // Multiplication signs.
  s = s.replace(/\\times/g, "\\cdot ").replace(/·|×/g, "\\cdot ").replace(/\\ast/g, "\\cdot ");
  s = s.replace(/(\d)\s*\*\s*/g, "$1\\cdot ").replace(/\*/g, "\\cdot ");

  // Dutch division sign ":" (but not the `:=` assignment).
  s = s.replace(/:(?!=)/g, "\\div ");
  s = s.replace(/÷/g, "\\div ");

  // Unicode minus and friends.
  s = s.replace(/[−–]/g, "-");

  // Unicode letters MathLive can emit.
  s = s.replace(/π/g, "\\pi ").replace(/√/g, "\\sqrt");

  // Spacing commands carry no meaning.
  s = s.replace(/\\[,;:! ]/g, "").replace(/\\(q?quad)\b/g, "");
  s = s.replace(/\\mathrm\{e\}/g, "e");

  return s.trim();
}

/** Converts a JS number to the locale's decimal notation, e.g. 2.5 → "2,5". */
export function formatDecimal(value: number, locale: "nl" | "en"): string {
  const s = String(value);
  return locale === "nl" ? s.replace(".", ",") : s;
}
