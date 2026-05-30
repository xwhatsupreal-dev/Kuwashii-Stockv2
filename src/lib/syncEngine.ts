import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';


export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

const SYNC_KEYS = [
  'KUWASHII_V2_USERS',
  'KUWASHII_USERS',
  'KUWASHII_GLOBAL_REVENUE',
  'KUWASHII_GLOBAL_FREE_CREDITS',
  'KUWASHII_COUPONS',
  'KUWASHII_ANNOUNCEMENT_SETTINGS',
  'AOTR_STOCK_ITEMS'
];

let isInitialized = false;

// Store exact reference to the original methods
const originalSetItem = window.localStorage.setItem;

export async function initSyncEngine() {
  if (!supabase) return;
  if (isInitialized) return;

  try {
    const { data, error } = await supabase.from('kv_store').select('*');
    if (!error && data) {
      for (const row of data) {
        if (SYNC_KEYS.includes(row.key)) {
          const stringValue = typeof row.value === 'object' ? JSON.stringify(row.value) : row.value;
          originalSetItem.call(window.localStorage, row.key, stringValue);
        }
      }
      window.dispatchEvent(new Event('sync-update'));
    } else if (error) {
       console.warn("Supabase kv_store sync error (Table might not exist):", error.message);
    }
    
    // Subscribe to real-time changes if someone else modifies the db
    supabase
      .channel('app-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'kv_store' }, payload => {
         const { key, value } = payload.new as any || {};
         if (key && SYNC_KEYS.includes(key)) {
            const strValue = typeof value === 'object' ? JSON.stringify(value) : value;
            originalSetItem.call(window.localStorage, key, strValue);
            window.dispatchEvent(new Event('sync-update'));
         }
      })
      .subscribe();
      
  } catch (err) {
    console.error("Init sync engine failed:", err);
  } finally {
    isInitialized = true;
  }
}

// Intercept localStorage.setItem globally
window.localStorage.setItem = function(key: string, value: string) {
  originalSetItem.call(this, key, value);
  
  if (supabase && SYNC_KEYS.includes(key)) {
    let parsedValue: any = value;
    try {
      parsedValue = JSON.parse(value);
    } catch (e) {
      // Keep as string
    }
    
    supabase.from('kv_store').upsert({ key, value: parsedValue }).then(({error}) => {
       if (error) {
          console.error(`Failed to sync ${key} to Supabase:`, error.message);
       }
    });
  }
};
