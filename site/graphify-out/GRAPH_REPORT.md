# Graph Report - site  (2026-11-01)

## Corpus Check
- 13 files · ~433,916 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 58 nodes · 89 edges · 6 communities
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `49e8556d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- capture.mjs
- stepStates
- Section map: Designed by Kyle homepage (reference capture)
- package.json
- lookupAsset
- openPage

## God Nodes (most connected - your core abstractions)
1. `stepStates()` - 9 edges
2. `Section map: Designed by Kyle homepage (reference capture)` - 9 edges
3. `openPage()` - 8 edges
4. `settle()` - 7 edges
5. `stepShots()` - 7 edges
6. `sleep()` - 6 edges
7. `stepDump()` - 6 edges
8. `stepAppear()` - 6 edges
9. `writeJson()` - 4 edges
10. `ensure()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `openPage()` --calls--> `lookupAsset()`  [EXTRACTED]
  site/reference/capture.mjs → site/reference/capture.mjs  _Bridges community 4 → community 5_
- `stepAppear()` --calls--> `openPage()`  [EXTRACTED]
  site/reference/capture.mjs → site/reference/capture.mjs  _Bridges community 5 → community 1_

## Import Cycles
- None detected.

## Communities (6 total, 0 thin omitted)

### Community 0 - "capture.mjs"
Cohesion: 0.11
Nodes (13): args, ASSET_MAP, BPS, HERE, MIME, netlog, ONLY_BPS, ROOT (+5 more)

### Community 1 - "stepStates"
Cohesion: 0.29
Nodes (13): diffSnaps(), ensure(), imagesReady(), pad(), revealSweep(), sectionBoxes(), settle(), sleep() (+5 more)

### Community 2 - "Section map: Designed by Kyle homepage (reference capture)"
Cohesion: 0.18
Nodes (10): 1. Discrepancies with the plan (read first), 2. Desktop track (1440×900, `scrollWidth` 9878, max `scrollLeft` 8438), 3. Tablet (1024×768) and mobile (390×844), 4. Content (visible text, links, images), 5. Behavior measured, 6. Capture notes and caveats, 7. Proposed diff tolerance (for `compare.mjs`), 8. Files (+2 more)

### Community 3 - "package.json"
Cohesion: 0.22
Nodes (9): devDependencies, playwright@^1.49.0, name, private, scripts, capture, type, version (+1 more)

### Community 4 - "lookupAsset"
Cohesion: 0.67
Nodes (3): ASSET_BASE, lookupAsset(), stripQuery()

### Community 5 - "openPage"
Cohesion: 0.67
Nodes (3): initScript(), openPage(), traceInit()

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `playwright` connect `package.json` to `capture.mjs`?**
  _High betweenness centrality (0.211) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `openPage()` (e.g. with `initScript()` and `traceInit()`) actually correct?**
  _`openPage()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `capture.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._