// How to picture each project, keyed by slug (see src/lib/projectSlug.ts).
//
// Screenshots of GitHub repo pages are deliberately not used — a repo header
// says nothing about the project. Prefer, in order:
//   1. `image`  — an illustration the project already ships (README figure, logo, demo gif)
//   2. `selector`/`clip` on a live page — the actual artefact: the chart, the
//      equation, the board. Not the page around it.
//   3. `skip`   — some projects (a policy document, a curated text list) have no
//      visual. A blank tile beats a screenshot of a page of prose.
//
// Coordinates are CSS pixels in a 1440x900 viewport, measured with `--probe`.
// `fit: 'contain'` pads to 16:10 instead of cropping; use it where the edges
// of the artefact carry meaning.

export interface Shot {
  /** Download this image instead of driving a browser. */
  image?: string;
  /** Visit this instead of the project's own href. */
  url?: string;
  /** Clip to the first element matching this selector. */
  selector?: string;
  /** Clip to an explicit region, in CSS pixels. */
  clip?: { x: number; y: number; width: number; height: number };
  /** Extra breathing room around a selector clip. */
  pad?: number;
  /** Pad to aspect instead of cropping. */
  fit?: 'cover' | 'contain';
  /** Viewport, when a project needs a wider or taller stage. */
  viewport?: { width: number; height: number };
  /** Extra settle time for animation-heavy pages. */
  wait?: number;
  /** Run before measuring — dismiss overlays, expand panels, drive the demo. */
  prepare?: string;
  /** Settle time after `prepare`, when it kicks off a render. */
  prepareWait?: number;
  /** No sensible image exists; render a blank tile. */
  skip?: boolean;
}

export const SHOTS: Record<string, Shot> = {
  // --- Ships its own artwork ---------------------------------------------
  'rusted-doom-launcher': {
    image:
      'https://raw.githubusercontent.com/stared/rusted-doom-launcher/main/rusted_doom_launcher_screenshot.jpg',
  },
  livelossplot: {
    image: 'https://raw.githubusercontent.com/stared/livelossplot/main/livelossplot.gif',
    fit: 'contain',
  },
  'quantum-tensors-js': {
    image:
      'https://raw.githubusercontent.com/Quantum-Flytrap/quantum-tensors/master/imgs/quantum-tensors-logo.jpg',
    fit: 'contain',
  },
  'bra-ket-vue': {
    image:
      'https://raw.githubusercontent.com/Quantum-Flytrap/bra-ket-vue/master/imgs/beam_splitter.png',
    fit: 'contain',
  },
  'quantum-game-2': {
    image:
      'https://raw.githubusercontent.com/Quantum-Game/quantum-game-2/master/public/img/qg2_logo.png',
    fit: 'contain',
  },
  'which-machine-learning-algorithm-are-you': {
    image:
      'https://raw.githubusercontent.com/stared/which-ml-are-you/master/precision_recall_accuracy.png',
    fit: 'contain',
  },
  'nalogi-co-daja-czemu-zapobiegaja-graf-slow': {
    image: 'https://raw.githubusercontent.com/stared/nalogi-viz/master/screenshot.png',
  },
  '7-5-kadencji': {
    // Repo moved from mikolajjj to tmikolajczyk; the screenshot the README
    // still links to at the root now lives under old_sankey/.
    image:
      'https://raw.githubusercontent.com/tmikolajczyk/7kadencji/master/old_sankey/screenshot.png',
  },
  'analiza-i-wizualizacja-danych-maturalnych-delab-uw': {
    image:
      'https://raw.githubusercontent.com/stared/delab-matury/master/owoce/finalisci_laureaci.png',
    fit: 'contain',
  },
  'szkola-letnia-analizy-danych-2015-delab-uw': {
    image:
      'https://raw.githubusercontent.com/DELabUW/szkola-letnia-2015/master/demo/wykresy_reklamowe.png',
    fit: 'contain',
  },
  'themes-and-colors-of-wolne-lektury-books': {
    image:
      'https://raw.githubusercontent.com/stared/wizualizacja-wolnych-lektur/master/wolnelektury_themes_screenshot.png',
  },
  '256-tags-of-stack-overflow-stack-exchange-network': {
    image:
      'https://raw.githubusercontent.com/stared/tag-graph-map-of-stackexchange/master/images/so_256tags_map_rc2_mid_res.png',
  },
  'trypophobia-image-detector-browser-plugin-using-deep-learning': {
    image: 'https://raw.githubusercontent.com/cytadela8/trypophobia/master/resources/poc.gif',
  },

  // --- Live pages, clipped to the artefact -------------------------------
  'the-tree-of-tree': {
    selector: '.tree-wrap',
  },
  '15-years-of-starcraft-ii-balance-changes-visualized': {
    clip: { x: 24, y: 210, width: 1392, height: 870 },
  },
  'equations-explained-colorfully': {
    // The rendered equation itself, not the markdown pane beside it.
    selector: '#equation-container',
    pad: 40,
    fit: 'contain',
  },
  'webr-ggplot2-playground': {
    // WebAssembly R has to boot and run before a plot exists.
    selector: 'img.chart-image',
    wait: 18000,
    fit: 'contain',
  },
  'quesma-charts': {
    clip: { x: 15, y: 344, width: 690, height: 431 },
  },
  'virtual-lab-by-quantum-flytrap': {
    clip: { x: 280, y: 153, width: 880, height: 550 },
    // The lab opens onto a 22-step guided tour; tear each panel out rather than
    // clicking OK, which only advances to the next one.
    prepare: `
      (() => {
        for (let i = 0; i < 30; i++) {
          const ok = Array.from(document.querySelectorAll('button'))
            .find((b) => /^ok$/i.test((b.textContent || '').trim()));
          if (!ok) break;
          let panel = ok;
          for (let up = 0; up < 4 && panel.parentElement; up++) {
            panel = panel.parentElement;
            if (panel.querySelector('h2, p')) break;
          }
          panel.remove();
        }
      })()
    `,
    wait: 7000,
  },
  'tensor-diagrams-penrose-graphical-notation-in-d3-js': {
    // The project's gh-pages is TypeDoc API docs, and its browser-test.html
    // needs an uncommitted build; render the published bundle instead.
    url: 'fixture:tensor-diagrams.html',
    selector: '#diagram',
    fit: 'contain',
    pad: 40,
  },
  'tree-of-reddit-sex-life': {
    // The Observable notebook does not render its chart headlessly; use the
    // thumbnail Observable itself publishes for the notebook.
    image:
      'https://static.observableusercontent.com/thumbnail/0a5ee493057171b1f4697db0fb2e4644390d5c32b90562a5143003552b03c6c1.jpg',
  },
  'interactive-machine-learning-list': {
    selector: '.illustration',
  },
  'map-of-polish-composers': {
    clip: { x: 0, y: 74, width: 1280, height: 800 },
    prepare: `document.querySelectorAll('.c-onboard__screen, .c-onboard').forEach(el => el.remove())`,
    wait: 6000,
  },
  'quantum-game-with-photons': {
    clip: { x: 80, y: 0, width: 1280, height: 800 },
  },
  'matrix-factorization-viz': {
    clip: { x: 8, y: 27, width: 1440, height: 900 },
  },
  '3dflu-cent-university-of-warsaw': {
    clip: { x: 700, y: 55, width: 600, height: 375 },
  },
  'ritu-blah-blau-global-game-jam': {
    selector: '.field--name-field-game-screenshot img',
  },
  tagoverflow: {
    // Just the tag graph — the control panel and side boxes sit outside this box.
    clip: { x: 370, y: 130, width: 600, height: 375 },
    wait: 5000,
  },
  "fellows-and-alumni-of-the-polish-children-s-fund": {
    selector: 'svg',
    fit: 'contain',
  },
  'qubism-in-qutip': {
    // A colourful self-similar qubism plot. Picked by position rather than by
    // size — the largest output in this notebook is a drab scatter grid.
    clip: { x: 219, y: 10366, width: 425, height: 424 },
    fit: 'contain',
  },
  'thinking-in-tensors-writing-in-pytorch': {
    // The notebooks save no plot outputs, and the largest image on the page is
    // an embedded joke. Use the maths itself: the derivative worked through in
    // the gradient-descent notebook.
    url: 'https://nbviewer.org/github/stared/thinking-in-tensors-writing-in-pytorch/blob/master/2%20Gradient%20Descent.ipynb',
    clip: { x: 224, y: 900, width: 1041, height: 650 },
  },
  offtopicarium: {
    selector: '#page-content img.image',
  },
  'wakacyjne-warsztaty-wielodyscyplinarne': {
    selector: 'main.container img',
  },
  'weltschmerz-by-age': {
    // The chart only exists after running a query, and the Go button sits in a
    // form that would otherwise navigate away before anything renders.
    prepare: `
      document.querySelector('form').addEventListener('submit', e => e.preventDefault());
      document.querySelector('#go').click();
    `,
    selector: 'svg',
    wait: 6000,
  },
  'pulser-studio': {
    selector: 'img.wp-block-cover__image-background',
    // The consent notice lives in a shadow root, so it survives the generic
    // overlay sweep; drop its host outright.
    prepare: `
      Array.from(document.querySelectorAll('*'))
        .filter((el) => el.shadowRoot && /cookie/i.test(el.shadowRoot.textContent || ''))
        .forEach((el) => el.remove())
    `,
    fit: 'contain',
    wait: 6000,
  },

  // --- No meaningful visual ----------------------------------------------
  'ai-development-policy-for-poland': { skip: true },
  'science-based-games': { skip: true },
};
