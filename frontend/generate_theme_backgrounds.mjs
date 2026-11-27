import fs from 'fs';
import path from 'path';

const outDir = path.resolve('src/assets/images');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Generates high quality, beautiful SVG backgrounds styled for empathy and mindfulness
const themes = {
  rich_town: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
  <defs>
    <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#14141d"/>
      <stop offset="40%" stop-color="#2a2228"/>
      <stop offset="70%" stop-color="#5a4136"/>
      <stop offset="100%" stop-color="#C5A46D" stop-opacity="0.85"/>
    </linearGradient>
    <radialGradient id="cityGlow" cx="50%" cy="80%" r="60%">
      <stop offset="0%" stop-color="#FFDE9E" stop-opacity="0.35"/>
      <stop offset="60%" stop-color="#C5A46D" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="bldgFar" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#3b3236"/>
      <stop offset="100%" stop-color="#1c161d"/>
    </linearGradient>
    <linearGradient id="bldgMid" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#262125"/>
      <stop offset="100%" stop-color="#110d14"/>
    </linearGradient>
    <linearGradient id="bldgNear" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#181519"/>
      <stop offset="100%" stop-color="#09070a"/>
    </linearGradient>
  </defs>

  <!-- Sky -->
  <rect width="1920" height="1080" fill="url(#skyGrad)"/>
  <rect width="1920" height="1080" fill="url(#cityGlow)"/>

  <!-- Distant Stars/City Lights -->
  <g fill="#FFF5D6" opacity="0.6">
    <circle cx="200" cy="180" r="1.5"/>
    <circle cx="450" cy="120" r="1"/>
    <circle cx="780" cy="220" r="1.5"/>
    <circle cx="1100" cy="140" r="1.2"/>
    <circle cx="1400" cy="190" r="1.5"/>
    <circle cx="1680" cy="110" r="1"/>
    <circle cx="1780" cy="260" r="1.8"/>
  </g>

  <!-- Golden Crescent Moon -->
  <circle cx="1620" cy="220" r="38" fill="#FFF2D6" opacity="0.85"/>
  <circle cx="1636" cy="214" r="34" fill="#241e24"/>

  <!-- Background Skyline (Far) -->
  <g fill="url(#bldgFar)" opacity="0.75">
    <rect x="80" y="520" width="110" height="560" rx="3"/>
    <rect x="230" y="460" width="130" height="620" rx="4"/>
    <polygon points="295,410 230,460 360,460"/>
    <rect x="420" y="550" width="90" height="530" rx="2"/>
    <rect x="560" y="490" width="140" height="590" rx="4"/>
    <rect x="740" y="440" width="120" height="640" rx="4"/>
    <line x1="800" y1="360" x2="800" y2="440" stroke="#C5A46D" stroke-width="3"/>
    <rect x="910" y="530" width="150" height="550" rx="3"/>
    <rect x="1100" y="470" width="130" height="610" rx="4"/>
    <polygon points="1165,390 1100,470 1230,470"/>
    <rect x="1280" y="510" width="110" height="570" rx="3"/>
    <rect x="1440" y="430" width="140" height="650" rx="4"/>
    <rect x="1630" y="520" width="120" height="560" rx="3"/>
    <rect x="1790" y="480" width="110" height="600" rx="3"/>
  </g>

  <!-- Midground Skyline -->
  <g fill="url(#bldgMid)">
    <rect x="0" y="620" width="140" height="460"/>
    <rect x="170" y="580" width="150" height="500" rx="4"/>
    <rect x="350" y="640" width="110" height="440"/>
    <rect x="490" y="560" width="160" height="520" rx="4"/>
    <rect x="680" y="600" width="130" height="480"/>
    <rect x="840" y="540" width="170" height="540" rx="5"/>
    <polygon points="925,480 840,540 1010,540"/>
    <rect x="1040" y="610" width="140" height="470"/>
    <rect x="1210" y="560" width="160" height="520" rx="4"/>
    <rect x="1400" y="590" width="150" height="490"/>
    <rect x="1580" y="550" width="170" height="530" rx="4"/>
    <rect x="1780" y="630" width="140" height="450"/>
  </g>

  <!-- Warm Illuminated Windows -->
  <g fill="#FBD894" opacity="0.6">
    <!-- Building 1 -->
    <rect x="195" y="610" width="12" height="16" rx="1"/>
    <rect x="225" y="610" width="12" height="16" rx="1"/>
    <rect x="275" y="610" width="12" height="16" rx="1"/>
    <rect x="195" y="650" width="12" height="16" rx="1"/>
    <rect x="250" y="650" width="12" height="16" rx="1"/>
    <rect x="275" y="690" width="12" height="16" rx="1"/>
    <!-- Building 2 -->
    <rect x="520" y="590" width="14" height="20" rx="1"/>
    <rect x="555" y="590" width="14" height="20" rx="1"/>
    <rect x="590" y="590" width="14" height="20" rx="1"/>
    <rect x="520" y="635" width="14" height="20" rx="1"/>
    <rect x="590" y="635" width="14" height="20" rx="1"/>
    <rect x="555" y="680" width="14" height="20" rx="1"/>
    <!-- Building 3 Center Tower -->
    <rect x="875" y="570" width="16" height="24" rx="2"/>
    <rect x="915" y="570" width="16" height="24" rx="2"/>
    <rect x="955" y="570" width="16" height="24" rx="2"/>
    <rect x="875" y="620" width="16" height="24" rx="2"/>
    <rect x="955" y="620" width="16" height="24" rx="2"/>
    <rect x="915" y="670" width="16" height="24" rx="2"/>
    <!-- Building 4 -->
    <rect x="1240" y="595" width="14" height="20" rx="1"/>
    <rect x="1310" y="595" width="14" height="20" rx="1"/>
    <rect x="1275" y="640" width="14" height="20" rx="1"/>
    <rect x="1310" y="640" width="14" height="20" rx="1"/>
    <!-- Building 5 -->
    <rect x="1615" y="580" width="15" height="22" rx="1"/>
    <rect x="1655" y="580" width="15" height="22" rx="1"/>
    <rect x="1695" y="580" width="15" height="22" rx="1"/>
    <rect x="1615" y="630" width="15" height="22" rx="1"/>
    <rect x="1695" y="630" width="15" height="22" rx="1"/>
  </g>

  <!-- Foreground Silhouettes & Gentle Water Reflection / Boulevard -->
  <path d="M0,820 Q480,780 960,820 T1920,820 L1920,1080 L0,1080 Z" fill="url(#bldgNear)"/>
  <path d="M0,880 Q480,850 960,880 T1920,880 L1920,1080 L0,1080 Z" fill="#08060a" opacity="0.9"/>
  <!-- Street Lights / Warm Bokeh -->
  <g fill="#C5A46D" opacity="0.4">
    <ellipse cx="280" cy="840" rx="40" ry="12"/>
    <ellipse cx="620" cy="850" rx="55" ry="15"/>
    <ellipse cx="980" cy="830" rx="70" ry="16"/>
    <ellipse cx="1340" cy="860" rx="60" ry="15"/>
    <ellipse cx="1700" cy="840" rx="50" ry="14"/>
  </g>
  <!-- Ambient Warm Mist overlay -->
  <rect width="1920" height="1080" fill="#C5A46D" opacity="0.06"/>
</svg>`,

  village: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
  <defs>
    <linearGradient id="vSky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#cfdcd3"/>
      <stop offset="50%" stop-color="#e8ede6"/>
      <stop offset="100%" stop-color="#fdfbf7"/>
    </linearGradient>
    <linearGradient id="vHillFar" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#9fb49a"/>
      <stop offset="100%" stop-color="#82966B"/>
    </linearGradient>
    <linearGradient id="vHillMid" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#73895e"/>
      <stop offset="100%" stop-color="#566943"/>
    </linearGradient>
    <linearGradient id="vHillNear" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#51643c"/>
      <stop offset="100%" stop-color="#3c4c2a"/>
    </linearGradient>
  </defs>

  <rect width="1920" height="1080" fill="url(#vSky)"/>

  <!-- Distant mountain peaks -->
  <path d="M0,640 L280,480 L520,620 L860,420 L1200,610 L1540,460 L1920,650 L1920,1080 L0,1080 Z" fill="#b2c4ad" opacity="0.45"/>

  <!-- Rolling Hills (Far) -->
  <path d="M0,680 Q450,560 920,650 T1920,640 L1920,1080 L0,1080 Z" fill="url(#vHillFar)" opacity="0.6"/>

  <!-- Midground with Cottages -->
  <path d="M0,740 Q580,630 1140,730 T1920,710 L1920,1080 L0,1080 Z" fill="url(#vHillMid)" opacity="0.8"/>

  <!-- Quaint Village Cottages -->
  <g transform="translate(480, 640)">
    <!-- Cottage 1 -->
    <rect x="0" y="30" width="70" height="45" fill="#f4ebd9" rx="2"/>
    <polygon points="-8,30 35,-5 78,30" fill="#99583d"/>
    <rect x="26" y="48" width="18" height="27" fill="#6d4327"/>
    <rect x="8" y="40" width="12" height="14" fill="#ffecb3"/>
    <rect x="50" y="40" width="12" height="14" fill="#ffecb3"/>
    <!-- Chimney -->
    <rect x="52" y="5" width="10" height="20" fill="#7a422b"/>
  </g>
  <g transform="translate(620, 665)">
    <!-- Cottage 2 -->
    <rect x="0" y="25" width="85" height="50" fill="#e8dfce" rx="2"/>
    <polygon points="-10,25 42,-8 95,25" fill="#824c36"/>
    <rect x="36" y="45" width="16" height="30" fill="#543725"/>
    <rect x="12" y="38" width="14" height="15" fill="#fff3c4"/>
    <rect x="60" y="38" width="14" height="15" fill="#fff3c4"/>
  </g>
  <g transform="translate(1320, 670)">
    <!-- Windmill / Tower -->
    <polygon points="35,0 15,80 65,80 45,0" fill="#ded4c1"/>
    <circle cx="40" cy="25" r="7" fill="#6d533f"/>
    <!-- Windmill Blades -->
    <line x1="40" y1="25" x2="10" y2="5" stroke="#5a422f" stroke-width="3"/>
    <line x1="40" y1="25" x2="70" y2="45" stroke="#5a422f" stroke-width="3"/>
    <line x1="40" y1="25" x2="20" y2="55" stroke="#5a422f" stroke-width="3"/>
    <line x1="40" y1="25" x2="60" y2="-5" stroke="#5a422f" stroke-width="3"/>
  </g>

  <!-- Foreground Rolling Green Meadow -->
  <path d="M0,820 Q480,720 1050,810 T1920,780 L1920,1080 L0,1080 Z" fill="url(#vHillNear)"/>

  <!-- Peaceful Trees & Foliage -->
  <g fill="#2e3d1f">
    <ellipse cx="260" cy="770" rx="35" ry="50"/>
    <ellipse cx="295" cy="760" rx="42" ry="60"/>
    <ellipse cx="340" cy="780" rx="30" ry="45"/>

    <ellipse cx="1020" cy="800" rx="45" ry="65"/>
    <ellipse cx="1070" cy="790" rx="55" ry="75"/>
    <ellipse cx="1120" cy="810" rx="40" ry="55"/>

    <ellipse cx="1680" cy="780" rx="50" ry="70"/>
    <ellipse cx="1740" cy="770" rx="60" ry="85"/>
  </g>

  <!-- Birds in the sky -->
  <g stroke="#617056" stroke-width="2.5" fill="none">
    <path d="M420,240 Q435,230 450,240 Q465,230 480,240"/>
    <path d="M470,220 Q482,212 494,220 Q506,212 518,220"/>
    <path d="M540,250 Q550,242 560,250 Q570,242 580,250"/>
  </g>
  <!-- Soft atmosphere -->
  <rect width="1920" height="1080" fill="#82966B" opacity="0.05"/>
</svg>`,

  cloudy: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
  <defs>
    <linearGradient id="cSky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#5c6a7e"/>
      <stop offset="45%" stop-color="#8999B0"/>
      <stop offset="75%" stop-color="#c1cbdb"/>
      <stop offset="100%" stop-color="#e3e7ee"/>
    </linearGradient>
    <radialGradient id="sunGlow" cx="65%" cy="30%" r="45%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.45"/>
      <stop offset="50%" stop-color="#d6e0ec" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#8999B0" stop-opacity="0"/>
    </radialGradient>
    <filter id="cBlur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="40"/>
    </filter>
  </defs>

  <rect width="1920" height="1080" fill="url(#cSky)"/>
  <rect width="1920" height="1080" fill="url(#sunGlow)"/>

  <!-- Distant Foggy Cloud Layers -->
  <g fill="#9cb0c9" opacity="0.45" filter="url(#cBlur)">
    <ellipse cx="300" cy="380" rx="420" ry="180"/>
    <ellipse cx="850" cy="320" rx="550" ry="210"/>
    <ellipse cx="1450" cy="360" rx="520" ry="200"/>
  </g>

  <!-- Mid Clouds -->
  <g fill="#b9c8db" opacity="0.7">
    <ellipse cx="200" cy="520" rx="360" ry="140"/>
    <ellipse cx="580" cy="460" rx="420" ry="170"/>
    <ellipse cx="1100" cy="480" rx="480" ry="180"/>
    <ellipse cx="1680" cy="510" rx="400" ry="150"/>
  </g>

  <!-- Billowing White Clouds with Depth -->
  <g fill="#edf2f8" opacity="0.88">
    <ellipse cx="400" cy="680" rx="420" ry="190"/>
    <ellipse cx="750" cy="620" rx="360" ry="170"/>
    <ellipse cx="1180" cy="640" rx="440" ry="190"/>
    <ellipse cx="1620" cy="690" rx="380" ry="180"/>
  </g>

  <!-- Foreground Soft Fog/Misty Landscape Base -->
  <path d="M0,860 Q480,820 960,860 T1920,850 L1920,1080 L0,1080 Z" fill="#6e7f97" opacity="0.75"/>
  <path d="M0,940 Q520,900 1020,940 T1920,930 L1920,1080 L0,1080 Z" fill="#556479" opacity="0.9"/>
  <!-- Ambient Tint -->
  <rect width="1920" height="1080" fill="#8999B0" opacity="0.08"/>
</svg>`,

  rainy: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
  <defs>
    <linearGradient id="rSky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#283944"/>
      <stop offset="50%" stop-color="#4c6370"/>
      <stop offset="85%" stop-color="#718D9B"/>
      <stop offset="100%" stop-color="#8ea3b0"/>
    </linearGradient>
    <linearGradient id="rainDropGrad" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0%" stop-color="#b6c8d4" stop-opacity="0.1"/>
      <stop offset="100%" stop-color="#d4e5f0" stop-opacity="0.6"/>
    </linearGradient>
  </defs>

  <rect width="1920" height="1080" fill="url(#rSky)"/>

  <!-- Dark Rainclouds at top -->
  <g fill="#212f38" opacity="0.7">
    <ellipse cx="250" cy="80" rx="450" ry="160"/>
    <ellipse cx="780" cy="60" rx="550" ry="180"/>
    <ellipse cx="1380" cy="70" rx="520" ry="170"/>
    <ellipse cx="1850" cy="90" rx="380" ry="150"/>
  </g>

  <!-- Distant Moody Fog -->
  <path d="M0,680 Q480,620 960,670 T1920,660 L1920,1080 L0,1080 Z" fill="#384c57" opacity="0.6"/>

  <!-- Wet Street/Lake Reflection Surface -->
  <path d="M0,820 Q480,790 960,820 T1920,810 L1920,1080 L0,1080 Z" fill="#24343d" opacity="0.85"/>
  <rect x="0" y="860" width="1920" height="220" fill="#18232a"/>

  <!-- Water Ripples -->
  <g stroke="#718D9B" stroke-width="1.8" fill="none" opacity="0.5">
    <ellipse cx="320" cy="920" rx="45" ry="10"/>
    <ellipse cx="320" cy="920" rx="80" ry="18"/>
    <ellipse cx="780" cy="960" rx="60" ry="14"/>
    <ellipse cx="780" cy="960" rx="110" ry="24"/>
    <ellipse cx="1250" cy="910" rx="50" ry="12"/>
    <ellipse cx="1250" cy="910" rx="95" ry="21"/>
    <ellipse cx="1680" cy="950" rx="55" ry="13"/>
  </g>

  <!-- Angled Diagonal Rain Streaks -->
  <g stroke="url(#rainDropGrad)" stroke-width="1.8" stroke-linecap="round">
    <!-- Far fine rain -->
    ${Array.from({ length: 90 }, (_, i) => {
      const x = (i * 27) % 1920;
      const y = (i * 47) % 800 + 50;
      return `<line x1="${x}" y1="${y}" x2="${x + 12}" y2="${y + 55}" />`;
    }).join('\n    ')}
    <!-- Closer pronounced rain -->
    ${Array.from({ length: 60 }, (_, i) => {
      const x = (i * 43 + 30) % 1920;
      const y = (i * 61 + 80) % 900;
      return `<line x1="${x}" y1="${y}" x2="${x + 16}" y2="${y + 75}" stroke-width="2.2" opacity="0.7"/>`;
    }).join('\n    ')}
  </g>
  <!-- Wet Glass Vignette & Atmospheric Overlay -->
  <rect width="1920" height="1080" fill="#718D9B" opacity="0.08"/>
</svg>`,

  zen_garden: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
  <defs>
    <linearGradient id="zSky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#b6bc9f"/>
      <stop offset="50%" stop-color="#d3d9c1"/>
      <stop offset="100%" stop-color="#eef2e1"/>
    </linearGradient>
    <linearGradient id="sandGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#dedecb"/>
      <stop offset="100%" stop-color="#c5c6b0"/>
    </linearGradient>
    <linearGradient id="rockGrad" x1="0.2" y1="0" x2="0.8" y2="1">
      <stop offset="0%" stop-color="#5e6653"/>
      <stop offset="60%" stop-color="#3d4336"/>
      <stop offset="100%" stop-color="#252a20"/>
    </linearGradient>
  </defs>

  <rect width="1920" height="1080" fill="url(#zSky)"/>

  <!-- Gentle Bamboo / Maple Silhouettes in distance -->
  <g fill="#8f9979" opacity="0.35">
    <path d="M120,450 C140,300 200,220 280,180 C260,260 270,350 260,450 Z"/>
    <path d="M220,460 C260,320 330,240 420,200 C390,290 380,380 350,470 Z"/>
    <path d="M1520,480 C1560,310 1660,230 1780,190 C1730,280 1700,380 1670,490 Z"/>
  </g>

  <!-- Distant Wooden Pagoda / Pavilion Fence -->
  <rect x="0" y="520" width="1920" height="12" fill="#525a47" opacity="0.5"/>
  <g fill="#525a47" opacity="0.4">
    ${Array.from({ length: 24 }, (_, i) => `<rect x="${i * 80 + 20}" y="480" width="8" height="52"/>`).join('\n    ')}
  </g>

  <!-- Raked Sand Garden Ground -->
  <path d="M0,600 Q960,570 1920,600 L1920,1080 L0,1080 Z" fill="url(#sandGrad)"/>

  <!-- Raked Concentric Sand Waves (Zen Patterns) -->
  <g stroke="#9ba385" stroke-width="2.5" fill="none" opacity="0.6">
    <!-- Around main rock group -->
    <ellipse cx="680" cy="820" rx="140" ry="50"/>
    <ellipse cx="680" cy="820" rx="190" ry="70"/>
    <ellipse cx="680" cy="820" rx="250" ry="92"/>
    <ellipse cx="680" cy="820" rx="320" ry="118"/>

    <!-- Around second rock -->
    <ellipse cx="1420" cy="860" rx="110" ry="40"/>
    <ellipse cx="1420" cy="860" rx="160" ry="58"/>
    <ellipse cx="1420" cy="860" rx="220" ry="78"/>

    <!-- Linear Sand Rake Lines across garden -->
    <path d="M0,680 Q960,650 1920,680"/>
    <path d="M0,740 Q960,710 1920,740"/>
    <path d="M0,940 Q960,910 1920,940"/>
    <path d="M0,1020 Q960,990 1920,1020"/>
  </g>

  <!-- Moss Island & Rocks (Left Primary Group) -->
  <ellipse cx="680" cy="820" rx="120" ry="42" fill="#707d5c"/>
  <path d="M600,820 C590,750 630,680 690,690 C750,700 790,770 770,830 Z" fill="url(#rockGrad)"/>
  <path d="M560,835 C550,790 580,750 620,760 C650,770 660,810 640,845 Z" fill="url(#rockGrad)" opacity="0.9"/>
  <path d="M740,835 C730,800 760,770 790,780 C820,790 830,820 810,845 Z" fill="url(#rockGrad)" opacity="0.85"/>

  <!-- Moss Island & Rock (Right Group) -->
  <ellipse cx="1420" cy="860" rx="90" ry="32" fill="#707d5c"/>
  <path d="M1360,865 C1350,810 1390,760 1440,770 C1490,780 1510,830 1490,875 Z" fill="url(#rockGrad)"/>

  <!-- Gentle Bamboo Water Fountain (Shishi-odoshi) Accent -->
  <rect x="240" y="730" width="14" height="110" rx="3" fill="#6c7857"/>
  <line x1="220" y1="760" x2="280" y2="780" stroke="#7e8c67" stroke-width="12" stroke-linecap="round"/>

  <!-- Peaceful Nature Tint -->
  <rect width="1920" height="1080" fill="#A1A889" opacity="0.06"/>
</svg>`,

  winter: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
  <defs>
    <linearGradient id="wSky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#648098"/>
      <stop offset="45%" stop-color="#8ba6bd"/>
      <stop offset="75%" stop-color="#A5BFD1"/>
      <stop offset="100%" stop-color="#ddebf3"/>
    </linearGradient>
    <linearGradient id="snowFar" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#b8d1e2"/>
      <stop offset="100%" stop-color="#9cb6c9"/>
    </linearGradient>
    <linearGradient id="snowMid" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#d6e8f4"/>
      <stop offset="100%" stop-color="#b4cddf"/>
    </linearGradient>
    <linearGradient id="snowNear" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f2f8fc"/>
      <stop offset="100%" stop-color="#d4e6f2"/>
    </linearGradient>
  </defs>

  <rect width="1920" height="1080" fill="url(#wSky)"/>

  <!-- Soft Pale Sun -->
  <circle cx="1380" cy="280" r="65" fill="#f8fdff" opacity="0.7"/>

  <!-- Distant Snow-Capped Alpine Mountain Peaks -->
  <polygon points="120,620 420,310 680,620" fill="url(#snowFar)"/>
  <polygon points="340,390 420,310 500,390 470,440 430,410 390,440" fill="#f6fbfe"/>

  <polygon points="560,650 920,260 1280,650" fill="url(#snowFar)"/>
  <polygon points="820,370 920,260 1020,370 980,430 930,390 870,440" fill="#ffffff"/>

  <polygon points="1150,630 1480,330 1810,630" fill="url(#snowFar)"/>
  <polygon points="1390,410 1480,330 1570,410 1530,460 1480,430 1440,460" fill="#f6fbfe"/>

  <!-- Frosty Pine Trees (Distant Silhouettes) -->
  <g fill="#4e687b" opacity="0.55">
    ${Array.from({ length: 28 }, (_, i) => {
      const x = i * 70 + 30;
      return `<polygon points="${x},590 ${x - 18},650 ${x + 18},650" />
              <polygon points="${x},620 ${x - 24},690 ${x + 24},690" />`;
    }).join('\n    ')}
  </g>

  <!-- Rolling Snow Drift (Mid) -->
  <path d="M0,720 Q540,640 1080,710 T1920,680 L1920,1080 L0,1080 Z" fill="url(#snowMid)"/>

  <!-- Crisp Snow Hill (Foreground) -->
  <path d="M0,820 Q620,740 1240,830 T1920,790 L1920,1080 L0,1080 Z" fill="url(#snowNear)"/>

  <!-- Elegant Frosty Pines in Foreground Left & Right -->
  <g fill="#374d5d">
    <!-- Left Pine -->
    <polygon points="260,640 230,710 290,710"/>
    <polygon points="260,690 215,770 305,770"/>
    <polygon points="260,750 200,840 320,840"/>
    <rect x="252" y="840" width="16" height="45" fill="#2d3f4d"/>
    <!-- Right Pine -->
    <polygon points="1680,660 1650,730 1710,730"/>
    <polygon points="1680,710 1635,790 1725,790"/>
    <polygon points="1680,770 1620,860 1740,860"/>
    <rect x="1672" y="860" width="16" height="40" fill="#2d3f4d"/>
  </g>
  <!-- Snow caps on foreground pines -->
  <path d="M260,640 L242,682 Q260,675 278,682 Z" fill="#ffffff"/>
  <path d="M260,690 L228,745 Q260,735 292,745 Z" fill="#ffffff"/>

  <!-- Falling Snowflakes -->
  <g fill="#ffffff" opacity="0.75">
    ${Array.from({ length: 80 }, (_, i) => {
      const cx = (i * 47 + 23) % 1920;
      const cy = (i * 73 + 15) % 1080;
      const r = (i % 3) * 0.9 + 1.2;
      return `<circle cx="${cx}" cy="${cy}" r="${r}" />`;
    }).join('\n    ')}
  </g>
  <!-- Icy Winter Tint -->
  <rect width="1920" height="1080" fill="#A5BFD1" opacity="0.06"/>
</svg>`,

  dreamy_night: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
  <defs>
    <linearGradient id="dnSky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#110d21"/>
      <stop offset="40%" stop-color="#231b3b"/>
      <stop offset="70%" stop-color="#443261"/>
      <stop offset="100%" stop-color="#9386B8"/>
    </linearGradient>
    <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.9"/>
      <stop offset="35%" stop-color="#DDD4F5" stop-opacity="0.4"/>
      <stop offset="70%" stop-color="#9386B8" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#231b3b" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="1920" height="1080" fill="url(#dnSky)"/>

  <!-- Constellations & Sparkling Stars -->
  <g fill="#ffffff">
    ${Array.from({ length: 120 }, (_, i) => {
      const cx = (i * 67 + 37) % 1920;
      const cy = (i * 89 + 17) % 700;
      const r = (i % 4 === 0) ? 2.2 : (i % 2 === 0 ? 1.5 : 1.0);
      const op = (i % 3 === 0) ? 0.9 : 0.6;
      return `<circle cx="${cx}" cy="${cy}" r="${r}" opacity="${op}"/>`;
    }).join('\n    ')}
  </g>

  <!-- Luminous Full Moon & Halo -->
  <circle cx="1450" cy="260" r="140" fill="url(#moonGlow)"/>
  <circle cx="1450" cy="260" r="48" fill="#FFF9E6"/>
  <circle cx="1435" cy="250" r="10" fill="#E8DEC5" opacity="0.4"/>
  <circle cx="1465" cy="275" r="14" fill="#E8DEC5" opacity="0.3"/>

  <!-- Dreamy Floating Nebula Clouds -->
  <g fill="#9386B8" opacity="0.35">
    <ellipse cx="400" cy="460" rx="460" ry="140"/>
    <ellipse cx="980" cy="410" rx="520" ry="160"/>
    <ellipse cx="1600" cy="480" rx="420" ry="130"/>
  </g>
  <g fill="#DDD4F5" opacity="0.2">
    <ellipse cx="650" cy="500" rx="380" ry="110"/>
    <ellipse cx="1320" cy="470" rx="420" ry="120"/>
  </g>

  <!-- Rolling Night Horizon (Mid) -->
  <path d="M0,740 Q520,660 1040,730 T1920,700 L1920,1080 L0,1080 Z" fill="#251c38" opacity="0.8"/>

  <!-- Calm Foreground Meadow with Fireflies -->
  <path d="M0,840 Q620,770 1240,850 T1920,810 L1920,1080 L0,1080 Z" fill="#130d21"/>

  <!-- Sleepy Lavender Stems & Wildflowers Silhouettes -->
  <g stroke="#2a1f42" stroke-width="2.5" fill="none">
    ${Array.from({ length: 30 }, (_, i) => {
      const x = i * 65 + 20;
      return `<line x1="${x}" y1="840" x2="${x + 6}" y2="780" />
              <circle cx="${x + 6}" cy="775" r="5" fill="#584379"/>`;
    }).join('\n    ')}
  </g>

  <!-- Glowing Fireflies / Magic Orbs -->
  <g fill="#FFE699">
    <circle cx="340" cy="800" r="3.5" opacity="0.9"/>
    <circle cx="580" cy="760" r="2.8" opacity="0.8"/>
    <circle cx="890" cy="810" r="4.0" opacity="0.95"/>
    <circle cx="1120" cy="770" r="3.0" opacity="0.85"/>
    <circle cx="1380" cy="820" r="3.8" opacity="0.9"/>
    <circle cx="1680" cy="790" r="3.2" opacity="0.8"/>
  </g>

  <!-- Dreamy Night Tint -->
  <rect width="1920" height="1080" fill="#9386B8" opacity="0.08"/>
</svg>`,

  spring_garden: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
  <defs>
    <linearGradient id="sgSky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#b6cde2"/>
      <stop offset="45%" stop-color="#f5e1e5"/>
      <stop offset="80%" stop-color="#fdf3f4"/>
      <stop offset="100%" stop-color="#eaf3e7"/>
    </linearGradient>
    <radialGradient id="springSun" cx="20%" cy="25%" r="35%">
      <stop offset="0%" stop-color="#fff8eb" stop-opacity="0.8"/>
      <stop offset="60%" stop-color="#fedbd0" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="sgHillFar" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#a4bf9f"/>
      <stop offset="100%" stop-color="#80a07a"/>
    </linearGradient>
    <linearGradient id="sgHillNear" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#698e62"/>
      <stop offset="100%" stop-color="#4d6f47"/>
    </linearGradient>
  </defs>

  <rect width="1920" height="1080" fill="url(#sgSky)"/>
  <rect width="1920" height="1080" fill="url(#springSun)"/>

  <!-- Distant Soft Spring Hills -->
  <path d="M0,660 Q480,570 980,650 T1920,630 L1920,1080 L0,1080 Z" fill="url(#sgHillFar)" opacity="0.55"/>

  <!-- Blooming Cherry Blossom / Magnolia Canopies (Midground) -->
  <g fill="#D6A2AA" opacity="0.85">
    <ellipse cx="280" cy="580" rx="130" ry="90"/>
    <ellipse cx="360" cy="560" rx="160" ry="110"/>
    <ellipse cx="440" cy="590" rx="120" ry="85"/>

    <ellipse cx="1450" cy="570" rx="150" ry="100"/>
    <ellipse cx="1560" cy="550" rx="170" ry="120"/>
    <ellipse cx="1670" cy="580" rx="130" ry="90"/>
  </g>
  <!-- Dark tree trunks -->
  <path d="M350,560 Q360,680 340,780 L380,780 Q370,680 370,560 Z" fill="#523932"/>
  <path d="M1550,550 Q1560,670 1540,780 L1580,780 Q1570,670 1570,550 Z" fill="#523932"/>

  <!-- Rolling Lush Spring Meadow (Foreground) -->
  <path d="M0,760 Q560,680 1140,760 T1920,730 L1920,1080 L0,1080 Z" fill="url(#sgHillNear)"/>

  <!-- Flower Garden Beds (Pink & White Petals) -->
  <g fill="#fbe8ec">
    ${Array.from({ length: 45 }, (_, i) => {
      const cx = (i * 41 + 15) % 1920;
      const cy = 790 + (i * 29) % 240;
      return `<ellipse cx="${cx}" cy="${cy}" rx="7" ry="5"/>
              <circle cx="${cx}" cy="${cy}" r="3" fill="#D6A2AA"/>`;
    }).join('\n    ')}
  </g>
  <g fill="#ffffff">
    ${Array.from({ length: 40 }, (_, i) => {
      const cx = (i * 53 + 45) % 1920;
      const cy = 810 + (i * 31) % 220;
      return `<circle cx="${cx}" cy="${cy}" r="4"/>
              <circle cx="${cx}" cy="${cy}" r="2" fill="#ffd479"/>`;
    }).join('\n    ')}
  </g>

  <!-- Flying Gentle Petals & Songbirds -->
  <g fill="#f1c2ca" opacity="0.8">
    <ellipse cx="600" cy="420" rx="8" ry="4" transform="rotate(25, 600, 420)"/>
    <ellipse cx="720" cy="380" rx="9" ry="5" transform="rotate(-15, 720, 380)"/>
    <ellipse cx="850" cy="460" rx="7" ry="4" transform="rotate(40, 850, 460)"/>
    <ellipse cx="1120" cy="410" rx="9" ry="5" transform="rotate(10, 1120, 410)"/>
    <ellipse cx="1280" cy="480" rx="8" ry="4" transform="rotate(-30, 1280, 480)"/>
  </g>
  <!-- Birds in Flight -->
  <g stroke="#7b555b" stroke-width="2.2" fill="none">
    <path d="M880,260 Q892,252 904,260 Q916,252 928,260"/>
    <path d="M940,240 Q950,234 960,240 Q970,234 980,240"/>
  </g>
  <!-- Spring Ambient Tint -->
  <rect width="1920" height="1080" fill="#D6A2AA" opacity="0.06"/>
</svg>`
};

for (const [themeId, svgContent] of Object.entries(themes)) {
  const filePath = path.join(outDir, `${themeId}_bg.svg`);
  fs.writeFileSync(filePath, svgContent.trim());
  console.log(`Generated background: ${filePath}`);
}

console.log('Background SVG generation complete!');
