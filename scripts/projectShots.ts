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
  /** Which frame of an animation to use: an index, or first/last. Defaults to the last. */
  frame?: 'first' | 'last' | number;
  /** Crop applied to a downloaded image, in source pixels. */
  imageCrop?: { x: number; y: number; width: number; height: number };
  /** Set false to keep surrounding whitespace instead of trimming to content. */
  trim?: boolean;
  /** Letterbox colour, for artefacts that are not on white. */
  background?: string;
  /** Inset around letterboxed art, in output pixels. */
  margin?: number;
  /** Multiply pixel brightness in post — for pages that render too dim. */
  postBrightness?: number;
  /** JS expression returning {x,y,width,height} — for regions no selector fits. */
  pickRect?: string;
  /** No sensible image exists; render a blank tile. */
  skip?: boolean;
}

export const SHOTS: Record<string, Shot> = {
  'genetic-distance-map': {
    // The map is empty until a population is picked; the site's own OG image
    // is the rendered view for "Polish" on the regional scale.
    image: 'https://p.migdal.pl/genetic-distance-map/og.png',
    // Crop to a 16:10 region that keeps Poland centred and leaves out the
    // legend, which a cover-crop would otherwise cut mid-word.
    imageCrop: { x: 0, y: 30, width: 880, height: 550 },
  },
  'pie-roots': {
    // The *weyd- occult-side poster (wizard, clairvoyant, Providence,
    // Ayurveda) — the same artefact as the r/etymology thread.
    url: 'https://p.migdal.pl/pie-roots/weyd-magic/',
    selector: 'figure',
    fit: 'contain',
    background: '#0b0d13',
    wait: 6000,
  },

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
    // Actual gameplay: a photon puzzle mid-solve, from the repo's own
    // social-media screenshot. Letterboxed in the board's background purple.
    image:
      'https://raw.githubusercontent.com/Quantum-Game/quantum-game-2/master/public/img/qg2_social_media_screenshot.png',
    fit: 'contain',
    background: '#260637',
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
    // The frame where the point is visible: blurred trypophobia posts sitting
    // between untouched ones. Early frames show loading spinners, late ones an
    // unblurred stretch of feed.
    image: 'https://raw.githubusercontent.com/cytadela8/trypophobia/master/resources/poc.gif',
    frame: 130,
    // The frame catches the feed mid-scroll; cut the sliced row at its top.
    imageCrop: { x: 0, y: 46, width: 498, height: 242 },
    fit: 'contain',
  },

  // --- Live pages, clipped to the artefact -------------------------------
  'the-tree-of-tree': {
    selector: '.tree-wrap',
  },
  '15-years-of-starcraft-ii-balance-changes-visualized': {
    // Title plus the top of the patch grid — the grid alone reads as a sparse
    // black field at thumbnail size.
    clip: { x: 20, y: 14, width: 1400, height: 861 },
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
    // The generated chart itself, not the whole gallery card around it.
    selector: '.gallery-card img',
    prepare: `document.querySelectorAll('.nav-button').forEach((el) => el.remove())`,
    prepareWait: 500,
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
    // The grid of actual entry cards, not the decorative brain illustration.
    clip: { x: 16, y: 735, width: 1408, height: 766 },
    fit: 'contain',
    wait: 8000,
  },
  'map-of-polish-composers': {
    // The terms-and-groups map: named clusters are legible where the main
    // timeline's individual composers are not. Slow to draw its constellation.
    url: 'https://mapofcomposers.pl/en/terminy',
    clip: { x: 0, y: 130, width: 1440, height: 700 },
    // The site renders its constellation intentionally faint (and a CSS
    // brightness filter on the container is dimmed right back by an overlay),
    // so lift the levels in post instead.
    prepare: `document.querySelectorAll('.c-onboard__screen, .c-onboard').forEach((el) => el.remove())`,
    prepareWait: 4000,
    postBrightness: 4,
    background: '#000000',
    wait: 12000,
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
    // The product page is a text banner with no product imagery. This is the
    // Studio UI itself, from my Medium review of it (via the Wayback Machine,
    // since Medium sits behind Cloudflare).
    image: 'https://miro.medium.com/v2/resize:fit:1400/1*XdpIcruQzlHVVN0jK5dH2w.png',
    fit: 'contain',
    background: '#2e2e2e',
  },

  'ai-development-policy-for-poland': {
    // Title block of the policy document's cover page (the live gov.pl page
    // was replaced; both link and PDF come from the Wayback Machine).
    image:
      'https://web.archive.org/web/20230606055615/https://www.gov.pl/attachment/94aaea00-b9cb-4371-b52b-8790ec089dc0',
    imageCrop: { x: 0, y: 30, width: 1131, height: 790 },
    fit: 'contain',
  },
  'science-based-games': {
    // The top of the README — the list is the project.
    pad: 20,
    pickRect: `
      (() => {
        const el = document.querySelector('article');
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: Math.min(r.height, 620) };
      })()
    `,
  },
};
