import { html, useState, useEffect } from '../ui.js';
import * as api from '../supabase.js';
import { EpisodeLog, CycleTracker, RiskAssessment, BrainTheory, ProtectiveMeasures, Research } from './tabs.js';

const TABS = [
  { id: 'log', label: '📋 Episodes' },
  { id: 'cycle', label: '🌙 Cycle' },
  { id: 'risk', label: '⚠️ Risk' },
  { id: 'brain', label: '🧠 Brain' },
  { id: 'protective', label: '🛡️ Measures' },
  { id: 'research', label: '📚 Research' },
];

export function Dashboard({ user, isDemo, demoState, onSignOut, onExit, onSignup }) {
  const [tab, setTab] = useState('log');
  const [data, setData] = useState(null);

  async function load() {
    if (isDemo) { setData({ ...demoState }); return; }
    const [episodes, content, profile] = await Promise.all([
      api.listEpisodes(user.id),
      api.getAppContent(user.id),
      api.getProfile(user.id),
    ]);
    setData({
      isDemo: false,
      episodes,
      content: content || {},
      profile: profile || {},
      lastPeriodDate: profile?.last_period_date || null,
      cycleLength: profile?.cycle_length || 28,
    });
  }
  useEffect(() => { setData(null); load(); }, [user?.id, isDemo]);

  const ctx = { ...(data || {}), isDemo, userId: user?.id, reload: load };
  const who = isDemo ? 'Jordan Rivera (Demo)' : (data?.profile?.display_name || user?.email || 'You');

  return html`
    <div>
      ${isDemo && html`
        <div class="demo-banner">
          🧪 Demo Mode — everything here is fictional example data.
          <button class="linklike" style=${{ color: '#0a0010', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }} onClick=${onSignup}>Sign up</button>
          to start your own private log.
        </div>`}

      <div class="topbar">
        <div class="title serif"><span class="brand-a" style=${{ color: 'var(--accent)', fontStyle: 'italic' }}>Emmy</span> Log
          <span class="sub">Focal Epilepsy Documentation</span>
        </div>
        <div style=${{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span class="pill">${who}</span>
          ${isDemo
            ? html`<button class="btn btn-outline" style=${{ padding: '8px 14px' }} onClick=${onExit}>Exit demo</button>`
            : html`<button class="btn btn-outline" style=${{ padding: '8px 14px' }} onClick=${onSignOut}>Sign out</button>`}
        </div>
      </div>

      <div class="tabs">
        ${TABS.map((t) => html`
          <button key=${t.id} class=${'tab' + (tab === t.id ? ' active' : '')} onClick=${() => setTab(t.id)}>${t.label}</button>`)}
      </div>

      ${!data
        ? html`<div class="empty">Loading your data…</div>`
        : html`
          <div class="page">
            ${tab === 'log' && html`<${EpisodeLog} ...${ctx} />`}
            ${tab === 'cycle' && html`<${CycleTracker} ...${ctx} />`}
            ${tab === 'risk' && html`<${RiskAssessment} ...${ctx} />`}
            ${tab === 'brain' && html`<${BrainTheory} ...${ctx} />`}
            ${tab === 'protective' && html`<${ProtectiveMeasures} ...${ctx} />`}
            ${tab === 'research' && html`<${Research} ...${ctx} />`}
          </div>`}
    </div>`;
}
