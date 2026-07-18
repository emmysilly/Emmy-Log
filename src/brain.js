import { html } from './ui.js';

// Stylized lateral-view brain diagram. Each region node is placed at its
// `pos: [x, y]` (in the 0..460 × 0..300 viewBox); regions without a position
// are auto-arranged along an arc so any dataset still renders.
const AUTO = [[150, 120], [215, 100], [285, 110], [330, 150], [250, 195], [190, 185], [300, 180], [140, 160]];

export function BrainDiagram({ regions = [], activeId = null }) {
  if (!regions.length) return null;
  const placed = regions.map((r, i) => ({ ...r, _p: r.pos && r.pos.length === 2 ? r.pos : AUTO[i % AUTO.length] }));

  return html`
    <svg viewBox="0 0 460 300" style=${{ width: '100%', height: 'auto', display: 'block' }} preserveAspectRatio="xMidYMid meet" aria-label="Brain region diagram">
      <!-- cerebrum silhouette (frontal lobe to the left) -->
      <path d="M60 150 C60 92 120 55 205 52 C300 49 400 78 405 140 C408 185 360 214 300 220 C250 225 235 236 205 236 C120 236 60 205 60 150 Z"
        fill="#ffffff08" stroke="#ffffff22" stroke-width="1.5" />
      <!-- cerebellum + brainstem -->
      <ellipse cx="360" cy="215" rx="46" ry="30" fill="#ffffff06" stroke="#ffffff18" stroke-width="1" />
      <path d="M300 232 q10 34 34 40" fill="none" stroke="#ffffff18" stroke-width="6" stroke-linecap="round" />
      <!-- faint lobe labels -->
      <text x="120" y="250" fill="#ffffff26" font-size="9" font-family="Inter, sans-serif" text-anchor="middle">FRONTAL</text>
      <text x="250" y="70" fill="#ffffff26" font-size="9" font-family="Inter, sans-serif" text-anchor="middle">PARIETAL</text>
      <text x="235" y="252" fill="#ffffff26" font-size="9" font-family="Inter, sans-serif" text-anchor="middle">TEMPORAL</text>
      <text x="392" y="150" fill="#ffffff26" font-size="9" font-family="Inter, sans-serif" text-anchor="middle">OCC.</text>

      ${placed.map((r) => {
        const [x, y] = r._p;
        const c = r.color || '#8b7bff';
        const isOrigin = /origin/i.test(r.role || '');
        const active = activeId && (r.id || r.name) === activeId;
        const short = (r.name || '').replace(/^(Right|Left)\s+/, '').split('(')[0].trim()
          .replace('Neocortex', 'Neo.').replace('Cortex', 'Ctx.');
        return html`<g key=${r.id || r.name} style=${{ transition: 'opacity .2s' }} opacity=${activeId && !active ? 0.4 : 1}>
          <ellipse cx=${x} cy=${y} rx="29" ry="18" fill=${c + (active ? '55' : '2e')} stroke=${c} stroke-width=${active ? 2.2 : 1.2} />
          ${isOrigin && html`<text x=${x} y=${y - 21} text-anchor="middle" font-size="11">⚡</text>`}
          <text x=${x} y=${y + 3} text-anchor="middle" fill=${c} font-size="8" font-weight="700" font-family="Inter, sans-serif">${short}</text>
        </g>`;
      })}
    </svg>`;
}
