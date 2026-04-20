// Content script that runs on all pages
// 1. Tracks links clicked from allowed domains
// 2. Extracts all link destinations from current page for pre-allowing

console.log('[Content] ✅ Script started on:', window.location.href);

const currentHostname = new URL(window.location.href).hostname.replace(/^www\./, '');

// ── Part 1: Extract all link destinations from current page for pre-allowing ──
function extractAndPreallowLinks() {
  try {
    const allLinks = document.querySelectorAll('a[href]');
    const destinations = new Set();
    
    allLinks.forEach(link => {
      try {
        const href = link.href;
        if (href.startsWith('http://') || href.startsWith('https://')) {
          const url = new URL(href);
          const hostname = url.hostname.replace(/^www\./, '');
          
          // Only collect external links (different from current domain)
          if (hostname !== currentHostname) {
            destinations.add(hostname);
          }
        }
      } catch (e) {
        // Skip invalid URLs
      }
    });
    
    if (destinations.size > 0) {
      console.log('[Content] Found', destinations.size, 'external destinations from', currentHostname);
      
      // Store as pre-allowed destinations
      const preallowedData = {
        source: currentHostname,
        destinations: Array.from(destinations),
        timestamp: Date.now()
      };
      
      chrome.storage.session.set({
        [`preallowed_from_${currentHostname}`]: preallowedData
      }, () => {
        if (chrome.runtime.lastError) {
          console.log('[Content] ❌ Pre-allow storage write failed:', chrome.runtime.lastError);
        } else {
          console.log('[Content] ✅ Pre-allowed destinations stored:', Array.from(destinations));
        }
      });
    }
  } catch (e) {
    console.log('[Content] ❌ Error extracting links:', e.message);
  }
}

// Run on load and when new content appears
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', extractAndPreallowLinks);
} else {
  extractAndPreallowLinks();
}

// Also scan again after a delay in case content loaded dynamically
setTimeout(extractAndPreallowLinks, 1000);

console.log('[Content] ✅ Pre-allowed link extraction initialized');

// ── Part 2: Track clicks on links ──
console.log('[Content] ✅ Adding click listener...');

const clickHandler = (e) => {
  console.log('[Content] Click event fired', e.target);
  
  const link = e.target.closest('a[href]');
  if (!link) {
    console.log('[Content] Not a link click');
    return;
  }

  const href = link.href;
  console.log('[Content] Link found, href:', href);
  
  if (!href || href.startsWith('javascript:') || href.startsWith('mailto:')) {
    console.log('[Content] Link is javascript or mailto');
    return;
  }

  try {
    const targetUrl = new URL(href);
    const targetHostname = targetUrl.hostname.replace(/^www\./, '');
    
    const sourceUrl = new URL(window.location.href);
    const sourceHostname = sourceUrl.hostname.replace(/^www\./, '');
    
    console.log('[Content] ✅ LINK CLICKED from:', sourceHostname, 'to:', targetHostname);
    
    // Write to session storage IMMEDIATELY
    const clickData = {
      domain: targetHostname,
      timestamp: Date.now(),
      source: sourceHostname
    };
    
    console.log('[Content] Writing to storage:', `lastLinkClick_${targetHostname}`, clickData);
    
    chrome.storage.session.set({ 
      [`lastLinkClick_${targetHostname}`]: clickData 
    }, () => {
      if (chrome.runtime.lastError) {
        console.log('[Content] ❌ Storage write failed:', chrome.runtime.lastError);
      } else {
        console.log('[Content] ✅ Storage write successful');
      }
    });
    
  } catch (e) {
    console.log('[Content] ❌ Error:', e.message);
  }
};

document.addEventListener('click', clickHandler, true);
window.addEventListener('click', clickHandler, true);

// Only attach to body if it exists (defensive check to avoid null errors)
if (document.body) {
  document.body.addEventListener('click', clickHandler, true);
}

console.log('[Content] ✅ All listeners attached');
