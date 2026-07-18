import { createRoot, html } from './ui.js';
import { App } from './app.js';

createRoot(document.getElementById('root')).render(html`<${App} />`);
