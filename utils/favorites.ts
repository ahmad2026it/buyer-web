export type FavorCard = {
  id: string;
  image: string;
  title: string;
  price: number;
  badge: string;
  rating: string;
  reviews: string;
  category: string;
  sellerAvatar: string;
  seller: string;
};

const KEY = 'whoCan_favorites';

export function getFavorites(): FavorCard[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export function isFavorited(id: string): boolean {
  return getFavorites().some(f => f.id === id);
}

export function addFavorite(favor: FavorCard): void {
  const list = getFavorites();
  if (!list.some(f => f.id === favor.id)) {
    localStorage.setItem(KEY, JSON.stringify([...list, favor]));
    window.dispatchEvent(new Event('whoCan_favoritesChanged'));
  }
}

export function removeFavorite(id: string): void {
  const list = getFavorites().filter(f => f.id !== id);
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event('whoCan_favoritesChanged'));
}

export function toggleFavorite(favor: FavorCard): boolean {
  if (isFavorited(favor.id)) {
    removeFavorite(favor.id);
    return false;
  } else {
    addFavorite(favor);
    return true;
  }
}
