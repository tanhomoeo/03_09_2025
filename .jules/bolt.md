## 2024-05-22 - Optimizing Recursive Tree Rendering
**Learning:** Rendering a `Dialog` inside every item of a large list (like a repertory rubric with 50+ remedies) creates massive DOM overhead and memory usage. Even if the dialog is closed, the React component instances and event listeners are created.
**Action:** Lift the Dialog state to the parent component. Use a single `Dialog` instance and update its content based on the selected item ID.

**Learning:** Recursive components defined as `const` cannot reference themselves if wrapped in `React.memo` directly due to TDZ (Temporal Dead Zone).
**Action:** Use a named function declaration for the inner component (which is hoisted) and wrap it with `React.memo` as a separate `const`. This allows the inner function to reference the memoized version of itself.
