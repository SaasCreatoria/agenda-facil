import type { Identifiable } from '@/types';

// Helper to generate unique IDs
export function generateId(): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  // Fallback for environments where crypto.randomUUID is not available
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
  /**
   * If true (default), a new ID will always be generated, ignoring any 'id' field in `data`.
   * If false, and `data` contains an 'id' field, that 'id' will be used.
   * An error will be thrown if `forceGenerateNewId` is false, `data.id` is provided, and an item with that ID already exists.
   */
  forceGenerateNewId: boolean = true
): TStored {
  if (typeof window === 'undefined') {
    const mockId = generateId();
    console.warn("LocalStorage 'create' called in non-browser environment. Returning mock data.");
    return { ...data, id: mockId } as TStored;
  }
  
  const items = getAll<TStored>(key);
  let newId: string;

  if (!forceGenerateNewId && (data as Partial<Identifiable>).id) {
    newId = (data as Partial<Identifiable>).id as string;
    if (items.some(item => item.id === newId)) {
      throw new Error(`Item with ID ${newId} already exists in ${key}. Cannot create with pre-existing ID when forceGenerateNewId is false.`);
    }
  } else {
    newId = generateId();
    // Extremely unlikely with UUIDs, but handle for robustness or non-UUID generateId fallbacks
    while (items.some(item => item.id === newId)) {
      console.warn(`ID collision for key ${key} with auto-generated id ${newId}. Regenerating.`);
      newId = generateId();
    }
  }
  
  const newItem = { ...data, id: newId } as TStored;
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