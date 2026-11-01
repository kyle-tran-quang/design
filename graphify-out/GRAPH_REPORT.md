# Graph Report - design  (2026-11-01)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1488 nodes · 6751 edges · 66 communities (55 shown, 11 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 788 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `028a1278`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Framer Motion Animation Engine
- React DOM Hydration & Framework
- Framer Motion Animation Engine
- Framer Motion Animation Engine
- Framer Motion Animation Engine
- Framer Motion Animation Engine
- Framer Core Runtime & Layouts
- React DOM Hydration & Framework
- Framer Motion Animation Engine
- Framer Motion Animation Engine
- Framer Motion Animation Engine
- Framer Motion Animation Engine
- Framer Core Runtime & Layouts
- Framer Motion Animation Engine
- Static Bundle Chunk & Utilities
- Framer Core Runtime & Layouts
- Framer Core Runtime & Layouts
- Framer Motion Animation Engine
- Framer Motion Animation Engine
- Framer Motion Animation Engine
- Framer Motion Animation Engine
- Framer Core Runtime & Layouts
- Framer Motion Animation Engine
- React DOM Hydration & Framework
- Framer Core Runtime & Layouts
- Framer Motion Animation Engine
- Framer Core Runtime & Layouts
- Framer Core Runtime & Layouts
- Framer Core Runtime & Layouts
- Framer Core Runtime & Layouts
- Module init
- Module init-2773a6bb
- React DOM Hydration & Framework
- React DOM Hydration & Framework
- Framer Core Runtime & Layouts
- Framer Core Runtime & Layouts
- Module GlpsKX1JVVIZBvKPHz9I
- Module GlpsKX1JVVIZBvKPHz9I
- React DOM Hydration & Framework
- Framer Core Runtime & Layouts
- Framer Core Runtime & Layouts
- Framer Motion Animation Engine
- Framer Motion Animation Engine
- Framer Core Runtime & Layouts
- Framer Core Runtime & Layouts
- React DOM Hydration & Framework
- Framer Core Runtime & Layouts
- React DOM Hydration & Framework
- Framer Core Runtime & Layouts
- Framer Core Runtime & Layouts
- Portfolio Architecture & Horizontal Scroll
- Framer Core Runtime & Layouts
- Framer Core Runtime & Layouts
- Framer Core Runtime & Layouts
- Framer Motion Animation Engine
- Framer Motion Animation Engine
- Framer Motion Animation Engine
- Framer Core Runtime & Layouts
- React DOM Hydration & Framework
- Static Bundle Chunk & Utilities
- Static Bundle Chunk & Utilities
- Module editorbar
- Framer Motion Animation Engine
- Framer Motion Animation Engine

## God Nodes (most connected - your core abstractions)
1. `o()` - 144 edges
2. `Gt()` - 139 edges
3. `Op()` - 114 edges
4. `L()` - 108 edges
5. `Ir()` - 100 edges
6. `w()` - 96 edges
7. `un()` - 93 edges
8. `c()` - 91 edges
9. `dp()` - 86 edges
10. `r()` - 84 edges

## Surprising Connections (you probably didn't know these)
- `o()` --indirect_call--> `r()`  [INFERRED]
  output/kyletran/assets/js/framer-core.js → output/kyletran/assets/js/react-runtime.js
- `e()` --indirect_call--> `r()`  [INFERRED]
  output/kyletran/assets/js/framer-core.js → output/kyletran/assets/js/react-runtime.js
- `H()` --indirect_call--> `J()`  [INFERRED]
  output/kyletran/assets/js/comp-text-presets.js → output/kyletran/assets/js/chunk-editor-bar.js
- `es()` --indirect_call--> `J()`  [INFERRED]
  output/kyletran/assets/js/react-runtime.js → output/kyletran/assets/js/chunk-editor-bar.js
- `U()` --indirect_call--> `J()`  [INFERRED]
  output/kyletran/assets/js/script-main.js → output/kyletran/assets/js/chunk-editor-bar.js

## Import Cycles
- None detected.

## Communities (66 total, 11 thin omitted)

### Community 0 - "Framer Motion Animation Engine"
Cohesion: 0.06
Nodes (204): J(), o(), o(), u(), o(), de(), fe(), K() (+196 more)

### Community 1 - "React DOM Hydration & Framework"
Cohesion: 0.04
Nodes (58): ai(), an(), ar(), ba(), bi(), bn(), bo(), i() (+50 more)

### Community 2 - "Framer Motion Animation Engine"
Cohesion: 0.10
Nodes (74): Rt(), A(), b(), C(), D(), E(), ee(), F() (+66 more)

### Community 3 - "Framer Motion Animation Engine"
Cohesion: 0.07
Nodes (54): zn(), An(), ao(), bi(), bn(), cc(), ci(), Cn() (+46 more)

### Community 4 - "Framer Motion Animation Engine"
Cohesion: 0.07
Nodes (43): Ae(), at(), e(), bn(), Bt(), Cn(), constructor(), D() (+35 more)

### Community 5 - "Framer Motion Animation Engine"
Cohesion: 0.08
Nodes (47): ae(), B(), C(), D(), E(), F(), H(), ie() (+39 more)

### Community 6 - "Framer Core Runtime & Layouts"
Cohesion: 0.05
Nodes (50): ac(), ao(), ar(), bs(), cc(), co(), dh(), dl() (+42 more)

### Community 7 - "React DOM Hydration & Framework"
Cohesion: 0.07
Nodes (33): a(), c(), d(), i(), u(), w(), b(), be() (+25 more)

### Community 8 - "Framer Motion Animation Engine"
Cohesion: 0.05
Nodes (18): as(), cn(), da(), dr(), fa(), fg(), jc(), ks() (+10 more)

### Community 9 - "Framer Motion Animation Engine"
Cohesion: 0.08
Nodes (40): ad(), ai(), bi(), cd(), ci(), _d(), a(), dd() (+32 more)

### Community 10 - "Framer Motion Animation Engine"
Cohesion: 0.07
Nodes (39): bd(), br(), ch(), di(), en(), gc(), gf(), gi() (+31 more)

### Community 11 - "Framer Motion Animation Engine"
Cohesion: 0.10
Nodes (35): bo(), ca(), co(), cs(), Do(), eo(), fa(), fo() (+27 more)

### Community 12 - "Framer Core Runtime & Layouts"
Cohesion: 0.14
Nodes (19): c(), o(), v(), o(), r(), o(), r(), o() (+11 more)

### Community 13 - "Framer Motion Animation Engine"
Cohesion: 0.07
Nodes (31): runs-on, steps, concurrency, cancel-in-progress, group, environment, needs, runs-on (+23 more)

### Community 14 - "Static Bundle Chunk & Utilities"
Cohesion: 0.10
Nodes (27): bm(), cm(), cs(), fr(), gs(), hs(), jm(), lr() (+19 more)

### Community 15 - "Framer Core Runtime & Layouts"
Cohesion: 0.11
Nodes (23): _f(), c(), d(), e(), f(), i(), o(), kr() (+15 more)

### Community 16 - "Framer Core Runtime & Layouts"
Cohesion: 0.18
Nodes (27): eh(), ih(), ll(), th(), wl(), ke(), re(), ze() (+19 more)

### Community 17 - "Framer Motion Animation Engine"
Cohesion: 0.09
Nodes (26): allowScripts, esbuild, dependencies, astro@^7.3.5, @astrojs/react@^7.0.0, react@^19.3.0, react-dom@^19.3.0, devDependencies (+18 more)

### Community 18 - "Framer Motion Animation Engine"
Cohesion: 0.09
Nodes (26): bu(), cr(), cu(), du(), fu(), Ge(), gm(), s() (+18 more)

### Community 19 - "Framer Motion Animation Engine"
Cohesion: 0.10
Nodes (24): an(), bn(), el(), gl(), hl(), il(), jl(), ml() (+16 more)

### Community 20 - "Framer Motion Animation Engine"
Cohesion: 0.29
Nodes (24): hn(), A(), b(), C(), D(), E(), F(), g() (+16 more)

### Community 21 - "Framer Core Runtime & Layouts"
Cohesion: 0.12
Nodes (22): af(), er(), fi(), gr(), hi(), hr(), kd(), md() (+14 more)

### Community 22 - "Framer Motion Animation Engine"
Cohesion: 0.13
Nodes (21): ap(), bp(), ep(), es(), fp(), gp(), ip(), jp() (+13 more)

### Community 23 - "React DOM Hydration & Framework"
Cohesion: 0.16
Nodes (21): cf(), df(), ff(), jf(), mf(), pf(), sf(), vf() (+13 more)

### Community 24 - "Framer Core Runtime & Layouts"
Cohesion: 0.15
Nodes (19): jn(), ai(), ar(), dr(), ea(), ec(), er(), ji() (+11 more)

### Community 25 - "Framer Motion Animation Engine"
Cohesion: 0.14
Nodes (19): pu(), rf(), ds(), fs(), Gn(), Hn(), js(), la() (+11 more)

### Community 26 - "Framer Core Runtime & Layouts"
Cohesion: 0.18
Nodes (19): da(), fa(), gt(), ia(), In(), c(), ln(), oa() (+11 more)

### Community 27 - "Framer Core Runtime & Layouts"
Cohesion: 0.18
Nodes (17): fd(), a(), l(), co(), fn(), fo(), ha(), ho() (+9 more)

### Community 28 - "Framer Core Runtime & Layouts"
Cohesion: 0.24
Nodes (17): aa(), ac(), as(), bs(), gs(), ic(), kc(), ks() (+9 more)

### Community 29 - "Framer Core Runtime & Layouts"
Cohesion: 0.14
Nodes (16): bo(), fo(), go(), ho(), mo(), _o(), oo(), po() (+8 more)

### Community 30 - "Module init"
Cohesion: 0.17
Nodes (14): au(), iu(), br(), fr(), gr(), hr(), ir(), mr() (+6 more)

### Community 31 - "Module init-2773a6bb"
Cohesion: 0.18
Nodes (15): ao(), eo(), fi(), ie(), ii(), io(), jo(), ko() (+7 more)

### Community 32 - "React DOM Hydration & Framework"
Cohesion: 0.16
Nodes (15): br(), ce(), ct(), dp(), ea(), kt(), la(), mt() (+7 more)

### Community 33 - "React DOM Hydration & Framework"
Cohesion: 0.21
Nodes (15): da(), dc(), es(), fc(), gc(), ia(), is(), ms() (+7 more)

### Community 34 - "Framer Core Runtime & Layouts"
Cohesion: 0.18
Nodes (12): aa(), ca(), ed(), eo(), ia(), ka(), la(), oa() (+4 more)

### Community 35 - "Framer Core Runtime & Layouts"
Cohesion: 0.18
Nodes (11): am(), dm(), fm(), hm(), km(), lm(), mm(), om() (+3 more)

### Community 36 - "Module GlpsKX1JVVIZBvKPHz9I"
Cohesion: 0.22
Nodes (11): cr(), ma(), na(), or(), ra(), sr(), o(), ui() (+3 more)

### Community 37 - "Module GlpsKX1JVVIZBvKPHz9I"
Cohesion: 0.27
Nodes (10): bc(), _c(), hc(), jo(), mc(), pc(), vc(), wc() (+2 more)

### Community 38 - "React DOM Hydration & Framework"
Cohesion: 0.25
Nodes (8): True Horizontal Scroll Architecture, About Me Profile Section, Cases / Projects Showcase Section, Contact & Footer Section, Hero Section & Tagline, Interactive Physics Wavy Line Canvas, Playground UI Experiments Section, Spinning Disc Rig (SVG Animation)

### Community 39 - "Framer Core Runtime & Layouts"
Cohesion: 0.32
Nodes (3): E(), h(), i()

### Community 40 - "Framer Core Runtime & Layouts"
Cohesion: 0.29
Nodes (8): bh(), e(), fh(), gh(), vh(), xh(), yh(), zh()

### Community 41 - "Framer Motion Animation Engine"
Cohesion: 0.25
Nodes (8): ls(), at(), D(), ir(), it(), ot(), rr(), ur()

### Community 42 - "Framer Motion Animation Engine"
Cohesion: 0.25
Nodes (8): aa(), ca(), dn(), ja(), sa(), tn(), wn(), xa()

### Community 43 - "Framer Core Runtime & Layouts"
Cohesion: 0.54
Nodes (8): bt(), Et(), kt(), St(), Tt(), vn(), wt(), xt()

### Community 44 - "Framer Core Runtime & Layouts"
Cohesion: 0.25
Nodes (7): description, name, private, scripts, preview, start, version

### Community 45 - "React DOM Hydration & Framework"
Cohesion: 0.29
Nodes (7): ag(), cg(), ig(), lg(), og(), rg(), sg()

### Community 46 - "Framer Core Runtime & Layouts"
Cohesion: 0.29
Nodes (7): hh(), jh(), kh(), mh(), oh(), qh(), va()

### Community 47 - "React DOM Hydration & Framework"
Cohesion: 0.33
Nodes (6): ba(), ea(), id(), na(), nd(), ta()

### Community 48 - "Framer Core Runtime & Layouts"
Cohesion: 0.33
Nodes (6): fn(), gn(), hn(), pn(), u(), vn()

### Community 49 - "Framer Core Runtime & Layouts"
Cohesion: 0.40
Nodes (4): astro/tsconfigs/strict, exclude, extends, include

### Community 50 - "Portfolio Architecture & Horizontal Scroll"
Cohesion: 0.50
Nodes (3): bootstrap, hostInfo, projectMatch

### Community 51 - "Framer Core Runtime & Layouts"
Cohesion: 0.50
Nodes (4): Kt(), qt(), Ut(), Yt()

### Community 52 - "Framer Core Runtime & Layouts"
Cohesion: 0.50
Nodes (3): buildCommand, framework, outputDirectory

### Community 54 - "Framer Motion Animation Engine"
Cohesion: 0.67
Nodes (3): bf(), xf(), zf()

### Community 55 - "Framer Motion Animation Engine"
Cohesion: 0.67
Nodes (3): nc(), rc(), tc()

## Knowledge Gaps
- **12 isolated node(s):** `astro/tsconfigs/strict`, `Design Tokens & Color System`, `Responsive Breakpoint Matrix`, `Typography System`, `Designed by Kyle Portfolio Overview` (+7 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 145 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `U()` connect `Framer Core Runtime & Layouts` to `Framer Motion Animation Engine`, `React DOM Hydration & Framework`, `Framer Core Runtime & Layouts`, `Framer Core Runtime & Layouts`, `Framer Core Runtime & Layouts`, `Framer Core Runtime & Layouts`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Are the 9 inferred relationships involving `o()` (e.g. with `c()` and `oa()`) actually correct?**
  _`o()` has 9 INFERRED edges - model-reasoned connections that need verification._
- **What connects `astro/tsconfigs/strict`, `Design Tokens & Color System`, `Responsive Breakpoint Matrix` to the rest of the system?**
  _12 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Framer Motion Animation Engine` be split into smaller, more focused modules?**
  _Cohesion score 0.055355369555965386 - nodes in this community are weakly interconnected._
- **Why does `c()` connect `Framer Motion Animation Engine` to `Framer Motion Animation Engine`, `React DOM Hydration & Framework`, `React DOM Hydration & Framework`, `Framer Motion Animation Engine`, `Framer Motion Animation Engine`, `Framer Motion Animation Engine`, `Framer Motion Animation Engine`, `Framer Core Runtime & Layouts`, `Framer Motion Animation Engine`, `Framer Motion Animation Engine`, `Framer Core Runtime & Layouts`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Are the 10 inferred relationships involving `Gt()` (e.g. with `Do()` and `io()`) actually correct?**
  _`Gt()` has 10 INFERRED edges - model-reasoned connections that need verification._
- **Should `React DOM Hydration & Framework` be split into smaller, more focused modules?**
  _Cohesion score 0.038623823433950016 - nodes in this community are weakly interconnected._