import { html } from './ui.js';

// ---------------- shared ----------------
const PHASE_COLORS = { C1: '#ff4a4a', C2: '#ffaa30', C3: '#9060ff', MENS: '#6ec6f5' };
const SEV_NUM = { severe: 4, modsevere: 3, moderate: 2, mild: 1 };
const SEV_COLOR = { severe: '#f87171', modsevere: '#ff7050', moderate: '#fb923c', mild: '#fbbf24' };
const clamp = (v, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));
const gauss = (x, mu, s) => Math.exp(-((x - mu) ** 2) / (2 * s * s));

// Physiologically-shaped (illustrative) hormone curves for any cycle length.
export function hormoneCurves(L) {
  const ov = L - 14; // ovulation ~14 days before next period
  const out = [];
  for (let d = 1; d <= L; d++) {
    out.push({
      day: d,
      estradiol: clamp(10 + 82 * gauss(d, ov, L * 0.075) + 34 * gauss(d, ov + 7, L * 0.16)),
      progesterone: clamp(4 + 94 * gauss(d, ov + 7, L * 0.13)),
      lh: clamp(14 + 82 * gauss(d, ov, L * 0.035)),
      fsh: clamp(18 + 26 * gauss(d, 3, L * 0.1) + 44 * gauss(d, ov, L * 0.05)),
    });
  }
  return out;
}

function phaseBands(L) {
  const ov = L - 14;
  return [
    { start: 1, end: 5, label: 'Menses', color: '#ff4a4a18' },
    { start: 6, end: ov - 2, label: 'Follicular', color: '#f5e04416' },
    { start: ov - 1, end: ov + 1, label: 'Ovulation', color: '#ff9a0022' },
    { start: ov + 2, end: L - 5, label: 'Luteal', color: '#9060ff18' },
    { start: L - 4, end: L, label: 'Late luteal', color: '#ff4a7a1e' },
  ].filter((b) => b.end >= b.start);
}

// ============================================================
// CYCLE CHART — hormone curves + phase bands + episode dots
// ============================================================
export function CycleChart({ cycleLength = 28, episodes = [], currentDay = null }) {
  const L = cycleLength;
  const W = 700, H = 300, pL = 34, pR = 14, pT = 40, pB = 26;
  const cW = W - pL - pR, cH = H - pT - pB;
  const data = hormoneCurves(L);
  const xD = (d) => pL + ((d - 1) / (L - 1)) * cW;
  const yV = (v) => pT + cH - (v / 100) * cH;

  const line = (key, color, w = 2) =>
    html`<polyline fill="none" stroke=${color} stroke-width=${w} stroke-linejoin="round" stroke-linecap="round"
      points=${data.map((p) => `${xD(p.day).toFixed(1)},${yV(p[key]).toFixed(1)}`).join(' ')} />`;

  const dots = episodes
    .map((e) => ({ day: parseInt(e.cycleday, 10), sev: e.severity }))
    .filter((e) => e.day >= 1 && e.day <= L && !isNaN(e.day));

  const series = [
    { k: 'fsh', c: '#5cb85c', label: 'FSH' },
    { k: 'lh', c: '#e8e04a', label: 'LH' },
    { k: 'estradiol', c: '#6ec6f5', label: 'Estradiol' },
    { k: 'progesterone', c: '#f4a0b0', label: 'Progesterone' },
  ];

  return html`
    <div>
      <svg viewBox=${`0 0 ${W} ${H}`} style=${{ width: '100%', height: 'auto', display: 'block' }} preserveAspectRatio="xMidYMid meet">
        ${phaseBands(L).map((b) => html`
          <rect key=${b.label} x=${xD(b.start)} y=${pT} width=${Math.max(0, xD(Math.min(b.end + 0.999, L)) - xD(b.start))} height=${cH} fill=${b.color} />`)}
        ${[0, 50, 100].map((v) => html`
          <line key=${v} x1=${pL} y1=${yV(v)} x2=${pL + cW} y2=${yV(v)} stroke="#ffffff10" stroke-width="1" />`)}
        ${currentDay && currentDay >= 1 && currentDay <= L && html`
          <line x1=${xD(currentDay)} y1=${pT} x2=${xD(currentDay)} y2=${pT + cH} stroke="#ffffff55" stroke-width="1.5" stroke-dasharray="3 3" />`}
        ${series.map((s) => line(s.k, s.c, s.k === 'progesterone' || s.k === 'estradiol' ? 2.5 : 1.6))}
        ${dots.map((e, i) => html`
          <g key=${i}>
            <line x1=${xD(e.day)} y1=${pT + 14} x2=${xD(e.day)} y2=${pT + cH} stroke=${(SEV_COLOR[e.sev] || '#f87171') + '44'} stroke-width="1" stroke-dasharray="2 3" />
            <circle cx=${xD(e.day)} cy=${pT + 14} r="5" fill=${SEV_COLOR[e.sev] || '#f87171'} stroke="#0a0912" stroke-width="1.5" />
          </g>`)}
        ${[1, Math.round(L / 4), Math.round(L / 2), Math.round((3 * L) / 4), L].map((d) => html`
          <text key=${d} x=${xD(d)} y=${H - 8} fill="#6a6088" font-size="10" text-anchor="middle" font-family="Inter, sans-serif">${d}</text>`)}
      </svg>
      <div style=${{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '8px', fontSize: '0.7rem', color: 'var(--text3)' }}>
        ${series.map((s) => html`<span key=${s.label} style=${{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          <span style=${{ width: '12px', height: '3px', background: s.c, display: 'inline-block', borderRadius: '2px' }}></span>${s.label}</span>`)}
        <span style=${{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          <span style=${{ width: '9px', height: '9px', background: '#f87171', borderRadius: '50%', display: 'inline-block' }}></span>Episode</span>
      </div>
    </div>`;
}

// ============================================================
// SEVERITY CHART — one bar per episode, colored by cycle phase
// ============================================================
export function SeverityChart({ episodes = [] }) {
  const eps = [...episodes].sort((a, b) => new Date(a.date) - new Date(b.date));
  if (eps.length === 0) return html`<div class="empty">No episodes to chart yet.</div>`;
  const W = 700, H = 240, pL = 30, pR = 12, pT = 20, pB = 46;
  const cW = W - pL - pR, cH = H - pT - pB;
  const gap = cW / eps.length, barW = Math.min(gap * 0.55, 44);
  const shortDate = (iso) => { const d = new Date(iso + 'T12:00:00'); return isNaN(d) ? '' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); };

  return html`
    <svg viewBox=${`0 0 ${W} ${H}`} style=${{ width: '100%', height: 'auto', display: 'block' }} preserveAspectRatio="xMidYMid meet">
      ${[1, 2, 3, 4].map((v) => html`
        <line key=${v} x1=${pL} y1=${pT + cH - (v / 4) * cH} x2=${pL + cW} y2=${pT + cH - (v / 4) * cH} stroke="#ffffff0e" stroke-width="1" />`)}
      ${eps.map((e, i) => {
        const sv = SEV_NUM[e.severity] || 1;
        const bH = (sv / 4) * cH;
        const x = pL + gap * i + gap / 2 - barW / 2;
        const y = pT + cH - bH;
        const col = PHASE_COLORS[e.cycle_phase] || '#8b7bff';
        return html`<g key=${e.id || i}>
          <rect x=${x} y=${y} width=${barW} height=${bH} rx="4" fill=${col + 'cc'} />
          <rect x=${x} y=${y} width=${barW} height="4" rx="2" fill=${col} />
          ${e.emt && html`<text x=${x + barW / 2} y=${y - 6} fill="#ffb4b4" font-size="9" text-anchor="middle">EMT</text>`}
          <text x=${x + barW / 2} y=${H - 26} fill="#6a6088" font-size="9" text-anchor="middle" font-family="Inter, sans-serif" transform=${`rotate(-35 ${x + barW / 2} ${H - 26})`}>${shortDate(e.date)}</text>
        </g>`;
      })}
    </svg>`;
}
