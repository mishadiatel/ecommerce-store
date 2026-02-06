const STORAGE_KEY = 'guest_cart_id';

function generateId() {
  // ✅ modern browsers
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  // ✅ fallback (100% працює всюди)
  return 'xxxxxxxxyxxxxxyxxxyxxxyxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const guestCart = {
  get(): string {
    if (typeof window === 'undefined') return '';

    let id = localStorage.getItem(STORAGE_KEY);

    if (!id) {
      id = generateId();
      localStorage.setItem(STORAGE_KEY, id);
    }

    return id;
  },

  set(id: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, id);
  },

  clear() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  },
};