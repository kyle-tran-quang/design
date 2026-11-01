# Graph Report - kyletran.framer.website  (2026-11-01)

## Corpus Check
- 49 files · ~265,010 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 37 file(s) not represented in the graph (top: .woff2 20, .avif 10, .css 4)

## Summary
- 1439 nodes · 6702 edges · 66 communities (59 shown, 7 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 788 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d781128c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- page-work-mas-pricing.js
- c
- o
- react-runtime.js
- framer-motion.js
- script-main.js
- framer-events.js
- editor-init.js
- Op
- framer-core.js
- j
- a
- I
- wm
- Gt
- ei
- r
- Agent Instructions & Architecture Guide: Designed by Kyle (`kyletran.framer.website`)
- pn
- m
- dp
- ip
- kd
- w
- fs
- ih
- la
- rl
- so
- Ve
- gn
- zu
- ut
- ra
- ts
- Dn
- vr
- qt
- chunk-editor-bar.js
- bh
- uf
- e
- package.json
- ag
- pc
- hf
- c
- Static Website Clone
- yf
- to
- dh
- os
- go
- bootstrap.js
- co
- ml
- sa
- chunk-editor-services.js
- fu
- rc
- qc
- sl
- ys
- icon-arrow-right.js
- im

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
  output/kyletran.framer.website/assets/js/framer-core.js → output/kyletran.framer.website/assets/js/react-runtime.js
- `H()` --indirect_call--> `J()`  [INFERRED]
  output/kyletran.framer.website/assets/js/comp-text-presets.js → output/kyletran.framer.website/assets/js/chunk-editor-bar.js
- `es()` --indirect_call--> `J()`  [INFERRED]
  output/kyletran.framer.website/assets/js/react-runtime.js → output/kyletran.framer.website/assets/js/chunk-editor-bar.js
- `U()` --indirect_call--> `J()`  [INFERRED]
  output/kyletran.framer.website/assets/js/script-main.js → output/kyletran.framer.website/assets/js/chunk-editor-bar.js
- `c()` --calls--> `ic()`  [EXTRACTED]
  output/kyletran.framer.website/assets/js/chunk-framer-elements.js → output/kyletran.framer.website/assets/js/framer-core.js

## Import Cycles
- None detected.

## Communities (66 total, 7 thin omitted)

### Community 0 - "page-work-mas-pricing.js"
Cohesion: 0.07
Nodes (164): J(), o(), o(), u(), o(), de(), fe(), K() (+156 more)

### Community 1 - "c"
Cohesion: 0.10
Nodes (74): Rt(), A(), b(), C(), D(), E(), ee(), F() (+66 more)

### Community 2 - "o"
Cohesion: 0.06
Nodes (70): af(), di(), jr(), kf(), o(), r(), s(), ki() (+62 more)

### Community 3 - "react-runtime.js"
Cohesion: 0.07
Nodes (59): ai(), ar(), bi(), bn(), bt(), cc(), ci(), Cn() (+51 more)

### Community 4 - "framer-motion.js"
Cohesion: 0.05
Nodes (44): ai(), an(), ar(), bi(), bn(), bt(), cn(), dr() (+36 more)

### Community 5 - "script-main.js"
Cohesion: 0.08
Nodes (33): c(), o(), v(), Bt(), fd(), a(), l(), f() (+25 more)

### Community 6 - "framer-events.js"
Cohesion: 0.07
Nodes (45): Ae(), at(), e(), bn(), Bt(), Cn(), constructor(), D() (+37 more)

### Community 7 - "editor-init.js"
Cohesion: 0.07
Nodes (33): a(), c(), d(), i(), u(), w(), b(), be() (+25 more)

### Community 8 - "Op"
Cohesion: 0.09
Nodes (44): cf(), hi(), of(), rf(), un(), ia(), bo(), ca() (+36 more)

### Community 9 - "framer-core.js"
Cohesion: 0.06
Nodes (15): as(), dp(), fg(), ks(), nf(), nm(), no(), qe() (+7 more)

### Community 10 - "j"
Cohesion: 0.12
Nodes (35): ae(), B(), C(), D(), E(), F(), H(), ie() (+27 more)

### Community 11 - "a"
Cohesion: 0.11
Nodes (36): de(), fi(), gt(), ln(), un(), a(), aa(), ac() (+28 more)

### Community 12 - "I"
Cohesion: 0.08
Nodes (33): bd(), ch(), cu(), gc(), Ge(), gi(), gu(), He() (+25 more)

### Community 13 - "wm"
Cohesion: 0.07
Nodes (29): am(), bm(), bu(), cm(), dm(), fm(), gm(), gs() (+21 more)

### Community 14 - "Gt"
Cohesion: 0.07
Nodes (29): ah(), ar(), cc(), Do(), fs(), ga(), Gt(), ha() (+21 more)

### Community 15 - "ei"
Cohesion: 0.11
Nodes (28): ai(), ci(), dd(), ed(), ef(), ei(), eu(), gd() (+20 more)

### Community 16 - "r"
Cohesion: 0.14
Nodes (26): a(), du(), s(), jf(), mu(), qa(), ru(), wc() (+18 more)

### Community 17 - "Agent Instructions & Architecture Guide: Designed by Kyle (`kyletran.framer.website`)"
Cohesion: 0.08
Nodes (23): 10.1. Graph Artifacts, 10.2. Continuous Sync Rule (Mandatory for Agents), 10.3. Querying & Exploring the Architecture, 10. Knowledge Graph & Continuous Sync (`graphify`), 1. Project Overview & Objective, 2. Sitemap & Route Map, 3. Responsive Breakpoints, 4.1. Color Tokens (`CSS Custom Properties`) (+15 more)

### Community 18 - "pn"
Cohesion: 0.29
Nodes (24): pn(), A(), b(), C(), D(), E(), F(), g() (+16 more)

### Community 19 - "m"
Cohesion: 0.21
Nodes (23): ll(), wl(), re(), bc(), Dn(), fc(), oa(), pc() (+15 more)

### Community 20 - "dp"
Cohesion: 0.11
Nodes (22): ce(), dn(), dp(), fe(), gr(), ki(), kt(), mt() (+14 more)

### Community 21 - "ip"
Cohesion: 0.13
Nodes (21): ap(), bp(), ep(), es(), fp(), gp(), ip(), jp() (+13 more)

### Community 22 - "kd"
Cohesion: 0.12
Nodes (21): br(), er(), fi(), gr(), hr(), ji(), kd(), md() (+13 more)

### Community 23 - "w"
Cohesion: 0.15
Nodes (21): df(), ff(), ba(), da(), ea(), fa(), ga(), ha() (+13 more)

### Community 24 - "fs"
Cohesion: 0.15
Nodes (18): ds(), fs(), Gn(), Hn(), In(), js(), la(), Nn() (+10 more)

### Community 25 - "ih"
Cohesion: 0.13
Nodes (16): eh(), ih(), t(), ls(), nh(), rh(), th(), at() (+8 more)

### Community 26 - "la"
Cohesion: 0.13
Nodes (16): aa(), ba(), ca(), ea(), eo(), ia(), id(), ka() (+8 more)

### Community 27 - "rl"
Cohesion: 0.17
Nodes (15): al(), an(), el(), hl(), il(), nl(), on(), pl() (+7 more)

### Community 28 - "so"
Cohesion: 0.16
Nodes (15): kl(), ao(), eo(), ie(), io(), je(), jo(), ko() (+7 more)

### Community 29 - "Ve"
Cohesion: 0.15
Nodes (14): ac(), ao(), dl(), ec(), fl(), i(), hp(), js() (+6 more)

### Community 30 - "gn"
Cohesion: 0.15
Nodes (13): bn(), fn(), gn(), hn(), jn(), mn(), s(), pn() (+5 more)

### Community 31 - "zu"
Cohesion: 0.20
Nodes (12): ad(), cd(), cr(), fr(), jd(), lr(), od(), pr() (+4 more)

### Community 32 - "ut"
Cohesion: 0.18
Nodes (11): bo(), i(), Do(), dt(), E(), lt(), st(), ut() (+3 more)

### Community 33 - "ra"
Cohesion: 0.22
Nodes (11): cr(), ma(), na(), or(), ra(), sr(), o(), ui() (+3 more)

### Community 34 - "ts"
Cohesion: 0.29
Nodes (11): dc(), es(), hs(), ia(), is(), ms(), ns(), ra() (+3 more)

### Community 35 - "Dn"
Cohesion: 0.27
Nodes (10): Dn(), An(), ao(), io(), kn(), Ln(), On(), oo() (+2 more)

### Community 36 - "vr"
Cohesion: 0.28
Nodes (8): au(), iu(), br(), fr(), vr(), yr(), zr(), t()

### Community 37 - "qt"
Cohesion: 0.25
Nodes (9): Ht(), Jt(), Kt(), qt(), Ut(), Wt(), Xt(), Yt() (+1 more)

### Community 38 - "chunk-editor-bar.js"
Cohesion: 0.32
Nodes (3): E(), h(), i()

### Community 39 - "bh"
Cohesion: 0.29
Nodes (8): bh(), e(), fh(), gh(), vh(), xh(), yh(), zh()

### Community 40 - "uf"
Cohesion: 0.25
Nodes (8): bi(), _d(), qs(), uf(), o(), vd(), xi(), ym()

### Community 41 - "e"
Cohesion: 0.29
Nodes (8): da(), fa(), c(), d(), e(), i(), o(), pa()

### Community 42 - "package.json"
Cohesion: 0.25
Nodes (7): description, name, private, scripts, preview, start, version

### Community 43 - "ag"
Cohesion: 0.29
Nodes (7): ag(), cg(), ig(), lg(), og(), rg(), sg()

### Community 44 - "pc"
Cohesion: 0.33
Nodes (7): bc(), hc(), jo(), mc(), pc(), vc(), yc()

### Community 45 - "hf"
Cohesion: 0.29
Nodes (7): en(), gf(), hf(), mf(), pf(), rn(), vi()

### Community 46 - "c"
Cohesion: 0.29
Nodes (7): da(), ea(), fa(), c(), ta(), ua(), wa()

### Community 47 - "Static Website Clone"
Cohesion: 0.29
Nodes (6): 🌐 Deployment, 📁 Exported Pages, 🚀 How to Run & Preview, Option 1: Direct File Opening, Option 2: Local Static Server, Static Website Clone

### Community 48 - "yf"
Cohesion: 0.33
Nodes (6): bf(), dr(), _f(), xf(), yf(), zf()

### Community 49 - "to"
Cohesion: 0.40
Nodes (6): bo(), _o(), to(), vo(), wo(), yo()

### Community 50 - "dh"
Cohesion: 0.40
Nodes (5): bs(), dh(), ds(), lh(), xs()

### Community 51 - "os"
Cohesion: 0.40
Nodes (5): cs(), os(), ss(), tt(), ws()

### Community 52 - "go"
Cohesion: 0.50
Nodes (5): fo(), go(), ho(), mo(), po()

### Community 53 - "bootstrap.js"
Cohesion: 0.50
Nodes (3): bootstrap, hostInfo, projectMatch

### Community 54 - "co"
Cohesion: 0.50
Nodes (4): co(), lo(), ts(), us()

### Community 55 - "ml"
Cohesion: 0.50
Nodes (4): gl(), jl(), ml(), vl()

### Community 56 - "sa"
Cohesion: 0.50
Nodes (4): aa(), ca(), ja(), sa()

### Community 58 - "fu"
Cohesion: 0.67
Nodes (3): fu(), lu(), uu()

### Community 59 - "rc"
Cohesion: 0.67
Nodes (3): nc(), rc(), tc()

## Knowledge Gaps
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `U()` connect `script-main.js` to `page-work-mas-pricing.js`, `o`, `editor-init.js`, `e`, `a`, `m`, `w`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Are the 9 inferred relationships involving `o()` (e.g. with `c()` and `oa()`) actually correct?**
  _`o()` has 9 INFERRED edges - model-reasoned connections that need verification._
- **Should `page-work-mas-pricing.js` be split into smaller, more focused modules?**
  _Cohesion score 0.06902654867256637 - nodes in this community are weakly interconnected._
- **Why does `c()` connect `c` to `page-work-mas-pricing.js`, `o`, `Dn`, `framer-motion.js`, `react-runtime.js`, `ts`, `Op`, `framer-core.js`, `a`, `pn`, `m`, `w`, `fs`, `Ve`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Are the 10 inferred relationships involving `Gt()` (e.g. with `Do()` and `io()`) actually correct?**
  _`Gt()` has 10 INFERRED edges - model-reasoned connections that need verification._
- **Should `c` be split into smaller, more focused modules?**
  _Cohesion score 0.10329507589781563 - nodes in this community are weakly interconnected._
- **Why does `Op()` connect `Op` to `page-work-mas-pricing.js`, `c`, `o`, `react-runtime.js`, `framer-motion.js`, `script-main.js`, `framer-core.js`, `j`, `a`, `wm`, `Gt`, `ei`, `r`, `pn`, `m`, `dp`, `w`, `fs`, `ih`, `so`, `Ve`, `zu`, `ra`, `ts`, `Dn`, `vr`, `uf`, `ml`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._