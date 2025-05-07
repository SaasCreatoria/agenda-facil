
import type { Identifiable } from '@/types';

// Helper to generate unique IDs
export function generateId(): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  // Fallback for environments where crypto.randomUUID is not available (e.g., older browsers, Node.js without crypto import)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function safeJSONParse<T>(jsonString: string | null): T | null {
  if (!jsonString) return null;
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Failed to parse JSON from localStorage:", error);
    return null;
  }
}

export function getAll<T extends Identifiable>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  const itemsJson = localStorage.getItem(key);
  return itemsJson ? safeJSONParse<T[]>(itemsJson) || [] : [];
}

export function getById<T extends Identifiable>(key: string, id: string): T | undefined {
  if (typeof window === 'undefined') return undefined;
  const items = getAll<T>(key);
  return items.find(item => item.id === id);
}

export function create<TData, TStored extends TData & Identifiable>(
  key: string,
  data: TData,
  generateNewId: boolean = true
): TStored {
  if (typeof window === 'undefined') {
    // This case should ideally not happen if create is called client-side.
    // Returning a mock or throwing an error might be options.
    // For now, let's assume it's used client-side.
    const mockId = generateId();
    console.warn("LocalStorage 'create' called in non-browser environment. Returning mock data.");
    return { ...data, id: mockId } as TStored;
  }
  
  const items = getAll<TStored>(key);
  const newItemId = (data as any).id && !generateNewId ? (data as any).id : generateId();
  
  const newItem = { ...data, id: newItemId } as TStored;

  if (items.some(item => item.id === newItem.id && generateNewId)) { // Only check for collision if we generated a new ID or if an ID was passed and we are not supposed to overwrite
     console.warn(`ID collision for key ${key} and id ${newItem.id}. Generating a new one.`);
     newItem.id = generateId(); // Regenerate ID if collision and it was auto-generated
  } else if (items.some(item => item.id === newItem.id && !generateNewId && !(data as any).id)) {
    // If an ID was passed in `data` and generateNewId is false, check for collision
    throw new Error(`Item with ID ${newItem.id} already exists in ${key}.`);
  }


  items.push(newItem);
  localStorage.setItem(key, JSON.stringify(items));
  return newItem;
}

export function update<T extends Identifiable>(
  key: string,
  id: string,
  updates: Partial<Omit<T, 'id'>>
): T | undefined {
  if (typeof window === 'undefined') return undefined;
  const items = getAll<T>(key);
  const itemIndex = items.findIndex(item => item.id === id);

  if (itemIndex === -1) {
    return undefined;
  }

  const updatedItem = { ...items[itemIndex], ...updates, id }; // Ensure ID is not overwritten by updates
  items[itemIndex] = updatedItem;
  localStorage.setItem(key, JSON.stringify(items));
  return updatedItem;
}

export function remove(key: string, id: string): boolean {
  if (typeof window === 'undefined') return false;
  let items = getAll<Identifiable>(key);
  const initialLength = items.length;
  items = items.filter(item => item.id !== id);

  if (items.length < initialLength) {
    localStorage.setItem(key, JSON.stringify(items));
    return true;
  }
  return false;
}
