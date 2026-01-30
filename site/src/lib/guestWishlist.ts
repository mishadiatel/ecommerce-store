const KEY = 'guest_wishlist';

export const guestWishlist = {
  get(): string[] {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem(KEY) || '[]');
    } catch {
      return [];
    }
  },

  set(ids: string[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(KEY, JSON.stringify(ids));
  },

  add(id: string) {
    const ids = this.get();
    if (!ids.includes(id)) {
      this.set([...ids, id]);
    }
  },

  remove(id: string) {
    this.set(this.get().filter(x => x !== id));
  },

  clear() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(KEY);
  },
};