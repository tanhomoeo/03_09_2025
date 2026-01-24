# Bolt's Journal

## 2025-05-24 - [Recreating Objects in Render Loop]
**Learning:** Defining constant maps or objects inside helper functions that are called frequently (like inside `map` or render loops) causes unnecessary garbage collection and object allocation.
**Action:** Move static configuration objects, lookup maps, and icon dictionaries outside of the component or function scope to module scope.

## 2025-05-24 - [Avoid flatMap in Render Loop]
**Learning:** Using `flatMap` followed by `find` inside a `map` loop (O(N*M)) for looking up items in a large dataset is a severe performance bottleneck.
**Action:** Create a `Map` (O(1) lookup) of the dataset using `useMemo` and use it for lookups in the render loop.
