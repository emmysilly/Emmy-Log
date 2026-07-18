// ============================================================
// DEMO DATA — 100% fictional. Not a real person, not real medical data.
// Persona: "Jordan Rivera", mesial temporal lobe epilepsy. Deliberately
// unlike any real user's history. Used only for the logged-out demo.
// ============================================================
export const DEMO_PROFILE = {
  display_name: 'Jordan Rivera (Demo)',
  cycle_length: 28,
  last_period_date: null, // set relative to today at load time
};

// Episode shape matches the DB (date is ISO). All invented.
export const DEMO_EPISODES = [
  { id: 'demo-1', date: '2025-01-14', time: '09:20', env: 'Open-plan office, mid-morning meeting',
    symptoms: 'Rising warm sensation in stomach, then sudden intense déjà vu. Lost the thread of conversation for ~40s.',
    severity: 'moderate', cycleday: '26', cycle_phase: 'C1', emt: false, first_episode: true,
    notes: 'First one anyone noticed. Coworker said I stared and did not respond briefly.' },
  { id: 'demo-2', date: '2025-02-10', time: '22:05', env: 'Home, after two glasses of wine and a late night',
    symptoms: 'Epigastric rising sensation, lip-smacking, fumbled with keys. ~1 min. Confused for several minutes after.',
    severity: 'severe', cycleday: '25', cycle_phase: 'C1', emt: false, first_episode: false,
    notes: 'Alcohol + short sleep. Post-ictal fog lasted ~20 min.' },
  { id: 'demo-3', date: '2025-03-18', time: '16:40', env: 'Airport terminal, delayed flight, sleep-deprived',
    symptoms: 'Déjà vu, then brief unawareness with repetitive hand rubbing. Partner guided me to a seat.',
    severity: 'moderate', cycleday: '2', cycle_phase: 'MENS', emt: false, first_episode: false,
    notes: 'Under-slept from red-eye. No aura warning this time.' },
  { id: 'demo-4', date: '2025-04-27', time: '11:15', env: 'Crowded wedding reception',
    symptoms: 'Strong epigastric aura gave enough warning to sit. Oral automatisms, unresponsive ~50s.',
    severity: 'moderate', cycleday: '24', cycle_phase: 'C1', emt: false, first_episode: false,
    notes: 'Aura let me get to a chair before it peaked.' },
  { id: 'demo-5', date: '2025-05-30', time: '07:30', env: 'Gym, high-intensity class after poor sleep',
    symptoms: 'Déjà vu + nausea, then absence-like pause. Trainer noticed I stopped mid-set.',
    severity: 'mild', cycleday: '27', cycle_phase: 'C1', emt: false, first_episode: false,
    notes: 'Shorter and milder than the others.' },
  { id: 'demo-6', date: '2025-06-22', time: '14:50', env: 'Driver-less confusion at home, high stress week',
    symptoms: 'Aura, automatisms, then a secondary progression with brief arm stiffening. Roommate called for help.',
    severity: 'severe', cycleday: '26', cycle_phase: 'C1', emt: true, first_episode: false,
    notes: 'EMTs assessed on scene. First time it progressed beyond focal awareness.' },
];

export const DEMO_CONTENT = {
  commonSymptoms: [
    'Déjà vu', 'Rising stomach sensation', 'Lip-smacking / chewing', 'Hand rubbing / fidgeting',
    'Brief unawareness', 'Post-ictal confusion', 'Nausea', 'Fear / anxiety aura',
    'Staring spell', 'Repetitive speech', 'Metallic taste', 'Arm stiffening',
  ],
  brainRegions: [
    { id: 'hippocampus', name: 'Left Hippocampus', role: '⚡ Seizure Origin Zone', color: '#c084fc',
      desc: 'The origin in this demo profile. The hippocampus drives memory encoding — irritation here produces the hallmark déjà vu and the sense of intense familiarity at the start of each episode.',
      symptoms: 'Example symptoms: Déjà vu · Memory distortion · Familiarity aura' },
    { id: 'amygdala', name: 'Amygdala', role: 'First Spread → Emotion', color: '#f472b6',
      desc: 'Sitting just ahead of the hippocampus, the amygdala governs fear and emotional salience. Spread here produces the sudden unprovoked fear or rising anxiety that sometimes accompanies the aura.',
      symptoms: 'Example symptoms: Sudden fear · Anxiety surge' },
    { id: 'insula', name: 'Insular Cortex', role: 'Visceral Sensation', color: '#fbbf24',
      desc: 'The insula processes internal body state. Involvement here explains the rising epigastric (stomach) sensation and nausea that so often opens an episode.',
      symptoms: 'Example symptoms: Rising stomach sensation · Nausea' },
    { id: 'temporal-neocortex', name: 'Temporal Neocortex', role: 'Automatisms', color: '#818cf8',
      desc: 'Lateral temporal spread disrupts awareness and releases automatic movements — the lip-smacking, chewing, and hand-rubbing seen during the unaware phase.',
      symptoms: 'Example symptoms: Lip-smacking · Hand rubbing · Unawareness' },
  ],
  spreadSteps: [], // omitted in demo for brevity; brain map still renders regions
  envRisks: [
    { icon: '🌙', name: 'Sleep Deprivation', accentColor: '#818cf8',
      episodes: '3 example episodes tied to short sleep',
      duringSymptoms: ['Aura arrives with little warning', 'Faster progression to unawareness', 'Longer post-ictal confusion'],
      afterSymptoms: ['Extended grogginess', 'Headache the next morning'],
      worstCase: 'Example: the airport episode followed a red-eye flight with under 4 hours of sleep.',
      tip: 'Protect a consistent sleep schedule. Sleep loss is this profile’s single strongest trigger.' },
    { icon: '🍷', name: 'Alcohol', accentColor: '#ff4a4a',
      episodes: '1 example episode after drinking',
      duringSymptoms: ['Stronger automatisms', 'Reduced aura warning'],
      afterSymptoms: ['Prolonged confusion'],
      worstCase: '🚨 Example: two drinks plus a late night preceded the most severe episode.',
      tip: 'Alcohol lowers the seizure threshold and disrupts sleep — a double hit. Limit or avoid.' },
    { icon: '😖', name: 'High Stress Week', accentColor: '#fb923c',
      episodes: '1 example episode during a stressful period',
      duringSymptoms: ['Secondary progression risk rises', 'Arm stiffening in the worst case'],
      afterSymptoms: ['Fatigue', 'Emotional flatness'],
      worstCase: 'Example: the only episode to progress beyond focal awareness happened during a high-stress week.',
      tip: 'Build in recovery and stress-reduction routines during demanding stretches.' },
    { icon: '🏋️', name: 'Overexertion + Poor Sleep', accentColor: '#2dd4bf',
      episodes: '1 example episode at the gym',
      duringSymptoms: ['Nausea-led aura', 'Brief absence-like pause'],
      afterSymptoms: ['Clears relatively quickly'],
      worstCase: 'Example: a high-intensity class after poor sleep triggered a milder episode.',
      tip: 'Avoid maximal exertion when under-slept.' },
  ],
  cycleWindows: {
    'Menstruation': { desc: 'Example: hormones are low. In this demo profile most episodes cluster just before the period rather than during it.', advice: 'Lower-risk window in this profile. Keep sleep consistent.' },
    'Follicular Phase': { desc: 'Example: estrogen rising, generally a calmer window for this profile.', advice: 'Moderate caution; maintain routine.' },
    'Ovulation': { desc: 'Example: estrogen peaks. Watch for reduced sleep quality around this time.', advice: 'Moderate caution.' },
    'Luteal Phase': { desc: 'Example: progesterone elevated early, then declining toward the pre-period window.', advice: 'Caution rises as the period approaches.' },
    'Late Luteal Phase': { desc: 'Example: the highest-risk window in this demo profile — most episodes fall in the days just before menstruation (a C1 catamenial pattern).', advice: 'Maximum caution. Prioritize sleep and avoid alcohol.' },
  },
  riskDescriptions: {
    'low': { description: 'Example: few threshold-lowering factors are present. A generally protected window for this profile.',
      tipList: ['Stay hydrated', 'Keep a consistent sleep schedule', 'Note any early aura'] },
    'moderate': { description: 'Example: one or two factors are stacking. In this profile that can bring on an aura with mild automatisms.',
      tipList: ['Prioritize sleep tonight', 'Skip alcohol', 'Tell someone nearby what to watch for'] },
    'high': { description: 'Example: several factors are stacking. This profile can progress to unawareness with automatisms.',
      tipList: ['Reschedule demanding plans if possible', 'No alcohol', 'Do not drive', 'Have a companion aware'] },
    'very-high': { description: 'Example: this closely matches the profile’s most severe episode, which progressed beyond focal awareness.',
      tipList: ['Avoid high-risk settings today', 'Ensure someone is with you', 'Follow your seizure action plan', 'Contact your neurologist if episodes are increasing'] },
  },
  protectiveMeasures: [
    { icon: '😴', title: 'Sleep Consistency', subtitle: 'Strongest lever for this profile', color: '#818cf8',
      evidenceLabel: 'Strong Evidence', evidenceLevel: 'ev-strong',
      body: 'Consistent sleep timing is the most reliable protective factor across focal epilepsies.',
      relevance: 'Example relevance: in this demo profile, most severe episodes followed short or irregular sleep.',
      relevanceColor: '#818cf822', relevanceBorder: '#818cf844',
      dosage: '7–9 hours · consistent bed/wake times',
      studies: [{ num: '1', title: 'Sleep and seizure risk (illustrative citation)', journal: 'Example Journal · 2023', finding: 'Consistent sleep timing associated with fewer seizures.', url: 'https://pubmed.ncbi.nlm.nih.gov/' }] },
    { icon: '🚫', title: 'Alcohol Avoidance', subtitle: 'Removes a common trigger', color: '#ff4a4a',
      evidenceLabel: 'Moderate Evidence', evidenceLevel: 'ev-moderate',
      body: 'Alcohol lowers the seizure threshold and fragments sleep.',
      relevance: 'Example relevance: an alcohol + late-night combination preceded a severe episode in this profile.',
      relevanceColor: '#ff4a4a22', relevanceBorder: '#ff4a4a44',
      dosage: 'Limit or avoid, especially before demanding days',
      studies: [{ num: '1', title: 'Alcohol and seizure threshold (illustrative citation)', journal: 'Example Journal · 2022', finding: 'Alcohol use linked to increased seizure frequency.', url: 'https://pubmed.ncbi.nlm.nih.gov/' }] },
  ],
  researchArticles: [
    { category: 'Temporal Lobe Epilepsy', title: 'Mesial temporal lobe epilepsy (illustrative overview)', journal: 'Example Journal · 2021',
      finding: 'Overview of hippocampal-onset seizures, déjà vu auras, and automatisms.', relevance: 'Example: matches this demo profile’s semiology.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/' },
    { category: 'Catamenial Epilepsy', title: 'Catamenial seizure patterns (illustrative overview)', journal: 'Example Journal · 2020',
      finding: 'Perimenstrual (C1) exacerbation is the most common catamenial pattern.', relevance: 'Example: this demo profile shows a C1 clustering.',
      url: 'https://pubmed.ncbi.nlm.nih.gov/' },
  ],
};

// Build the full demo state object the app consumes when in demo mode.
export function buildDemoState() {
  const today = new Date();
  const lastPeriod = new Date(today);
  lastPeriod.setDate(today.getDate() - 25); // places "today" in the late-luteal high-risk window
  const iso = lastPeriod.toISOString().slice(0, 10);
  return {
    isDemo: true,
    profile: { ...DEMO_PROFILE, last_period_date: iso },
    episodes: DEMO_EPISODES,
    content: DEMO_CONTENT,
    lastPeriodDate: iso,
    cycleLength: DEMO_PROFILE.cycle_length,
  };
}
