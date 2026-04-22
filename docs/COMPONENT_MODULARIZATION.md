# Component Modularization Guidelines

These guidelines are designed to help maintain a balance between modularity, testability, and developer experience (DX) within our React codebase.

## 1. The "Single File" Rule
- **Guideline:** Keep new sub-components in the **same file** as their parent until they exceed approximately 60 lines of code or need to be reused elsewhere.
- **Benefit:** Reduces "file hopping" and cognitive load when reading a feature's logic.

## 2. The "3-Use" Reusability Rule
- **Guideline:** Only move a component to a shared directory (e.g., `src/components/core` or `src/components/ui`) if it is used in **3 or more** different places.
- **Exception:** UI primitives (Buttons, Inputs, Badges) should be in core from the start.

## 3. The "Pure UI" vs. "Feature Logic" Split
- **Guideline:** Break components down when they handle **independent logic or state**.
- **Example:** A complex form with its own validation logic should be its own component. A simple header with a label should stay within its parent.

## 4. Folder-Based Encapsulation
- **Guideline:** If a component is too large for one file but is **only** used by one parent:
    - Keep it in the same folder as the parent.
    - Do **not** give it its own sub-folder unless it has multiple private assets (like several CSS modules or local hooks).
- **Goal:** Flatten the file structure to make navigation intuitive.

## 5. Depth Limit (Max 3 Layers)
- **Guideline:** Aim for a maximum of **3 layers of nesting** for a single screen.
- **Ideal Hierarchy:** `Screen` → `Major Section` → `UI Element`.
- **Avoid:** `Screen` → `Layout` → `ContentWrapper` → `View` → `Card` → `CardHeader`.

## 6. Prop Drilling Threshold
- **Guideline:** If you are passing 4+ props through two or more layers just to reach a "leaf" component, consider:
    1. Merging the layers.
    2. Using **Component Composition** (passing the leaf component as a child).
    3. Using a Context provider (only for very deep or global state).

---

## When to Modularize
Modularization is still encouraged when it provides clear benefits:
- **Testing:** When a piece of UI has complex conditional rendering that is easier to unit test in isolation.
- **Performance:** When a specific sub-tree needs `React.memo` to prevent expensive re-renders.
- **Collaboration:** when multiple developers need to work on the same logical page simultaneously.
