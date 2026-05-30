import { StockItem } from './types';

// Connection tester
export async function testFirestoreConnection() {
  try {
    const res = await fetch('/api/health');
    console.log('Backend server connection tested successfully:', res.status);
  } catch (error) {
    console.warn('Backend server / JSON DB connection test error:', error);
  }
}

/**
 * Fetch all items from Backend database (free server JSON persistence).
 */
export async function getServerItems(defaultPresets: StockItem[]): Promise<StockItem[]> {
  try {
    const response = await fetch('/api/items');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data as StockItem[];
  } catch (error) {
    console.error('Error in getServerItems API call:', error);
    throw error;
  }
}

/**
 * Save (create or update) a StockItem document in local JSON db via Express server
 */
export async function saveServerItem(item: StockItem): Promise<void> {
  try {
    const response = await fetch('/api/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(item)
    });
    if (!response.ok) {
      throw new Error(`Failed to save item! Status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error in saveServerItem API call:', error);
    throw error;
  }
}

/**
 * Delete a StockItem document from local JSON db via Express server
 */
export async function deleteServerItem(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/items/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error(`Failed to delete item! Status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error in deleteServerItem API call:', error);
    throw error;
  }
}

/**
 * Bulk overwrite / reset database items (restore presets)
 */
export async function resetServerDatabase(itemsList: StockItem[]): Promise<void> {
  try {
    const response = await fetch('/api/items/reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(itemsList)
    });
    if (!response.ok) {
      throw new Error(`Failed to reset database! Status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error in resetServerDatabase API call:', error);
    throw error;
  }
}
