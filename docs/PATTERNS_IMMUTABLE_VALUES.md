# Comparing useState vs useRef for Immutable Values

When you need to capture a value once at component mount and never update it (like a timestamp, ID, or initialization value), you have two main patterns in React. This document compares them.

---

## Pattern 1: useState with Initializer Function

```typescript
const [startTime] = useState(Date.now());
```

### Pros

1. **Intent is explicit** — Destructuring only the getter signals "this is immutable"
   - Reader immediately knows it's never updated (no setter used)
   - The pattern visually shows "I'm not doing `setStartTime` anywhere"

2. **Consistent with other state** — If the component uses other `useState` hooks, this keeps the pattern uniform
   - All value management is in one place (state hooks)
   - Easier to scan: "all my values are here"

3. **Works perfectly fine** — There's no performance downside or functionality difference
   - No extra re-renders triggered
   - The value is still captured at mount time
   - Stale closure semantics work the same as useRef

4. **Intuitive for beginners** — Less magical than explaining why you'd use a ref for this
   - useState is the most common hook
   - No need to explain useRef's "escape hatch" semantics

5. **Easier to refactor** — If you later need to update the value conditionally, you already have the setter

### Cons

1. **Technically misusing the pattern** — useState implies the value might change
   - It's using a tool in a way it wasn't designed for
   - Linters or code reviewers might flag it as "unused setter"

2. **Semantic confusion** — Someone reading the code might wonder "why is this in state?"
   - They might think "I should add a setter to this"
   - Requires a comment to explain why there's no setter

3. **Bundle size** — Infinitesimal, but `useState` carries a bit more machinery than `useRef`
   - In practice, completely negligible

---

## Pattern 2: useRef

```typescript
const startTimeRef = useRef(Date.now());
// Access with: startTimeRef.current
```

### Pros

1. **Correct semantic** — useRef is explicitly designed for "hold a value that doesn't trigger re-renders"
   - Reader immediately knows "this is immutable and won't change"
   - No confusion about intention

2. **No unused setter** — You're not creating a setter you don't use
   - Linters are happy
   - Code reviewers recognize the pattern

3. **Clearer contract** — The API explicitly says "I won't update this"
   - `useRef` is the documented pattern for "initialize once, hold forever"
   - Self-documenting code

4. **Escape hatch semantics** — useRef is explicitly for escaping React's functional paradigm
   - Using it signals "I need to hold raw data"
   - Team convention: "If it's in a ref, it's not driving renders"

5. **No re-render risk** — Removing the setter from useState is safe, but useRef makes it impossible to accidentally trigger one

### Cons

1. **Extra ceremony** — Must use `.current` to access the value
   - `startTimeRef.current` vs `startTime`
   - Slightly more verbose

2. **Unfamiliar to beginners** — useRef requires explaining closure and render cycles
   - Why is there a `.current`?
   - Why not just use useState?

3. **Less convenient to refactor** — If you need to update it later, you have to change the pattern
   - `useState` already has a setter ready
   - `useRef` means "there's a reason this is immutable; think twice before changing it"

4. **Less visual consistency** — If other state in the component is useState, this stands out
   - Mixed patterns in the same component
   - Requires more context switching when reading

---

## Pattern 3: Const Outside Component (Anti-pattern)

```typescript
const START_TIME = Date.now();

export function MyComponent() {
  // Use START_TIME directly
}
```

### Why This Doesn't Work Here

- The timestamp is **shared across all renders and instances**
- If you mount the component twice, both instances use the same START_TIME
- For per-instance initialization, you need a hook

---

## Decision Matrix

| Scenario | Recommendation | Reasoning |
|----------|---|---|
| One-time value in a simple component | **useState** | Intent is clear via unused setter; minimal overhead |
| Complex component with mixed state patterns | **useRef** | Distinguishes "immutable infrastructure" from "reactive state" |
| Team has strong "useRef = escape hatch" convention | **useRef** | Matches team semantics; easier review |
| Team has no strong convention | **useState** | Simpler, one hook type, less cognitive load |
| Value might conditionally update later | **useState** | Setter already there; no refactor needed |
| Value will definitely never update | **useRef** | Prevents accidental updates; clearer contract |
| Polling loop with multiple such values | **useRef** | Reduces visual clutter; groups "infrastructure" together |

---

## Real Example: useMandatePolling Hook

### Current Implementation (useState)

```typescript
const [startTime] = useState(Date.now());

useEffect(() => {
  if (Date.now() - startTime > MAX_POLL_DURATION_MS) {
    // timeout logic
  }
}, [startTime]);
```

**Pros:**
- Consistent with `mandateStatus`, `isPolling`, `error` state
- Pattern is immediately understandable
- No `.current` noise

**Cons:**
- Technically misusing useState
- Creates an unused setter conceptually

### Alternative Implementation (useRef)

```typescript
const startTimeRef = useRef(Date.now());

useEffect(() => {
  if (Date.now() - startTimeRef.current > MAX_POLL_DURATION_MS) {
    // timeout logic
  }
}, [startTimeRef]);
```

**Pros:**
- Clearer semantics: "this infrastructure doesn't change"
- useRef is the documented pattern for this use case
- Visual separation: state vs infrastructure

**Cons:**
- `.current` is repetitive
- Inconsistent with other useState in the same hook
- Slightly more verbose

---

## Team Convention Recommendation

For **this project** (`project-anchor`), given the code style:

### **Prefer useRef for immutable infrastructure values**

**Reasons:**
1. Polling/timeout values are "infrastructure", not "reactive state"
2. The project uses Result types and vertical slicing (structured patterns)
3. Distinguishing "state that drives renders" from "data that doesn't" helps maintainability
4. In a complex assessment flow, clarity about what triggers re-renders matters

### Pattern for Polling Hooks

```typescript
export function useMandatePolling(shouldPoll: boolean): PollResult {
  const startTimeRef = useRef(Date.now());  // Infrastructure: never changes
  const [mandateStatus, setMandateStatus] = useState(null);  // State: drives renders
  const [isPolling, setIsPolling] = useState(shouldPoll);     // State: drives renders
  
  useEffect(() => {
    if (Date.now() - startTimeRef.current > MAX_POLL_DURATION_MS) { ... }
  }, []);  // No dependency on startTimeRef — it never changes
}
```

**Benefits:**
- Readers see: "startTimeRef is infrastructure, not state"
- Clear dependency array: no surprise dependencies on immutable values
- Aligns with domain-driven design (distinguish state from infrastructure)
- Scales when the component grows

---

## Conclusion

| Pattern | Best For |
|---------|----------|
| **useState** | Small, simple components; mixed state; beginner-friendly code |
| **useRef** | Large/complex components; infrastructure vs state distinction; performance-sensitive code |

There's no universally "correct" answer—it depends on your team's conventions and the specific context. But **being intentional about the choice** is what matters most.
