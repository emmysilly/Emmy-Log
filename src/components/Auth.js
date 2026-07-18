import { html, useState } from '../ui.js';
import * as api from '../supabase.js';

export function AuthModal({ mode, onClose, onSwitch }) {
  const isSignup = mode === 'signup';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError(''); setNotice(''); setBusy(true);
    try {
      if (isSignup) {
        const { data, error } = await api.signUp(email.trim(), password, displayName.trim());
        if (error) { setError(error.message); return; }
        if (data.session) return; // logged straight in (email confirmation off)
        setNotice('Account created. Check your email to confirm your address, then log in.');
      } else {
        const { error } = await api.signIn(email.trim(), password);
        if (error) { setError(error.message); return; }
        // onAuthChange in App will close this and route to the dashboard
      }
    } catch (err) {
      setError(String(err.message || err));
    } finally {
      setBusy(false);
    }
  }

  return html`
    <div class="overlay" onClick=${(e) => { if (e.target.classList.contains('overlay')) onClose(); }}>
      <div class="modal">
        <h2 class="brand"><span class="brand-a">Epilepsy</span> Log</h2>
        <div class="sub">${isSignup ? 'Create your private account' : 'Log in to your account'}</div>
        <form onSubmit=${submit}>
          ${isSignup && html`
            <div class="field">
              <label class="label">Display name (optional)</label>
              <input class="input" type="text" value=${displayName} onInput=${(e) => setDisplayName(e.target.value)} placeholder="How we address you" />
            </div>`}
          <div class="field">
            <label class="label">Email</label>
            <input class="input" type="email" required value=${email} onInput=${(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div class="field">
            <label class="label">Password</label>
            <input class="input" type="password" required minLength=${6} value=${password} onInput=${(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          ${error && html`<div class="error">${error}</div>`}
          ${notice && html`<div class="notice">${notice}</div>`}
          <button class="btn btn-primary btn-block" type="submit" disabled=${busy} style=${{ marginTop: '6px' }}>
            ${busy ? 'Please wait…' : (isSignup ? 'Create account' : 'Log in')}
          </button>
        </form>
        <div class="switch">
          ${isSignup
            ? html`Already have an account? <button onClick=${() => onSwitch('login')}>Log in</button>`
            : html`New here? <button onClick=${() => onSwitch('signup')}>Create an account</button>`}
        </div>
        <div class="switch"><button onClick=${onClose}>Cancel</button></div>
      </div>
    </div>`;
}
