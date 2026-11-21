# Weekly Instagram reel

A [HyperFrames](https://hyperframes.heygen.com) project (HTML rendered to MP4) for the weekly
poznan.events reel: 1080×1920, 30 fps, about 22 s. It is a standalone project, not part of the
Next.js app, and is ignored by the app's ESLint config.

Only the code and the Geist fonts are committed. Event images are gitignored: put the week's
images in `assets/img/` before previewing or rendering.

```sh
cd reel
npm run dev      # preview and edit in the browser
npm run check    # lint the compositions
npm run render   # render to renders/*.mp4 (gitignored)
```

## Structure

| Time | Scene | File |
| --- | --- | --- |
| 0–3.1 s | Intro: date heading, circle carousel of every event poster, small "poznan.events" at the bottom; fades to white at the end | `compositions/carousel-circle-2.html` (trimmed from the registry block `carousel-circle-2`, adapted to vertical) |
| 3.1–19.4 s | One slide per event, 2.33 s each, quick fade between them | `compositions/e1.html` … `e7.html` |
| 19.4–22.4 s | Outro: "wszystkie wydarzenia na poznan.events" | `compositions/outro.html` |

`index.html` mounts the scenes and sets their start times and the total length.

## Making next week's reel

1. Put each event's image in `assets/img/` (gitignored; name them by event id, e.g. `546.jpg`).
   The compositions still reference the ids from the 20–22.11 reel they were built from.
2. In each `compositions/eN.html`, update the image `src`, the title, the venue and the time
   (`Pt 20.11 · 23:00`).
3. In `compositions/carousel-circle-2.html`, update the dates in `#cc-heading` and in the
   `dates` variable default (`20 - 22.11`), the `imageN` variable defaults, and the `cards` and
   `imageVars` lists in `DATA`, so the carousel shows the same posters.
4. A different number of events: add or remove `eN.html` files and their hosts in `index.html`
   (each slide starts 2.3333 s after the previous one), move the outro's `data-start`, set the
   root `data-duration` to the outro's end, and change the image lists in the carousel (the card count follows `cards`).
5. `npm run check`, look at it in `npm run dev`, then `npm run render`.
