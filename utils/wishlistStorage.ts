import type { WishlistItem } from './wishlist'

// Sauvegarder la wishlist
export function sauvegarderWishlist(wishlist: WishlistItem[]): void {
  localStorage.setItem('wishlist', JSON.stringify(wishlist))
}

// Lire la wishlist
export function chargerWishlist(): WishlistItem[] {
  const sauvegarde = localStorage.getItem('wishlist')

  if (!sauvegarde) {
    return []
  }

  try {
    return JSON.parse(sauvegarde) as WishlistItem[]
  } catch {
    return []
  }
}
