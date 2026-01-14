# Bolt's Journal

## 2025-05-24 - [Recreating Objects in Render Loop]
**Learning:** Defining constant maps or objects inside helper functions that are called frequently (like inside `map` or render loops) causes unnecessary garbage collection and object allocation.
**Action:** Move static configuration objects, lookup maps, and icon dictionaries outside of the component or function scope to module scope.

## 2025-05-24 - [N-Squared Operations in Render]
**Learning:** Using `flatMap` combined with `find` inside a `.map` loop (e.g., rendering selected items by looking them up in a filtered list) creates an O(N*M) complexity bottleneck that scales poorly.
**Action:** Pre-compute a lookup `Map` (O(1) access) for the items so that rendering selected items becomes O(M).
