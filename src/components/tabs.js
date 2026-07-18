import { html, useState } from '../ui.js';
import * as api from '../supabase.js';

// ---------------- shared helpers ----------------
const SEV = { severe: 'Severe', modsevere: 'Mod–Severe', moderate: 'Moderate', mild: 'Mild' };
const SEV_ORDER = { severe: 4, modsevere: 3, moderate: 2, mild: 1 };

function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T12:00:00');
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function cycleDayFrom(lastPeriodDate, cycleLength) {
  if (!lastPeriodDate) return null;
  const last = new Date(lastPeriodDate + 'T12:00:00');
  const today = new Date(); today.setHours(12, 0, 0, 0);
  const days = Math.floor((today - last) / 86400000);
  if (isNaN(days)) return null;
  return ((days % cycleLength) + cycleLength) % cycleLength + 1;
}

function phaseName(cycleDay, cycleLength) {
  if (cycleDay == null) return null;
  const ovMid = cycleLength - 14;               // luteal phase is ~14 days
  if (cycleDay <= 5) return 'Menstruation';
  if (cycleDay >= ovMid - 1 && cycleDay <= ovMid + 1) return 'Ovulation';
  if (cycleDay < ovMid - 1) return 'Follicular Phase';
  if (cycleDay > cycleLength - 5) return 'Late Luteal Phase';
  return 'Luteal Phase';
}

function EmptyContent({ isDemo, thing }) {
  return html`<div class="empty">
    ${isDemo
      ? `This section is illustrated with the demo persona's example ${thing}.`
      : `No ${thing} yet. This section fills in as your account's content is added.`}
  </div>`;
}

// ============================================================
// EPISODE LOG
// ============================================================
export function EpisodeLog({ episodes = [], content = {}, isDemo, userId, reload }) {
  const [recording, setRecording] = useState(false);
  const [q, setQ] = useState('');
  const [sevFilter, setSevFilter] = useState('all');

  const sorted = [...episodes].sort((a, b) => new Date(b.date) - new Date(a.date));
  const filtered = sorted.filter((e) => {
    if (sevFilter !== 'all' && e.severity !== sevFilter) return false;
    if (q) {
      const hay = `${e.symptoms || ''} ${e.env || ''} ${e.notes || ''}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });
  const counts = episodes.reduce((m, e) => { m[e.severity] = (m[e.severity] || 0) + 1; return m; }, {});

  return html`
    <div>
      <div class="page-hero">
        <h2 class="serif">Episode ${html`<em>Log</em>`}</h2>
        <p>All your documented focal seizure episodes, ordered chronologically with severity, cycle phase, and environmental context.</p>
      </div>

      <div class="stat-row">
        <div class="stat"><div class="n">${episodes.length}</div><div class="l">Episodes</div></div>
        <div class="stat"><div class="n" style=${{ color: 'var(--red)' }}>${(counts.severe || 0) + (counts.modsevere || 0)}</div><div class="l">Severe</div></div>
        <div class="stat"><div class="n" style=${{ color: 'var(--amber)' }}>${(counts.moderate || 0) + (counts.mild || 0)}</div><div class="l">Mild–Moderate</div></div>
        <div class="stat"><div class="n" style=${{ color: '#ffb4b4' }}>${episodes.filter((e) => e.emt).length}</div><div class="l">EMT</div></div>
      </div>

      <div style=${{ display: 'flex', gap: '10px', flexWrap: 'wrap', margin: '4px 0 18px', alignItems: 'center' }}>
        ${!isDemo && html`<button class="btn btn-primary" onClick=${() => setRecording(true)}>+ Record episode</button>`}
        <input class="input" style=${{ flex: 1, minWidth: '160px' }} placeholder="Search symptoms or location…" value=${q} onInput=${(e) => setQ(e.target.value)} />
        <select class="input" style=${{ width: 'auto' }} value=${sevFilter} onChange=${(e) => setSevFilter(e.target.value)}>
          <option value="all">All severities</option>
          <option value="severe">Severe</option>
          <option value="modsevere">Mod–Severe</option>
          <option value="moderate">Moderate</option>
          <option value="mild">Mild</option>
        </select>
      </div>

      ${filtered.length === 0
        ? html`<div class="empty">${episodes.length === 0 ? 'No episodes logged yet.' : 'No episodes match your filter.'}</div>`
        : html`<div class="ep-grid">${filtered.map((e) => html`<${EpisodeCard} key=${e.id || e.date} ep=${e} />`)}</div>`}

      ${recording && html`<${RecordModal} content=${content} userId=${userId} onClose=${() => setRecording(false)} onSaved=${() => { setRecording(false); reload && reload(); }} />`}
    </div>`;
}

function EpisodeCard({ ep }) {
  return html`
    <div class="ep-card">
      <div class="ep-date">${fmtDate(ep.date)}${ep.first_episode ? html` <span title="Earliest documented">★</span>` : ''}</div>
      <div class="ep-env">${ep.env || '—'}</div>
      <div class="ep-sym">${ep.symptoms || ''}</div>
      <div class="ep-badges">
        ${ep.severity && html`<span class=${'badge badge-' + ep.severity}>${SEV[ep.severity] || ep.severity}</span>`}
        ${ep.cycle_phase && html`<span class="badge badge-phase">${ep.cycle_phase}${ep.cycleday ? ' · D' + ep.cycleday : ''}</span>`}
        ${ep.emt && html`<span class="badge badge-emt">EMT</span>`}
      </div>
    </div>`;
}

function RecordModal({ content, userId, onClose, onSaved }) {
  const [f, setF] = useState({ date: new Date().toISOString().slice(0, 10), time: '', env: '', symptoms: '', severity: 'moderate', cycleday: '', cycle_phase: '', emt: false, notes: '' });
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const chips = content.commonSymptoms || [];

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    const ok = await api.addEpisode(userId, f);
    setBusy(false);
    if (ok) onSaved();
  }
  function toggleChip(s) {
    const cur = f.symptoms ? f.symptoms.split('; ').filter(Boolean) : [];
    const i = cur.indexOf(s);
    if (i >= 0) cur.splice(i, 1); else cur.push(s);
    set('symptoms', cur.join('; '));
  }

  return html`
    <div class="overlay" onClick=${(e) => { if (e.target.classList.contains('overlay')) onClose(); }}>
      <div class="modal" style=${{ maxWidth: '460px' }}>
        <h2 class="serif">Record episode</h2>
        <div class="sub">Saved privately to your account.</div>
        <form onSubmit=${save}>
          <div style=${{ display: 'flex', gap: '10px' }}>
            <div class="field" style=${{ flex: 1 }}><label class="label">Date</label>
              <input class="input" type="date" value=${f.date} onInput=${(e) => set('date', e.target.value)} required /></div>
            <div class="field" style=${{ width: '120px' }}><label class="label">Time</label>
              <input class="input" type="time" value=${f.time} onInput=${(e) => set('time', e.target.value)} /></div>
          </div>
          <div class="field"><label class="label">Environment / situation</label>
            <input class="input" value=${f.env} onInput=${(e) => set('env', e.target.value)} placeholder="Where were you? What was happening?" /></div>
          <div class="field"><label class="label">Symptoms</label>
            <textarea class="input" rows="2" value=${f.symptoms} onInput=${(e) => set('symptoms', e.target.value)} placeholder="What did you experience?"></textarea>
            ${chips.length > 0 && html`<div style=${{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
              ${chips.map((s) => html`<button type="button" key=${s} class="pill" style=${{ cursor: 'pointer', borderColor: (f.symptoms || '').includes(s) ? 'var(--accent)' : 'var(--border2)' }} onClick=${() => toggleChip(s)}>${s}</button>`)}
            </div>`}
          </div>
          <div style=${{ display: 'flex', gap: '10px' }}>
            <div class="field" style=${{ flex: 1 }}><label class="label">Severity</label>
              <select class="input" value=${f.severity} onChange=${(e) => set('severity', e.target.value)}>
                <option value="mild">Mild</option><option value="moderate">Moderate</option>
                <option value="modsevere">Mod–Severe</option><option value="severe">Severe</option>
              </select></div>
            <div class="field" style=${{ width: '110px' }}><label class="label">Cycle day</label>
              <input class="input" value=${f.cycleday} onInput=${(e) => set('cycleday', e.target.value)} placeholder="e.g. 26" /></div>
          </div>
          <div class="field"><label class="label" style=${{ display: 'flex', gap: '8px', alignItems: 'center', textTransform: 'none', letterSpacing: 0 }}>
            <input type="checkbox" checked=${f.emt} onChange=${(e) => set('emt', e.target.checked)} /> EMT / emergency services called</label></div>
          <button class="btn btn-primary btn-block" type="submit" disabled=${busy}>${busy ? 'Saving…' : 'Save episode'}</button>
        </form>
        <div class="switch"><button onClick=${onClose}>Cancel</button></div>
      </div>
    </div>`;
}

// ============================================================
// CYCLE TRACKER
// ============================================================
export function CycleTracker({ episodes = [], content = {}, lastPeriodDate, cycleLength = 28, isDemo, userId, reload }) {
  const [logging, setLogging] = useState(false);
  const cd = cycleDayFrom(lastPeriodDate, cycleLength);
  const pName = phaseName(cd, cycleLength);
  const win = (content.cycleWindows || {})[pName] || {};

  return html`
    <div>
      <div class="page-hero">
        <h2 class="serif">Cycle ${html`<em>& Hormones</em>`}</h2>
        <p>Track your episodes against your menstrual cycle to surface catamenial (hormone-linked) patterns.</p>
      </div>

      <div class="card">
        <div class="card-title">Current window</div>
        ${cd == null
          ? html`<p class="muted">No period logged yet, so the current cycle day is unknown. ${!isDemo ? 'Log your last period to begin tracking.' : ''}</p>`
          : html`
            <div class="stat-row">
              <div class="stat"><div class="n">Day ${cd}</div><div class="l">of ${cycleLength}</div></div>
              <div class="stat"><div class="n" style=${{ fontSize: '1.2rem' }}>${pName || '—'}</div><div class="l">Phase</div></div>
            </div>
            ${win.desc && html`<p class="ep-sym" style=${{ marginTop: '6px' }}>${win.desc}</p>`}
            ${win.advice && html`<p class="pill" style=${{ marginTop: '10px', whiteSpace: 'normal', lineHeight: 1.5 }}>${win.advice}</p>`}`}
        ${!isDemo && html`<div style=${{ marginTop: '16px' }}><button class="btn btn-ghost" onClick=${() => setLogging(true)}>Log period start</button></div>`}
      </div>

      <div class="card">
        <div class="card-title">Episodes by cycle phase</div>
        <div class="card-sub">How your documented episodes distribute across the cycle</div>
        ${(() => {
          const byPhase = {};
          episodes.forEach((e) => { const p = e.cycle_phase || '—'; byPhase[p] = (byPhase[p] || 0) + 1; });
          const keys = Object.keys(byPhase);
          return keys.length === 0
            ? html`<div class="empty">No episodes with a cycle phase recorded yet.</div>`
            : html`<div class="stat-row">${keys.map((k) => html`<div class="stat" key=${k}><div class="n">${byPhase[k]}</div><div class="l">${k}</div></div>`)}</div>`;
        })()}
      </div>

      ${logging && html`<${LogPeriodModal} userId=${userId} onClose=${() => setLogging(false)} onSaved=${() => { setLogging(false); reload && reload(); }} />`}
    </div>`;
}

function LogPeriodModal({ userId, onClose, onSaved }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [flow, setFlow] = useState('normal');
  const [busy, setBusy] = useState(false);
  async function save(e) {
    e.preventDefault(); setBusy(true);
    const ok = await api.logPeriod(userId, date, flow, null);
    setBusy(false); if (ok) onSaved();
  }
  return html`
    <div class="overlay" onClick=${(e) => { if (e.target.classList.contains('overlay')) onClose(); }}>
      <div class="modal">
        <h2 class="serif">Log period start</h2>
        <form onSubmit=${save}>
          <div class="field"><label class="label">Start date</label>
            <input class="input" type="date" value=${date} onInput=${(e) => setDate(e.target.value)} required /></div>
          <div class="field"><label class="label">Flow</label>
            <select class="input" value=${flow} onChange=${(e) => setFlow(e.target.value)}>
              <option value="light">Light</option><option value="normal">Normal</option><option value="heavy">Heavy</option>
            </select></div>
          <button class="btn btn-primary btn-block" type="submit" disabled=${busy}>${busy ? 'Saving…' : 'Save'}</button>
        </form>
        <div class="switch"><button onClick=${onClose}>Cancel</button></div>
      </div>
    </div>`;
}

// ============================================================
// RISK ASSESSMENT
// ============================================================
const RISK_Q = [
  { id: 'sleep', q: 'How was your sleep last night?', opts: [['Good, consistent', 0], ['A bit short', 1], ['Poor / deprived', 3]] },
  { id: 'env', q: 'What environment are you heading into?', opts: [['Calm / quiet', 0], ['Moderately busy', 1], ['Loud / crowded', 3]] },
  { id: 'cycle', q: 'Where are you in your cycle?', opts: [['Lower-risk window', 0], ['Mid-cycle', 1], ['High-risk / pre-period window', 3]] },
  { id: 'stress', q: 'Your current stress level?', opts: [['Low', 0], ['Moderate', 1], ['High', 2]] },
  { id: 'other', q: 'Any alcohol or other known triggers today?', opts: [['None', 0], ['Some', 2], ['Several', 3]] },
];

export function RiskAssessment({ content = {}, isDemo, userId }) {
  const [ans, setAns] = useState({});
  const [result, setResult] = useState(null);
  const total = Object.values(ans).reduce((a, b) => a + b, 0);
  const done = Object.keys(ans).length === RISK_Q.length;

  function compute() {
    let level;
    if (total <= 2) level = 'low'; else if (total <= 5) level = 'moderate'; else if (total <= 9) level = 'high'; else level = 'very-high';
    setResult({ level, total });
    if (!isDemo && userId) api.saveRisk(userId, { answers: ans, total_score: total, risk_level: level });
  }

  const rd = (content.riskDescriptions || {})[result?.level] || {};
  const colors = { low: 'var(--green)', moderate: 'var(--amber)', high: 'var(--orange)', 'very-high': 'var(--red)' };
  const labels = { low: 'Low Risk', moderate: 'Moderate Risk', high: 'High Risk', 'very-high': 'Very High Risk' };

  return html`
    <div>
      <div class="page-hero">
        <h2 class="serif">Risk ${html`<em>Assessment</em>`}</h2>
        <p>Answer a few questions to estimate your risk for a given situation, based on your documented history.</p>
      </div>
      ${RISK_Q.map((qq) => html`
        <div class="card" key=${qq.id}>
          <div style=${{ fontWeight: 600, marginBottom: '10px' }}>${qq.q}</div>
          ${qq.opts.map(([label, score]) => html`
            <button key=${label} class=${'risk-opt' + (ans[qq.id] === score ? ' sel' : '')}
              onClick=${() => setAns((s) => ({ ...s, [qq.id]: score }))}>${label}</button>`)}
        </div>`)}
      <button class="btn btn-primary btn-block" disabled=${!done} onClick=${compute}>${done ? 'Calculate risk' : 'Answer all questions'}</button>

      ${result && html`
        <div class="card" style=${{ marginTop: '18px', borderColor: colors[result.level] }}>
          <div class="card-title" style=${{ color: colors[result.level] }}>${labels[result.level]} · score ${result.total}</div>
          ${rd.description ? html`<p class="ep-sym">${rd.description}</p>` : html`<p class="muted">Add your personalized risk guidance to see detailed advice here.</p>`}
          ${rd.tipList && rd.tipList.length > 0 && html`<ul style=${{ marginTop: '10px', color: 'var(--text2)', fontSize: '0.85rem' }}>${rd.tipList.map((t) => html`<li key=${t}>${t}</li>`)}</ul>`}
        </div>`}
    </div>`;
}

// ============================================================
// BRAIN THEORY
// ============================================================
export function BrainTheory({ content = {}, isDemo }) {
  const regions = content.brainRegions || [];
  const [open, setOpen] = useState(null);
  return html`
    <div>
      <div class="page-hero">
        <h2 class="serif">Brain ${html`<em>Theory</em>`}</h2>
        <p>The neuroscience behind your focal seizures — which regions are involved, based on your documented symptom pattern.</p>
      </div>
      ${regions.length === 0
        ? html`<${EmptyContent} isDemo=${isDemo} thing="brain-region notes" />`
        : regions.map((r) => html`
          <div class="region-card" key=${r.id || r.name} style=${{ borderLeftColor: r.color || 'var(--accent)' }} onClick=${() => setOpen(open === (r.id || r.name) ? null : (r.id || r.name))}>
            <div class="region-name" style=${{ color: r.color }}>${r.name}</div>
            <div class="region-role">${r.role || ''}</div>
            ${open === (r.id || r.name) && html`
              <div>
                <div class="region-desc">${r.desc}</div>
                ${r.symptoms && html`<div class="region-sym">${r.symptoms}</div>`}
              </div>`}
          </div>`)}
    </div>`;
}

// ============================================================
// PROTECTIVE MEASURES
// ============================================================
export function ProtectiveMeasures({ content = {}, isDemo }) {
  const items = content.protectiveMeasures || [];
  return html`
    <div>
      <div class="page-hero">
        <h2 class="serif">Protective ${html`<em>Measures</em>`}</h2>
        <p>Evidence-based interventions with linked studies, graded by strength of evidence.</p>
      </div>
      ${items.length === 0
        ? html`<${EmptyContent} isDemo=${isDemo} thing="protective measures" />`
        : items.map((m) => html`
          <div class="card" key=${m.title} style=${{ borderLeft: '3px solid ' + (m.color || 'var(--accent)') }}>
            <div style=${{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style=${{ fontSize: '1.4rem' }}>${m.icon || '•'}</span>
              <div><div class="card-title" style=${{ marginBottom: 0 }}>${m.title}</div>
                <div class="card-sub" style=${{ marginBottom: 0 }}>${m.subtitle || ''}</div></div>
              ${m.evidenceLabel && html`<span class="pill" style=${{ marginLeft: 'auto' }}>${m.evidenceLabel}</span>`}
            </div>
            <p class="ep-sym" style=${{ marginTop: '12px' }}>${m.body}</p>
            ${m.relevance && html`<p class="ep-sym" style=${{ marginTop: '8px', padding: '10px 12px', background: m.relevanceColor || 'var(--bg3)', border: '1px solid ' + (m.relevanceBorder || 'var(--border2)'), borderRadius: '8px' }}>${m.relevance}</p>`}
            ${m.dosage && html`<p class="pill" style=${{ marginTop: '10px', whiteSpace: 'normal' }}>${m.dosage}</p>`}
            ${(m.studies || []).map((s) => html`<div key=${s.title} style=${{ marginTop: '10px', fontSize: '0.78rem', color: 'var(--text3)' }}>
              ${s.url ? html`<a href=${s.url} target="_blank" rel="noreferrer">${s.title}</a>` : s.title} — ${s.journal}. ${s.finding}</div>`)}
          </div>`)}
    </div>`;
}

// ============================================================
// RESEARCH
// ============================================================
export function Research({ content = {}, isDemo }) {
  const items = content.researchArticles || [];
  return html`
    <div>
      <div class="page-hero">
        <h2 class="serif">Research ${html`<em>Library</em>`}</h2>
        <p>Studies relevant to your seizure type, catamenial pattern, and documented triggers.</p>
      </div>
      ${items.length === 0
        ? html`<${EmptyContent} isDemo=${isDemo} thing="research articles" />`
        : items.map((a) => html`
          <div class="card" key=${a.title}>
            ${a.category && html`<span class="pill">${a.category}</span>`}
            <div class="card-title" style=${{ marginTop: '10px' }}>${a.url ? html`<a href=${a.url} target="_blank" rel="noreferrer">${a.title}</a>` : a.title}</div>
            <div class="card-sub">${a.journal || ''}</div>
            ${a.finding && html`<p class="ep-sym">${a.finding}</p>`}
            ${a.relevance && html`<p class="ep-sym muted" style=${{ marginTop: '6px', fontStyle: 'italic' }}>${a.relevance}</p>`}
          </div>`)}
    </div>`;
}
