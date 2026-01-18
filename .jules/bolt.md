# Bolt's Journal

## 2025-05-24 - [Recreating Objects in Render Loop]
**Learning:** Defining constant maps or objects inside helper functions that are called frequently (like inside `map` or render loops) causes unnecessary garbage collection and object allocation.
**Action:** Move static configuration objects, lookup maps, and icon dictionaries outside of the component or function scope to module scope.

## 2025-05-24 - [Optimizing Chained Array Methods]
**Learning:** Chaining `.map().filter().map().sort()` creates multiple intermediate arrays, iterating over the data multiple times. This is O(N*M) in memory and CPU.
**Action:** Replace chained array methods with a single-pass `reduce` or imperative loop that handles filtering, transformation, and accumulation in one go.
