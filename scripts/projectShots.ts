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
  /** Which frame of an animation to use. Defaults to the last. */
  frame?: 'first' | 'last';
  /** Set false to keep surrounding whitespace instead of trimming to content. */
  trim?: boolean;
  /** Letterbox colour, for artefacts that are not on white. */
  background?: string;
  /** Inset around letterboxed art, in output pixels. */
  margin?: number;
  /** JS expression returning {x,y,width,height} — for regions no selector fits. */
  pickRect?: string;
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
    fit: 'contain',
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
    fit: 'contain',
  },
  'trypophobia-image-detector-browser-plugin-using-deep-learning': {
    // The demo GIF ends mid-scroll; its opening frame shows the plugin at work.
    image: 'https://raw.githubusercontent.com/cytadela8/trypophobia/master/resources/poc.gif',
    frame: 'first',
  },

  // --- Live pages, clipped to the artefact -------------------------------
  'the-tree-of-tree': {
    selector: '.tree-wrap',
  },
  '15-years-of-starcraft-ii-balance-changes-visualized': {
    clip: { x: 24, y: 210, width: 1392, height: 870 },
  },
  'equations-explained-colorfully': {
    // The rendered equation itself. No padding: the markdown editor starts
    // three pixels to its right and the caption sits just above it.
    selector: '#equation-container',
    fit: 'contain',
  },
  'webr-ggplot2-playground': {
    // WebAssembly R has to boot and run before a plot exists.
    selector: 'img.chart-image',
    wait: 18000,
    fit: 'contain',
  },
  'quesma-charts': {
    selector: '.gallery-card',
    fit: 'contain',
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
    // The formula label is a positioned div inside #diagram; trimming crops
    // into it, so frame the element directly and leave the whitespace alone.
    selector: '#diagram',
    pad: 40,
    fit: 'contain',
    trim: false,
  },
  'tree-of-reddit-sex-life': {
    // The Observable notebook does not render its chart headlessly; use the
    // thumbnail Observable itself publishes for the notebook.
    image:
      'https://static.observableusercontent.com/thumbnail/0a5ee493057171b1f4697db0fb2e4644390d5c32b90562a5143003552b03c6c1.jpg',
  },
  'interactive-machine-learning-list': {
    selector: '.illustration',
    fit: 'contain',
  },
  'map-of-polish-composers': {
    // A white-on-black timeline of a few hundred faint marks. At thumbnail size
    // any crop reads as an empty black rectangle, so show nothing instead.
    skip: true,
  },
  'quantum-game-with-photons': {
    clip: { x: 80, y: 0, width: 1280, height: 800 },
  },
  'matrix-factorization-viz': {
    // The SVG is 1600x1200 but the matrices occupy a band near the top, with a
    // control panel to their left. Needs a wide viewport or they wrap.
    viewport: { width: 1800, height: 1400 },
    clip: { x: 300, y: 70, width: 1115, height: 365 },
    fit: 'contain',
  },
  '3dflu-cent-university-of-warsaw': {
    selector: '#serograph svg',
    fit: 'contain',
  },
  'ritu-blah-blau-global-game-jam': {
    selector: '.field--name-field-game-screenshot img',
  },
  tagoverflow: {
    // The force layout settles somewhere different on every run, so measure the
    // graph group's rendered extent rather than guessing a fixed box.
    selector: 'g.graph',
    // The settings panel floats over the top-left of the graph area.
    prepare: `
      (() => {
        const panel = document.querySelector('#hideable');
        const box = panel && (panel.parentElement || panel);
        if (box) box.style.visibility = 'hidden';
      })()
    `,
    prepareWait: 500,
    pad: 24,
    fit: 'contain',
    wait: 6000,
  },
  "fellows-and-alumni-of-the-polish-children-s-fund": {
    selector: 'svg',
    fit: 'contain',
  },
  'qubism-in-qutip': {
    // The qubism plots are the square outputs; the notebook's biggest image is
    // a drab scatter grid, so pick by shape rather than size or position.
    pickRect: `
      (() => {
        const square = Array.from(document.querySelectorAll('img'))
          .map((el) => el.getBoundingClientRect())
          .filter((r) => r.width > 300 && Math.abs(r.width - r.height) / r.width < 0.15);
        const r = square[square.length - 1];
        return r && {x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height};
      })()
    `,
    fit: 'contain',
  },
  'thinking-in-tensors-writing-in-pytorch': {
    // The notebooks save no plot outputs, and the largest image on the page is
    // an embedded joke. Use the maths itself: the derivative worked through in
    // the gradient-descent notebook.
    url: 'https://nbviewer.org/github/stared/thinking-in-tensors-writing-in-pytorch/blob/master/2%20Gradient%20Descent.ipynb',
    clip: { x: 190, y: 900, width: 1090, height: 681 },
  },
  offtopicarium: {
    // A wide banner: crop-filling slices the lettering off both edges.
    selector: '#page-content img.image',
    fit: 'contain',
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
    fit: 'contain',
    wait: 8000,
    // The chart is drawn from a fetched dataset, so give it room.
    prepareWait: 8000,
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
