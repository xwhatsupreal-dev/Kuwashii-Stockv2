import { supabase } from './supabase';
import { StockItem } from './types';

export async function fetchItems() {
  const { data, error } = await supabase.from('items').select('*');
  if (error) {
    console.error('Error fetching items:', error);
    return [];
  }
  return data.map((d: any) => {
    let pool = d.gacha_pool;
    let initialQty = d.initial_quantity;
    let pieces = d.pieces_per_unit;
    let accCreds = undefined;
    let pinned = d.is_pinned || false;

    if (d.gacha_pool && !Array.isArray(d.gacha_pool) && typeof d.gacha_pool === 'object') {
      pool = d.gacha_pool.pool || undefined;
      accCreds = d.gacha_pool.accountCredentials || undefined;
      if (initialQty === undefined) initialQty = d.gacha_pool.initialQuantity;
      if (pieces === undefined) pieces = d.gacha_pool.piecesPerUnit;
      if (d.gacha_pool.isPinned) pinned = d.gacha_pool.isPinned;
    }

    let imgUrls: string[] = [];
    if (d.image) {
      if (d.image.startsWith('[')) {
        try { imgUrls = JSON.parse(d.image); } catch(e) { imgUrls = [d.image]; }
      } else {
        imgUrls = d.image.split(',').map((s: string) => s.trim()).filter((s: string) => s);
      }
    }

    return {
      ...d,
      imageUrl: imgUrls.length > 0 ? imgUrls[0] : undefined,
      imageUrls: imgUrls.length > 0 ? imgUrls : undefined,
      gachaPool: pool,
      accountCredentials: accCreds,
      initialQuantity: initialQty,
      piecesPerUnit: pieces,
      isPopular: d.popular || d.isPopular || false,
      isPinned: pinned,
      updatedAt: d.created_at
    };
  }) as StockItem[];
}

export async function fetchUser(username: string) {
  const { data, error } = await supabase.from('profiles').select('*').eq('username', username).single();
  if (error) {
    console.error('Error fetching user:', username, error);
    return null;
  }
  return data;
}

export async function createUser(username: string, passwordHash: string) {
  const { data, error } = await supabase.from('profiles').insert([
    { username, password: passwordHash, balance: 0, balance_rov: 0, is_admin: false }
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
    itemId: d.item_id,
    itemName: d.item_name,
    price: parseFloat(d.price),
    quantity: d.quantity,
    date: d.created_at,
    gachaDrops: d.gacha_drops,
    credentialData: d.credential_data,
    game: d.game
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
