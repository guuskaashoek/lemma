/**
 * Rule cards of unit 4. Each card's example is checked by the tests.
 */
import type { RuleCard } from "@/content/types";
import { L } from "./helpers";

export const rules: RuleCard[] = [
  {
    id: "u4.common-factor",
    name: L("Buiten haakjes halen", "Common factor"),
    statement: L(
      "Zit iets in alle termen? Zet het vóór de haakjes. Dit is haakjes wegwerken, maar dan andersom.",
      "Is something in every term? Put it in front of the brackets. This is expanding brackets, in reverse.",
    ),
    latex: "ab+ac=a(b+c)",
    lessonId: "u4.common-factor",
    example: {
      problem: L("Haal buiten haakjes: $6x+9$.", "Factor out: $6x+9$."),
      steps: [
        { latex: "6x+9", note: L("Beide termen zitten in de tafel van $3$.", "Both terms are multiples of $3$.") },
        { latex: "\\hl{3}\\cdot 2x+\\hl{3}\\cdot 3", note: L("Schrijf elke term als $3$ keer iets.", "Write each term as $3$ times something.") },
        { latex: "\\hl{3}(2x+3)", note: L("Zet de $3$ vóór de haakjes.", "Put the $3$ in front of the brackets.") },
      ],
    },
  },
  {
    id: "u4.zero-product",
    name: L("Product is nul", "Product is zero"),
    statement: L(
      "Is $A\\cdot B=0$? Dan is $A=0$ of $B=0$. Maak elke factor apart nul. Het teken $\\lor$ betekent 'of'.",
      "Is $A\\cdot B=0$? Then $A=0$ or $B=0$. Make each factor zero on its own. The sign $\\lor$ means 'or'.",
    ),
    latex: "A\\cdot B=0\\ \\Rightarrow\\ A=0\\lor B=0",
    lessonId: "u4.zero-product",
    example: {
      problem: L("Los op: $(x-3)(x+5)=0$.", "Solve: $(x-3)(x+5)=0$."),
      steps: [
        { latex: "(x-3)(x+5)=0", note: L("Een product is nul.", "A product is zero.") },
        { latex: "x-3=0\\lor x+5=0", note: L("Maak elke factor nul.", "Make each factor zero.") },
        { latex: "x=\\hl{3}\\lor x=\\hl{-5}", note: L("Welk getal maakt elk haakje nul?", "Which number makes each bracket zero?") },
      ],
      solutions: [{ x: 3 }, { x: -5 }],
    },
  },
  {
    id: "u4.square-equation",
    name: L("Kwadraat is getal", "Square equals number"),
    statement: L(
      "Bij $x^{2}=c$ met $c>0$ zijn er twee oplossingen: $\\sqrt{c}$ en $-\\sqrt{c}$. Bij $c=0$ alleen $0$. Bij $c<0$ geen: een kwadraat is nooit negatief.",
      "For $x^{2}=c$ with $c>0$ there are two solutions: $\\sqrt{c}$ and $-\\sqrt{c}$. For $c=0$ only $0$. For $c<0$ none: a square is never negative.",
    ),
    latex: "x^{2}=c\\ \\Rightarrow\\ x=\\sqrt{c}\\lor x=-\\sqrt{c}",
    lessonId: "u4.zero-product",
    example: {
      problem: L("Los op: $x^{2}=25$.", "Solve: $x^{2}=25$."),
      steps: [
        { latex: "x^{2}=25", note: L("Welk getal keer zichzelf is $25$?", "Which number times itself is $25$?") },
        { latex: "x=\\hl{5}\\lor x=\\hl{-5}", note: L("$5\\cdot 5=25$ en ook $(-5)\\cdot(-5)=25$.", "$5\\cdot 5=25$ and also $(-5)\\cdot(-5)=25$.") },
      ],
      solutions: [{ x: 5 }, { x: -5 }],
    },
  },
  {
    id: "u4.product-sum",
    name: L("Product-som", "Product-sum"),
    statement: L(
      "Ontbind $x^{2}+bx+c$: zoek twee getallen $p$ en $q$. Keer elkaar geeft $c$, opgeteld geeft $b$. Dan is het $(x+p)(x+q)$.",
      "Factorise $x^{2}+bx+c$: find two numbers $p$ and $q$. Multiplied they give $c$, added they give $b$. Then it is $(x+p)(x+q)$.",
    ),
    latex: "x^{2}+bx+c=(x+p)(x+q)\\quad p\\cdot q=c,\\ p+q=b",
    lessonId: "u4.product-sum",
    example: {
      problem: L("Ontbind: $x^{2}+7x+12$.", "Factorise: $x^{2}+7x+12$."),
      steps: [
        { latex: "x^{2}+7x+12", note: L("Keer $12$, plus $7$. Paren: $1\\cdot 12$, $2\\cdot 6$, $3\\cdot 4$.", "Times $12$, plus $7$. Pairs: $1\\cdot 12$, $2\\cdot 6$, $3\\cdot 4$.") },
        { latex: "x^{2}+\\hl{3x+4x}+12", note: L("$3+4=7$. Dat paar past.", "$3+4=7$. That pair fits.") },
        { latex: "(x+\\hl{3})(x+\\hl{4})", note: L("Zet de getallen in de haakjes.", "Put the numbers in the brackets.") },
      ],
    },
  },
  {
    id: "u4.parabola-shape",
    name: L("Dal of berg", "Valley or hill"),
    statement: L(
      "Kijk naar het getal $a$ voor $x^{2}$. Is $a$ positief, dan is het een dalparabool ($\\cup$). Is $a$ negatief, dan een bergparabool ($\\cap$). Let op: bij $-x^{2}$ is $a=-1$.",
      "Look at the number $a$ in front of $x^{2}$. If $a$ is positive, it is a valley parabola ($\\cup$). If $a$ is negative, a hill parabola ($\\cap$). Careful: in $-x^{2}$, $a=-1$.",
    ),
    latex: "a>0:\\ \\cup\\qquad a<0:\\ \\cap",
    lessonId: "u4.parabola",
    example: {
      problem: L("Is $y=3-2x^{2}$ een dal of een berg?", "Is $y=3-2x^{2}$ a valley or a hill?"),
      steps: [
        { latex: "3-2x^{2}", note: L("De term met $x^{2}$ staat niet vooraan.", "The term with $x^{2}$ is not at the front.") },
        { latex: "\\hl{-2}x^{2}+3", note: L("Zet hem vooraan: $a=-2$. Negatief, dus een berg $\\cap$.", "Put it at the front: $a=-2$. Negative, so a hill $\\cap$.") },
      ],
    },
  },
  {
    id: "u4.parabola-top",
    name: L("De top", "The vertex"),
    statement: L(
      "De top ligt op de symmetrie-as: $x_{top}=-\\frac{b}{2a}$. Ken je de nulpunten? Dan ligt de as precies in het midden. Vul $x_{top}$ in de formule in voor $y_{top}$.",
      "The vertex lies on the axis of symmetry: $x_{top}=-\\frac{b}{2a}$. Do you know the zeros? Then the axis is exactly halfway. Put $x_{top}$ into the formula to get $y_{top}$.",
    ),
    latex: "x_{top}=-\\frac{b}{2a}",
    lessonId: "u4.parabola",
    example: {
      problem: L(
        "De top van $y=x^{2}-6x+5$ ligt bij $x=-\\frac{-6}{2\\cdot 1}=3$. Bereken $y_{top}$.",
        "The vertex of $y=x^{2}-6x+5$ is at $x=-\\frac{-6}{2\\cdot 1}=3$. Work out $y_{top}$.",
      ),
      steps: [
        { latex: "3^{2}-6\\cdot 3+5", note: L("Vul $x=3$ in.", "Put in $x=3$.") },
        { latex: "\\hl{9}-\\hl{18}+5", note: L("Eerst kwadraat en keer.", "First the square and the multiplication.") },
        { latex: "\\hl{-4}", note: L("De top is $(3,-4)$.", "The vertex is $(3,-4)$.") },
      ],
    },
  },
  {
    id: "u4.discriminant",
    name: L("Discriminant", "Discriminant"),
    statement: L(
      "Schrijf eerst $ax^{2}+bx+c=0$. De discriminant is $D=b^{2}-4ac$. Zet negatieve getallen tussen haakjes.",
      "First write $ax^{2}+bx+c=0$. The discriminant is $D=b^{2}-4ac$. Put negative numbers in brackets.",
    ),
    latex: "D=b^{2}-4ac",
    lessonId: "u4.abc",
    example: {
      problem: L("Bereken $D$ voor $x^{2}+3x-4=0$.", "Work out $D$ for $x^{2}+3x-4=0$."),
      steps: [
        { latex: "3^{2}-4\\cdot 1\\cdot (-4)", note: L("$a=1$, $b=3$, $c=-4$.", "$a=1$, $b=3$, $c=-4$.") },
        { latex: "9+\\hl{16}", note: L("Min keer min is plus.", "Minus times minus is plus.") },
        { latex: "\\hl{25}", note: L("$D=25$.", "$D=25$.") },
      ],
    },
  },
  {
    id: "u4.abc-formula",
    name: L("abc-formule", "Quadratic formula"),
    statement: L(
      "Voor $ax^{2}+bx+c=0$: $x=\\frac{-b+\\sqrt{D}}{2a}$ of $x=\\frac{-b-\\sqrt{D}}{2a}$. Start bij de as $-\\frac{b}{2a}$ en stap even ver naar links als naar rechts.",
      "For $ax^{2}+bx+c=0$: $x=\\frac{-b+\\sqrt{D}}{2a}$ or $x=\\frac{-b-\\sqrt{D}}{2a}$. Start at the axis $-\\frac{b}{2a}$ and step equally far left and right.",
    ),
    latex: "x=\\frac{-b\\pm\\sqrt{D}}{2a}",
    lessonId: "u4.abc",
    example: {
      problem: L("Los op: $x^{2}+x-6=0$.", "Solve: $x^{2}+x-6=0$."),
      steps: [
        { latex: "x^{2}+x-6=0", note: L("$a=1$, $b=1$, $c=-6$. $D=1+24=25$.", "$a=1$, $b=1$, $c=-6$. $D=1+24=25$.") },
        { latex: "x=\\frac{-1+\\sqrt{25}}{2}\\lor x=\\frac{-1-\\sqrt{25}}{2}", note: L("Vul in in de abc-formule.", "Fill in the quadratic formula.") },
        { latex: "x=\\frac{-1+\\hl{5}}{2}\\lor x=\\frac{-1-\\hl{5}}{2}", note: L("$\\sqrt{25}=5$.", "$\\sqrt{25}=5$.") },
        { latex: "x=\\hl{2}\\lor x=\\hl{-3}", note: L("Reken beide breuken uit.", "Work out both fractions.") },
      ],
      solutions: [{ x: 2 }, { x: -3 }],
    },
  },
  {
    id: "u4.solution-count",
    name: L("Hoeveel oplossingen?", "How many solutions?"),
    statement: L(
      "$D>0$: twee oplossingen. $D=0$: één oplossing. $D<0$: geen oplossing. In beeld: de parabool snijdt de $x$-as twee keer, raakt hem, of mist hem.",
      "$D>0$: two solutions. $D=0$: one solution. $D<0$: no solution. In the picture: the parabola crosses the $x$-axis twice, touches it, or misses it.",
    ),
    latex: "D>0:\\ 2\\qquad D=0:\\ 1\\qquad D<0:\\ 0",
    lessonId: "u4.discriminant",
    example: {
      problem: L("Hoeveel oplossingen heeft $x^{2}+2x+5=0$?", "How many solutions does $x^{2}+2x+5=0$ have?"),
      steps: [
        { latex: "2^{2}-4\\cdot 1\\cdot 5", note: L("Bereken $D=b^{2}-4ac$.", "Work out $D=b^{2}-4ac$.") },
        { latex: "4-\\hl{20}", note: L("$4\\cdot 1\\cdot 5=20$.", "$4\\cdot 1\\cdot 5=20$.") },
        { latex: "\\hl{-16}", note: L("$D<0$: geen oplossing.", "$D<0$: no solution.") },
      ],
    },
  },
];
