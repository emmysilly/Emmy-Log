// Supabase client + auth + per-user data access.
// Every data call is scoped to the signed-in user and enforced by RLS on the
// server — a user can only ever read/write their own rows.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

export const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ---------------- auth ----------------
export async function getSession() {
  const { data } = await sb.auth.getSession();
  return data.session || null;
}
export function onAuthChange(cb) {
  const { data } = sb.auth.onAuthStateChange((_event, session) => cb(session));
  return () => data.subscription.unsubscribe();
}
export function signUp(email, password, displayName) {
  return sb.auth.signUp({ email, password, options: { data: { display_name: displayName || null } } });
}
export function signIn(email, password) {
  return sb.auth.signInWithPassword({ email, password });
}
export function signOut() {
  return sb.auth.signOut();
}

// ---------------- profile ----------------
export async function getProfile(userId) {
  const { data, error } = await sb.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) { console.error('getProfile', error); return null; }
  return data;
}
export async function updateProfile(userId, patch) {
  const { error } = await sb.from('profiles').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', userId);
  if (error) console.error('updateProfile', error);
  return !error;
}

// ---------------- episodes ----------------
export async function listEpisodes(userId) {
  const { data, error } = await sb.from('episodes').select('*').eq('user_id', userId)
    .order('date', { ascending: false }).order('created_at', { ascending: false });
  if (error) { console.error('listEpisodes', error); return []; }
  return data || [];
}
export async function addEpisode(userId, ep) {
  const { data, error } = await sb.from('episodes').insert({ ...ep, user_id: userId }).select().single();
  if (error) { console.error('addEpisode', error); return null; }
  return data;
}
export async function deleteEpisode(userId, id) {
  const { error } = await sb.from('episodes').delete().eq('id', id).eq('user_id', userId);
  if (error) console.error('deleteEpisode', error);
  return !error;
}

// ---------------- cycle logs ----------------
export async function listCycleLogs(userId) {
  const { data, error } = await sb.from('cycle_logs').select('*').eq('user_id', userId)
    .order('start_date', { ascending: false });
  if (error) { console.error('listCycleLogs', error); return []; }
  return data || [];
}
export async function logPeriod(userId, startDate, flow, symptoms) {
  const { error } = await sb.from('cycle_logs').insert({ user_id: userId, start_date: startDate, flow, symptoms: symptoms || null });
  if (error) { console.error('logPeriod', error); return false; }
  await sb.from('profiles').update({ last_period_date: startDate, updated_at: new Date().toISOString() }).eq('id', userId);
  return true;
}

// ---------------- risk assessments ----------------
export async function saveRisk(userId, payload) {
  const { error } = await sb.from('risk_assessments').insert({ ...payload, user_id: userId });
  if (error) console.error('saveRisk', error);
  return !error;
}
export async function listRisk(userId) {
  const { data, error } = await sb.from('risk_assessments').select('*').eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) { console.error('listRisk', error); return []; }
  return data || [];
}

// ---------------- personalized content doc ----------------
export async function getAppContent(userId) {
  const { data, error } = await sb.from('app_content').select('doc').eq('user_id', userId).maybeSingle();
  if (error) { console.error('getAppContent', error); return {}; }
  return (data && data.doc) || {};
}

// ---------------- notes ----------------
export async function listNotes(userId) {
  const { data, error } = await sb.from('notes').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) { console.error('listNotes', error); return []; }
  return data || [];
}
export async function addNote(userId, title, body) {
  const { data, error } = await sb.from('notes').insert({ user_id: userId, title, body }).select().single();
  if (error) { console.error('addNote', error); return null; }
  return data;
}
export async function deleteNote(userId, id) {
  const { error } = await sb.from('notes').delete().eq('id', id).eq('user_id', userId);
  if (error) console.error('deleteNote', error);
  return !error;
}
