import { html } from '../ui.js';

const FEATURES = [
  { ico: '📋', h: 'Episode Log', p: 'Record each focal seizure with time, environment, symptoms, severity, and cycle day — building a searchable history.' },
  { ico: '🎯', h: 'Trigger Analysis', p: 'See which environments and situations precede episodes so you can recognize and reduce your personal triggers.' },
  { ico: '🧠', h: 'Brain Mapping', p: 'Map your symptoms to the brain regions involved and understand how a seizure spreads from its origin.' },
  { ico: '🌙', h: 'Cycle Correlation', p: 'Track episodes against your menstrual cycle to surface catamenial (hormone-linked) patterns.' },
  { ico: '⚠️', h: 'Risk Assessment', p: 'A quick questionnaire estimates your risk for a given situation based on your documented history.' },
  { ico: '📚', h: 'Research & Measures', p: 'Keep evidence-based protective measures and the studies behind them in one place.' },
];

export function Landing({ onDemo, onLogin, onSignup }) {
  return html`
    <div class="landing">
      <div class="landing-hero">
        <h1 class="brand"><span class="brand-a">Epilepsy</span> Log</h1>
        <p class="tag">A personal medical documentation tool for people with focal epilepsy — track episodes,
          identify triggers, map affected brain regions, and correlate symptoms with your menstrual cycle.</p>
        <div class="landing-cta">
          <button class="btn btn-primary" onClick=${onDemo}>Try Demo</button>
          <button class="btn btn-ghost" onClick=${onLogin}>Log In</button>
          <button class="btn btn-outline" onClick=${onSignup}>Sign Up</button>
        </div>
        <p class="muted" style=${{ fontSize: '0.78rem', marginTop: '4px' }}>
          The demo loads fictional example data — no account needed.
        </p>
      </div>

      <div class="feature-grid">
        ${FEATURES.map((f) => html`
          <div class="feature" key=${f.h}>
            <div class="ico">${f.ico}</div>
            <h3>${f.h}</h3>
            <p>${f.p}</p>
          </div>`)}
      </div>

      <div class="card">
        <div class="card-title">Who it's for</div>
        <p class="muted" style=${{ fontSize: '0.9rem' }}>
          Anyone living with focal (partial) epilepsy who wants to document their episodes carefully — to spot
          patterns, prepare for neurology appointments, and understand their own condition. Your data is private
          to your account and never shared.
        </p>
      </div>

      <div class="disclaimer">
        <strong>Disclaimer:</strong> Epilepsy Log is a personal research and documentation tool only. It is
        <strong>not</strong> a medical device, does not provide a diagnosis, and does not replace professional
        medical advice, diagnosis, or treatment. Always consult a qualified neurologist or healthcare provider
        about your symptoms and care. In an emergency, call your local emergency number.
      </div>
    </div>`;
}
