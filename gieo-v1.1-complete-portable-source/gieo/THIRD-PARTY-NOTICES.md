# Asset and license inventory

| Asset | Actual origin and treatment |
| --- | --- |
| `public/assets/serif.woff` | Noto Serif Regular, Version 2.015; original self-hosted font bytes preserved |
| `public/assets/serif-italic.woff` | Noto Serif Italic, Version 2.015; original self-hosted font bytes preserved |
| `public/assets/sans.woff` | Noto Sans Regular, Version 2.015; original self-hosted font bytes preserved |
| `public/assets/landscape.webp` | Image generated for the original GIEO build; original optimized WebP bytes preserved; not a hotlinked stock image |
| `public/assets/favicon.svg`, `src/art.js` | Original GIEO vector/procedural artwork from the implemented source; no external model/texture downloads |
| Audio | The existing app synthesizes breeze through Web Audio; no recordings or separately licensed audio files are included |

The three fonts contain the notice **Copyright 2022 The Noto Project Authors (https://github.com/notofonts/latin-greek-cyrillic)** and embedded licensing metadata identifying **SIL Open Font License 1.1**. The matching copyright and full OFL text are packaged in `licenses/Noto-OFL.txt`. Keep them with font redistributions. Source: [official SIL OFL text](https://openfontlicense.org/open-font-license-official-text/).

The landscape was generated during the original GIEO work and does not come with a separate stock-provider license. This export does not invent a stock/model license or claim rights to third-party assets that are absent. No 3D model, shader, GSAP/Three.js/Lenis package or audio recording was present to export.

No open-source license for the original application, editorial content or generated artwork was specified in the working repository. This source package is delivered to the project owner; it does not assign a new MIT/Apache license or waive rights. The private package flag prevents npm publication; GitHub repository visibility remains your choice.
