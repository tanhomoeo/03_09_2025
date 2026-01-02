# Bolt's Journal

## 2025-05-24 - [Recreating Objects in Render Loop]
**Learning:** Defining constant maps or objects inside helper functions that are called frequently (like inside `map` or render loops) causes unnecessary garbage collection and object allocation.
**Action:** Move static configuration objects, lookup maps, and icon dictionaries outside of the component or function scope to module scope.
