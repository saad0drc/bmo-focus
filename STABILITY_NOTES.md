# BMO Focus - Stability & Known Issues

## ✅ FIXED: All Major Bugs

### Session Management
- [x] Pomodoro count persists correctly
- [x] Custom rounds (e.g., 3 rounds) respected
- [x] Timer stops after planned rounds
- [x] Counter doesn't exceed target (no "4/3" bugs)
- [x] Completed tasks prevent additional increments

### Break Logic
- [x] Short break after regular sessions
- [x] Long break after final session
- [x] Correct break type selected for custom round counts
- [x] Background worker reads task settings correctly

### Data Persistence
- [x] Tasks save with color and allowed domains
- [x] No race conditions with async state
- [x] Domains and colors present on reload
- [x] localStorage + chrome.storage backup working

### Allowed World Blocker
- [x] Links from allowed domains work
- [x] Three-tier domain validation
- [x] Subdomains correctly matched
- [x] Referrer-based checking implemented

### Stats & Tracking
- [x] Session counts accurate
- [x] Focus minutes calculated correctly
- [x] Streak tracking working
- [x] Daily stats persist

## ⚠️ Expected Behavior

### Session Logging
- Sessions are ALWAYS logged (even for completed tasks)
- Task counter STOPS at target (doesn't increment past it)
- This prevents "4/3" display issues
- Sessions are logged for stats, but counter is frozen

### Completed Tasks
- After a task round completes, the counter shows final count
- If you manually restart timer, it logs the session but doesn't increment counter
- This is INTENTIONAL to prevent overcounting
- Solution: Don't restart timer on completed tasks

## 🔍 Debugging (if needed)

### Check stored data in console:
```javascript
JSON.parse(localStorage.getItem('bmo_tasks'))
JSON.parse(localStorage.getItem('bmo_sessions'))
```

### Check active task:
```javascript
localStorage.getItem('bmo_activeTaskId')
```

### Check specific task's sessions for today:
```javascript
const sessions = JSON.parse(localStorage.getItem('bmo_sessions'));
const today = new Date().toLocaleDateString('en-CA');
sessions.filter(s => s.date === today)
```

## 📝 Version History

- **4.0** - All critical bugs fixed, stable for production use
- **3.x** - Multiple bug fixes for custom rounds and persistence
- **2.x** - Initial Allowed World feature
- **1.x** - Core Pomodoro timer

## �� Deployment

Ready for production use. All fixes tested and committed.
Current status: STABLE

Last updated: 2026-04-17
