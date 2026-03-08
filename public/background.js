const STORAGE_KEY = 'bmo_timer_state';
const ALARM_NAME = 'bmo_pomodoro';
const AUTO_ADVANCE_DELAY_MS = 3000;

const DEFAULT_SETTINGS = { focus: 25, shortBreak: 5, longBreak: 15, sessionsPerRound: 4 };

const DEFAULT_STATE = {
  mode: 'focus',
  isActive: false,
  endTime: null,
  pausedTimeLeft: null,
  sessionCount: 0,
  settings: DEFAULT_SETTINGS,
  lastCompletedAt: null,
  lastCompletedMode: null,
};

async function getState() {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return { ...DEFAULT_STATE, ...result[STORAGE_KEY] };
}

async function saveState(updates) {
  const current = await getState();
  const newState = { ...current, ...updates };
  await chrome.storage.local.set({ [STORAGE_KEY]: newState });
  return newState;
}

function modeDurationMs(mode, settings) {
  const mins =
    mode === 'focus' ? settings.focus
    : mode === 'shortBreak' ? settings.shortBreak
    : settings.longBreak;
  return mins * 60 * 1000;
}

function getNextMode(completedMode, newSessionCount, sessionsPerRound) {
  if (completedMode !== 'focus') return 'focus';
  return newSessionCount % sessionsPerRound === 0 ? 'longBreak' : 'shortBreak';
}

// ── Notification content ────────────────────────────────────────────────────

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildNotification(completedMode, nextMode, sessionCount, sessionsPerRound) {
  // ── Focus session finished ──────────────────────────────────────────────
  if (completedMode === 'focus') {
    const isRoundComplete = sessionCount % sessionsPerRound === 0;
    const sessionInRound  = sessionCount % sessionsPerRound || sessionsPerRound;
    const remaining       = sessionsPerRound - (sessionCount % sessionsPerRound);

    // Round complete → long break
    if (isRoundComplete) {
      return {
        title: pick([
          '⭐ ROUND COMPLETE! Mathematical!',
          '🌟 Algebraic! You Crushed It All!',
          '🎮 Full Round Done — BMO is AMAZED!',
          '🏆 Champion! That\'s a Full Round!',
        ]),
        message: pick([
          `${sessionsPerRound} sessions DONE! BMO is doing a little happy dance right now! 💃 Take your long break — you earned every second!`,
          `WOW WOW WOW! A full round complete! BMO's circuits are OVERLOADING with pride! 🌈 Enjoy your long break, legend!`,
          `MATHEMATICAL! You finished all ${sessionsPerRound} sessions! BMO is so proud it could burst! 🎉 Rest well — you deserve it!`,
          `BMO says: YOU. ARE. INCREDIBLE. Full round finished! Go rest, adventurer — BMO will keep the lights on! ⭐`,
          `ALGEBRAIC! That's ${sessionsPerRound} focus sessions in a row! BMO is jumping on its charging pad! Take a long break! 🕹️`,
        ]),
      };
    }

    // Regular focus → short break (vary by session position in round)
    const byPosition = {
      1: pick([
        `First session: DONE! ☕ BMO says warm-up complete — ${remaining} more to the long break! You've totally got this!`,
        `Beep boop! Session 1 conquered! BMO is already proud. ${remaining} sessions left in this round — let's keep going! 💪`,
        `Off to a great start! ☕ BMO is watching your progress and doing a little smile. ${remaining} more to go!`,
      ]),
      2: pick([
        `Session 2 complete! ☕ BMO says you're in the zone! ${remaining} left — don't stop now, adventurer!`,
        `TWO DOWN! BMO's power meter is filling up! ⚡ ${remaining} more sessions until the long break — you're on a roll!`,
        `Nice work! BMO says: break time. ☕ ${remaining} sessions away from the big rest — keep that energy!`,
      ]),
      3: pick([
        `Three sessions in the bag! 🔥 BMO is getting EXCITED! Just ${remaining} more until your long break!`,
        `Session 3 DONE! BMO's sensors detect greatness. ✨ ${remaining} to go — you can FEEL the long break coming!`,
        `BMO says: you're SO close! ☕ ${remaining} session${remaining > 1 ? 's' : ''} until long break — finish strong, adventurer!`,
      ]),
    };

    const fallback = pick([
      `Session ${sessionInRound} complete! ☕ BMO is proud — ${remaining} more to the long break. Keep it up!`,
      `Beep boop! Another one done! 🎮 ${remaining} session${remaining > 1 ? 's' : ''} left — BMO believes in you!`,
      `Nice focus, adventurer! ✨ Short break time. ${remaining} to go until the big rest!`,
      `BMO says: GREAT WORK! ☕ Take a breather — ${remaining} more sessions and you hit the long break!`,
    ]);

    return {
      title: pick([
        '🍅 Focus Session Complete!',
        '☕ Break Time — BMO Says!',
        '🎮 Well Done, Adventurer!',
        '✨ Session Done — Rest Up!',
      ]),
      message: byPosition[sessionInRound] ?? fallback,
    };
  }

  // ── Short break finished ────────────────────────────────────────────────
  if (completedMode === 'shortBreak') {
    return {
      title: pick([
        '⏰ Break\'s Over — Let\'s Go!',
        '🍅 Adventure Continues!',
        '🎮 BMO Says: Focus Time!',
        '⚡ Ready? Time to Focus!',
      ]),
      message: pick([
        "Break time's up, adventurer! BMO is ready when you are — LET'S DO THIS! 💪",
        "Beep boop! Rest mode OFF. Focus mode ON. BMO believes in you! 🍅",
        "Hope that felt good! BMO has been keeping watch 👀 Time to get back in the zone!",
        "Okay okay, break is OVER! BMO says you're fully ready — let's make this session count! ⚡",
        "Rise and shine! Your next mission awaits. BMO will be cheering the whole time! 🌟",
        "BMO says: you rested, you recharged, now you FOCUS! Let's go show that timer who's boss! 🎮",
        "Ding ding ding! Short break done! BMO has prepared a fresh cup of focus juice for you! ☕💪",
      ]),
    };
  }

  // ── Long break finished ─────────────────────────────────────────────────
  return {
    title: pick([
      '🌟 Fully Recharged — New Round!',
      '🎮 BMO Says: New Adventure!',
      '⭐ Fresh Round Starts Now!',
      '🚀 Rested & Ready — Let\'s Go!',
    ]),
    message: pick([
      "LONG BREAK DONE! You're FULLY recharged! BMO is SO excited for this new round — MATHEMATICAL! 🎮",
      "New round, new adventure! BMO says: you've rested, recharged, now let's ABSOLUTELY CRUSH IT! ⚡",
      "Beep boop! Systems fully rebooted! You + BMO = unstoppable team! New round starts NOW! 🌈",
      "That was a great break! Now BMO says: channel all that rest energy and GO GO GO! 🚀",
      "Welcome back, adventurer! BMO missed you! 💚 Ready for another epic round? Let's make it count!",
      "BMO has been waiting and now the moment is here — NEW ROUND! ALGEBRAIC! You've got this! 🌟",
    ]),
  };
}

// ── Clicking a notification opens / focuses the BMO tab ────────────────────
chrome.notifications.onClicked.addListener(async (notificationId) => {
  if (notificationId !== ALARM_NAME) return;
  chrome.notifications.clear(notificationId);

  try {
    const extensionUrl = chrome.runtime.getURL('index.html');
    const tabs = await chrome.tabs.query({ url: extensionUrl });

    if (tabs.length > 0 && tabs[0].id != null) {
      // Focus the existing BMO tab
      await chrome.tabs.update(tabs[0].id, { active: true });
      if (tabs[0].windowId != null) {
        await chrome.windows.update(tabs[0].windowId, { focused: true });
      }
    } else {
      // No BMO tab open — open a new tab (it'll show BMO as the new-tab override)
      await chrome.tabs.create({});
    }
  } catch (_) {
    // Fail silently — notification click is best-effort
  }
});

// ── Alarm fires: session ended ──────────────────────────────────────────────
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== ALARM_NAME) return;

  const state = await getState();
  const completedMode = state.mode;
  const sessionsPerRound = state.settings.sessionsPerRound ?? 4;

  const newSessionCount =
    completedMode === 'focus' ? state.sessionCount + 1 : state.sessionCount;

  const nextMode = getNextMode(completedMode, newSessionCount, sessionsPerRound);
  const nextDurationMs = modeDurationMs(nextMode, state.settings);

  // Signal completion — pause at the start of next mode, React handles sounds/tasks
  await saveState({
    mode: nextMode,
    isActive: false,
    endTime: null,
    pausedTimeLeft: nextDurationMs,
    sessionCount: newSessionCount,
    lastCompletedAt: Date.now(),
    lastCompletedMode: completedMode,
  });

  // Send notification if the BMO tab isn't currently in focus
  try {
    const extensionUrl = chrome.runtime.getURL('index.html');
    const activeTabs = await chrome.tabs.query({ url: extensionUrl, active: true });
    if (activeTabs.length === 0) {
      const { title, message } = buildNotification(completedMode, nextMode, newSessionCount, sessionsPerRound);
      chrome.notifications.create(ALARM_NAME, {
        type: 'basic',
        iconUrl: 'icon48.png',
        title,
        message,
        silent: false,
      });
    }
  } catch (_) {
    // Notification permission not granted — silently skip
  }

  // Auto-advance after a delay, giving the React tab time to handle completion
  // If the tab already sent START (user clicked), the isActive check prevents double-start
  setTimeout(async () => {
    const fresh = await getState();
    if (!fresh.isActive && fresh.mode === nextMode) {
      const endTime = Date.now() + nextDurationMs;
      await saveState({ isActive: true, endTime, pausedTimeLeft: null });
      chrome.alarms.create(ALARM_NAME, { when: endTime });
    }
  }, AUTO_ADVANCE_DELAY_MS);
});

// ── Messages from the React tab ─────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  handleMessage(message)
    .then(sendResponse)
    .catch((err) => sendResponse({ ok: false, error: err.message }));
  return true; // keep channel open for async response
});

async function handleMessage(msg) {
  const state = await getState();

  switch (msg.type) {
    case 'START': {
      if (state.isActive) return { ok: true };
      const timeLeftMs =
        state.pausedTimeLeft != null
          ? state.pausedTimeLeft
          : modeDurationMs(state.mode, state.settings);
      const endTime = Date.now() + timeLeftMs;
      await chrome.alarms.clear(ALARM_NAME);
      chrome.alarms.create(ALARM_NAME, { when: endTime });
      await saveState({ isActive: true, endTime, pausedTimeLeft: null });
      return { ok: true };
    }

    case 'PAUSE': {
      if (!state.isActive) return { ok: true };
      const timeLeftMs = state.endTime
        ? Math.max(0, state.endTime - Date.now())
        : 0;
      await chrome.alarms.clear(ALARM_NAME);
      await saveState({ isActive: false, endTime: null, pausedTimeLeft: timeLeftMs });
      return { ok: true };
    }

    case 'RESET': {
      await chrome.alarms.clear(ALARM_NAME);
      const duration = modeDurationMs(state.mode, state.settings);
      await saveState({ isActive: false, endTime: null, pausedTimeLeft: duration });
      return { ok: true };
    }

    case 'SET_MODE': {
      await chrome.alarms.clear(ALARM_NAME);
      const duration = modeDurationMs(msg.mode, state.settings);
      await saveState({
        mode: msg.mode,
        isActive: false,
        endTime: null,
        pausedTimeLeft: duration,
      });
      return { ok: true };
    }

    case 'UPDATE_SETTINGS': {
      const newSettings = { ...state.settings, ...msg.settings };
      const updates = { settings: newSettings };
      // If not running, update the paused time to match new duration
      if (!state.isActive) {
        updates.pausedTimeLeft = modeDurationMs(state.mode, newSettings);
      }
      await saveState(updates);
      return { ok: true };
    }

    case 'GET_STATE': {
      return state;
    }

    default:
      return { ok: false, error: `Unknown message type: ${msg.type}` };
  }
}
