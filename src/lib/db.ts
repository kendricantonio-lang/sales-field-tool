import { supabase } from './supabaseClient';

export type FieldValues = Record<string, string>;

export interface ContactRecord {
  id: string;
  data: FieldValues;
  created_at: string;
  updated_at: string;
}

export interface StoreRecord {
  id: string;
  data: FieldValues;
  created_at: string;
  updated_at: string;
}

export interface VisitRecord {
  id: string;
  raw_note: string;
  data: FieldValues;
  created_at: string;
  updated_at: string;
}

export async function listContacts(): Promise<ContactRecord[]> {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as ContactRecord[];
}

export async function createContact(values: FieldValues): Promise<ContactRecord> {
  const { data: userData } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('contacts')
    .insert({ data: values, user_id: userData.user?.id })
    .select()
    .single();
  if (error) throw error;
  return data as ContactRecord;
}

export async function updateContact(id: string, values: FieldValues): Promise<ContactRecord> {
  const { data, error } = await supabase
    .from('contacts')
    .update({ data: values, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as ContactRecord;
}

export async function deleteContact(id: string): Promise<void> {
  const { error } = await supabase.from('contacts').delete().eq('id', id);
  if (error) throw error;
}

export async function listStores(): Promise<StoreRecord[]> {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as StoreRecord[];
}

export async function createStore(values: FieldValues): Promise<StoreRecord> {
  const { data: userData } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('stores')
    .insert({ data: values, user_id: userData.user?.id })
    .select()
    .single();
  if (error) throw error;
  return data as StoreRecord;
}

export async function updateStore(id: string, values: FieldValues): Promise<StoreRecord> {
  const { data, error } = await supabase
    .from('stores')
    .update({ data: values, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as StoreRecord;
}

export async function listVisits(): Promise<VisitRecord[]> {
  const { data, error } = await supabase
    .from('visits')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as VisitRecord[];
}

export async function createVisit(rawNote: string, values: FieldValues): Promise<VisitRecord> {
  const { data: userData } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('visits')
    .insert({ raw_note: rawNote, data: values, user_id: userData.user?.id })
    .select()
    .single();
  if (error) throw error;
  return data as VisitRecord;
}

export async function updateVisit(id: string, rawNote: string, values: FieldValues): Promise<VisitRecord> {
  const { data, error } = await supabase
    .from('visits')
    .update({ raw_note: rawNote, data: values, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as VisitRecord;
}

export async function deleteVisit(id: string): Promise<void> {
  const { error } = await supabase.from('visits').delete().eq('id', id);
  if (error) throw error;
}

export interface EventRecord {
  id: string;
  data: FieldValues;
  created_at: string;
  updated_at: string;
}

export async function listEvents(): Promise<EventRecord[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as EventRecord[];
}

export async function createEvent(values: FieldValues): Promise<EventRecord> {
  const { data: userData } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('events')
    .insert({ data: values, user_id: userData.user?.id })
    .select()
    .single();
  if (error) throw error;
  return data as EventRecord;
}

export async function updateEvent(id: string, values: FieldValues): Promise<EventRecord> {
  const { data, error } = await supabase
    .from('events')
    .update({ data: values, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as EventRecord;
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw error;
}

export interface BoardNoteRecord {
  id: string;
  data: FieldValues;
  created_at: string;
  updated_at: string;
}

export async function listBoardNotes(): Promise<BoardNoteRecord[]> {
  const { data, error } = await supabase
    .from('board_notes')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data as BoardNoteRecord[];
}

export async function createBoardNote(values: FieldValues): Promise<BoardNoteRecord> {
  const { data: userData } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('board_notes')
    .insert({ data: values, user_id: userData.user?.id })
    .select()
    .single();
  if (error) throw error;
  return data as BoardNoteRecord;
}

export async function updateBoardNote(id: string, values: FieldValues): Promise<BoardNoteRecord> {
  const { data, error } = await supabase
    .from('board_notes')
    .update({ data: values, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as BoardNoteRecord;
}

export async function deleteBoardNote(id: string): Promise<void> {
  const { error } = await supabase.from('board_notes').delete().eq('id', id);
  if (error) throw error;
}
