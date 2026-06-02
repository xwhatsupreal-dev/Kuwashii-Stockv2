import { supabase } from './supabase';
import { StockItem } from './types';

export async function fetchItems() {
  const { data, error } = await supabase.from('items').select('*');
  if (error) {
    console.error('Error fetching items:', error);
    return [];
  }
  return data.map((d: any) => ({
    ...d,
    imageUrl: d.image,
    gachaPool: d.gacha_pool,
    updatedAt: d.created_at
  })) as StockItem[];
}

export async function fetchUser(username: string) {
  const { data, error } = await supabase.from('profiles').select('*').eq('username', username).single();
  if (error) return null;
  return data;
}

export async function createUser(username: string, passwordHash: string) {
  const { data, error } = await supabase.from('profiles').insert([
    { username, password: passwordHash, balance: 0, is_admin: false }
  ]).select().single();
  if (error) throw error;
  return data;
}

export async function fetchLiveActivities() {
  const { data, error } = await supabase.from('activities').select('*').order('timestamp', { ascending: false }).limit(50);
  if (error) return [];
  return data.map((d: any) => ({
    id: d.id,
    type: d.type,
    username: d.username,
    itemName: d.item_name,
    quantity: d.quantity,
    price: d.price,
    remainingStock: d.remaining_stock,
    game: d.game,
    gachaDrops: d.gacha_drops,
    timestamp: d.timestamp
  }));
}

export async function fetchUserPurchases(username: string) {
  const { data, error } = await supabase.from('purchases').select('*').eq('username', username).order('created_at', { ascending: false });
  if (error) return [];
  return data.map((d: any) => ({
    id: d.id,
    itemName: d.item_name,
    price: parseFloat(d.price),
    quantity: d.quantity,
    date: d.created_at,
    gachaDrops: d.gacha_drops
  }));
}

export async function fetchUserTopups(username: string) {
  const { data, error } = await supabase.from('topups').select('*').eq('username', username).order('created_at', { ascending: false });
  if (error) return [];
  return data.map((d: any) => ({
    id: d.id,
    amount: parseFloat(d.amount),
    method: d.method,
    date: d.created_at,
    game: d.game
  }));
}

export async function getSystemConfig() {
  const { data, error } = await supabase.from('system_config').select('*').eq('id', 'main').single();
  if (error) return null;
  return data;
}
