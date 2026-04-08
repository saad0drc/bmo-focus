// SVG character icons - BOLD, FILLS ENTIRE SPACE like Odin Project/ALX logos
const characterSVGs: { [key: string]: string } = {
  '#4ECDC4': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
    <!-- BMO - fills entire canvas -->
    <rect x="0" y="0" width="256" height="256" rx="20" fill="#4ECDC4" stroke="#1F4E5A" stroke-width="20"/>
    <!-- Screen display -->
    <rect x="30" y="30" width="196" height="196" rx="15" fill="#E8F5E9" stroke="#1F4E5A" stroke-width="8"/>
    <!-- Eyes - HUGE -->
    <rect x="60" y="70" width="50" height="60" fill="#1F4E5A"/>
    <rect x="146" y="70" width="50" height="60" fill="#1F4E5A"/>
    <!-- Pupils -->
    <rect x="75" y="85" width="20" height="30" fill="#E8F5E9"/>
    <rect x="161" y="85" width="20" height="30" fill="#E8F5E9"/>
    <!-- Mouth - thick line -->
    <line x1="80" y1="150" x2="176" y2="150" stroke="#1F4E5A" stroke-width="14" stroke-linecap="round"/>
  </svg>`,
  
  '#5B9BD5': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
    <!-- Finn head - HUGE circle -->
    <circle cx="128" cy="130" r="105" fill="#5B9BD5" stroke="#1F4E5A" stroke-width="18"/>
    <!-- Hat - fills top half -->
    <polygon points="128,0 50,80 206,80" fill="white" stroke="#1F4E5A" stroke-width="12"/>
    <!-- Blue stripe on hat - thick -->
    <rect x="80" y="40" width="96" height="24" fill="#5B9BD5" stroke="#1F4E5A" stroke-width="3"/>
    <!-- Face skin -->
    <circle cx="128" cy="150" r="70" fill="#FFD9B3"/>
    <!-- Eyes - HUGE squares -->
    <rect x="80" y="110" width="35" height="40" fill="#1F4E5A"/>
    <rect x="141" y="110" width="35" height="40" fill="#1F4E5A"/>
    <!-- Mouth - thick line -->
    <line x1="90" y1="170" x2="166" y2="170" stroke="#1F4E5A" stroke-width="10" stroke-linecap="round"/>
  </svg>`,
  
  '#FF9F1C': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
    <!-- Jake head - HUGE -->
    <circle cx="128" cy="130" r="110" fill="#FF9F1C" stroke="#1F4E5A" stroke-width="18"/>
    <!-- Left ear - HUGE triangle -->
    <polygon points="50,40 15,-5 65,80" fill="#FF9F1C" stroke="#1F4E5A" stroke-width="10"/>
    <!-- Right ear - HUGE triangle -->
    <polygon points="206,40 240,-5 191,80" fill="#FF9F1C" stroke="#1F4E5A" stroke-width="10"/>
    <!-- Snout -->
    <ellipse cx="128" cy="155" rx="65" ry="60" fill="#FFB84D" stroke="#1F4E5A" stroke-width="8"/>
    <!-- Nose - LARGE -->
    <circle cx="128" cy="145" r="22" fill="#1F4E5A"/>
    <!-- Eyes - HUGE -->
    <circle cx="90" cy="80" r="24" fill="#1F4E5A"/>
    <circle cx="166" cy="80" r="24" fill="#1F4E5A"/>
  </svg>`,
  
  '#FF69B4': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
    <!-- Head - HUGE -->
    <circle cx="128" cy="130" r="105" fill="#FF69B4" stroke="#1F4E5A" stroke-width="18"/>
    <!-- Crown points - HUGE peaks -->
    <polygon points="40,80 0,-20 80,100" fill="#FFD700" stroke="#1F4E5A" stroke-width="12"/>
    <polygon points="128,40 100,-20 156,80" fill="#FFD700" stroke="#1F4E5A" stroke-width="12"/>
    <polygon points="216,80 255,-20 176,100" fill="#FFD700" stroke="#1F4E5A" stroke-width="12"/>
    <!-- Face -->
    <circle cx="128" cy="150" r="75" fill="#FFB6D9"/>
    <!-- Eyes - HUGE -->
    <circle cx="95" cy="125" r="22" fill="#1F4E5A"/>
    <circle cx="161" cy="125" r="22" fill="#1F4E5A"/>
    <!-- Mouth - thick line -->
    <line x1="85" y1="175" x2="171" y2="175" stroke="#1F4E5A" stroke-width="10" stroke-linecap="round"/>
  </svg>`,
  
  '#9D4EDD': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
    <!-- Head - HUGE -->
    <circle cx="128" cy="130" r="105" fill="#9D4EDD" stroke="#1F4E5A" stroke-width="18"/>
    <!-- Horns - HUGE triangles -->
    <polygon points="50,30 0,-20 70,100" fill="#6B2E8F" stroke="#1F4E5A" stroke-width="12"/>
    <polygon points="206,30 255,-20 186,100" fill="#6B2E8F" stroke="#1F4E5A" stroke-width="12"/>
    <!-- Face -->
    <circle cx="128" cy="150" r="70" fill="#B59FFF"/>
    <!-- Eyes - red and HUGE -->
    <rect x="85" y="115" width="30" height="45" fill="#FF0000"/>
    <rect x="141" y="115" width="30" height="45" fill="#FF0000"/>
    <!-- Mouth - thick line -->
    <line x1="95" y1="175" x2="161" y2="175" stroke="#6B2E8F" stroke-width="10" stroke-linecap="round"/>
  </svg>`,
  
  '#00D9FF': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
    <!-- Wizard hat - HUGE cone fills top -->
    <polygon points="128,0 20,180 236,180" fill="#00D9FF" stroke="#0099CC" stroke-width="14"/>
    <!-- Band on hat -->
    <rect x="20" y="160" width="216" height="35" fill="#FFD700" stroke="#1F4E5A" stroke-width="6"/>
    <!-- Face - HUGE -->
    <circle cx="128" cy="185" r="75" fill="#FFD9B3" stroke="#1F4E5A" stroke-width="8"/>
    <!-- Beard - thick lines -->
    <line x1="60" y1="225" x2="196" y2="225" stroke="#E8D5FF" stroke-width="10"/>
    <line x1="70" y1="245" x2="186" y2="245" stroke="#E8D5FF" stroke-width="8"/>
    <!-- Eyes - HUGE squares -->
    <rect x="85" y="160" width="25" height="32" fill="#1F4E5A"/>
    <rect x="146" y="160" width="25" height="32" fill="#1F4E5A"/>
  </svg>`,
  
  '#C77DFF': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
    <!-- Cloud-like body - FILLS ENTIRE SPACE -->
    <ellipse cx="60" cy="145" rx="85" ry="80" fill="#C77DFF" stroke="#1F4E5A" stroke-width="12"/>
    <ellipse cx="196" cy="145" rx="85" ry="80" fill="#C77DFF" stroke="#1F4E5A" stroke-width="12"/>
    <ellipse cx="128" cy="50" rx="85" ry="80" fill="#C77DFF" stroke="#1F4E5A" stroke-width="12"/>
    <!-- Eyes - HUGE -->
    <circle cx="95" cy="105" r="26" fill="#1F4E5A"/>
    <circle cx="161" cy="105" r="26" fill="#1F4E5A"/>
    <!-- Mouth - thick line -->
    <line x1="90" y1="170" x2="166" y2="170" stroke="#1F4E5A" stroke-width="10" stroke-linecap="round"/>
    <!-- Crown - HUGE peaks -->
    <polygon points="70,50 40,0 128,35 216,0 186,50" fill="#FFD700" stroke="#1F4E5A" stroke-width="6"/>
  </svg>`,
  
  '#6BCB77': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
    <!-- Blade - HUGE pointed sword -->
    <polygon points="128,0 95,110 100,256 156,256 161,110" fill="#6BCB77" stroke="#4A9D5F" stroke-width="12"/>
    <!-- Hilt -->
    <rect x="92" y="256" width="72" height="40" fill="#8B4513" stroke="#1F4E5A" stroke-width="6"/>
    <!-- Cross guard - HUGE -->
    <rect x="65" y="235" width="126" height="24" fill="#FFD700" stroke="#1F4E5A" stroke-width="5"/>
    <!-- Point highlight -->
    <polygon points="128,0 110,50 146,50" fill="#8FE387"/>
  </svg>`,
  
  '#FF5E5E': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
    <!-- Flames - HUGE angular fire -->
    <polygon points="128,10 85,130 95,190 128,256 161,190 171,130" fill="#FF5E5E" stroke="#FF2020" stroke-width="10"/>
    <!-- Inner flames - sharp yellow -->
    <polygon points="128,50 105,140 110,180 128,230 146,180 151,140" fill="#FFB347" stroke="#FF9500" stroke-width="4"/>
    <!-- Eyes - HUGE rectangles -->
    <rect x="95" y="120" width="24" height="32" fill="#1F4E5A"/>
    <rect x="137" y="120" width="24" height="32" fill="#1F4E5A"/>
  </svg>`,
};

// Dynamic favicon and tab title based on task color
export function setFaviconColor(color: string | null, taskName?: string) {
  // Get SVG for this color
  const svg = characterSVGs[color || '#4ECDC4'];
  
  if (svg) {
    // Convert SVG to data URL
    const svgData = encodeURIComponent(svg);
    const dataUrl = `data:image/svg+xml,${svgData}`;
    
    // Set favicon
    const faviconLink = document.querySelector("link[rel='icon']") as HTMLLinkElement;
    if (faviconLink) {
      faviconLink.href = dataUrl;
    } else {
      const link = document.createElement('link');
      link.rel = 'icon';
      link.href = dataUrl;
      document.head.appendChild(link);
    }
    
    // Update tab title - just task name, no emoji
    if (taskName) {
      document.title = `${taskName} - BMO Focus`;
    }
  }
}

export function resetFavicon() {
  setFaviconColor('#4ECDC4');
  document.title = 'BMO Focus';
}
