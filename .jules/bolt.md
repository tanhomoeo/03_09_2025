# Bolt's Journal

## 2025-05-24 - [Recreating Objects in Render Loop]
**Learning:** Defining constant maps or objects inside helper functions that are called frequently (like inside `map` or render loops) causes unnecessary garbage collection and object allocation.
**Action:** Move static configuration objects, lookup maps, and icon dictionaries outside of the component or function scope to module scope.

## 2025-05-24 - [Selected Items Lookup in Filtered Lists]
**Learning:** When rendering a list of "selected" items that are a subset of a large dataset, avoid searching for them in the *filtered* view data (O(N) search). This causes performance issues when filters change (typing search terms) and can cause selected items to disappear if they don't match the current filter.
**Action:** Create a memoized `Map` keyed by ID from the *full* dataset (not filtered) to allow O(1) lookup of selected item details. This improves rendering performance and ensures consistent UI state.

## 2025-05-24 - [Avoid flatMap in Data Aggregation]
**Learning:** Using `flatMap` followed by `forEach` to aggregate data creates unnecessary intermediate arrays, increasing memory pressure and GC overhead in large datasets.
**Action:** Use nested `forEach` loops or `reduce` to traverse and aggregate data in a single pass without intermediate allocations.
