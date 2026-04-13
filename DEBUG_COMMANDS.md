# BMO Debug Console Commands

## 1. View Task History & Current State
```javascript
const tasks = JSON.parse(localStorage.getItem('bmo_tasks') || '[]');
tasks.forEach(t => {
  console.log(`
Task: ${t.title}
  ID: ${t.id}
  Completed Pomodoros: ${t.completedPomodoros}
  Session In Round: ${t.sessionInCurrentRound}
  Created: ${t.createdAt}
  Last Completed: ${t.lastCompletedDate}
  Daily Streak: ${t.dailyStreak}
  Settings: focus=${t.settings.focusDuration}, sessions=${t.settings.sessionsPerRound}
  ---
  `);
});
```

## 2. View Today's Sessions (History Log)
```javascript
const sessions = JSON.parse(localStorage.getItem('bmo_sessions') || '[]');
const today = new Date().toLocaleDateString('en-CA');
console.log('=== TODAY\'S SESSIONS ===');
sessions.filter(s => s.date === today && s.completed).forEach(s => {
  console.log(`${s.type || 'focus'}: ${s.duration}min - Task: ${s.taskId || 'none'}`);
});
console.log('\n=== LAST 10 SESSIONS (ALL DATES) ===');
sessions.reverse().slice(0, 10).forEach(s => {
  console.log(`${s.date} | ${s.type || 'focus'}: ${s.duration}min | Task: ${s.taskId || 'none'}`);
});
```

## 3. Check Yesterday vs Today
```javascript
const tasks = JSON.parse(localStorage.getItem('bmo_tasks') || '[]');
const today = new Date().toLocaleDateString('en-CA');
const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('en-CA');
tasks.forEach(t => {
  const lastDate = t.lastCompletedDate || t.createdAt?.split('T')[0];
  console.log(`${t.title}: lastDate=${lastDate}, today=${today}, yesterday=${yesterday}`);
});
```

## 4. Full System Status
```javascript
const today = new Date().toLocaleDateString('en-CA');
const tasks = JSON.parse(localStorage.getItem('bmo_tasks') || '[]');
const sessions = JSON.parse(localStorage.getItem('bmo_sessions') || '[]');
const todaySessions = sessions.filter(s => s.date === today && s.completed);
const activeTaskId = localStorage.getItem('bmo_activeTaskId');

console.log(`=== BMO SYSTEM STATUS ===`);
console.log(`Today: ${today}`);
console.log(`Active Task ID: ${activeTaskId}`);
console.log(`Total Tasks: ${tasks.length}`);
console.log(`Today's Completed Sessions: ${todaySessions.length}`);
console.log(`Today's Focus Minutes: ${todaySessions.filter(s => s.type === 'focus' || !s.type).reduce((sum, s) => sum + s.duration, 0)}`);
console.log(`\nTasks:`, tasks.map(t => ({
  title: t.title,
  pomos: t.completedPomodoros,
  sessionInRound: t.sessionInCurrentRound,
  lastDate: t.lastCompletedDate
})));
```

## 5. Check Active Task Info
```javascript
const activeTaskId = localStorage.getItem('bmo_activeTaskId');
const tasks = JSON.parse(localStorage.getItem('bmo_tasks') || '[]');
const task = tasks.find(t => t.id === activeTaskId);
console.log('Active Task:', task ? {
  title: task.title,
  id: task.id,
  pomos: task.completedPomodoros,
  sessionInRound: task.sessionInCurrentRound,
  lastCompletedDate: task.lastCompletedDate
} : 'NONE');
```

## 6. Clear Active Task (Reset Selection)
```javascript
localStorage.removeItem('bmo_activeTaskId');
console.log('Active task cleared. Refresh the page.');
```
