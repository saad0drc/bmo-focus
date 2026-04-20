const STORAGE_KEY = 'bmo_timer_state';
const ALARM_NAME = 'bmo_pomodoro';
const AUTO_ADVANCE_DELAY_MS = 3000;

// Track current tab URLs by tabId for referrer detection
const tabUrls = {};

// Track referrers from HTTP headers for first-click detection
const requestReferrers = {};

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
  // After short break: advance to focus
  if (completedMode === 'shortBreak') return 'focus';
  
  // After long break: STOP (don't auto-advance)
  // User must manually start next round
  if (completedMode === 'longBreak') return 'longBreak'; // Placeholder, won't actually auto-start
  
  // completedMode === 'focus': calculate next break type
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
    // Round is complete if nextMode is longBreak (the actual indicator of round completion)
    const isRoundComplete = nextMode === 'longBreak';
    // Current session number (for display): sessionInRound is 0-indexed, so add 1
    const displaySessionNumber = sessionInRound + 1;
    // Remaining sessions: how many more until long break
    const remaining = isRoundComplete ? 0 : effectiveSessionsPerRound - displaySessionNumber;

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
const tabReferrers = new Map(); // tabId -> referrer hostname for blocking checks
const recentLinkClicks = new Map(); // destination domain -> timestamp (expires after 5s)

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Track on both 'loading' and 'complete' to catch the page as soon as possible
  if (tab.url) {
    try {
      const url = new URL(tab.url);
      // Only track real websites, not extension pages or special pages
      if (!url.protocol.startsWith('chrome') && !url.hostname.includes('newtab') && !url.hostname.includes('blocked')) {
        const hostname = url.hostname.replace(/^www\./, '');
        tabOrigins.set(tabId, hostname);
        // Store the hostname as referrer for the NEXT navigation
        tabReferrers.set(tabId, hostname);
        
        // During focus sessions, auto-add this domain to session allowlist if it's from an allowed domain
        const state = await getState();
        if (state.isActive) {
          const { bmo_activeTaskId } = await chrome.storage.local.get('bmo_activeTaskId');
          if (bmo_activeTaskId) {
            const { bmo_tasks } = await chrome.storage.local.get('bmo_tasks');
            if (bmo_tasks) {
              try {
                const tasks = typeof bmo_tasks === 'string' ? JSON.parse(bmo_tasks) : bmo_tasks;
                const activeTask = tasks.find(t => t.id === bmo_activeTaskId);
                if (activeTask && activeTask.allowedDomains) {
                  // If this page is from an allowed domain, add it to session allowlist
                  // This allows clicking links FROM this page to go anywhere
                  if (isHostnameAllowed(hostname, activeTask.allowedDomains)) {
                    const sessionAllowlist = state.sessionAllowlist || [];
                    // Don't add already-allowed domains to the list, but DO add this domain itself
                    // so links from allowed domains work
                    if (!sessionAllowlist.includes(hostname)) {
                      sessionAllowlist.push(hostname);
                      await saveState({ sessionAllowlist });
                      console.log('[BMO] Added to session allowlist (source domain):', hostname);
                    }
                  }
                }
              } catch (e) {
                console.log('[BMO] Error processing allowed domain:', e.message);
              }
            }
          }
        }
        
        console.log('[BMO] Tab updated (status=' + changeInfo.status + '):', tabId, '→', hostname, 'tabReferrers size:', tabReferrers.size);
      }
    } catch (e) {
      console.log('[BMO] Error in onUpdated:', e.message);
    }
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  tabOrigins.delete(tabId);
  tabReferrers.delete(tabId);
  delete tabUrls[tabId]; // Clean up tab URL tracking
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

// ── Extract links from a page and store as pre-allowed ──
async function extractAndStoreLinks(pageUrl, sourceHostname) {
  try {
    const response = await fetch(pageUrl);
    const html = await response.text();
    
    // Extract href values using regex
    const linkRegex = /href=["']([^"']+)["']/gi;
    const destinations = new Set();
    let match;
    
    while ((match = linkRegex.exec(html)) !== null) {
      try {
        const href = match[1];
        if (href.startsWith('http://') || href.startsWith('https://')) {
          const url = new URL(href);
          const hostname = url.hostname.replace(/^www\./, '');
          if (hostname !== sourceHostname) {
            destinations.add(hostname);
          }
        }
      } catch (e) {
        // Skip invalid URLs
      }
    }
    
    if (destinations.size > 0) {
      const preallowedData = {
        source: sourceHostname,
        destinations: Array.from(destinations),
        timestamp: Date.now()
      };
      
      await chrome.storage.session.set({
        [`preallowed_from_${sourceHostname}`]: preallowedData
      });
      
      console.log('[Blocker] ✅ Pre-allowed', destinations.size, 'destinations from', sourceHostname, ':', Array.from(destinations).slice(0, 5).join(', '));
    }
  } catch (e) {
    console.log('[Blocker] Could not extract links from', pageUrl, ':', e.message);
  }
}

// ── Capture HTTP Referer headers for first-click detection ─
try {
  chrome.webRequest.onBeforeSendHeaders.addListener(
    (details) => {
      if (details.frameId !== 0) return; // Only main frame
      
      const headers = details.requestHeaders || [];
      const refererHeader = headers.find(h => h.name.toLowerCase() === 'referer');
      
      if (refererHeader && refererHeader.value) {
        try {
          const refererUrl = new URL(refererHeader.value);
          const refererHostname = refererUrl.hostname.replace(/^www\./, '');
          const targetUrl = new URL(details.url);
          const targetHostname = targetUrl.hostname.replace(/^www\./, '');
          
          // Store referrer for this target domain
          requestReferrers[`${details.tabId}_${targetHostname}`] = {
            referrer: refererHostname,
            timestamp: Date.now()
          };
          console.log('[Blocker] HTTP Referer captured: from', refererHostname, '→', targetHostname);
        } catch (e) {
          console.log('[Blocker] Could not parse referer header:', e.message);
        }
      }
    },
    { urls: ['http://*/*', 'https://*/*'] },
    ['requestHeaders']
  );
} catch (e) {
  console.log('[Blocker] webRequest not available:', e.message);
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

    // Debug: Check each allowed domain match
    if (activeTask.allowedDomains && activeTask.allowedDomains.length > 0) {
      activeTask.allowedDomains.forEach(domain => {
        const normalizedDomain = extractHostname(domain);
        const exactMatch = normalizedHostname === normalizedDomain;
        const suffixMatch = normalizedHostname.endsWith('.' + normalizedDomain);
        console.log(`[Blocker] Domain check: "${normalizedHostname}" vs "${normalizedDomain}" (exact: ${exactMatch}, suffix: ${suffixMatch})`);
      });
    }

    // 1. Check if destination is directly in allowed domains
    const isDirectlyAllowed = isHostnameAllowed(normalizedHostname, activeTask.allowedDomains) ||
      sessionAllowlist.some(domain => isHostnameAllowed(normalizedHostname, [domain]));
    
     // 2. Check if destination is in pre-allowed list from allowed domains
    let isPreallowed = false;
    try {
      // Check all allowed domains to see if they have pre-allowed this destination
      for (const allowedDomain of activeTask.allowedDomains) {
        const normalizedAllowed = extractHostname(allowedDomain);
        const preallowedKey = `preallowed_from_${normalizedAllowed}`;
        const preallowedData = await chrome.storage.session.get(preallowedKey);
        
        if (preallowedData[preallowedKey]) {
          const { destinations, timestamp } = preallowedData[preallowedKey];
          const isWithinWindow = (Date.now() - timestamp) < 3600000; // 1 hour window
          
          if (isWithinWindow && destinations.includes(normalizedHostname)) {
            console.log('[Blocker] ✅ PREALLOWED: destination found in allowed domain:', normalizedAllowed);
            isPreallowed = true;
            break;
          }
        }
      }
    } catch (e) {
      console.log('[Blocker] Could not check pre-allowed list:', e.message);
    }
    
    // 3. Check if this was recently clicked from an allowed domain (via session storage from content script)
     let isRecentlyClicked = false;
     try {
       const clickData = await chrome.storage.session.get(`lastLinkClick_${normalizedHostname}`);
       const key = `lastLinkClick_${normalizedHostname}`;
       console.log('[Blocker] Checking session storage for key:', key, 'Data:', clickData[key]);
       if (clickData[key]) {
         const { domain, timestamp, source } = clickData[key];
         const isWithinWindow = (Date.now() - timestamp) < 5000;
         const isSourceAllowed = isHostnameAllowed(source, activeTask.allowedDomains);
         console.log('[Blocker] Click data found - source:', source, 'sourceAllowed:', isSourceAllowed, 'withinWindow:', isWithinWindow);
         
         if (isWithinWindow && isSourceAllowed) {
           console.log('[Blocker] Domain was recently clicked from allowed domain:', source, '→', domain);
           isRecentlyClicked = true;
           // Clean up
           await chrome.storage.session.remove(key);
         }
       }
     } catch (e) {
       console.log('[Blocker] Could not check session storage:', e.message);
     }
    
    // 4. Check if coming from an allowed domain via HTTP referer OR initiator
    let isFromReferrer = false;
    
    // PRIMARY: Check HTTP Referer header (captured via onBeforeSendHeaders)
    const refererKey = `${details.tabId}_${normalizedHostname}`;
    if (requestReferrers[refererKey]) {
      const { referrer, timestamp } = requestReferrers[refererKey];
      const isWithinWindow = (Date.now() - timestamp) < 1000; // 1 second window for header capture
      isFromReferrer = isWithinWindow && isHostnameAllowed(referrer, activeTask.allowedDomains);
      if (isFromReferrer) {
        console.log('[Blocker] ✅ HTTP Referer ALLOWED:', referrer, '→', normalizedHostname);
        delete requestReferrers[refererKey]; // Clean up
      } else {
        console.log('[Blocker] HTTP Referer available but not allowed:', referrer);
      }
    }
    
    // Debug: Check what initiator value we have
    console.log('[Blocker] Initiator available:', !!details.initiator, 'Value:', details.initiator);
    
    // SECONDARY: Check details.initiator (immediate source of navigation)
    if (!isFromReferrer && details.initiator) {
      try {
        const initiatorUrl = new URL(details.initiator);
        const initiatorHostname = initiatorUrl.hostname.replace(/^www\./, '');
        isFromReferrer = isHostnameAllowed(initiatorHostname, activeTask.allowedDomains);
        console.log('[Blocker] Request initiated from:', initiatorHostname, '- Allowed:', isFromReferrer);
      } catch (e) {
        console.log('[Blocker] Could not parse initiator:', details.initiator);
      }
    }
    
    // FALLBACK: Check tab's previous URL from tabUrls tracking
    // This handles cases where initiator is not available
    if (!isFromReferrer && tabUrls[details.tabId]) {
      try {
        const referrerUrl = new URL(tabUrls[details.tabId]);
        const referrerHostname = referrerUrl.hostname.replace(/^www\./, '');
        isFromReferrer = isHostnameAllowed(referrerHostname, activeTask.allowedDomains);
        if (isFromReferrer) {
          console.log('[Blocker] Request from tab referrer (tab history):', referrerHostname);
        }
      } catch (e) {
        console.log('[Blocker] Could not parse tab URL:', tabUrls[details.tabId]);
      }
    }
    
    // FALLBACK 2: Check if last navigation was recent (within 5 seconds) and from allowed domain
    // This handles cases where initiator is not available and tabUrls not set yet
    if (!isFromReferrer && state.lastNavigatedUrl && state.lastNavigatedTimestamp) {
      const timeSinceLastNav = Date.now() - state.lastNavigatedTimestamp;
      if (timeSinceLastNav < 5000) { // 5 second window
        try {
          const referrerUrl = new URL(state.lastNavigatedUrl);
          const referrerHostname = referrerUrl.hostname.replace(/^www\./, '');
          isFromReferrer = isHostnameAllowed(referrerHostname, activeTask.allowedDomains);
          if (isFromReferrer) {
            console.log('[Blocker] Request came from allowed domain (within 5s window):', referrerHostname);
          }
        } catch (e) {
          console.log('[Blocker] Could not parse lastNavigatedUrl:', state.lastNavigatedUrl);
        }
      }
    }
    
    // Allow if: destination is directly allowed OR preallowed OR recently clicked OR came from allowed initiator
    const shouldAllow = isDirectlyAllowed || isPreallowed || isRecentlyClicked || isFromReferrer;
    console.log('[Blocker] Final decision reasons: directlyAllowed=%s, preallowed=%s, recentlyClicked=%s, fromReferrer=%s', 
      isDirectlyAllowed, isPreallowed, isRecentlyClicked, isFromReferrer);
    console.log('[Blocker] Final decision:', { isDirectlyAllowed, isPreallowed, isRecentlyClicked, isFromReferrer, shouldAllow });

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
  
  // Track successful navigations and extract links from allowed domains
  chrome.webNavigation.onCommitted.addListener(
    async (details) => {
      if (details.frameId !== 0) return; // Only track main frame
      const state = await getState();
      if (state.isActive) {
        // Store the URL in memory by tabId for immediate referrer detection
        tabUrls[details.tabId] = details.url;
        console.log('[Blocker] Tab', details.tabId, 'navigated to:', details.url);
        
        // Also store in state for fallback checking
        await saveState({ 
          lastNavigatedUrl: details.url,
          lastNavigatedTimestamp: Date.now()
        });
        
        // If this is an allowed domain, extract links from it
        try {
          const { bmo_activeTaskId } = await chrome.storage.local.get('bmo_activeTaskId');
          const { bmo_tasks } = await chrome.storage.local.get('bmo_tasks');
          
          if (bmo_activeTaskId && bmo_tasks) {
            const tasks = typeof bmo_tasks === 'string' ? JSON.parse(bmo_tasks) : bmo_tasks;
            const activeTask = tasks.find(t => t.id === bmo_activeTaskId);
            
            if (activeTask && activeTask.allowedDomains) {
              const navigatedUrl = new URL(details.url);
              const navigatedHostname = navigatedUrl.hostname.replace(/^www\./, '');
              const isAllowedDomain = activeTask.allowedDomains.some(d => {
                const normalized = extractHostname(d);
                return navigatedHostname === normalized || navigatedHostname.endsWith('.' + normalized);
              });
              
              if (isAllowedDomain) {
                console.log('[Blocker] Extracting links from allowed domain:', navigatedHostname);
                extractAndStoreLinks(details.url, navigatedHostname);
              }
            }
          }
        } catch (e) {
          console.log('[Blocker] Could not extract links:', e.message);
        }
      }
    },
    { url: [{ urlMatches: '.*' }] }
  );
  
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
      
      // Pre-extract links from all allowed domains when focus starts
      try {
        const { bmo_activeTaskId } = await chrome.storage.local.get('bmo_activeTaskId');
        const { bmo_tasks } = await chrome.storage.local.get('bmo_tasks');
        
        if (bmo_activeTaskId && bmo_tasks) {
          const tasks = typeof bmo_tasks === 'string' ? JSON.parse(bmo_tasks) : bmo_tasks;
          const activeTask = tasks.find(t => t.id === bmo_activeTaskId);
          
          if (activeTask && activeTask.allowedDomains) {
            console.log('[Blocker] 🚀 Pre-extracting links from allowed domains...');
            for (const allowedDomain of activeTask.allowedDomains) {
              const hostname = extractHostname(allowedDomain);
              const pageUrl = `https://${hostname}`;
              // Fire and forget - extract in background
              extractAndStoreLinks(pageUrl, hostname).catch(e => {
                console.log('[Blocker] Pre-extract failed for', hostname, ':', e.message);
              });
            }
          }
        }
      } catch (e) {
        console.log('[Blocker] Could not pre-extract links:', e.message);
      }
      
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

    case 'LINK_CLICKED': {
      // Content script detected a link click
      // If the source is an allowed domain, mark the target for temporary allowance
      console.log('[Blocker] LINK_CLICKED received: from', msg.sourceHostname, 'to', msg.targetDomain);
      const { sourceHostname, targetDomain } = msg;
      const current = await getState();
      const { bmo_activeTaskId } = await chrome.storage.local.get('bmo_activeTaskId');
      
      console.log('[Blocker] Active task:', bmo_activeTaskId, 'isActive:', current.isActive);
      
      if (!bmo_activeTaskId || !current.isActive) {
        return { ok: true }; // Not in a focus session, allow any navigation
      }

      // Get active task
      const { bmo_tasks } = await chrome.storage.local.get('bmo_tasks');
      if (!bmo_tasks) return { ok: true };
      
      try {
        const tasks = typeof bmo_tasks === 'string' ? JSON.parse(bmo_tasks) : bmo_tasks;
        const activeTask = tasks.find(t => t.id === bmo_activeTaskId);
        
        if (!activeTask || !activeTask.allowedDomains || activeTask.allowedDomains.length === 0) {
          return { ok: true }; // No domain restrictions
        }

        // Check if link came FROM an allowed domain
        const isSourceAllowed = isHostnameAllowed(sourceHostname, activeTask.allowedDomains);
        if (isSourceAllowed) {
          // User clicked a link FROM an allowed domain TO target
          // Mark target destination so we can allow the navigation within 5 seconds
          recentLinkClicks.set(targetDomain, Date.now());
          console.log('[Blocker] Marked link click FROM allowed domain to:', targetDomain);
        } else {
          console.log('[Blocker] Link click from non-allowed domain:', sourceHostname);
        }
      } catch (e) {
        console.error('[Blocker] Error processing LINK_CLICKED:', e);
      }
      
      return { ok: true };
    }

    default:
      return { ok: false, error: `Unknown message type: ${msg.type}` };
  }
}
