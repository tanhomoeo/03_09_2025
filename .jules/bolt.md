# Bolt's Journal

## 2025-05-24 - [Recreating Objects in Render Loop]
**Learning:** Defining constant maps or objects inside helper functions that are called frequently (like inside `map` or render loops) causes unnecessary garbage collection and object allocation.
**Action:** Move static configuration objects, lookup maps, and icon dictionaries outside of the component or function scope to module scope.

## 2025-05-24 - [FlatMap in Render Loop]
**Learning:** Using `flatMap` followed by `find` inside a `map` loop in the render function causes (N \cdot M)$ complexity and excessive array allocation.
**Action:** Replace with a `Map` lookup memoized with `useMemo` to reduce complexity to (1)$ per item in render.
