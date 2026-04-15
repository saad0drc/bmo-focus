// Character SVGs for blocked page - extracted from React component
const CHARACTER_SVGS = {
  '#4ECDC4': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
    <!-- BMO Screen/Body -->
    <rect x="20" y="20" width="216" height="216" rx="24" fill="#4ECDC4" stroke="#1F4E5A" stroke-width="8"/>
    <!-- Screen Display -->
    <rect x="40" y="40" width="176" height="176" rx="16" fill="#E8F5E9" stroke="#1F4E5A" stroke-width="6"/>
    <!-- Left Eye -->
    <g>
      <rect x="55" y="65" width="45" height="55" rx="4" fill="#1F4E5A"/>
      <rect x="62" y="72" width="18" height="22" fill="#E8F5E9" rx="2"/>
      <circle cx="71" cy="83" r="4" fill="#1F4E5A"/>
    </g>
    <!-- Right Eye -->
    <g>
      <rect x="156" y="65" width="45" height="55" rx="4" fill="#1F4E5A"/>
      <rect x="163" y="72" width="18" height="22" fill="#E8F5E9" rx="2"/>
      <circle cx="172" cy="83" r="4" fill="#1F4E5A"/>
    </g>
    <!-- Mouth - happy curve -->
    <path d="M 70 130 Q 128 150 186 130" stroke="#1F4E5A" stroke-width="8" fill="none" stroke-linecap="round"/>
    <!-- Buttons on side -->
    <circle cx="35" cy="140" r="6" fill="#1F4E5A"/>
    <circle cx="35" cy="165" r="6" fill="#1F4E5A"/>
  </svg>`,

  '#5B9BD5': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
    <!-- Hat - fluffy top -->
    <path d="M 50 120 Q 50 40 128 30 Q 206 40 206 120" fill="white" stroke="#1F4E5A" stroke-width="8"/>
    <rect x="50" y="110" width="156" height="20" fill="white" stroke="#1F4E5A" stroke-width="8"/>
    <rect x="70" y="100" width="116" height="15" fill="#5B9BD5" stroke="#1F4E5A" stroke-width="3"/>
    <!-- Head/Face -->
    <circle cx="128" cy="150" r="85" fill="#5B9BD5" stroke="#1F4E5A" stroke-width="8"/>
    <!-- Face skin -->
    <circle cx="128" cy="160" r="65" fill="#FFD9B3"/>
    <!-- Left Eye -->
    <g>
      <rect x="75" y="125" width="32" height="40" rx="4" fill="#1F4E5A"/>
      <rect x="82" y="133" width="12" height="16" fill="white" rx="2"/>
      <circle cx="88" cy="141" r="3" fill="#1F4E5A"/>
    </g>
    <!-- Right Eye -->
    <g>
      <rect x="149" y="125" width="32" height="40" rx="4" fill="#1F4E5A"/>
      <rect x="156" y="133" width="12" height="16" fill="white" rx="2"/>
      <circle cx="162" cy="141" r="3" fill="#1F4E5A"/>
    </g>
    <!-- Happy Smile -->
    <path d="M 90 175 Q 128 195 166 175" stroke="#1F4E5A" stroke-width="8" fill="none" stroke-linecap="round"/>
  </svg>`,

  '#FF9F1C': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
    <!-- Jake Head -->
    <circle cx="128" cy="140" r="100" fill="#FF9F1C" stroke="#1F4E5A" stroke-width="8"/>
    <!-- Ears -->
    <ellipse cx="50" cy="80" rx="35" ry="50" fill="#FF9F1C" stroke="#1F4E5A" stroke-width="8" transform="rotate(-20 50 80)"/>
    <ellipse cx="206" cy="80" rx="35" ry="50" fill="#FF9F1C" stroke="#1F4E5A" stroke-width="8" transform="rotate(20 206 80)"/>
    <!-- Snout -->
    <ellipse cx="128" cy="160" rx="60" ry="55" fill="#FFB84D" stroke="#1F4E5A" stroke-width="6"/>
    <!-- Nose -->
    <circle cx="128" cy="145" r="20" fill="#1F4E5A"/>
    <!-- Left Eye -->
    <g>
      <circle cx="90" cy="110" r="22" fill="#1F4E5A"/>
      <circle cx="95" cy="108" r="8" fill="white"/>
    </g>
    <!-- Right Eye -->
    <g>
      <circle cx="166" cy="110" r="22" fill="#1F4E5A"/>
      <circle cx="171" cy="108" r="8" fill="white"/>
    </g>
    <!-- Tongue/Smile -->
    <ellipse cx="128" cy="175" rx="25" ry="15" fill="#FF5E5E"/>
  </svg>`,

  '#FF69B4': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
    <!-- Head -->
    <circle cx="128" cy="140" r="90" fill="#FF69B4" stroke="#1F4E5A" stroke-width="8"/>
    <!-- Crown - 3 peaks -->
    <polygon points="60,100 40,30 85,80" fill="#FFD700" stroke="#1F4E5A" stroke-width="6"/>
    <polygon points="128,60 100,10 156,60" fill="#FFD700" stroke="#1F4E5A" stroke-width="6"/>
    <polygon points="196,100 216,30 171,80" fill="#FFD700" stroke="#1F4E5A" stroke-width="6"/>
    <!-- Face -->
    <circle cx="128" cy="150" r="70" fill="#FFB6D9"/>
    <!-- Left Eye -->
    <circle cx="95" cy="130" r="20" fill="#1F4E5A"/>
    <circle cx="100" cy="128" r="7" fill="white"/>
    <!-- Right Eye -->
    <circle cx="161" cy="130" r="20" fill="#1F4E5A"/>
    <circle cx="166" cy="128" r="7" fill="white"/>
    <!-- Sweet Smile -->
    <path d="M 95 165 Q 128 185 161 165" stroke="#1F4E5A" stroke-width="8" fill="none" stroke-linecap="round"/>
  </svg>`,

  '#6BCB77': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
    <!-- Body -->
    <rect x="30" y="100" width="196" height="140" rx="24" fill="#6BCB77" stroke="#1F4E5A" stroke-width="8"/>
    <!-- Head -->
    <circle cx="128" cy="80" r="70" fill="#6BCB77" stroke="#1F4E5A" stroke-width="8"/>
    <!-- Left Eye -->
    <circle cx="95" cy="60" r="18" fill="#1F4E5A"/>
    <circle cx="100" cy="58" r="6" fill="white"/>
    <!-- Right Eye -->
    <circle cx="161" cy="60" r="18" fill="#1F4E5A"/>
    <circle cx="166" cy="58" r="6" fill="white"/>
    <!-- Happy Mouth -->
    <path d="M 100 85 Q 128 100 156 85" stroke="#1F4E5A" stroke-width="8" fill="none" stroke-linecap="round"/>
    <!-- Buttons -->
    <circle cx="60" cy="160" r="10" fill="#1F4E5A"/>
    <circle cx="60" cy="200" r="10" fill="#1F4E5A"/>
  </svg>`,

  '#FFD93D': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
    <!-- Star shape body -->
    <polygon points="128,20 155,90 230,90 182,145 205,215 128,160 51,215 74,145 26,90 101,90" fill="#FFD93D" stroke="#1F4E5A" stroke-width="8"/>
    <!-- Left Eye -->
    <circle cx="100" cy="100" r="16" fill="#1F4E5A"/>
    <circle cx="105" cy="98" r="5" fill="white"/>
    <!-- Right Eye -->
    <circle cx="156" cy="100" r="16" fill="#1F4E5A"/>
    <circle cx="161" cy="98" r="5" fill="white"/>
    <!-- Happy expression -->
    <path d="M 105 135 Q 128 150 151 135" stroke="#1F4E5A" stroke-width="6" fill="none" stroke-linecap="round"/>
  </svg>`,

  '#FF5E5E': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
    <!-- Angry face -->
    <circle cx="128" cy="140" r="110" fill="#FF5E5E" stroke="#1F4E5A" stroke-width="8"/>
    <!-- Spiky hair -->
    <polygon points="128,20 140,50 160,30 170,60 200,35 180,75 220,65 175,100" fill="#FF5E5E" stroke="#1F4E5A" stroke-width="6"/>
    <polygon points="128,20 116,50 96,30 86,60 56,35 76,75 36,65 81,100" fill="#FF5E5E" stroke="#1F4E5A" stroke-width="6"/>
    <!-- Left Eye - angry -->
    <g>
      <rect x="80" y="110" width="32" height="28" rx="4" fill="#1F4E5A"/>
      <rect x="86" y="115" width="10" height="10" fill="white"/>
      <path d="M 110 120 L 95 115" stroke="#1F4E5A" stroke-width="3" stroke-linecap="round"/>
    </g>
    <!-- Right Eye - angry -->
    <g>
      <rect x="144" y="110" width="32" height="28" rx="4" fill="#1F4E5A"/>
      <rect x="160" y="115" width="10" height="10" fill="white"/>
      <path d="M 146 120 L 161 115" stroke="#1F4E5A" stroke-width="3" stroke-linecap="round"/>
    </g>
    <!-- Angry mouth -->
    <path d="M 95 175 Q 128 160 161 175" stroke="#1F4E5A" stroke-width="8" fill="none" stroke-linecap="round"/>
  </svg>`,
};

function getCharacterSvg(colorHex) {
  return CHARACTER_SVGS[colorHex] || CHARACTER_SVGS['#4ECDC4']; // Default to BMO
}
