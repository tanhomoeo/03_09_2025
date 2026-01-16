# Bolt's Journal

## 2025-05-24 - [Recreating Objects in Render Loop]
**Learning:** Defining constant maps or objects inside helper functions that are called frequently (like inside `map` or render loops) causes unnecessary garbage collection and object allocation.
**Action:** Move static configuration objects, lookup maps, and icon dictionaries outside of the component or function scope to module scope.

## 2025-05-24 - [Optimizing Render Loop Lookups]
**Learning:** Using `flatMap` + `find` inside a render loop (like `.map(id => data.find(item => item.id === id))`) creates O(N*M) complexity and high garbage collection pressure.
**Action:** Always pre-calculate a `Map<ID, Item>` in a `useMemo` hook and use `map.get(id)` for O(1) lookups during rendering.

## 2025-05-24 - [Chained Array Methods vs Loops]
**Learning:** Chaining multiple `.map().filter()` operations on large datasets (like repertory symptoms) allocates multiple intermediate arrays and iterates the list multiple times.
**Action:** Refactor complex filter/sort logic into a single-pass `reduce` or `forEach` loop to minimize allocations and iterations.
