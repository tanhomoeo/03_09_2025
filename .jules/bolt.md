# Bolt's Journal

## 2025-05-24 - [Recreating Objects in Render Loop]
**Learning:** Defining constant maps or objects inside helper functions that are called frequently (like inside `map` or render loops) causes unnecessary garbage collection and object allocation.
**Action:** Move static configuration objects, lookup maps, and icon dictionaries outside of the component or function scope to module scope.

## 2025-05-24 - [O(N) vs O(1) Lookup in Render Loop]
**Learning:** Repeatedly searching a large dataset (using `flatMap` + `find`) inside a render loop (e.g., for every item in a selected list) causes severe performance degradation as the dataset grows (O(S * N)).
**Action:** Pre-compute a lookup `Map` using `useMemo` so that lookups in the render loop become O(1).
