# Bolt's Journal

## 2025-05-24 - [Recreating Objects in Render Loop]
**Learning:** Defining constant maps or objects inside helper functions that are called frequently (like inside `map` or render loops) causes unnecessary garbage collection and object allocation.
**Action:** Move static configuration objects, lookup maps, and icon dictionaries outside of the component or function scope to module scope.

## 2025-05-24 - [Expensive Array Operations in Render]
**Learning:** Using `flatMap` followed by `find` inside a render loop (e.g., inside `.map`) creates O(N*M) complexity and excessive garbage collection.
**Action:** Pre-calculate lookups using `Map` in `useMemo` to allow O(1) access during render.
