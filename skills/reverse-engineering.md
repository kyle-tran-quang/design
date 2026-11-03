---
name: reverse-engineering
description: Reverse engineering work mode -- methodology and output standards for analyzing minified/obfuscated/closed-source code. Trigger: the user mentions reverse engineering, reverse, decompile, minified, obfuscated, or analyzing internal SDK behavior.
alwaysApply: false
metadata:
  mcpmarket-version: 1.0.0
---
# Reverse Engineering Working Rules

These rules apply when a task involves analyzing minified, obfuscated, or closed-source code.

## Trigger Conditions

- The user mentions "reverse engineering", "reverse", "decompile", "minified", or "obfuscated"
- Analyzing .min.js / .mjs files under node_modules or vendor directories
- Researching internal SDK behavior, undocumented APIs, or undocumented behavior

## Methodology

### Phase 1: Locate (Anchor)

1. Find the **immutable string constants** of the target feature (error messages, log tags, header values)
2. Use grep to work backward from the string constants to the function location
3. Record a mapping table of "anchor string -> minified function name"
4. These strings survive version upgrades, so they are the basis for tracking across versions

### Phase 2: Trace

1. Starting from the anchor function, trace the call chain (caller/callee)
2. Identify key data structures (LRU cache, Map, Queue)
3. Record the logic in pseudocode blocks; do not paste the original minified code
4. Mark: WARNING for pitfalls, ANCHOR for key locations, VERIFIED for confirmed findings

### Phase 3: Verify

1. Design A/B tests: with and without the modification, and quantify the difference
2. Collect real data (token counts, cache efficiency, response time)
3. Require at least 3 data sets before drawing a conclusion
4. Numbers must be specific; do not use adjectives

### Phase 4: Document

1. Use `/rev-doc` to produce structured documentation
2. Main report + anchor index + engineering notes, with cross-references between them
3. Every document carries a metadata header (date, version, prior research)
4. Symbol index table: minified name -> functional description

## Patch Engineering Standards

When applying a runtime patch to minified code:

1. **The find string must be unique** -- it appears only once in the target file
2. **The find string must not be a substring of the replace string** -- otherwise idempotency fails
3. **Idempotent** -- running it repeatedly does not change the result (skip already patched)
4. **Syntax validation** -- verify with `node -c` after patching
5. **Revert mechanism** -- keep a .bak and support `--revert`
6. **Anchor index** -- record each patch's find string so it can be relocated after a version upgrade

## Output Files

| Type | Location | Naming |
|------|----------|--------|
| Main report | `docs/learning/` or `docs/research/` | `{target}-reverse-engineering-v{ver}.md` |
| Anchor index | Same as above | `{target}-anchor-index-v{ver}.md` |
| Engineering notes | Same as above | `{topic}-engineering-notes.md` |
| Patch script | `scripts/` | `patch-{name}.sh` |
