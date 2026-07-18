import { html, useState, useEffect } from './ui.js';
import * as api from './supabase.js';
import { Landing } from './components/Landing.js';
import { AuthModal } from './components/Auth.js';
import { Dashboard } from './components/Dashboard.js';
import { buildDemoState } from './demo.js';

export function App() {
  const [session, setSession] = useState(undefined); // undefined = still checking
  const [demo, setDemo] = useState(false);
  const [authMode, setAuthMode] = useState(null);     // 'login' | 'signup' | null

  useEffect(() => {
    api.getSession().then(setSession);
    const unsub = api.onAuthChange((s) => { setSession(s); if (s) { setDemo(false); setAuthMode(null); } });
    return unsub;
  }, []);

  if (session === undefined) return html`<div class="boot">Loading Emmy Log…</div>`;

  if (session) {
    return html`<${Dashboard} user=${session.user} isDemo=${false} onSignOut=${() => api.signOut()} />`;
  }

  if (demo) {
    return html`<${Dashboard} isDemo=${true} demoState=${buildDemoState()} onExit=${() => setDemo(false)} onSignup=${() => { setDemo(false); setAuthMode('signup'); }} />`;
  }

  return html`
    <${Landing}
      onDemo=${() => setDemo(true)}
      onLogin=${() => setAuthMode('login')}
      onSignup=${() => setAuthMode('signup')} />
    ${authMode && html`<${AuthModal} mode=${authMode} onClose=${() => setAuthMode(null)} onSwitch=${setAuthMode} />`}
  `;
}
