# BMO Focus System Fixes - Session & Task Management

## Problems Fixed

### 1. **Break Timing Logic** ✅
**Issue:** After completing pomodoros, BMO assigned wrong break types
- 1st pomo → got LONG break (should be SHORT)
- Final pomo → got SHORT break (should be LONG)

**Root Cause:** Logic checked if NEXT session wraps, not if CURRENT session is last

**Fix:** Changed to check `currentSessionInRound === (sessionsPerRound - 1)`

---

### 2. **Task Carry-Over on New Day** ✅
**Issue:** User's active task selection persisted to the next day
- Day 1: User works on "TOP" task, completes 2 pomodoros
- Day 2: New day arrives, "TOP" resets but bmo_activeTaskId still points to it
- Result: New pomodoros get logged to old task's yesterday state

**Root Cause:** loadTasks() resets task data but doesn't clear bmo_activeTaskId

**Fixes Applied:**
1. Clear active task on daily reset - When tasks reset, activeTaskId is removed
2. Validate session logging - Check task exists before attributing sessions to it
3. Debug logging - Console shows when tasks are cleared/validated

---

## Console Commands to Debug

Open Chrome DevTools (F12) → Console tab and paste these:

### See Today's Sessions
javascript
const sessions = JSON.parse(localStorage.getItem('bmo_sessions') || '[]');
const today = new Date().toLocaleDateString('en-CA');
console.log('=== TODAY SESSIONS ===');
sessions.filter(s => s.date === today && s.completed).forEach(s => {
  console.log(s.type || 'focus' + ': ' + s.duration + 'min - Task: ' + (s.taskId || 'none'));
});


### View All Tasks & Their State
javascript
const tasks = JSON.parse(localStorage.getItem('bmo_tasks') || '[]');
tasks.forEach(t => {
  console.log('Task: ' + t.title + ' | Pomos: ' + t.completedPomodoros + ' | Session: ' + t.sessionInCurrentRound + ' | Last: ' + t.lastCompletedDate);
});


### Check Active Task
javascript
const activeTaskId = localStorage.getItem('bmo_activeTaskId');
const tasks = JSON.parse(localStorage.getItem('bmo_tasks') || '[]');
const task = tasks.find(t => t.id === activeTaskId);
console.log('Active Task: ' + (task?.title || 'NONE'));


### Full System Status
javascript
const today = new Date().toLocaleDateString('en-CA');
const tasks = JSON.parse(localStorage.getItem('bmo_tasks') || '[]');
const sessions = JSON.parse(localStorage.getItem('bmo_sessions') || '[]');
const todaySessions = sessions.filter(s => s.date === today && s.completed);

console.log('BMO STATUS - Today: ' + today);
console.log('Active Task: ' + (localStorage.getItem('bmo_activeTaskId') || 'NONE'));
console.log('Total Tasks: ' + tasks.length);
console.log('Today Sessions: ' + todaySessions.length);
console.log('Focus Minutes: ' + todaySessions.filter(s => s.type === 'focus' || !s.type).reduce((sum, s) => sum + s.duration, 0));


---

## How the System Works Now

### Daily Task Reset Flow
1. User opens BMO on Day 2
2. useTasks.ts loads tasks from localStorage
3. loadTasks() checks: is any task from yesterday?
4. If yes AND has pomodoros → reset to 0, clear sessionInCurrentRound
5. **NEW:** Check if that task was the active one
6. **NEW:** If yes, remove bmo_activeTaskId from localStorage
7. **NEW:** Log to console showing cleared task
8. React re-renders with fresh task state

### Focus Session Completion Flow
1. Timer expires, handleTimerComplete called
2. **NEW:** Validate taskId still exists
3. If taskId invalid → log session as unassigned (taskId=null)
4. If valid → update task pomodoro count & sessionInCurrentRound
5. Determine next break type based on current session position
6. Auto-advance to break mode

---

## What to Monitor

### Console Indicators
Look for these messages (good signs):
- `[BMO] Cleared active task <id> (was reset for new day)` → Daily reset working correctly

### Session Logs
Check sessions for taskId=null - these are unassigned (happens if task deleted or invalid)

### Data Integrity
- Tasks should reset pomodoros to 0 on new day
- sessionInCurrentRound should reset to 0
- activeTaskId should be cleared
- Streak counters should persist unless broken

---

## Files Modified
- src/hooks/useTasks.ts - Added active task clearing on reset
- src/App.tsx - Added task validation during session logging  
- src/hooks/useTimer.ts - Fixed break calculation logic
- DEBUG_COMMANDS.md - Console debugging guide

---

## Testing Checklist

After deploying:
1. Create a task, complete 2 pomodoros today
2. Check console: verify sessions logged with correct break types
3. Wait until next day or manually change system date
4. Open BMO extension on Day 2
5. Check console for "Cleared active task" message
6. Verify pomodoro counter is 0 on the old task
7. Create new pomodoros - verify they're logged as unassigned or to new task

