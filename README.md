# Kyle Tran — Design Portfolio

Personal design portfolio built with **Astro 5**, **React islands**, and **TypeScript**. Rebuilt from a Framer static export into a clean, maintainable architecture.

Live site (original): [kyletran.framer.website](https://kyletran.framer.website/)

---

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | [Astro 5](https://astro.build/) |
| UI Islands | React 18 (`@astrojs/react`) |
| Language | TypeScript (strict) |
| Styles | CSS Modules / scoped `<style>` blocks |
| Design tokens | CSS custom properties (`src/styles/tokens.css`) |
| Deployment | Vercel / Netlify / GitHub Pages (static output) |

---

## Project Structure

```
kyle-tran-design/
├── public/
│   ├── fonts/               ← Local woff2 files (Mikado, Bungee Shade)
│   └── images/              ← All portfolio cover images and assets
├── src/
│   ├── components/
│   │   ├── Nav.astro        ← Site navigation bar
│   │   ├── Footer.astro     ← Site footer
│   │   └── WorkCard.astro   ← Homepage work-grid card
│   ├── data/
│   │   └── work.ts          ← Case-study metadata array (source of truth)
│   ├── layouts/
│   │   └── BaseLayout.astro ← Shared HTML shell, <head>, Nav + Footer
│   ├── pages/
│   │   ├── index.astro      ← Homepage
│   │   └── work/
│   │       └── [slug].astro ← Dynamic case-study route
│   └── styles/
│       ├── tokens.css       ← All --token-* CSS custom properties
│       └── global.css       ← Reset, @font-face, base body styles
├── _framer-export/          ← Reference copy of original Framer site (see note below)
├── astro.config.mjs
├── package.json
├── tsconfig.json
└── vercel.json
```

---

## Dev Commands

```bash
# Start local dev server at localhost:4321
npm run dev

# Production build → outputs to dist/
npm run build

# Preview the production build locally
npm run preview
```

---

## Adding a New Case Study

All case-study data lives in [`src/data/work.ts`](src/data/work.ts). Add a new entry to the `workItems` array:

```ts
{
  slug: 'my-project',           // URL: /work/my-project
  title: 'My Project',
  description: 'One-line description shown on the work card',
  tags: ['UX Design', 'Web'],
  coverImage: '/images/my-cover.avif',
  coverImageAlt: 'Alt text for the cover image',
  year: '2025',
  readTime: '10 mins read',
  index: 6,                     // Display order on the homepage grid
  role: 'Lead UX Designer',
  client: 'Client Name',        // optional
  duration: '3 months',         // optional
  sections: [
    {
      heading: 'Section Heading',
      body: 'Section body copy.',
    },
  ],
}
```

Place the cover image in `public/images/` and the page will be generated automatically at `/work/my-project`.

---

## Deployment

The site builds to `dist/` as fully static HTML. It can be deployed to:

- **Vercel** — `vercel.json` is pre-configured at the repo root
- **Netlify** — drag-and-drop `dist/` or connect the repo (set build command `npm run build`, publish dir `dist`)
- **GitHub Pages** — push `dist/` to the `gh-pages` branch

---

## Note on `_framer-export/`

`_framer-export/` is a preserved reference copy of the original Framer-generated static site. It is **not served** by the Astro dev server and is not included in the production build.

Once you have visually verified the rebuilt site matches the original, you can safely delete this directory:

```bash
rm -rf _framer-export/
```
