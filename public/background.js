const STORAGE_KEY = 'bmo_timer_state';
const ALARM_NAME = 'bmo_pomodoro';
const AUTO_ADVANCE_DELAY_MS = 3000;

// Character SVGs for blocked page
const CHARACTER_SVGS = {
  '#4ECDC4': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect x="20" y="20" width="216" height="216" rx="24" fill="#4ECDC4" stroke="#1F4E5A" stroke-width="8"/><rect x="40" y="40" width="176" height="176" rx="16" fill="#E8F5E9" stroke="#1F4E5A" stroke-width="6"/><g><rect x="55" y="65" width="45" height="55" rx="4" fill="#1F4E5A"/><rect x="62" y="72" width="18" height="22" fill="#E8F5E9" rx="2"/><circle cx="71" cy="83" r="4" fill="#1F4E5A"/></g><g><rect x="156" y="65" width="45" height="55" rx="4" fill="#1F4E5A"/><rect x="163" y="72" width="18" height="22" fill="#E8F5E9" rx="2"/><circle cx="172" cy="83" r="4" fill="#1F4E5A"/></g><path d="M 70 130 Q 128 150 186 130" stroke="#1F4E5A" stroke-width="8" fill="none" stroke-linecap="round"/><circle cx="35" cy="140" r="6" fill="#1F4E5A"/><circle cx="35" cy="165" r="6" fill="#1F4E5A"/></svg>`,
  '#5B9BD5': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path d="M 50 120 Q 50 40 128 30 Q 206 40 206 120" fill="white" stroke="#1F4E5A" stroke-width="8"/><rect x="50" y="110" width="156" height="20" fill="white" stroke="#1F4E5A" stroke-width="8"/><rect x="70" y="100" width="116" height="15" fill="#5B9BD5" stroke="#1F4E5A" stroke-width="3"/><circle cx="128" cy="150" r="85" fill="#5B9BD5" stroke="#1F4E5A" stroke-width="8"/><circle cx="128" cy="160" r="65" fill="#FFD9B3"/><g><rect x="75" y="125" width="32" height="40" rx="4" fill="#1F4E5A"/><rect x="82" y="133" width="12" height="16" fill="white" rx="2"/><circle cx="88" cy="141" r="3" fill="#1F4E5A"/></g><g><rect x="149" y="125" width="32" height="40" rx="4" fill="#1F4E5A"/><rect x="156" y="133" width="12" height="16" fill="white" rx="2"/><circle cx="162" cy="141" r="3" fill="#1F4E5A"/></g><path d="M 90 175 Q 128 195 166 175" stroke="#1F4E5A" stroke-width="8" fill="none" stroke-linecap="round"/></svg>`,
  '#FF9F1C': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><circle cx="128" cy="140" r="100" fill="#FF9F1C" stroke="#1F4E5A" stroke-width="8"/><ellipse cx="50" cy="80" rx="35" ry="50" fill="#FF9F1C" stroke="#1F4E5A" stroke-width="8" transform="rotate(-20 50 80)"/><ellipse cx="206" cy="80" rx="35" ry="50" fill="#FF9F1C" stroke="#1F4E5A" stroke-width="8" transform="rotate(20 206 80)"/><ellipse cx="128" cy="160" rx="60" ry="55" fill="#FFB84D" stroke="#1F4E5A" stroke-width="6"/><circle cx="128" cy="145" r="20" fill="#1F4E5A"/><g><circle cx="90" cy="110" r="22" fill="#1F4E5A"/><circle cx="95" cy="108" r="8" fill="white"/></g><g><circle cx="166" cy="110" r="22" fill="#1F4E5A"/><circle cx="171" cy="108" r="8" fill="white"/></g><ellipse cx="128" cy="175" rx="25" ry="15" fill="#FF5E5E"/></svg>`,
  '#FF69B4': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><circle cx="128" cy="140" r="90" fill="#FF69B4" stroke="#1F4E5A" stroke-width="8"/><polygon points="60,100 40,30 85,80" fill="#FFD700" stroke="#1F4E5A" stroke-width="6"/><polygon points="128,60 100,10 156,60" fill="#FFD700" stroke="#1F4E5A" stroke-width="6"/><polygon points="196,100 216,30 171,80" fill="#FFD700" stroke="#1F4E5A" stroke-width="6"/><circle cx="128" cy="150" r="70" fill="#FFB6D9"/><circle cx="95" cy="130" r="20" fill="#1F4E5A"/><circle cx="100" cy="128" r="7" fill="white"/><circle cx="161" cy="130" r="20" fill="#1F4E5A"/><circle cx="166" cy="128" r="7" fill="white"/><path d="M 95 165 Q 128 185 161 165" stroke="#1F4E5A" stroke-width="8" fill="none" stroke-linecap="round"/></svg>`,
};

const DEFAULT_SETTINGS = { focus: 25, shortBreak: 5, longBreak: 15, sessionsPerRound: 4 };

const DEFAULT_STATE = {
  mode: 'focus',
  isActive: false,
  endTime: null,
  pausedTimeLeft: null,
  sessionCount: 0,
  sessionInCurrentRound: 0,
  settings: DEFAULT_SETTINGS,
  lastCompletedAt: null,
  lastCompletedMode: null,
  activeTaskSessionInCurrentRound: undefined,
  activeTaskSessionsPerRound: undefined,
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

function getNextMode(completedMode, sessionInRound, sessionsPerRound) {
  if (completedMode !== 'focus') return 'focus';
  // Calculate next session position: (current + 1) % sessionsPerRound
  const nextSessionInRound = (sessionInRound + 1) % sessionsPerRound;
  // Long break if next position is 0 (we're at the end of the round)
  return nextSessionInRound === 0 ? 'longBreak' : 'shortBreak';
}

// ── Notification content ────────────────────────────────────────────────────

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildNotification(completedMode, nextMode, sessionInRound, sessionsPerRound, taskSessionsPerRound) {
  // ── Focus session finished ──────────────────────────────────────────────
  if (completedMode === 'focus') {
    // Use task-specific sessionsPerRound if available (for mission notifications)
    const effectiveSessionsPerRound = taskSessionsPerRound || sessionsPerRound;
    const isRoundComplete = sessionInRound === 0;
    const displaySessionNumber = sessionInRound || effectiveSessionsPerRound;
    const remaining = isRoundComplete ? 0 : effectiveSessionsPerRound - sessionInRound;

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
          `${effectiveSessionsPerRound} sessions DONE! BMO is doing a little happy dance right now! 💃 Take your long break — you earned every second!`,
          `WOW WOW WOW! A full round complete! BMO's circuits are OVERLOADING with pride! 🌈 Enjoy your long break, legend!`,
          `MATHEMATICAL! You finished all ${effectiveSessionsPerRound} sessions! BMO is so proud it could burst! 🎉 Rest well — you deserve it!`,
          `BMO says: YOU. ARE. INCREDIBLE. Full round finished! Go rest, adventurer — BMO will keep the lights on! ⭐`,
          `ALGEBRAIC! That's ${effectiveSessionsPerRound} focus sessions in a row! BMO is jumping on its charging pad! Take a long break! 🕹️`,
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
      `Session ${displaySessionNumber} complete! ☕ BMO is proud — ${remaining} more to the long break. Keep it up!`,
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
      message: byPosition[displaySessionNumber] ?? fallback,
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
      '🌟 Time to Start a New Mission!',
      '🎮 BMO Says: Pick Your Next Quest!',
      '⭐ Ready for the Next Challenge?',
      '🚀 Rest Complete — Choose Your Mission!',
    ]),
    message: pick([
      "That long break was LEGENDARY! Now BMO says: pick a new mission and let's ABSOLUTELY CRUSH IT! 🎮",
      "You're fully recharged! BMO is ready to help you tackle your next mission. Choose wisely, adventurer! ⚡",
      "Beep boop! Long break complete! Time to select your next goal — BMO believes in you! 🌈",
      "That was perfectly earned! Now BMO says: which mission should we conquer next? Let's GO! 🚀",
      "Welcome back, explorer! BMO missed you! 💚 What's next on your adventure? Pick a mission and let's go!",
      "BMO has been resting too and is ENERGIZED! Now it's time to pick your next mission — you've got this! 🌟",
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
  
  // Fetch active task's settings and session info from storage if available
  let activeTaskSessionsPerRound = undefined;
  let activeTaskSessionInCurrentRound = undefined;
  try {
    const { bmo_activeTaskId, bmo_tasks } = await chrome.storage.local.get(['bmo_activeTaskId', 'bmo_tasks']);
    if (bmo_activeTaskId && bmo_tasks) {
      const tasks = typeof bmo_tasks === 'string' ? JSON.parse(bmo_tasks) : bmo_tasks;
      const activeTask = tasks.find(t => t.id === bmo_activeTaskId);
      if (activeTask?.settings?.sessionsPerRound) {
        activeTaskSessionsPerRound = activeTask.settings.sessionsPerRound;
        activeTaskSessionInCurrentRound = activeTask.sessionInCurrentRound ?? 0;
        console.log('[Alarm] Active task found:', activeTask.title, 'sessionsPerRound:', activeTaskSessionsPerRound, 'sessionInCurrentRound:', activeTaskSessionInCurrentRound);
      }
    }
  } catch (e) {
    console.warn('[Alarm] Failed to fetch active task settings:', e);
  }
  
  // Determine which session tracker to use:
  // - If there's an active task, use its sessionInCurrentRound and sessionsPerRound
  // - Otherwise, use global sessionInCurrentRound and sessionsPerRound
  const isTaskMode = activeTaskSessionsPerRound !== undefined;
  const currentSessionInRound = isTaskMode 
    ? (activeTaskSessionInCurrentRound ?? 0)
    : (state.sessionInCurrentRound ?? 0);
  const effectiveSessionsPerRound = isTaskMode 
    ? activeTaskSessionsPerRound 
    : sessionsPerRound;

  // Calculate next session position
  const newSessionInRound = completedMode === 'focus' 
    ? (currentSessionInRound + 1) % effectiveSessionsPerRound 
    : currentSessionInRound;

  const nextMode = getNextMode(completedMode, currentSessionInRound, effectiveSessionsPerRound);
  const nextDurationMs = modeDurationMs(nextMode, state.settings);

  // Update state: track sessions both globally and per-task
  const updateObj = {
    mode: nextMode,
    isActive: false,
    endTime: null,
    pausedTimeLeft: nextDurationMs,
    sessionCount: completedMode === 'focus' ? state.sessionCount + 1 : state.sessionCount,
    lastCompletedAt: Date.now(),
    lastCompletedMode: completedMode,
  };

  // Update the appropriate session tracker
  if (isTaskMode) {
    updateObj.activeTaskSessionInCurrentRound = newSessionInRound;
  } else {
    updateObj.sessionInCurrentRound = newSessionInRound;
  }

  await saveState(updateObj);

  // Send notification if the BMO tab isn't currently in focus
  try {
    const extensionUrl = chrome.runtime.getURL('index.html');
    const activeTabs = await chrome.tabs.query({ url: extensionUrl, active: true });
    if (activeTabs.length === 0) {
      const { title, message } = buildNotification(
        completedMode, 
        nextMode, 
        newSessionInRound,
        effectiveSessionsPerRound, 
        state.activeTaskSessionsPerRound
      );
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

// ── Tab tracking for Trusted Bubble ──
const tabOrigins = new Map(); // tabId -> hostname of allowed domain

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    try {
      const url = new URL(tab.url);
      // Only track real websites, not extension pages or special pages
      if (!url.protocol.startsWith('chrome') && !url.hostname.includes('newtab')) {
        const hostname = url.hostname.replace(/^www\./, '');
        tabOrigins.set(tabId, hostname);
        console.log('[BMO] Tab tracking:', tabId, '→', hostname);
      }
    } catch (e) {
      // Ignore invalid URLs
    }
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  tabOrigins.delete(tabId);
});

// Helper function to extract hostname from domain string
function extractHostname(domain) {
  try {
    if (domain.startsWith('http://') || domain.startsWith('https://')) {
      return new URL(domain).hostname.replace(/^www\./, '');
    }
    return domain.replace(/^www\./, '');
  } catch (e) {
    return domain.replace(/^www\./, '');
  }
}

// Helper to check if a hostname matches allowed domains
function isHostnameAllowed(hostname, allowedDomains) {
  const normalized = hostname.replace(/^www\./, '');
  return allowedDomains.some(domain => {
    const normalizedDomain = extractHostname(domain);
    return normalized === normalizedDomain || normalized.endsWith('.' + normalizedDomain);
  });
}

// ── Allowed World Blocker: Intercept navigations via webNavigation API (MV3 compatible) ─
try {
  chrome.webNavigation.onBeforeNavigate.addListener(
    async (details) => {
      // Only intercept main_frame navigations (not subframes, XHR, etc.)
      if (details.frameId !== 0) return;  // frameId 0 = main frame
      
      console.log('[Blocker] Navigation detected:', details.url);

    const state = await getState();

    // Block during all modes when active (focus, shortBreak, longBreak)
    if (!state.isActive) {
      return {};
    }

    // Get active task ID
    const { bmo_activeTaskId } = await chrome.storage.local.get('bmo_activeTaskId');
    if (!bmo_activeTaskId) {
      console.log('[Blocker] No active task ID found');
      return {};
    }

    // Get all tasks
    const { bmo_tasks } = await chrome.storage.local.get('bmo_tasks');
    if (!bmo_tasks) {
      console.log('[Blocker] No tasks found in storage');
      return {};
    }

    let tasks;
    try {
      // Handle both string and object formats
      tasks = typeof bmo_tasks === 'string' ? JSON.parse(bmo_tasks) : bmo_tasks;
    } catch (e) {
      console.error('[Blocker] Failed to parse tasks:', e, bmo_tasks);
      return {};
    }

    const activeTask = tasks.find(t => t.id === bmo_activeTaskId);

    if (!activeTask) {
      console.log('[Blocker] Active task not found:', bmo_activeTaskId);
      return {};
    }

    if (!activeTask.allowedDomains || activeTask.allowedDomains.length === 0) {
      console.log('[Blocker] No allowed domains for task:', activeTask.title, '- ALLOWING ALL');
      return {};
    }

    // Check if current URL is in session allowlist (temp allows)
    const sessionAllowlist = state.sessionAllowlist || [];
    const requestUrl = new URL(details.url);
    const requestHostname = requestUrl.hostname;
    
    // Remove www prefix for matching
    const normalizedHostname = requestHostname.replace(/^www\./, '');

    console.log('[Blocker] Blocking check for:', {
      requestedDomain: normalizedHostname,
      allowedDomains: activeTask.allowedDomains,
      requestUrl: details.url
    });

    // 1. Check if destination is directly in allowed domains
    const isDirectlyAllowed = isHostnameAllowed(normalizedHostname, activeTask.allowedDomains) ||
      sessionAllowlist.some(domain => isHostnameAllowed(normalizedHostname, [domain]));
    
    console.log('[Blocker] Destination directly allowed:', isDirectlyAllowed);

    // 2. Check if coming from an allowed domain (trusted bubble via tab tracking)
    let isFromTrustedSite = false;
    const tabHostname = tabOrigins.get(details.tabId);
    
    if (tabHostname) {
      isFromTrustedSite = isHostnameAllowed(tabHostname, activeTask.allowedDomains);
      console.log('[Blocker] Tab is on:', tabHostname, '- Trusted:', isFromTrustedSite);
    } else {
      console.log('[Blocker] Tab not tracked or no history');
    }
    
    // 3. Check if coming from an allowed domain via URL referrer (backup check)
    let isFromReferrer = false;
    if (details.initiator) {
      try {
        const initiatorUrl = new URL(details.initiator);
        const initiatorHostname = initiatorUrl.hostname;
        isFromReferrer = isHostnameAllowed(initiatorHostname, activeTask.allowedDomains);
        console.log('[Blocker] Request initiated from:', initiatorHostname, '- Allowed:', isFromReferrer);
      } catch (e) {
        console.log('[Blocker] Could not parse initiator:', details.initiator);
      }
    }
    
    // Allow if: destination is directly allowed OR coming from trusted site (clicking links inside allowed domain)
    const shouldAllow = isDirectlyAllowed || isFromTrustedSite || isFromReferrer;
    console.log('[Blocker] Final decision:', { isDirectlyAllowed, isFromTrustedSite, isFromReferrer, shouldAllow });

    if (!shouldAllow) {
      console.log('[Blocker] BLOCKED:', normalizedHostname);
      
      // Get character SVG for task color
      const taskColor = activeTask.color || '#4ECDC4';
      const charSvg = CHARACTER_SVGS[taskColor] || CHARACTER_SVGS['#4ECDC4'];

      // Prepare data for blocking page
      await chrome.storage.local.set({
        blockedData: {
          mode: state.mode,
          timeRemaining: formatTimeRemaining(state.endTime),
          sessionInfo: `Session ${state.sessionInCurrentRound + 1}/${state.settings.sessionsPerRound}`,
          taskName: activeTask.title,
          streak: activeTask.dailyStreak || 0,
          charSvg: charSvg,
          domain: requestHostname,
          cracks: (state.blockAttempts || 0)
        }
      });

      // Increment block attempts for this session
      await saveState({ blockAttempts: (state.blockAttempts || 0) + 1 });

      // Navigate the tab to blocking page (MV3 approach)
      const blockingPageUrl = chrome.runtime.getURL('blocked.html') +
        '?domain=' + encodeURIComponent(requestHostname) +
        '&taskId=' + encodeURIComponent(bmo_activeTaskId);
      
      chrome.tabs.update(details.tabId, { url: blockingPageUrl });
    }
  },
  { url: [{ urlMatches: '.*' }] }
);
  console.log('[BMO] webNavigation listener registered successfully!');
} catch (e) {
  console.error('[BMO] Failed to register webNavigation listener:', e);
}

function formatTimeRemaining(endTime) {
  if (!endTime) return '25:00';
  const ms = Math.max(0, endTime - Date.now());
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

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

    // ── Allowed World Blocker ──────────────────────────────────────────────────
    case 'playBlockSound': {
      // Sound would play here (currently no-op, implement in React layer)
      return { ok: true };
    }

    case 'allowDomainTemporarily': {
      const { domain } = msg;
      const current = await getState();
      const sessionAllowlist = current.sessionAllowlist || [];
      if (!sessionAllowlist.includes(domain)) {
        sessionAllowlist.push(domain);
        await saveState({ sessionAllowlist });
      }
      return { ok: true };
    }

    default:
      return { ok: false, error: `Unknown message type: ${msg.type}` };
  }
}
