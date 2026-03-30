# BMO Focus — Debug Log & Solutions

## Session: 2026-03-30 — Daily Reset Bug

### The Problem
User reported: Task "alx" showing `1/4` pomodoros on day 30, but it was completed on day 28. Should reset to `0/4` on new day.

### What We Tried (& Why It Failed)

❌ **Attempt 1: Reset logic only checking `repeatDaily && completed`**
- Only reset tasks marked `completed: true`
- Didn't reset tasks with 1-3 pomodoros (partial rounds)
- Didn't reset non-repeatDaily tasks

❌ **Attempt 2: Added `lastCompletedDate` to `incrementPomodoro`**
- Good step, but incomplete
- Didn't handle old tasks that never had `lastCompletedDate` set
- Reset logic still needed to persist to localStorage

❌ **Attempt 3: Manual localStorage reset in console**
- `localStorage.clear()` worked locally but user's data was stale
- Task data wasn't actually being read from localStorage in extension

❌ **Attempt 4: Reset check with streak logic**
- Tried to break streak on skipped days
- Wrong approach — skipped days shouldn't break streak
- Added unnecessary complexity

### Root Cause Found
The task object in localStorage had:
```javascript
{
  "title": "Alx",
  "completedPomodoros": 1,
  "lastCompletedDate": undefined,  // ← MISSING!
  "createdAt": "2026-03-28T09:36:14.534Z"
}
```

**The reset check was:**
```javascript
if (task.lastCompletedDate && task.lastCompletedDate !== today && task.completedPomodoros > 0)
```

Since `lastCompletedDate` was `undefined`, the entire condition failed. **The reset never triggered.**

### What Actually Worked ✅

**Solution: Use fallback date logic in `loadTasks()`**

```javascript
// Use lastCompletedDate if available, fallback to createdAt
const taskDateStr = task.lastCompletedDate || (task.createdAt ? task.createdAt.split('T')[0] : null);
const needsReset = taskDateStr && taskDateStr !== today && task.completedPomodoros > 0;
```

**Why this worked:**
1. Old tasks without `lastCompletedDate` could still be detected (using `createdAt`)
2. Reset logic ran and set `completedPomodoros = 0`
3. **Critical**: Immediately save reset back to localStorage in `loadTasks()`
```javascript
if (needsSave) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
}
```

**Additional fixes:**
- Set `lastCompletedDate: today` on EVERY pomodoro (partial or full round)
- Clear `lastCompletedDate: undefined` on reset so new day is fresh
- Increment streak on first pomodoro of day (not just full rounds)

---

## Key Learnings

### 1. Always Debug with Real Data First
❌ Wrong: Make assumptions about the bug, write code, test
✅ Right: Check actual localStorage → see what's stored → understand why code fails → fix

**How to debug in extension console:**
```javascript
const tasks = JSON.parse(localStorage.getItem('bmo_tasks') || '[]');
const task = tasks.find(t => t.title?.includes('target'));
console.log(JSON.stringify(task, null, 2));
```

### 2. Fallback Logic for Legacy Data
Old tasks may have incomplete/missing fields. Don't assume data is fresh.
- Missing `lastCompletedDate`? Use `createdAt`
- Missing field X? Check if there's an old field name it migrated from
- **Always run migration in `loadTasks()`**

### 3. Persist State Immediately
React state changes don't persist to localStorage automatically.
- Don't just reset in memory, actually call `localStorage.setItem()`
- Don't rely on component re-renders to save data
- Save immediately in data-loading functions like `loadTasks()`

### 4. localStorage vs chrome.storage
**Tasks:** Use `localStorage` (key: `bmo_tasks`)
**Timer state:** Hybrid — `chrome.storage.local` in extension, fallback to `localStorage` in dev
**Sessions:** Use `localStorage` (key: `bmo_sessions`)

If you can't find data, check which storage you're reading from.

### 5. Date Comparisons Must Be Consistent
- Always use `YYYY-MM-DD` format (local timezone, not UTC)
- `new Date().toLocaleDateString('en-CA')` produces correct format
- String comparison works: `"2026-03-28" < "2026-03-30"` ✅

---

## Files Modified & Why

### `src/hooks/useTasks.ts`

**Change 1: Enhanced `loadTasks()` reset condition**
- Use `lastCompletedDate || createdAt.split('T')[0]` as fallback
- Persist immediately: `localStorage.setItem(STORAGE_KEY, JSON.stringify(result))`
- Clear `lastCompletedDate: undefined` on reset

**Change 2: `incrementPomodoro` now sets `lastCompletedDate`**
- Every pomodoro (partial or full) sets today's date
- Enables reset detection on next app load
- Increments streak on first pomodoro of day for repeatDaily tasks

**Change 3: `completeRound` increments streak consistently**
- Both `incrementPomodoro` and `completeRound` handle streak for repeatDaily

---

## Future Prevention Checklist

When working on task state changes:

- [ ] Check if old tasks might have missing `lastCompletedDate` field
- [ ] Use fallback dates if needed (e.g., `createdAt` as backup)
- [ ] Set `lastCompletedDate` when ANY pomodoro completes
- [ ] Call `localStorage.setItem()` immediately when data changes
- [ ] Test with old task data (create task one day, check next day)
- [ ] Verify reset persists after reload (not just in memory)
- [ ] Don't assume streak should break on skipped days

---

## Quick Reference: Debugging Steps

1. **Open extension → F12 Console**
2. **Check actual data:**
   ```javascript
   console.log(JSON.parse(localStorage.getItem('bmo_tasks')));
   ```
3. **Run reset logic manually to test:**
   ```javascript
   const today = new Date().toLocaleDateString('en-CA');
   const tasks = JSON.parse(localStorage.getItem('bmo_tasks'));
   console.log('Tasks:', tasks);
   console.log('Today:', today);
   ```
4. **Check dates match expected format** (YYYY-MM-DD)
5. **Never assume — verify what's actually stored first**

---

## What NOT to Do

❌ Guess why code isn't working without checking actual data
❌ Assume new fields exist on old task objects
❌ Modify state in memory without persisting to localStorage
❌ Use UTC dates (always use local timezone)
❌ Skip testing with legacy data (old tasks break most often)
